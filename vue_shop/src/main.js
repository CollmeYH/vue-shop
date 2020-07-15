import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
Vue.use(VueQuillEditor)
// 配置请求根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// 配置axios请求拦截器，拦截每一个请求然后加上一个请求头属性
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
// 定义全局时间过滤器
Vue.filter('dateFormat', function (originVal) {
  if (originVal) {
    var date = new Date(originVal * 1000) // *1000是毫秒值
    const Y = date.getFullYear() + '-'
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
    const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
    const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
    return Y + M + D + h + m + s
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
