import type { ConfiguracionVideo } from '@/components/VisorEsferico/tipos';
import * as THREE from 'three';

/**
 * Carga una textura de imagen para Three.js.
 * @param url - URL de la imagen.
 * @returns Promesa que resuelve con la textura.
 */
export const cargarTexturaImagen = (url: string): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    const textura = new THREE.TextureLoader().load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error('Error al cargar la imagen:', error);
        reject(error);
      }
    );
  });
};

/**
 * Carga una textura de vídeo para Three.js.
 * El vídeo se reproduce automáticamente al estar listo.
 * @param url - URL del vídeo.
 * @param autoReproducir - Si el vídeo debe autoplay.
 * @returns Promesa que resuelve con la textura de vídeo.
 */
export const cargarTexturaVideo = (
  url: string,
  autoReproducir: boolean = true,
  config?: ConfiguracionVideo
): Promise<THREE.VideoTexture> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = url;
    video.loop = config?.bucle ?? true;
    video.muted = config?.muteadoInicial ?? true;
    video.volume = Math.max(0, Math.min(1, config?.volumenInicial ?? 1));
    video.currentTime = Math.max(0, config?.tiempoInicial ?? 0);
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.crossOrigin = 'anonymous';
    video.autoplay = autoReproducir;

    // iOS Safari requiere que el video esté en el DOM para texturizarlo en WebGL
    video.style.display = 'none';
    video.style.position = 'absolute';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);

    // Escuchar eventos de error
    video.addEventListener('error', (e) => {
      console.error('Error al cargar el vídeo:', e);
      reject(new Error(`No se pudo cargar el vídeo: ${url}`));
    });

    // Escuchar cuando el vídeo está listo
    video.addEventListener('canplay', () => {
      const textura = new THREE.VideoTexture(video);
      textura.colorSpace = THREE.SRGBColorSpace;
      textura.minFilter = THREE.LinearFilter;
      textura.magFilter = THREE.LinearFilter;
      textura.format = THREE.RGBAFormat;

      // Reproducir explícitamente si autoReproducir está activo
      if (autoReproducir) {
        video.play().catch((err) => {
          console.warn('No se pudo iniciar la reproducción automática:', err);
        });
      }

      resolve(textura);
    });

    // Iniciar carga
    video.load();
  });
};
