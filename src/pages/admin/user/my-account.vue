<template>
  <div class="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
    <!-- Page Header -->
    <div class="mb-4 sm:mb-6">
      <div class="flex flex-wrap gap-3 justify-between items-center">
        <div class="min-w-0">
          <h1 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">My Profile</h1>
        </div>
        <div class="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <button v-if="!isEditing" @click="toggleEditMode"
            class="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white min-h-[40px]">
            <i class="fas fa-pen"></i>
            <span class="hidden sm:inline">Edit Profile</span>
          </button>
          <button @click="refreshData"
            class="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
            :disabled="loading" aria-label="Refresh">
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
    <div v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex items-start sm:items-center">
        <i class="fas fa-exclamation-circle text-red-500 mr-3 mt-0.5 sm:mt-0 flex-shrink-0"></i>
        <div class="min-w-0">
          <p class="text-red-700 dark:text-red-400 font-medium">Failed to load profile data</p>
          <p class="text-red-600 dark:text-red-300 text-sm mt-1 break-words">{{ error }}</p>
          <button @click="fetchUserProfile"
            class="mt-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/50">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <!-- Profile Summary Card (Left Side) -->
      <div class="lg:col-span-1">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden lg:sticky lg:top-4">
          <!-- Profile Header with Cover -->
          <div class="h-16 sm:h-20 bg-gray-200 dark:bg-gray-700"></div>

          <!-- Profile Image -->
          <div class="px-4 sm:px-6 pb-5 sm:pb-6">
            <div class="flex justify-center -mt-10 sm:-mt-12 mb-4">
              <div class="relative group">
                <div v-if="previewImage || userData?.image" class="relative">
                  <img :src="previewImage || userData?.image" :alt="userData?.name"
                    class="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg" />
                  <button v-if="isEditing" @click="triggerImageUpload" type="button"
                    class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg"
                    aria-label="Change profile picture">
                    <i class="fas fa-camera text-xs"></i>
                  </button>
                </div>
                <div v-else class="relative">
                  <div
                    class="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                    <i class="fas fa-user text-gray-400 text-2xl sm:text-3xl"></i>
                  </div>
                  <button v-if="isEditing" @click="triggerImageUpload" type="button"
                    class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg"
                    aria-label="Upload profile picture">
                    <i class="fas fa-camera text-xs"></i>
                  </button>
                </div>
                <input ref="imageInput" type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
              </div>
            </div>

            <div class="text-center">
              <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">
                {{ userData?.name || 'N/A' }}
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 break-words mt-1">
                {{ userData?.email || 'No email provided' }}
              </p>
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
            <div class="mt-5 sm:mt-6 space-y-3">
              <div v-if="userData?.company" class="flex items-start text-sm">
                <i class="fas fa-building w-5 text-gray-400 mt-0.5 flex-shrink-0"></i>
                <span class="ml-3 text-gray-700 dark:text-gray-300 break-words min-w-0">
                  {{ userData?.company?.name || 'N/A' }}
                </span>
              </div>
              <div v-if="userData?.branch" class="flex items-start text-sm">
                <i class="fas fa-code-branch w-5 text-gray-400 mt-0.5 flex-shrink-0"></i>
                <span class="ml-3 text-gray-700 dark:text-gray-300 break-words min-w-0">
                  {{ userData?.branch?.name || 'N/A' }}
                </span>
              </div>
              <div v-if="userData?.roles" class="flex items-start text-sm">
                <i class="fas fa-tag w-5 text-gray-400 mt-0.5 flex-shrink-0"></i>
                <span class="ml-3 text-gray-700 dark:text-gray-300 break-words min-w-0">
                  {{userData?.roles ? userData.roles.map((role) => formatRole(role)).join(', ') : 'N/A'}}
                </span>
              </div>
              <div v-if="userData?.created_at" class="flex items-start text-sm">
                <i class="fas fa-calendar-alt w-5 text-gray-400 mt-0.5 flex-shrink-0"></i>
                <span class="ml-3 text-gray-700 dark:text-gray-300 break-words min-w-0">
                  Joined: {{ formatDate(userData?.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Edit Form (Right Side) -->
      <div class="lg:col-span-2">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {{ isEditing ? 'Edit Profile Information' : 'Profile Information' }}
            </h2>
          </div>

          <GlobalForm :mode="isEditing ? 'edit' : 'view'" :loading="saving" :show-actions="isEditing"
            submit-text="Save Changes" loading-text="Saving..." submit-icon="save" @submit="handleSubmit"
            @cancel="cancelEditing">
            <div class="p-4 sm:p-6">
              <GlobalFormSection :columns="2">
                <!-- Name -->
                <TextInput v-model="formData.name" label="Name" placeholder="Enter full name" required
                  :disabled="!isEditing" :error="validationErrors.name" @change="clearValidationError('name')" />

                <!-- Email -->
                <TextInput v-model="formData.email" label="Email" type="email" placeholder="Enter email address"
                  required :disabled="!isEditing" :error="validationErrors.email"
                  @change="clearValidationError('email')" />

                <!-- Phone & Mobile in Grid -->
                <TextInput v-model="formData.phone" label="Phone" placeholder="Enter phone number"
                  :disabled="!isEditing" :error="validationErrors.phone" @change="handlePhoneInput('phone', $event)" />

                <TextInput v-model="formData.mobile" label="Mobile" placeholder="Enter mobile number"
                  :disabled="!isEditing" :error="validationErrors.mobile"
                  @change="handlePhoneInput('mobile', $event)" />

                <!-- Address -->
                <div class="col-span-1 md:col-span-2">
                  <TextAreaInput v-model="formData.address" label="Address" placeholder="Enter address" :rows="3"
                    :disabled="!isEditing" :error="validationErrors.address"
                    @change="clearValidationError('address')" />
                </div>

                <!-- Read-only Company and Branch Info -->
                <TextInput v-if="!isEditing && userData?.branch?.id && userData?.company?.id"
                  :model-value="userData?.company?.name || 'N/A'" label="Company" disabled />
                <TextInput v-if="!isEditing && userData?.branch?.id && userData?.company?.id"
                  :model-value="userData?.branch?.name || 'N/A'" label="Branch" disabled />

                <!-- Read-only Role Info -->
                <TextInput v-if="!isEditing" :model-value="userData?.roles ? userData.roles.map((role) => formatRole(role)).join(', ') : 'N/A'
                  " label="Role" disabled />
              </GlobalFormSection>

              <!-- Password Change Section (Only when editing) -->
              <div v-if="isEditing" class="border-t border-gray-200 dark:border-gray-700 pt-5 sm:pt-6 mt-2">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h3 class="text-sm sm:text-md font-medium text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                  <button type="button" @click="showPasswordFields = !showPasswordFields"
                    class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-left sm:text-right self-start sm:self-auto">
                    <i :class="showPasswordFields ? 'fas fa-minus' : 'fas fa-plus'" class="mr-1"></i>
                    {{ showPasswordFields ? 'Hide Password Fields' : 'Change Password' }}
                  </button>
                </div>

                <div v-if="showPasswordFields" class="space-y-4">
                  <!-- New Password -->
                  <div class="relative">
                    <TextInput v-model="formData.password" label="New Password"
                      :type="showPassword ? 'text' : 'password'" placeholder="Enter new password"
                      :error="validationErrors.password" class="pr-0" @change="clearValidationError('password')" />
                    <button type="button" @click="showPassword = !showPassword"
                      class="absolute right-2 top-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5"
                      :aria-label="showPassword ? 'Hide password' : 'Show password'">
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>

                  <!-- Confirm Password -->
                  <div class="relative">
                    <TextInput v-model="formData.password_confirmation" label="Confirm Password"
                      :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirm new password"
                      :error="validationErrors.password_confirmation" class="pr-0"
                      @change="clearValidationError('password_confirmation')" />
                    <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute right-2 top-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5"
                      :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'">
                      <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Global Form Errors -->
              <div v-if="Object.keys(validationErrors).length > 0 && !isEditingRelatedError()"
                class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                  Please fix the following errors:
                </p>
                <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
                  <li v-for="(errors, field) in validationErrors" :key="field" class="break-words">
                    • {{ errors[0] }}
                  </li>
                </ul>
              </div>
            </div>
          </GlobalForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axiosClient from '@/axiosClient';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';
import TextInput from '@/components/common/TextInput.vue';
import TextAreaInput from '@/components/common/TextAreaInput.vue';
import GlobalForm from '@/components/common/GlobalForm.vue';
import GlobalFormSection from '@/components/common/GlobalFormSection.vue';

const route = useRoute();
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
  image: null,
});

// Methods
const fetchUserProfile = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await axiosClient.get(`/user`);

    if (response.data.success) {
      userData.value = response.data.data;

      formData.value = {
        name: userData.value.name || '',
        email: userData.value.email || '',
        phone: userData.value.phone || '',
        mobile: userData.value.mobile || '',
        address: userData.value.address || '',
        password: '',
        password_confirmation: '',
        image: null,
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
      image: null,
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

  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return;
  }

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
  const editableFields = [
    'name',
    'email',
    'phone',
    'mobile',
    'address',
    'password',
    'password_confirmation',
    'image',
  ];
  const errors = Object.keys(validationErrors.value);
  return errors.every((field) => editableFields.includes(field));
};

const handlePhoneInput = (field, value) => {
  let sanitizedValue = String(value || '').replace(/[^0-9+]/g, '');

  if (sanitizedValue.includes('+')) {
    sanitizedValue = `+${sanitizedValue.replace(/\+/g, '')}`;
  }

  formData.value[field] = sanitizedValue.slice(0, 15);
  clearValidationError(field);
};

const handleSubmit = async () => {
  if (!isEditing.value) return;

  try {
    saving.value = true;
    validationErrors.value = {};

    const formDataToSend = new FormData();

    formDataToSend.append('name', formData.value.name);
    formDataToSend.append('email', formData.value.email);

    if (formData.value.phone) formDataToSend.append('phone', formData.value.phone);
    if (formData.value.mobile) formDataToSend.append('mobile', formData.value.mobile);
    if (formData.value.address) formDataToSend.append('address', formData.value.address);

    if (formData.value.password) {
      formDataToSend.append('password', formData.value.password);
      formDataToSend.append('password_confirmation', formData.value.password_confirmation);
    }

    if (formData.value.image instanceof File) {
      formDataToSend.append('image', formData.value.image);
    }

    formDataToSend.append('_method', 'PUT');

    const response = await axiosClient.post(`/update-profile`, formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      toast.success('Profile updated successfully');

      userData.value = response.data.data;

      isEditing.value = false;
      showPasswordFields.value = false;
      formData.value.password = '';
      formData.value.password_confirmation = '';

      if (userStore) {
        await userStore.get();
      }
    }
  } catch (err) {
    console.error('Error updating profile:', err);

    if (err.response?.status === 422) {
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
    year: 'numeric',
  });
};

const formatRole = (role) => {
  if (typeof role === 'object' && role.name) {
    return role.name.replace(/[_-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return String(role).replace(/[_-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// Lifecycle
onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
/* Smooth transitions */
button,
input,
textarea {
  transition: all 0.2s ease;
}

/* Custom scrollbar for address textarea */
textarea {
  resize: vertical;
  min-height: 80px;
}

/* Prevent long unbroken strings (emails, IDs) from breaking layout */
.break-words {
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Ensure buttons have adequate touch target on mobile */
@media (max-width: 640px) {
  button {
    min-height: 38px;
  }

  /* Prevent iOS zoom on input focus by enforcing >=16px on small screens
     (only if your TextInput renders native inputs) */
  input,
  textarea,
  select {
    font-size: 16px;
  }
}

/* Sticky card only on large screens (handled by lg:sticky class, but keep
   a fallback if Tailwind's lg:sticky isn't available in your build) */
@media (min-width: 1024px) {
  .lg\:sticky {
    position: sticky;
  }
}
</style>