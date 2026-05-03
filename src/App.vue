<template lang="pug">
.app-demo
  header.demo-header
    h1 Visor Esférico 360° — Demo con Escenas
    p Arrastra para rotar, scroll/pinch para zoom, clic en marcadores. Usa flechas del teclado para navegar.

  main.demo-contenido
    .visor-wrapper
      VisorEsferico(
        ref="visorRef"
        :escenas="escenas"
        escena-inicial="sala"
        :auto-reproducir="true"
        :controles-tactiles="true"
        :teclado-habilitado="true"
        @marcador-seleccionado="manejarMarcador"
        @escena-cambiada="manejarEscenaCambiada"
      )

  footer.demo-controles
    .grupo-escenas
      button.btn(v-for="(escena, idx) in escenas" :key="escena.id" @click="cargarEscena(escena.id)")
        | {{ escena.id }}
    .grupo-acciones
      button.btn(@click="escenaAnterior") ← Anterior
      button.btn(@click="escenaSiguiente") Siguiente →
      button.btn(@click="resetear") Resetear vista
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import VisorEsferico from './components/VisorEsferico/VisorEsferico.vue';
import type { Marcador, Escena, ApiVisorEsferico, EventoEscenaCambiada } from './components/VisorEsferico/tipos';

export default defineComponent({
  name: 'App',
  components: { VisorEsferico },
  setup() {
    const visorRef = ref<ApiVisorEsferico | null>(null);

    // ── Escenas definidas como objetos JSON ──
    const escenas = ref<Escena[]>([
      {
        id: 'sala',
        medio: '/ejemplos/malla.png',
        tipoMedio: 'imagen',
        posicionInicial: { yaw: 0, pitch: 0 },
        zoomInicial: 50,
        marcadores: [
          {
            id: 'sala-entrada',
            posicion: { u: 0.5, v: 0.5 },
            titulo: 'Entrada a la cocina',
            contenido: 'Desde aquí puedes acceder a la cocina.',
            accion: 'mostrar_panel',
            tipo: 'dom',
            tooltip: { contenido: 'Ir a cocina', trigger: 'hover' },
          },
          {
            id: 'sala-ventana',
            posicion: { yaw: 0.8, pitch: -0.3 },
            titulo: 'Ventana',
            contenido: 'Vista al jardín exterior.',
            accion: 'mostrar_panel',
            tipo: 'dom',
          },
          {
            id: 'sala-a-video',
            posicion: { u: 0.2, v: 0.6 },
            titulo: 'Ver vídeo 360°',
            url: '/ejemplos/video.webm',
            tipoMedio: 'video',
            accion: 'cambiar_contenido',
            tipo: 'dom',
            tooltip: { contenido: 'Reproducir vídeo', trigger: 'hover' },
          },
        ],
      },
      {
        id: 'cocina',
        medio: '/ejemplos/rejilla.png',
        tipoMedio: 'imagen',
        posicionInicial: { yaw: 1.5, pitch: 0 },
        zoomInicial: 60,
        marcadores: [
          {
            id: 'cocina-isla',
            posicion: { u: 0.5, v: 0.5 },
            titulo: 'Isla central',
            contenido: 'Espacio de preparación con encimera de mármol.',
            accion: 'mostrar_panel',
            tipo: 'dom',
            tooltip: { contenido: 'Información', trigger: 'hover' },
          },
          {
            id: 'cocina-volver',
            posicion: { yaw: -5.5, pitch: 0 },
            titulo: 'Volver a la sala',
            accion: 'cambiar_contenido',
            url: '/ejemplos/malla.png',
            tipoMedio: 'imagen',
            tipo: 'dom',
          },
        ],
      },
      {
        id: 'video',
        medio: '/ejemplos/video.webm',
        tipoMedio: 'video',
        posicionInicial: { yaw: 0, pitch: 0 },
        zoomInicial: 50,
        marcadores: [
          {
            id: 'video2-volver',
            posicion: { u: 0.5, v: 0.8 },
            titulo: 'Volver a sala',
            accion: 'cambiar_contenido',
            url: '/ejemplos/malla.png',
            tipoMedio: 'imagen',
            tipo: 'dom',
            tooltip: { contenido: 'Detener vídeo', trigger: 'hover' },
          },
        ],
      },
    ]);

    const manejarMarcador = (evento: { marcador: Marcador; dobleClick?: boolean }) => {
      console.log('Marcador:', evento.marcador.titulo, evento.dobleClick ? '(doble click)' : '');
    };

    const manejarEscenaCambiada = (evento: EventoEscenaCambiada) => {
      console.log(
        'Escena cambiada:',
        evento.escenaAnterior?.id ?? 'ninguna',
        '→',
        evento.escenaActual.id,
        `(índice ${evento.indice})`
      );
    };

    const cargarEscena = (id: string) => {
      visorRef.value?.cargarEscena(id);
    };

    const escenaSiguiente = () => {
      visorRef.value?.escenaSiguiente();
    };

    const escenaAnterior = () => {
      visorRef.value?.escenaAnterior();
    };

    const resetear = () => {
      visorRef.value?.resetearVista(true);
    };

    return {
      visorRef,
      escenas,
      manejarMarcador,
      manejarEscenaCambiada,
      cargarEscena,
      escenaSiguiente,
      escenaAnterior,
      resetear,
    };
  },
});
</script>

<style lang="stylus">
.app-demo
  display flex
  flex-direction column
  height 100vh
  background #1a1a1a
  color #fff

.demo-header
  padding 16px 24px
  text-align center

  h1
    margin 0 0 8px
    font-size 24px

  p
    margin 0
    opacity 0.7
    font-size 14px

.demo-contenido
  flex 1
  display flex
  justify-content center
  align-items center
  padding 0 24px

.visor-wrapper
  width 100%
  max-width 1200px
  height 60vh
  border-radius 12px
  overflow hidden
  box-shadow 0 8px 32px rgba(0, 0, 0, 0.5)

.demo-controles
  padding 16px 24px
  display flex
  flex-direction column
  gap 12px
  align-items center

.grupo-escenas
  display flex
  gap 8px
  flex-wrap wrap
  justify-content center

.grupo-acciones
  display flex
  gap 8px
  flex-wrap wrap
  justify-content center

.btn
  background #3b82f6
  color #fff
  border none
  padding 10px 20px
  border-radius 8px
  cursor pointer
  font-size 14px
  transition background 0.2s

  &:hover
    background #2563eb
</style>
