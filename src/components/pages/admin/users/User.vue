<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Users</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['users.create']"
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
          <SortableTableHeader :columns="tableColumns" :sort-by="userStore.sortBy"
            :sort-direction="userStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State - Inside table body -->
          <TableLoadingState v-if="userStore.loading" :is-loading="true" :total-items="userStore.totalItems"
            :item-name="'users'" loading-text="Loading users..." loading-subtext="Fetching your user data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="userStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'users'" empty-icon="fas fa-users" empty-title="No users found"
              :empty-message="searchQuery ? 'No users match your search criteria.' : 'Get started by creating your first user.'"
              :create-button-text="'Add First User'" @create="openCreateModal" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img v-if="data.image" :src="data.image" :alt="data.name"
                      class="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
                    <div v-else
                      class="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <i class="fas fa-user text-gray-400"></i>
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ data.name || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.email || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{data.roles && data.roles.length
                  ? data.roles.map(role => formatRole(role)).join(', ')
                  : 'N/A'
                }}
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

              <td class="px-6 py-1 md:py-2 lg:py-3 text-right text-sm font-medium relative">
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

                  <button @click="viewUser(data)" v-permission="['users.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['users.update', 'users.delete']">
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
                        <button @click="editUser(data); data.showDropdown = false" v-permission="['users.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <button @click="confirmDelete(data); data.showDropdown = false" v-permission="['users.delete']"
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

    <div v-if="userStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="userStore.totalItems > 0" :total-items="userStore.totalItems" :per-page="userStore.perPage"
        :current-page="userStore.currentPage" :last-page="userStore.lastPage" :is-loading="userStore.isLoading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen" :title="modalMode === 'create' ? 'Create User' : 'Edit User'"
    maxWidth="4xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <!-- Profile Image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Image</label>
          <div class="flex items-center space-x-4">
            <div v-if="previewImage" class="relative">
              <img :src="previewImage" alt="Profile Preview"
                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
              <button @click="removeImage" type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div v-else-if="currentUser?.image" class="relative">
              <img :src="currentUser.image" :alt="currentUser.name"
                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
              <button @click="removeImage" type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div>
              <label for="user-profile-image"
                class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors inline-flex items-center">
                <i class="fas fa-upload mr-2"></i>
                {{ currentUser?.image || previewImage ? 'Change Image' : 'Upload Image' }}
              </label>
              <input id="user-profile-image" type="file" accept="image/*" @change="handleImageUpload" class="hidden">
            </div>
          </div>
          <p v-if="userStore.validationErrors.image" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ userStore.validationErrors.image[0] }}
          </p>
        </div>

        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.name" type="text" placeholder="Enter full name"
            @change="clearValidationError('name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': userStore.validationErrors.name }">
          <p v-if="userStore.validationErrors.name" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ userStore.validationErrors.name[0] }}
          </p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.email" type="email" placeholder="Enter email address"
            @change="clearValidationError('email')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': userStore.validationErrors.email }">
          <p v-if="userStore.validationErrors.email" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ userStore.validationErrors.email[0] }}
          </p>
        </div>

        <!-- Role (Single Selection) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <select v-model="formData.role" @change="clearValidationError('role')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': userStore.validationErrors.role }">
            <option value="">Select a role</option>
            <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.name }}</option>
          </select>
          <p v-if="userStore.validationErrors.role" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ userStore.validationErrors.role[0] }}
          </p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input v-model="formData.phone" type="text" placeholder="Enter phone number"
            @change="clearValidationError('phone')" @input="handlePhoneInput('phone', $event)"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': userStore.validationErrors.phone }">
          <p v-if="userStore.validationErrors.phone" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ userStore.validationErrors.phone[0] }}
          </p>
        </div>

        <!-- Mobile -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
          <input v-model="formData.mobile" type="text" placeholder="Enter mobile number"
            @change="clearValidationError('mobile')" @input="handlePhoneInput('mobile', $event)"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': userStore.validationErrors.mobile }">
          <p v-if="userStore.validationErrors.mobile" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ userStore.validationErrors.mobile[0] }}
          </p>
        </div>


        <!-- Address -->
        <div class="col-span-2 2xl:col-span-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
          <textarea v-model="formData.address" rows="3" placeholder="Enter address"
            @change="clearValidationError('address')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': userStore.validationErrors.address }"></textarea>
          <p v-if="userStore.validationErrors.address" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ userStore.validationErrors.address[0] }}
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
          <p v-if="userStore.validationErrors.status" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ userStore.validationErrors.status[0] }}
          </p>
        </div>

        <!-- Password Fields (Only for create or if password reset needed) -->
        <div v-if="modalMode === 'create' || showPasswordFields" class="col-span-1 md:col-span-2 2xl:col-span-3">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {{ modalMode === 'create' ? 'Login Information' : 'Reset Password' }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password {{ modalMode === 'create' ? '*' : '' }}
              </label>
              <div class="relative">
                <input v-model="formData.password" :type="showPassword ? 'text' : 'password'"
                  @change="clearValidationError('password')"
                  class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white pr-10"
                  :class="{ 'border-red-500': userStore.validationErrors.password }"
                  :placeholder="modalMode === 'create' ? 'Enter password' : 'Leave blank to keep current password'">
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <p v-if="userStore.validationErrors.password" class="text-xs text-red-600 dark:text-red-400 mt-1">
                {{ userStore.validationErrors.password[0] }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password {{ modalMode === 'create' ? '*' : '' }}
              </label>
              <div class="relative">
                <input v-model="formData.password_confirmation" :type="showConfirmPassword ? 'text' : 'password'"
                  @change="clearValidationError('password_confirmation')"
                  class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white pr-10"
                  :class="{ 'border-red-500': userStore.validationErrors.password_confirmation }"
                  placeholder="Confirm password">
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <p v-if="userStore.validationErrors.password_confirmation"
                class="text-xs text-red-600 dark:text-red-400 mt-1">
                {{ userStore.validationErrors.password_confirmation[0] }}
              </p>
            </div>
          </div>
          <button v-if="modalMode === 'edit' && !showPasswordFields" type="button" @click="showPasswordFields = true"
            class="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
            <i class="fas fa-key mr-1"></i> Reset Password
          </button>
        </div>

        <!-- Global Form Errors -->
        <div v-if="Object.keys(userStore.validationErrors).length > 0"
          class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg col-span-1 md:col-span-2 2xl:col-span-3">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in userStore.validationErrors" :key="field">
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
          <button type="submit" :disabled="userStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            userStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="userStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>{{ modalMode === 'create' ? 'Create User' : 'Update User' }}</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingUser" :show="showViewModal" maxWidth="xl" title="User Details" @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="text-center mb-6">
        <div v-if="viewingUser.image" class="mb-4">
          <img :src="viewingUser.image" :alt="viewingUser.name"
            class="h-32 w-32 rounded-lg mx-auto object-cover border border-gray-200 dark:border-gray-700">
        </div>
        <div v-else
          class="h-32 w-32 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-user text-gray-400 text-3xl"></i>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ viewingUser.name }} </h2>
        <p class="text-gray-600 dark:text-gray-400">{{ viewingUser.email || 'No email provided' }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</label>
          <p class="text-sm text-gray-900 dark:text-white">{{ viewingUser.phone || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mobile</label>
          <p class="text-sm text-gray-900 dark:text-white">{{ viewingUser.mobile || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Address</label>
          <p class="text-sm text-gray-900 dark:text-white">{{ viewingUser.address || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</label>
          <p class="text-sm text-gray-900 dark:text-white">{{viewingUser.roles ? viewingUser.roles.map((role) =>
            role).join(', ') || 'N/A' : 'N/A'}}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
          <div class="mt-1">
            <span :class="[
              'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
              viewingUser.status === 1 || viewingUser.status === true
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            ]">
              {{ viewingUser.status === 1 || viewingUser.status === true ? 'Active' : 'Inactive' }}
            </span>
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
      <button @click="editUser(viewingUser)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit User
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete User" maxWidth="lg" :showClose="false" @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete User</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{{ deletingUser?.name }}</strong>? This action cannot be
          undone.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="userStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          userStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="userStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete User</span>
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
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Change User Status</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to change the status of
          <strong>{{ statusChangingUser?.name || statusChangingUser?.code || 'this item' }}</strong>
          to
          <strong>
            <span :class="[
              statusChangingUser?.status === 1 || statusChangingUser?.status === true
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            ]">
              {{ statusChangingUser?.status === 1 || statusChangingUser?.status === true ? 'Inactive' : 'Active' }}
            </span>
          </strong>?
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeStatusChangeModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="confirmStatusChange" :disabled="userStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          userStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
        ]">
          <span v-if="userStore.loading">
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
import { useUserStore } from '@/stores/userStore';
import { useRoleStore } from '@/stores/roleStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';

const refresh = ref(false);

const tableColumns = ref([{
  "key": "name",
  "label": "Name",
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
  "key": "roles",
  "label": "Roles",
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
const userStore = useUserStore();
const roleStore = useRoleStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showStatusChangeModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

// Password visibility
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showPasswordFields = ref(false);

// Form data
const formData = ref({
  name: '',
  email: '',
  role: '',
  address: '',
  phone: '',
  mobile: '',
  password: '',
  password_confirmation: '',
  status: 1,
  image: null
});

const currentUser = ref(null);
const viewingUser = ref(null);
const deletingUser = ref(null);
const statusChangingUser = ref(null);
const modalMode = ref('create');
const previewImage = ref(null);

const loadingDropdowns = ref(false);

const displayedItems = computed(() => {
  return userStore.items || [];
});

const roles = computed(() => {
  const roleData = roleStore.items || [];
  return roleData;
});


const calculateRowNumber = (index) => {
  if (userStore.pagination?.from && userStore.pagination.from > 0) {
    return userStore.pagination.from + index;
  }
  return (userStore.pagination.current_page - 1) * userStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (userStore.validationErrors[fieldName]) {
    const updatedErrors = { ...userStore.validationErrors };
    delete updatedErrors[fieldName];
    userStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  userStore.validationErrors = {};
};

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await userStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  userStore.search('');
};


onMounted(async () => {
  getData();
  loadRelatedData();
});

const getData = async () => {
  await userStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    clearSearch();
  } finally {
    refresh.value = false;
  }
}

const loadRelatedData = async () => {
  try {
    loadingDropdowns.value = true;

    await Promise.all([
      roleStore.getAll()
    ]);

  } catch (error) {
    console.error('Error loading related data:', error);
  } finally {
    loadingDropdowns.value = false;
  }
};

// Modal functions
const openCreateModal = async () => {
  if (roles.value.length === 0) {
    await loadRelatedData();
  }

  resetForm();
  modalMode.value = 'create';
  showPasswordFields.value = true;
  isModalOpen.value = true;
  clearAllValidationErrors();
};

const editUser = async (user) => {
  // Ensure dropdown data is loaded before opening modal
  if (roles.value.length === 0) {
    await loadRelatedData();
  }

  currentUser.value = user;
  modalMode.value = 'edit';

  // Get user's role name (assuming user has a role field or roles array)
  let userRole = '';
  if (user.roles && user.roles.length > 0) {
    userRole = user.roles[0]?.name || user.roles[0];
  }

  formData.value = {
    name: user.name || '',
    email: user.email || '',
    role: userRole,
    address: user.address || '',
    phone: user.phone || '',
    mobile: user.mobile || '',
    password: '',
    password_confirmation: '',
    status: user.status === 1 || user.status === true ? 1 : 0,
    image: null
  };

  previewImage.value = user.image || null;
  showPasswordFields.value = true; // Don't show password fields by default
  isModalOpen.value = true;
  clearAllValidationErrors();

};

const viewUser = (user) => {
  viewingUser.value = user;
  showViewModal.value = true;
};

const confirmDelete = (user) => {
  deletingUser.value = user;
  showDeleteModal.value = true;
};

const toggleStatus = (user) => {
  statusChangingUser.value = user;
  showStatusChangeModal.value = true;
};


const closeModal = () => {
  isModalOpen.value = false;
  resetForm();
  clearAllValidationErrors();
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingUser.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingUser.value = null;
};

const closeStatusChangeModal = () => {
  showStatusChangeModal.value = false;
  statusChangingUser.value = null;
};

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    role: '',
    address: '',
    phone: '',
    mobile: '',
    password: '',
    password_confirmation: '',
    status: 1,
    image: null
  };
  currentUser.value = null;
  previewImage.value = null;
  showPasswordFields.value = false;
  showPassword.value = false;
  showConfirmPassword.value = false;
};

// Image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  formData.value.image = file;
  previewImage.value = URL.createObjectURL(file);
};

const removeImage = () => {
  formData.value.image = null;
  previewImage.value = null;
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

    if (key === 'image' && value instanceof File) {
      formDataToSend.append(key, value);
    } else {
      formDataToSend.append(key, value);
    }
  }

  let result;
  if (modalMode.value === 'create') {
    result = await userStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await userStore.update(currentUser.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingUser.value) {
    const result = await userStore.deleteItem(deletingUser.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

const confirmStatusChange = async () => {
  if (statusChangingUser.value) {
    try {
      const field = 'status';
      await userStore.toggleStatus(statusChangingUser.value, field);
      closeStatusChangeModal();
      getData();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await userStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await userStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = userStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await userStore.sort(column, order);
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

  // Store as STRING (recommended)
  formData.value[fieldName] = value;
};

function formatRole(text) {
  return text
    .replace(/[_-]/g, ' ')           // underscore বা dash কে space বানাবে
    .replace(/\b\w/g, char => char.toUpperCase()); // প্রতিটা word এর প্রথম অক্ষর বড় করবে
}
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>