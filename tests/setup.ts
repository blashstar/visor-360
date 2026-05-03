import { config } from '@vue/test-utils';
import { beforeEach, vi } from 'vitest';

// Mock de Three.js
vi.mock('three', () => ({
  Scene: class Scene {
    add = vi.fn();
    remove = vi.fn();
  },
  PerspectiveCamera: class PerspectiveCamera {
    fov = 75;
    aspect = 1;
    position = { set: vi.fn() };
    lookAt = vi.fn();
    updateProjectionMatrix = vi.fn();
  },
  WebGLRenderer: class WebGLRenderer {
    domElement = document.createElement('canvas');
    setSize = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
    setPixelRatio = vi.fn();
  },
  TextureLoader: class TextureLoader {
    load = vi.fn().mockReturnValue({
      colorSpace: 'SRGBColorSpace',
    });
  },
  VideoTexture: class VideoTexture {},
  SphereGeometry: class SphereGeometry {
    scale = vi.fn().mockReturnThis();
  },
  MeshBasicMaterial: class MeshBasicMaterial {
    dispose = vi.fn();
  },
  Mesh: class Mesh {
    position = { 
      set: vi.fn().mockReturnThis(), 
      clone: vi.fn().mockReturnValue({ 
        project: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
        x: 0, y: 0, z: 0
      }) 
    };
    userData = {};
  },
  OrbitControls: class OrbitControls {
    constructor() {}
    update = vi.fn();
    rotateLeft = vi.fn();
    rotateUp = vi.fn();
    dollyIn = vi.fn();
    reset = vi.fn();
    enableRotate = true;
    enableZoom = true;
  },
  Raycaster: class Raycaster {
    setFromCamera = vi.fn();
    intersectObjects = vi.fn().mockReturnValue([]);
  },
  Vector2: class Vector2 {
    x = 0;
    y = 0;
  },
  Vector3: class Vector3 {
    x = 0; y = 0; z = 0;
    constructor(x?: number, y?: number, z?: number) { this.x = x || 0; this.y = y || 0; this.z = z || 0; }
    set = vi.fn().mockReturnThis();
    clone = vi.fn().mockReturnThis();
    project = vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 });
  },
  SRGBColorSpace: 'SRGBColorSpace',
  DoubleSide: 'DoubleSide',
  LinearFilter: 'LinearFilter',
  RGBAFormat: 'RGBAFormat',
  Color: class Color {},
  MathUtils: {
    degToRad: (d: number) => (d * Math.PI) / 180,
    radToDeg: (r: number) => (r * 180) / Math.PI,
  },
}));

// Mock de Hammer.js
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

// Mock de GSAP
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn().mockReturnValue({ kill: vi.fn() }),
    killTweensOf: vi.fn(),
  },
}));



// Configuración global para @vue/test-utils
config.global.stubs = {
  transition: false,
  'esfera-360': true,
  'marcador-vue': true,
  'panel-informacion': true,
  'tooltip': true,
};
