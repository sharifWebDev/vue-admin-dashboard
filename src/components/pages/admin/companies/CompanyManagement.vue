<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Companies</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['companies.create']"
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
          <SortableTableHeader :columns="tableColumns" :sort-by="companyStore.sortBy"
            :sort-direction="companyStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State - Inside table body -->
          <TableLoadingState v-if="companyStore.loading" :is-loading="true" :total-items="companyStore.totalItems"
            :item-name="'companies'" loading-text="Loading companies..."
            loading-subtext="Fetching your companie data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="companyStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'companies'" empty-icon="fas fa-users"
              empty-title="No companies found"
              :empty-message="searchQuery ? 'No companies match your search criteria.' : 'Get started by creating your first companie.'"
              :create-button-text="'Add First Company'" @create="openCreateModal" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-3">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 h-10 w-auto">
                    <img v-if="data.logo" :src="data.logo" :alt="data.company_name"
                      class="h-10 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700">
                    <div v-else
                      class="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <i class="fas fa-building text-gray-400"></i>
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ data.name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      <!-- {{ data.tatal_accounts }} Accounts -->
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.phone || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.mobile || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                {{ data.email || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                <a v-if="data.website" :href="data.website" target="_blank" rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 hover:underline" :alt="data.website">
                  <i class="fas fa-globe"></i> Visit Website
                </a>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                <span :class="[
                  data.status === 1 || data.status === true
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                  'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                ]">
                  {{ data.status === 1 || data.status === true ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-3 text-right text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">

                  <button @click="toggleStatus(data, 'status')"
                    class="p-1 rounded bg-gray-50 dark:bg-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
                    title="Toggle Status">
                    <span :class="[
                      'relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-300',
                      data.status === 1 || data.status === true ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                    ]">
                      <span :class="[
                        'inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300',
                        data.status === 1 || data.status === true ? 'translate-x-3.5' : 'translate-x-0.5'
                      ]"></span>
                    </span>
                  </button>

                  <button @click="viewItem(data)" v-permission="['companies.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['companies.update', 'companies.delete']">
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
                        <button @click="editItem(data); data.showDropdown = false" v-permission="['companies.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['companies.delete']"
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

    <div v-if="companyStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="companyStore.totalItems > 0" :total-items="companyStore.totalItems"
        :per-page="companyStore.perPage" :current-page="companyStore.currentPage" :last-page="companyStore.lastPage"
        :is-loading="companyStore.isLoading" @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen" :title="modalMode === 'create' ? 'Create Company' : 'Edit Company'"
    maxWidth="4xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <!-- Logo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
          <div class="flex items-center space-x-4">
            <div v-if="previewImage" class="relative">
              <img :src="previewImage" alt="Logo Preview"
                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
              <button @click="removeImage" type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div v-else-if="currentItem?.logo" class="relative">
              <img :src="currentItem.logo" :alt="currentItem.name"
                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
              <button @click="removeImage" type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div>
              <label for="company-logo"
                class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors inline-flex items-center">
                <i class="fas fa-upload mr-2"></i>
                {{ (currentItem?.logo || previewImage) ? 'Change Logo' : 'Upload Logo' }}
              </label>
              <input id="company-logo" type="file" accept="image/*" @change="handleImageUpload" class="hidden">
            </div>
          </div>
          <p v-if="companyStore.validationErrors.logo" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ companyStore.validationErrors.logo[0] }}
          </p>
        </div>
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.name" type="text" placeholder="Enter Name" @change="clearValidationError('name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': companyStore.validationErrors.name }">
          <p v-if="companyStore.validationErrors.name" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ companyStore.validationErrors.name[0] }}
          </p>
        </div>
        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input v-model="formData.phone" type="text" placeholder="Enter Phone" @change="clearValidationError('phone')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': companyStore.validationErrors.phone }">
          <p v-if="companyStore.validationErrors.phone" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ companyStore.validationErrors.phone[0] }}
          </p>
        </div>
        <!-- Mobile -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
          <input v-model="formData.mobile" type="text" placeholder="Enter Mobile"
            @change="clearValidationError('mobile')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': companyStore.validationErrors.mobile }">
          <p v-if="companyStore.validationErrors.mobile" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ companyStore.validationErrors.mobile[0] }}
          </p>
        </div>
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input v-model="formData.email" type="text" placeholder="Enter Email" @change="clearValidationError('email')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': companyStore.validationErrors.email }">
          <p v-if="companyStore.validationErrors.email" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ companyStore.validationErrors.email[0] }}
          </p>
        </div>
        <!-- Website -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
          <input v-model="formData.website" type="url" placeholder="e.g. https://example.com"
            @change="clearValidationError('website')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': companyStore.validationErrors.website }">
          <p v-if="companyStore.validationErrors.website" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ companyStore.validationErrors.website[0] }}
          </p>
        </div>
        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <div class="flex items-center space-x-6">
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.status" type="radio" :value="1" @change="clearValidationError('status')"
                class="h-4 w-4 text-gray-600 focus:ring-green-600 border-green-300 dark:border-green-600 dark:bg-green-700 accent-green-600">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.status" type="radio" :value="0" @change="clearValidationError('status')"
                class="h-4 w-4 text-red-600 focus:ring-red-600 border-red-300 dark:border-red-600 dark:bg-red-700 accent-red-600">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
            </label>
          </div>
        </div>

        <!-- Global Form Errors -->
        <div v-if="Object.keys(companyStore.validationErrors).length > 0"
          class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg col-span-1 md:col-span-2 2xl:col-span-3">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in companyStore.validationErrors" :key="field">
              • {{ errors[0] }}
            </li>
          </ul>
        </div>

        <!-- Company Settings Button -->
        <div v-if="modalMode === 'edit'" v-permission="['company_settings.update']" class="col-span-1 md:col-span-2 2xl:col-span-3 mt-4">
          <button type="button" @click="openCompanySettingsModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <i class="fas fa-cog mr-2"></i>
            Company Settings
          </button>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end space-x-3 col-span-1 md:col-span-2 2xl:col-span-3">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="companyStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            companyStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="companyStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>{{ modalMode === 'create' ? 'Create Company' : 'Update Company' }}</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- Settings Modal -->
  <BaseModal v-if="companySettings" :show="showCompanySettingsModal" maxWidth="xl" title="Company Settings"
    @close="closeCompanySettingsModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Voucher Edit Window
              (Hours)</label>
            <input type="number" v-model="companySettings.voucher_edit_window_hours"
              @change="clearValidationError('voucher_edit_window_hours')" :min="0"
              class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': companyStore.validationErrors.voucher_edit_window_hours }">
            <p v-if="companyStore.validationErrors.voucher_edit_window_hours"
              class="text-xs text-red-600 dark:text-red-400 mt-1">
              {{ companyStore.validationErrors.voucher_edit_window_hours[0] }}
            </p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Voucher Delete Window
              (Hours)</label>
            <input type="number" v-model="companySettings.voucher_delete_window_hours"
              @change="clearValidationError('voucher_delete_window_hours')" :min="0"
              class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': companyStore.validationErrors.voucher_delete_window_hours }">
            <p v-if="companyStore.validationErrors.voucher_delete_window_hours"
              class="text-xs text-red-600 dark:text-red-400 mt-1">
              {{ companyStore.validationErrors.voucher_delete_window_hours[0] }}
            </p>
          </div>
          <div class="col-span-2">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Require Approval After
              Window</label>
            <div class="mt-2">
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="companySettings.require_approval_after_window"
                  @change="clearValidationError('require_approval_after_window')"
                  class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {{ companySettings.require_approval_after_window ? 'Yes' : 'No' }}
                </span>
              </label>
            </div>
            <p v-if="companyStore.validationErrors.require_approval_after_window"
              class="text-xs text-red-600 dark:text-red-400 mt-1">
              {{ companyStore.validationErrors.require_approval_after_window[0] }}
            </p>
          </div>
          <div class="col-span-2">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Year Start Date</label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <select v-model="companySettings.year_start_month" @change="clearValidationError('year_start_date')"
                  class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': companyStore.validationErrors.year_start_date }">
                  <option value="">Select Month</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div>
                <select v-model="companySettings.year_start_day" @change="clearValidationError('year_start_date')"
                  class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': companyStore.validationErrors.year_start_date }">
                  <option value="">Select Day</option>
                  <option v-for="day in 31" :key="day" :value="String(day).padStart(2, '0')">
                    {{ day }}
                  </option>
                </select>
              </div>
            </div>
            <p v-if="companyStore.validationErrors.year_start_date" class="text-xs text-red-600 dark:text-red-400 mt-1">
              {{ companyStore.validationErrors.year_start_date[0] }}
            </p>
          </div>
        </div>
        <!-- Global Form Errors -->
        <div v-if="Object.keys(companyStore.validationErrors).length > 0"
          class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in companyStore.validationErrors" :key="field">
              • {{ errors[0] || errors }}
            </li>
          </ul>
        </div>

        <div class="flex justify-end space-x-3">
          <button type="button" @click="closeCompanySettingsModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="button" @click="updateCompanySettings" :disabled="companyStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            companyStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="companyStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </span>
            <span v-else>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Company Details" @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <div class="grid grid-cols-2 gap-4">

          <div class="col-span-2 md:col-span-2 2xl:col-span-2 flex flex-col items-center mb-4">
            <img v-if="viewingItem.logo" :src="viewingItem.logo" :alt="viewingItem.name"
              class="h-24 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
            <div v-else class="h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <i class="fas fa-building text-gray-400 text-2xl"></i>
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.name || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.phone || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mobile</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.mobile || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.email || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Website</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.website || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
            <div class="mt-1">
              <span :class="[
                'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                viewingItem.status === 1 || viewingItem.status === true
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              ]">
                {{ viewingItem.status === 1 || viewingItem.status === true ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="companySettings" v-permission="['company_settings.view']"
          class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company Settings</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Voucher Edit Window
                (Hours)</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{
                companySettings.voucher_edit_window_hours ?? 'N/A' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Voucher Delete Window
                (Hours)</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{
                companySettings.voucher_delete_window_hours ?? 'N/A' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Require Approval After
                Window</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">
                <span
                  :class="companySettings.require_approval_after_window ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'">
                  {{ companySettings.require_approval_after_window ? 'Yes' : 'No' }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Year Start Date</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{ companySettings.year_start_date ||
                'N/A' }}</p>
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
      <button v-permission="['companies.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Company
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Company" maxWidth="lg" :showClose="false" @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Company</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{{ deletingItem?.name || deletingItem?.code || 'this item'
          }}</strong>? This action cannot be
          undone.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="companyStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          companyStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="companyStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Company</span>
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- Status Change Confirmation Modal -->
  <BaseModal :show="showStatusChangeModal" title="Change Status" maxWidth="lg" :showClose="false"
    @close="closeStatusChangeModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div
          class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
          <i class="fas fa-exchange-alt text-yellow-600 dark:text-yellow-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Change Company Status</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to change the status of
          <strong>{{ statusChangingItem?.name || statusChangingItem?.code || 'this item' }}</strong>
          to
          <strong>
            <span :class="[
              statusChangingItem?.status === 1 || statusChangingItem?.status === true
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            ]">
              {{ statusChangingItem?.status === 1 || statusChangingItem?.status === true ? 'Inactive' : 'Active'
              }}
            </span>
          </strong>?
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeStatusChangeModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="confirmStatusChange" :disabled="companyStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          companyStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
        ]">
          <span v-if="companyStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Updating...
          </span>
          <span v-else>Confirm Change</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCompanyStore } from '@/stores/companyStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import axiosClient from '@/axiosClient';
import { useToast } from "vue-toastification";

const refresh = ref(false);
const tableColumns = ref([
  {
    "key": "name",
    "label": "Name",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "phone",
    "label": "Phone",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "mobile",
    "label": "Mobile",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "email",
    "label": "Email",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "website",
    "label": "Website",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "status",
    "label": "Status",
    "sortable": true,
    "type": "boolean",
    "width": "100px"
  }
]);

// Initialize stores
const companyStore = useCompanyStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showStatusChangeModal = ref(false);
const showCompanySettingsModal = ref(false);

// State for settings modal
const companySettings = ref(null);

// Toast
const toast = useToast();

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

// Form data
const formData = ref({
  'name': '',
  'logo': '',
  'phone': '',
  'mobile': '',
  'email': '',
  'website': '',
  'status': 1
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const statusChangingItem = ref(null);
const modalMode = ref('create');
const previewImage = ref(null);

const displayedItems = computed(() => {
  return companyStore.items || [];
});

const calculateRowNumber = (index) => {
  if (companyStore.pagination?.from && companyStore.pagination.from > 0) {
    return companyStore.pagination.from + index;
  }
  return (companyStore.pagination.current_page - 1) * companyStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (companyStore.validationErrors[fieldName]) {
    const updatedErrors = { ...companyStore.validationErrors };
    delete updatedErrors[fieldName];
    companyStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  companyStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await companyStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  companyStore.search('');
};

watch(searchQuery, (newValue) => {
  if (newValue === '') {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    companyStore.search('');
  }
  handleSearch();
  clearAllValidationErrors();
});

onMounted(async () => {
  getData();
  loadRelatedData();
});

const getData = async () => {
  await companyStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    clearSearch();
  } finally {
    refresh.value = false;
  }
}

const loadRelatedData = () => {

};

// Modal functions
const openCreateModal = () => {
  resetForm();
  modalMode.value = 'create';
  isModalOpen.value = true;
  clearAllValidationErrors();
};

// Edit item function with proper logo handling
const editItem = (item) => {
  currentItem.value = item;
  modalMode.value = 'edit';

  // Set form data - logo is NOT included in formData for editing
  // This makes it nullable/optional
  formData.value = {
    'name': item.name || '',
    'logo': '', // Don't set the logo in formData for editing
    'phone': item.phone || '',
    'mobile': item.mobile || '',
    'email': item.email || '',
    'website': item.website || '',
    'status': item.status || 1
  };

  // Set preview image separately for display only
  previewImage.value = item.logo || null;

  isModalOpen.value = true;
  clearAllValidationErrors();
};

// Logo upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Set the file in formData only when a new image is uploaded
  formData.value.logo = file;
  previewImage.value = URL.createObjectURL(file);
};

// Remove image
const removeImage = () => {
  formData.value.logo = '';
  previewImage.value = null;

  // Reset file input
  const fileInput = document.getElementById('company-logo');
  if (fileInput) {
    fileInput.value = '';
  }
};

const viewItem = async (item) => {
  viewingItem.value = item;
  // Load settings before showing modal
  await getCompanySettings(item);
  showViewModal.value = true;
};

const openCompanySettingsModal = async () => {
  // When editing, currentItem should be populated
  if (currentItem.value) {
    getCompanySettings(currentItem.value);
  } else {
    companySettings.value = {
      voucher_edit_window_hours: 0,
      voucher_delete_window_hours: 0,
      require_approval_after_window: false,
      year_start_date: "",
      year_start_month: "",
      year_start_day: ""
    };
  }

  showCompanySettingsModal.value = true;
};

const getCompanySettings = async (currentItem) => {
  try {
    // Fetch company settings from the settings endpoint
    const response = await axiosClient.get(`/companies/${currentItem.id}/settings`);

    if (response.data && response.data?.data) {
      // Parse the year_start_date (format: "MM-DD")
      const yearStartDate = response.data?.data?.year_start_date || '';
      let month = '';
      let day = '';

      if (yearStartDate && yearStartDate.includes('-')) {
        const parts = yearStartDate.split('-');
        month = parts[0] || '';
        day = parts[1] || '';
      }

      // Populate settings from response
      companySettings.value = {
        voucher_edit_window_hours: response.data?.data?.voucher_edit_window_hours ?? 0,
        voucher_delete_window_hours: response.data?.data?.voucher_delete_window_hours ?? 0,
        require_approval_after_window: !!response.data?.data?.require_approval_after_window,
        year_start_date: response.data?.data?.year_start_date || "",
        year_start_month: month,
        year_start_day: day
      };
    } else {
      companySettings.value = {
        voucher_edit_window_hours: 0,
        voucher_delete_window_hours: 0,
        require_approval_after_window: false,
        year_start_date: "",
        year_start_month: "",
        year_start_day: ""
      };
    }
  } catch (error) {
    console.error('Error loading company settings:', error);
    companySettings.value = {
      voucher_edit_window_hours: 0,
      voucher_delete_window_hours: 0,
      require_approval_after_window: false,
      year_start_date: "",
      year_start_month: "",
      year_start_day: ""
    };
  }
}

const confirmDelete = (item) => {
  deletingItem.value = item;
  showDeleteModal.value = true;
};

const toggleStatus = (item, field) => {
  statusChangingItem.value = item;
  showStatusChangeModal.value = true;
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

const closeStatusChangeModal = () => {
  showStatusChangeModal.value = false;
  statusChangingItem.value = null;
};

const closeCompanySettingsModal = () => {
  showCompanySettingsModal.value = false;
  companySettings.value = null;
};

const resetForm = () => {
  // Also clear settings when form is reset
  companySettings.value = null;
  formData.value = {
    'name': '',
    'logo': '',
    'phone': '',
    'mobile': '',
    'email': '',
    'website': '',
    'status': 1
  };
  previewImage.value = null;
  currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

  for (const key in formData.value) {
    const value = formData.value[key];

    // Skip null, undefined, or empty string values for all fields except status (which can be 0)
    if (value === null || value === undefined) {
      continue;
    }

    // For string fields, skip empty strings
    if (typeof value === 'string' && value === '') {
      continue;
    }

    // Handle file upload
    if (key === 'logo' && value instanceof File) {
      formDataToSend.append(key, value);
    } else if (key === 'logo') {
      // Skip logo if it's not a file (don't send empty logo in edit mode)
      continue;
    } else {
      formDataToSend.append(key, value);
    }
  }

  let result;
  if (modalMode.value === 'create') {
    result = await companyStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await companyStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await companyStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

const updateCompanySettings = async () => {
  // Save just the settings for the currently selected company
  if (!currentItem.value) return;

  clearAllValidationErrors();

  // Combine month and day into MM-DD format
  const yearStartMonth = companySettings.value.year_start_month;
  const yearStartDay = companySettings.value.year_start_day;

  // Validate that both month and day are selected
  if (!yearStartMonth || !yearStartDay) {
    companyStore.validationErrors = {
      ...companyStore.validationErrors,
      year_start_date: ['Both month and day must be selected']
    };
    return;
  }

  // Prepare payload in the required format
  const payload = {
    voucher_edit_window_hours: parseInt(companySettings.value.voucher_edit_window_hours) || 0,
    voucher_delete_window_hours: parseInt(companySettings.value.voucher_delete_window_hours) || 0,
    require_approval_after_window: !!companySettings.value.require_approval_after_window,
    year_start_date: `${yearStartMonth}-${yearStartDay}`
  };

  try {
    const response = await axiosClient(`/companies/${currentItem.value.id}/settings/update`, {
      method: 'PUT',
      data: payload
    });

    if (response.data.success) {
      showCompanySettingsModal.value = false;
      getData();
      toast.success(response.data.message || 'Settings updated successfully');
    } else {
      toast.error(response.data?.message || 'Failed to save settings');
      if (response.data.errors) {
        companyStore.validationErrors = response.data.errors;
      }
    }
  } catch (error) {
    // Handle validation errors from API response
    if (error?.response?.status === 422) {
      const errors = error.response?.data?.errors || error.response?.data?.data?.errors || {};
      if (Object.keys(errors).length > 0) {
        companyStore.validationErrors = errors;
        toast.error('Please fix the validation errors below');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save settings');
      }
    } else {
      toast.error(error?.response?.data?.message || error.message || 'Failed to save settings');
      // Try to populate validation errors if available
      if (error?.response?.data?.errors) {
        companyStore.validationErrors = error.response.data.errors;
      }
    }
  }
};

const confirmStatusChange = async () => {
  if (statusChangingItem.value) {
    try {
      const field = 'status';
      await companyStore.toggleStatus(statusChangingItem.value, field);
      closeStatusChangeModal();
      getData();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await companyStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await companyStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = companyStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await companyStore.sort(column, order);
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>





 