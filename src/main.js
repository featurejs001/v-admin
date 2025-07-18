import { createApp } from 'vue'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '@/assets/styles/common.less'
import App from './App.vue'
import router from '@/router/index';
import pinia from '@/store/index';
import "@/permission";
import deviceStylePlugin from '@/plugins/device';

const app = createApp(App)
app.use(deviceStylePlugin )

app.use(Antd)

// app.use(ElementPlus, {
//   locale: zhCn,
// })
app.use(router)
app.use(pinia)
app.mount('#app')
