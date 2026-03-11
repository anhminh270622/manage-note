<template>
  <a-spin :spinning="loading">
    <div class="dashboard-page">
      <Breadcrumb :breadcrumb="breadcrumb" title="Dashboard" />
      <div class="hero-card">
        <div>
          <h2>Quản lý ghi chú và tài khoản an toàn</h2>
          <p>Theo dõi nhanh mật khẩu, danh mục và các khoản vay/trả của bạn.</p>
        </div>
        <div class="quick-action">
          <a-button type="primary" @click="$router.push('/list-password')">Mở danh sách mật khẩu</a-button>
          <a-button @click="$router.push('/revenue')">Mở vay trả</a-button>
        </div>
      </div>

      <a-row :gutter="[12, 12]" class="kpi-row">
        <a-col :xs="24" :sm="12" :lg="8">
          <div class="kpi-card">
            <div class="kpi-title">Danh mục mật khẩu</div>
            <div class="kpi-value">{{ totalBoxes }}</div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="8">
          <div class="kpi-card">
            <div class="kpi-title">Bản ghi mật khẩu</div>
            <div class="kpi-value">{{ totalPasswords }}</div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="24" :lg="8">
          <div class="kpi-card">
            <div class="kpi-title">Khoản vay/trả</div>
            <div class="kpi-value">{{ totalRevenues }}</div>
          </div>
        </a-col>
      </a-row>

      <a-row :gutter="[12, 12]" class="chart-row">
        <a-col :xs="24" :lg="12">
          <div class="chart-card">
            <h3>Tỷ lệ vay/trả</h3>
            <apexchart type="donut" height="320" :options="pieOptions" :series="pieSeries" />
          </div>
        </a-col>
        <a-col :xs="24" :lg="12">
          <div class="chart-card">
            <h3>Giá trị theo nhóm (VND)</h3>
            <apexchart type="bar" height="320" :options="barOptions" :series="barSeries" />
          </div>
        </a-col>
      </a-row>

      <a-row :gutter="[12, 12]" class="chart-row">
        <a-col :xs="24" :lg="16">
          <div class="chart-card">
            <h3>Xu hướng 6 tháng gần nhất</h3>
            <apexchart type="line" height="320" :options="trendOptions" :series="trendSeries" />
          </div>
        </a-col>
        <a-col :xs="24" :lg="8">
          <div class="chart-card">
            <h3>Top người đang nợ</h3>
            <div v-if="topDebtors.length">
              <div v-for="item in topDebtors" :key="item.name" class="simple-row">
                <span>{{ item.name }}</span>
                <strong>{{ Number(item.total).toLocaleString("en-US") }} đ</strong>
              </div>
            </div>
            <div v-else class="empty-text">Chưa có dữ liệu nợ.</div>
          </div>
        </a-col>
      </a-row>

      <a-row :gutter="[12, 12]" class="chart-row">
        <a-col :xs="24" :lg="12">
          <div class="chart-card">
            <h3>Sao lưu / khôi phục</h3>
            <div class="quick-action">
              <a-button type="primary" @click="exportBackup">Xuất backup</a-button>
              <label class="import-label">
                <input type="file" accept=".json" @change="importBackup" />
                <span>Nhập backup</span>
              </label>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :lg="12">
          <div class="chart-card">
            <h3>Nhật ký hoạt động</h3>
            <div v-if="recentLogs.length" class="log-list">
              <div v-for="log in recentLogs" :key="log.id" class="simple-row">
                <span>{{ log.detail || log.action }}</span>
                <small>{{ new Date(log.createdAt).toLocaleString() }}</small>
              </div>
            </div>
            <div v-else class="empty-text">Chưa có nhật ký.</div>
            <a-button danger type="link" @click="clearLogs">Xóa nhật ký</a-button>
          </div>
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>
<script>
import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";
import tableData from "@/components/dashboard/tableData.js";
import { addBox, addTypePassword, getAllBox, getAllTypePassword } from "@/api/password.js";
import { addRevenue, getAllRevenue } from "@/api/revenue.js";
import VueApexCharts from "vue3-apexcharts";
import dayjs from "dayjs";
import { clearActivityLogs, getActivityLogs } from "@/utils/activityLog.js";

export default {
  name: 'Dashboard',
  components: {
    Breadcrumb,
    apexchart: VueApexCharts,
  },
  data() {
    return {
      breadcrumb: tableData.breadcrumb,
      loading: false,
      totalBoxes: 0,
      totalPasswords: 0,
      totalRevenues: 0,
      revenueRaw: [],
      backupFile: null,
      recentLogs: [],
      pieSeries: [0, 0, 0],
      barSeries: [
        {
          name: "Số tiền",
          data: [0, 0, 0],
        },
      ],
      trendSeries: [
        {
          name: "Cho vay",
          data: [],
        },
        {
          name: "Nợ",
          data: [],
        },
      ],
      pieOptions: {
        labels: ["Cho vay", "Nợ", "Khác"],
        colors: ["#16a34a", "#ef4444", "#3b82f6"],
        legend: {
          position: "bottom",
        },
        dataLabels: {
          enabled: true,
        },
      },
      barOptions: {
        chart: {
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: "45%",
          },
        },
        xaxis: {
          categories: ["Cho vay", "Nợ", "Khác"],
        },
        yaxis: {
          labels: {
            formatter(value) {
              return Number(value || 0).toLocaleString("en-US");
            },
          },
        },
        colors: ["#2563eb"],
        dataLabels: {
          enabled: false,
        },
      },
      trendOptions: {
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
  mounted() {
    this.loadDashboardData();
    this.recentLogs = getActivityLogs().slice(0, 10);
  },
  computed: {
    topDebtors() {
      const debtMap = {};
      this.revenueRaw
        .filter((item) => Number(item.tag) === 1)
        .forEach((item) => {
          const name = item.name || "Không tên";
          debtMap[name] = (debtMap[name] || 0) + (Number(item.amount) || 0);
        });
      return Object.entries(debtMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    },
  },
  methods: {
    buildTrendSeries(revenues) {
      const monthMap = {};
      for (let index = 0; index < 6; index += 1) {
        const monthKey = dayjs().subtract(5 - index, "month").format("MM/YYYY");
        monthMap[monthKey] = { loan: 0, debt: 0 };
      }

      revenues.forEach((item) => {
        const date = dayjs(item.startDate, "DD/MM/YYYY");
        if (!date.isValid()) return;
        const key = date.format("MM/YYYY");
        if (!monthMap[key]) return;
        const amount = Number(item.amount) || 0;
        if (Number(item.tag) === 1) {
          monthMap[key].debt += amount;
        } else {
          monthMap[key].loan += amount;
        }
      });

      const labels = Object.keys(monthMap);
      this.trendOptions = {
        ...this.trendOptions,
        xaxis: { categories: labels },
      };
      this.trendSeries = [
        { name: "Cho vay", data: labels.map((label) => monthMap[label].loan) },
        { name: "Nợ", data: labels.map((label) => monthMap[label].debt) },
      ];
    },
    async exportBackup() {
      this.loading = true;
      try {
        const userRaw = localStorage.getItem("user");
        const userId = userRaw ? JSON.parse(userRaw).userId : "";
        const [boxRes, passRes, revenueRes] = await Promise.all([
          getAllBox(),
          getAllTypePassword(),
          getAllRevenue(),
        ]);

        const payload = {
          exportedAt: new Date().toISOString(),
          userId,
          boxes: Object.values(boxRes?.data || {}).filter((item) => item?.userId === userId),
          passwords: Object.values(passRes?.data || {}).filter((item) => item?.userId === userId),
          revenues: Object.values(revenueRes?.data || {}).filter((item) => item?.userId === userId),
          logs: getActivityLogs(),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `manage-note-backup-${dayjs().format("YYYYMMDD-HHmmss")}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.$message.success("Xuất backup thành công.");
      } catch (error) {
        this.$message.error("Không thể xuất backup.");
      } finally {
        this.loading = false;
      }
    },
    async importBackup(fileEvent) {
      const file = fileEvent?.target?.files?.[0];
      if (!file) return;

      this.loading = true;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const userRaw = localStorage.getItem("user");
        const userId = userRaw ? JSON.parse(userRaw).userId : "";

        const boxes = Array.isArray(parsed.boxes) ? parsed.boxes : [];
        const passwords = Array.isArray(parsed.passwords) ? parsed.passwords : [];
        const revenues = Array.isArray(parsed.revenues) ? parsed.revenues : [];

        await Promise.all([
          ...boxes.map((item) => addBox({ ...item, userId })),
          ...passwords.map((item) => addTypePassword({ ...item, userId })),
          ...revenues.map((item) => addRevenue({ ...item, userId })),
        ]);
        this.$message.success("Khôi phục dữ liệu thành công.");
        this.loadDashboardData();
      } catch (error) {
        this.$message.error("File backup không hợp lệ.");
      } finally {
        this.loading = false;
        fileEvent.target.value = "";
      }
    },
    clearLogs() {
      clearActivityLogs();
      this.recentLogs = [];
      this.$message.success("Đã xóa nhật ký hoạt động.");
    },
    async loadDashboardData() {
      const userRaw = localStorage.getItem("user");
      const userId = userRaw ? JSON.parse(userRaw).userId : "";
      if (!userId) return;

      this.loading = true;
      try {
        const [boxRes, passRes, revenueRes] = await Promise.all([
          getAllBox(),
          getAllTypePassword(),
          getAllRevenue(),
        ]);

        const boxes = Object.values(boxRes?.data || {}).filter(
          (item) => typeof item === "object" && item !== null && item.userId === userId
        );
        const passwords = Object.values(passRes?.data || {}).filter(
          (item) => typeof item === "object" && item !== null && item.userId === userId
        );
        const revenues = Object.values(revenueRes?.data || {}).filter(
          (item) => typeof item === "object" && item !== null && item.userId === userId
        );
        this.revenueRaw = revenues;

        this.totalBoxes = boxes.length;
        this.totalPasswords = passwords.length;
        this.totalRevenues = revenues.length;

        const tagCount = [0, 0, 0];
        const tagAmount = [0, 0, 0];

        revenues.forEach((item) => {
          const tag = Number(item.tag);
          if ([0, 1, 2].includes(tag)) {
            tagCount[tag] += 1;
            tagAmount[tag] += Number(item.amount || 0);
          }
        });

        this.pieSeries = tagCount;
        this.barSeries = [
          {
            name: "Số tiền",
            data: tagAmount,
          },
        ];
        this.buildTrendSeries(revenues);
        this.recentLogs = getActivityLogs().slice(0, 10);
      } catch (error) {
        this.$message.error("Không tải được dữ liệu dashboard");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style scoped>
.dashboard-page {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

h2 {
  margin: 0 0 8px;
  color: #0f172a;
}

p {
  margin: 0;
  color: #64748b;
}

.quick-action {
  display: flex;
  gap: 10px;
}

.kpi-row,
.chart-row {
  margin-top: 12px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05);
}

.kpi-title {
  color: #64748b;
  font-size: 13px;
}

.kpi-value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.chart-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  min-height: 365px;
}

h3 {
  margin: 0 0 10px;
  color: #1e293b;
}

.simple-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eef2f7;
}

.simple-row:last-child {
  border-bottom: none;
}

.simple-row small {
  color: #64748b;
}

.empty-text {
  color: #64748b;
  text-align: center;
  padding: 16px 0;
}

.import-label {
  cursor: pointer;
  border: 1px dashed #94a3b8;
  padding: 6px 10px;
  border-radius: 8px;
  color: #334155;
  font-size: 14px;
}

.import-label input {
  display: none;
}

.log-list {
  max-height: 240px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .hero-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px;
  }

  .quick-action {
    width: 100%;
    flex-wrap: wrap;
  }

  .quick-action .ant-btn {
    width: 100%;
  }

  .kpi-value {
    font-size: 24px;
  }
}
</style>