<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Roles</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['roles.view']"
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
          <SortableTableHeader :columns="tableColumns" :sort-by="roleStore.sortBy"
            :sort-direction="roleStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State - Inside table body -->
          <TableLoadingState v-if="roleStore.loading" :is-loading="true" :total-items="roleStore.totalItems"
            :item-name="'roles'" loading-text="Loading roles..." loading-subtext="Fetching your role data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="roleStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'roles'" empty-icon="fas fa-users" empty-title="No roles found"
              :empty-message="searchQuery ? 'No roles match your search criteria.' : 'Get started by creating your first role.'"
              :create-button-text="'Add First Role'" @create="openCreateModal" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.name || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                <div class="flex flex-wrap gap-1">
                  <span v-if="data.permissions && data.permissions.length > 0"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ data.permissions.length }} permission{{ data.permissions.length !== 1 ? 's' : '' }}
                  </span>
                  <span v-else class="text-gray-400 dark:text-gray-500 text-xs">No permissions</span>
                </div>
              </td>
              <td class="px-6 py-3 text-right text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openAssignPermissionsModal(data)"
                    class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1.5 rounded bg-purple-50 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors dark:bg-gray-500"
                    title="Assign Permissions">
                    <i class="fas fa-key"></i>
                  </button>

                  <button @click="viewItem(data)" v-permission="['roles.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1.5 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['roles.update', 'roles.delete']">
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
                        <button @click="editItem(data); data.showDropdown = false" v-permission="['roles.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <button @click="confirmDelete(data); data.showDropdown = false" v-permission="['roles.delete']"
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

    <div v-if="roleStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="roleStore.totalItems > 0" :total-items="roleStore.totalItems" :per-page="roleStore.perPage"
        :current-page="roleStore.currentPage" :last-page="roleStore.lastPage" :is-loading="roleStore.isLoading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen" :title="modalMode === 'create' ? 'Create Role' : 'Edit Role'"
    maxWidth="4xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.name" type="text" placeholder="Enter Name" @change="clearValidationError('name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': roleStore.validationErrors.name }">
          <p v-if="roleStore.validationErrors.name" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ roleStore.validationErrors.name[0] }}
          </p>
        </div>

        <!-- Global Form Errors -->
        <div v-if="Object.keys(roleStore.validationErrors).length > 0"
          class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg col-span-1 md:col-span-2 2xl:col-span-3">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in roleStore.validationErrors" :key="field">
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
          <button type="submit" :disabled="roleStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            roleStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="roleStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>{{ modalMode === 'create' ? 'Create Role' : 'Update Role' }}</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="7xl" title="Role Details" @close="closeViewModal">
    <div class="h-[90vh]">
      <div class="py-1">
        <div class="grid grid-cols-1 md:grid-cols-1">
          <!-- Basic Info -->
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Basic Information</h3>
          <div class="flex flex-row items-start gap-5 mb-4">
            <div class="">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mr-2">Role Name</label>
              <span class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2.5 py-1 
              inline-flex text-xs leading-5 font-semibold rounded">{{ viewingItem.name }}</span>
            </div>

            <div class="">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mr-2">Total
                Permissions</label>
              <span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-1 
              inline-flex text-xs leading-5 font-semibold rounded">{{ viewingItem.permissions ?
                viewingItem.permissions.length : 0 }}</span>
            </div>
          </div>

          <!-- Permissions -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-4">Permissions</h3>
            <div v-if="viewingItem.permissions && viewingItem.permissions.length > 0"
              class="max-h-[55vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <!-- Group permissions by group name -->
              <div v-for="(group, groupName) in groupedPermissions" :key="groupName"
                class="mb-4 last:mb-0 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h4
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span>{{ groupName }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">{{ group.length }} permission{{
                    group.length !== 1 ? 's' : '' }}</span>
                </h4>
                <div
                  class="space-y-1 pl-2  grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-2 gap-0">
                  <div v-for="permission in group" :key="permission.id"
                    class="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <div class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span class="text-xs text-gray-600 dark:text-gray-400">{{ permission.title || permission.name
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <i class="fas fa-key text-gray-300 dark:text-gray-600 text-3xl mb-2"></i>
              <p class="text-sm text-gray-500 dark:text-gray-400">No permissions assigned</p>
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
        <button @click="openAssignPermissionsModal(viewingItem)"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500">
          <i class="fas fa-key mr-2"></i>
          Assign Permissions
        </button>
        <button @click="editItem(viewingItem)"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
          Edit Role
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- Assign Permissions Modal -->
  <BaseModal v-if="assigningPermissionsItem" :show="showAssignPermissionsModal" title="Assign Permissions"
    maxWidth="7xl" @close="closeAssignPermissionsModal">
    <div class="py-1">
      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Assign permissions to role: <span class="font-semibold text-gray-800 dark:text-white">{{
            assigningPermissionsItem.name }}</span>
        </p>
      </div>

      <!-- Search and Select All Controls -->
      <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="relative flex-grow max-w-sm">
          <input v-model="permissionSearch" type="search" placeholder="Search permissions..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all focus:shadow-sm text-sm" />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <i class="fas fa-search text-sm"></i>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="toggleSelectAll"
            class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
            <i class="fas" :class="isAllSelected ? 'fa-check-square' : 'fa-square'"></i>
            {{ isAllSelected ? 'Deselect All' : 'Select All' }}
          </button>
        </div>
      </div>

      <!-- Loading State for Permissions -->
      <div v-if="permissionsLoading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-500 dark:text-blue-400 mb-3"></i>
        <p class="text-sm text-gray-600 dark:text-gray-400">Loading permissions...</p>
      </div>

      <!-- Permission Groups -->
      <div v-else-if="filteredPermissionGroups"
        class="max-h-[52vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(group, groupName) in filteredPermissionGroups" :key="groupName"
          class="mb-4 last:mb-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <!-- Group Header with Checkbox -->
          <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input type="checkbox" :checked="isGroupSelected(groupName)" @change="toggleGroup(groupName)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 h-4 w-4">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ groupName }}</h3>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ selectedCountInGroup(groupName) }} / {{ group.length }} selected
              </span>
            </div>
          </div>

          <!-- Permissions Grid -->
          <div class="p-3 bg-white dark:bg-gray-900">
            <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-2 gap-0">
              <div v-for="permission in group" :key="permission.id"
                class="flex items-center gap-1 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
                <input type="checkbox" :id="`perm-${permission.id}`" :value="permission.id"
                  v-model="selectedPermissions"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 h-4 w-4">
                <label :for="`perm-${permission.id}`"
                  class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2 flex-grow">
                  <!-- <div class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div> -->
                  <span class="truncate">{{ permission.title || permission.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!permissionsLoading"
        class="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <i class="fas fa-key text-gray-300 dark:text-gray-600 text-4xl mb-3"></i>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ permissionSearch ? 'No permissions found matching your search.' : 'No permissions available.' }}
        </p>
      </div>

      <!-- Summary -->
      <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Total selected: <span class="font-semibold text-gray-800 dark:text-white">{{ selectedPermissions.length
              }}</span>
              out of <span class="font-semibold">{{ allPermissions.length }}</span> permissions
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button @click="clearSelection"
              class="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1">
              <i class="fas fa-times"></i>
              Clear All
            </button>
          </div>
        </div>
      </div>

      <!-- Global Form Errors -->
      <div v-if="Object.keys(roleStore.validationErrors).length > 0"
        class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
        <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
          <li v-for="(errors, field) in roleStore.validationErrors" :key="field">
            • {{ errors[0] }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeAssignPermissionsModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        Cancel
      </button>
      <button @click="handleAssignPermissions" :disabled="roleStore.loading || permissionsLoading" :class="[
        'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
        (roleStore.loading || permissionsLoading) ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
      ]">
        <span v-if="roleStore.loading || permissionsLoading">
          <i class="fas fa-spinner fa-spin mr-2"></i>
          {{ roleStore.loading ? 'Assigning...' : 'Loading...' }}
        </span>
        <span v-else>
          <i class="fas fa-key mr-2"></i>
          Assign Permissions
        </span>
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Role" maxWidth="lg" :showClose="false" @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Role</h3>
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
        <button @click="handleDelete" :disabled="roleStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          roleStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="roleStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Role</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoleStore } from '@/stores/roleStore.js';
import { usePermissionStore } from '@/stores/permissionStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import axiosClient from "@/axiosClient";

const refresh = ref(false);
const tableColumns = ref([
  {
    "key": "name",
    "label": "Name",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "permissions",
    "label": "Permissions",
    "sortable": false,
    "type": "string"
  }
]);

// Initialize stores
const roleStore = useRoleStore();
const permissionStore = usePermissionStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showAssignPermissionsModal = ref(false);

// Form data
const formData = ref({
  'name': '',
});

// Permissions
const assigningPermissionsItem = ref(null);
const selectedPermissions = ref([]);
const allPermissions = ref([]);
const permissionsLoading = ref(false);
const permissionSearch = ref('');

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return roleStore.items || [];
});

// Group permissions in view modal
const groupedPermissions = computed(() => {
  if (!viewingItem.value || !viewingItem.value.permissions) {
    return {};
  }

  const groups = {};
  viewingItem.value.permissions.forEach(permission => {
    const group = permission.group || 'General';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(permission);
  });

  return groups;
});

// Group all permissions for assignment modal
const permissionGroups = computed(() => {
  const groups = {};
  allPermissions.value.forEach(permission => {
    const group = permission.group || 'General';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(permission);
  });
  return groups;
});

// Filtered permission groups based on search
const filteredPermissionGroups = computed(() => {
  if (!permissionSearch.value) {
    return permissionGroups.value;
  }

  const searchTerm = permissionSearch.value.toLowerCase();
  const filteredGroups = {};

  Object.entries(permissionGroups.value).forEach(([groupName, permissions]) => {
    const filteredPermissions = permissions.filter(permission =>
      permission.name.toLowerCase().includes(searchTerm) ||
      (permission.title && permission.title.toLowerCase().includes(searchTerm)) ||
      groupName.toLowerCase().includes(searchTerm)
    );

    if (filteredPermissions.length > 0) {
      filteredGroups[groupName] = filteredPermissions;
    }
  });

  return filteredGroups;
});

// Check if all permissions are selected
const isAllSelected = computed(() => {
  return allPermissions.value.length > 0 &&
    selectedPermissions.value.length === allPermissions.value.length;
});

const calculateRowNumber = (index) => {
  if (roleStore.pagination?.from && roleStore.pagination.from > 0) {
    return roleStore.pagination.from + index;
  }
  return (roleStore.pagination.current_page - 1) * roleStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (roleStore.validationErrors[fieldName]) {
    const updatedErrors = { ...roleStore.validationErrors };
    delete updatedErrors[fieldName];
    roleStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  roleStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await roleStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  roleStore.search('');
};

watch(searchQuery, (newValue) => {
  if (newValue === '') {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    roleStore.search('');
  }
  handleSearch();
  clearAllValidationErrors();
});

onMounted(async () => {
  await getData();
});

const getData = async () => {
  await roleStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    clearSearch();
    await roleStore.get();
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

const editItem = (item) => {
  currentItem.value = item;
  modalMode.value = 'edit';
  formData.value = {
    'name': item.name || '',
  };
  isModalOpen.value = true;
  clearAllValidationErrors();
};

const viewItem = (item) => {
  viewingItem.value = item;
  showViewModal.value = true;
};

const openAssignPermissionsModal = async (item) => {
  assigningPermissionsItem.value = item;

  // Load all permissions via API
  await loadAllPermissions();

  // Set current role's permissions as selected
  if (item.permissions && item.permissions.length > 0) {
    selectedPermissions.value = item.permissions.map(p => p.id);
  } else {
    selectedPermissions.value = [];
  }

  permissionSearch.value = '';
  showAssignPermissionsModal.value = true;
};

const loadAllPermissions = async () => {
  permissionsLoading.value = true;
  try {
    const response = await permissionStore.getAll();
    allPermissions.value = response.data;
  } catch (error) {
    console.error('Error loading permissions:', error);
    allPermissions.value = [];
  } finally {
    permissionsLoading.value = false;
  }
};

const closeAssignPermissionsModal = () => {
  showAssignPermissionsModal.value = false;
  assigningPermissionsItem.value = null;
  selectedPermissions.value = [];
  allPermissions.value = [];
  permissionSearch.value = '';
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
    'name': '',
  };
  currentItem.value = null;
};

// Permission assignment helpers
const isGroupSelected = (groupName) => {
  const groupPermissions = permissionGroups.value[groupName] || [];
  if (groupPermissions.length === 0) return false;

  return groupPermissions.every(permission =>
    selectedPermissions.value.includes(permission.id)
  );
};

const selectedCountInGroup = (groupName) => {
  const groupPermissions = permissionGroups.value[groupName] || [];
  return groupPermissions.filter(permission =>
    selectedPermissions.value.includes(permission.id)
  ).length;
};

const toggleGroup = (groupName) => {
  const groupPermissions = permissionGroups.value[groupName] || [];
  const allSelected = isGroupSelected(groupName);

  if (allSelected) {
    // Deselect all in group
    selectedPermissions.value = selectedPermissions.value.filter(permId =>
      !groupPermissions.some(p => p.id === permId)
    );
  } else {
    // Select all in group
    const newSelected = [...selectedPermissions.value];
    groupPermissions.forEach(permission => {
      if (!newSelected.includes(permission.id)) {
        newSelected.push(permission.id);
      }
    });
    selectedPermissions.value = newSelected;
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all
    selectedPermissions.value = [];
  } else {
    // Select all
    selectedPermissions.value = allPermissions.value.map(p => p.id);
  }
};

const clearSelection = () => {
  selectedPermissions.value = [];
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
    result = await roleStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await roleStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleAssignPermissions = async () => {
  if (!assigningPermissionsItem.value) return;

  const payload = selectedPermissions.value;

  const result = await assignPermissions(
    assigningPermissionsItem.value.id,
    payload
  );

  if (result && result.success) {
    closeAssignPermissionsModal();
    await getData();
  }
};

const assignPermissions = async (roleId, permissionsArray) => {
  try {
    const apiUrl = `/roles/${roleId}/permissions`;

    const response = await axiosClient.post(apiUrl, {
      permissions: permissionsArray
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response.data };
  } finally {
    permissionsLoading.value = false;
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await roleStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await roleStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await roleStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = roleStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await roleStore.sort(column, order);
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

/* Custom scrollbar for permission groups */
.max-h-96::-webkit-scrollbar {
  width: 8px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.dark .max-h-96::-webkit-scrollbar-track {
  background: #374151;
}

.dark .max-h-96::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .max-h-96::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>