import Vue from "vue"
import VueRouter from "vue-router"
import {nextDate} from "element-ui/src/utils/date-util";

// import Login from "../components/Login.vue"

// 路由懒加载
const Login = ()=> import('../components/Login.vue')
const Home = ()=> import('../components/Home.vue')

// 1. 安装
Vue.use(VueRouter)

const routes = [
  { path: "/", redirect: "/login" },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

// 2. 创建router实例
const router = new VueRouter({
  routes,
})

// 导航守卫
// to: 将要访问的路径
// from: 代表从哪个路径跳转而来
// next: 是一个函数, 代表放行
// next(): 放行    next('/home'): 强制跳转
router.beforeEach((to, from, next) => {
  // // 如果将要访问登录页直接放行
  // if (to.path === '/login') return next()
  // // 如果token没有值,强制跳转到login
  // const tokenStr = window.sessionStorage.getItem('token')
  // if (!tokenStr) return next('/login')
  // next()
  if (to.path === '/login') {
    next()
  } else {
      const tokenStr = window.sessionStorage.getItem('token')
      if (!tokenStr) {
        next('/login')
      } else {
        next()
      }
    }
})


// 3. 导出
export default router
