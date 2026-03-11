<script>

import tableData from "@/components/list-password/tableData.js";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";
import { addBox, deleteBox, editBox, getAllBox } from "@/api/password.js";
import { h } from "vue";
import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons-vue";
import { addActivityLog } from "@/utils/activityLog.js";

export default {
  name: 'DashboardPassword',
  components: {
    Breadcrumb
  },
  data() {
    return {
      breadcrumb: tableData.breadcrumb,
      dataBox: [],
      isOpenModal: false,
      formItem: {
        name: '',
        color: '#6ebcd9',
      },
      isLoading: false,
      userId: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).userId : '',
    };
  },
  mounted() {
    this.loadData()
  },
  methods: {
    DeleteOutlined,
    SaveOutlined,
    EditOutlined,
    h,
    getRandomHexColor() {
      const value = Math.floor(Math.random() * 0xffffff);
      return `#${value.toString(16).padStart(6, "0")}`;
    },
    getUniqueBoxColor() {
      const usedColors = new Set(
        (this.dataBox || [])
          .map((item) => item?.color?.toLowerCase())
          .filter(Boolean)
      );

      const palette = [
        "#6ebcd9",
        "#7cc4a5",
        "#7caad9",
        "#9a86db",
        "#d98db3",
        "#d9a66e",
        "#66b3a6",
        "#4f86f7",
        "#6cc36c",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
      ];

      const availablePalette = palette.filter((color) => !usedColors.has(color.toLowerCase()));
      if (availablePalette.length > 0) {
        return availablePalette[Math.floor(Math.random() * availablePalette.length)];
      }

      for (let index = 0; index < 30; index += 1) {
        const color = this.getRandomHexColor();
        if (!usedColors.has(color.toLowerCase())) {
          return color;
        }
      }

      return this.getRandomHexColor();
    },
    onNextPage(type) {
      this.$router.push({ path: `/list-password/${type}` });
    },
    addNewBox() {
      this.isOpenModal = true;
      this.formItem.name = "";
      this.formItem.color = this.getUniqueBoxColor();
    },
    handleOk() {
      this.$refs.formRef.validate()
        .then(() => {
          this.isLoading = true;
          const newBox = {
            id: Date.now(),
            userId: this.userId,
            name: this.formItem.name,
            color: this.formItem.color,
            value: this.formItem.name.toLowerCase().replace(/\s+/g, '-'),
          };
          addBox(newBox).then(res => {
            this.$message.success('Thêm mới thành công');
            addActivityLog({
              action: "add_password_box",
              module: "password_box",
              detail: `Thêm danh mục "${newBox.name}"`,
            });
            this.isOpenModal = false;
            this.loadData();
          }).catch(() => {
            this.$message.error('Có lỗi xảy ra khi thêm mới');
          })
          this.$refs.formRef.resetFields();
        })
        .catch(() => {
          this.$message.error('Vui lòng điền đầy đủ thông tin');
        })
        .finally(() => {
          this.isLoading = false;
        })
    },
    async loadData() {
      this.isLoading = true;
      await getAllBox().then(res => {
        this.isLoading = false;
        this.dataBox = Object.entries(res?.data || {})
          .filter(([_, item]) => typeof item === 'object' && item !== null && item.userId === this.userId)
          .map(([id, item]) => ({
            ...item,
            id: id,
            color: item.color || '#6ebcd9', // Màu mặc định nếu không có
            isEditing: false
          })) || [];
      }).catch(() => {
        this.isLoading = false;
        this.$message.error('Lỗi khi tải dữ liệu');
      }).finally(() => {
        this.isLoading = false;
      })

    },
    deleteRecord(record) {
      event.stopPropagation();
      this.$confirm({
        title: 'Xác nhận xóa',
        content: 'Bạn có chắc chắn muốn xóa danh sách này?',
        onOk: () => {
          this.isLoading = true;
          deleteBox(record.id).then(() => {
            this.$message.success('Xóa thành công');
            addActivityLog({
              action: "delete_password_box",
              module: "password_box",
              detail: `Xóa danh mục "${record.name || "không tên"}"`,
            });
            this.loadData();
          }).catch(() => {
            this.$message.error('Lỗi khi xóa');
          }).finally(() => {
            this.isLoading = false;
          });
        },
        onCancel: () => {
          this.$message.info('Đã hủy xóa');
          this.isLoading = false;
        },
      });
    },
    handleEdit(record) {
      event.stopPropagation();
      record.isEditing = true;
    },
    editRecord(record) {
      event.stopPropagation();
      this.isLoading = true;
      editBox(record).then(() => {
        this.$message.success('Cập nhật thành công');
        addActivityLog({
          action: "edit_password_box",
          module: "password_box",
          detail: `Cập nhật danh mục "${record.name || "không tên"}"`,
        });
        record.isEditing = false;
        this.loadData();
      }).catch(() => {
        this.$message.error('Lỗi khi cập nhật');
      }).finally(() => {
        this.isLoading = false;
      });
    },
  },
}
</script>

<template>
  <a-spin :spinning="isLoading">
    <div class="page-dashboard-password">
      <Breadcrumb :breadcrumb="breadcrumb" title="Danh sách" />
      <div class="toolbar">
        <div class="stats">Tổng danh sách: <span>{{ dataBox.length }}</span></div>
        <a-button type="primary" @click="addNewBox" class="btn-add">
          Thêm mới
        </a-button>
      </div>
      <a-row>
        <a-col :span="24" class="box-container">
          <div class="box" v-for="box in dataBox" :key="box.value" @click="onNextPage(box.value)" :style="{ backgroundColor: box.color }">
            <div v-if="box.isEditing" class="edit-box">
              <a-input @click="(e) => e.stopPropagation()" v-model:value="box.name" placeholder="Nhập tên danh sách"
                @blur="(event) => (box.name = event.target.value.trim())" />
              <div class="color-picker-container" @click="(e) => e.stopPropagation()">
                <label>Màu nền:</label>
                <input type="color" v-model="box.color" class="color-picker" />
              </div>
            </div>
            <div v-else class="box-name">{{ box.name }}</div>
            <div class="action">
              <a-space style="display: flex">
                <a-tooltip :title="'Sửa'" v-if="!box.isEditing">
                  <a-button shape="circle" @click="handleEdit(box)" :icon="h(EditOutlined)" type="primary" />
                </a-tooltip>
                <a-tooltip title="Lưu" v-else>
                  <a-button shape="circle" @click="editRecord(box)" :icon="h(SaveOutlined)" type="primary" />
                </a-tooltip>
                <a-tooltip title="Xóa">
                  <a-button shape="circle" @click="deleteRecord(box)" :icon="h(DeleteOutlined)" type="primary" danger />
                </a-tooltip>
              </a-space>
            </div>
          </div>
        </a-col>
      </a-row>
      <div>
        <a-modal v-model:open="isOpenModal" title="Thêm mới danh sách" @ok="handleOk" style="width: 400px">
          <a-form layout="vertical" ref="formRef" :model="formItem">
            <a-row gutter="16">
              <a-col span="24">
                <a-form-item label="Tên danh sách" name="name" :rules="[{ required: true, message: 'Trường bắt buộc' }]">
                  <a-input v-model:value="formItem.name" placeholder="Nhập tên danh sách"
                    @blur="(event) => (formItem.name = event.target.value.trim())" />
                </a-form-item>
              </a-col>
              <a-col span="24">
                <a-form-item label="Màu nền">
                  <input type="color" v-model="formItem.color" class="color-picker-modal" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-modal>
      </div>
    </div>
  </a-spin>
</template>

<style scoped>
.page-dashboard-password {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px;
}

.toolbar {
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
}

.stats {
  color: #475569;
}

.stats span {
  font-weight: 700;
  color: #0f172a;
}

.btn-add {
  border-radius: 8px;
}

.box-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
}

.box {
  position: relative;
  width: 200px;
  height: 110px;
  background-color: #6ebcd9;
  border: none;
  border-radius: 10px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
  box-shadow: rgba(15, 23, 42, 0.2) 0 10px 20px;
  cursor: pointer;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.box:hover {
  transform: translateY(-2px);
  box-shadow: rgba(15, 23, 42, 0.24) 0 14px 24px;
}

.edit-box {
  width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 12px;
}

.color-picker {
  width: 40px;
  height: 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker-modal {
  width: 100%;
  height: 42px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
}

svg {
  font-size: 12px;
}

.action {
  position: absolute;
  top: 3px;
  right: 3px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.box:hover .action {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .btn-add {
    width: 100%;
  }

  .box-container {
    justify-content: center;
    padding: 10px;
  }

  .box {
    width: 100%;
    max-width: 280px;
    margin: 8px 0;
  }
}
</style>