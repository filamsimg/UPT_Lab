import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import { useAuthStore } from '@/stores/useAuthStore';


// Create Vue application instance
const app = createApp(App);

// Create and install Pinia once
const pinia = createPinia();
app.use(pinia);

// Install Vue Router
app.use(router);

// Wait for the router to be ready, initialize auth store (restore token/user), then mount.
router.isReady().then(async () => {
  // Use the already-installed Pinia instance; the store will be available.
  const authStore = useAuthStore();
  await authStore.init({ skipIfNoSession: true }); // jangan spam error di mode tamu

  app.mount('#app');
});
