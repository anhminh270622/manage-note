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

      <a-row :gutter="12" class="kpi-row">
        <a-col :span="8">
          <div class="kpi-card">
            <div class="kpi-title">Danh mục mật khẩu</div>
            <div class="kpi-value">{{ totalBoxes }}</div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="kpi-card">
            <div class="kpi-title">Bản ghi mật khẩu</div>
            <div class="kpi-value">{{ totalPasswords }}</div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="kpi-card">
            <div class="kpi-title">Khoản vay/trả</div>
            <div class="kpi-value">{{ totalRevenues }}</div>
          </div>
        </a-col>
      </a-row>

      <a-row :gutter="12" class="chart-row">
        <a-col :span="12">
          <div class="chart-card">
            <h3>Tỷ lệ vay/trả</h3>
            <apexchart type="donut" height="320" :options="pieOptions" :series="pieSeries" />
          </div>
        </a-col>
        <a-col :span="12">
          <div class="chart-card">
            <h3>Giá trị theo nhóm (VND)</h3>
            <apexchart type="bar" height="320" :options="barOptions" :series="barSeries" />
          </div>
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>
<script>
import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";
import tableData from "@/components/dashboard/tableData.js";
import { getAllBox, getAllTypePassword } from "@/api/password.js";
import { getAllRevenue } from "@/api/revenue.js";
import VueApexCharts from "vue3-apexcharts";

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
      pieSeries: [0, 0, 0],
      barSeries: [
        {
          name: "Số tiền",
          data: [0, 0, 0],
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
    };
  },
  mounted() {
    this.loadDashboardData();
  },
  methods: {
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
</style>