<script>
import dayjs from "dayjs";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";
import { getAllRevenue } from "@/api/revenue.js";
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "Reports",
  components: {
    Breadcrumb,
    apexchart: VueApexCharts,
  },
  data() {
    return {
      loading: false,
      breadcrumb: [
        { name: "Trang chủ", path: "/" },
        { name: "Báo cáo", path: "/reports" },
      ],
      userId: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).userId : "",
      dateRange: [],
      reportRows: [],
      lineSeries: [
        { name: "Cho vay", data: [] },
        { name: "Nợ", data: [] },
      ],
      lineOptions: {
        chart: {
          toolbar: { show: false },
        },
        stroke: {
          curve: "smooth",
          width: 3,
        },
        xaxis: {
          categories: [],
        },
        colors: ["#16a34a", "#ef4444"],
        dataLabels: {
          enabled: false,
        },
      },
    };
  },
  computed: {
    filteredRows() {
      if (!Array.isArray(this.dateRange) || this.dateRange.length !== 2) return this.reportRows;
      const [fromDate, toDate] = this.dateRange;
      const from = dayjs(fromDate, "DD/MM/YYYY");
      const to = dayjs(toDate, "DD/MM/YYYY");
      if (!from.isValid() || !to.isValid()) return this.reportRows;
      return this.reportRows.filter((item) => {
        const date = dayjs(item.startDate, "DD/MM/YYYY");
        return date.isValid() && !date.isBefore(from, "day") && !date.isAfter(to, "day");
      });
    },
    totalLoan() {
      return this.filteredRows
        .filter((item) => Number(item.tag) === 0)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    },
    totalDebt() {
      return this.filteredRows
        .filter((item) => Number(item.tag) === 1)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    },
    totalRows() {
      return this.filteredRows.length;
    },
    topDebtors() {
      const map = {};
      this.filteredRows
        .filter((item) => Number(item.tag) === 1)
        .forEach((item) => {
          const name = item.name || "Không tên";
          map[name] = (map[name] || 0) + (Number(item.amount) || 0);
        });
      return Object.entries(map)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    },
  },
  watch: {
    filteredRows: {
      handler(rows) {
        this.buildTrend(rows);
      },
      deep: true,
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    buildTrend(rows) {
      const monthMap = {};
      for (let i = 0; i < 6; i += 1) {
        const key = dayjs().subtract(5 - i, "month").format("MM/YYYY");
        monthMap[key] = { loan: 0, debt: 0 };
      }
      rows.forEach((item) => {
        const d = dayjs(item.startDate, "DD/MM/YYYY");
        if (!d.isValid()) return;
        const key = d.format("MM/YYYY");
        if (!monthMap[key]) return;
        const amount = Number(item.amount) || 0;
        if (Number(item.tag) === 1) monthMap[key].debt += amount;
        else monthMap[key].loan += amount;
      });
      const labels = Object.keys(monthMap);
      this.lineOptions = { ...this.lineOptions, xaxis: { categories: labels } };
      this.lineSeries = [
        { name: "Cho vay", data: labels.map((k) => monthMap[k].loan) },
        { name: "Nợ", data: labels.map((k) => monthMap[k].debt) },
      ];
    },
    resetFilters() {
      this.dateRange = [];
    },
    async loadData() {
      this.loading = true;
      try {
        const res = await getAllRevenue();
        this.reportRows = Object.values(res?.data || {}).filter(
          (item) => typeof item === "object" && item !== null && item.userId === this.userId
        );
      } catch (error) {
        this.$message.error("Không tải được dữ liệu báo cáo.");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <a-spin :spinning="loading">
    <div class="page-reports">
      <Breadcrumb :breadcrumb="breadcrumb" title="Báo cáo" />

      <div class="filter-card">
        <a-row :gutter="[12, 12]" align="middle">
          <a-col :xs="24" :lg="16">
            <a-range-picker
              v-model:value="dateRange"
              style="width: 100%"
              value-format="DD/MM/YYYY"
              format="DD/MM/YYYY"
            />
          </a-col>
          <a-col :xs="24" :lg="8">
            <a-button block @click="resetFilters">Xóa khoảng thời gian</a-button>
          </a-col>
        </a-row>
      </div>

      <a-row :gutter="[12, 12]" class="kpi-row">
        <a-col :xs="24" :sm="8">
          <div class="kpi-card">
            <div class="kpi-title">Tổng bản ghi</div>
            <div class="kpi-value">{{ totalRows }}</div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="8">
          <div class="kpi-card">
            <div class="kpi-title">Tổng cho vay</div>
            <div class="kpi-value loan">{{ totalLoan.toLocaleString("en-US") }} đ</div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="8">
          <div class="kpi-card">
            <div class="kpi-title">Tổng nợ</div>
            <div class="kpi-value debt">{{ totalDebt.toLocaleString("en-US") }} đ</div>
          </div>
        </a-col>
      </a-row>

      <a-row :gutter="[12, 12]" class="kpi-row">
        <a-col :xs="24" :lg="16">
          <div class="chart-card">
            <h3>Xu hướng vay / nợ 6 tháng</h3>
            <apexchart type="line" height="320" :options="lineOptions" :series="lineSeries" />
          </div>
        </a-col>
        <a-col :xs="24" :lg="8">
          <div class="chart-card">
            <h3>Top người nợ</h3>
            <div v-if="topDebtors.length">
              <div class="debtor-row" v-for="item in topDebtors" :key="item.name">
                <span>{{ item.name }}</span>
                <strong>{{ Number(item.total).toLocaleString("en-US") }} đ</strong>
              </div>
            </div>
            <div v-else class="empty">Không có dữ liệu nợ.</div>
          </div>
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>

<style scoped>
.page-reports {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px;
}

.filter-card,
.kpi-card,
.chart-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.filter-card {
  padding: 12px;
  margin-bottom: 12px;
}

.kpi-row {
  margin-top: 12px;
}

.kpi-card {
  padding: 12px;
}

.kpi-title {
  color: #64748b;
  font-size: 13px;
}

.kpi-value {
  margin-top: 6px;
  color: #0f172a;
  font-weight: 700;
  font-size: 22px;
}

.kpi-value.loan {
  color: #16a34a;
}

.kpi-value.debt {
  color: #ef4444;
}

.chart-card {
  padding: 12px;
  min-height: 365px;
}

h3 {
  margin: 0 0 10px;
}

.debtor-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eef2f7;
}

.debtor-row:last-child {
  border-bottom: none;
}

.empty {
  color: #64748b;
  text-align: center;
  padding: 16px 0;
}
</style>
