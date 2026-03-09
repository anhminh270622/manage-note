<template>
  <a-config-provider :theme="theme">
    <div v-if="showMainLayout">
      <a-layout>
        <a-layout-header class="layout-header">
          <Header/>
        </a-layout-header>
        <a-layout>
          <a-layout-sider class="layout-sider" :width="240">
            <SideBar/>
          </a-layout-sider>
          <a-layout-content class="layout-content">
            <main>
              <RouterView/>
            </main>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </div>
    <div v-else>
      <RouterView/>
    </div>
  </a-config-provider>
</template>

<script>

import Header from "@/components/header/Header.vue";
import SideBar from "@/components/sidebar/SideBar.vue";
import { RouterView } from "vue-router";
import "./main.css"
import theme from "@/themeConfig.js";

export default {
  name: "App",
  components: {
    Header,
    SideBar,
    RouterView
  },
  data() {
    return {
      theme
    };
  },
  computed: {
    showMainLayout() {
      const isLoggedIn = localStorage.getItem("isLogin") === "true";
      const isAuthRoute = this.$route?.meta?.requiresAuth !== false;
      return isLoggedIn && isAuthRoute;
    }
  }
}
</script>

<style scoped>
.layout-header {
  position: fixed;
  z-index: 10;
  right: 0;
  left: 0;
  text-align: center;
  height: 64px;
  padding-inline: 24px;
  line-height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.layout-content {
  margin: 80px 20px 20px 16px;
  text-align: left;
  min-height: calc(100vh - 100px);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  padding: 16px;
  overflow: auto;
}

.layout-sider {
  margin-top: 80px;
  text-align: center;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  min-height: calc(100vh - 80px);
  box-shadow: 8px 0 24px rgba(15, 23, 42, 0.04);
}

</style>