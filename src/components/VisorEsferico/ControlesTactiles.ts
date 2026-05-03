import Hammer from 'hammerjs';

export interface ConfiguracionTactil {
  contenedor: HTMLElement;
  alTap: (x: number, y: number) => void;
  alDobleTap: () => void;
  alPan: (deltaX: number, deltaY: number) => void;
  alPanEnd: (velocidadX: number, velocidadY: number) => void;
  alPinch: (escala: number) => void;
  alPinchEnd: () => void;
}

/**
 * Configura controles táctiles para el visor usando Hammer.js.
 * @param config - Configuración de controles táctiles.
 * @returns Instancia de HammerManager.
 */
export const configurarControlesTactiles = (
  config: ConfiguracionTactil
): HammerManager => {
  const { contenedor } = config;

  const hammer = new Hammer(contenedor, {
    touchAction: 'none',
    recognizers: [
      [Hammer.Tap, { event: 'tap', taps: 1 }],
      [Hammer.Tap, { event: 'doubletap', taps: 2 }],
      [Hammer.Pan, { direction: Hammer.DIRECTION_ALL, threshold: 5 }],
      [Hammer.Pinch, { enable: true }],
    ],
  });

  // Doble tap requiere que el tap simple falle primero
  hammer.get('doubletap').recognizeWith('tap');
  hammer.get('tap').requireFailure('doubletap');

  let estaPinchando = false;
  let distanciaPinchInicial = 0;
  let ultimoPanX = 0;
  let ultimoPanY = 0;

  hammer.on('tap', (ev) => {
    config.alTap(ev.center.x, ev.center.y);
  });

  hammer.on('doubletap', () => {
    config.alDobleTap();
  });

  hammer.on('panstart', () => {
    estaPinchando = false;
    ultimoPanX = 0;
    ultimoPanY = 0;
  });

  hammer.on('panmove', (ev) => {
    if (estaPinchando) return;
    // Enviar delta incremental (píxeles crudos) para evitar acumulación doble
    const dx = ev.deltaX - ultimoPanX;
    const dy = ev.deltaY - ultimoPanY;
    config.alPan(dx, dy);
    ultimoPanX = ev.deltaX;
    ultimoPanY = ev.deltaY;
  });

  hammer.on('panend', (ev) => {
    config.alPanEnd(ev.velocityX, ev.velocityY);
  });

  hammer.on('pinchstart', (ev) => {
    estaPinchando = true;
    distanciaPinchInicial = ev.scale;
  });

  hammer.on('pinchmove', (ev) => {
    const delta = ev.scale - distanciaPinchInicial;
    config.alPinch(delta);
    distanciaPinchInicial = ev.scale;
  });

  hammer.on('pinchend', () => {
    estaPinchando = false;
    config.alPinchEnd();
  });

  return hammer;
};
