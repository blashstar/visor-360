import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VisorEsferico from '@/components/VisorEsferico/VisorEsferico.vue';
import type { Marcador, Escena } from '@/components/VisorEsferico/tipos';

describe('VisorEsferico', () => {
  const imagenMock = '/ejemplos/malla.png';
  const videoMock = '/ejemplos/video_360_SD.mp4';
  const marcadoresMock: Marcador[] = [
    {
      id: '1',
      posicion: { u: 0.5, v: 0.5 },
      titulo: 'Primer marcador',
      contenido: 'Contenido del primer marcador',
      accion: 'mostrar_panel',
      tooltip: { contenido: 'Tooltip 1', trigger: 'hover' },
    },
    {
      id: '2',
      posicion: { yaw: 1.2, pitch: 0 },
      titulo: 'Cambiar a vídeo',
      url: videoMock,
      tipoMedio: 'video',
      accion: 'cambiar_contenido',
    },
    {
      id: '3',
      posicion: { u: 0.25, v: 0.75 },
      titulo: 'Sitio web',
      url: 'https://ejemplo.com',
      accion: 'navegar',
    },
    {
      id: '4',
      posicion: { u: 0.8, v: 0.5 },
      titulo: 'Ir a cocina',
      escenaDestino: 'cocina',
      accion: 'cambiar_escena',
    },
  ];

  const escenasMock: Escena[] = [
    {
      id: 'sala',
      titulo: 'Sala de estar',
      descripcion: 'Una acogedora sala con vista panorámica',
      previo: '/ejemplos/sala_previo.jpg',
      medio: imagenMock,
      tipoMedio: 'imagen',
      marcadores: [marcadoresMock[0], marcadoresMock[3]],
      posicionInicial: { yaw: 0, pitch: 0 },
      zoomInicial: 50,
    },
    {
      id: 'cocina',
      titulo: 'Cocina moderna',
      descripcion: 'Cocina equipada con electrodomésticos de última generación',
      previo: '/ejemplos/cocina_previo.jpg',
      medio: imagenMock,
      tipoMedio: 'imagen',
      marcadores: [marcadoresMock[1]],
      posicionInicial: { yaw: 1.5, pitch: 0 },
      zoomInicial: 60,
    },
    {
      id: 'video',
      titulo: 'Recorrido virtual',
      descripcion: 'Video panorámico del recorrido completo',
      medio: videoMock,
      tipoMedio: 'video',
      marcadores: [marcadoresMock[2]],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizarse correctamente con props por defecto', () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        medioInicial: imagenMock,
        tipoMedioInicial: 'imagen',
      },
    });

    expect(wrapper.find('.visor-esferico').exists()).toBe(true);
    expect(wrapper.props('medioInicial')).toBe(imagenMock);
    expect(wrapper.props('tipoMedioInicial')).toBe('imagen');
  });

  it('debe funcionar en modo escenas', () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        escenas: escenasMock,
        escenaInicial: 'cocina',
      },
    });

    expect(wrapper.find('.visor-esferico').exists()).toBe(true);
    expect(wrapper.vm.obtenerEscenaActual()?.id).toBe('cocina');
    expect(wrapper.vm.obtenerIndiceEscena()).toBe(1);
  });

  it('debe cambiar de escena con cargarEscena', async () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        escenas: escenasMock,
        escenaInicial: 'sala',
      },
    });

    wrapper.vm.cargarEscena('video');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('escena-cambiada')).toBeTruthy();
    expect(wrapper.vm.obtenerEscenaActual()?.id).toBe('video');
  });

  it('debe navegar entre escenas con escenaSiguiente y escenaAnterior', () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        escenas: escenasMock,
        escenaInicial: 'sala',
      },
    });

    expect(wrapper.vm.obtenerIndiceEscena()).toBe(0);

    wrapper.vm.escenaSiguiente();
    expect(wrapper.vm.obtenerEscenaActual()?.id).toBe('cocina');

    wrapper.vm.escenaSiguiente();
    expect(wrapper.vm.obtenerEscenaActual()?.id).toBe('video');

    wrapper.vm.escenaSiguiente();
    expect(wrapper.vm.obtenerEscenaActual()?.id).toBe('sala'); // ciclo

    wrapper.vm.escenaAnterior();
    expect(wrapper.vm.obtenerEscenaActual()?.id).toBe('video');
  });

  it('debe emitir evento al seleccionar un marcador con acción "mostrar_panel"', async () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        medioInicial: imagenMock,
        tipoMedioInicial: 'imagen',
        marcadoresIniciales: marcadoresMock,
      },
    });

    await wrapper.findComponent({ name: 'Esfera360' }).vm.$emit('marcador-seleccionado', {
      marcador: marcadoresMock[0],
    });

    expect(wrapper.emitted('marcador-seleccionado')).toBeTruthy();
    expect(wrapper.emitted('marcador-seleccionado')?.[0]).toEqual([{ marcador: marcadoresMock[0] }]);
  });

  it('debe cambiar el medio al seleccionar un marcador con acción "cambiar_contenido"', async () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        medioInicial: imagenMock,
        tipoMedioInicial: 'imagen',
        marcadoresIniciales: marcadoresMock,
      },
    });

    await wrapper.findComponent({ name: 'Esfera360' }).vm.$emit('marcador-seleccionado', {
      marcador: marcadoresMock[1],
    });

    expect(wrapper.emitted('medio-cambiado')).toBeTruthy();
    expect(wrapper.emitted('medio-cambiado')?.[0]).toEqual([
      { url: videoMock, tipoMedio: 'video' },
    ]);
  });

  it('debe navegar a una URL al seleccionar un marcador con acción "navegar"', async () => {
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const wrapper = mount(VisorEsferico, {
      props: {
        medioInicial: imagenMock,
        tipoMedioInicial: 'imagen',
        marcadoresIniciales: marcadoresMock,
      },
    });

    await wrapper.findComponent({ name: 'Esfera360' }).vm.$emit('marcador-seleccionado', {
      marcador: marcadoresMock[2],
    });

    expect(windowSpy).toHaveBeenCalledWith('https://ejemplo.com', '_blank');
    windowSpy.mockRestore();
  });

  it('debe cambiar de escena al seleccionar un marcador con acción "cambiar_escena"', async () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        escenas: escenasMock,
        escenaInicial: 'sala',
      },
    });

    expect(wrapper.vm.obtenerEscenaActual()?.id).toBe('sala');

    await wrapper.findComponent({ name: 'Esfera360' }).vm.$emit('marcador-seleccionado', {
      marcador: marcadoresMock[3],
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('escena-cambiada')).toBeTruthy();
    expect(wrapper.vm.obtenerEscenaActual()?.id).toBe('cocina');
  });

  it('debe incluir titulo, descripcion y previo en la escena actual', () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        escenas: escenasMock,
        escenaInicial: 'sala',
      },
    });

    const escena = wrapper.vm.obtenerEscenaActual();
    expect(escena?.titulo).toBe('Sala de estar');
    expect(escena?.descripcion).toBe('Una acogedora sala con vista panorámica');
    expect(escena?.previo).toBe('/ejemplos/sala_previo.jpg');
  });

  it('debe exponer API programática via template ref', () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        medioInicial: imagenMock,
        tipoMedioInicial: 'imagen',
      },
    });

    const api = wrapper.vm;
    expect(typeof api.rotarA).toBe('function');
    expect(typeof api.zoomA).toBe('function');
    expect(typeof api.irAMarcador).toBe('function');
    expect(typeof api.agregarMarcador).toBe('function');
    expect(typeof api.eliminarMarcador).toBe('function');
    expect(typeof api.actualizarMarcador).toBe('function');
    expect(typeof api.limpiarMarcadores).toBe('function');
    expect(typeof api.resetearVista).toBe('function');
    expect(typeof api.obtenerEstado).toBe('function');
    expect(typeof api.cargarEscena).toBe('function');
    expect(typeof api.escenaSiguiente).toBe('function');
    expect(typeof api.escenaAnterior).toBe('function');
  });

  it('debe agregar un marcador dinámicamente', async () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        medioInicial: imagenMock,
        tipoMedioInicial: 'imagen',
        marcadoresIniciales: [],
      },
    });

    const nuevoMarcador: Marcador = {
      id: 'nuevo',
      posicion: { u: 0.5, v: 0.5 },
      titulo: 'Nuevo',
      accion: 'mostrar_panel',
    };

    wrapper.vm.agregarMarcador(nuevoMarcador);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('marcador-agregado')).toBeTruthy();
  });

  it('debe eliminar un marcador por id', async () => {
    const wrapper = mount(VisorEsferico, {
      props: {
        medioInicial: imagenMock,
        tipoMedioInicial: 'imagen',
        marcadoresIniciales: marcadoresMock,
      },
    });

    wrapper.vm.eliminarMarcador('1');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('marcador-eliminado')).toBeTruthy();
    expect(wrapper.emitted('marcador-eliminado')?.[0]).toEqual([{ id: '1' }]);
  });
});
