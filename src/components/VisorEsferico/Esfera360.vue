<template lang="pug">
.esfera-360(ref="contenedor")
  .marcadores-dom(v-if="tieneMarcadoresDom")
    MarcadorVue(
      v-for="marcador in marcadoresDomVisibles"
      :key="marcador.id"
      :marcador="marcador"
      :posicion-pantalla="posicionesPantalla[marcador.id]"
      @seleccionar="manejarSeleccionMarcador(marcador, $event)"
      @hover="manejarHoverMarcador(marcador, $event)"
    )
  .overlay-transicion(
    v-if="opacidadTransicion > 0"
    :style="{ opacity: opacidadTransicion }"
  )
    img.transicion-img(
      v-if="tipoMedio === 'imagen'"
      :src="medio"
      alt="Transición"
    )
    video.transicion-video(
      v-else-if="tipoMedio === 'video'"
      :src="medio"
      autoplay
      muted
      loop
    )
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch, computed, type PropType } from 'vue';
import * as THREE from 'three';
import { cargarTexturaImagen, cargarTexturaVideo } from '@/utils/media-helpers';
import { crearMarcador3D, posicionACartesiano, esfericaATextura, posicionAEsferica } from '@/utils/three-helpers';
import { normalizarYaw, diferenciaAngular, animarValores, matarAnimaciones, EasingVisor } from '@/utils/animaciones';
import { configurarControlesTactiles } from './ControlesTactiles';
import MarcadorVue from './Marcador.vue';
import type { Marcador, TipoMedio, PosicionPantalla, CoordenadaEsferica, EstadoCamara, ConfiguracionVideo, ApiEsfera360 } from './tipos';

export default defineComponent({
  name: 'Esfera360',
  components: { MarcadorVue },
  props: {
    medio: { type: String, required: true },
    tipoMedio: { type: String as PropType<TipoMedio>, default: 'imagen' },
    marcadores: { type: Array as PropType<Marcador[]>, default: () => [] },
    colorFondo: { type: String, default: '#000000' },
    autoReproducir: { type: Boolean, default: true },
    controlesMouse: { type: Boolean, default: true },
    controlesTactiles: { type: Boolean, default: true },
    tecladoHabilitado: { type: Boolean, default: true },
    sensibilidadRotacion: { type: Number, default: 1 },
    sensibilidadZoom: { type: Number, default: 1 },
    posicionInicial: { type: Object as PropType<CoordenadaEsferica>, default: () => ({ yaw: 0, pitch: 0 }) },
    zoomInicial: { type: Number, default: 50 },
    configuracionVideo: { type: Object as PropType<ConfiguracionVideo>, default: () => ({}) },
    opacidadTransicion: { type: Number, default: 0 },
  },
  emits: ['marcador-seleccionado', 'marcador-hover', 'actualizar-posiciones', 'video-pausado', 'video-reanudado', 'estado-cambiado', 'estado-video'],
  setup(props, { emit, expose }) {
    const contenedor = ref<HTMLDivElement | null>(null);

    let escena: THREE.Scene | null = null;
    let camara: THREE.PerspectiveCamera | null = null;
    let renderizador: THREE.WebGLRenderer | null = null;
    let esfera: THREE.Mesh | null = null;
    let texturaActual: THREE.Texture | THREE.VideoTexture | null = null;
    let mallasMarcadores: Map<string, THREE.Mesh> = new Map();
    let raycaster: THREE.Raycaster | null = null;
    let puntero: THREE.Vector2 | null = null;
    let animacionId: number | null = null;
    let hammer: HammerManager | null = null;
    let overlayTransicion: HTMLDivElement | null = null;
    let elementoVideo: HTMLVideoElement | null = null;
    let manejadoresVideo: { play?: () => void; pause?: () => void } = {};

    // Objeto proxy para animaciones GSAP (no usar refs de Vue)
    const estadoAnimable = { yaw: props.posicionInicial.yaw, pitch: props.posicionInicial.pitch, zoom: props.zoomInicial };

    // ── Estado de interacción ──
    let estaArrastrando = false;
    let seMovio = false;
    let ultimaPosicionX = 0;
    let ultimaPosicionY = 0;
    let inicioX = 0;
    let inicioY = 0;
    const UMBRAL_MOVIMIENTO = 5;

    // ── Inercia ──
    let velocidadYaw = 0;
    let velocidadPitch = 0;
    let idAnimacionInercia: number | null = null;

    // ── Constantes del visor ──
    // FOV mínimo = zoom máximo (más cercano), FOV máximo = zoom mínimo (más lejano).
    // Estos valores fueron elegidos empíricamente para cubrir desde una vista amplia
    // (120°) hasta un zoom considerable (30°) sin perder sensación de panorama.
    const FOV_MIN = 30;
    const FOV_MAX = 120;

    // Límites de pitch ligeramente menores que ±90° para evitar el gimbal lock
    // (cuando la cámara mira exactamente al polo, el yaw pierde significado).
    const PITCH_MIN = -Math.PI / 2 + 0.01;
    const PITCH_MAX = Math.PI / 2 - 0.01;

    // Fricción de inercia: cada frame retiene el 92% de la velocidad anterior.
    // Un valor menor frena más rápido (más pegajoso); mayor dura más (más flotante).
    // 0.92 ofrece ~1.5 segundos de deslizamiento natural tras soltar.
    const FACTOR_FRICCION = 0.92;

    // Factor de conversión de rueda del mouse a unidades de zoom.
    // Ajustado para que una vuelta completa de rueda (~100 deltaY) ≈ 5 puntos de zoom.
    const ZOOM_WHEEL_FACTOR = 0.05;

    const posicionesPantalla = ref<Record<string, PosicionPantalla>>({});

    const marcadoresDomVisibles = computed(() =>
      props.marcadores.filter((m) => (m.tipo === 'dom' || !m.tipo) && m.visible !== false)
    );

    const tieneMarcadoresDom = computed(() => marcadoresDomVisibles.value.length > 0);

    const nivelZoomAFov = (nivel: number): number => {
      const t = Math.max(0, Math.min(100, nivel)) / 100;
      return FOV_MAX - t * (FOV_MAX - FOV_MIN);
    };

    const crearOverlayTransicion = () => {
      if (!contenedor.value) return;
      overlayTransicion = document.createElement('div');
      overlayTransicion.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: ${props.colorFondo}; opacity: 0; pointer-events: none;
        transition: opacity 0.3s ease; z-index: 10;
      `;
      contenedor.value.appendChild(overlayTransicion);
    };

    const inicializarEscena = () => {
      if (!contenedor.value) return;

      const ancho = contenedor.value.clientWidth;
      const alto = contenedor.value.clientHeight;

      escena = new THREE.Scene();
      escena.background = new THREE.Color(props.colorFondo);

      camara = new THREE.PerspectiveCamera(nivelZoomAFov(estadoAnimable.zoom), ancho / alto, 0.1, 2000);
      camara.position.set(0, 0, 0);

      renderizador = new THREE.WebGLRenderer({ antialias: true });
      renderizador.setSize(ancho, alto);
      renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      contenedor.value.appendChild(renderizador.domElement);

      raycaster = new THREE.Raycaster();
      puntero = new THREE.Vector2();

      crearOverlayTransicion();

      if (props.controlesMouse && renderizador) {
        const canvas = renderizador.domElement;
        canvas.addEventListener('mousedown', manejarMouseDown);
        canvas.addEventListener('mousemove', manejarMouseMove);
        canvas.addEventListener('mouseup', manejarMouseUp);
        canvas.addEventListener('mouseleave', manejarMouseUp);
        canvas.addEventListener('wheel', manejarScroll, { passive: false });
        canvas.addEventListener('dblclick', manejarDobleClick);
      }

      if (props.controlesTactiles && contenedor.value) {
        hammer = configurarControlesTactiles({
          contenedor: contenedor.value,
          alTap: (x, y) => manejarSeleccion(x, y),
          alDobleTap: () => resetearVista(true),
          alPan: (dx, dy) => {
            aplicarDeltaRotacion(dx, dy);
            const factores = obtenerFactoresRotacion();
            velocidadYaw = -dx * factores.h;
            velocidadPitch = dy * factores.v;
          },
          alPanEnd: (vx, vy) => {
            // Convertir velocidad Hammer (px/ms) a radianes/frame (~60fps)
            const factores = obtenerFactoresRotacion();
            velocidadYaw = -vx * 16.67 * factores.h;
            velocidadPitch = vy * 16.67 * factores.v;
            iniciarInercia();
          },
          alPinch: (escala) => {
            if (!camara) return;
            const delta = escala * props.sensibilidadZoom;
            // Pinch out (dedos separándose) → delta > 0 → zoom aumenta → FOV disminuye → acercar
            // Pinch in  (dedos juntándose)  → delta < 0 → zoom disminuye → FOV aumenta → alejar
            estadoAnimable.zoom = Math.max(0, Math.min(100, estadoAnimable.zoom + delta * 10));
            camara.fov = nivelZoomAFov(estadoAnimable.zoom);
            camara.updateProjectionMatrix();
            publicarEstado();
          },
          alPinchEnd: () => {},
        });
      }

      if (props.tecladoHabilitado) {
        window.addEventListener('keydown', manejarTeclado);
      }

      window.addEventListener('resize', manejarRedimensionamiento);

      actualizarDireccionCamara();
      animar();
    };

    const aplicarLimitesYPublicar = () => {
      estadoAnimable.pitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, estadoAnimable.pitch));
      estadoAnimable.yaw = normalizarYaw(estadoAnimable.yaw);
      publicarEstado();
    };

    const publicarEstado = () => {
      const estado: EstadoCamara = {
        yaw: estadoAnimable.yaw,
        pitch: estadoAnimable.pitch,
        zoom: estadoAnimable.zoom,
      };
      emit('estado-cambiado', estado);
    };

    const crearEsfera = async () => {
      if (!escena || !overlayTransicion) return;

      // Fundido a negro antes de cambiar de medio: evita el flash blanco
      // cuando la textura anterior se descarga antes de que la nueva esté lista.
      overlayTransicion.style.opacity = '1';
      await new Promise((r) => setTimeout(r, 150));

      limpiarMedioActual();

      try {
        texturaActual = await cargarNuevaTextura();
      } catch (error) {
        console.error('Error al cargar el medio:', error);
        overlayTransicion.style.opacity = '0';
        return;
      }

      construirMallaEsfera();

      // Fundido de entrada: da tiempo al GPU para que la textura esté lista
      // antes de mostrarla, evitando artefactos de renderizado parcial.
      requestAnimationFrame(() => {
        if (overlayTransicion) overlayTransicion.style.opacity = '0';
      });
    };

    const limpiarMedioActual = () => {
      if (esfera) {
        escena!.remove(esfera);
        esfera.geometry.dispose();
        (esfera.material as THREE.MeshBasicMaterial).dispose();
        esfera = null;
      }

      if (texturaActual) {
        if (texturaActual instanceof THREE.VideoTexture) {
          const video = texturaActual.image as HTMLVideoElement;
          video.pause();
          video.src = '';
          video.load();
        }
        texturaActual.dispose();
        texturaActual = null;
      }
    };

    const cargarNuevaTextura = async (): Promise<THREE.Texture> => {
      if (props.tipoMedio === 'video') {
        const textura = await cargarTexturaVideo(props.medio, props.autoReproducir, props.configuracionVideo);
        elementoVideo = (textura as THREE.VideoTexture).image as HTMLVideoElement;
        configurarListenersVideo();
        return textura;
      }
      elementoVideo = null;
      return cargarTexturaImagen(props.medio);
    };

    const construirMallaEsfera = () => {
      // Radio 500: arbitrariamente grande para que la cámara en (0,0,0)
      // nunca vea los bordes de la esfera, creando ilusión de infinito.
      const geometria = new THREE.SphereGeometry(500, 60, 40);

      // Invertir escala en X: la cámara está en el centro mirando hacia afuera,
      // pero la textura debe verse desde el interior de la esfera.
      // scale(-1, 1, 1) invierte las normales para que el material se renderice
      // en la cara interna en lugar de la externa.
      geometria.scale(-1, 1, 1);

      const material = new THREE.MeshBasicMaterial({ map: texturaActual });
      esfera = new THREE.Mesh(geometria, material);
      escena!.add(esfera);
    };

    const actualizarMarcadores = () => {
      if (!escena) return;

      const idsActuales = new Set(props.marcadores.map((m) => m.id));
      mallasMarcadores.forEach((malla, id) => {
        if (!idsActuales.has(id)) {
          escena!.remove(malla);
          malla.geometry.dispose();
          (malla.material as THREE.MeshBasicMaterial).dispose();
          mallasMarcadores.delete(id);
        }
      });

      props.marcadores.forEach((marcador) => {
        if (marcador.tipo === 'dom') return;
        if (mallasMarcadores.has(marcador.id)) return;

        const malla = crearMarcador3D(escena!, marcador.posicion, marcador.estilo || {});
        malla.userData = { id: marcador.id };
        mallasMarcadores.set(marcador.id, malla);
      });
    };

    const proyectarMarcadores = () => {
      if (!camara || !renderizador) return;

      // Capturar en const para que TypeScript estreche el tipo
      // y permita su uso dentro del callback de forEach.
      const camaraActual = camara;
      const ancho = renderizador.domElement.clientWidth;
      const alto = renderizador.domElement.clientHeight;
      const nuevasPosiciones: Record<string, PosicionPantalla> = {};

      props.marcadores.forEach((marcador) => {
        if (marcador.visible === false) {
          // Mover fuera de pantalla en lugar de ocultar con CSS:
          // así evitamos que el marcador DOM siga interceptando eventos
          // de mouse en su última posición conocida.
          nuevasPosiciones[marcador.id] = { x: -9999, y: -9999, visible: false };
          return;
        }

        const posicion = posicionACartesiano(marcador.posicion, 500);

        // project() transforma coordenadas mundo a Normalized Device Coordinates (NDC):
        // x,y ∈ [-1,1], z ∈ [-1,1] donde z < 1 significa "frente al plano cercano"
        // (i.e. visible para la cámara, no detrás).
        const proyectado = posicion.clone().project(camaraActual);

        const x = (proyectado.x * 0.5 + 0.5) * ancho;
        const y = (-proyectado.y * 0.5 + 0.5) * alto;
        const visible = proyectado.z < 1;

        nuevasPosiciones[marcador.id] = { x, y, visible };
      });

      posicionesPantalla.value = nuevasPosiciones;
      emit('actualizar-posiciones', nuevasPosiciones);
    };

    const actualizarDireccionCamara = () => {
      if (!camara) return;

      const phi = Math.PI / 2 - estadoAnimable.pitch;
      const theta = estadoAnimable.yaw;

      const targetX = Math.sin(phi) * Math.cos(theta);
      const targetY = Math.cos(phi);
      const targetZ = Math.sin(phi) * Math.sin(theta);

      camara.lookAt(targetX, targetY, targetZ);
    };

    /**
     * Calcula los factores de rotación en radianes por píxel,
     * basados en el FOV actual de la cámara y el tamaño del canvas.
     * Esto garantiza una sensación 1:1 (drag and drop) independiente del zoom.
     */
    const obtenerFactoresRotacion = (): { h: number; v: number } => {
      if (!camara || !renderizador) return { h: 0, v: 0 };
      const ancho = renderizador.domElement.clientWidth;
      const alto = renderizador.domElement.clientHeight;
      if (ancho === 0 || alto === 0) return { h: 0, v: 0 };

      const fovV = (camara.fov * Math.PI) / 180;
      const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camara.aspect);

      return {
        h: (fovH / ancho) * props.sensibilidadRotacion,
        v: (fovV / alto) * props.sensibilidadRotacion,
      };
    };

    const aplicarDeltaRotacion = (deltaX: number, deltaY: number) => {
      const factores = obtenerFactoresRotacion();

      // Modo "arrastrar la escena" (pan): al arrastrar derecha/abajo,
      // el contenido se mueve derecha/abajo, como Street View o Google Maps.
      estadoAnimable.yaw -= deltaX * factores.h;
      estadoAnimable.pitch += deltaY * factores.v;

      estadoAnimable.pitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, estadoAnimable.pitch));
      estadoAnimable.yaw = normalizarYaw(estadoAnimable.yaw);

      actualizarDireccionCamara();
      publicarEstado();
    };

    const detenerInercia = () => {
      if (idAnimacionInercia !== null) {
        cancelAnimationFrame(idAnimacionInercia);
        idAnimacionInercia = null;
      }
    };

    const iniciarInercia = () => {
      detenerInercia();

      const animarInercia = () => {
        if (Math.abs(velocidadYaw) < 0.0001 && Math.abs(velocidadPitch) < 0.0001) {
          idAnimacionInercia = null;
          return;
        }

        velocidadYaw *= FACTOR_FRICCION;
        velocidadPitch *= FACTOR_FRICCION;

        estadoAnimable.yaw += velocidadYaw;
        estadoAnimable.pitch += velocidadPitch;
        estadoAnimable.pitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, estadoAnimable.pitch));
        estadoAnimable.yaw = normalizarYaw(estadoAnimable.yaw);

        actualizarDireccionCamara();
        publicarEstado();

        idAnimacionInercia = requestAnimationFrame(animarInercia);
      };

      idAnimacionInercia = requestAnimationFrame(animarInercia);
    };

    const manejarSeleccion = (clientX: number, clientY: number) => {
      if (!renderizador || !camara || !raycaster || !puntero) return;

      const rect = renderizador.domElement.getBoundingClientRect();
      puntero.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      puntero.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(puntero, camara);
      const intersecciones = raycaster.intersectObjects(Array.from(mallasMarcadores.values()));

      if (intersecciones.length > 0) {
        const id = intersecciones[0].object.userData.id as string;
        const marcador = props.marcadores.find((m) => m.id === id);
        if (marcador) {
          emit('marcador-seleccionado', { marcador });
        }
      }
    };

    const manejarSeleccionMarcador = (marcador: Marcador, dobleClick: boolean) => {
      emit('marcador-seleccionado', { marcador, dobleClick });
    };

    const manejarHoverMarcador = (marcador: Marcador, activo: boolean) => {
      emit('marcador-hover', { marcador, activo });
    };

    const manejarMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Solo clic izquierdo
      estaArrastrando = true;
      seMovio = false;
      inicioX = e.clientX;
      inicioY = e.clientY;
      ultimaPosicionX = e.clientX;
      ultimaPosicionY = e.clientY;
      velocidadYaw = 0;
      velocidadPitch = 0;
      detenerInercia();
      matarAnimaciones(estadoAnimable);
    };

    const manejarMouseMove = (e: MouseEvent) => {
      if (!estaArrastrando || !camara) return;

      const deltaX = e.clientX - ultimaPosicionX;
      const deltaY = e.clientY - ultimaPosicionY;

      if (Math.abs(e.clientX - inicioX) > UMBRAL_MOVIMIENTO ||
          Math.abs(e.clientY - inicioY) > UMBRAL_MOVIMIENTO) {
        seMovio = true;
      }

      aplicarDeltaRotacion(deltaX, deltaY);

      const factores = obtenerFactoresRotacion();
      velocidadYaw = -deltaX * factores.h;
      velocidadPitch = deltaY * factores.v;

      ultimaPosicionX = e.clientX;
      ultimaPosicionY = e.clientY;
    };

    const manejarMouseUp = () => {
      if (!estaArrastrando) return;
      estaArrastrando = false;

      // Distinguir entre "click" (sin movimiento significativo) y "drag":
      // si no se movió más allá del umbral, tratamos como click para seleccionar marcadores.
      if (!seMovio) {
        manejarSeleccion(inicioX, inicioY);
      } else {
        iniciarInercia();
      }
    };

    const manejarScroll = (e: WheelEvent) => {
      e.preventDefault();
      if (!camara) return;
      matarAnimaciones(estadoAnimable);

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 33;
      if (e.deltaMode === 2) delta *= 100;

      const zoomDelta = delta * ZOOM_WHEEL_FACTOR * props.sensibilidadZoom;
      estadoAnimable.zoom = Math.max(0, Math.min(100, estadoAnimable.zoom - zoomDelta));
      camara.fov = nivelZoomAFov(estadoAnimable.zoom);
      camara.updateProjectionMatrix();
      publicarEstado();
    };

    const manejarDobleClick = () => {
      resetearVista(true);
    };

    const manejarTeclado = (e: KeyboardEvent) => {
      if (!camara) return;

      const pasoRotacion = 0.05 * props.sensibilidadRotacion;
      const pasoZoom = 2 * props.sensibilidadZoom;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          matarAnimaciones(estadoAnimable);
          estadoAnimable.yaw -= pasoRotacion;
          aplicarLimitesYPublicar();
          actualizarDireccionCamara();
          break;
        case 'ArrowRight':
          e.preventDefault();
          matarAnimaciones(estadoAnimable);
          estadoAnimable.yaw += pasoRotacion;
          aplicarLimitesYPublicar();
          actualizarDireccionCamara();
          break;
        case 'ArrowUp':
          e.preventDefault();
          matarAnimaciones(estadoAnimable);
          estadoAnimable.pitch += pasoRotacion;
          aplicarLimitesYPublicar();
          actualizarDireccionCamara();
          break;
        case 'ArrowDown':
          e.preventDefault();
          matarAnimaciones(estadoAnimable);
          estadoAnimable.pitch -= pasoRotacion;
          aplicarLimitesYPublicar();
          actualizarDireccionCamara();
          break;
        case '+':
        case '=':
          e.preventDefault();
          matarAnimaciones(estadoAnimable);
          estadoAnimable.zoom = Math.max(0, Math.min(100, estadoAnimable.zoom + pasoZoom));
          camara.fov = nivelZoomAFov(estadoAnimable.zoom);
          camara.updateProjectionMatrix();
          publicarEstado();
          break;
        case '-':
        case '_':
          e.preventDefault();
          matarAnimaciones(estadoAnimable);
          estadoAnimable.zoom = Math.max(0, Math.min(100, estadoAnimable.zoom - pasoZoom));
          camara.fov = nivelZoomAFov(estadoAnimable.zoom);
          camara.updateProjectionMatrix();
          publicarEstado();
          break;
      }
    };

    const rotarA = (posicion: CoordenadaEsferica, animar = true) => {
      if (!camara) return;
      matarAnimaciones(estadoAnimable);

      const yawObjetivo = normalizarYaw(posicion.yaw);
      const pitchObjetivo = Math.max(PITCH_MIN, Math.min(PITCH_MAX, posicion.pitch));
      const diffYaw = diferenciaAngular(estadoAnimable.yaw, yawObjetivo);
      const yawFinal = estadoAnimable.yaw + diffYaw;

      if (!animar) {
        estadoAnimable.yaw = yawFinal;
        estadoAnimable.pitch = pitchObjetivo;
        actualizarDireccionCamara();
        publicarEstado();
        return;
      }

      animarValores(
        estadoAnimable,
        { yaw: yawFinal, pitch: pitchObjetivo },
        0.8,
        EasingVisor.suave,
        () => {
          actualizarDireccionCamara();
          publicarEstado();
        }
      );
    };

    const zoomA = (nivel: number, animar = true) => {
      if (!camara) return;
      matarAnimaciones(estadoAnimable);

      const nivelObjetivo = Math.max(0, Math.min(100, nivel));

      if (!animar) {
        estadoAnimable.zoom = nivelObjetivo;
        camara.fov = nivelZoomAFov(estadoAnimable.zoom);
        camara.updateProjectionMatrix();
        publicarEstado();
        return;
      }

      animarValores(
        estadoAnimable,
        { zoom: nivelObjetivo },
        0.8,
        EasingVisor.suave,
        () => {
          camara!.fov = nivelZoomAFov(estadoAnimable.zoom);
          camara!.updateProjectionMatrix();
          publicarEstado();
        }
      );
    };

    const irAMarcador = (id: string, animar = true) => {
      const marcador = props.marcadores.find((m) => m.id === id);
      if (!marcador) return;

      const posicion = posicionAEsferica(marcador.posicion);
      const yawObj = posicion.yaw;
      const pitchObj = posicion.pitch;

      if (marcador.zoomObjetivo !== undefined) {
        if (animar) {
          rotarA({ yaw: yawObj, pitch: pitchObj }, true);
          setTimeout(() => zoomA(marcador.zoomObjetivo!, true), 50);
        } else {
          rotarA({ yaw: yawObj, pitch: pitchObj }, false);
          zoomA(marcador.zoomObjetivo!, false);
        }
      } else {
        rotarA({ yaw: yawObj, pitch: pitchObj }, animar);
      }
    };

    const resetearVista = (animar = true) => {
      rotarA(props.posicionInicial, animar);
      zoomA(props.zoomInicial, animar);
    };

    const obtenerEstado = (): EstadoCamara => ({
      yaw: estadoAnimable.yaw,
      pitch: estadoAnimable.pitch,
      zoom: estadoAnimable.zoom,
    });

    const reproducirVideo = () => {
      if (elementoVideo) {
        elementoVideo.play().catch(() => {});
      }
    };

    const pausarVideo = () => {
      if (elementoVideo) {
        elementoVideo.pause();
      }
    };

    const seekVideo = (tiempo: number) => {
      if (elementoVideo && isFinite(tiempo)) {
        elementoVideo.currentTime = Math.max(0, Math.min(elementoVideo.duration || 0, tiempo));
        publicarEstadoVideo();
      }
    };

    const reiniciarVideo = () => {
      if (elementoVideo) {
        elementoVideo.currentTime = 0;
        elementoVideo.play().catch(() => {});
        publicarEstadoVideo();
      }
    };

    const manejarRedimensionamiento = () => {
      if (!contenedor.value || !camara || !renderizador) return;

      const ancho = contenedor.value.clientWidth;
      const alto = contenedor.value.clientHeight;

      camara.aspect = ancho / alto;
      camara.updateProjectionMatrix();
      renderizador.setSize(ancho, alto);
    };

    const publicarEstadoVideo = () => {
      if (!elementoVideo) return;
      emit('estado-video', {
        reproduciendo: !elementoVideo.paused,
        tiempoActual: elementoVideo.currentTime || 0,
        duracion: elementoVideo.duration || 0,
        muteado: elementoVideo.muted,
        volumen: elementoVideo.volume,
      });
    };

    const configurarListenersVideo = () => {
      if (!elementoVideo) return;

      const alPlay = () => emit('video-reanudado');
      const alPause = () => emit('video-pausado');

      elementoVideo.addEventListener('play', alPlay);
      elementoVideo.addEventListener('pause', alPause);

      manejadoresVideo = { play: alPlay, pause: alPause };
    };

    const limpiarListenersVideo = () => {
      if (!elementoVideo || !manejadoresVideo) return;
      if (manejadoresVideo.play) elementoVideo.removeEventListener('play', manejadoresVideo.play);
      if (manejadoresVideo.pause) elementoVideo.removeEventListener('pause', manejadoresVideo.pause);
      manejadoresVideo = {};
    };

    const animar = () => {
      animacionId = requestAnimationFrame(animar);

      // Forzar actualización de VideoTexture (crítico en móviles/iOS)
      if (texturaActual instanceof THREE.VideoTexture) {
        texturaActual.needsUpdate = true;
      }

      if (renderizador && escena && camara) {
        renderizador.render(escena, camara);
      }
      proyectarMarcadores();

      // Emitir estado del video periódicamente (~cada 250ms para no saturar)
      if (elementoVideo && animacionId !== null && animacionId % 15 === 0) {
        publicarEstadoVideo();
      }
    };

    const limpiar = () => {
      if (animacionId !== null) {
        cancelAnimationFrame(animacionId);
      }

      detenerInercia();
      matarAnimaciones(estadoAnimable);
      window.removeEventListener('resize', manejarRedimensionamiento);

      if (props.tecladoHabilitado) {
        window.removeEventListener('keydown', manejarTeclado);
      }

      if (hammer) {
        hammer.destroy();
        hammer = null;
      }

      if (renderizador) {
        const canvas = renderizador.domElement;
        canvas.removeEventListener('mousedown', manejarMouseDown);
        canvas.removeEventListener('mousemove', manejarMouseMove);
        canvas.removeEventListener('mouseup', manejarMouseUp);
        canvas.removeEventListener('mouseleave', manejarMouseUp);
        canvas.removeEventListener('wheel', manejarScroll);
        canvas.removeEventListener('dblclick', manejarDobleClick);
        renderizador.dispose();
        if (contenedor.value && renderizador.domElement.parentNode === contenedor.value) {
          contenedor.value.removeChild(renderizador.domElement);
        }
      }

      if (overlayTransicion && contenedor.value && overlayTransicion.parentNode === contenedor.value) {
        contenedor.value.removeChild(overlayTransicion);
      }

      mallasMarcadores.forEach((malla) => {
        malla.geometry.dispose();
        (malla.material as THREE.MeshBasicMaterial).dispose();
      });
      mallasMarcadores.clear();

      if (esfera) {
        esfera.geometry.dispose();
        (esfera.material as THREE.MeshBasicMaterial).dispose();
      }

      limpiarListenersVideo();

      if (texturaActual) {
        if (texturaActual instanceof THREE.VideoTexture) {
          const video = texturaActual.image as HTMLVideoElement;
          video.pause();
          video.src = '';
          video.load();
          // Remover del DOM (iOS requiere limpieza explícita)
          if (video.parentNode) {
            video.parentNode.removeChild(video);
          }
        }
        texturaActual.dispose();
      }

      elementoVideo = null;

      escena = null;
      camara = null;
      renderizador = null;
      esfera = null;
      raycaster = null;
      puntero = null;
    };

    onMounted(() => {
      inicializarEscena();
      crearEsfera();
      actualizarMarcadores();
    });

    onUnmounted(() => {
      limpiar();
    });

    watch(() => props.medio, () => {
      crearEsfera();
    });

    watch(() => props.tipoMedio, () => {
      crearEsfera();
    });

    watch(() => props.marcadores, () => {
      actualizarMarcadores();
    }, { deep: true });

    const alternarMute = () => {
      if (elementoVideo) {
        elementoVideo.muted = !elementoVideo.muted;
        publicarEstadoVideo();
      }
    };

    const cambiarVolumen = (nivel: number) => {
      if (elementoVideo) {
        elementoVideo.volume = Math.max(0, Math.min(1, nivel));
        if (nivel > 0 && elementoVideo.muted) {
          elementoVideo.muted = false;
        }
        publicarEstadoVideo();
      }
    };

    expose({
      rotarA,
      zoomA,
      irAMarcador,
      resetearVista,
      obtenerEstado,
      reproducirVideo,
      pausarVideo,
      seekVideo,
      reiniciarVideo,
      alternarMute,
      cambiarVolumen,
    } as ApiEsfera360);

    return {
      contenedor,
      posicionesPantalla,
      marcadoresDomVisibles,
      tieneMarcadoresDom,
      manejarSeleccionMarcador,
      manejarHoverMarcador,
    };
  },
});
</script>

<style lang="stylus" scoped>
.esfera-360
  width 100%
  height 100%
  position relative
  overflow hidden
  touch-action none
  user-select none
  -webkit-user-select none
  cursor grab

  &:active
    cursor grabbing

.marcadores-dom
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  pointer-events none
  z-index 5

.overlay-transicion
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  z-index 10
  pointer-events none
  background #000

.transicion-img,
.transicion-video
  width 100%
  height 100%
  object-fit cover
</style>
