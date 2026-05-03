import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PanelInformacion from '@/components/VisorEsferico/PanelInformacion.vue';

describe('PanelInformacion', () => {
  it('debe renderizar cuando es visible', () => {
    const wrapper = mount(PanelInformacion, {
      props: {
        visible: true,
        titulo: 'Título de prueba',
        contenido: 'Contenido de prueba',
      },
    });

    expect(wrapper.find('.panel-informacion').exists()).toBe(true);
    expect(wrapper.find('.panel-titulo').text()).toBe('Título de prueba');
    expect(wrapper.find('.panel-contenido p').text()).toBe('Contenido de prueba');
  });

  it('no debe renderizar cuando no es visible', () => {
    const wrapper = mount(PanelInformacion, {
      props: {
        visible: false,
        titulo: 'Título',
      },
    });

    expect(wrapper.find('.panel-informacion').exists()).toBe(false);
  });

  it('debe emitir cerrar al hacer click en el botón', async () => {
    const wrapper = mount(PanelInformacion, {
      props: {
        visible: true,
        titulo: 'Título',
      },
    });

    await wrapper.find('.panel-cerrar').trigger('click');
    expect(wrapper.emitted('cerrar')).toBeTruthy();
  });

  it('debe tener aria-label en el botón de cierre', () => {
    const wrapper = mount(PanelInformacion, {
      props: {
        visible: true,
        titulo: 'Título',
      },
    });

    expect(wrapper.find('.panel-cerrar').attributes('aria-label')).toBe('Cerrar panel');
  });
});
