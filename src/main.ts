import { createApp } from 'vue';
import App from './App.vue';

// Montar la aplicación solo en modo desarrollo (no en el build de librería)
if (import.meta.env.MODE !== 'library') {
  createApp(App).mount('#app');
}
