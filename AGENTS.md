# Visor Esférico 360°

> **Estado actual:** Implementación completa y estable. Build ESM funcional, 57 tests unitarios en 7 archivos, generación de `.d.ts` activa.

## Descripción del proyecto

Módulo ESM desarrollado con **Vue 3 + TypeScript + Three.js** que provee un componente de visor esférico 360° interactivo. Soporta imágenes panorámicas equirectangulares y vídeos 360°, con controles de mouse y pantallas táctiles, marcadores clickeables y panel de información.

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Vue | ^3.4.0 | Framework de componentes |
| TypeScript | ^5.3.0 | Tipado estático (strict: true) |
| Three.js | ^0.160.0 | Renderizado 3D de la esfera |
| Vite | ^5.0.0 | Bundler y servidor de desarrollo |
| Pug | ^3.0.2 | Preprocesador de templates Vue |
| Stylus | ^0.59.0 | Preprocesador de estilos |
| Hammer.js | ^2.0.8 | Detección de gestos táctiles |
| GSAP | ^3.15.0 | Animaciones de cámara |
| Vitest | ^1.0.0 | Framework de pruebas unitarias |
| @vue/test-utils | ^2.4.0 | Utilidades para pruebas de Vue |
| vite-plugin-dts | ^4.x | Generación de declaraciones `.d.ts` |

## Estructura de carpetas

```
visor-360/
├── src/
│   ├── components/
│   │   ├── VisorEsferico/
│   │   │   ├── VisorEsferico.vue      # Componente orquestador principal
│   │   │   ├── Esfera360.vue          # Esfera 3D con Three.js (~900 líneas)
│   │   │   ├── Marcador.vue           # Marcadores DOM interactivos
│   │   │   ├── PanelInformacion.vue   # Panel de información flotante
│   │   │   ├── ControlesVideo.vue     # Barra de controles de video
│   │   │   ├── ControlesTactiles.ts   # Lógica de gestos táctiles (Hammer.js)
│   │   │   └── tipos.ts              # Tipos TypeScript compartidos
│   │   └── index.ts                   # Punto de entrada del módulo
│   ├── utils/
│   │   ├── three-helpers.ts           # Funciones auxiliares de Three.js
│   │   ├── media-helpers.ts           # Carga de imágenes y vídeos
│   │   └── animaciones.ts             # Wrappers GSAP (normalizarYaw, etc.)
│   ├── App.vue                        # Demo de uso con escenas
│   └── main.ts                        # Punto de entrada de la demo
├── tests/
│   ├── unit/                          # 57 pruebas unitarias (7 archivos)
│   │   ├── VisorEsferico.spec.ts
│   │   ├── Esfera360.spec.ts
│   │   ├── Marcador.spec.ts
│   │   ├── PanelInformacion.spec.ts
│   │   ├── ControlesVideo.spec.ts
│   │   ├── ControlesTactiles.spec.ts
│   │   └── Tooltip.spec.ts
│   └── setup.ts                       # Mocks globales de Three.js y Hammer.js
├── public/
│   └── ejemplos/                      # Assets de ejemplo (JPG, PNG)
├── dist/                              # Build ESM + CSS + .d.ts
├── vite.config.ts                     # Build en modo librería (ESM)
├── tsconfig.json                      # TypeScript estricto
├── vitest.config.ts                   # Configuración de Vitest
└── package.json
```

## Convenciones obligatorias

- **Idioma:** Todo el código, comentarios, nombres de variables, mensajes de commit y documentación deben estar **100% en español**.
- **Commits:** Formato `tipo(ámbito): descripción en español`.
- **Templates Vue:** Usar **Pug** en lugar de HTML plano.
- **Estilos:** Usar **Stylus** en lugar de CSS/SCSS plano.
- **Tipado:** TypeScript en modo estricto (`strict: true`).
- **Arquitectura:** Seguir principios SOLID, KISS y SLAP. Separación clara de responsabilidades en subcomponentes.
- **Documentación:** Comentarios deben explicar el **por qué**, no el **cómo**. Las constantes mágicas deben incluir la razón de su valor.

## Comandos de build y pruebas

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build del módulo ESM + tipos .d.ts
npm run build

# Vista previa del build
npm run preview

# Pruebas unitarias (usa --pool=threads en Windows para evitar deadlocks)
npm run test:unit
npx vitest run --pool=threads

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
- `preserveModules: true` para tree-shaking óptimo.
- `vite-plugin-dts` con `rollupTypes: true` genera un único `index.d.ts`.

### TypeScript
- `target`: ESNext
- `module`: ESNext
- `moduleResolution`: bundler
- `declaration`: true (genera `.d.ts`)
- Paths: `@/*` → `src/*`

### Vitest
- Entorno: `jsdom`
- Mocks globales de Three.js y Hammer.js en `tests/setup.ts`
- Pool: `forks` por defecto; usar `threads` en Windows si hay deadlocks.

## Testing

- **57 tests** en 7 archivos de test.
- Three.js es **mockeado** en pruebas para evitar dependencia del DOM real y WebGL.
- Hammer.js es **mockeado** para validar gestos táctiles sin dispositivo físico.
- Cobertura de casos edge: escenas inexistentes, marcadores sin URL, zoom/pitch en límites, clamp de seek/volumen, duplicados, modo legacy vacío.

## Arquitectura de componentes

```
VisorEsferico.vue (orquestador)
├── Esfera360.vue        → Escena Three.js, cámara, renderer, texturas
├── Marcador.vue         → Overlay DOM posicionado en coordenadas de pantalla
├── PanelInformacion.vue → UI flotante con título/contenido/cierre
├── ControlesVideo.vue   → Barra de controles para videos 360
└── ControlesTactiles.ts → Hammer.js sobre el contenedor del canvas
```

### Flujo de datos principal
1. El componente recibe props (`medioInicial`, `escenas`, `autoReproducir`, etc.).
2. `Esfera360.vue` carga la textura (imagen o vídeo) y renderiza la escena.
3. Los marcadores se posicionan con coordenadas de textura (`u`, `v`) o esféricas (`yaw`, `pitch`), convertidas a cartesianas.
4. Los eventos de mouse/touch se procesan vía rotación directa (sensación de arrastrar la imagen) y Hammer.js (táctil).
5. Al interactuar con un marcador se emite `marcador-seleccionado`, `medio-cambiado`, `escena-cambiada`, `video-pausado` o `video-reanudado`.
6. Los paneles de información se proyectan a coordenadas de pantalla y se anclan al marcador seleccionado.

## Consideraciones de seguridad y rendimiento

- **Memoria:** `limpiar()` en `Esfera360` dispone texturas, geometrías, materiales y remueve el `<video>` del DOM para evitar fugas.
- **iOS Safari:** El `<video>` MUST estar en el DOM (aunque oculto) para que WebGL lo texturice. `needsUpdate = true` en `VideoTexture` cada frame es obligatorio.
- **Bundle:** Three.js es dependencia externa (`external` en Vite) para reducir tamaño; el consumidor debe instalarlo.
- **Accesibilidad:** `aria-label` en botones de video, soporte de teclado (flechas para rotación, `+`/`-` para zoom).
- **Zoom del navegador:** `touch-action: none` deshabilita zoom nativo en gestos táctiles dentro del visor.

## Dependencias

### Producción
- `vue`
- `three`
- `hammerjs`
- `gsap`

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
- `vite-plugin-dts`
- `@vue/language-core`

## Notas para el agente

- El build genera chunks numerados en `dist/` debido a `preserveModules: true`.
- El entry point de tipos es `dist/index.d.ts`.
- El componente `Marcador` se exporta como `MarcadorVue` para evitar colisión con el tipo `Marcador`.
- `ApiEsfera360` expone los métodos de `Esfera360` para tipar template refs correctamente.
- En Windows, si `vitest run` se cuelga, usar `--pool=threads`.
- `vite-plugin-dts` puede tardar ~40s en generar tipos; no interrumpir.
