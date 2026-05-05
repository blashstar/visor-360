<template lang="pug">
.visor-esferico(ref="visor" tabindex="0")
  Esfera360(
    ref="esferaRef"
    :medio="transicionActiva ? siguienteMedio : medioActual"
    :tipo-medio="transicionActiva ? siguienteTipoMedio : tipoMedioActual"
    :marcadores="marcadoresActuales"
    :color-fondo="colorFondo"
    :auto-reproducir="autoReproducir"
    :controles-mouse="controlesMouse"
    :controles-tactiles="controlesTactiles"
    :teclado-habilitado="tecladoHabilitado"
    :sensibilidad-rotacion="sensibilidadRotacion"
    :sensibilidad-zoom="sensibilidadZoom"
    :posicion-inicial="normalizarPosicion(transicionActiva ? siguientePosicion : posicionActual)"
    :zoom-inicial="zoomActual"
    :configuracion-video="configuracionVideoActual"
    :opacidad-transicion="opacidadTransicion"
    @marcador-seleccionado="manejarMarcadorSeleccionado"
    @marcador-hover="manejarMarcadorHover"
    @actualizar-posiciones="actualizarPosicionesPantalla"
    @estado-cambiado="manejarEstadoCambiado"
    @estado-video="manejarEstadoVideo"
  )
  ControlesVideo.controles-video-anclados(
    v-if="esVideo && controlesVideoVisibles"
    :reproduciendo="estadoVideo.reproduciendo"
    :tiempo-actual="estadoVideo.tiempoActual"
    :duracion="estadoVideo.duracion"
    :visible="esVideo && controlesVideoVisibles"
    :muteado="estadoVideo.muteado"
    :volumen="estadoVideo.volumen"
    @play="manejarPlayVideo"
    @pause="manejarPauseVideo"
    @seek="manejarSeekVideo"
    @reiniciar="manejarReiniciarVideo"
    @toggle-mute="manejarToggleMute"
    @cambiar-volumen="manejarCambiarVolumen"
  )
  PanelInformacion.panel-anclado(
    v-if="panelVisible && marcadorSeleccionadoId"
    :visible="panelVisible && estaMarcadorVisible"
    :titulo="panelTitulo"
    :contenido="panelContenido"
    :style="estiloPanel"
    @cerrar="panelVisible = false"
  )
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, type PropType } from 'vue';
import Esfera360 from './Esfera360.vue';
import PanelInformacion from './PanelInformacion.vue';
import ControlesVideo from './ControlesVideo.vue';
import type {
  Marcador,
  TipoMedio,
  EventoMedioCambiado,
  PosicionPantalla,
  CoordenadaEsferica,
  CoordenadaTextura,
  PosicionInicial,
  EstadoCamara,
  ApiVisorEsferico,
  ApiEsfera360,
  Escena,
  EventoEscenaCambiada,
  ConfiguracionVideo,
} from './tipos';

const convertirUVaEsferica = (uv: CoordenadaTextura): CoordenadaEsferica => {
  const yaw = (uv.u - 0.5) * 2 * Math.PI;
  const pitch = (0.5 - uv.v) * Math.PI;
  return { yaw, pitch };
};

const normalizarPosicion = (posicion: PosicionInicial | undefined): CoordenadaEsferica => {
  if (!posicion) return { yaw: 0, pitch: 0 };
  if ('yaw' in posicion) return posicion;
  return convertirUVaEsferica(posicion);
};

export default defineComponent({
  name: 'VisorEsferico',
  components: {
    Esfera360,
    PanelInformacion,
    ControlesVideo,
  },
  props: {
    // ── Modo legacy (props individuales) ──
    medioInicial: {
      type: String,
      default: '',
    },
    tipoMedioInicial: {
      type: String as PropType<TipoMedio>,
      default: 'imagen',
    },
    marcadoresIniciales: {
      type: Array as PropType<Marcador[]>,
      default: () => [],
    },
    // ── Modo escenas ──
    escenas: {
      type: Array as PropType<Escena[]>,
      default: () => [],
    },
    escenaInicial: {
      type: String,
      default: '',
    },
    duracionTransicion: {
      type: Number,
      default: 300,
    },
    // ── Configuración común ──
    colorFondo: {
      type: String,
      default: '#000000',
    },
    sensibilidadRotacion: {
      type: Number,
      default: 1,
    },
    sensibilidadZoom: {
      type: Number,
      default: 1,
    },
    autoReproducir: {
      type: Boolean,
      default: true,
    },
    controlesTactiles: {
      type: Boolean,
      default: true,
    },
    controlesMouse: {
      type: Boolean,
      default: true,
    },
    tecladoHabilitado: {
      type: Boolean,
      default: true,
    },
    posicionInicial: {
      type: Object as PropType<CoordenadaEsferica>,
      default: () => ({ yaw: 0, pitch: 0 }),
    },
    zoomInicial: {
      type: Number,
      default: 50,
    },
  },
  emits: [
    'marcador-seleccionado',
    'medio-cambiado',
    'video-pausado',
    'video-reanudado',
    'marcador-agregado',
    'marcador-eliminado',
    'marcador-actualizado',
    'estado-cambiado',
    'escena-cambiada',
  ],
  setup(props, { emit, expose }) {
    const esferaRef = ref<ApiEsfera360 | null>(null);

    // ── Determinar modo: escenas o legacy ──
    const modoEscenas = computed(() => props.escenas.length > 0);

    // ── Estado de escena ──
    const indiceEscena = ref(0);

    const escenaActual = computed<Escena | null>(() => {
      if (!modoEscenas.value) return null;
      return props.escenas[indiceEscena.value] ?? null;
    });

    // ── Estado del medio y marcadores ──
    const medioActual = ref<string>(props.medioInicial);
    const tipoMedioActual = ref<TipoMedio>(props.tipoMedioInicial);
    const marcadoresActuales = ref<Marcador[]>(props.marcadoresIniciales);
    const posicionActual = ref<PosicionInicial | undefined>(props.posicionInicial);
    const zoomActual = ref<number>(props.zoomInicial);

    // ── Precarga de imágenes ──
    const precargasCargadas = ref<Set<string>>(new Set());
    const cargandoPrecarga = ref(false);

    const precargarImagenes = async (escenas: Escena[]) => {
      if (cargandoPrecarga.value) return;
      cargandoPrecarga.value = true;

      const urls = escenas
        .filter(e => e.tipoMedio !== 'video')
        .map(e => e.medio)
        .filter(url => url && !precargasCargadas.value.has(url));

      await Promise.all(
        urls.map(url => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              precargasCargadas.value.add(url);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = url;
          });
        })
      );

      cargandoPrecarga.value = false;
    };

    // ── Transición con fade ──
    const transicionActiva = ref(false);
    const siguienteMedio = ref<string>('');
    const siguienteTipoMedio = ref<TipoMedio>('imagen');
    const siguienteMarcadores = ref<Marcador[]>([]);
    const siguientePosicion = ref<PosicionInicial | undefined>(undefined);
    const siguienteZoom = ref<number>(50);
    const opacidadTransicion = ref(0);

    const iniciarTransicion = (escena: Escena, duracion: number = 300) => {
      transicionActiva.value = true;
      siguienteMedio.value = escena.medio;
      siguienteTipoMedio.value = escena.tipoMedio ?? 'imagen';
      siguienteMarcadores.value = escena.marcadores ?? [];
      siguientePosicion.value = escena.posicionInicial ?? props.posicionInicial;
      siguienteZoom.value = escena.zoomInicial ?? props.zoomInicial;
      opacidadTransicion.value = 0;

      const paso = 16;
      const incremento = 1 / (duracion / paso);

      const intervalo = setInterval(() => {
        opacidadTransicion.value += incremento;
        if (opacidadTransicion.value >= 1) {
          clearInterval(intervalo);
          medioActual.value = siguienteMedio.value;
          tipoMedioActual.value = siguienteTipoMedio.value;
          marcadoresActuales.value = siguienteMarcadores.value;
          posicionActual.value = siguientePosicion.value;
          zoomActual.value = siguienteZoom.value;
          transicionActiva.value = false;
          opacidadTransicion.value = 0;
        }
      }, paso);
    };

    // ── Inicializar según modo ──
    const inicializarDesdeEscena = (escena: Escena) => {
      medioActual.value = escena.medio;
      tipoMedioActual.value = escena.tipoMedio ?? 'imagen';
      marcadoresActuales.value = escena.marcadores ?? [];
      posicionActual.value = escena.posicionInicial ?? props.posicionInicial;
      zoomActual.value = escena.zoomInicial ?? props.zoomInicial;
    };

    const inicializarDesdeLegacy = () => {
      medioActual.value = props.medioInicial;
      tipoMedioActual.value = props.tipoMedioInicial;
      marcadoresActuales.value = props.marcadoresIniciales;
      posicionActual.value = props.posicionInicial;
      zoomActual.value = props.zoomInicial;
    };

    // Inicializar al montar
    if (modoEscenas.value) {
      const idInicial = props.escenaInicial || props.escenas[0]?.id;
      const idx = props.escenas.findIndex((e) => e.id === idInicial);
      indiceEscena.value = idx >= 0 ? idx : 0;
      if (escenaActual.value) {
        inicializarDesdeEscena(escenaActual.value);
      }
    } else {
      inicializarDesdeLegacy();
    }

    // ── Watchers para legacy ──
    watch(() => props.medioInicial, (nuevo) => {
      if (!modoEscenas.value) medioActual.value = nuevo;
    });

    watch(() => props.tipoMedioInicial, (nuevo) => {
      if (!modoEscenas.value) tipoMedioActual.value = nuevo;
    });

    watch(() => props.marcadoresIniciales, (nuevo) => {
      if (!modoEscenas.value) marcadoresActuales.value = nuevo;
    }, { deep: true });

    // ── Watcher para precargar escenas ──
    watch(() => props.escenas, (nuevasEscenas) => {
      if (nuevasEscenas.length > 0) {
        precargarImagenes(nuevasEscenas);
      }
    }, { immediate: true, deep: true });

    // ── Panel de información ──
    const panelVisible = ref(false);
    const panelTitulo = ref('');
    const panelContenido = ref('');
    const marcadorSeleccionadoId = ref<string | null>(null);
    const posicionesPantalla = ref<Record<string, PosicionPantalla>>({});

    const estaMarcadorVisible = computed(() => {
      if (!marcadorSeleccionadoId.value) return false;
      const pos = posicionesPantalla.value[marcadorSeleccionadoId.value];
      return pos ? pos.visible : false;
    });

    const esVideo = computed(() => tipoMedioActual.value === 'video');

    const configuracionVideoActual = computed<ConfiguracionVideo | undefined>(() => {
      if (modoEscenas.value && escenaActual.value) {
        return escenaActual.value.configuracionVideo;
      }
      return undefined;
    });

    const controlesVideoVisibles = computed(() => {
      return configuracionVideoActual.value?.controlesVisibles ?? true;
    });

    const estadoVideo = ref({
      reproduciendo: false,
      tiempoActual: 0,
      duracion: 0,
      muteado: true,
      volumen: 1,
    });

    const manejarEstadoVideo = (estado: { reproduciendo: boolean; tiempoActual: number; duracion: number; muteado: boolean; volumen: number }) => {
      estadoVideo.value = estado;
    };

    const manejarPlayVideo = () => {
      esferaRef.value?.reproducirVideo();
    };

    const manejarPauseVideo = () => {
      esferaRef.value?.pausarVideo();
    };

    const manejarSeekVideo = (tiempo: number) => {
      esferaRef.value?.seekVideo(tiempo);
    };

    const manejarReiniciarVideo = () => {
      esferaRef.value?.reiniciarVideo();
    };

    const manejarToggleMute = () => {
      esferaRef.value?.alternarMute();
    };

    const manejarCambiarVolumen = (nivel: number) => {
      esferaRef.value?.cambiarVolumen(nivel);
    };

    const estiloPanel = computed(() => {
      if (!marcadorSeleccionadoId.value) return {};
      const pos = posicionesPantalla.value[marcadorSeleccionadoId.value];
      if (!pos) return {};
      return {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        position: 'absolute',
        transform: 'translate(-50%, -120%)',
        zIndex: 100,
      };
    });

    const actualizarPosicionesPantalla = (posiciones: Record<string, PosicionPantalla>) => {
      posicionesPantalla.value = posiciones;
    };

    const mostrarPanelMarcador = (marcador: Marcador) => {
      panelTitulo.value = marcador.titulo;
      panelContenido.value = marcador.contenido || '';
      marcadorSeleccionadoId.value = marcador.id;
      panelVisible.value = true;
    };

    const navegarAUrl = (url: string) => {
      window.open(url, '_blank');
    };

    const cambiarMedioDesdeMarcador = (url: string, tipoMedio: TipoMedio) => {
      if (modoEscenas.value) {
        // En modo escenas, preferimos transicionar a una escena existente
        // si el URL coincide con alguna, para preservar metadatos (título, marcadores, etc.)
        const idx = props.escenas.findIndex((e) => e.medio === url);
        if (idx >= 0) {
          cargarEscenaPorIndice(idx);
          return;
        }
      }
      medioActual.value = url;
      tipoMedioActual.value = tipoMedio;
    };

    const manejarMarcadorSeleccionado = (evento: { marcador: Marcador; dobleClick?: boolean }) => {
      const marcador = evento.marcador;
      emit('marcador-seleccionado', { marcador, dobleClick: evento.dobleClick });

      switch (marcador.accion) {
        case 'mostrar_panel':
          mostrarPanelMarcador(marcador);
          break;

        case 'cambiar_contenido':
          if (marcador.url && marcador.tipoMedio) {
            cambiarMedioDesdeMarcador(marcador.url, marcador.tipoMedio);
            panelVisible.value = false;
            marcadorSeleccionadoId.value = null;
            const payload: EventoMedioCambiado = {
              url: marcador.url,
              tipoMedio: marcador.tipoMedio,
            };
            emit('medio-cambiado', payload);
          }
          break;

        case 'navegar':
          if (marcador.url) {
            navegarAUrl(marcador.url);
          }
          break;

        case 'cambiar_escena':
          if (marcador.escenaDestino) {
            panelVisible.value = false;
            marcadorSeleccionadoId.value = null;
            cargarEscena(marcador.escenaDestino);
          }
          break;
      }
    };

    const manejarMarcadorHover = (evento: { marcador: Marcador; activo: boolean }) => {
      // Puede usarse para tracking de analytics o efectos visuales externos
    };

    const manejarEstadoCambiado = (estado: EstadoCamara) => {
      emit('estado-cambiado', estado);
    };

    // ── Gestión de escenas ──
    const cargarEscenaPorIndice = (indice: number) => {
      if (!modoEscenas.value || indice < 0 || indice >= props.escenas.length) return;
      if (transicionActiva.value) return;

      const escenaAnterior = escenaActual.value ?? undefined;
      const nuevaEscena = props.escenas[indice]!;

      panelVisible.value = false;
      marcadorSeleccionadoId.value = null;

      iniciarTransicion(nuevaEscena, props.duracionTransicion);

      indiceEscena.value = indice;

      const payload: EventoEscenaCambiada = {
        escenaAnterior,
        escenaActual: nuevaEscena,
        indice,
      };
      emit('escena-cambiada', payload);
    };

    const cargarEscena = (id: string) => {
      const idx = props.escenas.findIndex((e) => e.id === id);
      if (idx >= 0) cargarEscenaPorIndice(idx);
    };

    const escenaSiguiente = () => {
      if (!modoEscenas.value) return;
      const siguiente = (indiceEscena.value + 1) % props.escenas.length;
      cargarEscenaPorIndice(siguiente);
    };

    const escenaAnterior = () => {
      if (!modoEscenas.value) return;
      const anterior = (indiceEscena.value - 1 + props.escenas.length) % props.escenas.length;
      cargarEscenaPorIndice(anterior);
    };

    const obtenerEscenaActual = (): Escena | null => escenaActual.value;
    const obtenerIndiceEscena = (): number => indiceEscena.value;

    // ── API Programática ──

    const rotarA = (posicion: CoordenadaEsferica, animar = true) => {
      esferaRef.value?.rotarA(posicion, animar);
    };

    const zoomA = (nivel: number, animar = true) => {
      esferaRef.value?.zoomA(nivel, animar);
    };

    const irAMarcador = (id: string, animar = true) => {
      esferaRef.value?.irAMarcador(id, animar);

      const marcador = marcadoresActuales.value.find((m) => m.id === id);
      if (marcador && marcador.accion === 'mostrar_panel') {
        panelTitulo.value = marcador.titulo;
        panelContenido.value = marcador.contenido || '';
        marcadorSeleccionadoId.value = marcador.id;
        panelVisible.value = true;
      }
    };

    const agregarMarcador = (marcador: Marcador) => {
      if (marcadoresActuales.value.some((m) => m.id === marcador.id)) {
        console.warn(`Marcador con id "${marcador.id}" ya existe.`);
        return;
      }
      marcadoresActuales.value.push(marcador);
      emit('marcador-agregado', { marcador });
    };

    const eliminarMarcador = (id: string) => {
      const index = marcadoresActuales.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        marcadoresActuales.value.splice(index, 1);
        if (marcadorSeleccionadoId.value === id) {
          panelVisible.value = false;
          marcadorSeleccionadoId.value = null;
        }
        emit('marcador-eliminado', { id });
      }
    };

    const actualizarMarcador = (marcador: Partial<Marcador> & { id: string }) => {
      const index = marcadoresActuales.value.findIndex((m) => m.id === marcador.id);
      if (index !== -1) {
        marcadoresActuales.value[index] = { ...marcadoresActuales.value[index], ...marcador };
        emit('marcador-actualizado', { marcador: marcadoresActuales.value[index] });
      }
    };

    const limpiarMarcadores = () => {
      marcadoresActuales.value = [];
      panelVisible.value = false;
      marcadorSeleccionadoId.value = null;
    };

    const mostrarMarcador = (id: string) => {
      const marcador = marcadoresActuales.value.find((m) => m.id === id);
      if (marcador) {
        actualizarMarcador({ id, visible: true });
      }
    };

    const ocultarMarcador = (id: string) => {
      const marcador = marcadoresActuales.value.find((m) => m.id === id);
      if (marcador) {
        actualizarMarcador({ id, visible: false });
        if (marcadorSeleccionadoId.value === id) {
          panelVisible.value = false;
          marcadorSeleccionadoId.value = null;
        }
      }
    };

    const resetearVista = (animar = true) => {
      esferaRef.value?.resetearVista(animar);
      panelVisible.value = false;
      marcadorSeleccionadoId.value = null;
    };

    const obtenerEstado = (): EstadoCamara | null => {
      return esferaRef.value?.obtenerEstado() ?? null;
    };

    const api: ApiVisorEsferico = {
      rotarA,
      zoomA,
      irAMarcador,
      agregarMarcador,
      eliminarMarcador,
      actualizarMarcador,
      limpiarMarcadores,
      mostrarMarcador,
      ocultarMarcador,
      resetearVista,
      obtenerEstado,
      cargarEscena,
      escenaSiguiente,
      escenaAnterior,
      obtenerEscenaActual,
      obtenerIndiceEscena,
    };

    expose(api);

    return {
      esferaRef,
      medioActual,
      tipoMedioActual,
      marcadoresActuales,
      posicionActual,
      zoomActual,
      transicionActiva,
      opacidadTransicion,
      siguienteMedio,
      siguienteTipoMedio,
      normalizarPosicion,
      panelVisible,
      panelTitulo,
      panelContenido,
      marcadorSeleccionadoId,
      posicionesPantalla,
      estaMarcadorVisible,
      estiloPanel,
      esVideo,
      configuracionVideoActual,
      controlesVideoVisibles,
      estadoVideo,
      actualizarPosicionesPantalla,
      manejarMarcadorSeleccionado,
      manejarMarcadorHover,
      manejarEstadoCambiado,
      manejarEstadoVideo,
      manejarPlayVideo,
      manejarPauseVideo,
      manejarSeekVideo,
      manejarReiniciarVideo,
      manejarToggleMute,
      manejarCambiarVolumen,
      ...api,
    };
  },
});
</script>

<style lang="stylus" scoped>
.visor-esferico
  position relative
  width 100%
  height 100%
  overflow hidden
  outline none

.controles-video-anclados
  pointer-events auto

.panel-anclado
  pointer-events none

  & > *
    pointer-events auto
</style>
