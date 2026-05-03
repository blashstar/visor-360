<template lang="pug">
.tooltip-marcador(
  v-if="config"
  :class="clasesTooltip"
  :style="estiloTooltip"
)
  .tooltip-contenido {{ config.contenido }}
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { TooltipConfig } from './tipos';

export default defineComponent({
  name: 'Tooltip',
  props: {
    config: {
      type: Object as PropType<TooltipConfig>,
      required: true,
    },
    activo: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['activar', 'desactivar'],
  setup(props) {
    const clasesTooltip = computed(() => {
      const clases = ['tooltip-marcador'];
      if (props.config?.clase) clases.push(props.config.clase);
      if (props.activo) clases.push('tooltip--visible');
      return clases;
    });

    const estiloTooltip = computed(() => {
      const posicion = props.config?.posicion || 'top center';
      const [vertical, horizontal] = posicion.split(' ');

      const estilos: Record<string, string> = {
        position: 'absolute',
        whiteSpace: 'nowrap',
        zIndex: '50',
      };

      // Posicionamiento vertical
      if (vertical === 'top') {
        estilos.bottom = '100%';
        estilos.marginBottom = '8px';
      } else if (vertical === 'bottom') {
        estilos.top = '100%';
        estilos.marginTop = '8px';
      } else {
        estilos.top = '50%';
        estilos.transform = 'translateY(-50%)';
      }

      // Posicionamiento horizontal
      if (horizontal === 'left') {
        estilos.right = '100%';
        estilos.marginRight = '8px';
      } else if (horizontal === 'right') {
        estilos.left = '100%';
        estilos.marginLeft = '8px';
      } else {
        estilos.left = '50%';
        estilos.transform = `${estilos.transform || ''} translateX(-50%)`.trim();
      }

      return estilos;
    });

    return {
      clasesTooltip,
      estiloTooltip,
    };
  },
});
</script>

<style lang="stylus" scoped>
.tooltip-marcador
  opacity 0
  visibility hidden
  transition opacity 0.2s ease, visibility 0.2s ease
  pointer-events none

  &.tooltip--visible
    opacity 1
    visibility visible

.tooltip-contenido
  background rgba(0, 0, 0, 0.85)
  color #fff
  padding 6px 12px
  border-radius 6px
  font-size 12px
  line-height 1.4
  backdrop-filter blur(4px)
  box-shadow 0 2px 8px rgba(0, 0, 0, 0.3)
</style>
