import Vue from 'vue'

import App from './App.vue'

import router from './router'
// TODO:[*] 19-11-08 修改路径为store路径下，不再是index.ts，可能导致之前的一些问题
import store from './store/index'
// import store from "./store";

// import jquery from "jquery";
import jquery from 'jquery'
// 注意使用bt还需要同时引入：jquery与popper.js
// 引入bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// TODO:[-] 20-01-27 加入了bootstrap-vue
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
// 引入element ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/index.css'
// 引入echarts
import echarts from 'echarts'
// 引入moment
// import moment from "vue-moment";
import moment from 'moment'

// TODO:[-] 19-11-19 引入font awesome
// import fontawesome from "@fortawesome/fontawesome";
// import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
// import solid from "@fortawesome/fontawesome-free-solid";
// import regular from "@fortawesome/fontawesome-free-regular";
// import brands from "@fortawesome/fontawesome-free-brands";

// import 'font-awesome/css/font-awesome.css'
// import '@fortawesome/fontawesome-free'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

// TODO:[-] 20-09-09 由于需要引入第三方的静态js
// 使用vue-plugin-load-script
// https://www.npmjs.com/package/vue-plugin-load-script
import LoadScript from 'vue-plugin-load-script'

// fontawesome.library.add(solid);
// fontawesome.library.add(regular);
// fontawesome.library.add(brands);
// Vue.component("font-awesome-icon", FontAwesomeIcon);

// TODO:[-] 21-01-14 为 vue 引入 underscore
import underscore from 'underscore'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(LoadScript)
// Vue.use(moment);
Vue.prototype.moment = moment
// 引入 underscore
Vue.prototype._ = underscore
// 引入 echarts
Vue.prototype.$echarts = echarts
// 20-09-0 引入 leaflet-windbarb.js
// Vue.loadScript('@/common/leaflet-windbarb')
// Vue.loadScript('./common/leaflet-windbarb.js')
new Vue({
    router,
    store,
    render: (h) => h(App)
}).$mount('#app')
