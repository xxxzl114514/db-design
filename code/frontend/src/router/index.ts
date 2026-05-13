import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import VesselsView from '../views/VesselsView.vue'
import AnchoragesView from '../views/AnchoragesView.vue'
import TripsView from '../views/TripsView.vue'
import SearchView from '../views/SearchView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/vessels',
      name: 'vessels',
      component: VesselsView
    },
    {
      path: '/anchorages',
      name: 'anchorages',
      component: AnchoragesView
    },
    {
      path: '/trips',
      name: 'trips',
      component: TripsView
    },
    {
      path: '/vessels/:id',
      name: 'vesselDetail',
      component: () => import('../views/VesselDetailView.vue')
    },
    {
      path: '/anchorages/:id',
      name: 'anchorageDetail',
      component: () => import('../views/AnchorageDetailView.vue')
    },
    {
      path: '/trips/:id',
      name: 'tripDetail',
      component: () => import('../views/TripDetailView.vue')
    }
  ]
})

export default router
