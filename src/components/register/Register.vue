<script>
import tableData from "@/components/login/tableData.js";
import { getAllUsers, registerUser } from "@/api/user.js";

export default {
  name: "Register",
  data() {
    return {
      dataLogin: tableData.dataLogin,
      formState: {
        username: '',
        password: '',
        remember: false,
      },
      userAll: [],
      isLoading: false
    };
  },
  mounted() {
    this.getAllUser()
  },
  methods: {
    async onFinish() {
      try {
        await this.$refs.registerForm.validate();
        this.isLoading = true;
        const { username, password } = this.formState;
        const existingUser = this.userAll.find(user => user.username === username);
        if (existingUser) {
          this.$message.error('Tên đăng nhập đã tồn tại!');
          this.isLoading = false;
          return;
        }
        if (password.length < 4) {
          this.$message.error('Mật khẩu phải có ít nhất 4 ký tự!');
          this.isLoading = false;
          return;
        }
        const params = {
          ...this.formState,
          role: 'user',
          userId: Date.now()
        };
        await registerUser(params);
        this.$message.success('Đăng ký thành công!');
        this.$router.push('/login');
      } catch (error) {
        if (error?.errorFields) {
          this.$message.error('Vui lòng điền đầy đủ thông tin!');
        } else {
          this.$message.error('Đăng ký thất bại: ' + error.message);
        }
      } finally {
        this.isLoading = false;
      }
    },
    async getAllUser() {
      await getAllUsers().then(res => {
        this.userAll = Object.values(res?.data || {})
      }).catch(error => {
        this.$message.error('Lỗi khi tải dữ liệu người dùng: ' + error.message);
      })
    },
  }
}
</script>

<template>
  <a-spin :spinning="isLoading">
    <a-form
        :model="formState"
        name="basic"
        layout="vertical"
        autocomplete="off"
        @finish="onFinish"
        class="register-form"
        ref="registerForm"
    >
      <h2>Đăng ký</h2>
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
        Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
      </a-form-item>
      <a-form-item class="register-button">
        <a-button type="primary" html-type="submit">Đăng ký</a-button>
      </a-form-item>
    </a-form>
  </a-spin>
</template>

<style scoped>
.register-form {
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

.register-button {
  text-align: right;
}

.ant-form-item-control-input {
  width: 100%;
}

.ant-form-item {
  width: 100%;
}
</style>