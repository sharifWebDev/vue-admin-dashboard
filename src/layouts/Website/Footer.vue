<template>
  <footer class="relative pt-19 bg-white dark:bg-[#030712] transition-colors duration-500 overflow-hidden">
    <!-- Footer -->
    <div class="container mx-auto px-4 py-3">
      <div class="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
        <!-- Left: copyright -->
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-0 md:mb-0 md:whitespace-nowrap">
          A complete accounting solution. © {{ currentYear }} All rights reserved. Powered by
          <a href="https://systembuilder.com" target="_blank"
            class="hover:underline text-blue-600 dark:text-blue-400">System Builder</a>
        </p>

        <!-- Right: links + logo, all in one line -->
        <div class="flex items-center space-x-4 flex-nowrap">
          <a href="#"
            class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors whitespace-nowrap">
            Privacy Policy
          </a>
          <a href="#"
            class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors whitespace-nowrap">
            Terms of Service
          </a>
          <a href="#"
            class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors whitespace-nowrap">
            Support
          </a>
          <img src="../../../public/logo/app-logo.png" alt="App Logo"
            class="h-6 w-auto inline-block" />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>