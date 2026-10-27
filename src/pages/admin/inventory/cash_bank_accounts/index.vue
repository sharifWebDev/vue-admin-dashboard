<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Payment Methods
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
        <button @click="openCreateModal" v-permission="['payment_methods.create']"
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
      <div class="overflow-visible">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="cashBankAccountStore.sortBy"
            :sort-direction="cashBankAccountStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State - Inside table body -->
          <TableLoadingState v-if="cashBankAccountStore.loading" :is-loading="true"
            :total-items="cashBankAccountStore.totalItems" :item-name="'bankAccounts'"
            loading-text="Loading bankAccounts..." loading-subtext="Fetching your bankAccount data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="cashBankAccountStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'bankAccounts'" empty-icon="fas fa-users"
              empty-title="No bankAccounts found"
              :empty-message="searchQuery ? 'No bankAccounts match your search criteria.' : 'Get started by creating your first bankAccount.'"
              :show-create-button="false" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <p class="text-sm text-gray-600 dark:text-white mt-1">{{ data.account_name || 'N/A' }}<br></p>
                <p v-if="data.acc_number" class="text-sm mutated small text-gray-500 dark:text-white mt-1">No. {{
                  data.acc_number || '' }}</p>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.account_type ? formatAccountType(data.account_type) : 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                <p class="text-sm text-gray-600 dark:text-white mt-1">
                  <template v-if="data.account_type === 'mobile_banking'">
                    {{ getServiceProvider(data) || 'N/A' }}
                  </template>
                  <template v-else>
                    {{ getBankName(data) || 'N/A' }}
                  </template>
                </p>
                <p v-if="getBranch(data)" class="text-sm text-gray-500 mutated dark:text-white mt-1">
                  <template v-if="data.account_type === 'mobile_banking'">
                    Wallet: {{ getWalletNumber(data) || '' }}
                  </template>
                  <template v-else>
                    Branch: {{ getBranch(data) || '' }}
                  </template>
                </p>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ formatCurrency(data.opening_balance) || 'N/A' }}
              </td>
              <td class="px-6 py-3 text-right text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">
                  <button @click="viewItem(data)" v-permission="['payment_methods.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['payment_methods.update', 'payment_methods.delete']">
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
                        <button @click="editItem(data); data.showDropdown = false"
                          v-permission="['payment_methods.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['payment_methods.delete']"
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

    <div v-if="cashBankAccountStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="cashBankAccountStore.totalItems > 0" :total-items="cashBankAccountStore.totalItems"
        :per-page="cashBankAccountStore.perPage" :current-page="cashBankAccountStore.currentPage"
        :last-page="cashBankAccountStore.lastPage" :is-loading="cashBankAccountStore.isLoading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Payment Methods' : 'Edit Payment Methods'" maxWidth="4xl"
    @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-3 gap-4">

        <!-- Account Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.account_name" type="text" placeholder="Enter Account Name"
            @change="clearValidationError('account_name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': cashBankAccountStore.validationErrors.account_name }">
          <p v-if="cashBankAccountStore.validationErrors.account_name"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ cashBankAccountStore.validationErrors.account_name[0] }}
          </p>
        </div>

        <!-- Account Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number
            <span class="text-xs text-red-500 dark:text-red-500"> *</span>
          </label>
          <input v-model="formData.acc_number" type="text" placeholder="Enter Account Number"
            @change="clearValidationError('acc_number')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': cashBankAccountStore.validationErrors.acc_number }">
          <p v-if="cashBankAccountStore.validationErrors.acc_number"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ cashBankAccountStore.validationErrors.acc_number[0] }}
          </p>
        </div>

        <!-- Account Type -->
        <div>
          <SearchSelect v-model="formData.account_type" :options="[
            { id: 'bank', name: 'Bank Account' },
            { id: 'mobile_banking', name: 'Mobile Banking' },
            { id: 'cash', name: 'Cash' }
          ]" label="Account Type" placeholder="--Select Account Type--"
            :error="cashBankAccountStore.validationErrors?.account_type" required @change="handleAccountTypeChange" />
        </div>

        <!-- Bank Name (Text Input) -->
        <div v-if="showBankFields && formData.account_type === 'bank'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name
            <span class="text-xs text-red-500 dark:text-red-500"> *</span>
          </label>
          <input v-model="formData.bank_name" type="text" placeholder="Enter Bank Name"
            @change="clearValidationError('bank_name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': cashBankAccountStore.validationErrors.bank_name }">
          <p v-if="cashBankAccountStore.validationErrors.bank_name" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ cashBankAccountStore.validationErrors.bank_name[0] }}
          </p>
        </div>

        <!-- Service Provider (for Mobile Banking) -->
        <div v-if="formData.account_type === 'mobile_banking'">
          <!-- <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Provider <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label> -->
          <SearchSelect v-model="formData.service_provider" :options="[
            { id: 'Bkash', name: 'Bkash' },
            { id: 'Nagad', name: 'Nagad' },
            { id: 'Rocket', name: 'Rocket' },
            { id: 'Upay', name: 'Upay' },
            { id: 'Tap', name: 'Tap' },
            { id: 'OK Wallet', name: 'OK Wallet' }
          ]" label="Service Provider" placeholder="--Select Service Provider--"
            :error="cashBankAccountStore.validationErrors?.service_provider" required
            @change="clearValidationError('service_provider')" />
          <p v-if="cashBankAccountStore.validationErrors.service_provider"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ cashBankAccountStore.validationErrors.service_provider[0] }}
          </p>
        </div>

        <!-- Wallet Number (for Mobile Banking) -->
        <div v-if="formData.account_type === 'mobile_banking'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wallet Number <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.wallet_number" type="text" placeholder="Enter Wallet Number (e.g., 01712345678)"
            @change="clearValidationError('wallet_number')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': cashBankAccountStore.validationErrors.wallet_number }">
          <p v-if="cashBankAccountStore.validationErrors.wallet_number"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ cashBankAccountStore.validationErrors.wallet_number[0] }}
          </p>
        </div>

        <!-- Branch -->
        <div v-if="showBankFields && formData.account_type === 'bank'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch/Location</label>
          <input v-model="formData.branch" type="text" placeholder="Enter Branch or Location"
            @change="clearValidationError('branch')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': cashBankAccountStore.validationErrors.branch }">
          <p v-if="cashBankAccountStore.validationErrors.branch" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ cashBankAccountStore.validationErrors.branch[0] }}
          </p>
        </div>

        <!-- Routing Number -->
        <div v-if="formData.account_type === 'bank'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Routing Number</label>
          <input v-model="formData.routing_number" type="text" placeholder="Enter Routing Number"
            @change="clearValidationError('routing_number')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': cashBankAccountStore.validationErrors.routing_number }">
          <p v-if="cashBankAccountStore.validationErrors.routing_number"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ cashBankAccountStore.validationErrors.routing_number[0] }}
          </p>
        </div>

        <!-- Opening Balance -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Balance <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.opening_balance" type="number" step="0.01" placeholder="Enter Opening Balance"
            @change="clearValidationError('opening_balance')" @input="handleAmountInput"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': cashBankAccountStore.validationErrors.opening_balance }">
          <p v-if="cashBankAccountStore.validationErrors.opening_balance"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ cashBankAccountStore.validationErrors.opening_balance[0] }}
          </p>
        </div>

        <!-- Opening Balance Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Balance Date</label>
          <input v-model="formData.opening_balance_date" type="date"
            @change="clearValidationError('opening_balance_date')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': cashBankAccountStore.validationErrors.opening_balance_date }">
          <p v-if="cashBankAccountStore.validationErrors.opening_balance_date"
            class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ cashBankAccountStore.validationErrors.opening_balance_date[0] }}
          </p>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end space-x-3 col-span-1 md:col-span-2 2xl:col-span-3">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="cashBankAccountStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            cashBankAccountStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="cashBankAccountStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>{{ modalMode === 'create' ? 'Create Payment Methods' : 'Update Payment Methods' }}</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Payment Methods Details"
    @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Account Name</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.account_name || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Account Type</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatAccountType(viewingItem.account_type) ||
              'N/A' }}</p>
          </div>
          <div v-if="viewingItem.account_type !== 'cash'">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Account Number</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.acc_number || 'N/A' }}</p>
          </div>

          <!-- Mobile Banking Fields -->
          <div v-if="viewingItem.account_type === 'mobile_banking'">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Service Provider</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ getServiceProvider(viewingItem) || 'N/A' }}</p>
          </div>
          <div v-if="viewingItem.account_type === 'mobile_banking'">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wallet Number</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ getWalletNumber(viewingItem) || 'N/A' }}</p>
          </div>

          <!-- Bank Fields -->
          <div v-if="viewingItem.account_type === 'bank'">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bank Name</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ getBankName(viewingItem) || 'N/A' }}</p>
          </div>
          <div v-if="viewingItem.account_type === 'bank'">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Branch</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ getBranch(viewingItem) || 'N/A' }}</p>
          </div>
          <div v-if="viewingItem.account_type === 'bank'">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Routing Number</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ getRoutingNumber(viewingItem) || 'N/A' }}</p>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Opening Balance</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatCurrency(viewingItem.opening_balance) ||
              'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Opening Balance Date</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDate(viewingItem.opening_balance_date) ||
              'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDateTime(viewingItem.created_at) || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated At</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDateTime(viewingItem.updated_at) || 'N/A' }}
            </p>
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
      <button @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Payment Methods
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Payment Methods" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Payment Methods</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{{ deletingItem?.account_name || 'this item' }}</strong>? This action
          cannot be undone.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="cashBankAccountStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          cashBankAccountStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="cashBankAccountStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Payment Methods</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCashBankAccountStore } from '@/stores/cashBankAccountStore.js';
import { useCompanyStore } from '@/stores/companyStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';

const refresh = ref(false);

const tableColumns = ref([
  {
    "key": "account_name",
    "label": "Account Name",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "account_type",
    "label": "Account Type",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "bank_name",
    "label": "Bank/Provider",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "opening_balance",
    "label": "Opening Balance",
    "sortable": true,
    "type": "decimal"
  }
]);

// Initialize stores
const cashBankAccountStore = useCashBankAccountStore();
const companyStore = useCompanyStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

// Form data
const formData = ref({
  'account_type': '',
  'account_name': '',
  'acc_number': '',
  'bank_name': '',
  'branch': '',
  'routing_number': '',
  'service_provider': '',
  'wallet_number': '',
  'opening_balance': '',
  'opening_balance_date': ''
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return cashBankAccountStore.items || [];
});

const showBankFields = computed(() => {
  return formData.value.account_type === 'bank' || formData.value.account_type === 'mobile_banking';
});

// Helper functions to access nested details
const getBankName = (item) => {
  return item?.details?.bank_name || null;
};

const getBranch = (item) => {
  return item?.details?.branch || null;
};

const getRoutingNumber = (item) => {
  return item?.details?.routing_number || null;
};

const getServiceProvider = (item) => {
  return item?.details?.service_provider || null;
};

const getWalletNumber = (item) => {
  return item?.details?.wallet_number || null;
};

const calculateRowNumber = (index) => {
  if (cashBankAccountStore.pagination?.from && cashBankAccountStore.pagination.from > 0) {
    return cashBankAccountStore.pagination.from + index;
  }
  return (cashBankAccountStore.pagination.current_page - 1) * cashBankAccountStore.pagination.per_page + index + 1;
};

const formatAccountType = (type) => {
  const typeMap = {
    'bank': 'Bank Account',
    'mobile_banking': 'Mobile Banking',
    'cash': 'Cash'
  };
  return typeMap[type] || type;
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const clearValidationError = (fieldName) => {
  if (cashBankAccountStore.validationErrors[fieldName]) {
    const updatedErrors = { ...cashBankAccountStore.validationErrors };
    delete updatedErrors[fieldName];
    cashBankAccountStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  cashBankAccountStore.validationErrors = {};
};

const handleAccountTypeChange = async () => {
  clearValidationError('account_type');

  // Reset bank-specific fields when account type changes
  formData.value.bank_name = '';
  formData.value.branch = '';
  formData.value.routing_number = '';

  // Reset mobile banking fields when account type changes
  formData.value.service_provider = '';
  formData.value.wallet_number = '';

  // Clear account number for cash accounts
  if (formData.value.account_type === 'cash') {
    formData.value.acc_number = '';
  }
};

const editItem = async (item) => {
  currentItem.value = item;
  modalMode.value = 'edit';

  // Set the form data from the item
  formData.value = {
    'account_type': item.account_type || '',
    'account_name': item.account_name || '',
    'acc_number': item.acc_number || '',
    'bank_name': getBankName(item) || '',
    'branch': getBranch(item) || '',
    'routing_number': getRoutingNumber(item) || '',
    'service_provider': getServiceProvider(item) || '',
    'wallet_number': getWalletNumber(item) || '',
    'opening_balance': item.opening_balance || 0.0,
    'opening_balance_date': item.opening_balance_date || ''
  };

  isModalOpen.value = true;
  clearAllValidationErrors();
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await cashBankAccountStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  cashBankAccountStore.search('');
};

watch(searchQuery, (newValue) => {
  if (newValue === '') {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    cashBankAccountStore.search('');
  }
  handleSearch();
  clearAllValidationErrors();
});

onMounted(async () => {
  await getData();
  await loadRelatedData();
});

const getData = async () => {
  await cashBankAccountStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    await clearSearch();
    await getData();
  } finally {
    refresh.value = false;
  }
}

const loadRelatedData = async () => {
  await companyStore.getAll();
};

// Modal functions
const openCreateModal = () => {
  resetForm();
  modalMode.value = 'create';
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
    'account_type': '',
    'account_name': '',
    'acc_number': '',
    'bank_name': '',
    'branch': '',
    'routing_number': '',
    'service_provider': '',
    'wallet_number': '',
    'opening_balance': 0.0,
    'opening_balance_date': ''
  };
  currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const payload = {
    account_name: formData.value.account_name,
    acc_number: formData.value.acc_number,
    account_type: formData.value.account_type,
    details: {
      bank_name: formData.value.bank_name || null,
      branch: formData.value.branch || null,
      routing_number: formData.value.routing_number || null,
      service_provider: formData.value.service_provider || null,
      wallet_number: formData.value.wallet_number || null
    },
    opening_balance: parseFloat(formData.value.opening_balance) || 0,
    opening_balance_date: formData.value.opening_balance_date
  };

  // Remove empty fields from main payload
  Object.keys(payload).forEach(key => {
    if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
      delete payload[key];
    }
  });

  // Clean details object - remove null/empty values
  if (payload.details) {
    Object.keys(payload.details).forEach(key => {
      if (payload.details[key] === '' || payload.details[key] === null || payload.details[key] === undefined) {
        delete payload.details[key];
      }
    });
    if (Object.keys(payload.details).length === 0) {
      delete payload.details;
    }
  }

  let result;
  if (modalMode.value === 'create') {
    result = await cashBankAccountStore.create(payload);
  } else {
    payload._method = 'PUT';
    result = await cashBankAccountStore.update(currentItem.value.id, payload);
  }

  if (result && result.success) {
    closeModal();
    await getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await cashBankAccountStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      await getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await cashBankAccountStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await cashBankAccountStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = cashBankAccountStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await cashBankAccountStore.sort(column, order);
};

const handleAmountInput = (e) => {
  let value = e.target.value;
  value = value.replace(/[^0-9.]/g, '');
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  formData.value.opening_balance = Number(value);
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>