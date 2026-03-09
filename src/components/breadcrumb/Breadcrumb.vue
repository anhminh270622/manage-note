<template>
  <a-breadcrumb class="breadcrumb-wrap">
    <a-breadcrumb-item v-for="i in breadcrumb" :key="`${i.name}-${i.link || i.path || 'current'}`">
      <RouterLink :to="i.link || i.path" v-if="i.link || i.path" class="crumb-link">{{ i.name }}</RouterLink>
      <span v-else>{{ i.name }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
  <h3 v-if="title" class="breadcrumb-title">{{ title }}</h3>
</template>

<script>
import { RouterLink } from "vue-router";

export default {
  name: 'Breadcrumb',
  components: {
    RouterLink,
  },
  props: {
    breadcrumb: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: ''
    }
  },
  mounted() {

  }
}

</script>
<style scoped>
.breadcrumb-wrap {
  margin-bottom: 4px;
}

.crumb-link,
span {
  font-size: 12px;
}

.crumb-link {
  color: #64748b;
}

.breadcrumb-title {
  margin: 0;
  padding: 8px 0 14px;
  font-size: 1.45rem;
  color: #0f172a;
  text-align: left;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.3px;
}
</style>