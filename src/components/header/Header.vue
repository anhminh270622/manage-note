<script>
import { UserOutlined } from '@ant-design/icons-vue';
import { logoutFirebaseAuth } from "@/api/firebaseAuth.js";
import { getAllBox, getAllTypePassword } from "@/api/password.js";
import { getAllRevenue } from "@/api/revenue.js";
import { addActivityLog } from "@/utils/activityLog.js";

export default {
  name: 'Header',
  components: { UserOutlined },
  data() {
    return {
      isLogin: false,
      infoProfile: {},
      showLogout: false,
      showSearchModal: false,
      searchKeyword: "",
      searchLoading: false,
      searchData: [],
    };
  },
  mounted() {
    this.isLogin = localStorage.getItem('isLogin');
    this.infoProfile = JSON.parse(localStorage.getItem('user')) || {};
  },
  computed: {
    filteredSearchData() {
      const keyword = this.searchKeyword.toLowerCase().trim();
      if (!keyword) return this.searchData;
      return this.searchData.filter((item) => item.text.toLowerCase().includes(keyword));
    },
  },
  methods: {
    UserOutlined,
    onHome() {
      this.$router.push('/');
    },
    async openSearchModal() {
      this.showSearchModal = true;
      this.searchKeyword = "";
      this.searchLoading = true;
      try {
        const userId = this.infoProfile?.userId;
        const [boxRes, passRes, revenueRes] = await Promise.all([
          getAllBox(),
          getAllTypePassword(),
          getAllRevenue(),
        ]);

        const boxes = Object.entries(boxRes?.data || {})
          .filter(([_, item]) => item && item.userId === userId)
          .map(([id, item]) => ({
            id: `box-${id}`,
            text: item.name || "",
            desc: "Danh mục mật khẩu",
            route: "/list-password",
          }));

        const passwords = Object.entries(passRes?.data || {})
          .filter(([_, item]) => item && item.userId === userId)
          .map(([id, item]) => ({
            id: `password-${id}`,
            text: `${item.name || ""} ${item.username || ""} ${item.email || ""} ${item.phone || ""}`,
            desc: "Bản ghi mật khẩu",
            route: `/list-password/${item.type || ""}`,
          }));

        const revenues = Object.entries(revenueRes?.data || {})
          .filter(([_, item]) => item && item.userId === userId)
          .map(([id, item]) => ({
            id: `revenue-${id}`,
            text: `${item.name || ""} ${item.note || ""}`,
            desc: "Khoản vay/trả",
            route: "/revenue",
          }));

        this.searchData = [...boxes, ...passwords, ...revenues];
      } catch (error) {
        this.$message.error("Không tải được dữ liệu tìm kiếm.");
      } finally {
        this.searchLoading = false;
      }
    },
    onPickSearchResult(item) {
      this.showSearchModal = false;
      this.$router.push(item.route);
    },
    async onLogout() {
      this.$confirm({
        title: "Xác nhận đăng xuất",
        content: "Bạn có chắc chắn muốn đăng xuất không?",
        okText: "Đăng xuất",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            await logoutFirebaseAuth();
          } catch (error) {
            // Bỏ qua lỗi signOut để vẫn dọn session local.
          }
          localStorage.removeItem('isLogin');
          localStorage.removeItem('user');
          this.isLogin = false;
          addActivityLog({
            action: "logout",
            module: "auth",
            detail: `${this.infoProfile?.username || "user"} đăng xuất`,
          });
          this.$message.success('Đăng xuất thành công!');
          this.$router.push('/login');
        },
      });
    }
  }
}
</script>

<template>
  <div class="wrapper">
    <img src="/logo.png" alt="Logo" class="logo" @click="onHome"/>
    <a-button type="default" class="search-btn" @click="openSearchModal">Tìm kiếm</a-button>
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
  <a-modal v-model:open="showSearchModal" title="Tìm kiếm toàn cục" :footer="null" width="640px">
    <a-input v-model:value="searchKeyword" placeholder="Nhập từ khóa..." allow-clear />
    <a-spin :spinning="searchLoading" style="margin-top: 12px; width: 100%">
      <div class="search-result-wrap">
        <div
          v-for="item in filteredSearchData"
          :key="item.id"
          class="search-result-item"
          @click="onPickSearchResult(item)"
        >
          <div class="search-title">{{ item.text || "(Không có tiêu đề)" }}</div>
          <div class="search-desc">{{ item.desc }}</div>
        </div>
        <div v-if="!filteredSearchData.length && !searchLoading" class="empty-text">
          Không có kết quả phù hợp.
        </div>
      </div>
    </a-spin>
  </a-modal>
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

.search-btn {
  margin-left: auto;
  margin-right: 10px;
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

.search-result-wrap {
  margin-top: 12px;
  max-height: 380px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-result-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
}

.search-result-item:hover {
  background: #f8fafc;
}

.search-title {
  color: #0f172a;
  font-weight: 600;
}

.search-desc {
  font-size: 12px;
  color: #64748b;
}

.empty-text {
  color: #64748b;
  text-align: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .wrapper {
    height: 56px;
    padding: 0 4px;
  }

  .logo {
    height: 32px;
  }

  .welcome-text {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }

  .avatar {
    width: 36px;
    height: 36px;
  }

  .info {
    top: 48px;
  }

  .search-btn {
    font-size: 12px;
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  .welcome-text {
    display: none;
  }
}
</style>