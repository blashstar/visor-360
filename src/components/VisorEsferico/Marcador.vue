<template lang="pug">
.marcador-contenedor(
  v-if="posicionPantalla?.visible"
  :style="estiloContenedor"
  @click="seleccionar(false)"
  @dblclick="seleccionar(true)"
  @mouseenter="hover(true)"
  @mouseleave="hover(false)"
)
  .marcador-punto(:style="estiloPunto")
  Tooltip(
    v-if="tooltipVisible"
    :config="marcador.tooltip"
    :activo="tooltipActivo"
    @activar="tooltipActivo = true"
    @desactivar="tooltipActivo = false"
  )
</template>

<script lang="ts">
import { defineComponent, computed, ref, type PropType } from 'vue';
import type { Marcador, PosicionPantalla } from './tipos';
import Tooltip from './Tooltip.vue';

export default defineComponent({
  name: 'MarcadorVue',
  components: { Tooltip },
  props: {
    marcador: {
      type: Object as PropType<Marcador>,
      required: true,
    },
    posicionPantalla: {
      type: Object as PropType<PosicionPantalla>,
      default: null,
    },
  },
  emits: ['seleccionar', 'hover'],
  setup(props, { emit }) {
    const tooltipActivo = ref(false);

    const tooltipVisible = computed(() => !!props.marcador.tooltip?.contenido);

    const estiloContenedor = computed(() => {
      if (!props.posicionPantalla) return {};
      return {
        left: `${props.posicionPantalla.x}px`,
        top: `${props.posicionPantalla.y}px`,
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
      };
    });

    const estiloPunto = computed(() => {
      const tamano = props.marcador.estilo?.tamano || 16;
      const color = props.marcador.estilo?.color || '#ff0000';
      return {
        width: `${tamano}px`,
        height: `${tamano}px`,
        backgroundColor: color,
        borderRadius: '50%',
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      };
    });

    const seleccionar = (dobleClick: boolean) => {
      emit('seleccionar', dobleClick);
    };

    const hover = (activo: boolean) => {
      emit('hover', activo);
    };

    return {
      estiloContenedor,
      estiloPunto,
      tooltipVisible,
      tooltipActivo,
      seleccionar,
      hover,
    };
  },
});
</script>

<style lang="stylus" scoped>
.marcador-contenedor
  z-index 10

.marcador-punto
  &:hover
    transform scale(1.2)
</style>
