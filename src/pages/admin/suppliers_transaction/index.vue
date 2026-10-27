<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Supplier
          Transactions</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['supplier-transactions.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <!-- Right Side: Filters and Search -->
      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <!-- Supplier Filter -->
        <div class="w-[200px]">
          <SearchSelect v-model="filters.supplier_id" :options="supplierStore?.items" placeholder="All Supplier"
            @change="applyFilters()" />
        </div>

        <!-- Work Order Filter -->
        <div class="w-[200px]">
          <SearchSelect v-model="filters.work_order_id" :options="workOrderStore?.items" :label-key="'reference_no'"
            placeholder="All Work Order" @change="applyFilters()" />
        </div>

        <!-- Transaction Type Filter -->
        <div>
          <select v-model="filters.transaction_type" @change="applyFilters()"
            class="w-[200px] bg-white pl-4 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white">
            <option value="">All Transaction Types</option>
            <option value="purchase">Due</option>
            <option value="return">Return</option>
            <option value="payment">Payment</option>
          </select>
        </div>

        <!-- Date From -->
        <div>
          <input v-model="filters.date_from" type="date" @change="applyFilters()"
            class="w-[200px] pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            placeholder="Date From" />
          <span class="ml-2 text-gray-500 dark:text-gray-400">To</span>
        </div>

        <!-- Date To -->
        <div>
          <input v-model="filters.date_to" type="date" @change="applyFilters()"
            class="w-[200px] pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            placeholder="Date To" />
        </div>

        <!-- Search Input -->
        <div class="relative flex-1 min-w-0 max-w-md">
          <input v-model="searchQuery" @input="handleSearch" type="search"
            placeholder="Search by reference no, supplier or work order..."
            class="w-[200px] pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <i class="fas fa-search text-base"></i>
          </div>
        </div>

        <!-- Refresh Button -->
        <div
          class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg px-1.5 py-1.5 flex-shrink-0">
          <button @click="resetFilters" title="Refresh Data"
            class="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            :disabled="refresh">
            <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': refresh }"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 mb-4">
      <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Filters:</span>
      <span v-if="filters.supplier_id"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
        Supplier: {{ getSupplierName(filters.supplier_id) }}
        <button @click="removeFilter('supplier_id')" class="ml-1 hover:text-blue-600 dark:hover:text-blue-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
      <span v-if="filters.work_order_id"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
        Work Order: {{ getWorkOrderReference(filters.work_order_id) }}
        <button @click="removeFilter('work_order_id')" class="ml-1 hover:text-green-600 dark:hover:text-green-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
      <span v-if="filters.transaction_type"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
        Type: {{ filters.transaction_type }}
        <button @click="removeFilter('transaction_type')" class="ml-1 hover:text-purple-600 dark:hover:text-purple-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
      <span v-if="filters.date_from"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
        From: {{ formatDate(filters.date_from) }}
        <button @click="removeFilter('date_from')" class="ml-1 hover:text-yellow-600 dark:hover:text-yellow-200">
          <i class="fas fa-times"></i>
        </button>
      </span>
      <span v-if="filters.date_to"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
        To: {{ formatDate(filters.date_to) }}
        <button @click="removeFilter('date_to')" class="ml-1 hover:text-yellow-600 dark:hover:text-yellow-200">
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
      <div class="overflow-visible">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="supplierTransStore.sortBy"
            :sort-direction="supplierTransStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="supplierTransStore.loading" :is-loading="true"
            :total-items="supplierTransStore.totalItems" :item-name="'transactions'"
            loading-text="Loading transactions..." loading-subtext="Fetching your transaction data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="supplierTransStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'transactions'" empty-icon="fas fa-exchange-alt"
              empty-title="No transactions found"
              :empty-message="searchQuery ? 'No transactions match your search criteria.' : 'Get started by creating your first transaction.'"
              :show-create-button="false" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.transaction_id || '-' }}
              </td>
              <td class="px-6 py-3">
                <div class="flex items-center space-x-3">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ data.supplier?.name || '-' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ formatDate(data.transaction_date) || '-' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                <span :class="[
                  data.transaction_type === 'due'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : data.transaction_type === 'return'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : data.transaction_type === 'payment'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                  'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize'
                ]">
                  {{ data.transaction_type || '-' }}
                </span>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    #{{ data.reference_no }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                    {{ data.work_order?.subject || '-' }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(data.created_at, true) }}
              </td>
              <td
                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-start font-medium">
                {{ formatCurrency(data.amount) }}
              </td>
              <td class="px-6 py-3 text-start text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">
                  <button @click="viewItem(data)" v-permission="['supplier-transactions.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['supplier-transactions.update', 'supplier-transactions.delete']">
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
                        <button v-if="data.transaction_type !== 'opening_balance'"
                          @click="editItem(data); data.showDropdown = false"
                          v-permission="['supplier-transactions.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>
                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['supplier-transactions.delete']"
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

    <div v-if="supplierTransStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="supplierTransStore.totalItems > 0" :total-items="supplierTransStore.totalItems"
        :per-page="supplierTransStore.perPage" :current-page="supplierTransStore.currentPage"
        :last-page="supplierTransStore.lastPage" :is-loading="supplierTransStore.isLoading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Supplier Transaction' : 'Edit Supplier Transaction'" maxWidth="3xl"
    @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-2 gap-4">
        <!-- Supplier -->
        <div>
          <SearchSelect v-model="formData.supplier_id" :options="supplierStore?.items" :label="'Supplier'"
            placeholder="--Select Supplier--" :error="supplierTransStore.validationErrors?.supplier_id" required
            @change="clearValidationError('supplier_id')" />
        </div>

        <!-- Transaction Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Date <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.transaction_date" type="date" @change="clearValidationError('transaction_date')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': supplierTransStore.validationErrors.transaction_date }">
          <p v-if="supplierTransStore.validationErrors.transaction_date"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ supplierTransStore.validationErrors.transaction_date[0] }}
          </p>
        </div>

        <!-- Transaction Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <select v-model="formData.transaction_type" @change="clearValidationError('transaction_type')"
            class="w-full bg-white pl-4 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': supplierTransStore.validationErrors.transaction_type }">
            <option value="">--Select Transaction Type--</option>
            <option value="due">Due</option>
            <option value="return">Return</option>
            <option value="payment">Payment</option>
            <!-- <option value="opening_balance">Opening Balance</option> -->
          </select>
          <p v-if="supplierTransStore.validationErrors.transaction_type"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ supplierTransStore.validationErrors.transaction_type[0] }}
          </p>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.amount" type="number" step="0.01" placeholder="0.00"
            @change="clearValidationError('amount')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': supplierTransStore.validationErrors.amount }">
          <p v-if="supplierTransStore.validationErrors.amount" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ supplierTransStore.validationErrors.amount[0] }}
          </p>
        </div>

        <!-- Reference No -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference No <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.reference_no" type="text" placeholder="Enter reference number"
            @change="clearValidationError('reference_no')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': supplierTransStore.validationErrors.reference_no }">
          <p v-if="supplierTransStore.validationErrors.reference_no"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ supplierTransStore.validationErrors.reference_no[0] }}
          </p>
        </div>

        <!-- Work Order -->
        <div>
          <SearchSelect v-model="formData.work_order_id" :options="workOrderStore?.items" :label-key="'reference_no'"
            :label="'Work Order'" placeholder="--Select Work Order--"
            :error="supplierTransStore.validationErrors?.work_order_id" required
            @change="clearValidationError('work_order_id')" />
        </div>

        <!-- Note -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
          <textarea v-model="formData.note" rows="2" placeholder="Enter notes" @change="clearValidationError('note')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': supplierTransStore.validationErrors.note }"></textarea>
          <p v-if="supplierTransStore.validationErrors.note" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ supplierTransStore.validationErrors.note[0] }}
          </p>
        </div>

        <!-- Global Form Errors -->
        <div v-if="Object.keys(supplierTransStore.validationErrors).length > 0"
          class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg col-span-1 md:col-span-2">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in supplierTransStore.validationErrors" :key="field">
              • {{ errors[0] }}
            </li>
          </ul>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end space-x-3 col-span-1 md:col-span-2">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="supplierTransStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            supplierTransStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="supplierTransStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>{{ modalMode === 'create' ? 'Create Transaction' : 'Update Transaction' }}</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Supplier Transaction Details"
    @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="col-span-2 flex flex-col items-center mb-4">
          <div class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <i class="fas fa-exchange-alt text-gray-400 text-2xl"></i>
          </div>
          <h2 class="text-md font-bold text-gray-900 dark:text-white mt-2">Transaction ID: {{ viewingItem.transaction_id
          }}</h2>
          <p v-if="viewingItem.reference_no" class="text-gray-600 dark:text-gray-400">Reference: {{
            viewingItem.reference_no }}</p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{ viewingItem.supplier?.name || '-' }}
          </p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transaction Date</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.transaction_date || '-' }}</p>
        </div>


        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transaction Type</label>
          <div class="mt-1">
            <span :class="[
              viewingItem.transaction_type === 'due'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                : viewingItem.transaction_type === 'return'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  : viewingItem.transaction_type === 'payment'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
              'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize'
            ]">
              {{ viewingItem.transaction_type }}
            </span>
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1 font-semibold">{{ formatCurrency(viewingItem.amount) }}
          </p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference No</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1 font-mono">{{ viewingItem.reference_no || '-' }}</p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Work Order</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1"> {{
            viewingItem.work_order?.subject || '-' }}</p>
        </div>

        <div class="col-span-2">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Note</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.note || '-' }}</p>
        </div>

        <div class="col-span-2">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1"> {{ formatDate(viewingItem.created_at, true) }}</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeViewModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Close
      </button>
      <button v-permission="['supplier-transactions.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Transaction
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Transaction" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Transaction</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete transaction <strong>#{{ deletingItem?.id }} - {{ deletingItem?.reference_no
          }}</strong>? This action cannot be undone.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="supplierTransStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          supplierTransStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="supplierTransStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Transaction</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSupplierStore } from '@/stores/supplierStore';
import { useSupplierTransStore } from '@/stores/supplierTransStore';
import { useWorkOrderStore } from '@/stores/workOrderStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';

const refresh = ref(false);

const tableColumns = ref([
  {
    "key": "transaction_id",
    "label": "Transaction ID",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "supplier.name",
    "label": "Supplier",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "transaction_date",
    "label": "Transaction Date",
    "sortable": true,
    "type": "date"
  },
  {
    "key": "transaction_type",
    "label": "Type",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "reference_no",
    "label": "Reference No",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "created_at",
    "label": "Created Date",
    "sortable": true,
    "type": "date"
  },
  {
    "key": "amount",
    "label": "Amount",
    "sortable": true,
    "type": "number",
    "align": "center"
  },
]);

// Initialize stores
const supplierStore = useSupplierStore();
const supplierTransStore = useSupplierTransStore();
const workOrderStore = useWorkOrderStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

// Filter state - matches backend parameters
const filters = ref({
  supplier_id: '',
  work_order_id: '',
  transaction_type: '',
  date_from: '',
  date_to: ''
});

// Form data
const formData = ref({
  supplier_id: '',
  transaction_date: '',
  transaction_type: '',
  amount: '',
  reference_no: '',
  work_order_id: '',
  note: ''
});

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '') || searchQuery.value !== '';
});

// Apply all filters
const applyFilters = async () => {
  // Build filter parameters - only include non-empty values
  const params = {};

  if (filters.value.supplier_id) params.supplier_id = filters.value.supplier_id;
  if (filters.value.work_order_id) params.work_order_id = filters.value.work_order_id;
  if (filters.value.transaction_type) params.transaction_type = filters.value.transaction_type;
  if (filters.value.date_from) params.date_from = filters.value.date_from;
  if (filters.value.date_to) params.date_to = filters.value.date_to;
  if (searchQuery.value) params.search = searchQuery.value;

  await supplierTransStore.get(params);
};

// Reset all filters
const resetFilters = async () => {
  // Reset all filter values
  filters.value = {
    supplier_id: '',
    work_order_id: '',
    transaction_type: '',
    date_from: '',
    date_to: ''
  };

  // Clear search
  searchQuery.value = '';

  // Clear any timeouts
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }

  // Fetch data without any filters
  await supplierTransStore.get();
};

// Remove individual filter
const removeFilter = (filterKey) => {
  filters.value[filterKey] = '';
  applyFilters();
};

// Get supplier name from ID
const getSupplierName = (id) => {
  if (!id) return '';
  const supplier = supplierStore?.items?.find(item => item.id === id);
  return supplier?.name || id;
};

// Get work order reference from ID
const getWorkOrderReference = (id) => {
  if (!id) return '';
  const workOrder = workOrderStore?.items?.find(item => item.id === id);
  return workOrder?.reference_no || id;
};

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return supplierTransStore.items || [];
});

const calculateRowNumber = (index) => {
  if (supplierTransStore.pagination?.from && supplierTransStore.pagination.from > 0) {
    return supplierTransStore.pagination.from + index;
  }
  return (supplierTransStore.pagination.current_page - 1) * supplierTransStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (supplierTransStore.validationErrors[fieldName]) {
    const updatedErrors = { ...supplierTransStore.validationErrors };
    delete updatedErrors[fieldName];
    supplierTransStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  supplierTransStore.validationErrors = {};
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0.00';
  return parseFloat(value).toFixed(2);
};

const formatDate = (date, full = false) => {
  if (!date) return '-';

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  const time = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;

  return full
    ? `${day}-${month}-${year} ${time}`
    : `${day}-${month}-${year}`;
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    applyFilters();
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
  applyFilters();
};

// Watch search query
watch(searchQuery, (newValue) => {
  if (newValue === '') {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
    applyFilters();
  } else {
    handleSearch();
  }
  clearAllValidationErrors();
});

// Watch filters for changes
watch(filters, () => {
  // This will trigger when individual filter values change via v-model
}, { deep: true });

onMounted(async () => {
  // Load initial data
  await getData();

  // Load dropdown options
  await Promise.all([
    supplierStore.getAll(),
    workOrderStore.getAll()
  ]);
});

const getData = async () => {
  await supplierTransStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    await resetFilters();
  } finally {
    refresh.value = false;
  }
};

// Modal functions
const openCreateModal = () => {
  resetForm();
  modalMode.value = 'create';
  isModalOpen.value = true;
  clearAllValidationErrors();
};

const editItem = (item) => {
  currentItem.value = item;
  modalMode.value = 'edit';

  formData.value = {
    supplier_id: item.supplier_id || '',
    transaction_date: item.transaction_date || '',
    transaction_type: item.transaction_type || '',
    amount: item.amount || '',
    reference_no: item.reference_no || '',
    work_order_id: item.work_order_id || '',
    note: item.note || ''
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
    supplier_id: '',
    transaction_date: '',
    transaction_type: '',
    amount: '',
    reference_no: '',
    work_order_id: '',
    note: ''
  };
  currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

  for (const key in formData.value) {
    const value = formData.value[key];
    if (value === null || value === undefined || value === '') {
      continue;
    }
    formDataToSend.append(key, value);
  }

  let result;
  if (modalMode.value === 'create') {
    result = await supplierTransStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await supplierTransStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await supplierTransStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await supplierTransStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await supplierTransStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = supplierTransStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await supplierTransStore.sort(column, order);
};
</script>
<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>