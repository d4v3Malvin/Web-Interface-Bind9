import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DnsLogView from '../views/DnsLogView.vue'

import domainblockview from '../views/DomainBlockView.vue'

import dnscache from '../views/DnsCacheView.vue'

import dnsstats from '../views/DnsStats.vue'

import AllowedClientView from "../views/AllowedClientView.vue"

import dnsSetting from "../views/SettingView.vue"

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/client-block',
    name: 'Client Block',
    component: AllowedClientView
  },
  {
    path: '/domain-block',
    name: 'Domain Block',
    component: domainblockview
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
    component: DnsLogView
  },
  {
    path: '/dns-cache',
    name: 'DNS Cache',
    component: dnscache
  },
  {
    path: '/stats',
    name: 'DNS Statistics',
    component: dnsstats
  },
  {
    path: '/setting',
    name: 'DNS Setting',
    component: dnsSetting
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
