import { appWindow } from "@tauri-apps/api/window";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { usePortForwardsStore } from "./stores/port-forwards.ts";
import { initRunPortForward } from "./services/port-forward.ts";
import App from "./App.vue";
import "./assets/style.css";

const pinia = createPinia();
const app = createApp(App);

void initRunPortForward();
app.use(pinia);
app.mount("#app");

// Kill all remaining subprocess still running on app close
void appWindow.onCloseRequested(() => usePortForwardsStore().processes.forEach((p) => p.kill()));
