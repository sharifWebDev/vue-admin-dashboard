<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Clients</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['clients.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <!-- Right Side: Search -->
      <div class="flex items-center gap-3 w-full lg:w-auto">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-0 max-w-md">
          <input v-model="searchQuery" @input="handleSearch" type="search" placeholder="Search by name or code..."
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
          <SortableTableHeader :columns="tableColumns" :sort-by="clientStore.sortBy"
            :sort-direction="clientStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="clientStore.loading" :is-loading="true" :total-items="clientStore.totalItems"
            :item-name="'clients'" loading-text="Loading clients..." loading-subtext="Fetching your client data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="clientStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'clients'" empty-icon="fas fa-users"
              empty-title="No clients found"
              :empty-message="searchQuery ? 'No clients match your search criteria.' : 'Get started by creating your first client.'"
              :create-button-text="'Add First Client'" @create="openCreateModal" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-3">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 h-10 w-auto">
                    <img v-if="data.image" :src="data.image" :alt="data.name"
                      class="h-10 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700">
                    <div v-else
                      class="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <i class="fas fa-user-friends text-gray-400"></i>
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ data.name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      Code: {{ data.code || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.email || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.phone || 'N/A' }}
              </td> 
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                <span :class="[
                  data.is_active === 1 || data.is_active === true
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                  'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                ]">
                  {{ data.is_active === 1 || data.is_active === true ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-3 text-right text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">

                  <button @click="viewItem(data)" v-permission="['clients.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['clients.update', 'clients.delete']">
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
                        <button @click="editItem(data); data.showDropdown = false" v-permission="['clients.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['clients.delete']"
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

    <div v-if="clientStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="clientStore.totalItems > 0" :total-items="clientStore.totalItems"
        :per-page="clientStore.perPage" :current-page="clientStore.currentPage" :last-page="clientStore.lastPage"
        :is-loading="clientStore.isLoading" @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen" :title="modalMode === 'create' ? 'Create Client' : 'Edit Client'"
    maxWidth="3xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-3 gap-4">
        <!-- Image -->
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Image</label>
          <div class="flex items-center space-x-4">
            <div v-if="previewImage" class="relative">
              <img :src="previewImage" alt="Client Preview"
                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
              <button @click="removeImage" type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div v-else-if="currentItem?.image" class="relative">
              <img :src="currentItem.image" :alt="currentItem.name"
                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
              <button @click="removeImage" type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div>
              <label for="client-image"
                class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors inline-flex items-center">
                <i class="fas fa-upload mr-2"></i>
                {{ (currentItem?.image || previewImage) ? 'Change Image' : 'Upload Image' }}
              </label>
              <input id="client-image" type="file" accept="image/*" @change="handleImageUpload" class="hidden">
            </div>
          </div>
          <p v-if="clientStore.validationErrors.image" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ clientStore.validationErrors.image[0] }}
          </p>
        </div> --> 

        <!-- Client Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.name" type="text" placeholder="Enter client name"
            @change="clearValidationError('name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': clientStore.validationErrors.name }">
          <p v-if="clientStore.validationErrors.name" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ clientStore.validationErrors.name[0] }}
          </p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input v-model="formData.email" type="email" placeholder="Enter email address"
            @change="clearValidationError('email')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': clientStore.validationErrors.email }">
          <p v-if="clientStore.validationErrors.email" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ clientStore.validationErrors.email[0] }}
          </p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input v-model="formData.phone" type="text" placeholder="Enter phone number"
            @change="clearValidationError('phone')" @input="handlePhoneInput('phone', $event)"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': clientStore.validationErrors.phone }">
          <p v-if="clientStore.validationErrors.phone" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ clientStore.validationErrors.phone[0] }}
          </p>
        </div>


        <!-- Address -->
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
          <textarea v-model="formData.address" rows="3" placeholder="Enter address"
            @change="clearValidationError('address')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': clientStore.validationErrors.address }"></textarea>
          <p v-if="clientStore.validationErrors.address" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ clientStore.validationErrors.address[0] }}
          </p>
        </div> -->

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <div class="flex items-center space-x-6">
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.is_active" type="radio" :value="1" @change="clearValidationError('is_active')"
                class="h-4 w-4 text-gray-600 focus:ring-green-600 border-green-300 dark:border-green-600 dark:bg-green-700 accent-green-600">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.is_active" type="radio" :value="0" @change="clearValidationError('is_active')"
                class="h-4 w-4 text-red-600 focus:ring-red-600 border-red-300 dark:border-red-600 dark:bg-red-700 accent-red-600">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
            </label>
          </div>
          <p v-if="clientStore.validationErrors.is_active" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ clientStore.validationErrors.is_active[0] }}
          </p>
        </div>

        <!-- Global Form Errors -->
        <div v-if="Object.keys(clientStore.validationErrors).length > 0"
          class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg col-span-1 md:col-span-2 2xl:col-span-3">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in clientStore.validationErrors" :key="field">
              • {{ errors[0] }}
            </li>
          </ul>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end space-x-3 col-span-1 md:col-span-2 2xl:col-span-3">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="clientStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            clientStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="clientStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>{{ modalMode === 'create' ? 'Create Client' : 'Update Client' }}</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Client Details" @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <div class="grid grid-cols-2 gap-4">

          <div class="col-span-2 md:col-span-2 2xl:col-span-2 flex flex-col items-center mb-4">
            <img v-if="viewingItem.image" :src="viewingItem.image" :alt="viewingItem.name"
              class="h-24 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
            <div v-else class="h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <i class="fas fa-user-friends text-gray-400 text-2xl"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-2">{{ viewingItem.name }}</h2>
            <p class="text-gray-600 dark:text-gray-400">Code: {{ viewingItem.code || 'N/A' }}</p>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">#{{ viewingItem.id }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.email || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.phone || 'N/A' }}</p>
          </div> 
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.created_at || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated At</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.updated_at || 'N/A' }}</p>
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
      <button v-permission="['clients.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Client
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Client" maxWidth="lg" :showClose="false" @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Client</h3>
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
        <button @click="handleDelete" :disabled="clientStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          clientStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="clientStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Client</span>
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
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Change Client Status</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to change the status of
          <strong>{{ statusChangingItem?.name || statusChangingItem?.code || 'this item' }}</strong>
          to
          <strong>
            <span :class="[
              statusChangingItem?.is_active === 1 || statusChangingItem?.is_active === true
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            ]">
              {{ statusChangingItem?.is_active === 1 || statusChangingItem?.is_active === true ? 'Inactive' : 'Active'
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
        <button @click="confirmStatusChange" :disabled="clientStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          clientStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
        ]">
          <span v-if="clientStore.loading">
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
import { useClientStore } from '@/stores/clientStore'; 
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';

const refresh = ref(false);

const tableColumns = ref([
  {
    "key": "name",
    "label": "Client Name",
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
    "key": "phone",
    "label": "Phone",
    "sortable": true,
    "type": "string"
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
const clientStore = useClientStore(); 

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showStatusChangeModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;
 
// Form data
const formData = ref({ 
  name: '',
  email: '',
  phone: '', 
  address: '',
  is_active: 1,
  image: null
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const statusChangingItem = ref(null);
const modalMode = ref('create');
const previewImage = ref(null);

const displayedItems = computed(() => {
  return clientStore.items || [];
});

const calculateRowNumber = (index) => {
  if (clientStore.pagination?.from && clientStore.pagination.from > 0) {
    return clientStore.pagination.from + index;
  }
  return (clientStore.pagination.current_page - 1) * clientStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (clientStore.validationErrors[fieldName]) {
    const updatedErrors = { ...clientStore.validationErrors };
    delete updatedErrors[fieldName];
    clientStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  clientStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await clientStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  clientStore.search('');
};

watch(searchQuery, (newValue) => {
  if (newValue === '') {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    clientStore.search('');
  }
  handleSearch();
  clearAllValidationErrors();
});

onMounted(async () => {
  getData();
});

const getData = async () => {
  await clientStore.get(); 
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

// Edit item function with proper image handling
const editItem = (item) => {
  currentItem.value = item;
  modalMode.value = 'edit';

  // Set form data - image is NOT included in formData for editing
  formData.value = { 
    name: item.name || '',
    email: item.email || '',
    phone: item.phone || '', 
    address: item.address || '',
    is_active: item.is_active === 1 || item.is_active === true ? 1 : 0,
    image: null // Don't set the image in formData for editing
  };

  // Set preview image separately for display only
  previewImage.value = item.image || null;

  isModalOpen.value = true;
  clearAllValidationErrors();
};

// Image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Set the file in formData only when a new image is uploaded
  formData.value.image = file;
  previewImage.value = URL.createObjectURL(file);
};

// Remove image
const removeImage = () => {
  formData.value.image = null;
  previewImage.value = null;

  // Reset file input
  const fileInput = document.getElementById('client-image');
  if (fileInput) {
    fileInput.value = '';
  }
};

const viewItem = (item) => {
  viewingItem.value = item;
  showViewModal.value = true;
};

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

const resetForm = () => {
  formData.value = { 
    name: '',
    email: '',
    phone: '', 
    address: '',
    is_active: 1,
    image: null
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
    if (key === 'image' && value instanceof File) {
      formDataToSend.append(key, value);
    } else if (key === 'image') {
      // Skip image if it's not a file (don't send empty image in edit mode)
      continue;
    } else {
      formDataToSend.append(key, value);
    }
  }

  let result;
  if (modalMode.value === 'create') {
    result = await clientStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await clientStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await clientStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

const confirmStatusChange = async () => {
  if (statusChangingItem.value) {
    try {
      const field = 'is_active';
      await clientStore.toggleStatus(statusChangingItem.value, field);
      closeStatusChangeModal();
      getData();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await clientStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await clientStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = clientStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await clientStore.sort(column, order);
};

const handlePhoneInput = (fieldName, e) => {
  let value = e.target.value;

  // Remove everything except digits and +
  value = value.replace(/[^0-9+]/g, '');

  // Allow only one + and only at the beginning
  if (value.includes('+')) {
    value = value.replace(/\+/g, '');
    value = '+' + value;
  }

  // Optional: limit total length (including +)
  value = value.slice(0, 15);

  e.target.value = value;

  // Store as STRING
  formData.value[fieldName] = value;
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>