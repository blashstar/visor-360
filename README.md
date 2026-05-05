# Visor Esférico 360°

[![npm version](https://img.shields.io/npm/v/@blashstar/vue-360.svg)](https://www.npmjs.com/package/@blashstar/vue-360)

Componente Vue 3 para visualización panorámica esférica 360°. Soporta imágenes equirectangulares y vídeos 360° con controles de mouse, táctiles y teclado, marcadores interactivos, navegación por escenas y animaciones suaves mediante GSAP.

## Características

- 🖼️ **Imágenes y vídeos 360°** — Renderizado esférico con Three.js
- 🎬 **Controles de vídeo integrados** — Play/pause, seek, volumen, mute
- 📍 **Marcadores interactivos** — DOM y 3D, con tooltips y acciones (panel, navegación, cambio de escena)
- 🎞️ **Sistema de escenas** — Navega entre panoramas con transiciones suaves
- 📱 **Táctil y móvil** — Pinch-to-zoom, pan con inercia, compatible con iOS Safari
- ⌨️ **Teclado** — Flechas para rotar, `+`/`-` para zoom
- 🎨 **Personalizable** — Pug + Stylus, props de sensibilidad y estilo
- 🔷 **TypeScript** — Tipado estricto, declaraciones `.d.ts` incluidas

## Instalación

```bash
npm install @blashstar/vue-360
```

### Dependencias peer

El paquete requiere que el consumidor instale:

```bash
npm install vue@^3.4.0 three@^0.160.0 hammerjs@^2.0.8 gsap@^3.15.0
```

## Uso básico

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { VisorEsferico } from '@blashstar/vue-360';
import type { ApiVisorEsferico, Escena } from '@blashstar/vue-360';

const visorRef = ref<ApiVisorEsferico | null>(null);

const escenas: Escena[] = [
  {
    id: 'sala',
    titulo: 'Sala de estar',
    medio: '/panoramas/sala.jpg',
    tipoMedio: 'imagen',
    posicionInicial: { yaw: 0, pitch: 0 },
    zoomInicial: 50,
    marcadores: [
      {
        id: 'cocina',
        posicion: { u: 0.5, v: 0.5 },
        titulo: 'Ir a la cocina',
        accion: 'cambiar_escena',
        escenaDestino: 'cocina',
        tipo: 'dom',
        tooltip: { contenido: 'Cocina', trigger: 'hover' },
      },
    ],
  },
  {
    id: 'cocina',
    titulo: 'Cocina',
    medio: '/panoramas/cocina.jpg',
    tipoMedio: 'imagen',
    posicionInicial: { yaw: 1.2, pitch: 0 },
    zoomInicial: 60,
  },
];
</script>

<template>
  <VisorEsferico
    ref="visorRef"
    :escenas="escenas"
    escena-inicial="sala"
    :auto-reproducir="true"
    :controles-tactiles="true"
    :teclado-habilitado="true"
    @marcador-seleccionado="console.log"
    @escena-cambiada="console.log"
  />
</template>

<style>
html, body, #app {
  margin: 0;
  height: 100%;
}
</style>
```

## Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `escenas` | `Escena[]` | `[]` | Array de escenas para modo escenas |
| `escenaInicial` | `string` | `''` | ID de la escena inicial |
| `medioInicial` | `string` | `''` | URL del medio (modo legacy sin escenas) |
| `tipoMedioInicial` | `'imagen' \| 'video'` | `'imagen'` | Tipo del medio inicial |
| `marcadoresIniciales` | `Marcador[]` | `[]` | Marcadores iniciales (modo legacy) |
| `colorFondo` | `string` | `'#000000'` | Color de fondo del canvas |
| `autoReproducir` | `boolean` | `true` | Auto-play para vídeos |
| `controlesMouse` | `boolean` | `true` | Habilitar drag con mouse |
| `controlesTactiles` | `boolean` | `true` | Habilitar gestos táctiles |
| `tecladoHabilitado` | `boolean` | `true` | Habilitar controles de teclado |
| `sensibilidadRotacion` | `number` | `1` | Multiplicador de sensibilidad de rotación |
| `sensibilidadZoom` | `number` | `1` | Multiplicador de sensibilidad de zoom |
| `posicionInicial` | `CoordenadaEsferica \| CoordenadaTextura` | `{yaw:0, pitch:0}` | Orientación inicial de la cámara (esférica o UV) |
| `zoomInicial` | `number` | `50` | Nivel de zoom inicial (0–100) |

## Sistema de escenas

Una `Escena` agrupa un medio, marcadores, posición de cámara y configuración de vídeo:

```ts
interface Escena {
  id: string;                    // Identificador único
  titulo?: string;               // Título descriptivo
  descripcion?: string;          // Descripción
  previo?: string;               // URL de thumbnail
  medio: string;                 // URL de imagen o vídeo
  tipoMedio?: 'imagen' | 'video';
  marcadores?: Marcador[];
  posicionInicial?: CoordenadaEsferica | CoordenadaTextura;  // { yaw, pitch } o { u, v }
  zoomInicial?: number;          // 0–100
  configuracionVideo?: ConfiguracionVideo;
}
```

### Navegación programática

```ts
visorRef.value?.cargarEscena('cocina');
visorRef.value?.escenaSiguiente();
visorRef.value?.escenaAnterior();
visorRef.value?.obtenerEscenaActual();  // Escena | null
```

## Marcadores

Los marcadores pueden posicionarse con **coordenadas de textura** (`u`, `v`, rango 0–1) o **coordenadas esféricas** (`yaw`, `pitch`, en radianes).

```ts
interface Marcador {
  id: string;
  posicion: { u: number; v: number } | { yaw: number; pitch: number };
  titulo: string;
  accion: 'mostrar_panel' | 'cambiar_contenido' | 'navegar' | 'cambiar_escena';
  contenido?: string;            // Para 'mostrar_panel'
  url?: string;                  // Para 'navegar' o 'cambiar_contenido'
  tipoMedio?: 'imagen' | 'video'; // Para 'cambiar_contenido'
  escenaDestino?: string;        // Para 'cambiar_escena'
  tipo?: 'dom' | 'esfera';       // 'dom' (default) o mesh 3D
  visible?: boolean;
  zoomObjetivo?: number;         // Zoom al que enfocar al ir al marcador
  tooltip?: { contenido: string; posicion?: string; trigger?: 'hover' | 'click' };
  estilo?: { color?: string; tamano?: number; icono?: string };
}
```

### CRUD de marcadores

```ts
visorRef.value?.agregarMarcador(nuevoMarcador);
visorRef.value?.eliminarMarcador('id');
visorRef.value?.actualizarMarcador({ id: 'id', visible: false });
visorRef.value?.limpiarMarcadores();
visorRef.value?.mostrarMarcador('id');
visorRef.value?.ocultarMarcador('id');
```

## API de cámara

```ts
visorRef.value?.rotarA({ yaw: 1.5, pitch: 0.2 }, true);   // Animado
visorRef.value?.zoomA(75, true);                          // Zoom animado
visorRef.value?.irAMarcador('marcador-1', true);          // Ir a marcador
visorRef.value?.resetearVista(true);                      // Volver al inicio
visorRef.value?.obtenerEstado();                          // { yaw, pitch, zoom }
```

## Configuración de vídeo

Por escena:

```ts
const escenaVideo: Escena = {
  id: 'recorrido',
  medio: '/videos/360.mp4',
  tipoMedio: 'video',
  configuracionVideo: {
    controlesVisibles: true,   // Mostrar barra de controles
    volumenInicial: 0.8,       // 0–1
    muteadoInicial: false,
    tiempoInicial: 10,         // Empezar en el segundo 10
    bucle: true,
  },
};
```

## Eventos

| Evento | Payload | Descripción |
|---|---|---|
| `marcador-seleccionado` | `{ marcador: Marcador, dobleClick?: boolean }` | Clic o tap en marcador |
| `medio-cambiado` | `{ url: string, tipoMedio: TipoMedio }` | Cambio de imagen/vídeo |
| `escena-cambiada` | `{ escenaAnterior?, escenaActual, indice }` | Transición entre escenas |
| `estado-cambiado` | `{ yaw, pitch, zoom }` | Movimiento de cámara |
| `video-pausado` | — | El vídeo fue pausado |
| `video-reanudado` | — | El vídeo fue reanudado |
| `marcador-agregado` | `{ marcador }` | Marcador añadido por API |
| `marcador-eliminado` | `{ id }` | Marcador eliminado por API |
| `marcador-actualizado` | `{ marcador }` | Marcador modificado por API |

## Controles

| Dispositivo | Acción | Comportamiento |
|---|---|---|
| **Mouse** | Drag izquierdo | Rotar la vista (arrastra la esfera) |
| **Mouse** | Rueda | Zoom in/out |
| **Mouse** | Doble clic | Resetear vista |
| **Mouse** | Clic en marcador | Ejecutar acción del marcador |
| **Táctil** | Pan (1 dedo) | Rotar con inercia |
| **Táctil** | Pinch (2 dedos) | Zoom in/out |
| **Táctil** | Doble tap | Resetear vista |
| **Teclado** | ← → ↑ ↓ | Rotar en incrementos |
| **Teclado** | `+` / `-` | Zoom in/out |

## Desarrollo local

```bash
git clone https://github.com/blashstar/vue-360.git
cd vue-360
npm install
npm run dev        # Servidor de desarrollo con demo
npm run build      # Build de librería ESM + tipos
npm run test:unit  # Pruebas unitarias
```

> **Nota para Windows:** si `vitest run` se cuelga, usar `npx vitest run --pool=threads`.

## Arquitectura del build

- **Formato:** ESM (`es`)
- **Entry point JS:** `dist/vue-360.js`
- **Entry point tipos:** `dist/index.d.ts`
- **Estilos:** `dist/style.css` (incluir en tu proyecto)
- **Externos:** `vue`, `three`, `hammerjs`, `gsap` (no se incluyen en el bundle)
- **Bundle:** Un único archivo optimizado para tree-shaking

## Uso como dependencia

### Instalación en tu proyecto Vue

```bash
# 1. Instalar el paquete
npm install @blashstar/vue-360

# 2. Instalar las peer dependencies requeridas
npm install vue@^3.4.0 three@^0.160.0 hammerjs@^2.0.8 gsap@^3.15.0
```

### Importar en tu proyecto

```ts
// Importar el componente principal
import { VisorEsferico } from '@blashstar/vue-360';

// Importar tipos (opcional)
import type { Escena, Marcador, ApiVisorEsferico } from '@blashstar/vue-360';

// Importar estilos (importante para que funcione correctamente)
import '@blashstar/vue-360/style.css';
```

### Ejemplo completo

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { VisorEsferico, type Escena, type ApiVisorEsferico } from '@blashstar/vue-360';
import '@blashstar/vue-360/style.css';

const visorRef = ref<ApiVisorEsferico | null>(null);

const escenas: Escena[] = [
  {
    id: 'sala',
    titulo: 'Sala de estar',
    medio: '/panoramas/sala.jpg',
    tipoMedio: 'imagen',
    posicionInicial: { yaw: 0, pitch: 0 },
    marcadores: [
      {
        id: 'puerta',
        posicion: { u: 0.8, v: 0.5 },
        titulo: 'Entrada',
        accion: 'cambiar_escena',
        escenaDestino: 'entrada',
      },
    ],
  },
  {
    id: 'entrada',
    titulo: 'Entrada',
    medio: '/panoramas/entrada.jpg',
    tipoMedio: 'imagen',
  },
];
</script>

<template>
  <VisorEsferico
    ref="visorRef"
    :escenas="escenas"
    escena-inicial="sala"
    :controles-tactiles="true"
    :teclado-habilitado="true"
  />
</template>
```

### Notas importantes

- **Incluir siempre los estilos:** `import '@blashstar/vue-360/style.css'` es obligatorio para el funcionamiento correcto.
- **Peer dependencies:** Asegúrate de tener instalada la versión de Vue 3 compatible con tu proyecto.
- **TypeScript:** Los tipos se incluyen automáticamente, no necesitas instalar `@types/three` ni `@types/hammerjs` si ya los tienes como devDependencies en tu proyecto.

## Licencia

MIT
