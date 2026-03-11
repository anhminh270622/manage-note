<script>
import tableData from "@/components/revenue/tableData.js";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";
import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons-vue";
import { h } from "vue";
import { addRevenue, deleteRevenue, editRevenue, getAllRevenue } from "@/api/revenue.js";
import { isNumber } from "@/constans/index.js";
import dayjs from 'dayjs';
import { addActivityLog } from "@/utils/activityLog.js";

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
      userId: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).userId : '',
      // Filter options
      filters: {
        name: '',
        tag: null,
        amountMin: 0,
        amountMax: null,
        startDateRange: [],
        sortAmount: null, // null: không sắp xếp, 'asc' | 'desc'
        sortDate: null, // null: không sắp xếp, 'asc': tăng dần, 'desc': giảm dần
      }
    };
  },
  mounted() {
    this.loadData()
  },
  computed: {
    totalLoanAmount() {
      const total = this.filteredDataSource
        .filter(item => item.tag === 0)
        .reduce((total, item) => total + (Number(item.amount) || 0), 0);
      return total > 0 ? total.toLocaleString('en-US') : '0';
    },
    totalDebtAmount() {
      const total = this.filteredDataSource
        .filter(item => item.tag === 1)
        .reduce((total, item) => total + (Number(item.amount) || 0), 0);
      return total > 0 ? total.toLocaleString('en-US') : '0';
    },
    overdueCount() {
      const now = dayjs();
      return this.dataSource.filter((item) => {
        if (!item.endDate) return false;
        const end = dayjs(item.endDate, "DD/MM/YYYY");
        return end.isValid() && end.isBefore(now, "day");
      }).length;
    },
    dueSoonCount() {
      const now = dayjs();
      const soon = now.add(7, "day");
      return this.dataSource.filter((item) => {
        if (!item.endDate) return false;
        const end = dayjs(item.endDate, "DD/MM/YYYY");
        return end.isValid() && (end.isSame(now, "day") || (end.isAfter(now, "day") && end.isBefore(soon, "day")));
      }).length;
    },
    amountSliderMax() {
      const maxAmount = Math.max(
        ...this.dataSource.map((item) => Number(item.amount) || 0),
        0
      );
      if (maxAmount <= 0) return 1000000;
      const step = 100000;
      return Math.ceil(maxAmount / step) * step;
    },
    amountRangeModel: {
      get() {
        const min = this.filters.amountMin ?? 0;
        const max = this.filters.amountMax ?? this.amountSliderMax;
        return [
          Math.min(Math.max(min, 0), this.amountSliderMax),
          Math.min(Math.max(max, 0), this.amountSliderMax),
        ];
      },
      set(value) {
        if (!Array.isArray(value) || value.length !== 2) return;
        this.filters.amountMin = value[0];
        this.filters.amountMax = value[1];
      }
    },
    filteredDataSource() {
      let filtered = [...this.dataSource];

      // Filter by name
      if (this.filters.name) {
        const keyword = this.filters.name.toLowerCase().trim();
        filtered = filtered.filter(item =>
          String(item.name || "").toLowerCase().includes(keyword)
        );
      }

      // Filter by tag
      if (this.filters.tag !== null && this.filters.tag !== undefined && this.filters.tag !== '') {
        filtered = filtered.filter(item => item.tag === this.filters.tag);
      }

      // Filter by amount range
      const min = this.filters.amountMin !== null && this.filters.amountMin !== "" ? Number(this.filters.amountMin) : null;
      const max = this.filters.amountMax !== null && this.filters.amountMax !== "" ? Number(this.filters.amountMax) : null;
      if (min !== null && !Number.isNaN(min)) {
        filtered = filtered.filter(item => Number(item.amount || 0) >= min);
      }
      if (max !== null && !Number.isNaN(max)) {
        filtered = filtered.filter(item => Number(item.amount || 0) <= max);
      }

      // Filter by start date range
      if (Array.isArray(this.filters.startDateRange) && this.filters.startDateRange.length === 2) {
        const [fromDate, toDate] = this.filters.startDateRange;
        const from = dayjs(fromDate, 'DD/MM/YYYY');
        const to = dayjs(toDate, 'DD/MM/YYYY');
        if (from.isValid() && to.isValid()) {
          filtered = filtered.filter((item) => {
            const start = dayjs(item.startDate, 'DD/MM/YYYY');
            return start.isValid() && !start.isBefore(from, 'day') && !start.isAfter(to, 'day');
          });
        }
      }

      // Sort by amount
      if (this.filters.sortAmount) {
        filtered.sort((a, b) => {
          const amountA = Number(a.amount) || 0;
          const amountB = Number(b.amount) || 0;
          if (this.filters.sortAmount === 'asc') return amountA - amountB;
          if (this.filters.sortAmount === 'desc') return amountB - amountA;
          return 0;
        });
      }

      // Sort by date
      if (this.filters.sortDate) {
        filtered.sort((a, b) => {
          const dateA = dayjs(a.startDate, 'DD/MM/YYYY');
          const dateB = dayjs(b.startDate, 'DD/MM/YYYY');

          if (this.filters.sortDate === 'asc') {
            return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
          } else if (this.filters.sortDate === 'desc') {
            return dateA.isAfter(dateB) ? -1 : dateA.isBefore(dateB) ? 1 : 0;
          }
          return 0;
        });
      }

      return filtered;
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
            addActivityLog({
              action: "delete_revenue",
              module: "revenue",
              detail: `Xóa khoản "${record.name || "không tên"}"`,
            });
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
        addActivityLog({
          action: "edit_revenue",
          module: "revenue",
          detail: `Cập nhật khoản "${record.name || "không tên"}"`,
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
      const today = dayjs().format('DD/MM/YYYY');
      const params = {
        key: Date.now(),
        name: '',
        amount: 0,
        startDate: today,
        endDate: '',
        note: '',
        isEditing: true,
        userId: this.userId,
        tag: 0, // Mặc định là cho vay
      }
      addRevenue(params).then((res) => {
        this.$message.success('Thêm mới thành công');
        addActivityLog({
          action: "add_revenue",
          module: "revenue",
          detail: "Thêm khoản vay/trả mới",
        });
        const firebaseKey = res?.data?.name;
        if (!firebaseKey) {
          this.loadData();
          return;
        }

        // Giữ row mới ở trạng thái chỉnh sửa để nhập liệu ngay.
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
              .filter(([_, item]) => typeof item === 'object' && item !== null && item.userId === this.userId)
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
    resetFilters() {
      this.filters = {
        name: '',
        tag: null,
        amountMin: 0,
        amountMax: null,
        startDateRange: [],
        sortAmount: null,
        sortDate: null,
      };
    },
    formatAmount(value) {
      if (!value) return '';
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    onAmountInput(event, record) {
      const rawValue = event.target.value.replace(/,/g, ''); // loại bỏ dấu phẩy
      record.amount = rawValue;
    }
  }
}
</script>

<template>
  <div class="page-revenue">
    <Breadcrumb :breadcrumb="breadcrumb" title="Vay trả" />
    <a-alert
      v-if="overdueCount > 0"
      type="error"
      show-icon
      :message="`Có ${overdueCount} khoản đã quá hạn thanh toán.`"
      class="alert-item"
    />
    <a-alert
      v-if="dueSoonCount > 0"
      type="warning"
      show-icon
      :message="`Có ${dueSoonCount} khoản sắp đến hạn trong 7 ngày.`"
      class="alert-item"
    />

    <div class="filter-section">
      <h3 class="filter-title">Lọc dữ liệu</h3>
      <a-row :gutter="[12, 12]" align="middle">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-input v-model:value="filters.name" placeholder="Tìm kiếm theo tên" allow-clear />
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-select v-model:value="filters.tag" placeholder="Lọc theo tag" style="width: 100%" allow-clear>
            <a-select-option v-for="tag in tagOption" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-select v-model:value="filters.sortAmount" placeholder="Sắp xếp theo tiền" style="width: 100%" allow-clear>
            <a-select-option value="asc">Tiền tăng dần</a-select-option>
            <a-select-option value="desc">Tiền giảm dần</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-select v-model:value="filters.sortDate" placeholder="Sắp xếp ngày bắt đầu" style="width: 100%" allow-clear>
            <a-select-option value="asc">Ngày tăng dần</a-select-option>
            <a-select-option value="desc">Ngày giảm dần</a-select-option>
          </a-select>
        </a-col>
      </a-row>
      <a-row :gutter="[12, 12]" align="middle" style="margin-top: 12px;">
        <a-col :xs="24" :lg="12" class="amount-slider-wrap">
          <div class="amount-slider-label">
            Khoảng tiền:
            <span>{{ amountRangeModel[0].toLocaleString('en-US') }} đ - {{ amountRangeModel[1].toLocaleString('en-US') }} đ</span>
          </div>
          <a-slider
            v-model:value="amountRangeModel"
            range
            :min="0"
            :max="amountSliderMax"
            :step="50000"
          />
        </a-col>
        <a-col :xs="24" :lg="12">
          <a-range-picker
            v-model:value="filters.startDateRange"
            format="DD/MM/YYYY"
            value-format="DD/MM/YYYY"
            style="width: 100%;"
          />
        </a-col>
      </a-row>

      <a-row justify="center" style="margin-top: 16px;">
        <a-col>
          <a-button @click="resetFilters" type="default">
            Xóa bộ lọc
          </a-button>
        </a-col>
      </a-row>
    </div>

    <div class="add-revenue">
      <div class="info-table">
        <div>Tổng số bản ghi: <span class="value">{{ filteredDataSource.length }}</span></div>
        <div>Tổng tiền cho vay: <span class="value price-loan">{{ totalLoanAmount }} đ</span></div>
        <div>Tổng tiền nợ: <span class="value price">{{ totalDebtAmount }} đ</span></div>
      </div>
      <a-button type="primary" @click="addRecord" class="btn-add">
        Thêm mới
      </a-button>
    </div>
    <div class="list-revenue">
      <a-table :columns="columns" :data-source="filteredDataSource" row-key="key" bordered :scroll="{ x: 'max-content' }"
        :loading="loading" class="revenue-table">
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
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'tag'">
          <template v-if="record.isEditing">
            <a-select v-model:value="record.tag" style="width: 100%;" placeholder="Chọn thẻ">
              <a-select-option v-for="i in tagOption" :key="i.id" :value="i.id">
                {{ i.name }}
              </a-select-option>
            </a-select>
          </template>
          <template v-else>
            <span>
              <a-tag :color="text === 1 ? 'volcano' : text === 2 ? 'geekblue' : 'green'">
                {{ tagOption[Number(text)]?.name.toUpperCase() }}
              </a-tag>
            </span>
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'name'">
          <template v-if="record.isEditing">
            <a-input v-model:value="record.name" placeholder="Nhập tên" />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'amount'">
          <template v-if="record.isEditing">
            <a-input :value="formatAmount(record.amount)" @input="onAmountInput($event, record)" @keypress="isNumber"
              placeholder="Nhập giá tiền" />
          </template>
          <template v-else>
            {{ Number(text).toLocaleString('en-US') }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'startDate'">
          <template v-if="record.isEditing">
            <a-date-picker v-model:value="record.startDate" placeholder="DD/MM/YYYY" format="DD/MM/YYYY"
              value-format="DD/MM/YYYY" style="width: 100%;" :disabledDate="disabledFutureDates" />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'endDate'">
          <template v-if="record.isEditing">
            <a-date-picker v-model:value="record.endDate" placeholder="DD/MM/YYYY" format="DD/MM/YYYY"
              value-format="DD/MM/YYYY" style="width: 100%;" :disabledDate="disabledPastDates" />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'note'">
          <template v-if="record.isEditing">
            <a-input v-model:value="record.note" placeholder="Nhập mô tả" />
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

<style scoped>
.page-revenue {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px;
}

.filter-title {
  text-align: left;
  margin-bottom: 12px;
  font-weight: 700;
  color: #0f172a;
}

.filter-section {
  margin-bottom: 14px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.alert-item {
  margin-bottom: 12px;
}

.amount-slider-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.amount-slider-label {
  font-size: 12px;
  color: #64748b;
}

.amount-slider-label span {
  color: #0f172a;
  font-weight: 600;
}

.add-revenue {
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 12px 14px;
}

.info-table {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
  color: #475569;
}

.value {
  font-weight: 700;
  font-size: 17px;
}

.price {
  color: #ef4444;
}

.price-loan {
  color: #16a34a;
}

.btn-add {
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
}

.list-revenue {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
}

.revenue-table :deep(.ant-table-container) {
  border-radius: 10px !important;
  overflow: hidden;
}

.revenue-table :deep(.ant-table-thead > tr > th) {
  background: #f8fafc;
  color: #334155;
  font-weight: 600;
}

.revenue-table :deep(.ant-table-cell) {
  border-color: #eef2f7 !important;
}

@media (max-width: 768px) {
  .add-revenue {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .btn-add {
    width: 100%;
  }

  .list-revenue {
    padding: 8px;
  }
}
</style>