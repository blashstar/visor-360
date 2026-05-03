import VisorEsferico from './components/VisorEsferico/VisorEsferico.vue';
import Esfera360 from './components/VisorEsferico/Esfera360.vue';
import Marcador from './components/VisorEsferico/Marcador.vue';
import PanelInformacion from './components/VisorEsferico/PanelInformacion.vue';
import Tooltip from './components/VisorEsferico/Tooltip.vue';
import ControlesVideo from './components/VisorEsferico/ControlesVideo.vue';

// Exportar componentes individuales
export { VisorEsferico, Esfera360, Marcador as MarcadorVue, PanelInformacion, Tooltip, ControlesVideo };

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
  Escena,
  ConfiguracionEscena,
  ConfiguracionVideo,
  EstadoVideo,
  EventoMarcadorSeleccionado,
  EventoMedioCambiado,
  EventoEscenaCambiada,
  EstadoCamara,
  ApiEsfera360,
  ApiVisorEsferico,
} from './components/VisorEsferico/tipos';

// Exportar utilidades
export { normalizarYaw, diferenciaAngular, EasingVisor } from './utils/animaciones';

// Exportar componente principal por defecto
export default VisorEsferico;
