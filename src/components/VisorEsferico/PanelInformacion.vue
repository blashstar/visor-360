<template lang="pug">
.panel-informacion(v-if="visible")
  .panel-header
    h3.panel-titulo {{ titulo }}
    button.panel-cerrar(@click="cerrar" aria-label="Cerrar panel") ×
  .panel-contenido
    p(v-if="contenido") {{ contenido }}
    slot
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PanelInformacion',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    titulo: {
      type: String,
      default: '',
    },
    contenido: {
      type: String,
      default: '',
    },
  },
  emits: ['cerrar'],
  setup(_, { emit }) {
    const cerrar = () => {
      emit('cerrar');
    };

    return {
      cerrar,
    };
  },
});
</script>

<style lang="stylus" scoped>
.panel-informacion
  position absolute
  top 16px
  right 16px
  width 320px
  max-width calc(100% - 32px)
  background rgba(0, 0, 0, 0.85)
  color #fff
  border-radius 8px
  overflow hidden
  z-index 100
  backdrop-filter blur(4px)

.panel-header
  display flex
  justify-content space-between
  align-items center
  padding 12px 16px
  border-bottom 1px solid rgba(255, 255, 255, 0.1)

.panel-titulo
  margin 0
  font-size 18px
  font-weight 600

.panel-cerrar
  background none
  border none
  color #fff
  font-size 24px
  line-height 1
  cursor pointer
  padding 0
  width 32px
  height 32px
  display flex
  align-items center
  justify-content center
  border-radius 4px
  transition background 0.2s

  &:hover
    background rgba(255, 255, 255, 0.15)

.panel-contenido
  padding 16px
  font-size 14px
  line-height 1.6
</style>
