import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from "@/components/dashboard/Dashboard.vue";
import DashboardPassword from "@/components/list-password/Dashboard.vue";
import Revenue from "@/components/revenue/Revenue.vue";
import ListPassword from "@/components/list-password/ListPassword.vue";
import Login from "@/components/login/Login.vue";
import Register from "@/components/register/Register.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/list-password',
        name: 'DashboardPassword',
        component: DashboardPassword,
        meta: { requiresAuth: true }
    },
    {
        path: '/list-password/:passwordType',
        name: 'ListPassword',
        component: ListPassword,
        meta: { requiresAuth: true }
    },
    {
        path: '/revenue',
        name: 'Revenue',
        component: Revenue,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: {
            requiresAuth: false
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('isLogin'); // hoặc kiểm tra token, trạng thái từ pinia

    if (to.meta.requiresAuth === false) {
        next();
    } else if (!isLoggedIn) {
        next('/login');
    } else {
        next();
    }
});

export default router;
