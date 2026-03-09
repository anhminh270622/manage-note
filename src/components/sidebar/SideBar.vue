<script setup>
import { FundProjectionScreenOutlined, LockOutlined, WalletOutlined } from '@ant-design/icons-vue';
import { RouterLink } from 'vue-router';

</script>

<template>
  <div class="sidebar">
    <ul>
      <RouterLink to="/" class="nav-link">
        <FundProjectionScreenOutlined/>
        Thống kê
      </RouterLink>
      <RouterLink to="/list-password" class="nav-link">
        <LockOutlined />
        Danh sách mật khẩu
      </RouterLink>
      <RouterLink to="/revenue" class="nav-link">
        <WalletOutlined/>
        Ghi nợ cho vay
      </RouterLink>
    </ul>
  </div>

</template>

<style scoped>
.sidebar {
  padding: 16px 12px;
  width: 240px;
}

ul {
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 10px 12px;
  color: #334155 !important;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #0f172a !important;
}

.nav-link.router-link-active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8 !important;
  font-weight: 600;
}

.nav-link :deep(svg) {
  font-size: 16px;
}
</style>