<script>
import tableData from "@/components/revenue/tableData.js";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";
import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons-vue";
import { h } from "vue";
import { addRevenue, deleteRevenue, editRevenue, getAllRevenue } from "@/api/revenue.js";
import { isNumber } from "@/constans/index.js";
import dayjs from 'dayjs';

export default {
  name: 'Revenue',
  components: { Breadcrumb },

  data() {
    return {
      breadcrumb: tableData.breadcrumb,
      columns: tableData.columns,
      dataSource: [],
      loading: false,
      tagOption: tableData.getTags,
    };
  },
  mounted() {
    this.loadData()
  },
  computed: {
    totalLoanAmount() {
      const total = this.dataSource
          .filter(item => item.tag === 0)
          .reduce((total, item) => total + (Number(item.amount) || 0), 0);
      return total > 0 ? total.toLocaleString('en-US') : '0';
    },
    totalDebtAmount() {
      const total = this.dataSource
          .filter(item => item.tag === 1)
          .reduce((total, item) => total + (Number(item.amount) || 0), 0);
      return total > 0 ? total.toLocaleString('en-US') : '0';
    }
  },
  methods: {
    isNumber,
    SaveOutlined,
    DeleteOutlined, h, EditOutlined,
    deleteRecord(record) {
      this.$confirm({
        title: 'Xác nhận xóa',
        content: 'Bạn có chắc chắn muốn xóa danh sách này?',
        onOk: () => {
          this.loading = true;
          if (!record || !record.key) {
            this.$message.error('Không tìm thấy bản ghi để xóa');
            return;
          }
          deleteRevenue(record.key).then(() => {
            this.$message.success('Xóa thành công');
            this.dataSource = this.dataSource.filter(item => item.key !== record.key);
            this.loadData()
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
    handleEdit(record) {
      record.isEditing = !record.isEditing;
    },

    editRecord(record) {
      this.loading = true;
      editRevenue(
          record
      ).then(() => {
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
        amount: 0,
        startDate: '',
        endDate: '',
        note: '',
        isEditing: true,
      }
      addRevenue(params).then(() => {
        this.$message.success('Thêm mới thành công');
        this.loadData()
      }).catch(() => {
        this.$message.error('Lỗi khi thêm mới');
      }).finally(() => {
        this.loading = false;
      })
    },
    disabledFutureDates(current) {
      return current && current > new Date();
    },
    disabledPastDates(current) {
      return current && current < dayjs().subtract(1, 'day').toDate();
    },
    loadData() {
      this.loading = true;
      getAllRevenue()
          .then(res => {
            if (res?.status === 200) {
              this.dataSource = Object.entries(res?.data || {})
                  .filter(([_, item]) => typeof item === 'object' && item !== null)
                  .map(([id, item]) => ({
                    ...item,
                    key: id, // rất quan trọng
                    isShowPass: false,
                    isEditing: false,
                  }));
            } else {
              this.$message.error(`Lỗi: ${res.status} - ${res.statusText}`);
            }
          })
          .catch(err => {
            this.$message.error('Lỗi khi tải dữ liệu');
            console.error("Lỗi trong .catch:", err);
          })
          .finally(() => {
            this.loading = false;
          });
    },
  }
}
</script>

<template>
  <Breadcrumb :breadcrumb="breadcrumb" title="Vay trả"/>
  <div class="add-revenue">
    <div class="info-table">
      <div>Tổng số bản ghi: <span class="value">{{ dataSource.length }}</span></div>
      <div>Tổng tiền cho vay: <span class="value price-loan">{{ totalLoanAmount }} đ</span></div>
      <div>Tổng tiền nợ: <span class="value price">{{ totalDebtAmount }} đ</span></div>
    </div>
    <a-button type="primary"
              @click="addRecord">
      Thêm mới
    </a-button>
  </div>
  <div class="list-revenue">

    <a-table
        :columns="columns"
        :data-source="dataSource"
        row-key="key"
        bordered
        :scroll="{ x: 'max-content' }"
        :loading="loading"
    >
      <template #bodyCell="{ column, index, text, record }">
        <template v-if="column.dataIndex === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space style="display: flex; gap: 15px;">
            <a-tooltip :title="'Sửa'" v-if="!record.isEditing">
              <a-button
                  shape="circle"
                  @click="handleEdit(record)"
                  :icon="h( EditOutlined)"
                  type="primary"
              />
            </a-tooltip>
            <a-tooltip title="Lưu" v-else>
              <a-button
                  shape="circle"
                  @click="editRecord(record)"
                  :icon="h( SaveOutlined )"
                  type="primary"
              />
            </a-tooltip>
            <a-tooltip title="Xóa">
              <a-button shape="circle" @click="deleteRecord(record)" :icon="h(DeleteOutlined)" type="primary" danger/>
            </a-tooltip>
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'tag'">
          <template v-if="record.isEditing">
            <a-select
                v-model:value="record.tag"
                style="width: 100%;"
                placeholder="Chọn thẻ">
              <a-select-option v-for="i in tagOption" :key="i.id" :value="i.id">
                {{ i.name }}
              </a-select-option>
            </a-select>
          </template>
          <template v-else>
             <span>
          <a-tag
              :color="text === 1 ? 'volcano' : text === 2 ? 'geekblue' : 'green'"
          >
            {{ tagOption[Number(text)]?.name.toUpperCase() }}
          </a-tag>
        </span>
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'name'">
          <template v-if="record.isEditing">
            <a-input v-model:value="record.name" placeholder="Nhập tên"/>
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'amount'">
          <template v-if="record.isEditing">
            <a-input v-model:value="record.amount" @keypress="isNumber" placeholder="Nhập giá tiền"/>
          </template>
          <template v-else>
            {{ Number(text).toLocaleString('en-US') }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'startDate'">
          <template v-if="record.isEditing">
            <a-date-picker
                v-model:value="record.startDate"
                placeholder="DD/MM/YYYY"
                format="DD/MM/YYYY"
                value-format="DD/MM/YYYY"
                style="width: 100%;"
                :disabledDate="disabledFutureDates"
            />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'endDate'">
          <template v-if="record.isEditing">
            <a-date-picker
                v-model:value="record.endDate"
                placeholder="DD/MM/YYYY"
                format="DD/MM/YYYY"
                value-format="DD/MM/YYYY"
                style="width: 100%;"
                :disabledDate="disabledPastDates"
            />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'note'">
          <template v-if="record.isEditing">
            <a-input v-model:value="record.note" placeholder="Nhập mô tả"/>
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
      </template>
    </a-table>
  </div>
</template>

<style scoped>
svg {
  font-size: 20px;
  color: #1890ff;
  cursor: pointer;
}

.add-revenue {
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

.price {
  color: red;
}

.price-loan {
  color: green;
}
</style>