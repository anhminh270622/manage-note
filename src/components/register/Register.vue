<script>
import { getAllUsers, registerUser } from "@/api/user.js";
import { RouterLink } from "vue-router";
import {
  isFirebaseAuthConfigured,
  logoutFirebaseAuth,
  registerWithEmailPassword,
  sendVerifyEmail,
} from "@/api/firebaseAuth.js";

export default {
  name: "Register",
  components: {
    RouterLink,
  },
  data() {
    return {
      formState: {
        username: '',
        password: '',
        email: '',
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
    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    async onFinish() {
      try {
        await this.$refs.registerForm.validate();
        if (!isFirebaseAuthConfigured()) {
          this.$message.error("Thiếu cấu hình Firebase Auth trong file .env");
          return;
        }
        this.isLoading = true;
        const { username, password, email } = this.formState;
        const existingUser = this.userAll.find(user => user.username === username);
        if (existingUser) {
          this.$message.error('Tên đăng nhập đã tồn tại!');
          this.isLoading = false;
          return;
        }
        const existingEmail = this.userAll.find(user => user.email === email);
        if (existingEmail) {
          this.$message.error("Email đã được đăng ký!");
          this.isLoading = false;
          return;
        }
        if (password.length < 4) {
          this.$message.error('Mật khẩu phải có ít nhất 4 ký tự!');
          this.isLoading = false;
          return;
        }
        if (!email || !this.isValidEmail(email)) {
          this.$message.error("Email không hợp lệ!");
          this.isLoading = false;
          return;
        }
        const authResult = await registerWithEmailPassword(email, password);
        await sendVerifyEmail(authResult.user);
        const params = {
          username,
          email,
          role: 'user',
          emailVerified: false,
          userId: authResult.user.uid,
        };
        await registerUser(params);
        await logoutFirebaseAuth();
        this.$message.success('Đăng ký thành công, vui lòng xác thực email trước khi đăng nhập!');
        this.$router.push('/login');
      } catch (error) {
        if (error?.errorFields) {
          this.$message.error('Vui lòng điền đầy đủ thông tin!');
        } else if (error?.code === "auth/too-many-requests") {
          this.$message.error("Bạn thao tác quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.");
        } else if (error?.code === "auth/configuration-not-found") {
          this.$message.error("Firebase Auth chưa cấu hình: bật Email/Password trong Firebase Console > Authentication > Sign-in method.");
        } else if (error?.code === "auth/operation-not-allowed") {
          this.$message.error("Email/Password sign-up đang bị tắt trên Firebase Console.");
        } else if (error?.code === "auth/email-already-in-use") {
          this.$message.error("Email đã được đăng ký trên Firebase Auth!");
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
    <div class="auth-page">
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
        <p class="subtitle">Tạo tài khoản để bắt đầu quản lý dữ liệu của bạn.</p>
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
        <a-form-item
            label="Email"
            name="email"
            :rules="[
              { required: true, message: 'Nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]"
        >
          <a-input v-model:value="formState.email" placeholder="example@gmail.com"/>
        </a-form-item>
        <a-form-item class="auth-link">
          Đã có tài khoản? <RouterLink to="/login">Đăng nhập ngay</RouterLink>
        </a-form-item>
        <a-form-item class="register-button">
          <a-button type="primary" html-type="submit" block>Đăng ký</a-button>
        </a-form-item>
      </a-form>
    </div>
  </a-spin>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #e0edff 0%, #f3f7ff 36%, #f8fafc 100%);
}

.register-form {
  width: 420px;
  padding: 24px 24px 16px;
  background-color: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h2 {
  color: #0f172a;
  margin-bottom: 6px;
}

.subtitle {
  color: #64748b;
  margin-bottom: 18px;
}

.register-button {
  text-align: right;
}

.auth-link {
  text-align: right;
}

.ant-form-item-control-input {
  width: 100%;
}

.ant-form-item {
  width: 100%;
}
</style>