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
  Escena,
  ConfiguracionEscena,
  EventoMarcadorSeleccionado,
  EventoMedioCambiado,
  EventoEscenaCambiada,
  EstadoCamara,
  PropsVisorEsferico,
  EventosVisorEsferico,
  ApiVisorEsferico,
} from './components/VisorEsferico/tipos';

// Exportar utilidades
export { normalizarYaw, diferenciaAngular, EasingVisor } from './utils/animaciones';

// Exportar componente principal por defecto
export default VisorEsferico;
