<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Raw Material
          Inventory Logs
        </h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <div> </div>

      <!-- Right Side: Search and Filters -->
      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <!-- Raw Material Filter -->
        <div class="relative w-[200px]">
          <SearchSelect v-model="filters.raw_material_id" :options="rawMaterials" option-label="name" option-value="id"
            placeholder="All Materials" @change="applyFilters" />
        </div>

        <!-- Warehouse Filter -->
        <div class="relative  w-[200px]">
          <SearchSelect v-model="filters.warehouse_id" :options="warehouses" option-label="name" option-value="id"
            placeholder="All Warehouses" @change="applyFilters" />
        </div>

        <!-- Action Filter -->
        <div class="relative  w-[200px]">
          <SearchSelect v-model="filters.action" :options="actionOptions" option-label="name" option-value="id"
            placeholder="All Actions" @change="applyFilters" />
        </div>

        <!-- Date From -->
        <div>
          <input v-model="filters.from_date" type="date" @change="applyFilters"
            class="w-[160px] pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            placeholder="Date From" />
        </div>

        <!-- Date To -->
        <div>
          <input v-model="filters.to_date" type="date" @change="applyFilters"
            class="w-[160px] pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            placeholder="Date To" />
        </div>

        <!-- Search Input -->
        <div class="relative flex-1 min-w-0 max-w-md">
          <input v-model="searchQuery" @input="handleSearch" type="search"
            placeholder="Search by material or warehouse..."
            class="w-[200px] pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <i class="fas fa-search text-base"></i>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-4">
          <button @click="removeAllFilters"
            class="btn px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            :disabled="refresh">
            <i class="fas fa-sync-alt" :class="{ 'animate-spin': refresh }"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 mb-4">
      <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Filters:</span>
      <span v-if="filters.raw_material_id"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
        Material: {{ getRawMaterialName(filters.raw_material_id) }}
        <button @click="removeFilter('raw_material_id')" class="ml-1 hover:text-blue-600 dark:hover:text-blue-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
      <span v-if="filters.warehouse_id"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
        Warehouse: {{ getWarehouseName(filters.warehouse_id) }}
        <button @click="removeFilter('warehouse_id')" class="ml-1 hover:text-green-600 dark:hover:text-green-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
      <span v-if="filters.action"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
        Action: {{ getActionLabel(filters.action) }}
        <button @click="removeFilter('action')" class="ml-1 hover:text-purple-600 dark:hover:text-purple-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
      <span v-if="filters.from_date"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
        From: {{ formatDate(filters.from_date) }}
        <button @click="removeFilter('from_date')" class="ml-1 hover:text-yellow-600 dark:hover:text-yellow-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
      <span v-if="filters.to_date"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
        To: {{ formatDate(filters.to_date) }}
        <button @click="removeFilter('to_date')" class="ml-1 hover:text-yellow-600 dark:hover:text-yellow-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
      <span v-if="searchQuery"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
        Search: "{{ searchQuery }}"
        <button @click="clearSearch" class="ml-1 hover:text-gray-600 dark:hover:text-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
      <div class="overflow-x-auto min-h-[150px]">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="logStore.sortBy"
            :sort-direction="logStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="logStore.loading" :is-loading="true" :total-items="logStore.totalItems"
            :item-name="'log records'" loading-text="Loading inventory logs..."
            loading-subtext="Fetching your raw material stock changes" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="logStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'log records'" empty-icon="fas fa-history"
              empty-title="No inventory logs found"
              :empty-message="searchQuery ? 'No logs match your search criteria.' : 'Inventory changes will appear here as they happen.'"
              :show-create-button="false" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img v-if="data.raw_material?.image_url" :src="data.raw_material.image_url"
                      :alt="data.raw_material?.name" class="h-10 w-10 rounded-md object-cover">
                    <div v-else
                      class="h-10 w-10 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-md">
                      <i class="fas fa-cube text-gray-400"></i>
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ data.raw_material?.name || 'N/A' }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ data.raw_material?.measurement_unit?.symbol || '-' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.warehouse?.name || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                <span :class="{
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize':
                    true,
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': data.action ===
                    'create',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': data
                    .action === 'update',
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': data.action ===
                    'delete',
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': data
                    .action === 'consume'
                }">
                  {{ data.action || '-' }}
                </span>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium">{{ formatQuantity(data.old_qty) }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  {{ data.raw_material?.measurement_unit?.symbol || '' }}
                </span>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium">{{ formatQuantity(data.new_qty) }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  {{ data.raw_material?.measurement_unit?.symbol || '' }}
                </span>
                <span v-if="data.change_qty" class="ml-2 text-xs">
                  <span :class="{
                    'text-green-600 dark:text-green-400': data.change_qty > 0,
                    'text-red-600 dark:text-red-400': data.change_qty < 0,
                    'text-gray-500 dark:text-gray-400': data.change_qty === 0
                  }">
                    ({{ data.change_qty > 0 ? '+' : '' }}{{ formatQuantity(data.change_qty) }})
                  </span>
                </span>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDateTime(data.usage_date) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 text-right text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">
                  <button @click="viewLog(data)" v-permission="['raw_material_inventory.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['raw_material_inventory.update', 'raw_material_inventory.delete']">
                    <button @click="data.showDropdown = !data.showDropdown"
                      class="p-1.5 rounded-md bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      title="Actions">
                      <i class="fas fa-ellipsis-v text-gray-600 dark:text-gray-200"></i>
                    </button>

                    <div v-if="data.showDropdown" class="absolute right-0 z-[100] w-44 mt-2
                                            origin-top-right rounded-md shadow-xl
                                            bg-white dark:bg-gray-800
                                            ring-1 ring-black ring-opacity-5
                                            divide-y divide-gray-100 dark:divide-gray-700
                                            focus:outline-none">

                      <div class="py-1">
                        <button @click="editLog(data); data.showDropdown = false"
                          v-permission="['raw_material_inventory.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['raw_material_inventory.delete']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                          <i class="fas fa-trash"></i>
                          Delete
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

    <div v-if="logStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="logStore.totalItems > 0" :total-items="logStore.totalItems" :per-page="logStore.perPage"
        :current-page="logStore.currentPage" :last-page="logStore.lastPage" :is-loading="logStore.isLoading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Edit Log Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen" title="Update Log & Recalculate Stock" maxWidth="2xl"
    @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-2 py-3">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Material Info -->
        <div class="col-span-1 lg:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-2">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 h-12 w-12">
              <img v-if="currentLog?.raw_material?.image_url" :src="currentLog.raw_material.image_url"
                :alt="currentLog.raw_material?.name" class="h-12 w-12 rounded-md object-cover">
              <div v-else class="h-12 w-12 bg-gray-200 dark:bg-gray-600 flex items-center justify-center rounded-md">
                <i class="fas fa-cube text-gray-400"></i>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ currentLog?.raw_material?.name || 'N/A' }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ currentLog?.warehouse?.name || 'N/A' }} | Action: {{ currentLog?.action }}
              </p>
            </div>
          </div>
        </div>

        <!-- Old Quantity (readonly) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Old Quantity</label>
          <input type="number" step="0.01" disabled :value="formData.old_qty"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
          <span class="text-xs text-gray-400">{{ currentLog?.raw_material?.measurement_unit?.symbol || '' }}</span>
        </div>

        <!-- New Quantity -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Quantity <span
              class="text-xs text-red-500">*</span></label>
          <div class="relative">
            <input v-model="formData.new_qty" type="number" step="0.01" min="0" placeholder="Enter new quantity"
              @change="clearValidationError('new_qty')"
              class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': logStore.validationErrors.new_qty }">
            <span v-if="currentLog?.raw_material?.measurement_unit?.symbol"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
              {{ currentLog.raw_material.measurement_unit.symbol }}
            </span>
          </div>
          <p v-if="logStore.validationErrors.new_qty" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ logStore.validationErrors.new_qty[0] }}
          </p>
        </div>

        <!-- Note -->
        <div class="col-span-1 lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
          <textarea v-model="formData.note" rows="2" placeholder="Enter correction note..."
            @change="clearValidationError('note')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': logStore.validationErrors.note }"></textarea>
          <p v-if="logStore.validationErrors.note" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ logStore.validationErrors.note[0] }}
          </p>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end space-x-3 col-span-1 lg:col-span-2">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="logStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            logStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="logStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Updating...
            </span>
            <span v-else>Update & Recalculate</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingLog" :show="showViewModal" maxWidth="xl" title="Inventory Log Details"
    @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="text-center mb-6">
        <div v-if="viewingLog.raw_material?.image_url" class="mb-4">
          <img :src="viewingLog.raw_material.image_url" :alt="viewingLog.raw_material?.name"
            class="h-24 w-24 rounded-lg mx-auto object-cover">
        </div>
        <div v-else
          class="h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-cube text-gray-400 text-3xl"></i>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ viewingLog.raw_material?.name || 'N/A' }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ viewingLog.warehouse?.name || 'N/A' }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</label>
          <div class="mt-1">
            <span :class="{
              'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize': true,
              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': viewingLog.action ===
                'create',
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': viewingLog
                .action === 'update',
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': viewingLog.action ===
                'delete',
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': viewingLog
                .action === 'restore'
            }">
              {{ viewingLog.action || '-' }}
            </span>
          </div>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Change Quantity</label>
          <div class="mt-1">
            <span :class="{
              'text-green-600 dark:text-green-400': viewingLog.change_qty > 0,
              'text-red-600 dark:text-red-400': viewingLog.change_qty < 0,
              'text-gray-500 dark:text-gray-400': viewingLog.change_qty === 0
            }" class="text-sm font-semibold">
              {{ viewingLog.change_qty > 0 ? '+' : '' }}{{ formatQuantity(viewingLog.change_qty) }}
              <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">
                {{ viewingLog.raw_material?.measurement_unit?.symbol || '' }}
              </span>
            </span>
          </div>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Old Quantity</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">
            {{ formatQuantity(viewingLog.old_qty) }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {{ viewingLog.raw_material?.measurement_unit?.symbol || '' }}
            </span>
          </p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">New Quantity</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">
            {{ formatQuantity(viewingLog.new_qty) }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {{ viewingLog.raw_material?.measurement_unit?.symbol || '' }}
            </span>
          </p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Raw Material</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingLog.raw_material?.name || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Warehouse</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingLog.warehouse?.name || 'N/A' }}</p>
        </div>
        <div class="col-span-2">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Note</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingLog.note || '-' }}</p>
        </div>
        <div class="col-span-2">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usage Date</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDateTime(viewingLog.usage_date) }}</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeViewModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Close
      </button>
      <button v-if="viewingLog.action !== 'delete'" @click="editLog(viewingLog)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Log
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Log & Recalculate Stock" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Log Record</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this log record for <strong>{{
            deletingLog?.raw_material?.name }}</strong>
          at <strong>{{ deletingLog?.warehouse?.name }}</strong>?
          <br><br>
          <span class="text-red-600 dark:text-red-400 font-medium">Warning:</span> This will recalculate the stock
          to the previous quantity.
        </p>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            <span class="font-medium">Action:</span> {{ deletingLog?.action }}
            <br>
            <span class="font-medium">Quantity Change:</span>
            {{ deletingLog?.change_qty > 0 ? '+' : '' }}{{ formatQuantity(deletingLog?.change_qty) }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {{ deletingLog?.raw_material?.measurement_unit?.symbol || '' }}
            </span>
            <br>
            <span class="font-medium">Old:</span> {{ formatQuantity(deletingLog?.old_qty) }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {{ deletingLog?.raw_material?.measurement_unit?.symbol || '' }}
            </span>
            → <span class="font-medium">New:</span> {{ formatQuantity(deletingLog?.new_qty) }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {{ deletingLog?.raw_material?.measurement_unit?.symbol || '' }}
            </span>
          </p>
        </div>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="logStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          logStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="logStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete & Recalculate</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRawMaterialInventoryLogStore } from '@/stores/rawMaterialInventoryLogStore';
import { useRawMaterialStore } from '@/stores/rawMaterialStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import axiosClient from '@/axiosClient';

const refresh = ref(false);

const tableColumns = ref([
  {
    "key": "raw_material.name",
    "label": "Material",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "warehouse.name",
    "label": "Warehouse",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "action",
    "label": "Action",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "old_qty",
    "label": "Old Qty",
    "sortable": true,
    "type": "number"
  },
  {
    "key": "new_qty",
    "label": "New Qty",
    "sortable": true,
    "type": "number"
  },
  {
    "key": "usage_date",
    "label": "Usage Date",
    "sortable": true,
    "type": "date"
  }
]);

const actionOptions = [
  { id: '', name: 'All Actions' },
  { id: 'create', name: 'Create' },
  { id: 'update', name: 'Update' },
  { id: 'delete', name: 'Delete' },
  { id: 'consume', name: 'Consume' }
];

// Initialize stores
const logStore = useRawMaterialInventoryLogStore();
const rawMaterialStore = useRawMaterialStore();
const warehouseStore = useWarehouseStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search and filters - using store's built-in state
const searchQuery = computed({
  get: () => logStore.searchQuery,
  set: (value) => { logStore.searchQuery = value; }
});

const filters = computed({
  get: () => logStore.filters,
  set: (value) => { logStore.filters = value; }
});

// Form data
const formData = ref({
  old_qty: 0,
  new_qty: 0,
  note: ''
});

const currentLog = ref(null);
const viewingLog = ref(null);
const deletingLog = ref(null);
const modalMode = ref('edit');

const loadingDropdowns = ref(false);

const displayedItems = computed(() => {
  return logStore.items || [];
});

const rawMaterials = computed(() => {
  return rawMaterialStore.items || [];
});

const warehouses = computed(() => {
  return warehouseStore.items || [];
});

const calculateRowNumber = (index) => {
  if (logStore.pagination?.from && logStore.pagination.from > 0) {
    return logStore.pagination.from + index;
  }
  return (logStore.pagination.current_page - 1) * logStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (logStore.validationErrors[fieldName]) {
    const updatedErrors = { ...logStore.validationErrors };
    delete updatedErrors[fieldName];
    logStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  logStore.validationErrors = {};
};

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '') || searchQuery.value !== '';
});

const handleSearch = () => {
  // Use store's search method which handles debounce internally
  logStore.search(searchQuery.value);
};

const applyFilters = async () => {
  // Use store's filter method which merges with existing filters
  const filterParams = {};

  if (filters.value.warehouse_id) filterParams.warehouse_id = filters.value.warehouse_id;
  if (filters.value.raw_material_id) filterParams.raw_material_id = filters.value.raw_material_id;
  if (filters.value.action) filterParams.action = filters.value.action;
  if (filters.value.from_date) filterParams.from_date = filters.value.from_date;
  if (filters.value.to_date) filterParams.to_date = filters.value.to_date;

  await logStore.filter(filterParams);
};

const removeFilter = async (filterKey) => {
  // Create a copy of filters, remove the key, and apply
  const newFilters = { ...filters.value };
  delete newFilters[filterKey];
  filters.value = newFilters;
  await logStore.filter(newFilters);
};

// Remove all filters - uses store's clearFilters method
const removeAllFilters = async () => {
  refresh.value = true;
  try {
    // Reset all filter values
    filters.value = {};
    searchQuery.value = '';

    // Use store's clearFilters method which resets everything and fetches fresh data
    await logStore.clearFilters();
  } finally {
    refresh.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  logStore.search('');
};

// Get names for filter badges
const getRawMaterialName = (id) => {
  if (!id) return '';
  const material = rawMaterials.value.find(item => item.id === id);
  return material?.name || id;
};

const getWarehouseName = (id) => {
  if (!id) return '';
  const warehouse = warehouses.value.find(item => item.id === id);
  return warehouse?.name || id;
};

const getActionLabel = (value) => {
  const action = actionOptions.find(item => item.id === value);
  return action?.name || value;
};

onMounted(async () => {
  await getData();
  await loadRelatedData();
});

const getData = async () => {
  await logStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    await logStore.clearFilters();
  } finally {
    refresh.value = false;
  }
};

const loadRelatedData = async () => {
  try {
    loadingDropdowns.value = true;
    await rawMaterialStore.getAll();
    await warehouseStore.getAll();
  } catch (error) {
    console.error('Error loading related data:', error);
  } finally {
    loadingDropdowns.value = false;
  }
};

// Modal functions
const editLog = async (log) => {
  if (rawMaterials.value.length === 0 || warehouses.value.length === 0) {
    await loadRelatedData();
  }

  currentLog.value = log;
  modalMode.value = 'edit';

  formData.value = {
    old_qty: log.old_qty || 0,
    new_qty: log.new_qty || 0,
    note: log.note || ''
  };

  isModalOpen.value = true;
  clearAllValidationErrors();
};

const viewLog = (log) => {
  viewingLog.value = log;
  showViewModal.value = true;
};

const confirmDelete = (log) => {
  deletingLog.value = log;
  showDeleteModal.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  resetForm();
  clearAllValidationErrors();
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingLog.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingLog.value = null;
};

const resetForm = () => {
  formData.value = {
    old_qty: 0,
    new_qty: 0,
    note: ''
  };
  currentLog.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  if (!currentLog.value || !currentLog.value.id) {
    console.error('No log selected for update.');
    return;
  }

  const formDataToSend = new FormData();
  formDataToSend.append('old_qty', formData.value.old_qty || 0);
  formDataToSend.append('new_qty', formData.value.new_qty || 0);
  formDataToSend.append('note', formData.value.note || '');

  const result = await logStore.update(currentLog.value.id, formDataToSend);
  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingLog.value) {
    const result = await logStore.deleteItem(deletingLog.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await logStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await logStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = logStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await logStore.sort(column, order);
};

// Helper functions
const formatQuantity = (qty) => {
  if (qty === null || qty === undefined) return '0';
  return parseFloat(qty).toFixed(2);
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
};

const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  // Gets time in 12-hour format with AM/PM (e.g., "6:00:00 AM")
  const time = d.toLocaleTimeString('en-US');

  return `${day}-${month}-${year}`;
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}
</style>