import "./assets/main.css";
import { Icon } from "@iconify/vue";

import { createApp } from "vue";
import App from "./App.vue";

import Notifications from '@kyvg/vue3-notification'

const app = createApp(App);

app.component("Icon", Icon);
app.use(Notifications)

app.mount("#app");
