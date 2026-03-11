<template>
  <div class="page-password">
    <Breadcrumb :breadcrumb="breadcrumb" title="Danh sách mật khẩu" />
    <div class="add-password">
      <div class="info-table">
        <div>Tổng số bản ghi: <span class="value">{{ dataSource.length }}</span></div>
        <div>Mật khẩu yếu: <span class="health-value danger">{{ weakPasswordCount }}</span></div>
        <div>Mật khẩu trùng: <span class="health-value warning">{{ reusedPasswordCount }}</span></div>
      </div>
      <a-button type="primary" @click="addRecord" class="btn-add">
        Thêm mới
      </a-button>
    </div>
    <div class="list-password">
      <a-table :columns="columns" :data-source="dataSource" row-key="key" bordered :scroll="{ x: 'max-content' }"
        :loading="loading" class="password-table">
        <template #bodyCell="{ column, index, text, record }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-space class="action-group">
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
  </div>
</template>

<script>
import tableData from "@/components/list-password/tableData.js";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";
import { EditOutlined, DeleteOutlined, EyeInvisibleOutlined, SaveOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
import { isNumber } from "@/constans/index.js";
import {
  addTypePassword,
  deleteTypePassword,
  editTypePassword,
  getAllTypePassword
} from "@/api/password.js";
import { addActivityLog } from "@/utils/activityLog.js";

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
  computed: {
    weakPasswordCount() {
      return this.dataSource.filter((item) => this.getPasswordScore(item.password) < 2).length;
    },
    reusedPasswordCount() {
      const map = {};
      this.dataSource.forEach((item) => {
        const pass = String(item.password || "").trim();
        if (!pass) return;
        map[pass] = (map[pass] || 0) + 1;
      });
      return Object.values(map).filter((count) => count > 1).reduce((sum, count) => sum + count, 0);
    },
  },
  mounted() {
    this.type = this.$route.params.passwordType
    this.getAllTypePassword();
  },

  methods: {
    isNumber,
    SaveOutlined,
    DeleteOutlined, EyeInvisibleOutlined, h, EditOutlined,
    getPasswordScore(password) {
      const pass = String(password || "");
      let score = 0;
      if (pass.length >= 8) score += 1;
      if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
      if (/\d/.test(pass)) score += 1;
      if (/[^A-Za-z0-9]/.test(pass)) score += 1;
      return score;
    },
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
        addActivityLog({
          action: "edit_password_record",
          module: "password",
          detail: `Cập nhật bản ghi "${record.name || "không tên"}"`,
        });
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
        addActivityLog({
          action: "add_password_record",
          module: "password",
          detail: "Thêm bản ghi mật khẩu mới",
        });
        const firebaseKey = res?.data?.name;
        if (!firebaseKey) {
          this.getAllTypePassword();
          return;
        }

        this.dataSource = [
          {
            ...params,
            key: firebaseKey,
            isEditing: true,
          },
          ...this.dataSource,
        ];
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
            addActivityLog({
              action: "delete_password_record",
              module: "password",
              detail: `Xóa bản ghi "${record.name || "không tên"}"`,
            });
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
.page-password {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px;
}

.add-password {
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
}

.info-table {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  color: #475569;
  font-size: 14px;
  padding: 2px 0;
}

.value {
  font-weight: 700;
  font-size: 18px;
  color: #0f172a;
  margin-left: 6px;
}

.health-value {
  font-weight: 700;
  margin-left: 6px;
}

.health-value.danger {
  color: #ef4444;
}

.health-value.warning {
  color: #f59e0b;
}

.btn-add {
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
}

.list-password {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
}

.action-group {
  display: flex;
  gap: 10px;
}

.password-table :deep(.ant-table-container) {
  border-radius: 10px !important;
  overflow: hidden;
}

.password-table :deep(.ant-table-thead > tr > th) {
  background: #f8fafc;
  color: #334155;
  font-weight: 600;
  padding: 12px 16px !important;
}

.password-table :deep(.ant-table-tbody > tr > td) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

.password-table :deep(.ant-table-cell) {
  border-color: #eef2f7 !important;
}

.password-table :deep(.ant-pagination-item-active) {
  border-color: #2563eb;
}

.password-table :deep(.ant-pagination-item-active a) {
  color: #2563eb;
}

@media (max-width: 768px) {
  .add-password {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .info-table {
    display: grid;
    gap: 6px;
  }

  .btn-add {
    width: 100%;
  }

  .list-password {
    padding: 8px;
  }
}
</style>