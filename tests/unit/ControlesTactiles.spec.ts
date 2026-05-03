import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configurarControlesTactiles } from '@/components/VisorEsferico/ControlesTactiles';
import Hammer from 'hammerjs';

vi.mock('hammerjs', () => {
  return {
    default: class Hammer {
      constructor() {}
      on = vi.fn();
      get = vi.fn().mockReturnValue({ recognizeWith: vi.fn(), requireFailure: vi.fn() });
      destroy = vi.fn();
      recognizers = [];
    },
  };
});

describe('ControlesTactiles', () => {
  let contenedor: HTMLElement;
  const mocks = {
    alTap: vi.fn(),
    alDobleTap: vi.fn(),
    alPan: vi.fn(),
    alPanEnd: vi.fn(),
    alPinch: vi.fn(),
    alPinchEnd: vi.fn(),
  };

  beforeEach(() => {
    contenedor = document.createElement('div');
    vi.clearAllMocks();
  });

  it('debe configurar controles táctiles correctamente', () => {
    const hammer = configurarControlesTactiles({
      contenedor,
      ...mocks,
      sensibilidadRotacion: 1,
      sensibilidadZoom: 1,
    });

    expect(hammer).toBeInstanceOf(Hammer);
  });

  it('debe manejar el evento tap', () => {
    const hammer = configurarControlesTactiles({
      contenedor,
      ...mocks,
    });

    const callbacks = (hammer as any).on.mock.calls;
    const tapCallback = callbacks.find((call: any) => call[0] === 'tap')?.[1];

    tapCallback?.({ center: { x: 100, y: 200 } });
    expect(mocks.alTap).toHaveBeenCalledWith(100, 200);
  });

  it('debe manejar el evento doubletap', () => {
    const hammer = configurarControlesTactiles({
      contenedor,
      ...mocks,
    });

    const callbacks = (hammer as any).on.mock.calls;
    const doubleTapCallback = callbacks.find((call: any) => call[0] === 'doubletap')?.[1];

    doubleTapCallback?.();
    expect(mocks.alDobleTap).toHaveBeenCalled();
  });

  it('debe manejar el evento panmove', () => {
    const hammer = configurarControlesTactiles({
      contenedor,
      ...mocks,
      sensibilidadRotacion: 1,
    });

    const callbacks = (hammer as any).on.mock.calls;
    const panMoveCallback = callbacks.find((call: any) => call[0] === 'panmove')?.[1];

    panMoveCallback?.({ deltaX: 50, deltaY: 30 });
    expect(mocks.alPan).toHaveBeenCalled();
  });

  it('debe manejar el evento pinchmove', () => {
    const hammer = configurarControlesTactiles({
      contenedor,
      ...mocks,
      sensibilidadZoom: 1,
    });

    const callbacks = (hammer as any).on.mock.calls;
    const pinchMoveCallback = callbacks.find((call: any) => call[0] === 'pinchmove')?.[1];

    pinchMoveCallback?.({ scale: 1.5 });
    expect(mocks.alPinch).toHaveBeenCalled();
  });
});
