<script>
import { UserOutlined } from '@ant-design/icons-vue';
import { logoutFirebaseAuth } from "@/api/firebaseAuth.js";

export default {
  name: 'Header',
  components: { UserOutlined },
  data() {
    return {
      isLogin: false,
      infoProfile: {},
      showLogout: false,
    };
  },
  mounted() {
    this.isLogin = localStorage.getItem('isLogin');
    this.infoProfile = JSON.parse(localStorage.getItem('user')) || {};
  },
  methods: {
    UserOutlined,
    onHome() {
      this.$router.push('/');
    },
    async onLogout() {
      try {
        await logoutFirebaseAuth();
      } catch (error) {
        // Bỏ qua lỗi signOut để vẫn dọn session local.
      }
      localStorage.removeItem('isLogin');
      localStorage.removeItem('user');
      this.isLogin = false;
      this.$message.success('Đăng xuất thành công!');
      this.$router.push('/login');
    }
  }
}
</script>

<template>
  <div class="wrapper">
    <img src="/logo.png" alt="Logo" class="logo" @click="onHome"/>
    <div v-if="isLogin" class="login">
      <span class="welcome-text">Xin chào, {{ infoProfile.username }}</span>
      <img src="/avatar-login.avif" alt="Avatar" class="avatar" @mouseover="showLogout = true">
      <ul class="info" v-if="showLogout" @mouseleave="showLogout = false">
        <li>Cài đặt</li>
        <li @click="onLogout">Đăng xuất</li>
      </ul>
    </div>
    <div v-else>
      <a-avatar :size="40">
        <template #icon>
          <UserOutlined/>
        </template>
      </a-avatar>
    </div>

  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  height: 64px;
  background-color: transparent;
}

.logo {
  height: 38px;
  cursor: pointer;
}

.login {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome-text {
  color: #334155;
  font-weight: 500;
}

.avatar {
  cursor: pointer;
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
}

li {
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  text-align: left;
  padding: 0 12px;
  transition: all 0.2s ease;
}

li:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.info {
  position: absolute;
  top: 56px;
  right: 8px;
  background-color: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  width: 140px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}
</style>