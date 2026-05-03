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
 *
 * DISEÑO:
 * - touchAction: 'none' es obligatorio para que el navegador NO intercepte
 *   gestos táctiles (scroll, zoom nativo). Sin esto, el visor no responde
 *   al pan en móviles porque el browser roba el evento para scroll de página.
 * - Los deltas de pan son INCREMENTALES (no acumulados): ev.deltaX es
 *   acumulado desde panstart, pero Three.js necesita el delta por frame
 *   para una rotación proporcional al movimiento del dedo.
 * - El pinch usa delta relativo (ev.scale - escala anterior) para que
 *   el zoom responda a la velocidad del gesto, no a la distancia absoluta.
 *
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

  // Doble tap requiere que el tap simple falle primero:
  // sin esta configuración, un doble tap dispara DOS eventos 'tap' + uno 'doubletap',
  // causando que el visor seleccione un marcador y luego resetee la vista.
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
    // ev.deltaX es acumulado desde panstart; restamos el último valor
    // para obtener el desplazamiento de ESTE frame únicamente.
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
    // Delta relativo: solo importa cuánto cambió la escala desde el último frame,
    // no la escala absoluta desde el inicio del gesto.
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
