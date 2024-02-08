import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import DnsLogView from '../views/DnsLogView.vue'

import domainblockview from '../views/DomainBlockView.vue'

import testaxios from '../views/testaxios.vue'

import dnscache from '../views/DnsCacheView.vue'

import dnsstats from '../views/DnsStats.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    // component: HomeView
    component: testaxios
  },
  {
    path: '/domain-block',
    name: 'Domain Block',
    component: domainblockview
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
