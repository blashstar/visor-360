import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Tooltip from '@/components/VisorEsferico/Tooltip.vue';
import type { TooltipConfig } from '@/components/VisorEsferico/tipos';

describe('Tooltip', () => {
  const configMock: TooltipConfig = {
    contenido: 'Texto de ayuda',
    posicion: 'top center',
    trigger: 'hover',
  };

  it('debe renderizar el contenido del tooltip', () => {
    const wrapper = mount(Tooltip, {
      props: {
        config: configMock,
        activo: true,
      },
    });

    expect(wrapper.find('.tooltip-contenido').text()).toBe('Texto de ayuda');
  });

  it('debe estar visible cuando activo es true', () => {
    const wrapper = mount(Tooltip, {
      props: {
        config: configMock,
        activo: true,
      },
    });

    expect(wrapper.find('.tooltip-marcador').classes()).toContain('tooltip--visible');
  });

  it('no debe estar visible cuando activo es false', () => {
    const wrapper = mount(Tooltip, {
      props: {
        config: configMock,
        activo: false,
      },
    });

    expect(wrapper.find('.tooltip-marcador').classes()).not.toContain('tooltip--visible');
  });

  it('debe aplicar clase personalizada', () => {
    const wrapper = mount(Tooltip, {
      props: {
        config: { ...configMock, clase: 'mi-tooltip' },
        activo: true,
      },
    });

    expect(wrapper.find('.tooltip-marcador').classes()).toContain('mi-tooltip');
  });
});
