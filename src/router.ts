import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/du-an', name: 'projects', component: () => import('./views/ProjectsView.vue') },
    { path: '/du-an/:slug', name: 'project', component: () => import('./views/ProjectDetailView.vue'), props: true },
    { path: '/dang-ky-tu-van', name: 'consult', component: () => import('./views/ConsultView.vue') },
    // Chỉ khi dev: xem các dáng của nhân vật tư vấn
    ...(import.meta.env.DEV ? [{ path: '/__nhan-vat', name: 'rig', component: () => import('./views/RigPreview.vue') }] : []),
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue') },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    // Chỉ đổi bộ lọc trên cùng trang danh sách: giữ vị trí cuộn
    if (to.name === 'projects' && from.name === 'projects') return false
    if (to.hash) return { el: to.hash, top: 84, behavior: 'smooth' }
    return { top: 0 }
  },
})
