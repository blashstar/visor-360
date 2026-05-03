import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MarcadorVue from '@/components/VisorEsferico/Marcador.vue';
import type { Marcador, PosicionPantalla } from '@/components/VisorEsferico/tipos';

describe('MarcadorVue', () => {
  const marcadorMock: Marcador = {
    id: '1',
    posicion: { u: 0.5, v: 0.5 },
    titulo: 'Test',
    accion: 'mostrar_panel',
    estilo: { color: '#ff0000', tamano: 20 },
    tooltip: { contenido: 'Ayuda', trigger: 'hover' },
  };

  const posicionMock: PosicionPantalla = { x: 100, y: 200, visible: true };

  it('debe renderizar cuando está visible', () => {
    const wrapper = mount(MarcadorVue, {
      props: {
        marcador: marcadorMock,
        posicionPantalla: posicionMock,
      },
    });

    expect(wrapper.find('.marcador-contenedor').exists()).toBe(true);
  });

  it('no debe renderizar cuando no está visible', () => {
    const wrapper = mount(MarcadorVue, {
      props: {
        marcador: marcadorMock,
        posicionPantalla: { ...posicionMock, visible: false },
      },
    });

    expect(wrapper.find('.marcador-contenedor').exists()).toBe(false);
  });

  it('debe emitir seleccionar al hacer click', async () => {
    const wrapper = mount(MarcadorVue, {
      props: {
        marcador: marcadorMock,
        posicionPantalla: posicionMock,
      },
    });

    await wrapper.find('.marcador-contenedor').trigger('click');
    expect(wrapper.emitted('seleccionar')).toBeTruthy();
    expect(wrapper.emitted('seleccionar')?.[0]).toEqual([false]);
  });

  it('debe emitir seleccionar con dobleClick al hacer dblclick', async () => {
    const wrapper = mount(MarcadorVue, {
      props: {
        marcador: marcadorMock,
        posicionPantalla: posicionMock,
      },
    });

    await wrapper.find('.marcador-contenedor').trigger('dblclick');
    expect(wrapper.emitted('seleccionar')).toBeTruthy();
    expect(wrapper.emitted('seleccionar')?.[0]).toEqual([true]);
  });

  it('debe mostrar tooltip cuando tiene configuración', () => {
    const wrapper = mount(MarcadorVue, {
      props: {
        marcador: marcadorMock,
        posicionPantalla: posicionMock,
      },
    });

    expect(wrapper.findComponent({ name: 'Tooltip' }).exists()).toBe(true);
  });
});
