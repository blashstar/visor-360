/**
 * Tipos TypeScript compartidos para el visor esférico 360°.
 */

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
 * Estado de reproducción del video expuesto por Esfera360.
 */
export interface EstadoVideo {
  reproduciendo: boolean;
  tiempoActual: number;
  duracion: number;
  muteado: boolean;
  volumen: number;
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
 * Define una escena completa del visor: medio + marcadores + configuración de cámara.
 */
export interface Escena {
  /** Identificador único de la escena. */
  id: string;
  /** URL del medio (imagen o vídeo). */
  medio: string;
  /** Tipo de medio (default: 'imagen'). */
  tipoMedio?: TipoMedio;
  /** Lista de marcadores de la escena. */
  marcadores?: Marcador[];
  /** Posición inicial de la cámara para esta escena. */
  posicionInicial?: CoordenadaEsferica;
  /** Zoom inicial para esta escena (0-100, default: 50). */
  zoomInicial?: number;
}

/**
 * Configuración de una escena para cargar dinámicamente.
 */
export interface ConfiguracionEscena {
  /** Escenas disponibles. */
  escenas: Escena[];
  /** ID de la escena inicial (default: la primera). */
  escenaInicial?: string;
  /** Duración de la transición entre escenas en ms (default: 300). */
  duracionTransicion?: number;
}

/**
 * Evento emitido al cambiar de escena.
 */
export interface EventoEscenaCambiada {
  /** Escena anterior. */
  escenaAnterior?: Escena;
  /** Escena actual. */
  escenaActual: Escena;
  /** Índice de la escena actual. */
  indice: number;
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
