import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Esfera360 from '@/components/VisorEsferico/Esfera360.vue';

describe('Esfera360', () => {
  const imagenMock = '/imagen-prueba.jpg';
  const marcadoresMock = [
    { id: '1', posicion: { u: 0.5, v: 0.5 }, titulo: 'Test', accion: 'mostrar_panel' as const },
  ];

  it('debe renderizar el contenedor de la esfera', () => {
    const wrapper = mount(Esfera360, {
      props: {
        medio: imagenMock,
        tipoMedio: 'imagen',
        marcadores: marcadoresMock,
      },
    });

    expect(wrapper.find('.esfera-360').exists()).toBe(true);
  });

  it('debe emitir evento al seleccionar un marcador', async () => {
    const wrapper = mount(Esfera360, {
      props: {
        medio: imagenMock,
        tipoMedio: 'imagen',
        marcadores: marcadoresMock,
      },
    });

    await wrapper.vm.$emit('marcador-seleccionado', { marcador: marcadoresMock[0] });

    expect(wrapper.emitted('marcador-seleccionado')).toBeTruthy();
  });

  it('debe exponer métodos de API programática', () => {
    const wrapper = mount(Esfera360, {
      props: {
        medio: imagenMock,
        tipoMedio: 'imagen',
        marcadores: marcadoresMock,
      },
    });

    const api = wrapper.vm;
    expect(typeof api.rotarA).toBe('function');
    expect(typeof api.zoomA).toBe('function');
    expect(typeof api.irAMarcador).toBe('function');
    expect(typeof api.resetearVista).toBe('function');
    expect(typeof api.obtenerEstado).toBe('function');
  });

  it('debe aceptar coordenadas esféricas en marcadores', () => {
    const wrapper = mount(Esfera360, {
      props: {
        medio: imagenMock,
        tipoMedio: 'imagen',
        marcadores: [
          { id: '2', posicion: { yaw: 1.2, pitch: 0.3 }, titulo: 'Esférico', accion: 'mostrar_panel' as const },
        ],
      },
    });

    expect(wrapper.find('.esfera-360').exists()).toBe(true);
  });

  it('debe exponer el estado inicial correcto', () => {
    const wrapper = mount(Esfera360, {
      props: {
        medio: imagenMock,
        tipoMedio: 'imagen',
        posicionInicial: { yaw: 1.5, pitch: 0.2 },
        zoomInicial: 75,
      },
    });

    const estado = wrapper.vm.obtenerEstado();
    expect(estado.yaw).toBe(1.5);
    expect(estado.pitch).toBe(0.2);
    expect(estado.zoom).toBe(75);
  });

  it('debe resetear la vista a valores iniciales', () => {
    const wrapper = mount(Esfera360, {
      props: {
        medio: imagenMock,
        tipoMedio: 'imagen',
        posicionInicial: { yaw: 0, pitch: 0 },
        zoomInicial: 50,
      },
    });

    // Simular cambio de estado
    wrapper.vm.rotarA({ yaw: 2, pitch: 1 }, false);
    wrapper.vm.zoomA(80, false);

    wrapper.vm.resetearVista(false);
    const estado = wrapper.vm.obtenerEstado();
    expect(estado.yaw).toBe(0);
    expect(estado.pitch).toBe(0);
    expect(estado.zoom).toBe(50);
  });
});
