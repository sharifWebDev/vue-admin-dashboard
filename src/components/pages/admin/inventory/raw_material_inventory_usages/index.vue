<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
          Raw Material Inventory Usages
        </h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row flex-wrap justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openUsageModal" v-permission="['raw-material-usage.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <div class="flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto items-start sm:items-end">
        <!-- Warehouse filter -->
        <div class="flex flex-col relative w-full sm:w-56">
          <SearchSelect v-model="filters.warehouse_id" :options="warehouses" label="Warehouse" @change="applyFilters"
            placeholder="-- Select Warehouse --" :error="null" class="mt-2" />
        </div>

        <!-- Date Range -->
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div class="flex flex-col relative w-full">
            <label for="fromDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">From Date</label>
            <input v-model="filters.from_date" type="date" id="fromDate" @change="applyFilters"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150" />
          </div>
          <div class="flex flex-col relative w-full">
            <label for="toDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">To Date</label>
            <input v-model="filters.to_date" type="date" id="toDate" @change="applyFilters"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150" />
          </div>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <input v-model="filters.search" @keyup.enter="applyFilters" type="search"
            placeholder="Search by reference, material..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all duration-150 shadow-sm" />
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <i class="fas fa-search text-base"></i>
          </div>
        </div>

        <!-- Filter Action Buttons -->
        <div class="flex gap-2">
          <button @click="resetFilters" :disabled="loading"
            class="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="usageStore.sortBy"
            :sort-direction="usageStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="loading" :is-loading="true" :total-items="reportItems.length"
            :item-name="'raw material usages'" loading-text="Loading raw material usages..."
            loading-subtext="Fetching your usage data" />

          <!-- Empty/Initial State -->
          <TableLoadingState v-else-if="reportItems.length === 0" :is-loading="false" :isEmpty="true"
            :has-search="hasActiveFilters" :item-name="'raw material usages'" empty-icon="fas fa-boxes"
            empty-title="No raw material usages found" :empty-message="hasActiveFilters
              ? 'No entries match your filter criteria. Try adjusting your filters.'
              : 'Apply filters above to view raw material usages.'
              " :show-create-button="false" @clear-search="resetFilters" />

          <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(item, index) in reportItems" :key="item.reference_no"
              class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <!-- SL -->
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>

              <!-- Reference No + Date -->
              <td class="px-6 py-3 whitespace-nowrap">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.reference_no || 'N/A' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Date: {{ formatDate(item.usage_date) }}
                </p>
              </td>

              <!-- Warehouse -->
              <td class="px-6 py-3">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ item.warehouse?.name || 'N/A' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ item.warehouse?.code || '' }}
                </p>
              </td>

              <!-- Total Items -->
              <td class="px-6 py-3 text-left text-sm text-gray-900 dark:text-white">
                {{ item.total_items || 0 }}
              </td>

              <!-- Total Qty -->
              <td class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatNumber(item.total_qty) }}
              </td>

              <!-- Created By -->
              <td class="px-6 py-3 text-left text-sm text-gray-900 dark:text-white">
                {{ item.usages?.[0]?.creator?.name || 'N/A' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-3 text-center whitespace-nowrap">
                <div class="flex items-center justify-end space-x-1">
                  <!-- View Button -->
                  <button @click="viewItem(item)" v-permission="['raw-material-usage.view']"
                    class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    title="Quick View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <!-- Export Invoice Button -->
                  <button @click="exportInvoice(item.reference_no)" :disabled="rowExporting === item.reference_no"
                    class="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-lg transition-all disabled:opacity-50"
                    :title="rowExporting === item.reference_no ? 'Exporting...' : 'Export Invoice'">
                    <i class="fas"
                      :class="rowExporting === item.reference_no ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i>
                  </button>

                  <!-- Dropdown Container -->
                  <div class="relative inline-block text-left" v-click-outside="() => item.showDropdown = false"
                    v-permission="['raw-material-usage.update', 'raw-material-usage.delete']">

                    <button @click="item.showDropdown = !item.showDropdown"
                      class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none">
                      <i class="fas fa-ellipsis-h"></i>
                    </button>

                    <!-- Dropdown Menu -->
                    <div v-if="item.showDropdown"
                      class="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none overflow-hidden transform transition-all">

                      <div class="py-1">
                        <button @click="editUsageItem(item); item.showDropdown = false"
                          v-permission="['raw-material-usage.update']"
                          class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                          <i class="fas fa-edit text-amber-500 w-4"></i>
                          <span class="font-medium">Edit Usage</span>
                        </button>
                      </div>

                      <div class="py-1">
                        <button @click="confirmDelete(item); item.showDropdown = false"
                          v-permission="['raw-material-usage.delete']"
                          class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                          <i class="fas fa-trash-alt w-4"></i>
                          <span class="font-medium">Delete Usage</span>
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

      <!-- Pagination -->
      <div v-if="reportItems.length > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing
            <span class="font-medium text-gray-900 dark:text-white">{{ showingFrom }}</span>
            to
            <span class="font-medium text-gray-900 dark:text-white">{{ showingTo }}</span>
            of
            <span class="font-medium text-gray-900 dark:text-white">{{ pagination.total }}</span>
            entries
          </span>

          <div class="flex items-center gap-2">
            <label for="perPage" class="text-sm">Per page:</label>
            <select id="perPage" v-model.number="pagination.per_page" @change="changePerPage"
              class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button @click="goToPage(pagination.current_page - 1)" :disabled="pagination.current_page <= 1 || loading"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-chevron-left"></i>
          </button>

          <button v-for="page in visiblePages" :key="page" @click="goToPage(page)" :disabled="loading"
            class="px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-50" :class="page === pagination.current_page
              ? 'bg-gray-700 text-white border-gray-700 dark:bg-gray-600 dark:border-gray-600'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              ">
            {{ page }}
          </button>

          <button @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page || loading"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Create/Edit Usage Modal -->
  <BaseModal v-if="isUsageModalOpen" :show="isUsageModalOpen"
    :title="usageModalMode === 'create' ? 'Record Usage' : 'Edit Usage'" maxWidth="7xl" @close="closeUsageModal">
    <form @submit.prevent="handleUsageSubmit" class="px-2 py-3 space-y-4 min-h-[35vh]">
      <!-- Warehouse Selection -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Warehouse <span class="text-xs text-red-500">*</span>
          </label>
          <SearchSelect v-model="usageFormData.warehouse_id" :options="warehouses" placeholder="Select a warehouse"
            option-value="id" option-label="name" @change="onWarehouseSelectForUsage"
            :class="{ 'border-red-500': getUsageValidationErrors('warehouse_id') }" />
          <p v-if="getUsageValidationErrors('warehouse_id')" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ getUsageValidationErrors('warehouse_id')[0] }}
          </p>
        </div>
      </div>

      <!-- Usage Items Table -->
      <div class="border rounded-lg overflow-visible dark:border-gray-700">
        <div class="overflow-visible">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                  #
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Raw Material <span class="text-red-500">*</span>
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Available Quantity
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity Used <span class="text-red-500">*</span>
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usage Date <span class="text-red-500">*</span>
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Note
                </th>
                <th
                  class="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(item, index) in usageFormData.items" :key="index">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {{ index + 1 }}
                </td>
                <td class="px-4 py-2">
                  <SearchSelect v-model="item.raw_material_id" :options="getAvailableUsageMaterials(index)"
                    :disabled="!usageFormData.warehouse_id" placeholder="Select a material" option-value="id"
                    option-label="name" @change="onMaterialSelectForUsage(index)" class="min-w-[180px]"
                    :class="{ 'border-red-500': getUsageItemValidationErrors(index, 'raw_material_id') }" />
                  <p v-if="getUsageItemValidationErrors(index, 'raw_material_id')"
                    class="text-xs text-red-600 dark:text-red-400 mt-1">
                    {{ getUsageItemValidationErrors(index, 'raw_material_id')[0] }}
                  </p>
                </td>
                <td class="px-4 py-2">
                  <span v-if="item.available_quantity !== null"
                    class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ formatQuantity(item.available_quantity) }}
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {{ getMaterialUnit(item.raw_material_id) }}
                    </span>
                  </span>
                  <span v-else class="text-sm text-gray-400 dark:text-gray-500">
                    Select material
                  </span>
                </td>
                <td class="px-4 py-2">
                  <div class="flex items-center gap-2">
                    <input v-model="item.qty" type="number" step="0.01" min="0" placeholder="Enter quantity"
                      :disabled="!item.raw_material_id || !usageFormData.warehouse_id"
                      @input="validateUsageQuantity(index)" @blur="validateUsageQuantity(index)"
                      class="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                      :class="{ 'border-red-500': getUsageItemValidationErrors(index, 'qty') }" />
                    <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {{ getMaterialUnit(item.raw_material_id) }}
                    </span>
                  </div>
                  <p v-if="getUsageItemValidationErrors(index, 'qty')"
                    class="text-xs text-red-600 dark:text-red-400 mt-1">
                    {{ getUsageItemValidationErrors(index, 'qty')[0] }}
                  </p>
                </td>
                <td class="px-4 py-2">
                  <input v-model="item.usage_date" type="date"
                    @change="clearUsageItemValidationError(index, 'usage_date')"
                    class="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': getUsageItemValidationErrors(index, 'usage_date') }" />
                  <p v-if="getUsageItemValidationErrors(index, 'usage_date')"
                    class="text-xs text-red-600 dark:text-red-400 mt-1">
                    {{ getUsageItemValidationErrors(index, 'usage_date')[0] }}
                  </p>
                </td>
                <td class="px-4 py-2">
                  <input v-model="item.note" type="text" placeholder="Optional note"
                    class="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white" />
                </td>
                <td class="px-4 py-2 text-center">
                  <button type="button" @click="removeUsageItem(index)" :disabled="usageFormData.items.length <= 1"
                    class="p-1.5 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Remove row">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add Row Button -->
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <button type="button" @click="addUsageItem" :disabled="!usageFormData.warehouse_id"
            class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-plus mr-2"></i> Add Row
          </button>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="mt-[20px]">
        <div class="mt-[60px] flex justify-end space-x-3">
          <button type="button" @click="closeUsageModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="isUsageSubmitting" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            isUsageSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="isUsageSubmitting">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ usageModalMode === 'create' ? 'Recording...' : 'Updating...' }}
            </span>
            <span v-else> {{ usageModalMode === 'create' ? 'Record Usage' : 'Update Usage' }} </span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Raw Material Usage Details"
    @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 gap-4">
        <div class="grid grid-cols-2 gap-4">

          <!-- Header -->
          <div class="col-span-2 flex flex-col items-center mb-4">
            <div class="h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <i class="fa-solid fa-boxes text-gray-400 text-3xl"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-2">{{ viewingItem.reference_no }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ viewingItem.warehouse?.name || 'N/A' }} • {{ formatDate(viewingItem.usage_date) }}
            </p>
          </div>

          <!-- Reference No -->
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference No</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.reference_no || 'N/A' }}</p>
          </div>

          <!-- Usage Date -->
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usage Date</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDate(viewingItem.usage_date) }}</p>
          </div>

          <!-- Warehouse -->
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Warehouse</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.warehouse?.name || 'N/A' }}</p>
          </div>

          <!-- Warehouse Code -->
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Warehouse Code</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.warehouse?.code || 'N/A' }}</p>
          </div>

          <!-- Total Items -->
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Items</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.total_items || 0 }}</p>
          </div>

          <!-- Total Qty -->
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Quantity</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatNumber(viewingItem.total_qty) }}</p>
          </div>

          <!-- Created By -->
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created By</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ viewingItem.usages?.[0]?.creator?.name || 'N/A' }}
            </p>
          </div>

          <!-- Status -->
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

        <!-- Usage Items Table -->
        <div v-if="viewingItem.usages && viewingItem.usages.length > 0" class="mt-4">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Usage Items</h3>
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Material</th>
                  <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Quantity</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Note
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="(usage, idx) in viewingItem.usages" :key="idx"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {{ usage.raw_material?.name || usage.material?.name || 'N/A' }}
                  </td>
                  <td class="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                    {{ formatNumber(usage.qty_used || usage.quantity) }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {{ usage.raw_material?.measurement_unit?.symbol || usage.material?.unit || 'N/A' }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {{ usage.note || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
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
      <button @click="exportInvoice(viewingItem.reference_no)" :disabled="rowExporting === viewingItem.reference_no"
        class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50">
        <span v-if="rowExporting === viewingItem.reference_no">
          <i class="fas fa-spinner fa-spin mr-2"></i>Exporting...
        </span>
        <span v-else>
          <i class="fas fa-file-pdf mr-2"></i>Export PDF
        </span>
      </button>
      <button v-permission="['raw-material-usage.update']" @click="editUsageItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Usage
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Raw Material Usage" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Raw Material Usage</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{{ deletingItem?.reference_no || 'this item' }}</strong>? This action
          cannot be undone.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="deleting" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          deleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="deleting">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Usage</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRawMaterialInventoryUsageReportStore } from '@/stores/rawMaterialInventoryUsageReportStore.js';
import { useRawMaterialInventoryUsageStore } from '@/stores/rawMaterialInventoryUsageStore';
import { useRawMaterialStore } from '@/stores/rawMaterialStore';
import { useWarehouseStore } from '@/stores/warehouseStore.js';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import axiosClient from '@/axiosClient';
import { useToast } from 'vue-toastification';

// Initialize stores
const usageStore = useRawMaterialInventoryUsageReportStore();
const usageCreateStore = useRawMaterialInventoryUsageStore();
const warehouseStore = useWarehouseStore();
const rawMaterialStore = useRawMaterialStore();
const toast = useToast();

// State
const loading = ref(false);
const exporting = ref(false);
const rowExporting = ref(null);
const reportItems = ref([]);

// Modal states
const isUsageModalOpen = ref(false);
const isUsageSubmitting = ref(false);
const usageModalMode = ref('create'); // 'create' | 'edit'
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);

// Form data for usage modal (matches API payload)
const usageFormData = ref({
  warehouse_id: '',
  reference_no: '',
  items: [
    {
      raw_material_id: '',
      qty: '',
      usage_date: '',
      note: '',
      available_quantity: null
    }
  ]
});

// Store validation errors
const usageItemErrors = ref({});
const usageCheckErrors = ref({});

// Selected items
const currentUsageItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);

const summary = reactive({
  total_groups: 0,
  total_items: 0,
  total_qty: 0,
});

// Pagination state
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
});

// Table columns configuration
const tableColumns = ref([
  { key: 'reference_no', label: 'Reference Info', sortable: true, type: 'varchar' },
  { key: 'warehouse', label: 'Warehouse', sortable: true, type: 'varchar' },
  { key: 'total_items', label: 'Items', sortable: true, type: 'number', class: 'text-right' },
  { key: 'total_qty', label: 'Total Qty', sortable: true, type: 'decimal', class: 'text-right' },
  { key: 'created_by', label: 'Created By', sortable: false, type: 'varchar' },
]);

// Filters
const filters = reactive({
  warehouse_id: '',
  from_date: '',
  to_date: '',
  search: '',
});

const hasActiveFilters = computed(() => {
  return (
    filters.warehouse_id ||
    filters.from_date ||
    filters.to_date ||
    filters.search
  );
});

const warehouses = computed(() => warehouseStore.items || []);
const rawMaterials = computed(() => rawMaterialStore.items || []);

// Pagination computed helpers
const showingFrom = computed(() => {
  if (pagination.total === 0) return 0;
  return (pagination.current_page - 1) * pagination.per_page + 1;
});

const showingTo = computed(() => {
  const to = pagination.current_page * pagination.per_page;
  return to > pagination.total ? pagination.total : to;
});

const visiblePages = computed(() => {
  const total = pagination.last_page;
  const current = pagination.current_page;
  const pages = [];
  const maxVisible = 5;

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;

  if (end > total) {
    end = total;
    start = end - maxVisible + 1;
  }

  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// ─────────────────────────────────────────────────────────────
// Local date helper (avoids UTC off-by-one)
// ─────────────────────────────────────────────────────────────
const getLocalDateString = (dateInput = new Date()) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  // en-CA gives YYYY-MM-DD
  return d.toLocaleDateString('en-CA');
};

// ─────────────────────────────────────────────────────────────
// Validation error helpers
// ─────────────────────────────────────────────────────────────
const getUsageValidationErrors = (field) => {
  return usageCreateStore.validationErrors?.[field] || null;
};

const getUsageItemValidationErrors = (index, field) => {
  const key = `${index}.${field}`;
  if (usageItemErrors.value[key]) {
    return usageItemErrors.value[key];
  }
  if (usageCheckErrors.value[key]) {
    return usageCheckErrors.value[key];
  }
  return null;
};

const clearUsageValidationError = (fieldName) => {
  if (usageCreateStore.validationErrors?.[fieldName]) {
    const updatedErrors = { ...usageCreateStore.validationErrors };
    delete updatedErrors[fieldName];
    usageCreateStore.validationErrors = updatedErrors;
  }
};

const clearUsageItemValidationError = (index, field) => {
  const key = `${index}.${field}`;
  if (usageItemErrors.value[key]) {
    const updatedErrors = { ...usageItemErrors.value };
    delete updatedErrors[key];
    usageItemErrors.value = updatedErrors;
  }
  if (usageCheckErrors.value[key]) {
    const updatedErrors = { ...usageCheckErrors.value };
    delete updatedErrors[key];
    usageCheckErrors.value = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  usageCreateStore.validationErrors = {};
  usageItemErrors.value = {};
  usageCheckErrors.value = {};
};

// ─────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────
const getAvailableUsageMaterials = (currentItemIndex) => {
  if (!usageFormData.value.warehouse_id) {
    return [];
  }

  const selectedMaterials = usageFormData.value.items
    .map((item, index) => index !== currentItemIndex ? item.raw_material_id : null)
    .filter(id => id);

  return rawMaterials.value.filter(material => !selectedMaterials.includes(material.id));
};

const getMaterialUnit = (materialId) => {
  if (!materialId) return '';
  const material = rawMaterials.value.find(m => m.id === parseInt(materialId));
  return material?.measurement_unit?.symbol || '';
};

const formatQuantity = (qty) => {
  if (qty === null || qty === undefined) return '0';
  return parseFloat(qty).toFixed(2);
};

// ─────────────────────────────────────────────────────────────
// Usage - Check available quantity
// ─────────────────────────────────────────────────────────────
const checkAvailableQuantity = async (index) => {
  const item = usageFormData.value.items[index];
  if (!item.raw_material_id || !usageFormData.value.warehouse_id) {
    return;
  }

  try {
    const response = await axiosClient.get('raw-material-inventory', {
      params: {
        warehouse_id: usageFormData.value.warehouse_id,
        raw_material_id: item.raw_material_id,
        per_page: 1
      }
    });

    if (response.data?.success && response.data?.data?.data?.length > 0) {
      const inventoryData = response.data.data.data[0];
      item.available_quantity = parseFloat(inventoryData.qty) || 0;

      const key = `${index}.qty`;
      if (usageCheckErrors.value[key]) {
        const updatedErrors = { ...usageCheckErrors.value };
        delete updatedErrors[key];
        usageCheckErrors.value = updatedErrors;
      }

      if (item.qty) {
        validateUsageQuantity(index);
      }
    } else {
      item.available_quantity = 0;
      const key = `${index}.qty`;
      usageCheckErrors.value[key] = ['No inventory found for this material in the selected warehouse'];
    }
  } catch (error) {
    item.available_quantity = null;
  }
};

// Validate usage quantity
const validateUsageQuantity = (index) => {
  const item = usageFormData.value.items[index];
  const key = `${index}.qty`;

  if (usageCheckErrors.value[key]) {
    const updatedErrors = { ...usageCheckErrors.value };
    delete updatedErrors[key];
    usageCheckErrors.value = updatedErrors;
  }

  if (usageItemErrors.value[key]) {
    const updatedErrors = { ...usageItemErrors.value };
    delete updatedErrors[key];
    usageItemErrors.value = updatedErrors;
  }

  if (!item.raw_material_id || !usageFormData.value.warehouse_id) {
    return;
  }

  if (!item.qty || parseFloat(item.qty) <= 0) {
    return;
  }

  if (item.available_quantity === null) {
    checkAvailableQuantity(index);
    return;
  }

  const enteredQty = parseFloat(item.qty);
  const availableQty = parseFloat(item.available_quantity);
  const maxInputQty = enteredQty + availableQty

  if (enteredQty > availableQty) {
    usageCheckErrors.value[key] = [`Insufficient stock. Available: ${formatQuantity(availableQty)} ${getMaterialUnit(item.raw_material_id)}`];
  }
};

// Warehouse select handler
const onWarehouseSelectForUsage = () => {
  usageFormData.value.items.forEach((item) => {
    item.available_quantity = null;
    if (item.raw_material_id) {
      item.raw_material_id = '';
      item.qty = '';
    }
  });
  clearAllValidationErrors();
};

// Material select handler
const onMaterialSelectForUsage = (index) => {
  const item = usageFormData.value.items[index];
  item.qty = '';
  item.available_quantity = null;

  clearUsageItemValidationError(index, 'qty');
  clearUsageItemValidationError(index, 'raw_material_id');

  if (item.raw_material_id && usageFormData.value.warehouse_id) {
    checkAvailableQuantity(index);
  }
};

// Item Management
const addUsageItem = () => {
  const today = getLocalDateString();
  usageFormData.value.items.push({
    raw_material_id: '',
    qty: '',
    usage_date: today,
    note: '',
    available_quantity: null
  });
};

const removeUsageItem = (index) => {
  if (usageFormData.value.items.length > 1) {
    usageFormData.value.items.splice(index, 1);

    const itemKeys = Object.keys(usageItemErrors.value).filter(key => key.startsWith(`${index}.`));
    itemKeys.forEach(key => {
      delete usageItemErrors.value[key];
    });

    const checkKeys = Object.keys(usageCheckErrors.value).filter(key => key.startsWith(`${index}.`));
    checkKeys.forEach(key => {
      delete usageCheckErrors.value[key];
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Usage Modal functions
// ─────────────────────────────────────────────────────────────
const openUsageModal = async () => {
  if (rawMaterials.value.length === 0 || warehouses.value.length === 0) {
    await loadRelatedData();
  }
  usageModalMode.value = 'create';
  resetUsageForm();
  isUsageModalOpen.value = true;
  clearAllValidationErrors();
};

const editUsageItem = async (item) => {
  // Close view modal if it's open (edit is also triggered from view modal)
  if (showViewModal.value) {
    showViewModal.value = false;
  }

  if (rawMaterials.value.length === 0 || warehouses.value.length === 0) {
    await loadRelatedData();
  }

  usageModalMode.value = 'edit';
  currentUsageItem.value = item;

  const today = getLocalDateString();

  const items = item.usages?.length
    ? item.usages.map(usage => ({
      id: usage.id || '',
      raw_material_id: usage.raw_material_id || usage.raw_material?.id || '',
      // ✅ FIX: template binds `item.qty`, so map to `qty`
      qty: usage.qty_used != null && usage.qty_used !== ''
        ? Number(usage.qty_used)
        : '',
      usage_date: usage.usage_date
        ? getLocalDateString(usage.usage_date)
        : today,
      note: usage.note || '',
      available_quantity: null
    }))
    : [{
      raw_material_id: '',
      qty: '',
      usage_date: today,
      note: '',
      available_quantity: null,
    }];

  usageFormData.value = {
    warehouse_id: item.warehouse?.id || item.warehouse_id || '',
    reference_no: item.reference_no || '',
    items: items
  };

  isUsageModalOpen.value = true;
  clearAllValidationErrors();

  // Fetch available quantity for each item
  for (let i = 0; i < usageFormData.value.items.length; i++) {
    if (usageFormData.value.items[i].raw_material_id && usageFormData.value.warehouse_id) {
      await checkAvailableQuantity(i);
    }
  }
};

const closeUsageModal = () => {
  isUsageModalOpen.value = false;
  resetUsageForm();
  clearAllValidationErrors();
};

const resetUsageForm = () => {
  const today = getLocalDateString();
  usageFormData.value = {
    warehouse_id: '',
    reference_no: '',
    items: [
      {
        raw_material_id: '',
        // ✅ FIX: use `qty` to match template
        qty: '',
        usage_date: today,
        note: '',
        available_quantity: null
      }
    ]
  };
  currentUsageItem.value = null;
  usageItemErrors.value = {};
  usageCheckErrors.value = {};
};

// ─────────────────────────────────────────────────────────────
// Validate usage items
// ─────────────────────────────────────────────────────────────
const validateUsageItems = () => {
  let isValid = true;
  const errors = {};
  const checkErrors = {};

  usageFormData.value.items.forEach((item, index) => {
    if (!item.raw_material_id) {
      errors[`${index}.raw_material_id`] = ['Raw material is required'];
      isValid = false;
    }
    if (!item.qty || parseFloat(item.qty) <= 0) {
      errors[`${index}.qty`] = ['Quantity must be greater than 0'];
      isValid = false;
    }
    if (!item.usage_date) {
      errors[`${index}.usage_date`] = ['Usage date is required'];
      isValid = false;
    }

    if (item.raw_material_id && item.qty && item.available_quantity !== null) {
      const enteredQty = parseFloat(item.qty);
      const availableQty = parseFloat(item.available_quantity);
      if (enteredQty > availableQty) {
        checkErrors[`${index}.qty`] = [`Insufficient stock. Available: ${formatQuantity(availableQty)} ${getMaterialUnit(item.raw_material_id)}`];
        isValid = false;
      }
    }
  });

  usageItemErrors.value = errors;
  usageCheckErrors.value = checkErrors;
  return isValid;
};

// ─────────────────────────────────────────────────────────────
// CRUD operations
// ─────────────────────────────────────────────────────────────
const handleUsageSubmit = async () => {
  isUsageSubmitting.value = true;
  clearAllValidationErrors();

  try {
    if (!validateUsageItems()) {
      isUsageSubmitting.value = false;
      return;
    }

    if (!usageFormData.value.warehouse_id) {
      usageCreateStore.validationErrors = { warehouse_id: ['Warehouse is required'] };
      isUsageSubmitting.value = false;
      return;
    }

    // Build payload matching API structure
    const payload = {
      warehouse_id: parseInt(usageFormData.value.warehouse_id),
      reference_no: usageFormData.value.reference_no || '',
      items: usageFormData.value.items.map(item => ({
        id: item.id || '',
        raw_material_id: parseInt(item.raw_material_id),
        qty_used: parseFloat(item.qty),
        usage_date: item.usage_date,
        note: item.note || ''
      }))
    };

    let result;

    if (usageModalMode.value === 'edit') {
      payload._method = 'PUT';
    }

    result = await usageCreateStore.create(payload);

    if (result && result.success) {
      toast.success(usageModalMode.value === 'create'
        ? 'Usage recorded successfully'
        : 'Usage updated successfully');
      closeUsageModal();
      await fetchReport();
    } else if (result?.errors) {
      handleApiValidationErrors(result.errors);
    }
  } catch (error) {
    console.error('Error submitting usage form:', error);
    if (error.response?.data?.errors) {
      handleApiValidationErrors(error.response.data.errors);
    } else {
      toast.error(error.response?.data?.message || 'Failed to save usage');
    }
  } finally {
    isUsageSubmitting.value = false;
  }
};

const handleApiValidationErrors = (errors) => {
  if (errors.items) {
    errors.items.forEach((itemErrors, index) => {
      if (itemErrors.raw_material_id) {
        usageItemErrors.value[`${index}.raw_material_id`] = itemErrors.raw_material_id;
      }
      if (itemErrors.qty_used || itemErrors.qty) {
        usageItemErrors.value[`${index}.qty`] = itemErrors.qty_used || itemErrors.qty;
      }
      if (itemErrors.usage_date) {
        usageItemErrors.value[`${index}.usage_date`] = itemErrors.usage_date;
      }
    });
  } else {
    usageCreateStore.validationErrors = errors;
  }
};
const handleDelete = async () => {
  if (!deletingItem.value) return;

  const referenceNo = deletingItem.value.reference_no;
  const warehouseId = deletingItem.value.warehouse?.id
    ?? deletingItem.value.usages?.[0]?.warehouse_id;   // fallback

  if (!referenceNo || !warehouseId) {
    toast.error('Reference number or warehouse is missing');
    return;
  }

  deleting.value = true;
  try {
    const response = await axiosClient.delete(
      `/raw-material-inventory/bulk-usage/${referenceNo}/${warehouseId}`
    );
    const apiResponse = response.data; 
    if (apiResponse.success) {
      toast.success('Usage deleted successfully');
      closeDeleteModal();
      await fetchReport();
    } else {
      toast.error(apiResponse.message || 'Failed to delete usage');
    }
  } catch (error) {
    console.error('Error deleting usage:', error);
    toast.error(error.response?.data?.message || 'Failed to delete usage');
  } finally {
    deleting.value = false;
  }
};

// ─────────────────────────────────────────────────────────────
// View / Delete Modal
// ─────────────────────────────────────────────────────────────
const viewItem = (item) => {
  viewingItem.value = item;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingItem.value = null;
};

const confirmDelete = (item) => {
  deletingItem.value = item;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingItem.value = null;
};

// ─────────────────────────────────────────────────────────────
// Fetch data
// ─────────────────────────────────────────────────────────────
const fetchReport = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page,
    };
    if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.search) params.search = filters.search;
    if (usageStore.sortBy) params.sort_by = usageStore.sortBy;
    if (usageStore.sortDirection) params.sort_direction = usageStore.sortDirection;

    const response = await axiosClient.get(
      '/raw-material-inventory/usage/grouped-by-reference',
      { params }
    );
    const apiResponse = response.data;

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API request failed');
    }

    reportItems.value = Array.isArray(apiResponse.data?.data)
      ? apiResponse.data.data
      : [];

    const meta = apiResponse.data?.meta || apiResponse.data;
    pagination.current_page = meta?.current_page || 1;
    pagination.last_page = meta?.last_page || 1;
    pagination.per_page = meta?.per_page || pagination.per_page;
    pagination.total = meta?.total || apiResponse.data?.total_groups || reportItems.value.length;

    summary.total_groups = apiResponse.data?.total_groups || pagination.total;
    summary.total_items = apiResponse.data?.total_items || 0;
    summary.total_qty = apiResponse.data?.total_qty || 0;
  } catch (error) {
    console.error('Failed to fetch raw material usages report:', error);
    toast.error('Failed to fetch raw material usages report');
  } finally {
    loading.value = false;
  }
};

const sortByColumn = async (column) => {
  if (!column) return;

  if (usageStore.sortBy === column) {
    usageStore.sortDirection = usageStore.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    usageStore.sortBy = column;
    usageStore.sortDirection = 'asc';
  }

  pagination.current_page = 1;
  await fetchReport();
};

const goToPage = async (page) => {
  if (page < 1 || page > pagination.last_page) return;
  if (page === pagination.current_page) return;
  pagination.current_page = page;
  await fetchReport();
};

const changePerPage = async () => {
  pagination.current_page = 1;
  await fetchReport();
};

const loadRelatedData = async () => {
  try {
    await rawMaterialStore.getAll();
    await warehouseStore.getAll();
  } catch (error) {
    console.error('Error loading related data:', error);
  }
};

onMounted(async () => {
  await fetchReport();
  await loadRelatedData();
});

const applyFilters = async () => {
  pagination.current_page = 1;
  await fetchReport();
};

const resetFilters = async () => {
  filters.warehouse_id = '';
  filters.from_date = '';
  filters.to_date = '';
  filters.search = '';

  reportItems.value = [];
  summary.total_groups = 0;
  summary.total_items = 0;
  summary.total_qty = 0;
  usageStore.sortBy = null;
  usageStore.sortDirection = 'asc';

  pagination.current_page = 1;
  pagination.last_page = 1;
  pagination.total = 0;

  await fetchReport();
};

// ─────────────────────────────────────────────────────────────
// Per-row Export Invoice PDF
// ─────────────────────────────────────────────────────────────
const exportInvoice = async (referenceNo) => {
  if (!referenceNo) {
    toast.error('Reference number is missing');
    return;
  }
  if (rowExporting.value === referenceNo) return;

  rowExporting.value = referenceNo;
  try {
    const response = await axiosClient.get(
      `/raw-material-inventory/usage/${referenceNo}/download-pdf`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `raw-material-usage-${referenceNo}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success(`Invoice ${referenceNo} exported successfully`);
  } catch (error) {
    console.error(`Error exporting invoice ${referenceNo}:`, error);
    toast.error(`Failed to export invoice ${referenceNo}`);
  } finally {
    if (rowExporting.value === referenceNo) {
      rowExporting.value = null;
    }
  }
};

// ─────────────────────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────────────────────
const calculateRowNumber = (index) => {
  return (pagination.current_page - 1) * pagination.per_page + index + 1;
};

const formatNumber = (value) => {
  if (value === undefined || value === null) return '0.00';
  const num = Number(value);
  return Number.isNaN(num) ? '0.00' : num.toFixed(2);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

button:disabled {
  cursor: not-allowed;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>