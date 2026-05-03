<template lang="pug">
.controles-video(v-if="visible")
  .grupo-izquierda
    button.btn-control(
      @click="manejarPlayPausa"
      :aria-label="reproduciendo ? 'Pausar' : 'Reproducir'"
      type="button"
    )
      svg.icono(v-if="!reproduciendo", viewBox="0 0 24 24")
        polygon(points="5,3 19,12 5,21", fill="currentColor")
      svg.icono(v-else, viewBox="0 0 24 24")
        rect(x="6" y="4" width="4" height="16" fill="currentColor")
        rect(x="14" y="4" width="4" height="16" fill="currentColor")

    button.btn-control(@click="$emit('reiniciar')" aria-label="Reiniciar" type="button")
      svg.icono(viewBox="0 0 24 24")
        path(d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor")

  .grupo-centro
    .barra-tiempo(@click="manejarClickBarra" ref="barraTiempo")
      .barra-progreso(:style="{ width: porcentajeProgreso + '%' }")
      .indicador-progreso(:style="{ left: porcentajeProgreso + '%' }")

  .grupo-derecha
    span.tiempo {{ formatoTiempo(tiempoActual) }} / {{ formatoTiempo(duracion) }}
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ControlesVideo',
  props: {
    reproduciendo: { type: Boolean, default: false },
    tiempoActual: { type: Number, default: 0 },
    duracion: { type: Number, default: 0 },
    visible: { type: Boolean, default: false },
  },
  emits: ['play', 'pause', 'seek', 'reiniciar'],
  setup(props, { emit }) {
    const porcentajeProgreso = computed(() => {
      if (!props.duracion || props.duracion <= 0) return 0;
      return Math.min(100, Math.max(0, (props.tiempoActual / props.duracion) * 100));
    });

    const manejarPlayPausa = () => {
      if (props.reproduciendo) {
        emit('pause');
      } else {
        emit('play');
      }
    };

    const manejarClickBarra = (e: MouseEvent) => {
      const barra = e.currentTarget as HTMLElement;
      const rect = barra.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const porcentaje = Math.max(0, Math.min(1, x / rect.width));
      emit('seek', porcentaje * props.duracion);
    };

    const formatoTiempo = (segundos: number): string => {
      if (!isFinite(segundos) || segundos < 0) return '0:00';
      const mins = Math.floor(segundos / 60);
      const secs = Math.floor(segundos % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
      porcentajeProgreso,
      manejarPlayPausa,
      manejarClickBarra,
      formatoTiempo,
    };
  },
});
</script>

<style lang="stylus" scoped>
.controles-video
  position absolute
  bottom 0
  left 0
  right 0
  display flex
  align-items center
  gap 12px
  padding 8px 16px
  background rgba(0, 0, 0, 0.6)
  backdrop-filter blur(4px)
  z-index 20
  user-select none
  transition opacity 0.3s ease

.grupo-izquierda
  display flex
  align-items center
  gap 8px
  flex-shrink 0

.grupo-centro
  flex 1
  display flex
  align-items center

.grupo-derecha
  flex-shrink 0
  display flex
  align-items center

.btn-control
  background none
  border none
  color white
  cursor pointer
  padding 4px
  display flex
  align-items center
  justify-content center
  opacity 0.85
  transition opacity 0.2s
  border-radius 4px

  &:hover
    opacity 1
    background rgba(255, 255, 255, 0.1)

  &:active
    opacity 0.7

.icono
  width 20px
  height 20px

.barra-tiempo
  flex 1
  height 6px
  background rgba(255, 255, 255, 0.25)
  border-radius 3px
  cursor pointer
  position relative
  overflow visible

  &:hover
    .barra-progreso
      background #29b6f6

.barra-progreso
  position absolute
  top 0
  left 0
  height 100%
  background #4fc3f7
  border-radius 3px
  transition width 0.1s linear
  pointer-events none

.indicador-progreso
  position absolute
  top 50%
  width 12px
  height 12px
  background white
  border-radius 50%
  transform translate(-50%, -50%)
  opacity 0
  transition opacity 0.2s
  pointer-events none
  box-shadow 0 0 4px rgba(0, 0, 0, 0.3)

.barra-tiempo:hover .indicador-progreso
  opacity 1

.tiempo
  color white
  font-size 12px
  font-family monospace
  opacity 0.9
  min-width 90px
  text-align right
</style>
