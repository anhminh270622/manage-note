<template>
  <Breadcrumb :breadcrumb="breadcrumb" title="Dashboard"/>
</template>
<script>

import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";
import tableData from "@/components/dashboard/tableData.js";

export default {
  name: 'Dashboard',
  components: {
    Breadcrumb
  },
  data() {
    return {
      breadcrumb: tableData.breadcrumb
    }
  },
}
</script>
<style scoped>

</style>