import { gsap } from 'gsap';

/**
 * Utilidades de animación basadas en GSAP para el visor esférico 360°.
 */

/**
 * Normaliza un ángulo yaw a [-π, π].
 * @param yaw - Ángulo en radianes.
 * @returns Ángulo normalizado.
 */
export const normalizarYaw = (yaw: number): number => {
  let y = yaw % (2 * Math.PI);
  if (y > Math.PI) y -= 2 * Math.PI;
  if (y < -Math.PI) y += 2 * Math.PI;
  return y;
};

/**
 * Calcula la diferencia angular más corta entre dos ángulos.
 * @param actual - Ángulo actual.
 * @param objetivo - Ángulo objetivo.
 * @returns Diferencia en radianes.
 */
export const diferenciaAngular = (actual: number, objetivo: number): number => {
  const diff = objetivo - actual;
  if (diff > Math.PI) return diff - 2 * Math.PI;
  if (diff < -Math.PI) return diff + 2 * Math.PI;
  return diff;
};

/**
 * Objeto intercambiable para animar valores numéricos con GSAP.
 * Útil para animar yaw, pitch, zoom, etc. sin tocar refs de Vue.
 */
export interface ObjetoAnimable {
  [key: string]: number;
}

/**
 * Anima propiedades numéricas de un objeto con GSAP.
 * @param obj - Objeto con propiedades numéricas.
 * @param destino - Valores destino.
 * @param duracion - Duración en segundos (default: 0.8).
 * @param ease - Easing de GSAP (default: 'power2.inOut').
 * @param onUpdate - Callback en cada frame.
 * @param onComplete - Callback al completar.
 * @returns Instancia del tween GSAP.
 */
export const animarValores = (
  obj: ObjetoAnimable,
  destino: ObjetoAnimable,
  duracion = 0.8,
  ease = 'power2.inOut',
  onUpdate?: () => void,
  onComplete?: () => void
): gsap.core.Tween => {
  return gsap.to(obj, {
    ...destino,
    duration: duracion,
    ease,
    onUpdate,
    onComplete,
  });
};

/**
 * Mata todos los tweens activos asociados a un objeto.
 * @param obj - Objeto animado.
 */
export const matarAnimaciones = (obj: ObjetoAnimable): void => {
  gsap.killTweensOf(obj);
};

/**
 * Easing recomendados para el visor.
 */
export const EasingVisor = {
  /** Easing suave para animaciones de cámara. */
  suave: 'power2.inOut',
  /** Easing para inercia (desaceleración). */
  inercia: 'power3.out',
  /** Easing elástico para efectos de rebote. */
  rebote: 'back.out(1.2)',
  /** Easing lineal. */
  lineal: 'none',
} as const;
