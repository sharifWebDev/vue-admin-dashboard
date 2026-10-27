<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Unit
          Conversions
        </h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['unit_conversions.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <!-- Right Side: Search -->
      <div class="flex items-center gap-3 w-full lg:w-auto">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-0 max-w-md">
          <input v-model="searchQuery" @input="handleSearch" type="search" placeholder="Search by name..."
            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <i class="fas fa-search text-base"></i>
          </div>
        </div>

        <!-- Refresh Button Group -->
        <div
          class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg px-1.5 py-1.5 flex-shrink-0">
          <button @click="refreshData" title="Refresh Data"
            class="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            :disabled="refresh">
            <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': refresh }"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
      <div class="overflow-x-auto min-h-[150px]">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="unitConversionStore.sortBy"
            :sort-direction="unitConversionStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="unitConversionStore.loading" :is-loading="true"
            :total-items="unitConversionStore.totalItems" :item-name="'conversions'"
            loading-text="Loading conversion..." loading-subtext="Fetching your conversion data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <!-- Empty State -->
            <TableLoadingState v-if="unitConversionStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'conversions'" empty-icon="fas fa-exchange-alt"
              empty-title="No conversions found"
              :empty-message="searchQuery ? 'No unit conversions match your search criteria.' : 'Get started by creating your first Unit Conversion.'"
              :create-button-text="'Add First Conversion'" @create="openCreateModal" @clear-search="clearSearch" />

            <!-- Data Rows -->
            <tr v-else v-for="(data, index) in displayedItems" :key="data.id"
              class="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">

              <!-- Row Number (SL) -->
              <td class="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                {{ calculateRowNumber(index) }}
              </td>

              <!-- From Unit -->
              <td class="px-6 py-4">
                <div class="flex items-center space-x-4">
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-transform group-hover:scale-105">
                    <i
                      :class="['fa-solid', getUnitIcon(data.from_unit?.unit), 'text-gray-500 dark:text-gray-400 text-lg']"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ data.from_unit?.name }}
                    </div>
                    <div class="text-[10px] uppercase text-gray-400 font-bold">
                      {{ data.from_unit?.unit }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- To Unit -->
              <td class="px-6 py-4">
                <div class="flex items-center space-x-4">
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-transform group-hover:scale-105">
                    <i
                      :class="['fa-solid', getUnitIcon(data.to_unit?.unit), 'text-gray-500 dark:text-gray-400 text-lg']"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ data.to_unit?.name }}
                    </div>
                    <div class="text-[10px] uppercase text-gray-400 font-bold">
                      {{ data.to_unit?.unit }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Rate -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {{ data.rate || 0 }}
                  </span>
                  <span class="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                    Rate
                  </span>
                </div>
              </td>

              <!-- Status Badge (Polaris Style) -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  data.is_active === 1 || data.is_active === true
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                  'px-2.5 py-1 inline-flex text-[11px] leading-4 font-bold uppercase tracking-wide rounded-md border border-transparent'
                ]">
                  <span class="mr-1.5 flex h-1.5 w-1.5 items-center justify-center">
                    <span :class="[
                      data.is_active === 1 || data.is_active === true ? 'bg-emerald-500' : 'bg-gray-400',
                      'h-1.5 w-1.5 rounded-full'
                    ]"></span>
                  </span>
                  {{ data.is_active === 1 || data.is_active === true ? 'Active' : 'Draft' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-1">
                  <!-- View Button -->
                  <button @click="viewItem(data)" v-permission="['unit_conversions.view']"
                    class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    title="Quick View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <!-- Dropdown Container -->
                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['unit_conversions.update', 'unit_conversions.delete']">

                    <button @click="data.showDropdown = !data.showDropdown"
                      class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none">
                      <i class="fas fa-ellipsis-h"></i>
                    </button>

                    <!-- Dropdown Menu (Premium Card Look) -->
                    <div v-if="data.showDropdown"
                      class="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none overflow-hidden transform transition-all">

                      <div class="py-1">
                        <button @click="editItem(data); data.showDropdown = false"
                          v-permission="['unit_conversions.update']"
                          class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                          <i class="fas fa-edit text-amber-500 w-4"></i>
                          <span class="font-medium">Edit Unit</span>
                        </button>
                      </div>

                      <div class="py-1">
                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['unit_conversions.delete']"
                          class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                          <i class="fas fa-trash-alt w-4"></i>
                          <span class="font-medium">Delete Unit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="unitConversionStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="unitConversionStore.totalItems > 0" :total-items="unitConversionStore.totalItems"
        :per-page="unitConversionStore.perPage" :current-page="unitConversionStore.currentPage"
        :last-page="unitConversionStore.lastPage" :is-loading="unitConversionStore.isLoading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Conversion' : 'Edit Conversion'" maxWidth="4xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="py-3">
      <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">

        <div
          class="grid grid-cols-1 md:grid-cols-11 gap-4 items-start items-center bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">

          <!-- Left Side: From Unit (Takes up 4/11 columns on desktop) -->
          <div class="md:col-span-4 w-full">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              From Unit <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <select v-model="formData.from_unit_id" @change="clearValidationError('from_unit_id')"
                class="w-full pl-4 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': unitConversionStore.validationErrors.from_unit_id }">
                <option value="">Select unit</option>
                <option v-for="unit in allUnits" :key="unit.id" :value="unit.id">
                  {{ unit.name }} ({{ unit.unit }})
                </option>
              </select>
              <!-- Custom Select Arrow Icon -->
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            <p v-if="unitConversionStore.validationErrors.from_unit_id"
              class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"></path>
              </svg>
              {{ unitConversionStore.validationErrors.from_unit_id[0] }}
            </p>
          </div>

          <!-- Middle: Conversion Arrow Icon (Takes up 1/11 columns on desktop) -->
          <div class="md:col-span-1 flex justify-center items-center pt-5 md:pt-6">
            <div
              class="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-300 shadow-sm transition-transform hover:scale-105">
              <!-- Horizontal swap arrow for desktop, vertical swap arrow for mobile -->
              <svg class="w-5 h-5 hidden md:block" fill="none" stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <svg class="w-5 h-5 block md:hidden" fill="none" stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16 17l-4 4m0 0l-4-4m4 4V3M8 7l4-4m0 0l4 4m-4-4v18" />
              </svg>
            </div>
          </div>

          <!-- Right Side: To Unit & Rate Container (Takes up 6/11 columns on desktop) -->
          <div class="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

            <!-- To Unit -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                To Unit <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select v-model="formData.to_unit_id" @change="clearValidationError('to_unit_id')"
                  class="w-full pl-4 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                  :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': unitConversionStore.validationErrors.to_unit_id }">
                  <option value="">Select unit</option>
                  <option v-for="unit in allUnits" :key="unit.id" :value="unit.id">
                    {{ unit.name }} ({{ unit.unit }})
                  </option>
                </select>
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              <p v-if="unitConversionStore.validationErrors.to_unit_id"
                class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"></path>
                </svg>
                {{ unitConversionStore.validationErrors.to_unit_id[0] }}
              </p>
            </div>

            <!-- Rate -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Rate <span class="text-red-500">*</span>
              </label>
              <input v-model.number="formData.rate" type="number" step="any" placeholder="Enter conversion rate"
                @change="clearValidationError('rate')"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': unitConversionStore.validationErrors.rate }">
              <p v-if="unitConversionStore.validationErrors.rate"
                class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"></path>
                </svg>
                {{ unitConversionStore.validationErrors.rate[0] }}
              </p>
            </div>

          </div>


          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <div class="flex items-center space-x-6">
              <label class="inline-flex items-center cursor-pointer">
                <input v-model="formData.is_active" type="radio" :value="true"
                  @change="clearValidationError('is_active')"
                  class="h-4 w-4 text-gray-600 focus:ring-green-600 border-green-300 dark:border-green-600 dark:bg-green-700 accent-green-600">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
              <label class="inline-flex items-center cursor-pointer">
                <input v-model="formData.is_active" type="radio" :value="false"
                  @change="clearValidationError('is_active')"
                  class="h-4 w-4 text-red-600 focus:ring-red-600 border-red-300 dark:border-red-600 dark:bg-red-700 accent-red-600">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
              </label>
            </div>
            <p v-if="unitConversionStore.validationErrors.is_active"
              class="text-xs text-red-600 dark:text-red-400 mt-1">
              {{ unitConversionStore.validationErrors.is_active[0] }}
            </p>
          </div>
        </div>
        <!-- Actions -->
        <div class="md:col-span-2 flex justify-end gap-3 pt-4">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Cancel
          </button>

          <button type="submit" :disabled="unitConversionStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm text-white transition',
            unitConversionStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="unitConversionStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else> {{ modalMode === 'create' ? 'Create' : 'Update' }} </span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Unit Conversion Details"
    @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <div class="grid grid-cols-2 gap-4">

          <div class="col-span-2 md:col-span-2 2xl:col-span-2 flex flex-col items-center mb-4 text-center">
            <div class="flex items-center justify-center space-x-4 mb-2">
              <div class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <i :class="['fa-solid', getUnitIcon(viewingItem.from_unit?.unit), 'text-gray-400 text-xl']"></i>
              </div>
              <!-- Middle: Conversion Arrow Icon (Takes up 1/11 columns on desktop) -->
              <div class="md:col-span-1 flex justify-center items-center pt-1 md:pt-1">
                <div
                  class="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-300 shadow-sm transition-transform hover:scale-105">
                  <!-- Horizontal swap arrow for desktop, vertical swap arrow for mobile -->
                  <svg class="w-5 h-5 hidden md:block" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  <svg class="w-5 h-5 block md:hidden" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16 17l-4 4m0 0l-4-4m4 4V3M8 7l4-4m0 0l4 4m-4-4v18" />
                  </svg>
                </div>
              </div>
              <div class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <i :class="['fa-solid', getUnitIcon(viewingItem.to_unit?.unit), 'text-gray-400 text-xl']"></i>
              </div>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-2">
              {{ viewingItem.from_unit?.name }} to {{ viewingItem.to_unit?.name }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Conversion Rate: {{ viewingItem.rate }}
            </p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">From Unit</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1 capitalize">
              {{ viewingItem.from_unit?.name }}
              ({{ viewingItem.from_unit?.unit }})</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">To Unit</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1 capitalize">
              {{ viewingItem.to_unit?.name }}
              ({{ viewingItem.to_unit?.unit }})</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
            <div class="mt-1">
              <span :class="[
                'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                viewingItem.is_active === 1 || viewingItem.is_active === true
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              ]">
                {{ viewingItem.is_active === 1 || viewingItem.is_active === true ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeViewModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Close
      </button>
      <button v-permission="['unit_conversions.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Unit
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Unit" maxWidth="lg" :showClose="false" @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Unit</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{{ deletingItem?.name || 'this item' }}</strong>? This action cannot
          be undone.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="unitConversionStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          unitConversionStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="unitConversionStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Conversion</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUnitConversionStore } from '@/stores/unitConversionStore.js';
import { useProdUnitStore } from '@/stores/prodUnitStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';

const refresh = ref(false);

const tableColumns = ref([
  {
    "key": "from_unit_id",
    "label": "From Unit",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "to_unit_id",
    "label": "To Unit",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "rate",
    "label": "Rate",
    "sortable": true,
    "type": "number"
  },
  {
    "key": "is_active",
    "label": "Status",
    "sortable": true,
    "type": "boolean",
    "width": "100px"
  }
]);

// Initialize stores
const unitConversionStore = useUnitConversionStore();
const prodUnitStore = useProdUnitStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showStatusChangeModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

// Form data matching API structure
const formData = ref({
  from_unit_id: '',
  to_unit_id: '',
  rate: null,
  is_active: true
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const statusChangingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return unitConversionStore.items || [];
});

const allUnits = computed(() => {
  return prodUnitStore.items || [];
});

const calculateRowNumber = (index) => {
  if (unitConversionStore.pagination?.from && unitConversionStore.pagination.from > 0) {
    return unitConversionStore.pagination.from + index;
  }
  return (unitConversionStore.pagination.current_page - 1) * unitConversionStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (unitConversionStore.validationErrors && unitConversionStore.validationErrors[fieldName]) {
    const updatedErrors = { ...unitConversionStore.validationErrors };
    delete updatedErrors[fieldName];
    unitConversionStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  unitConversionStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await unitConversionStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  unitConversionStore.search('');
};


onMounted(async () => {
  getData();
  prodUnitStore.get({ per_page: 100 });
});

const getData = async () => {
  await unitConversionStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    clearSearch();
  } finally {
    refresh.value = false;
  }
}

// Modal functions
const openCreateModal = () => {
  resetForm();
  modalMode.value = 'create';
  isModalOpen.value = true;
  clearAllValidationErrors();
};

// Edit item function
const editItem = (item) => {
  currentItem.value = item;
  modalMode.value = 'edit';

  // Set form data matching API structure
  formData.value = {
    from_unit_id: item.from_unit_id || '',
    to_unit_id: item.to_unit_id || '',
    rate: item.rate || null,
    is_active: item.is_active === true || item.is_active === 1
  };

  isModalOpen.value = true;
  clearAllValidationErrors();
};

const viewItem = (item) => {
  viewingItem.value = item;
  showViewModal.value = true;
};

const confirmDelete = (item) => {
  deletingItem.value = item;
  showDeleteModal.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  resetForm();
  clearAllValidationErrors();
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingItem.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingItem.value = null;
};

const resetForm = () => {
  formData.value = {
    from_unit_id: '',
    to_unit_id: '',
    rate: null,
    is_active: true
  };
  currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

  // Manually build FormData to avoid the baseStore.js preparePayload bug
  Object.keys(formData.value).forEach((key) => {
    let value = formData.value[key];

    // Convert booleans to 1/0 for FormData
    if (typeof value === 'boolean') {
      value = value ? 1 : 0;
    }

    if (value !== null && value !== undefined && value !== '') {
      formDataToSend.append(key, value);
    }
  });

  let result;
  if (modalMode.value === 'create') {
    result = await unitConversionStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await unitConversionStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await unitConversionStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await unitConversionStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await unitConversionStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = unitConversionStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await unitConversionStore.sort(column.key, order);
};

const getUnitIcon = (unitType) => {
  if (!unitType) return 'fa-scale-balanced';

  const type = unitType.toLowerCase();

  // Weight/Mass
  if (type === 'kg' || type === 'gram' || type === 'g' || type === 'mg' || type === 'gm') {
    return 'fa-scale-balanced';
  }

  // Piece / Quantity
  if (type === 'pcs' || type === 'piece' || type === 'unit') {
    return 'fa-box';
  }

  // Liquid
  if (type === 'liter' || type === 'ltr' || type === 'ml' || type === 'milliliter') {
    return 'fa-flask';
  }

  // Length
  if (type === 'meter' || type === 'inch' || type === 'ft') {
    return 'fa-ruler';
  }

  // Bulk / multiple
  if (type === 'dozen' || type === 'pack' || type === 'set') {
    return 'fa-boxes-stacked';
  }

  // Medicine
  if (type === 'tablet' || type === 'capsule') {
    return 'fa-prescription-bottle';
  }

  // Default
  return 'fa-scale-balanced';
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>