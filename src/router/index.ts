import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/globe',
        },
        {
            path: '/globe',
            name: 'geoportal',
            component: () => import('../components/GeoportalView.vue'),
        },
    ],
})

export default router
