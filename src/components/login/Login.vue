<script>
import { getAllUsers } from "@/api/user.js";
import { RouterLink } from "vue-router";
import {
  createPhoneRecaptcha,
  isFirebaseAuthConfigured,
  loginWithEmailPassword,
  logoutFirebaseAuth,
  sendPhoneOtp,
  sendVerifyEmail,
} from "@/api/firebaseAuth.js";
import { addActivityLog } from "@/utils/activityLog.js";

export default {
  name: "Login",
  components: {
    RouterLink,
  },
  data() {
    return {
      formState: {
        email: "",
        password: "",
        phone: "",
        otp: "",
      },
      activeTab: "email",
      dataLogin: [],
      isLoading: false,
      confirmationResult: null,
      recaptchaVerifier: null,
      otpCooldown: 0,
      otpTimer: null,
      lastPhoneE164: "",
    };
  },
  mounted() {
    this.getAllUser();
  },
  beforeUnmount() {
    if (this.otpTimer) clearInterval(this.otpTimer);
    if (this.recaptchaVerifier) this.recaptchaVerifier.clear();
  },
  computed: {
    canSendOtp() {
      return this.otpCooldown === 0;
    },
  },
  methods: {
    async handleSubmit() {
      try {
        if (this.activeTab === "email") {
          await this.$refs.loginForm.validate(["email", "password"]);
        } else {
          await this.$refs.loginForm.validate(["phone", "otp"]);
        }
        await this.onFinish({ ...this.formState });
      } catch (error) {
        if (error?.errorFields) {
          return;
        }
        this.$message.error("Không thể gửi form, vui lòng thử lại.");
      }
    },
    normalizePhoneE164(rawPhone) {
      if (!rawPhone) return "";
      let phone = String(rawPhone).trim().replace(/\s+/g, "");
      if (phone.startsWith("+84")) {
        phone = phone.slice(3);
      } else if (phone.startsWith("84")) {
        phone = phone.slice(2);
      } else if (phone.startsWith("0")) {
        phone = phone.slice(1);
      }
      phone = phone.replace(/\D/g, "");
      if (!/^\d{9,10}$/.test(phone)) return "";
      return `+84${phone}`;
    },
    startOtpCooldown() {
      if (this.otpTimer) clearInterval(this.otpTimer);
      this.otpCooldown = 60;
      this.otpTimer = setInterval(() => {
        if (this.otpCooldown <= 1) {
          clearInterval(this.otpTimer);
          this.otpTimer = null;
          this.otpCooldown = 0;
          return;
        }
        this.otpCooldown -= 1;
      }, 1000);
    },
    async setupRecaptcha() {
      if (this.recaptchaVerifier) return;
      this.recaptchaVerifier = createPhoneRecaptcha("recaptcha-container");
      await this.recaptchaVerifier.render();
    },
    async onSendOtp() {
      if (!isFirebaseAuthConfigured()) {
        this.$message.error("Thiếu cấu hình Firebase Auth trong file .env");
        return;
      }
      if (!this.canSendOtp) return;

      const phoneE164 = this.normalizePhoneE164(this.formState.phone);
      if (!phoneE164) {
        this.$message.error("Số điện thoại không hợp lệ. Dùng 0xxxxxxxxx hoặc +84xxxxxxxxx.");
        return;
      }

      this.isLoading = true;
      try {
        await this.setupRecaptcha();
        this.confirmationResult = await sendPhoneOtp(phoneE164, this.recaptchaVerifier);
        this.lastPhoneE164 = phoneE164;
        this.startOtpCooldown();
        this.$message.success("Đã gửi OTP. Vui lòng kiểm tra SMS.");
      } catch (error) {
        if (error?.code === "auth/too-many-requests") {
          this.$message.error("Bạn yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau.");
        } else if (error?.code === "auth/invalid-phone-number") {
          this.$message.error("Số điện thoại không đúng định dạng.");
        } else {
          this.$message.error("Gửi OTP thất bại: " + error.message);
        }
      } finally {
        this.isLoading = false;
      }
    },
    async loginByEmail(values) {
      const result = await loginWithEmailPassword(values.email, values.password);
      const firebaseUser = result.user;
      if (!firebaseUser.emailVerified) {
        await sendVerifyEmail(firebaseUser);
        await logoutFirebaseAuth();
        this.$message.warning("Email chưa xác thực. Mình đã gửi lại link xác thực.");
        return;
      }

      const usersArray = Object.values(this.dataLogin || {});
      const userProfile = usersArray.find((user) => user.email === values.email) || {
        username: values.email.split("@")[0],
        email: values.email,
        userId: firebaseUser.uid,
      };

      localStorage.setItem("user", JSON.stringify(userProfile));
      localStorage.setItem("isLogin", true);
      addActivityLog({
        action: "login_email",
        module: "auth",
        detail: `Đăng nhập email ${values.email}`,
      });
      this.$message.success("Đăng nhập thành công!");
      this.$router.push({ path: "/" });
    },
    async loginByPhone(values) {
      if (!this.confirmationResult) {
        this.$message.error("Vui lòng gửi OTP trước.");
        return;
      }
      if (!values.otp || String(values.otp).length < 6) {
        this.$message.error("Vui lòng nhập OTP 6 số.");
        return;
      }

      const result = await this.confirmationResult.confirm(values.otp);
      const firebaseUser = result.user;
      const usersArray = Object.values(this.dataLogin || {});
      const userProfile =
        usersArray.find((user) => this.normalizePhoneE164(user.phone) === this.lastPhoneE164) || {
          username: this.lastPhoneE164,
          phone: this.lastPhoneE164,
          userId: firebaseUser.uid,
        };

      localStorage.setItem("user", JSON.stringify(userProfile));
      localStorage.setItem("isLogin", true);
      addActivityLog({
        action: "login_phone",
        module: "auth",
        detail: `Đăng nhập SĐT ${this.lastPhoneE164}`,
      });
      this.$message.success("Đăng nhập thành công!");
      this.$router.push({ path: "/" });
    },
    async onFinish(values) {
      if (!isFirebaseAuthConfigured()) {
        this.$message.error("Thiếu cấu hình Firebase Auth trong file .env");
        return;
      }
      this.isLoading = true;
      try {
        if (this.activeTab === "email") {
          if (!values.email || !values.password) {
            this.$message.error("Vui lòng nhập email và mật khẩu.");
            return;
          }
          await this.loginByEmail(values);
          return;
        }
        await this.loginByPhone(values);
      } catch (error) {
        if (error?.code === "auth/invalid-credential") {
          this.$message.error("Email hoặc mật khẩu không đúng!");
        } else if (error?.code === "auth/invalid-verification-code") {
          this.$message.error("OTP không đúng.");
        } else if (error?.code === "auth/code-expired" || error?.code === "auth/session-expired") {
          this.$message.error("OTP đã hết hạn, vui lòng gửi lại mã.");
        } else if (error?.code === "auth/too-many-requests") {
          this.$message.error("Bạn thử quá nhiều lần. Vui lòng đợi vài phút rồi đăng nhập lại.");
        } else if (error?.code === "auth/configuration-not-found") {
          this.$message.error("Firebase Auth chưa cấu hình: bật Email/Password hoặc Phone trong Firebase Console.");
        } else if (error?.code === "auth/operation-not-allowed") {
          this.$message.error("Phương thức đăng nhập đang bị tắt trên Firebase Console.");
        } else {
          this.$message.error("Đăng nhập thất bại: " + error.message);
        }
      } finally {
        this.isLoading = false;
      }
    },
    async getAllUser() {
      await getAllUsers()
        .then((res) => {
          this.dataLogin = res.data;
        })
        .catch((error) => {
          this.$message.error("Lỗi khi tải dữ liệu người dùng: " + error.message);
        });
    },
  },
};
</script>

<template>
  <a-spin :spinning="isLoading">
    <div class="auth-page">
      <a-form :model="formState" name="basic" layout="vertical" autocomplete="off" class="login-form" ref="loginForm">
        <h2>Đăng nhập</h2>
        <p class="subtitle">Hỗ trợ Email/Password và OTP qua số điện thoại.</p>

        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="email" tab="Email">
            <a-form-item
              label="Email"
              name="email"
              :rules="[
                { required: activeTab === 'email', message: 'Nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]"
            >
              <a-input v-model:value="formState.email" />
            </a-form-item>

            <a-form-item
              label="Mật khẩu"
              name="password"
              :rules="[{ required: activeTab === 'email', message: 'Nhập mật khẩu!' }]"
            >
              <a-input-password v-model:value="formState.password" />
            </a-form-item>
          </a-tab-pane>

          <a-tab-pane key="phone" tab="SĐT">
            <a-form-item
              label="Số điện thoại"
              name="phone"
              :rules="[{ required: activeTab === 'phone', message: 'Nhập số điện thoại!' }]"
            >
              <a-input v-model:value="formState.phone" placeholder="0xxxxxxxxx hoặc +84xxxxxxxxx" />
            </a-form-item>
            <a-form-item
              label="Mã OTP"
              name="otp"
              :rules="[{ required: activeTab === 'phone', message: 'Nhập OTP!' }]"
            >
              <div class="otp-row">
                <a-input v-model:value="formState.otp" :maxlength="6" placeholder="Nhập OTP 6 số" />
                <a-button @click="onSendOtp" :disabled="!canSendOtp">
                  {{ canSendOtp ? "Gửi OTP" : `Gửi lại (${otpCooldown}s)` }}
                </a-button>
              </div>
            </a-form-item>
            <div id="recaptcha-container"></div>
          </a-tab-pane>
        </a-tabs>

        <a-form-item class="auth-link">
          Chưa có tài khoản? <RouterLink to="/register">Đăng ký ngay</RouterLink>
        </a-form-item>
        <a-form-item class="login-button">
          <a-button type="primary" html-type="button" @click="handleSubmit" block>
            {{ activeTab === "email" ? "Đăng nhập" : "Xác thực OTP" }}
          </a-button>
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

.login-form {
  width: 460px;
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

.otp-row {
  display: flex;
  gap: 8px;
}

.otp-row .ant-btn {
  min-width: 120px;
}

.login-button {
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

.ant-tabs {
  width: 100%;
}

@media (max-width: 768px) {
  .auth-page {
    align-items: flex-start;
    padding: 16px 10px;
  }

  .login-form {
    width: 100%;
    max-width: 460px;
    padding: 18px 14px 12px;
  }

  .otp-row {
    flex-direction: column;
  }

  .otp-row .ant-btn {
    width: 100%;
  }
}
</style>
