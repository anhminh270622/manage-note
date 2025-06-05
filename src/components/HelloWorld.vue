<script setup>
import Breadcrumb from "@/components/breadcrumb/Breadcrumb.vue";

defineProps({
  msg: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <Breadcrumb :breadcrumb="[{ name: 'Home1', link: '/' }]"/>
  <a-button>anh minh</a-button>
</template>

<style scoped>

</style>
