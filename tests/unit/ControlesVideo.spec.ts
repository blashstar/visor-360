import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ControlesVideo from '@/components/VisorEsferico/ControlesVideo.vue';

describe('ControlesVideo', () => {
  it('debe renderizarse cuando es visible', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: false,
        tiempoActual: 0,
        duracion: 120,
      },
    });

    expect(wrapper.find('.controles-video').exists()).toBe(true);
  });

  it('no debe renderizarse cuando no es visible', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: false,
        reproduciendo: false,
        tiempoActual: 0,
        duracion: 120,
      },
    });

    expect(wrapper.find('.controles-video').exists()).toBe(false);
  });

  it('debe mostrar el tiempo formateado correctamente', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: true,
        tiempoActual: 65,
        duracion: 185,
      },
    });

    expect(wrapper.find('.tiempo').text()).toBe('1:05 / 3:05');
  });

  it('debe calcular el porcentaje de progreso correctamente', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: true,
        tiempoActual: 30,
        duracion: 120,
      },
    });

    const barra = wrapper.find('.barra-progreso');
    expect(barra.attributes('style')).toContain('width: 25%');
  });

  it('debe emitir "play" al hacer clic en el botón de play', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: false,
        tiempoActual: 0,
        duracion: 120,
      },
    });

    wrapper.find('button[aria-label="Reproducir"]').trigger('click');
    expect(wrapper.emitted('play')).toBeTruthy();
  });

  it('debe emitir "pause" al hacer clic en el botón de pausa', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: true,
        tiempoActual: 10,
        duracion: 120,
      },
    });

    wrapper.find('button[aria-label="Pausar"]').trigger('click');
    expect(wrapper.emitted('pause')).toBeTruthy();
  });

  it('debe emitir "reiniciar" al hacer clic en el botón de reiniciar', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: true,
        tiempoActual: 50,
        duracion: 120,
      },
    });

    wrapper.find('button[aria-label="Reiniciar"]').trigger('click');
    expect(wrapper.emitted('reiniciar')).toBeTruthy();
  });

  it('debe emitir "seek" con el tiempo correcto al hacer clic en la barra', async () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: true,
        tiempoActual: 0,
        duracion: 100,
      },
    });

    const barra = wrapper.find('.barra-tiempo');
    const rect = { left: 0, width: 200 };

    // Mock getBoundingClientRect
    (barra.element as HTMLElement).getBoundingClientRect = vi.fn(() => rect as DOMRect);

    await barra.trigger('click', { clientX: 50 });

    expect(wrapper.emitted('seek')).toBeTruthy();
    expect(wrapper.emitted('seek')?.[0]).toEqual([25]);
  });

  it('debe emitir "toggle-mute" al hacer clic en el botón de mute', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: true,
        tiempoActual: 10,
        duracion: 120,
        muteado: false,
        volumen: 0.8,
      },
    });

    wrapper.find('button[aria-label="Silenciar"]').trigger('click');
    expect(wrapper.emitted('toggle-mute')).toBeTruthy();
  });

  it('debe mostrar icono de muteado cuando está muteado', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: true,
        tiempoActual: 10,
        duracion: 120,
        muteado: true,
        volumen: 0.5,
      },
    });

    expect(wrapper.find('button[aria-label="Activar sonido"]').exists()).toBe(true);
  });

  it('debe emitir "cambiar-volumen" al hacer clic en la barra de volumen', async () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: true,
        tiempoActual: 0,
        duracion: 100,
        muteado: false,
        volumen: 0.5,
      },
    });

    const barra = wrapper.find('.barra-volumen');
    const rect = { left: 0, width: 60 };

    (barra.element as HTMLElement).getBoundingClientRect = vi.fn(() => rect as DOMRect);

    await barra.trigger('click', { clientX: 30 });

    expect(wrapper.emitted('cambiar-volumen')).toBeTruthy();
    expect(wrapper.emitted('cambiar-volumen')?.[0]).toEqual([0.5]);
  });

  it('debe mostrar nivel de volumen al 0% cuando está muteado', () => {
    const wrapper = mount(ControlesVideo, {
      props: {
        visible: true,
        reproduciendo: true,
        tiempoActual: 10,
        duracion: 120,
        muteado: true,
        volumen: 0.8,
      },
    });

    const nivel = wrapper.find('.nivel-volumen');
    expect(nivel.attributes('style')).toContain('width: 0%');
  });
});
