import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from "@/components/dashboard/Dashboard.vue";
import DashboardPassword from "@/components/list-password/Dashboard.vue";
import Revenue from "@/components/revenue/Revenue.vue";
import ListPassword from "@/components/list-password/ListPassword.vue";
import Login from "@/components/login/Login.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        component: Dashboard,
    },
    {
        path: '/list-password',
        name: 'DashboardPassword',
        component: DashboardPassword,
    },
    {
        path: '/list-password/:passwordType',
        name: 'ListPassword',
        component: ListPassword,
    },
    {
        path: '/revenue',
        name: 'Revenue',
        component: Revenue,
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router