# **Documento de Requisitos del Producto (PRD)**
**Nombre del Proyecto:** Visor Esférico 360° con Three.js y Vue.js
**Versión:** 4.0
**Fecha:** 2 de mayo de 2026
**Autor:** Joffré Sánchez
**Equipo:** Desarrollo Frontend (Vue.js + Three.js + Vite)

---

---

## **1. Resumen Ejecutivo**
### **Objetivo**
Desarrollar un **módulo ESM** en **Vue 3 + TypeScript + Three.js** que provea un **componente de visor esférico 360°** con las siguientes capacidades:
- Visualización de **imágenes panorámicas equirectangulares** y **vídeos 360°** en una esfera 3D interactiva.
- Controles de **panorámica (pan)**, **zoom** y **rotación** con soporte para:
  - **Mouse** (arrastrar, scroll).
  - **Pantallas táctiles** (tap, swipe, pinch-to-zoom, multitouch).
  - **Teclado** (flechas, +/-, Escape).
- **Marcadores clickeables** en la esfera con múltiples tipos y acciones configurables:
  - Mostrar un panel de información con tooltip.
  - Cambiar el contenido del visor (imagen/vídeo).
  - Navegar a una URL externa.
- **API programática**: rotar, zoom y navegar a marcadores con animaciones suaves.
- **Exportable como módulo ESM** para integrar en otros proyectos.
- **100% en español**: Código, nombres de variables, comentarios, mensajes de commit, documentación, etc.
- **Pruebas unitarias exhaustivas** (cobertura > 90%).

---

---

## **2. Alcance**
### **Incluido en el Alcance**
✅ **Módulo ESM** con el componente principal `VisorEsferico` y subcomponentes.
✅ **Integración con Three.js** para renderizado 3D de imágenes y vídeos 360°.
✅ **Soporte para medios**:
   - Imágenes panorámicas (formato equirectangular: JPG, PNG, WebP).
   - Vídeos 360° (formato equirectangular: MP4, WebM).
✅ **Gestión de escenas**: Cargar escenas definidas como objetos JSON que contienen medio + marcadores + configuración de cámara.
✅ **Controles interactivos**:
   - **Mouse**:
     - Rotación (arrastrar con clic izquierdo).
     - Zoom (scroll).
   - **Pantallas táctiles**:
     - Rotación (swipe con un dedo).
     - Zoom (pinch-to-zoom con dos dedos).
     - Tap (para seleccionar marcadores).
   - **Teclado**:
     - Flechas para rotar.
     - +/- para zoom.
     - Escape para cerrar panel.
✅ **Sistema de marcadores**:
   - Posicionamiento en coordenadas de textura (`u`, `v`) de 0 a 1 o coordenadas esféricas (`yaw`, `pitch`).
   - Múltiples tipos: `dom` (overlay HTML), `esfera` (mesh 3D).
   - Tooltips configurables (hover/click).
   - Acciones configurables (`mostrar_panel`, `cambiar_contenido`, `navegar`).
   - API imperativa: `agregarMarcador`, `eliminarMarcador`, `actualizarMarcador`, `irAMarcador`.
✅ **Panel de información** (título, contenido, botón de cierre, posición anclada).
✅ **Transiciones suaves** entre medios con fade.
✅ **Pruebas unitarias** (Vitest + `@vue/test-utils`).
✅ **Build con Vite** como módulo ESM.
✅ **Tipado estricto** con TypeScript.
✅ **Documentación completa** en español.

### **Fuera del Alcance**
❌ Soporte para **realidad virtual (VR)** con dispositivos externos (ej: Oculus, Cardboard).
❌ **Streaming en tiempo real** de vídeos 360° (solo reproducción de archivos locales o URLs estáticas).
❌ **Almacenamiento persistente** (el estado se maneja internamente o via props).
❌ Marcadores tipo polígono/SVG (mantenemos DOM y esfera).

---

---

## **3. Requisitos Funcionales**
---

### **3.1. Visualización de Medios 360°**
| ID   | Requisito | Descripción | Prioridad |
|------|-----------|-------------|-----------|
| RF-001 | Carga de imagen | El componente debe cargar y renderizar una imagen equirectangular como textura de una esfera 3D. | Alta |
| RF-002 | Carga de vídeo | El componente debe cargar y reproduccir un vídeo equirectangular como textura de una esfera 3D. | Alta |
| RF-003 | Cambio dinámico de medio | El visor debe actualizar la textura al cambiar entre imagen/vídeo. | Alta |
| RF-004 | Reproducción de vídeo | Los vídeos deben reproducirse automáticamente al cargarse, sin intervención del usuario. | Alta |
| RF-005 | Controles de vídeo | El usuario debe poder pausar/reanudar el vídeo desde la interfaz. | Media |
| RF-006 | Optimización de rendimiento | Usar `THREE.VideoTexture` para vídeos y `THREE.TextureLoader` para imágenes. | Alta |
| RF-007 | Formatos soportados | Soporte para imágenes (JPG, PNG, WebP) y vídeos (MP4, WebM). | Alta |
| RF-007a | Transiciones | Fade suave al cambiar entre medios. | Media |
| RF-007b | Gestión de escenas | Permitir definir escenas como objetos JSON con medio, marcadores y configuración de cámara. | Alta |
| RF-007c | Cambio de escena | Navegar entre escenas programáticamente (`cargarEscena`, `escenaSiguiente`, `escenaAnterior`). | Alta |

---

### **3.2. Controles Interactivos**
| ID   | Requisito | Descripción | Prioridad |
|------|-----------|-------------|-----------|
| RF-008 | Rotación con mouse | El usuario debe poder rotar la esfera arrastrando con el mouse, con sensación de arrastrar la imagen (controles invertidos). | Alta |
| RF-009 | Zoom con mouse | El usuario debe poder hacer zoom con el scroll del mouse. | Alta |
| RF-010 | Rotación táctil | El usuario debe poder rotar la esfera con un **swipe** (un dedo). | Alta |
| RF-011 | Zoom táctil | El usuario debe poder hacer zoom con **pinch-to-zoom** (dos dedos). | Alta |
| RF-012 | Tap en marcadores | El usuario debe poder seleccionar marcadores con un **tap** (un dedo). | Alta |
| RF-013 | Sensibilidad configurable | Los controles deben permitir ajustar la sensibilidad de rotación y zoom. | Media |
| RF-014 | Bloqueo de controles | Opción para deshabilitar controles (ej: en modo "solo visualización"). | Baja |
| RF-015 | Teclado | Flechas para rotar, +/- para zoom, Escape para cerrar panel. | Alta |
| RF-015a | Doble click | Doble click/tap resetea la vista a posición inicial. | Media |

---
### **3.3. Marcadores Interactivos**
| ID   | Requisito | Descripción | Prioridad |
|------|-----------|-------------|-----------|
| RF-016 | Posicionamiento | Los marcadores deben colocarse en coordenadas de textura (`u`, `v`) de 0 a 1 o coordenadas esféricas (`yaw`, `pitch`). | Alta |
| RF-017 | Detección de clics/taps | Usar `THREE.Raycaster` para detectar clics (mouse) y taps (táctil) en marcadores. | Alta |
| RF-018 | Acciones | Cada marcador debe soportar 3 acciones: `mostrar_panel`, `cambiar_contenido`, `navegar`. | Alta |
| RF-019 | Personalización | Los marcadores deben permitir personalizar color, tamaño e ícono (SVG o imagen). | Media |
| RF-020 | Marcadores en vídeo | Los marcadores deben funcionar correctamente sobre vídeos en reproducción. | Alta |
| RF-021 | Tooltips | Los marcadores deben soportar tooltips con posición configurable y trigger hover/click. | Alta |
| RF-022 | Tipos de marcador | Soportar marcadores `dom` (HTML overlay) y `esfera` (mesh 3D). | Alta |
| RF-023 | CRUD imperativo | Exponer métodos: `agregarMarcador`, `eliminarMarcador`, `actualizarMarcador`, `limpiarMarcadores`. | Alta |
| RF-024 | irAMarcador | Animar la cámara hacia la posición de un marcador con zoom opcional. | Alta |
| RF-025 | Visibilidad toggle | `mostrarMarcador` / `ocultarMarcador` / `alternarMarcador`. | Media |

---
### **3.4. Panel de Información**
| ID   | Requisito | Descripción | Prioridad |
|------|-----------|-------------|-----------|
| RF-026 | Mostrar panel | Al seleccionar un marcador con `accion: 'mostrar_panel'`, mostrar un panel anclado a la posición del marcador en pantalla. | Alta |
| RF-027 | Cerrar panel | El panel debe tener un botón para cerrarlo. | Media |
| RF-028 | Posición adaptable | El panel debe aparecer anclado al marcador seleccionado y seguirlo al rotar el panorama. | Media |
| RF-029 | Contenido dinámico | El panel debe soportar contenido HTML o componentes Vue. | Baja |
| RF-030 | Tooltip flotante | Tooltip que aparece en hover/click sobre marcador, con posición configurable. | Alta |

---
### **3.5. Gestión de Escenas**
| ID   | Requisito | Descripción | Prioridad |
|------|-----------|-------------|-----------|
| RF-030a | Objeto Escena | Una escena contiene: `id`, `medio`, `tipoMedio`, `marcadores`, `posicionInicial`, `zoomInicial`. | Alta |
| RF-030b | Modo escenas | El visor puede operar en modo escenas (array de `Escena`) o modo legacy (props individuales). | Alta |
| RF-030c | Escena inicial | Soporte para `escenaInicial` (por ID) al cargar el visor. | Alta |
| RF-030d | Transición entre escenas | Al cambiar de escena, se actualizan medio, marcadores y posición de cámara. | Alta |
| RF-030e | Evento escena-cambiada | Emitir evento con escena anterior, escena actual e índice. | Media |

---
### **3.6. API Programática**
| ID   | Requisito | Descripción | Prioridad |
|------|-----------|-------------|-----------|
| RF-031 | rotarA | Método para rotar la cámara a yaw/pitch con animación opcional. | Alta |
| RF-032 | zoomA | Método para establecer el nivel de zoom con animación opcional. | Alta |
| RF-033 | estado | Exponer estado actual: yaw, pitch, zoom. | Media |
| RF-034 | resetearVista | Volver a la posición y zoom iniciales. | Media |

---
### **3.6. Módulo ESM**
| ID   | Requisito | Descripción | Prioridad |
|------|-----------|-------------|-----------|
| RF-038 | Exportación ESM | El proyecto debe compilarse como módulo ESM para importar en otros proyectos. | Alta |
| RF-039 | Tipos TypeScript | Debe incluir tipos para props, eventos y API pública. | Alta |
| RF-040 | Build con Vite | Usar `vite build --mode library` para generar el módulo. | Alta |

---
### **3.7. Pruebas Unitarias**
| ID   | Requisito | Descripción | Prioridad |
|------|-----------|-------------|-----------|
| RF-041 | Cobertura | Las pruebas deben cubrir > 90% del código (excluyendo archivos de configuración). | Alta |
| RF-042 | Pruebas de componentes | Probar renderizado, props, eventos y lógica de todos los componentes. | Alta |
| RF-043 | Pruebas de Three.js | Mockear Three.js para probar interacciones sin depender del DOM real. | Alta |
| RF-044 | Pruebas de vídeo | Validar que los vídeos se carguen y reproduzcan correctamente. | Alta |
| RF-045 | Pruebas táctiles | Simular eventos táctiles (tap, swipe, pinch) en pruebas. | Media |
| RF-046 | Pruebas de teclado | Simular eventos de teclado en pruebas. | Media |
| RF-047 | Pruebas de animaciones | Validar interpolación y easing. | Media |
| RF-048 | Pruebas de escenas | Validar cambio de escenas y navegación cíclica. | Alta |

---

## **4. Requisitos No Funcionales**
---

### **4.1. Rendimiento**
| ID   | Requisito | Descripción |
|------|-----------|-------------|
| RNF-001 | Frame rate | Mantener **60 FPS** en dispositivos modernos (testeado con imágenes/vídeos 4K). |
| RNF-002 | Carga asíncrona | Las imágenes y vídeos deben cargarse sin bloquear el hilo principal. |
| RNF-003 | Memoria | No debe haber fugas de memoria al cambiar medios o desmontar el componente. |
| RNF-004 | Optimización de texturas | Usar compresión de texturas para vídeos (ej: `THREE.VideoTexture` con `minFilter: THREE.LinearFilter`). |
| RNF-005 | Buffering de vídeo | Los vídeos deben bufferizarse correctamente para evitar tirones. |
| RNF-006 | Easing | Usar funciones de easing (ease-out-cubic) para inercia y animaciones. |

---
### **4.2. Compatibilidad**
| ID   | Requisito | Descripción |
|------|-----------|-------------|
| RNF-007 | Navegadores | Soporte para Chrome, Firefox, Edge y Safari (últimas 2 versiones). |
| RNF-008 | Dispositivos móviles | Funcionalidad completa en iOS/Android (iPhone, iPad, tablets). |
| RNF-009 | Vue.js | Compatible con Vue 3.x y TypeScript 5.x. |
| RNF-010 | Three.js | Compatible con Three.js r160+. |

---
### **4.3. Código y Arquitectura**
| ID   | Requisito | Descripción |
|------|-----------|-------------|
| RNF-011 | Principios SOLID | El código debe seguir SOLID, KISS y SLAP. |
| RNF-012 | Modularidad | Separación clara de responsabilidades en subcomponentes. |
| RNF-013 | Idioma | **Todo el código, comentarios, commits y documentación debe estar en español**. |
| RNF-014 | Estilos | Usar **Stylus** para CSS y **Pug** para templates. |
| RNF-015 | Tipado | TypeScript estricto (`strict: true` en `tsconfig.json`). |

---
### **4.4. Accesibilidad**
| ID   | Requisito | Descripción |
|------|-----------|-------------|
| RNF-016 | Teclado | Los controles deben ser accesibles via teclado (flechas para rotación, `+`/`-` para zoom). |
| RNF-017 | ARIA | Uso de atributos `aria-label` en elementos interactivos. |
| RNF-018 | Contraste | Asegurar que los marcadores y el panel tengan suficiente contraste. |

---
### **4.5. UX en Dispositivos Táctiles**
| ID   | Requisito | Descripción |
|------|-----------|-------------|
| RNF-019 | Respuesta táctil | Los controles deben responder de forma fluida a gestos táctiles. |
| RNF-020 | Feedback visual | Proporcionar feedback visual al interactuar (ej: cambio de color en marcadores al tap). |
| RNF-021 | Prevención de zoom del navegador | Deshabilitar el zoom del navegador al hacer doble tap en el visor. |
| RNF-022 | Soporte multitouch | Permitir gestos de dos dedos (pinch-to-zoom) sin interferir con la rotación. |

---

## **5. Arquitectura y Diseño Técnico**
---

### **5.1. Estructura del Proyecto**
```
vue-360/
├── src/
│   ├── components/
│   │   ├── VisorEsferico/
│   │   │   ├── VisorEsferico.vue          # Componente principal
│   │   │   ├── Esfera360.vue              # Esfera 3D con Three.js (imagen/vídeo)
│   │   │   ├── Marcador.vue               # Componente DOM de marcador
│   │   │   ├── PanelInformacion.vue       # Panel de información
│   │   │   ├── Tooltip.vue                # Tooltip de marcador
│   │   │   ├── ControlesTactiles.ts       # Lógica para gestos táctiles
│   │   │   └── tipos.ts                  # Tipos TypeScript compartidos
│   │   └── index.ts                       # Exportación del módulo
│   ├── utils/
│   │   ├── three-helpers.ts               # Funciones auxiliares para Three.js
│   │   ├── media-helpers.ts               # Carga de imágenes/vídeos
│   │   └── animaciones.ts                 # Interpolación y easing
│   ├── App.vue                            # Demo del componente
│   └── main.ts                            # Punto de entrada (solo para demo)
├── tests/
│   ├── unit/
│   │   ├── VisorEsferico.spec.ts
│   │   ├── Esfera360.spec.ts
│   │   ├── Marcador.spec.ts
│   │   ├── PanelInformacion.spec.ts
│   │   └── ControlesTactiles.spec.ts
│   └── setup.ts                           # Configuración de Vitest
├── public/
│   └── ejemplos/                          # Imágenes/vídeos de ejemplo
├── vite.config.ts                         # Configuración de Vite
├── tsconfig.json                          # Configuración de TypeScript
├── package.json
└── README.md                              # Documentación en español
```

---
### **5.2. Diagrama de Componentes**
```mermaid
graph TD
    A[VisorEsferico.vue] --> B[Esfera360.vue]
    A --> C[Marcador.vue]
    A --> D[PanelInformacion.vue]
    A --> E[Tooltip.vue]
    A --> F[ControlesTactiles.ts]
    B --> G[THREE.Scene]
    B --> H[THREE.VideoTexture | THREE.TextureLoader]
    B --> I[DinamicaCamara]
    F --> J[Hammer.js o PointerEvents]
    C --> K[DOM Overlay + Raycaster]
    D --> L[Contenido dinámico]
    E --> M[Posición flotante]
```

---
### **5.3. Flujo de Datos**
1. **Props de entrada**:
   - `medioInicial`: URL de la imagen o vídeo inicial.
   - `marcadoresIniciales`: Array de objetos `Marcador`.
   - `esVideo`: Booleano para indicar si el medio es un vídeo (default: `false`).
   - `autoReproducir`: Booleano para autoplay en vídeos (default: `true`).
   - `tecladoHabilitado`: Booleano para controles de teclado (default: `true`).
2. **Eventos emitidos**:
   - `medio-cambiado`: Se emite cuando el medio (imagen/vídeo) cambia.
   - `marcador-seleccionado`: Se emite cuando un marcador es clickeado/tappeado.
   - `video-pausado`: Se emite cuando el vídeo se pausa.
   - `video-reanudado`: Se emite cuando el vídeo se reanuda.
   - `marcador-agregado`, `marcador-eliminado`, `marcador-actualizado`.
3. **Estado interno**:
   - `medioActual`: URL del medio actual (imagen/vídeo).
   - `esVideoActual`: Booleano que indica si el medio actual es un vídeo.
   - `videoPausado`: Estado de reproducción del vídeo.
   - `posicionCamara`: { yaw, pitch, zoom }.

---
### **5.4. Manejo de Medios**
- **Imágenes**: Usar `THREE.TextureLoader` para cargar texturas estáticas.
- **Vídeos**: Usar `THREE.VideoTexture` con un elemento `<video>` oculto.
  - El vídeo debe tener los atributos:
    ```html
    <video
      loop
      muted
      playsinline
      :autoplay="autoReproducir"
      :src="medioActual"
    />
    ```
  - **Nota**: En iOS, los vídeos requieren `playsinline` y `muted` para autoplay.
- **Transiciones**: Al cambiar de medio, aplicar un fade de 300ms antes de swap de textura.

---
### **5.5. Controles Táctiles**
- **Librería recomendada**: Usar **Hammer.js** o **PointerEvents** nativo para detectar gestos.
- **Gestos soportados**:
  | Gestos | Acción |
  |--------|--------|
  | **Tap (1 dedo)** | Seleccionar marcador o pausar/reanudar vídeo. |
  | **Swipe (1 dedo)** | Rotar la esfera. |
  | **Pinch (2 dedos)** | Zoom in/out. |
  | **Doble tap** | Resetear la vista a la posición inicial. |

---
### **5.6. Sistema de Animaciones**
- **Inercia**: Fricción con easing `ease-out-cubic` para detenerse suavemente.
- **Animaciones programáticas**: Interpolación lineal o ease-in-out-sine para `rotarA`, `zoomA`, `irAMarcador`.
- **Duración default**: 800ms para animaciones de cámara.
- **Cancelación**: Las animaciones deben poder cancelarse si el usuario interactúa.

---
### **5.7. Dependencias**
| Dependencia | Versión | Uso |
|-------------|---------|-----|
| `vue` | ^3.4.0 | Framework principal. |
| `three` | ^0.160.0 | Renderizado 3D. |
| `@types/three` | ^0.160.0 | Tipado para Three.js. |
| `pug` | ^3.0.2 | Preprocesador de templates. |
| `stylus` | ^0.59.0 | Preprocesador de estilos. |
| `vite` | ^5.0.0 | Bundler para build. |
| `@vitejs/plugin-vue` | ^5.0.0 | Plugin de Vue para Vite. |
| `typescript` | ^5.3.0 | Tipado estático. |
| `vitest` | ^1.0.0 | Framework de pruebas. |
| `@vue/test-utils` | ^2.4.0 | Utilidades para pruebas de Vue. |
| `hammerjs` | ^2.0.8 | Detección de gestos táctiles. |
| `gsap` | ^3.12.0 | Animaciones y easing de cámara. |
| `tsd` | ^0.29.0 | Pruebas de tipos TypeScript. |

---

## **6. Tipos TypeScript**
---

### **6.1. `src/components/VisorEsferico/tipos.ts`**
```typescript
/**
 * Coordenadas de textura para posicionar elementos en la esfera 360°.
 * Valores normalizados de 0 a 1, como porcentaje del tamaño de la textura.
 * @property u - Coordenada horizontal (0 = izquierda, 1 = derecha).
 * @property v - Coordenada vertical (0 = arriba, 1 = abajo).
 */
export interface CoordenadaTextura {
  u: number;
  v: number;
}

/**
 * Coordenadas esféricas para posicionar elementos en la esfera 360°.
 * @property yaw - Ángulo horizontal en radianes (-π a π, 0 = frente).
 * @property pitch - Ángulo vertical en radianes (-π/2 a π/2, 0 = horizonte).
 */
export interface CoordenadaEsferica {
  yaw: number;
  pitch: number;
}

/**
 * Posición de un marcador: puede ser UV o esférica.
 */
export type PosicionMarcador = CoordenadaTextura | CoordenadaEsferica;

/**
 * Acciones disponibles para un marcador al ser seleccionado.
 */
export type AccionMarcador =
  | 'mostrar_panel'
  | 'cambiar_contenido'
  | 'navegar';

/**
 * Tipo de medio soportado por el visor.
 */
export type TipoMedio = 'imagen' | 'video';

/**
 * Tipo de renderizado de marcador.
 */
export type TipoMarcador = 'dom' | 'esfera';

/**
 * Trigger para mostrar tooltip.
 */
export type TriggerTooltip = 'hover' | 'click';

/**
 * Posición de un marcador proyectado en la pantalla 2D.
 */
export interface PosicionPantalla {
  /** Coordenada X en píxeles. */
  x: number;
  /** Coordenada Y en píxeles. */
  y: number;
  /** Indica si el marcador está visible (frente a la cámara). */
  visible: boolean;
}

/**
 * Configuración de tooltip para un marcador.
 */
export interface TooltipConfig {
  /** Contenido del tooltip. */
  contenido: string;
  /** Posición del tooltip (default: 'top center'). */
  posicion?: string;
  /** Trigger para mostrar: 'hover' | 'click' (default: 'hover'). */
  trigger?: TriggerTooltip;
  /** Clase CSS adicional. */
  clase?: string;
}

/**
 * Estructura de un marcador en el visor.
 */
export interface Marcador {
  /** Identificador único del marcador. */
  id: string;
  /** Posición en coordenadas de textura (u, v) o esféricas (yaw, pitch). */
  posicion: PosicionMarcador;
  /** Título del marcador (se muestra en el panel). */
  titulo: string;
  /** Contenido del panel (opcional, solo para acción 'mostrar_panel'). */
  contenido?: string;
  /** Acción a realizar al hacer clic/tap. */
  accion: AccionMarcador;
  /** URL para navegar o cambiar medio (depende de la acción). */
  url?: string;
  /** Tipo de medio al que apunta (solo para acción 'cambiar_contenido'). */
  tipoMedio?: TipoMedio;
  /** Datos adicionales para el panel (opcional). */
  datosPanel?: Record<string, unknown>;
  /** Estilo personalizado del marcador (opcional). */
  estilo?: {
    color?: string;
    tamano?: number;
    icono?: string;
  };
  /** Tipo de renderizado del marcador (default: 'dom'). */
  tipo?: TipoMarcador;
  /** Tooltip del marcador (opcional). */
  tooltip?: TooltipConfig;
  /** Visible por defecto (default: true). */
  visible?: boolean;
  /** Zoom al que se enfoca al ir al marcador (opcional). */
  zoomObjetivo?: number;
}

/**
 * Evento emitido al seleccionar un marcador.
 */
export interface EventoMarcadorSeleccionado {
  /** Marcador que fue seleccionado. */
  marcador: Marcador;
  /** Si fue doble click. */
  dobleClick?: boolean;
}

/**
 * Evento emitido al cambiar el medio (imagen/vídeo).
 */
export interface EventoMedioCambiado {
  /** URL del nuevo medio. */
  url: string;
  /** Tipo de medio (imagen o video). */
  tipoMedio: TipoMedio;
}

/**
 * Estado de la cámara expuesto públicamente.
 */
export interface EstadoCamara {
  yaw: number;
  pitch: number;
  zoom: number;
}

/**
 * Props del componente VisorEsferico.
 */
export interface PropsVisorEsferico {
  /** URL del medio inicial (imagen o vídeo). */
  medioInicial: string;
  /** Tipo de medio inicial ('imagen' o 'video'). */
  tipoMedioInicial?: TipoMedio;
  /** Lista de marcadores a mostrar en la esfera. */
  marcadoresIniciales?: Marcador[];
  /** Color de fondo del visor (default: '#000000'). */
  colorFondo?: string;
  /** Sensibilidad de los controles de rotación (default: 1). */
  sensibilidadRotacion?: number;
  /** Sensibilidad del zoom (default: 1). */
  sensibilidadZoom?: number;
  /** Autoplay para vídeos (default: true). */
  autoReproducir?: boolean;
  /** Habilitar controles táctiles (default: true). */
  controlesTactiles?: boolean;
  /** Habilitar controles de mouse (default: true). */
  controlesMouse?: boolean;
  /** Habilitar controles de teclado (default: true). */
  tecladoHabilitado?: boolean;
  /** Posición inicial de la cámara (default: {yaw:0, pitch:0}). */
  posicionInicial?: CoordenadaEsferica;
  /** Zoom inicial, 0-100 (default: 50). */
  zoomInicial?: number;
}

/**
 * Eventos emitidos por el componente VisorEsferico.
 */
export interface EventosVisorEsferico {
  /** Se emite cuando un marcador es seleccionado. */
  (e: 'marcador-seleccionado', payload: EventoMarcadorSeleccionado): void;
  /** Se emite cuando el medio del visor cambia. */
  (e: 'medio-cambiado', payload: EventoMedioCambiado): void;
  /** Se emite cuando el vídeo se pausa. */
  (e: 'video-pausado'): void;
  /** Se emite cuando el vídeo se reanuda. */
  (e: 'video-reanudado'): void;
  /** Se emite cuando se agrega un marcador. */
  (e: 'marcador-agregado', payload: { marcador: Marcador }): void;
  /** Se emite cuando se elimina un marcador. */
  (e: 'marcador-eliminado', payload: { id: string }): void;
  /** Se emite cuando se actualiza un marcador. */
  (e: 'marcador-actualizado', payload: { marcador: Marcador }): void;
}

/**
 * API pública expuesta por template ref.
 */
export interface ApiVisorEsferico {
  /** Rotar la cámara a una posición con animación opcional. */
  rotarA: (posicion: CoordenadaEsferica, animar?: boolean) => void;
  /** Establecer el zoom con animación opcional. */
  zoomA: (nivel: number, animar?: boolean) => void;
  /** Animar la cámara hacia un marcador. */
  irAMarcador: (id: string, animar?: boolean) => void;
  /** Agregar un marcador dinámicamente. */
  agregarMarcador: (marcador: Marcador) => void;
  /** Eliminar un marcador por id. */
  eliminarMarcador: (id: string) => void;
  /** Actualizar un marcador existente. */
  actualizarMarcador: (marcador: Partial<Marcador> & { id: string }) => void;
  /** Limpiar todos los marcadores. */
  limpiarMarcadores: () => void;
  /** Mostrar un marcador previamente oculto. */
  mostrarMarcador: (id: string) => void;
  /** Ocultar un marcador. */
  ocultarMarcador: (id: string) => void;
  /** Resetear la vista a la posición inicial. */
  resetearVista: (animar?: boolean) => void;
  /** Obtener estado actual de la cámara. */
  obtenerEstado: () => EstadoCamara;
  /** Cargar una escena por su ID. */
  cargarEscena: (id: string) => void;
  /** Avanzar a la siguiente escena. */
  escenaSiguiente: () => void;
  /** Retroceder a la escena anterior. */
  escenaAnterior: () => void;
  /** Obtener la escena actual. */
  obtenerEscenaActual: () => Escena | null;
  /** Obtener el índice de la escena actual. */
  obtenerIndiceEscena: () => number;
}
```

---
### **6.2. `src/index.ts` (Exportación del módulo)**
```typescript
import VisorEsferico from './components/VisorEsferico/VisorEsferico.vue';
import Esfera360 from './components/VisorEsferico/Esfera360.vue';
import Marcador from './components/VisorEsferico/Marcador.vue';
import PanelInformacion from './components/VisorEsferico/PanelInformacion.vue';
import Tooltip from './components/VisorEsferico/Tooltip.vue';

// Exportar componentes individuales
export { VisorEsferico, Esfera360, Marcador, PanelInformacion, Tooltip };

// Exportar tipos
export type {
  CoordenadaTextura,
  CoordenadaEsferica,
  PosicionMarcador,
  AccionMarcador,
  TipoMedio,
  TipoMarcador,
  TriggerTooltip,
  PosicionPantalla,
  TooltipConfig,
  Marcador,
  EventoMarcadorSeleccionado,
  EventoMedioCambiado,
  EstadoCamara,
  PropsVisorEsferico,
  EventosVisorEsferico,
  ApiVisorEsferico,
} from './components/VisorEsferico/tipos';

// Exportar componente principal por defecto
export default VisorEsferico;
```

---
### **6.3. `src/utils/animaciones.ts`**
```typescript
/**
 * Función de easing ease-out-cubic.
 */
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Función de easing ease-in-out-sine.
 */
export const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Interpola entre dos valores.
 */
export const interpolar = (
  inicio: number,
  fin: number,
  progreso: number,
  easing: (t: number) => number = (t) => t
): number => inicio + (fin - inicio) * easing(progreso);

/**
 * Normaliza un ángulo yaw a [-π, π].
 */
export const normalizarYaw = (yaw: number): number => {
  let y = yaw % (2 * Math.PI);
  if (y > Math.PI) y -= 2 * Math.PI;
  if (y < -Math.PI) y += 2 * Math.PI;
  return y;
};
```

---
### **6.4. `src/utils/media-helpers.ts`**
```typescript
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
  autoReproducir: boolean = true
): Promise<THREE.VideoTexture> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = url;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = autoReproducir;

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
```

---
### **6.5. `src/utils/three-helpers.ts`**
```typescript
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
```

---
### **6.6. `src/components/VisorEsferico/ControlesTactiles.ts`**
```typescript
import Hammer from 'hammerjs';

export interface ConfiguracionTactil {
  contenedor: HTMLElement;
  alTap: (x: number, y: number) => void;
  alDobleTap: () => void;
  alPan: (deltaX: number, deltaY: number) => void;
  alPanEnd: () => void;
  alPinch: (escala: number) => void;
  alPinchEnd: () => void;
  sensibilidadRotacion?: number;
  sensibilidadZoom?: number;
}

/**
 * Configura controles táctiles para el visor usando Hammer.js.
 */
export const configurarControlesTactiles = (
  config: ConfiguracionTactil
): HammerManager => {
  const { contenedor, sensibilidadRotacion = 1, sensibilidadZoom = 1 } = config;

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

  hammer.on('tap', (ev) => {
    config.alTap(ev.center.x, ev.center.y);
  });

  hammer.on('doubletap', () => {
    config.alDobleTap();
  });

  hammer.on('panstart', () => {
    estaPinchando = false;
  });

  hammer.on('panmove', (ev) => {
    if (estaPinchando) return;
    config.alPan(ev.deltaX * sensibilidadRotacion * 0.01, ev.deltaY * sensibilidadRotacion * 0.01);
  });

  hammer.on('panend', () => {
    config.alPanEnd();
  });

  hammer.on('pinchstart', (ev) => {
    estaPinchando = true;
    distanciaPinchInicial = ev.scale;
  });

  hammer.on('pinchmove', (ev) => {
    const delta = (ev.scale - distanciaPinchInicial) * sensibilidadZoom;
    config.alPinch(delta);
    distanciaPinchInicial = ev.scale;
  });

  hammer.on('pinchend', () => {
    estaPinchando = false;
    config.alPinchEnd();
  });

  return hammer;
};
```

---

## **7. Configuración de Vite**
---
### **7.1. `vite.config.ts`**
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VisorEsferico',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'three', 'hammerjs'],
      output: {
        globals: {
          vue: 'Vue',
          three: 'THREE',
          hammerjs: 'Hammer',
        },
        preserveModules: true,
      },
    },
    minify: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

---
### **7.2. `package.json` (Scripts y Dependencias)**
```json
{
  "name": "@blashstar/vue-360",
  "version": "1.0.0",
  "description": "Componente Vue.js para visor esférico 360° con soporte para imágenes y vídeos",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test:unit": "vitest run",
    "test:types": "tsd",
    "lint": "eslint . --ext .vue,.ts,.js",
    "prepare": "npm run build"
  },
  "files": ["dist"],
  "main": "./dist/vue-360.js",
  "module": "./dist/vue-360.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/vue-360.js",
      "types": "./dist/index.d.ts"
    }
  },
  "dependencies": {
    "vue": "^3.4.0",
    "three": "^0.160.0",
    "hammerjs": "^2.0.8"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "@types/hammerjs": "^2.0.41",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.0",
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0",
    "pug": "^3.0.2",
    "stylus": "^0.59.0",
    "tsd": "^0.29.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

---
### **7.3. `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

---

## **8. Pruebas Unitarias**
---
### **8.1. Configuración de Vitest (`tests/setup.ts`)**
```typescript
import { config } from '@vue/test-utils';
import { beforeEach, vi } from 'vitest';

// Mock de Three.js
vi.mock('three', () => ({
  Scene: class Scene {},
  PerspectiveCamera: class PerspectiveCamera {},
  WebGLRenderer: class WebGLRenderer {
    domElement = document.createElement('canvas');
    setSize = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
  },
  TextureLoader: class TextureLoader {
    load = vi.fn().mockReturnValue({
      colorSpace: 'SRGBColorSpace',
    });
  },
  VideoTexture: class VideoTexture {},
  SphereGeometry: class SphereGeometry {},
  MeshBasicMaterial: class MeshBasicMaterial {},
  Mesh: class Mesh {},
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
  Raycaster: class Raycaster {},
  Vector2: class Vector2 {},
  Vector3: class Vector3 {},
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
      recognizers = [];
    },
  };
});

// Configuración global para @vue/test-utils
config.global.stubs = {
  transition: false,
  'esfera-360': true,
  'marcador': true,
  'panel-informacion': true,
  'tooltip': true,
};
```

---
### **8.2. `vitest.config.ts`**
```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

---

## **9. Criterios de Aceptación**
---
### **9.1. Visualización de Medios**
- [ ] El visor carga y muestra correctamente una **imagen panorámica** en 360°.
- [ ] El visor carga y reproduce correctamente un **vídeo 360°** (con autoplay si está configurado).
- [ ] El usuario puede **pausar/reanudar** el vídeo desde la interfaz.
- [ ] El visor actualiza la textura al cambiar entre imagen y vídeo.
- [ ] La transición entre medios usa **fade suave**.

---
### **9.2. Controles Interactivos**
- [ ] **Mouse**:
  - [ ] Rotación con arrastrar (clic izquierdo).
  - [ ] Zoom con scroll.
- [ ] **Pantallas táctiles**:
  - [ ] Rotación con **swipe** (1 dedo).
  - [ ] Zoom con **pinch-to-zoom** (2 dedos).
  - [ ] Selección de marcadores con **tap** (1 dedo).
  - [ ] Resetear vista con **doble tap**.
- [ ] **Teclado**:
  - [ ] Flechas para rotar.
  - [ ] +/- para zoom.
  - [ ] Escape para cerrar panel.
- [ ] La sensibilidad de los controles es configurable.

---
### **9.3. Marcadores**
- [ ] Los marcadores se renderizan en las posiciones correctas (UV y esféricas).
- [ ] Soportan tipos **dom** y **esfera**.
- [ ] Soportan **tooltips** con hover y click.
- [ ] Los marcadores funcionan correctamente sobre **imágenes** y **vídeos**.
- [ ] Al hacer clic/tap en un marcador, se dispara la acción configurada:
  - [ ] Mostrar panel con título y contenido.
  - [ ] Cambiar el medio del visor (imagen/vídeo).
  - [ ] Navegar a una URL externa.
- [ ] Se pueden agregar/eliminar/actualizar marcadores vía API.
- [ ] `irAMarcador` anima la cámara hacia el marcador.

---
### **9.4. Panel de Información y Tooltip**
- [ ] El panel aparece al seleccionar un marcador con acción `mostrar_panel`.
- [ ] El panel se cierra al hacer clic en el botón "Cerrar".
- [ ] El panel no obstruye la vista principal.
- [ ] Los tooltips aparecen en hover/click según configuración.

---
### **9.5. API Programática**
- [ ] `rotarA(yaw, pitch, animar)` funciona correctamente.
- [ ] `zoomA(nivel, animar)` funciona correctamente.
- [ ] `irAMarcador(id, animar)` funciona correctamente.
- [ ] `obtenerEstado()` devuelve yaw, pitch y zoom actuales.
- [ ] `resetearVista(animar)` vuelve a la posición inicial.

---
### **9.6. Módulo ESM**
- [ ] El proyecto se compila como módulo ESM con `vite build`.
- [ ] Se puede importar en otro proyecto Vue.js:
  ```typescript
  import { VisorEsferico } from '@blashstar/vue-360';
  ```
- [ ] Los tipos TypeScript están disponibles y son correctos.

---
### **9.7. Pruebas Unitarias**
- [ ] Cobertura de pruebas > 90% (excluyendo `main.ts` y archivos de configuración).
- [ ] Todas las pruebas pasan en CI/CD.
- [ ] Las pruebas validan:
  - Renderizado de componentes.
  - Props y eventos.
  - Lógica de Three.js (mockada).
  - Lógica de controles táctiles.
  - Carga de imágenes y vídeos.
  - Animaciones y easing.
  - Eventos de teclado.

---
### **9.8. Código y Documentación**
- [ ] Todo el código (variables, funciones, comentarios) está en español.
- [ ] Los mensajes de commit siguen el formato:
  ```
  tipo(ámbito): descripción en español

  Ejemplos:
  feat(visor): añadir soporte para vídeos 360
  fix(esfera): corregir fugas de memoria al cambiar de medio
  test(tactil): añadir pruebas para gestos multitouch
  docs: actualizar README con ejemplos de uso
  ```
- [ ] La documentación (README, PRD) está en español.

---
### **9.9. Rendimiento**
- [ ] El visor mantiene **60 FPS** en dispositivos modernos (testeado con imágenes/vídeos 4K).
- [ ] No hay fugas de memoria al cambiar de medio o desmontar el componente.
- [ ] Los vídeos se bufferizan correctamente.
- [ ] La inercia usa easing suave.

---
### **9.10. Compatibilidad**
- [ ] Funciona en Chrome, Firefox, Edge y Safari (últimas 2 versiones).
- [ ] Funciona en dispositivos móviles (iOS/Android) con controles táctiles.

---

## **10. Sugerencias de Mejora (Backlog)**
| ID   | Sugerencia | Descripción | Prioridad |
|------|------------|-------------|-----------|
| S-001 | Soporte para HLS/DASH | Añadir soporte para streaming de vídeos 360° en formato HLS o DASH. | Media |
| S-002 | Marcadores animados | Permitir animaciones en marcadores (ej: pulsar, rotar). | Baja |
| S-003 | Modo VR | Integración con WebXR para realidad virtual. | Baja |
| S-004 | Guardar estado | Guardar/recuperar posición de cámara y marcadores en localStorage. | Media |
| S-005 | Personalización de controles | Permitir personalizar los controles (ej: botones en pantalla). | Media |
| S-006 | Soporte para audio | Añadir audio espacial para vídeos 360°. | Baja |
| S-007 | Storybook | Crear un Storybook para documentar componentes. | Baja |
| S-008 | Pruebas E2E | Añadir pruebas con Cypress o Playwright. | Media |
| S-009 | Optimización para móviles | Reducir el tamaño del bundle para móviles. | Alta |
| S-010 | Soporte para WebP/AVIF | Añadir soporte para formatos modernos de imagen/vídeo. | Media |
| S-011 | Marcadores polígono | Soportar marcadores tipo SVG (polígonos, polilíneas). | Baja |
| S-012 | imageLayer/videoLayer | Renderizar imágenes/vídeos como capas dentro de la escena 3D. | Baja |

---

## **11. Riesgos y Mitigaciones**
| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Rendimiento bajo en móviles con vídeos | Alto | Media | Usar compresión de vídeo (WebM) y reducir resolución. |
| Problemas de compatibilidad con iOS | Alto | Media | Testear en dispositivos iOS y usar `playsinline` + `muted` para autoplay. |
| Dificultad con Three.js + vídeos | Medio | Alta | Usar ejemplos oficiales de `THREE.VideoTexture`. |
| Fugas de memoria con vídeos | Alto | Media | Limpiar texturas de vídeo al cambiar de medio o desmontar. |
| Problemas con gestos táctiles | Medio | Media | Testear en dispositivos reales y usar librerías como Hammer.js. |
| Tamaño del bundle | Medio | Alta | Usar `rollup` para tree-shaking y cargar Three.js desde CDN. |

---

## **12. Entregables**
| Entregable | Descripción | Formato |
|------------|-------------|---------|
| Código fuente | Componentes Vue.js + Three.js + Hammer.js | Archivos `.vue`, `.ts` |
| Módulo ESM | Build listo para `node_modules` | `.mjs`, `.d.ts` |
| Documentación | Guía de instalación, uso y API | Markdown |
| Pruebas unitarias | Tests con Vitest | `.spec.ts` |
| Demo | Ejemplo de uso en `App.vue` | HTML + JS |
| Configuración | Archivos `vite.config.ts`, `tsconfig.json`, etc. | JSON/TS |
| Ejemplos | Imágenes y vídeos 360° de prueba | MP4, JPG, WebP |

---

## **13. Cronograma Estimado**
| Fase | Tareas | Duración |
|------|--------|----------|
| **Fase 1: Setup** | Configurar Vite, TypeScript, Vitest, dependencias | 1 día |
| **Fase 2: Componentes base** | Implementar `Esfera360`, `Marcador`, `PanelInformacion`, `Tooltip` | 3 días |
| **Fase 3: Soporte para vídeos** | Añadir `THREE.VideoTexture` y controles de reproducción | 2 días |
| **Fase 4: Controles táctiles** | Implementar gestos con Hammer.js | 2 días |
| **Fase 5: Teclado y animaciones** | Controles de teclado, easing, API programática | 2 días |
| **Fase 6: Integración** | Unificar en `VisorEsferico` y añadir lógica de eventos | 2 días |
| **Fase 7: Tipos y ESM** | Definir tipos TS y configurar build como módulo | 1 día |
| **Fase 8: Pruebas** | Escribir pruebas unitarias y validar cobertura | 3 días |
| **Fase 9: Documentación** | Escribir README, PRD y comentarios en código | 1 día |
| **Fase 10: Revisión** | Testear en navegadores y dispositivos | 2 días |
| **Total** | | **19 días** |

---

## **14. Recursos Adicionales**
---
### **14.1. Referencias Técnicas**
- [Documentación de Three.js](https://threejs.org/docs/)
- [Three.js y Vídeos 360°](https://threejs.org/docs/#manual/en/introduction/Creating-textures)
- [Hammer.js](http://hammerjs.github.io/)
- [GSAP](https://gsap.com/)
- [Vue 3 + TypeScript](https://vuejs.org/guide/typescript/overview.html)
- [Vite para librerías](https://vitejs.dev/guide/build.html#library-mode)
- [Pointer Events API](https://developer.mozilla.org/es/docs/Web/API/Pointer_events)
- [Photo-Sphere-Viewer](https://photo-sphere-viewer.js.org/) - Referencia de arquitectura

---
### **14.2. Ejemplo de `README.md`**
```markdown
# @blashstar/vue-360

Componente Vue.js para visualizar **imágenes y vídeos 360°** con marcadores interactivos, tooltips, controles de teclado y soporte para pantallas táctiles.

## Instalación

```bash
npm install @blashstar/vue-360
```

## Uso Básico

### Imagen 360°
```vue
<template>
  <VisorEsferico
    medio-inicial="/ruta/a/imagen-360.jpg"
    tipo-medio-inicial="imagen"
    :marcadores-iniciales="marcadores"
    @marcador-seleccionado="manejarMarcador"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { VisorEsferico } from '@blashstar/vue-360';
import type { Marcador } from '@blashstar/vue-360';

export default defineComponent({
  components: { VisorEsferico },
  setup() {
    const marcadores: Marcador[] = [
      {
        id: '1',
        posicion: { u: 0.5, v: 0.5 },
        titulo: 'Punto de interés',
        contenido: 'Descripción del punto.',
        accion: 'mostrar_panel',
        tooltip: { contenido: 'Haz clic para más info', trigger: 'hover' },
      },
    ];

    const manejarMarcador = (evento: { marcador: Marcador }) => {
      console.log('Marcador seleccionado:', evento.marcador);
    };

    return { marcadores, manejarMarcador };
  },
});
</script>
```

### Uso con Escenas (Recorridos Virtuales)
```vue
<template>
  <VisorEsferico
    ref="visor"
    :escenas-config="configEscenas"
    @escena-cambiada="manejarEscena"
    @marcador-seleccionado="manejarMarcador"
  />
  <div class="controles-escena">
    <button @click="visor?.escenaAnterior()">← Anterior</button>
    <span>Escena: {{ escenaActual }}</span>
    <button @click="visor?.siguienteEscena()">Siguiente →</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { VisorEsferico } from '@blashstar/vue-360';
import type { EscenaConfig, Marcador } from '@blashstar/vue-360';

export default defineComponent({
  components: { VisorEsferico },
  setup() {
    const visor = ref<InstanceType<typeof VisorEsferico>>();
    const escenaActual = ref('sala');

    const marcadoresSala: Marcador[] = [
      {
        id: 'a-cocina',
        posicion: { u: 0.8, v: 0.5 },
        titulo: 'Cocina',
        contenido: 'Ir a la cocina',
        accion: 'cambiar_escena',
      },
    ];

    const marcadoresCocina: Marcador[] = [
      {
        id: 'a-sala',
        posicion: { u: 0.2, v: 0.5 },
        titulo: 'Sala',
        contenido: 'Volver a la sala',
        accion: 'cambiar_escena',
      },
    ];

    const configEscenas: EscenaConfig = {
      escenas: [
        {
          id: 'sala',
          medio: '/ruta/a/sala-360.jpg',
          tipoMedio: 'imagen',
          marcadores: marcadoresSala,
          posicionInicial: { yaw: 0, pitch: 0 },
          zoomInicial: 50,
        },
        {
          id: 'cocina',
          medio: '/ruta/a/cocina-360.jpg',
          tipoMedio: 'imagen',
          marcadores: marcadoresCocina,
          posicionInicial: { yaw: 180, pitch: 0 },
          zoomInicial: 60,
        },
      ],
      escenaInicial: 'sala',
    };

    const manejarEscena = ({ escenaId }: { escenaId: string }) => {
      escenaActual.value = escenaId;
    };

    const manejarMarcador = (evento: { marcador: Marcador }) => {
      if (evento.marcador.accion === 'cambiar_escena') {
        const destino = evento.marcador.id === 'a-cocina' ? 'cocina' : 'sala';
        visor.value?.cambiarEscena(destino);
      }
    };

    return { visor, escenaActual, configEscenas, manejarEscena, manejarMarcador };
  },
});
</script>
```

### API Programática (Template Ref)
```vue
<template>
  <VisorEsferico ref="visor" medio-inicial="/imagen.jpg" />
  <button @click="irAlMarcador">Ir al marcador</button>
</template>

<script setup>
import { ref } from 'vue';
const visor = ref();

const irAlMarcador = () => {
  visor.value.irAMarcador('marcador-1', true);
};
</script>
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `medioInicial` | `string` | - | URL de la imagen o vídeo inicial. |
| `tipoMedioInicial` | `'imagen' \| 'video'` | `'imagen'` | Tipo de medio inicial. |
| `marcadoresIniciales` | `Marcador[]` | `[]` | Lista de marcadores. |
| `colorFondo` | `string` | `'#000000'` | Color de fondo del visor. |
| `sensibilidadRotacion` | `number` | `1` | Sensibilidad de rotación. |
| `sensibilidadZoom` | `number` | `1` | Sensibilidad de zoom. |
| `autoReproducir` | `boolean` | `true` | Autoplay para vídeos. |
| `controlesTactiles` | `boolean` | `true` | Habilitar controles táctiles. |
| `controlesMouse` | `boolean` | `true` | Habilitar controles de mouse. |
| `tecladoHabilitado` | `boolean` | `true` | Habilitar controles de teclado. |
| `posicionInicial` | `CoordenadaEsferica` | `{yaw:0, pitch:0}` | Posición inicial de la cámara. |
| `zoomInicial` | `number` | `50` | Zoom inicial (0-100). |
| `escenasConfig` | `EscenaConfig` | `undefined` | Configuración de escenas para recorridos virtuales. Cuando se proporciona, `medioInicial`, `tipoMedioInicial` y `marcadoresIniciales` se ignoran. |

## Eventos

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `marcador-seleccionado` | `{ marcador: Marcador, dobleClick?: boolean }` | Se emite al seleccionar un marcador. |
| `medio-cambiado` | `{ url: string, tipoMedio: TipoMedio }` | Se emite al cambiar el medio. |
| `video-pausado` | - | Se emite al pausar el vídeo. |
| `video-reanudado` | - | Se emite al reanudar el vídeo. |
| `escena-cambiada` | `{ escenaId: string, escena: Escena }` | Se emite al cambiar de escena (modo recorrido virtual). |

## API (Template Ref)

| Método | Descripción |
|--------|-------------|
| `rotarA(yaw, pitch, animar?)` | Rotar la cámara. |
| `zoomA(nivel, animar?)` | Establecer zoom (0-100). |
| `irAMarcador(id, animar?)` | Navegar a un marcador. |
| `agregarMarcador(marcador)` | Agregar marcador dinámicamente. |
| `eliminarMarcador(id)` | Eliminar marcador. |
| `actualizarMarcador({id, ...})` | Actualizar marcador. |
| `limpiarMarcadores()` | Eliminar todos los marcadores. |
| `mostrarMarcador(id)` | Mostrar marcador oculto. |
| `ocultarMarcador(id)` | Ocultar marcador. |
| `resetearVista(animar?)` | Volver a posición inicial. |
| `obtenerEstado()` | Obtener {yaw, pitch, zoom}. |
| `cambiarEscena(id)` | Cambiar a una escena específica por su ID. |
| `cargarEscena(id)` | Alias de `cambiarEscena`. |
| `siguienteEscena()` | Avanzar a la siguiente escena en la lista. |
| `escenaAnterior()` | Retroceder a la escena anterior en la lista. |

## Tipos

```typescript
import type {
  Marcador,
  CoordenadaEsferica,
  CoordenadaTextura,
  AccionMarcador,
  TipoMedio,
  TooltipConfig,
  ApiVisorEsferico,
  Escena,
  EscenaConfig,
} from '@blashstar/vue-360';
```
```

---
### **14.3. Ejemplo de `.gitignore`**
```
node_modules/
dist/
coverage/
*.log
*.md
.DS_Store
.env
.env.local
.env.*.local
```

---
### **14.4. Ejemplo de `index.html` (para demo)**
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Visor 360° - Demo</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
      }
      #app {
        width: 100vw;
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---
### **14.5. Ejemplo de `main.ts` (para demo)**
```typescript
import { createApp } from 'vue';
import App from './App.vue';

// Montar la aplicación solo en modo desarrollo (no en el build de librería)
if (import.meta.env.MODE !== 'library') {
  createApp(App).mount('#app');
}
```

---
### **14.6. Ejemplo de `App.vue` (para demo)**
```vue
<template lang="pug">
div
  h1 Visor 360° - Demo
  div(style="width: 100%; height: 500px; margin: 20px 0;")
    VisorEsferico(
      :medio-inicial="medioActual"
      :tipo-medio-inicial="tipoMedioActual"
      :marcadores-iniciales="marcadores"
      :auto-reproducir="true"
      @marcador-seleccionado="manejarMarcador"
      @medio-cambiado="manejarCambioMedio"
    )
  div(style="padding: 20px; text-align: center;")
    button(@click="cambiarAImagen") Cargar Imagen
    button(@click="cambiarAVideo") Cargar Vídeo
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import VisorEsferico from './components/VisorEsferico/VisorEsferico.vue';
import type { Marcador } from './components/VisorEsferico/tipos';

export default defineComponent({
  name: 'App',
  components: { VisorEsferico },
  setup() {
    const medioActual = ref<string>('/ejemplos/malla.png');
    const tipoMedioActual = ref<'imagen' | 'video'>('imagen');

    const marcadores: Marcador[] = [
      {
        id: '1',
        posicion: { u: 0.5, v: 0.5 },
        titulo: 'Mirador',
        contenido: 'Vista panorámica del mirador.',
        accion: 'mostrar_panel',
        tooltip: { contenido: 'Ver información', trigger: 'hover' },
      },
      {
        id: '2',
        posicion: { yaw: 1.2, pitch: 0 },
        titulo: 'Cambiar a vídeo',
        url: '/ejemplos/video_360_SD.mp4',
        tipoMedio: 'video',
        accion: 'cambiar_contenido',
      },
      {
        id: '3',
        posicion: { u: 0.25, v: 0.75 },
        titulo: 'Sitio web',
        url: 'https://ejemplo.com',
        accion: 'navegar',
      },
    ];

    const manejarMarcador = (evento: { marcador: Marcador }) => {
      console.log('Marcador seleccionado:', evento.marcador.titulo);
    };

    const manejarCambioMedio = (evento: { url: string; tipoMedio: 'imagen' | 'video' }) => {
      console.log('Medio cambiado a:', evento.url);
    };

    const cambiarAImagen = () => {
      medioActual.value = '/ejemplos/malla.png';
      tipoMedioActual.value = 'imagen';
    };

    const cambiarAVideo = () => {
      medioActual.value = '/ejemplos/video_360_SD.mp4';
      tipoMedioActual.value = 'video';
    };

    return {
      medioActual,
      tipoMedioActual,
      marcadores,
      manejarMarcador,
      manejarCambioMedio,
      cambiarAImagen,
      cambiarAVideo,
    };
  },
});
</script>
```

---

## **15. Glosario**
| Término | Definición |
|---------|------------|
| **ESM** | *ECMAScript Modules*: Formato estándar para módulos en JavaScript moderno. |
| **Three.js** | Librería JavaScript para renderizado 3D en el navegador. |
| **Vue.js** | Framework progresivo para construir interfaces de usuario. |
| **Vite** | Herramienta de build para proyectos frontend modernos. |
| **Hammer.js** | Librería para detección de gestos táctiles. |
| **VideoTexture** | Textura de Three.js que usa un elemento `<video>` como fuente. |
| **Equirectangular** | Proyección de imagen/vídeo 360° en un rectángulo 2:1. |
| **Raycasting** | Técnica para detectar intersecciones entre un rayo y objetos 3D. |
| **OrbitControls** | Controlador de Three.js para navegar en una escena 3D. |
| **Tree Shaking** | Técnica para eliminar código no utilizado en el build final. |
| **GSAP** | Librería de animación JavaScript de alto rendimiento. |
| **Pointer Events** | API del navegador para manejar eventos de puntero (mouse, touch, pen). |
| **Pinch-to-zoom** | Gesto táctil con dos dedos para hacer zoom. |
| **Swipe** | Gesto táctil de arrastrar con un dedo. |
| **Tap** | Gesto táctil de tocar con un dedo. |
| **Yaw** | Ángulo horizontal en coordenadas esféricas (equivalente a longitud/azimuth). |
| **Pitch** | Ángulo vertical en coordenadas esféricas (equivalente a latitud/elevación). |
| **Easing** | Función que controla la velocidad de una animación. |

---
---
**Nota final:**
Este documento debe ser revisado y aprobado por el equipo antes de iniciar el desarrollo. Se recomienda:
1. **Configurar un repositorio Git** con la estructura de carpetas propuesta.
2. **Configurar GitHub Actions** para ejecutar pruebas y build en cada push.
3. **Usar conventional commits en español** para el historial de cambios.
4. **Testear en dispositivos reales** (especialmente iOS/Android) para validar los controles táctiles.
5. **Documentar cualquier desviación** de los requisitos en el `README.md`.
6. **Optimizar el bundle** para móviles (ej: cargar Three.js desde CDN).

---
