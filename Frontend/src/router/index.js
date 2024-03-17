import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DnsLogView from '../views/DnsLogView.vue'

import domainblockview from '../views/DomainBlockView.vue'

import dnscache from '../views/DnsCacheView.vue'

import dnsstats from '../views/DnsStats.vue'

import AllowedClientView from "../views/AllowedClientView.vue"

import loginForm from "../views/LoginView.vue"

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requestLogin: true }
  },
  {
    path: '/client-block',
    name: 'Client Block',
    component: AllowedClientView,
    meta: { requestLogin: true }
  },
  {
    path: '/domain-block',
    name: 'Domain Block',
    component: domainblockview,
    meta: { requestLogin: true }
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // },
  {
    path: '/dns-log',
    name: 'DNS Log',
    component: DnsLogView,
    meta: { requestLogin: true }
  },
  {
    path: '/dns-cache',
    name: 'DNS Cache',
    component: dnscache,
    meta: { requestLogin: true }
  },
  {
    path: '/stats',
    name: 'DNS Statistics',
    component: dnsstats,
    meta: { requestLogin: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: loginForm,
    meta: { islogin: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const userCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user='))
  if (to.meta.requestLogin && !userCookie){
    next('/login')
  }
  else if (to.meta.islogin && userCookie){
    next(from.path)
  }
  else{
    next()
  }
})

export default router
