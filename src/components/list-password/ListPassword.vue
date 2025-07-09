<template>
  <Breadcrumb :breadcrumb="breadcrumb" title="Danh sách mật khẩu" />
  <div class="add-password">
    <div class="info-table">
      <div>Tổng số bản ghi: <span class="value">{{ dataSource.length }}</span></div>
    </div>
    <a-button type="primary" @click="addRecord">
      Thêm mới
    </a-button>
  </div>
  <div class="list-password">
    <a-table :columns="columns" :data-source="dataSource" row-key="key" bordered :scroll="{ x: 'max-content' }"
      :loading="loading">
      <template #bodyCell="{ column, index, text, record }">
        <template v-if="column.dataIndex === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space style="display: flex; gap: 15px;">
            <a-tooltip :title="'Sửa'" v-if="!record.isEditing">
              <a-button shape="circle" @click="handleEdit(record)" :icon="h(EditOutlined)" type="primary" />
            </a-tooltip>
            <a-tooltip title="Lưu" v-else>
              <a-button shape="circle" @click="editRecord(record)" :icon="h(SaveOutlined)" type="primary" />
            </a-tooltip>
            <a-tooltip title="Xóa">
              <a-button shape="circle" @click="deleteRecord(record)" :icon="h(DeleteOutlined)" type="primary" danger />
            </a-tooltip>
            <a-tooltip title="Xem mật khẩu">
              <a-button @click="togglePasswordVisibility(record)" shape="circle" :icon="h(EyeInvisibleOutlined)" />
            </a-tooltip>
          </a-space>
        </template>
        <template v-else-if="column.dataIndex === 'name'">
          <template v-if="record.isEditing">
            <a-input v-model:value="record.name" placeholder="Nhập tên"
              @blur="(event) => (record.name = event.target.value.trim())" />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'username'">
          <template v-if="record.isEditing">
            <a-input v-model:value="record.username" placeholder="Nhập tên đăng nhập"
              @blur="(event) => (record.username = event.target.value.trim())" />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'phone'">
          <template v-if="record.isEditing">
            <a-input :maxlength="10" v-model:value="record.phone" placeholder="Nhập số điện thoại"
              @input="handlePhoneInput" @blur="(event) => (record.phone = event.target.value.trim())" />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'password'">
          <template v-if="record.isEditing">
            <a-input v-model:value="record.password" placeholder="Nhập mật khẩu"
              @blur="(event) => (record.password = event.target.value.trim())" />
          </template>
          <template v-else>
            <span>{{ record.isShowPass ? text : '*****' }}</span>
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'email'">
          <template v-if="record.isEditing">
            <a-input v-model:value="record.email" placeholder="Nhập email"
              @blur="(event) => (record.email = event.target.value.trim())" />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import tableData from "@/components/list-password/tableData.js";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";
import { EditOutlined, DeleteOutlined, EyeInvisibleOutlined, SaveOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
import { validatePhoneNumber } from "@/constans/index.js";
import {
  addTypePassword,
  deleteTypePassword,
  editTypePassword,
  getAllTypePassword
} from "@/api/password.js";

export default {
  name: 'ListPassword',
  components: {
    Breadcrumb
  },
  data() {
    return {
      breadcrumb: tableData.breadcrumb.concat({
        name: 'Danh sách mật khẩu',
        link: '/list-password',
      }),
      columns: tableData.columns,
      dataSource: [],
      loading: false,
      type: '',
      userId: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).userId : '',
    };
  },
  mounted() {
    this.type = this.$route.params.passwordType
    this.getAllTypePassword();
  },

  methods: {
    validatePhoneNumber,
    SaveOutlined,
    DeleteOutlined, EyeInvisibleOutlined, h, EditOutlined,
    handlePhoneInput(event) {
      // Chỉ cho phép nhập số
      const value = event.target.value.replace(/\D/g, '');
      event.target.value = value;
      // Cập nhật v-model
      const record = event.target.closest('tr')?.__vueParentComponent?.ctx?.record;
      if (record) {
        record.phone = value;
      }
    },
    togglePasswordVisibility(record) {
      record.isShowPass = !record.isShowPass;
    },
    handleEdit(record) {
      record.isEditing = !record.isEditing;
    },
    editRecord(record) {
      this.loading = true;
      editTypePassword(record).then(() => {
        this.$message.success('Cập nhật thành công');
        record.isEditing = false;
      }).catch(() => {
        this.$message.error('Lỗi khi cập nhật');
      }).finally(() => {
        this.loading = false;
      })
    },
    

    addRecord() {
      this.loading = true;
      const params = {
        key: Date.now(),
        name: '',
        username: '',
        phone: '',
        password: '',
        email: '',
        type: this.type,
        userId: this.userId,
        isShowPass: false,
        isEditing: true
      }
      addTypePassword(params).then(res => {
        this.$message.success('Thêm thành công');
        this.getAllTypePassword()
      }).catch(() => {
        this.$message.error('Lỗi khi thêm mới');
      }).finally(() => {
        this.loading = false;
      })
    },
    deleteRecord(record) {
      this.loading = true;
      this.$confirm({
        title: 'Xác nhận xóa',
        content: 'Bạn có chắc chắn muốn xóa danh sách này?',
        onOk: () => {
          this.loading = true;
          if (!record || !record.key) {
            this.$message.error('Không tìm thấy bản ghi để xóa');
            this.loading = false;
            return;
          }
          deleteTypePassword(record.key).then(() => {
            this.$message.success('Xóa thành công');
            this.dataSource = this.dataSource.filter(item => item.key !== record.key);
            this.getAllTypePassword()
          }).catch(() => {
            this.$message.error('Lỗi khi xóa');
          }).finally(() => {
            this.loading = false;
          });
        },
        onCancel: () => {
          this.$message.info('Đã hủy xóa');
          this.loading = false;
        },
      });
    },
    getAllTypePassword() {
      this.loading = true;
      getAllTypePassword().then(res => {
        this.dataSource = Object.entries(res?.data || {})
          .filter(([_, item]) => typeof item === 'object' && item !== null && item.type === this.type && item.userId === this.userId)
          .map(([key, item]) => ({
            ...item,
            key: key,
            isShowPass: false,
            isEditing: false,
          }));
      }).catch(() => {
        this.$message.error('Lỗi khi tải dữ liệu');
      }).finally(() => {
        this.loading = false;
      })

    },
  },
}
</script>
<style scoped>
svg {
  font-size: 20px;
  color: #1890ff;
  cursor: pointer;
}

.add-password {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.info-table {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-direction: column;
  align-items: start;
  gap: 10px;
}

.value {
  font-weight: bold;
  font-size: 16px;
}
</style>