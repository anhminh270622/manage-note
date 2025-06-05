<template>
  <a-breadcrumb>
    <a-breadcrumb-item v-for="i in breadcrumb">
      <a :href="i.link" v-if="i.link" style="cursor: pointer;">{{ i.name }}</a>
      <span v-else>{{ i.name }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
  <h3 v-if="title" class="breadcrumb-title">{{ title }}</h3>
</template>

<script>

export default {
  name: 'Breadcrumb',
  props: {
    breadcrumb: {
      type: Object,
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
a, span{
  font-size: 12px;
}
h3 {
  margin: 0;
  padding: 10px 0;
  font-size: 1.2rem;
  color: #333;
  text-align: left;
  text-transform: uppercase;
  font-weight: 600;
}
</style>