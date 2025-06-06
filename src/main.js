import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css';
import Antd from 'ant-design-vue';

const app = createApp(App)
app.use(router).use(Antd)
app.mount('#app')