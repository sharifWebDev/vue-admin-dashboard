<template>
  <div class="px-0">
    <!-- Breadcrumb and Header -->
    <div class="mb-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
            Account Settings
          </h1>
        </div>
        <Breadcrumb />
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
      <!-- Header with Subscribe Button -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <router-link to="/#packages" 
            class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
            <i class="fas fa-plus"></i>
            <span>Subscribe to New Plan</span>
          </router-link>
        </div>

        <!-- Refresh Button -->
        <div class="flex items-center gap-3 w-full lg:w-auto">
          <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg px-1.5 py-1.5 flex-shrink-0">
            <button @click="loadSettings" title="Refresh Data"
              class="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              :disabled="loading">
              <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': loading }"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <TableLoadingState 
        v-if="loading" 
        :is-loading="true" 
        :total-items="0"
        :item-name="'settings'" 
        loading-text="Loading settings..." 
        loading-subtext="Fetching your account preferences" 
      />

      <!-- Settings Content -->
      <div v-else class="space-y-6">
        <!-- Notification Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h5 class="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h5>
          </div>
          <div class="p-5">
            <form @submit.prevent="saveNotificationSettings">
              <!-- Email Notifications -->
              <div class="mb-4">
                <label class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" v-model="notificationSettings.email_notifications" class="sr-only" />
                    <div class="toggle-bg w-10 h-6 bg-gray-200 rounded-full shadow-inner"
                         :class="{ 'bg-blue-600': notificationSettings.email_notifications }"></div>
                    <div class="toggle-dot absolute w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                         :class="{ 'transform translate-x-4': notificationSettings.email_notifications }"
                         style="top: 1px; left: 1px;"></div>
                  </div>
                  <div class="ml-3">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Receive email updates about your account</p>
                  </div>
                </label>
              </div>

              <!-- Invoice Notifications -->
              <div class="mb-4">
                <label class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" v-model="notificationSettings.invoice_notifications" class="sr-only" />
                    <div class="toggle-bg w-10 h-6 bg-gray-200 rounded-full shadow-inner"
                         :class="{ 'bg-blue-600': notificationSettings.invoice_notifications }"></div>
                    <div class="toggle-dot absolute w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                         :class="{ 'transform translate-x-4': notificationSettings.invoice_notifications }"
                         style="top: 1px; left: 1px;"></div>
                  </div>
                  <div class="ml-3">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Notifications</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Receive email when new invoices are generated</p>
                  </div>
                </label>
              </div>

              <!-- Payment Notifications -->
              <div class="mb-4">
                <label class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" v-model="notificationSettings.payment_notifications" class="sr-only" />
                    <div class="toggle-bg w-10 h-6 bg-gray-200 rounded-full shadow-inner"
                         :class="{ 'bg-blue-600': notificationSettings.payment_notifications }"></div>
                    <div class="toggle-dot absolute w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                         :class="{ 'transform translate-x-4': notificationSettings.payment_notifications }"
                         style="top: 1px; left: 1px;"></div>
                  </div>
                  <div class="ml-3">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Notifications</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Receive email about payment status</p>
                  </div>
                </label>
              </div>

              <!-- Marketing Emails -->
              <div class="mb-6">
                <label class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" v-model="notificationSettings.marketing_emails" class="sr-only" />
                    <div class="toggle-bg w-10 h-6 bg-gray-200 rounded-full shadow-inner"
                         :class="{ 'bg-blue-600': notificationSettings.marketing_emails }"></div>
                    <div class="toggle-dot absolute w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ease-in-out"
                         :class="{ 'transform translate-x-4': notificationSettings.marketing_emails }"
                         style="top: 1px; left: 1px;"></div>
                  </div>
                  <div class="ml-3">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Marketing Emails</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Receive updates about new features and offers</p>
                  </div>
                </label>
              </div>

              <button type="submit" :disabled="notificationSaving" :class="[
                'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors inline-flex items-center',
                notificationSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
              ]">
                <span v-if="notificationSaving">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </span>
                <span v-else>
                  <i class="fas fa-save mr-2"></i>
                  Save Preferences
                </span>
              </button>
            </form>
          </div>
        </div>

        <!-- Billing Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h5 class="text-lg font-semibold text-gray-900 dark:text-white">Billing Settings</h5>
          </div>
          <div class="p-5">
            <form @submit.prevent="saveBillingSettings">
              <!-- Preferred Currency -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Currency
                </label>
                <select v-model="billingSettings.preferred_currency"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-700 dark:text-white">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="BDT">BDT (৳)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <!-- Tax ID / VAT Number -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax ID / VAT Number
                </label>
                <input type="text" v-model="billingSettings.tax_id"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your tax ID if applicable">
              </div>

              <!-- Auto-renew -->
              <div class="mb-4">
                <label class="flex items-center">
                  <input type="checkbox" v-model="billingSettings.auto_renew" 
                         class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Auto-renew subscriptions by default
                  </span>
                </label>
              </div>

              <!-- Tax Exempt -->
              <div class="mb-6">
                <label class="flex items-center">
                  <input type="checkbox" v-model="billingSettings.is_tax_exempt" 
                         class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    I am tax exempt
                  </span>
                </label>
              </div>

              <button type="submit" :disabled="billingSaving" :class="[
                'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors inline-flex items-center',
                billingSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
              ]">
                <span v-if="billingSaving">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </span>
                <span v-else>
                  <i class="fas fa-save mr-2"></i>
                  Save Billing Settings
                </span>
              </button>
            </form>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h5 class="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h5>
          </div>
          <div class="p-5">
            <!-- Change Password -->
            <div class="mb-6">
              <h6 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Change Password</h6>
              <form @submit.prevent="changePassword">
                <!-- Current Password -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input type="password" v-model="passwordForm.current_password"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': passwordErrors.current_password }" required>
                  <p v-if="passwordErrors.current_password" class="text-xs text-red-600 dark:text-red-400 mt-1">
                    {{ passwordErrors.current_password }}
                  </p>
                </div>

                <!-- New Password -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input type="password" v-model="passwordForm.new_password"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': passwordErrors.new_password }" required>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 8 characters</p>
                  <p v-if="passwordErrors.new_password" class="text-xs text-red-600 dark:text-red-400 mt-1">
                    {{ passwordErrors.new_password }}
                  </p>
                </div>

                <!-- Confirm New Password -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input type="password" v-model="passwordForm.new_password_confirmation"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': passwordErrors.new_password_confirmation }" required>
                  <p v-if="passwordErrors.new_password_confirmation" class="text-xs text-red-600 dark:text-red-400 mt-1">
                    {{ passwordErrors.new_password_confirmation }}
                  </p>
                </div>

                <button type="submit" :disabled="passwordSaving" :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors inline-flex items-center',
                  passwordSaving ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
                ]">
                  <span v-if="passwordSaving">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Changing...
                  </span>
                  <span v-else>
                    <i class="fas fa-key mr-2"></i>
                    Change Password
                  </span>
                </button>
              </form>
            </div>

            <hr class="border-gray-200 dark:border-gray-700 my-6">

            <!-- Danger Zone -->
            <div>
              <h6 class="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h6>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button @click="showDeleteModal = true" 
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Account" maxWidth="lg" @close="closeDeleteModal">
      <div class="px-6 py-3">
        <div class="text-center mb-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
          </div>
          <h3 class="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Warning: This action cannot be undone!</h3>
        </div>

        <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">Deleting your account will:</p>
        <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
          <li>Cancel all active subscriptions</li>
          <li>Remove all your personal information</li>
          <li>Delete your payment methods</li>
          <li>Remove access to all services</li>
        </ul>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type "DELETE" to confirm
          </label>
          <input type="text" v-model="deleteConfirmText" @input="validateDeleteConfirm"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': deleteConfirmError }" placeholder="DELETE">
          <p v-if="deleteConfirmError" class="text-xs text-red-600 dark:text-red-400 mt-1">
            Please type "DELETE" to confirm
          </p>
        </div>
      </div>
 
        <div class="flex justify-end space-x-3">
          <button @click="closeDeleteModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button @click="deleteAccount" :disabled="deleteSaving || !isDeleteValid" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors inline-flex items-center',
            deleteSaving || !isDeleteValid ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
          ]">
            <span v-if="deleteSaving">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Deleting...
            </span>
            <span v-else>
              <i class="fas fa-trash mr-2"></i>
              Delete Account
            </span>
          </button>
        </div> 
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import BaseModal from '@/components/common/BaseModal.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();

// Loading states
const loading = ref(false);
const notificationSaving = ref(false);
const billingSaving = ref(false);
const passwordSaving = ref(false);
const deleteSaving = ref(false);

// Settings data
const notificationSettings = ref({
  email_notifications: true,
  invoice_notifications: true,
  payment_notifications: true,
  marketing_emails: false
});

const billingSettings = ref({
  preferred_currency: 'USD',
  tax_id: '',
  auto_renew: true,
  is_tax_exempt: false
});

// Password form
const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
});

// Validation errors
const passwordErrors = ref({});

// Delete modal
const showDeleteModal = ref(false);
const deleteConfirmText = ref('');
const deleteConfirmError = ref(false);

// Computed
const isDeleteValid = computed(() => {
  return deleteConfirmText.value === 'DELETE';
});

// Methods
const loadSettings = async () => {
  try {
    loading.value = true;
    const settings = await settingsStore.get();
    
    if (settings) {
      notificationSettings.value = {
        email_notifications: settings.email_notifications ?? true,
        invoice_notifications: settings.invoice_notifications ?? true,
        payment_notifications: settings.payment_notifications ?? true,
        marketing_emails: settings.marketing_emails ?? false
      };
      
      billingSettings.value = {
        preferred_currency: settings.preferred_currency || 'USD',
        tax_id: settings.tax_id || '',
        auto_renew: settings.auto_renew ?? true,
        is_tax_exempt: settings.is_tax_exempt ?? false
      };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    toast.error('Failed to load settings');
  } finally {
    loading.value = false;
  }
};

const saveNotificationSettings = async () => {
  try {
    notificationSaving.value = true;
    await settingsStore.updateNotificationSettings(notificationSettings.value);
    toast.success('Notification preferences saved successfully');
  } catch (error) {
    console.error('Error saving notification settings:', error);
    toast.error('Failed to save notification preferences');
  } finally {
    notificationSaving.value = false;
  }
};

const saveBillingSettings = async () => {
  try {
    billingSaving.value = true;
    await settingsStore.updateBillingSettings(billingSettings.value);
    toast.success('Billing settings saved successfully');
  } catch (error) {
    console.error('Error saving billing settings:', error);
    toast.error('Failed to save billing settings');
  } finally {
    billingSaving.value = false;
  }
};

const changePassword = async () => {
  // Clear previous errors
  passwordErrors.value = {};

  // Validate passwords match
  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
    passwordErrors.value.new_password_confirmation = 'Passwords do not match';
    return;
  }

  // Validate password length
  if (passwordForm.value.new_password.length < 8) {
    passwordErrors.value.new_password = 'Password must be at least 8 characters';
    return;
  }

  try {
    passwordSaving.value = true;
    await settingsStore.changePassword(passwordForm.value);
    
    toast.success('Password changed successfully');
    
    // Reset form
    passwordForm.value = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    };
  } catch (error) {
    console.error('Error changing password:', error);
    if (error.response?.data?.errors) {
      passwordErrors.value = error.response.data.errors;
    } else {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  } finally {
    passwordSaving.value = false;
  }
};

const validateDeleteConfirm = () => {
  deleteConfirmError.value = deleteConfirmText.value !== '' && deleteConfirmText.value !== 'DELETE';
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteConfirmText.value = '';
  deleteConfirmError.value = false;
};

const deleteAccount = async () => {
  if (!isDeleteValid.value) return;

  try {
    deleteSaving.value = true;
    await settingsStore.deleteAccount();
    
    toast.success('Account deleted successfully');
    
    // Logout and redirect to home
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Error deleting account:', error);
    toast.error(error.response?.data?.message || 'Failed to delete account');
  } finally {
    deleteSaving.value = false;
    closeDeleteModal();
  }
};

// Lifecycle
onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
/* Toggle switch styles */
.toggle-bg {
  transition: background-color 0.2s ease;
}

.toggle-dot {
  transition: transform 0.2s ease;
}

/* Form input styles */
input, select {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

/* Animation */
.fa-spin {
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

/* Danger zone */
.text-red-600 {
  color: #dc2626;
}

.bg-red-600 {
  background-color: #dc2626;
}

.bg-red-600:hover {
  background-color: #b91c1c;
}
</style>