import { createApp } from 'vue'

import App from './App.vue'

import 'normalize.css'
import './assets/main.css'
import '@arco-design/web-vue/es/message/style/css.js'
import '@arco-design/web-vue/es/button/style/css.js'

// 移除了未实际使用的 pinia 与 vue-router（应用为单页，路由和全局状态均未用到）

const app = createApp(App)

app.mount('#app')
