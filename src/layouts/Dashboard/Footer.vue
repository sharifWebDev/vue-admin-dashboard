<template>
  <footer class="p-1 md:p-1 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
    <div class="flex flex-col md:flex-row justify-between items-center px-3 md:px-5">
      <p class="text-xs text-gray-600 dark:text-gray-400 mb-0 md:mb-0">
        A complete inventory management solution. © {{ currentYear }} All rights reserved. Powered by
        <a href="https://imeshbd.com" target="_blank" class="hover:underline text-blue-600 dark:text-blue-400">i-Mesh
          Ltd.</a>
      </p>

      <div class="flex space-x-4 hidden md:block">
        <!-- Prevent Default behavior and open modal -->
        <a @click.prevent="openModal('https://imeshbd.com/privacy-policy')" href="#"
          class="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
          Privacy Policy
        </a>
        <a @click.prevent="openModal('https://imeshbd.com/terms-of-service')" href="#"
          class="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
          Terms of Service
        </a>
        <a @click.prevent="openModal('https://imeshbd.com/contact')" href="#"
          class="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
          Support
        </a>
      </div>
    </div>

    <!-- Modal Implementation -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        class="bg-white dark:bg-gray-900 w-full max-w-4xl h-[80vh] rounded-lg shadow-xl flex flex-col overflow-hidden">

        <!-- Modal Header -->
        <div class="flex justify-between items-center p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div class="flex space-x-2">
            <button @click="closeModal"
              class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded hover:bg-gray-300">
              <!-- <span class="text-red-500 font-bold text-md -mt-2 mr-1">✖ ✘ </span> -->
              <span class="text-red-500 font-bold text-md -mt-2 mr-1">✘</span>
              <!-- <span class="text-red-500 font-bold text-xl">✘</span> -->
              <span class="text-gray-600 font-semibold text-md">Close</span>
            </button>
            <!-- Redirect Button -->
            <a :href="selectedUrl" target="_blank"
              class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center">
              Open in New Tab ↗
            </a>
          </div>
          <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Quick View</span>
        </div>

        <!-- Modal Body (Iframe) -->
        <div class="flex-grow">
          <iframe :src="selectedUrl" class="w-full h-full border-none"></iframe>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());

// State Management
const isModalOpen = ref(false);
const selectedUrl = ref('');

const openModal = (url) => {
  selectedUrl.value = url;
  isModalOpen.value = true;
  // Modal open thakle scroll lock korte paren
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedUrl.value = '';
  document.body.style.overflow = 'auto';
};
</script>

<style scoped>
/* Modal transition effect handle korar jonno space */
</style>