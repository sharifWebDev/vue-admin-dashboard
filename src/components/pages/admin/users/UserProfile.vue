<template>
  <div class="px-6 py-4">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold text-gray-800 dark:text-white">My Profile</h1> 
        </div>
        <div class="flex items-center space-x-3">
          <button @click="toggleEditMode" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2',
            isEditing
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          ]">
            <i :class="isEditing ? 'fas fa-times' : 'fas fa-pen'"></i>
            <span>{{ isEditing ? 'Cancel Editing' : 'Edit Profile' }}</span>
          </button>
          <button @click="refreshData" class="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700" :disabled="loading">
            <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
        <p class="text-gray-600 dark:text-gray-400">Loading profile data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
        <div>
          <p class="text-red-700 dark:text-red-400 font-medium">Failed to load profile data</p>
          <p class="text-red-600 dark:text-red-300 text-sm mt-1">{{ error }}</p>
          <button @click="fetchUserProfile" class="mt-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/50">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Summary Card (Left Side) -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-4">
          <!-- Profile Header with Cover -->
          <div class="h-20 bg-gray-200 dark:bg-gray-700"></div>
          
          <!-- Profile Image -->
          <div class="px-6 pb-6">
            <div class="flex justify-center -mt-12 mb-4">
              <div class="relative group">
                <div v-if="previewImage || userData?.image" class="relative">
                  <img :src="previewImage || userData?.image" :alt="userData?.name"
                    class="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg">
                  <button v-if="isEditing" @click="triggerImageUpload" type="button"
                    class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg">
                    <i class="fas fa-camera text-xs"></i>
                  </button>
                </div>
                <div v-else class="relative">
                  <div class="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                    <i class="fas fa-user text-gray-400 text-3xl"></i>
                  </div>
                  <button v-if="isEditing" @click="triggerImageUpload" type="button"
                    class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg">
                    <i class="fas fa-camera text-xs"></i>
                  </button>
                </div>
                <input ref="imageInput" type="file" accept="image/*" @change="handleImageUpload" class="hidden">
              </div>
            </div>

            <div class="text-center">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ userData?.name || 'N/A' }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ userData?.email || 'No email provided' }}</p>
              <div class="mt-2">
                <span :class="[
                  'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  userData?.status === 1 || userData?.status === true
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                ]">
                  {{ userData?.status === 1 || userData?.status === true ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <!-- Quick Info -->
            <div class="mt-6 space-y-3">
              <div v-if="userData?.company" class="flex items-center text-sm">
                <i class="fas fa-building w-5 text-gray-400"></i>
                <span class="ml-3 text-gray-700 dark:text-gray-300">{{ userData?.company?.name || 'N/A' }}</span>
              </div>
              <div v-if="userData?.branch" class="flex items-center text-sm">
                <i class="fas fa-code-branch w-5 text-gray-400"></i>
                <span class="ml-3 text-gray-700 dark:text-gray-300">{{ userData?.branch?.name || 'N/A' }}</span>
              </div>
              <div v-if="userData?.roles" class="flex items-center text-sm">
                <i class="fas fa-tag w-5 text-gray-400"></i>
                <span class="ml-3 text-gray-700 dark:text-gray-300">{{ userData?.roles ? userData.roles.map(role => formatRole(role)).join(', ') : 'N/A' }}</span>
              </div>
              <div v-if="userData?.created_at" class="flex items-center text-sm">
                <i class="fas fa-calendar-alt w-5 text-gray-400"></i>
                <span class="ml-3 text-gray-700 dark:text-gray-300">Joined: {{ formatDate(userData?.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Edit Form (Right Side) -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ isEditing ? 'Edit Profile Information' : 'Profile Information' }}
            </h2>
          </div>

          <form @submit.prevent="handleSubmit" class="p-6">
            <div class="space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span class="text-red-500">*</span>
                </label>
                <input v-model="formData.name" type="text" placeholder="Enter full name"
                  :disabled="!isEditing"
                  @change="clearValidationError('name')"
                  class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  :class="{ 
                    'border-red-500': validationErrors.name,
                    'bg-gray-100 dark:bg-gray-600 cursor-not-allowed': !isEditing
                  }">
                <p v-if="validationErrors.name" class="text-xs text-red-600 dark:text-red-400 mt-1">
                  {{ validationErrors.name[0] }}
                </p>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input v-model="formData.email" type="email" placeholder="Enter email address"
                  :disabled="!isEditing"
                  @change="clearValidationError('email')"
                  class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  :class="{ 
                    'border-red-500': validationErrors.email,
                    'bg-gray-100 dark:bg-gray-600 cursor-not-allowed': !isEditing
                  }">
                <p v-if="validationErrors.email" class="text-xs text-red-600 dark:text-red-400 mt-1">
                  {{ validationErrors.email[0] }}
                </p>
              </div>

              <!-- Phone & Mobile in Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Phone -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input v-model="formData.phone" type="text" placeholder="Enter phone number"
                    :disabled="!isEditing"
                    @change="clearValidationError('phone')"
                    @input="handlePhoneInput('phone', $event)"
                    class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 
                      'border-red-500': validationErrors.phone,
                      'bg-gray-100 dark:bg-gray-600 cursor-not-allowed': !isEditing
                    }">
                  <p v-if="validationErrors.phone" class="text-xs text-red-600 dark:text-red-400 mt-1">
                    {{ validationErrors.phone[0] }}
                  </p>
                </div>

                <!-- Mobile -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
                  <input v-model="formData.mobile" type="text" placeholder="Enter mobile number"
                    :disabled="!isEditing"
                    @change="clearValidationError('mobile')"
                    @input="handlePhoneInput('mobile', $event)"
                    class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 
                      'border-red-500': validationErrors.mobile,
                      'bg-gray-100 dark:bg-gray-600 cursor-not-allowed': !isEditing
                    }">
                  <p v-if="validationErrors.mobile" class="text-xs text-red-600 dark:text-red-400 mt-1">
                    {{ validationErrors.mobile[0] }}
                  </p>
                </div>
              </div>

              <!-- Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea v-model="formData.address" rows="3" placeholder="Enter address"
                  :disabled="!isEditing"
                  @change="clearValidationError('address')"
                  class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  :class="{ 
                    'border-red-500': validationErrors.address,
                    'bg-gray-100 dark:bg-gray-600 cursor-not-allowed': !isEditing
                  }"></textarea>
                <p v-if="validationErrors.address" class="text-xs text-red-600 dark:text-red-400 mt-1">
                  {{ validationErrors.address[0] }}
                </p>
              </div>

              <!-- Read-only Company and Branch Info -->
              <div v-if="!isEditing && userData?.branch?.id && userData?.company?.id" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                  <input :value="userData?.company?.name || 'N/A'" type="text" disabled
                    class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                  <input :value="userData?.branch?.name || 'N/A'" type="text" disabled
                    class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed">
                </div>
              </div>

              <!-- Read-only Role Info -->
              <div v-if="!isEditing">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <input :value="userData?.roles ? userData.roles.map(role => formatRole(role)).join(', ') : 'N/A'" type="text" disabled
                  class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed">
              </div>

              <!-- Password Change Section (Only when editing) -->
              <div v-if="isEditing" class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-md font-medium text-gray-900 dark:text-white">Change Password</h3>
                  <button type="button" @click="showPasswordFields = !showPasswordFields"
                    class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <i :class="showPasswordFields ? 'fas fa-minus' : 'fas fa-plus'" class="mr-1"></i>
                    {{ showPasswordFields ? 'Hide Password Fields' : 'Change Password' }}
                  </button>
                </div>

                <div v-if="showPasswordFields" class="space-y-4">
                  <!-- New Password -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <div class="relative">
                      <input v-model="formData.password" :type="showPassword ? 'text' : 'password'"
                        @change="clearValidationError('password')"
                        class="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        :class="{ 'border-red-500': validationErrors.password }"
                        placeholder="Enter new password">
                      <button type="button" @click="showPassword = !showPassword"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                    <p v-if="validationErrors.password" class="text-xs text-red-600 dark:text-red-400 mt-1">
                      {{ validationErrors.password[0] }}
                    </p>
                  </div>

                  <!-- Confirm Password -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                    <div class="relative">
                      <input v-model="formData.password_confirmation" :type="showConfirmPassword ? 'text' : 'password'"
                        @change="clearValidationError('password_confirmation')"
                        class="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        :class="{ 'border-red-500': validationErrors.password_confirmation }"
                        placeholder="Confirm new password">
                      <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                    <p v-if="validationErrors.password_confirmation" class="text-xs text-red-600 dark:text-red-400 mt-1">
                      {{ validationErrors.password_confirmation[0] }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Global Form Errors -->
              <div v-if="Object.keys(validationErrors).length > 0 && !isEditingRelatedError()"
                class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
                <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
                  <li v-for="(errors, field) in validationErrors" :key="field">
                    • {{ errors[0] }}
                  </li>
                </ul>
              </div>

              <!-- Form Actions (Only when editing) -->
              <div v-if="isEditing" class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button type="button" @click="cancelEditing"
                  class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" :disabled="saving" :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                  saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                ]">
                  <span v-if="saving">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </span>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosClient from '@/axiosClient';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';


const route = useRoute();
const router = useRouter();
const toast = useToast();
const userStore = useUserStore(); 

// State
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const userData = ref(null);
const isEditing = ref(false);
const showPasswordFields = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const previewImage = ref(null);
const imageInput = ref(null);
const validationErrors = ref({});


// Form data
const formData = ref({
  name: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  password: '',
  password_confirmation: '',
  image: null
});

// Methods
const fetchUserProfile = async () => {
  try {
    loading.value = true;
    error.value = null;
 
    const response = await axiosClient.get(`/user`);
    
    if (response.data.success) {
      userData.value = response.data.data;
      
      // Initialize form data
      formData.value = {
        name: userData.value.name || '',
        email: userData.value.email || '',
        phone: userData.value.phone || '',
        mobile: userData.value.mobile || '',
        address: userData.value.address || '',
        password: '',
        password_confirmation: '',
        image: null
      };
      
      previewImage.value = userData.value.image || null;
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
    error.value = err.response?.data?.message || err.message || 'Failed to load profile';
    toast.error('Failed to load profile data');
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  fetchUserProfile();
  toast.info('Refreshing profile data...');
};

const toggleEditMode = () => {
  if (isEditing.value) {
    // Cancel editing - reset form data
    resetForm();
  }
  isEditing.value = !isEditing.value;
  showPasswordFields.value = false;
  validationErrors.value = {};
};

const cancelEditing = () => {
  resetForm();
  isEditing.value = false;
  showPasswordFields.value = false;
  validationErrors.value = {};
};

const resetForm = () => {
  if (userData.value) {
    formData.value = {
      name: userData.value.name || '',
      email: userData.value.email || '',
      phone: userData.value.phone || '',
      mobile: userData.value.mobile || '',
      address: userData.value.address || '',
      password: '',
      password_confirmation: '',
      image: null
    };
    previewImage.value = userData.value.image || null;
  }
};

const triggerImageUpload = () => {
  imageInput.value.click();
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return;
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Image size should be less than 2MB');
    return;
  }

  formData.value.image = file;
  previewImage.value = URL.createObjectURL(file);
  clearValidationError('image');
};

const clearValidationError = (field) => {
  if (validationErrors.value[field]) {
    const updated = { ...validationErrors.value };
    delete updated[field];
    validationErrors.value = updated;
  }
};

const isEditingRelatedError = () => {
  // Check if errors are only related to fields that are editable
  const editableFields = ['name', 'email', 'phone', 'mobile', 'address', 'password', 'password_confirmation', 'image'];
  const errors = Object.keys(validationErrors.value);
  return errors.every(field => editableFields.includes(field));
};

const handlePhoneInput = (field, e) => {
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
  formData.value[field] = value;
};

const handleSubmit = async () => {
  try {
    saving.value = true;
    validationErrors.value = {};

    const formDataToSend = new FormData();
    
    // Add basic fields
    formDataToSend.append('name', formData.value.name);
    formDataToSend.append('email', formData.value.email);
    
    if (formData.value.phone) formDataToSend.append('phone', formData.value.phone);
    if (formData.value.mobile) formDataToSend.append('mobile', formData.value.mobile);
    if (formData.value.address) formDataToSend.append('address', formData.value.address);
    
    // Add password if provided
    if (formData.value.password) {
      formDataToSend.append('password', formData.value.password);
      formDataToSend.append('password_confirmation', formData.value.password_confirmation);
    }
    
    // Add image if changed
    if (formData.value.image instanceof File) {
      formDataToSend.append('image', formData.value.image);
    }
    
    // Add method override for PUT
    formDataToSend.append('_method', 'PUT');

    const userId = route.params.id || userData.value?.id;
    const response = await axiosClient.post(`/update-profile`, formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      toast.success('Profile updated successfully');
      
      // Update user data
      userData.value = response.data.data;
      
      // Reset form state
      isEditing.value = false;
      showPasswordFields.value = false;
      formData.value.password = '';
      formData.value.password_confirmation = '';
      
      // Refresh user store if needed
      if (userStore) {
        await userStore.get();
      }
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    
    if (err.response?.status === 422) {
      // Validation errors
      validationErrors.value = err.response.data.errors || {};
      toast.error('Please check the form for errors');
    } else {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  } finally {
    saving.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatRole = (role) => {
  if (typeof role === 'object' && role.name) {
    return role.name
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
  return String(role)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

// Lifecycle
onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.sticky {
  position: sticky;
  top: 1rem;
}

/* Smooth transitions */
button, input, textarea {
  transition: all 0.2s ease;
}

/* Custom scrollbar for address textarea */
textarea {
  resize: vertical;
  min-height: 80px;
}
</style>