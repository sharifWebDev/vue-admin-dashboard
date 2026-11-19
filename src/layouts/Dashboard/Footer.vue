<template>
 <footer class="relative pt-19 bg-white dark:bg-[#030712] transition-colors duration-500 overflow-hidden">
<!-- Footer -->
    <div class="container mx-auto px-4 py-2">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-0 md:mb-0">
          A complete your app solution. © {{ currentYear }} All rights reserved. Powered by <a
            href="https://imeshbd.com" target="_blank" class="hover:underline text-blue-600 dark:text-blue-400">System
            Builder</a>
        </p>
       <p class="hidden md:block"></p>
        <div class="flex space-x-4 hidden md:block">
          <a href="#"
            class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
            Privacy Policy
          </a>
         <a href="#"
            class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
            Terms of Service
          </a>
          <a href="#"
            class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
            Support
          </a>
          <a  class="text-xs text-gray-600 dark:text-gray-400 mb-2 md:mb-0">
            <img src="../../../public/logo/app-logo.png" alt="App Logo" class="h-6 w-auto inline-block mr-2">
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
const currentYear = new Date().getFullYear();
</script>
