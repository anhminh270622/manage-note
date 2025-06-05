<script>
import tableData from "@/components/login/tableData.js";
import { getAllUsers } from "@/api/user.js";

export default {
  name: 'Login',
  data() {
    return {
      dataLogin: tableData.dataLogin,
      formState: {
        username: '',
        password: '',
        remember: false,
      },
    };
  },
  mounted() {
    this.getAllUser();
  },
  methods: {
    onFinish(values) {
      if (values.username && values.password) {
        const usersArray = Object.values(this.dataLogin); // chuyển thành mảng
        const user = usersArray.find(user =>
            user.username === values.username && user.password === values.password
        );

        if (user) {
          this.$message.success('Đăng nhập thành công!');
          setTimeout(() => {
            this.$router.push({ path: '/' }).then(() => {
              window.location.reload();
            });
          }, 1000);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isLogin', true);
        } else {
          this.$message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
        }
      }
    },
    async getAllUser() {
      await getAllUsers().then(res => {
        this.dataLogin = res.data
      }).catch(error => {
        this.$message.error('Lỗi khi tải dữ liệu người dùng: ' + error.message);
      })
    },
  }
};
</script>

<template>
  <a-form
      :model="formState"
      name="basic"
      layout="vertical"
      autocomplete="off"
      @finish="onFinish"
      class="login-form"
      ref="loginForm"
  >
    <h2>Đăng nhập</h2>
    <a-form-item
        label="Tên đăng nhập"
        name="username"
        :rules="[{ required: true, message: 'Nhập tên đăng nhập!' }]"
    >
      <a-input v-model:value="formState.username"/>
    </a-form-item>

    <a-form-item
        label="Mật khẩu"
        name="password"
        :rules="[{ required: true, message: 'Nhập mật khẩu!' }]"
    >
      <a-input-password v-model:value="formState.password"/>
    </a-form-item>
    <a-form-item style="text-align: right">
      Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
    </a-form-item>
    <a-form-item class="login-button">
      <a-button type="primary" html-type="submit">Đăng nhập</a-button>
    </a-form-item>
  </a-form>
</template>

<style scoped>
.login-form {
  width: 400px;
  margin: 100px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-button {
  text-align: right;
}

.ant-form-item-control-input {
  width: 100%;
}

.ant-form-item {
  width: 100%;
}
</style>