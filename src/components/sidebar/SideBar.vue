<script setup>
import { AreaChartOutlined, KeyOutlined, UnorderedListOutlined } from '@ant-design/icons-vue';
import { RouterLink } from 'vue-router';

</script>

<template>
  <div class="sidebar">
    <ul>
      <RouterLink to="/">
        <AreaChartOutlined/>
        Thống kê
      </RouterLink>
      <RouterLink to="/list-password">
        <KeyOutlined />
        Danh sách mật khẩu
      </RouterLink>
      <RouterLink to="/revenue">
        <UnorderedListOutlined/>
        Ghi nợ cho vay
      </RouterLink>
    </ul>
  </div>

</template>

<style scoped>
ul {
  background: #fff;
}

a {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  padding: 10px;
  color: #181818 !important;
}
</style>