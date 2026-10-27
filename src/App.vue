<script setup>
import { useRoute } from "vue-router";
import ReloadPrompt from '@/components/ReloadPrompt.vue'

const route = useRoute();

</script>

<template>
  <router-view />
  <ReloadPrompt />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
