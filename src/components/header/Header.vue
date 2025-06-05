<script>
import { UserOutlined } from '@ant-design/icons-vue';

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
    onLogout() {
      localStorage.removeItem('isLogin');
      localStorage.removeItem('user');
      this.isLogin = false;
      this.$message.success('Đăng xuất thành công!');
      setTimeout(() => {
        this.$router.push('/login').then(() => {
          window.location.reload();
        });
      }, 700);
    }
  }
}
</script>

<template>
  <div class="wrapper">
    <img src="/logo.png" alt="Logo" style="height: 40px; cursor: pointer" @click="onHome"/>
    <div v-if="isLogin" class="login">
      <span style="padding-right: 10px">Xin chào, {{ infoProfile.username }}</span>
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
  padding: 0 20px;
  height: 64px;
  background-color: #ffffff;
}

.avatar {
  cursor: pointer;
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

li {
  cursor: pointer;
  height: 40px;
  line-height: 40px;
  text-align: left;
  padding: 0 10px;
}

li:hover {
  background-color: darkolivegreen;
}

.info {
  position: absolute;
  top: 53px;
  right: 21px;
  background-color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  width: 130px;
}
</style>