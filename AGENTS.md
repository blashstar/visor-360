# Visor Esférico 360°

> **Estado actual:** El proyecto se encuentra en fase de especificación. El único archivo existente es `PRD.md` (Documento de Requisitos del Producto v3.0). Aún no hay código fuente, configuraciones de build ni dependencias instaladas.

## Descripción del proyecto

Módulo ESM desarrollado con **Vue 3 + TypeScript + Three.js** que provee un componente de visor esférico 360° interactivo. Soporta imágenes panorámicas equirectangulares y vídeos 360°, con controles de mouse y pantallas táctiles, marcadores clickeables y panel de información.

## Stack tecnológico planificado

| Tecnología | Versión esperada | Uso |
|---|---|---|
| Vue | ^3.4.0 | Framework de componentes |
| TypeScript | ^5.3.0 | Tipado estático (strict: true) |
| Three.js | ^0.160.0 | Renderizado 3D de la esfera |
| Vite | ^5.0.0 | Bundler y servidor de desarrollo |
| Pug | ^3.0.2 | Preprocesador de templates Vue |
| Stylus | ^0.59.0 | Preprocesador de estilos |
| Hammer.js | ^2.0.8 | Detección de gestos táctiles |
| Vitest | ^1.0.0 | Framework de pruebas unitarias |
| Equirectangular | — | Proyección de imagen/vídeo 360° en un rectángulo 2:1 |
| @vue/test-utils | ^2.4.0 | Utilidades para pruebas de Vue |
| tsd | ^0.29.0 | Pruebas de tipos TypeScript |

## Estructura de carpetas propuesta

```
visor-360/
├── src/
│   ├── components/
│   │   ├── VisorEsferico/
│   │   │   ├── VisorEsferico.vue      # Componente principal
│   │   │   ├── Esfera360.vue          # Esfera 3D con Three.js
│   │   │   ├── Marcador.vue           # Marcadores interactivos
│   │   │   ├── PanelInformacion.vue   # Panel de información flotante
│   │   │   ├── ControlesTactiles.ts   # Lógica de gestos táctiles
│   │   │   └── tipos.ts              # Tipos TypeScript compartidos
│   │   └── index.ts                   # Punto de entrada del módulo
│   ├── utils/
│   │   ├── three-helpers.ts           # Funciones auxiliares de Three.js
│   │   └── media-helpers.ts           # Carga de imágenes y vídeos
│   ├── App.vue                        # Demo de uso
│   └── main.ts                        # Punto de entrada de la demo
├── tests/
│   ├── unit/                          # Pruebas unitarias (cobertura > 90%)
│   │   ├── VisorEsferico.spec.ts
│   │   ├── Esfera360.spec.ts
│   │   ├── Marcador.spec.ts
│   │   ├── PanelInformacion.spec.ts
│   │   └── ControlesTactiles.spec.ts
│   └── setup.ts                       # Configuración global de mocks (Three.js, Hammer.js)
├── public/
│   └── ejemplos/                      # Assets de ejemplo (JPG, MP4, WebP)
├── vite.config.ts                     # Build en modo librería (formato ESM)
├── tsconfig.json                      # TypeScript estricto
├── vitest.config.ts                   # Configuración de Vitest con jsdom
└── package.json
```

## Convenciones obligatorias

- **Idioma:** Todo el código, comentarios, nombres de variables, mensajes de commit y documentación deben estar **100% en español**.
- **Commits:** Formato `tipo(ámbito): descripción en español`. Ejemplos:
  - `feat(visor): añadir soporte para vídeos 360`
  - `fix(esfera): corregir fugas de memoria al cambiar de medio`
  - `test(tactil): añadir pruebas para gestos multitouch`
- **Templates Vue:** Usar **Pug** en lugar de HTML plano.
- **Estilos:** Usar **Stylus** en lugar de CSS/SCSS plano.
- **Tipado:** TypeScript en modo estricto (`strict: true`).
- **Arquitectura:** Seguir principios SOLID, KISS y SLAP. Separación clara de responsabilidades en subcomponentes.

## Comandos de build y pruebas (planificados)

Basados en el PRD, los scripts previstos para `package.json` son:

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build del módulo ESM
npm run build

# Vista previa del build
npm run preview

# Pruebas unitarias
npm run test:unit

# Pruebas de tipos TypeScript
npm run test:types

# Linting
npm run lint
```

## Configuración clave

### Build (Vite)
- Modo librería (`lib`) con formato `es`.
- Entry point: `src/index.ts`.
- Externos: `vue`, `three`, `hammerjs` (no incluidos en el bundle).
- Alias `@/` apuntando a `src/`.
- Sourcemaps habilitados.

### TypeScript
- `target`: ESNext
- `module`: ESNext
- `moduleResolution`: NodeNext
- `declaration`: true (genera `.d.ts`)
- Paths: `@/*` → `src/*`

### Vitest
- Entorno: `jsdom`
- Mocks globales de Three.js y Hammer.js en `tests/setup.ts`
- Cobertura habilitada (`text`, `lcov`, `html`)

## Testing

- Objetivo de cobertura: **> 90%** (excluyendo archivos de configuración).
- Three.js debe ser **mockeado** en pruebas para evitar dependencia del DOM real y WebGL.
- Hammer.js debe ser **mockeado** para validar gestos táctiles sin dispositivo físico.
- Las pruebas deben cubrir: renderizado de componentes, props, eventos, lógica de cambio de medio, interacciones táctiles simuladas y carga de texturas.

## Arquitectura de componentes

```
VisorEsferico.vue (orquestador)
├── Esfera360.vue        → Escena Three.js, cámara, renderer, texturas
├── Marcador.vue         → Mesh 3D posicionado en coordenadas esféricas
├── PanelInformacion.vue → UI flotante con título/contenido/cierre
└── ControlesTactiles.ts → Hammer.js sobre el contenedor del canvas
```

### Flujo de datos principal
1. El componente recibe props (`medioInicial`, `marcadoresIniciales`, `autoReproducir`, etc.).
2. `Esfera360.vue` carga la textura (imagen o vídeo) y renderiza la escena.
3. Los marcadores se posicionan con coordenadas de textura (`u`, `v`) de 0 a 1, convertidas a cartesianas.
4. Los eventos de mouse/touch se procesan vía `OrbitControls` invertidos (sensación de arrastrar la imagen) y `Hammer.js` (táctil).
5. Al interactuar con un marcador se emite `marcador-seleccionado`, `medio-cambiado`, `video-pausado` o `video-reanudado`.
6. Los paneles de información se proyectan a coordenadas de pantalla y se anclan al marcador seleccionado, siguiéndolo al rotar el panorama.

## Consideraciones de seguridad y rendimiento

- **Memoria:** Limpiar texturas de vídeo (`VideoTexture.dispose()`) y geometrías al cambiar de medio o desmontar el componente para evitar fugas.
- **iOS:** Los vídeos requieren `playsinline` y `muted` para autoplay.
- **Bundle:** Three.js es una dependencia externa (`external` en Vite) para reducir el tamaño del módulo; el consumidor debe instalarlo.
- **Accesibilidad:** Incluir `aria-label` en elementos interactivos y soportar controles por teclado (flechas para rotación, `+`/`-` para zoom).
- **Zoom del navegador:** Deshabilitar zoom por defecto en gestos táctiles dentro del visor.

## Dependencias por implementar

### Producción
- `vue`
- `three`
- `hammerjs`

### Desarrollo
- `@types/three`
- `@types/hammerjs`
- `@vitejs/plugin-vue`
- `@vue/test-utils`
- `vitest`
- `jsdom`
- `pug`
- `stylus`
- `tsd`
- `typescript`
- `vite`

## Notas para el agente

- Antes de escribir código, inicializar el proyecto con Vite (`npm create vite@latest`) y configurar TypeScript, Vitest, Pug y Stylus.
- Respetar estrictamente el uso del español en todo el código fuente.
- Los mocks de Three.js deben incluir al menos: `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `TextureLoader`, `VideoTexture`, `SphereGeometry`, `MeshBasicMaterial`, `Mesh`, `OrbitControls`, `Raycaster`, `Vector2`, `Vector3` y las constantes de color/espacio.
- El build final debe ser importable como:
  ```ts
  import { VisorEsferico } from '@joffre/visor-360';
  ```
