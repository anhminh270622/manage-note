<template>
  <a-config-provider :theme="theme">
    <div v-if="isLogin">
      <a-layout>
        <a-layout-header class="layout-header">
          <Header/>
        </a-layout-header>
        <a-layout>
          <a-layout-sider class="layout-sider">
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
import Login from "@/components/login/Login.vue";

export default {
  name: "App",
  components: {
    Login,
    Header,
    SideBar,
    RouterView
  },
  data() {
    return {
      theme,
      isLogin: false,
    };
  },
  mounted() {
    this.isLogin = localStorage.getItem("isLogin");
  }
}
</script>

<style scoped>
.layout-header {
  position: fixed;
  z-index: 1;
  right: 0;
  left: 0;
  text-align: center;
  height: 64px;
  padding-inline: 50px;
  line-height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 21, 41, 0.2);
}

.layout-content {
  margin: 84px 20px 20px 20px;
  text-align: center;
  height: calc(100vh - 104px);
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 21, 41, 0.2);
  padding: 10px;
}

.layout-sider {
  margin-top: 84px;
  text-align: center;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 21, 41, 0.2);

}

</style>