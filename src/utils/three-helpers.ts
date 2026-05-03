import * as THREE from 'three';
import { CoordenadaTextura, CoordenadaEsferica } from '../components/VisorEsferico/tipos';

/**
 * Convierte coordenadas de textura (u, v) a cartesianas para Three.js.
 * @param coordenada - Coordenadas de textura (u, v) en rango 0..1.
 * @param radio - Radio de la esfera (default: 500).
 * @returns Vector3 con coordenadas cartesianas.
 */
export const texturaACartesiano = (
  coordenada: CoordenadaTextura,
  radio: number = 500
): THREE.Vector3 => {
  const theta = coordenada.u * 2 * Math.PI;
  const phi = coordenada.v * Math.PI;

  const x = radio * Math.sin(phi) * Math.cos(theta);
  const y = radio * Math.cos(phi);
  const z = radio * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};

/**
 * Convierte coordenadas esféricas (yaw, pitch) a cartesianas para Three.js.
 * @param coordenada - Coordenadas esféricas (yaw, pitch).
 * @param radio - Radio de la esfera (default: 500).
 * @returns Vector3 con coordenadas cartesianas.
 */
export const esfericaACartesiano = (
  coordenada: CoordenadaEsferica,
  radio: number = 500
): THREE.Vector3 => {
  const x = radio * Math.cos(coordenada.pitch) * Math.sin(coordenada.yaw);
  const y = radio * Math.sin(coordenada.pitch);
  const z = radio * Math.cos(coordenada.pitch) * Math.cos(coordenada.yaw);
  return new THREE.Vector3(x, y, z);
};

/**
 * Determina si una posición es coordenada de textura.
 */
export const esCoordenadaTextura = (
  posicion: CoordenadaTextura | CoordenadaEsferica
): posicion is CoordenadaTextura => 'u' in posicion && 'v' in posicion;

/**
 * Convierte cualquier posición de marcador a cartesianas.
 */
export const posicionACartesiano = (
  posicion: CoordenadaTextura | CoordenadaEsferica,
  radio: number = 500
): THREE.Vector3 => {
  if (esCoordenadaTextura(posicion)) {
    return texturaACartesiano(posicion, radio);
  }
  return esfericaACartesiano(posicion, radio);
};

/**
 * Convierte coordenadas esféricas (yaw, pitch) a coordenadas de textura (u, v).
 * @param esferica - Coordenadas esféricas.
 * @returns Coordenadas de textura normalizadas.
 */
export const esfericaATextura = (
  esferica: CoordenadaEsferica
): CoordenadaTextura => {
  let u = esferica.yaw / (2 * Math.PI);
  if (u < 0) u += 1;
  const v = (esferica.pitch + Math.PI / 2) / Math.PI;
  return { u: Math.max(0, Math.min(1, u)), v: Math.max(0, Math.min(1, v)) };
};

/**
 * Crea un marcador 3D en la esfera.
 * @param escena - Escena de Three.js.
 * @param coordenada - Coordenadas de textura (u, v) o esféricas del marcador.
 * @param estilo - Estilo del marcador (color, tamaño, ícono).
 * @returns Mesh del marcador.
 */
export const crearMarcador3D = (
  escena: THREE.Scene,
  coordenada: CoordenadaTextura | CoordenadaEsferica,
  estilo: {
    color?: string;
    tamano?: number;
    icono?: string;
  } = {}
): THREE.Mesh => {
  const radio = 500;
  const tamano = estilo.tamano || 12;
  const color = estilo.color || '#ff0000';

  // Geometría del marcador (esfera o plano para ícono)
  const geometria = new THREE.SphereGeometry(tamano, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
  const marcador = new THREE.Mesh(geometria, material);

  // Posicionar en la esfera
  const posicion = posicionACartesiano(coordenada, radio);
  marcador.position.set(posicion.x, posicion.y, posicion.z);

  // Si hay ícono, cargarlo como textura
  if (estilo.icono) {
    const textura = new THREE.TextureLoader().load(estilo.icono);
    material.map = textura;
    material.needsUpdate = true;
  }

  escena.add(marcador);
  return marcador;
};
