import Vue from 'vue'
import App from './App.vue'

// 手动配置element-ui
// 1. 导入组件库
import ElementUI from 'element-ui';
// 2. 导入组件相关样式
import 'element-ui/lib/theme-chalk/index.css';
// 3. 配置Vue插件
Vue.use(ElementUI);

// 配置axios
// 1. 导入axios
import axios from 'axios'
// 2. 配置请求的根路径
axios.defaults.baseURL = "https://www.liulongbin.top:8888/api/private/v1/"

// 配置拦截器
axios.interceptors.request.use(config=> {
  // 在请求头中添加 Authorization 字段 保存 token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须  return config
  return config
})
// 3. 将 axios 添加到Vue的原型上
Vue.prototype.$http = axios

// 导入全局样式表
import './assets/css/global.css'

import router from "./router"
import VueQuillEditor from "./vue-quill-editor";

Vue.config.productionTip = false

// 往 vue 的原型上添加 router 这个属性
// Vue.prototype.$router = router

new Vue({
  render: h => h(App),
  router,
  VueQuillEditor,
}).$mount('#app')
