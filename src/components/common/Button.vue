<!-- components/common/Button.vue -->
<template>
    <button :type="type" :disabled="disabled || loading" :class="buttonClasses" @click="$emit('click')">
        <!-- Loading Spinner -->
        <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin"
            :class="text === false || computedText === '' ? 'mr-0' : 'mr-1'" />

        <!-- Regular Icon (when not loading) -->
        <component v-else-if="showIcon && computedIcon" :is="computedIcon" class="h-4 w-4"
            :class="text === false || computedText === '' ? 'mr-0' : 'mr-1'" />

        <slot>
            <span v-if="text !== false && computedText !== ''">{{ computedText }}</span>
        </slot>
    </button>
</template>

<script setup>
import { computed } from "vue";
import {
    LoaderCircle,
    Save,
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    RefreshCcw,
    Eye
} from "lucide-vue-next";

// শুধুমাত্র আপনার সিলেক্টেড আইকনগুলো রাখা হয়েছে
const LucideIcons = {
    LoaderCircle,
    Save,
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    RefreshCcw,
    Eye
};

const props = defineProps({
    type: {
        type: String,
        default: "button"
    },
    // create, edit, delete, update, view, refresh, cancel
    btnType: {
        type: String,
        default: null
    },
    text: {
        type: [String, Boolean],
        default: null
    },
    variant: {
        type: String,
        default: null
    },
    size: {
        type: String,
        default: "md"
    },
    // 🔴 ফিক্স: String টাইপ যুক্ত করা হয়েছে যাতে 'save', 'plus' ইত্যাদি পাস করলে চিলতে পারে
    icon: {
        type: [String, Object, Function, Boolean],
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    customClass: {
        type: String,
        default: ""
    },
    hideIcon: {
        type: Boolean,
        default: false
    }
});

defineEmits(["click"]);

// btnType অনুযায়ী কনফিগারেশন ম্যাপিং
const btnTypeConfig = {
    create: { text: "Create", icon: LucideIcons.Plus, variant: "primary" },
    edit: { text: "Edit", icon: LucideIcons.Edit, variant: "warning" },
    update: { text: "Update", icon: LucideIcons.Save, variant: "success" },
    delete: { text: "Delete", icon: LucideIcons.Trash2, variant: "danger" },
    view: { text: "View", icon: LucideIcons.Eye, variant: "secondary" },
    refresh: { text: "Refresh", icon: LucideIcons.RefreshCcw, variant: "primary" },
    cancel: { text: "Cancel", icon: LucideIcons.X, variant: "danger" }
};

// অটোমেটিক টেক্সট ডিটারমাইন করার জন্য
const computedText = computed(() => {
    if (props.text !== null && props.text !== '') return props.text; // ফিক্স: খালি স্ট্রিং চেক
    if (props.btnType && btnTypeConfig[props.btnType]) {
        return btnTypeConfig[props.btnType].text;
    }
    return ""; // ফিক্স: default "Button" তুলে দিয়ে খালি করা হয়েছে যাতে টেক্সট ছাড়া শুধু আইকন বাটন বানানো যায়
});

// অটোমেটিক আইকন ডিটারমাইন করার জন্য
const computedIcon = computed(() => {
    // ১. ইউজার সরাসরি আইকন অবজেক্ট/ফাংশন পাস করলে
    if (props.icon && typeof props.icon !== 'string' && props.icon !== true) return props.icon;

    // ২. 🔴 ফিক্স: ইউজার যদি স্ট্রিং পাস করে (যেমন: 'save' বা 'edit')
    if (typeof props.icon === 'string' && props.icon !== '') {
        const key = props.icon.charAt(0).toUpperCase() + props.icon.slice(1); // 'save' -> 'Save'
        if (LucideIcons[key]) return LucideIcons[key];
    }

    // ৩. btnType অনুযায়ী অটো আইকন
    if (props.btnType && btnTypeConfig[props.btnType]) {
        return btnTypeConfig[props.btnType].icon;
    }
    return null;
});

// আইকন দেখাবে কি না
const showIcon = computed(() => {
    if (props.hideIcon || props.icon === false) return false;
    return !!computedIcon.value;
});

// ক্লাস জেনারেট করার জন্য
const buttonClasses = computed(() => {
    const variantClasses = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-gray-600 hover:bg-gray-700 text-white",
        success: "bg-green-600 hover:bg-green-700 text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
        outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
        ghost: "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
        link: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline-offset-2 hover:underline"
    };

    const sizeClasses = {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        xl: "px-8 py-4 text-lg"
    };

    // 🔴 ফিক্স: প্রপ ভ্যারিয়েন্ট খালি স্ট্রিং হলে যেন ফলব্যাক কাজ করে
    const activeVariant = (props.variant && props.variant !== '')
        ? props.variant
        : (props.btnType && btnTypeConfig[props.btnType]?.variant) || "primary";

    return [
        "rounded-lg transition-all duration-200 flex items-center justify-center font-medium gap-1", // gap-1 অ্যাড করা হয়েছে আইকন ও টেক্সটের দূরত্বের জন্য
        variantClasses[activeVariant] || variantClasses.primary,
        sizeClasses[props.size] || sizeClasses.md,
        props.disabled || props.loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-md active:scale-[0.98]",
        props.customClass
    ];
});
</script>
<!-- 
 
<Button btn-type="create" />
 
<Button btn-type="edit" />
 
<Button btn-type="update" />
 
<Button btn-type="delete" />
 
<Button btn-type="view" />
 
<Button btn-type="delete" text="Remove Item" />
 
<Button btn-type="delete" :loading="true" />
<Button
    type="submit"
    :text="submitText || (mode === 'create' ? 'Create' : 'Update')"
    :icon="submitIcon"
    :loading="loading"
    :disabled="loading"
    variant="primary"
/>
 
<Button 
  text="Save" 
  icon="save" 
  variant="primary" 
  @click="saveData"
/>
 
<Button 
  text="Export" 
  :icon="FileSpreadsheet" 
  variant="success" 
  @click="exportData"
/>
<Button icon="create" variant="primary">
    Create
</Button>
<Button icon="edit" variant="warning">
    Edit
</Button>
<Button text="Save" icon="save" :loading="isLoading" variant="primary" @click="handleSubmit" />

  <Button icon="save" variant="primary">Save</Button>
     
    <Button :icon="false" variant="secondary">Cancel</Button>
     
    <Button icon="check" variant="success">Complete</Button>
     
    <Button :icon="false" variant="danger">Delete</Button>
     
    <Button icon="alert" variant="warning">Warning</Button>
     
    <Button :icon="false" variant="outline">Outline</Button>
  
<Button text="Export PDF" icon="file-pdf" variant="danger" @click="exportPDF" />
<Button text="Export Excel" icon="file-excel" variant="success" @click="exportExcel" />
<Button text="Save" custom-class="w-full md:w-40 px-8" />
 
 
  <Button 
    text="Export Excel" 
    :icon="FileSpreadsheet" 
    variant="success" 
    @click="exportExcel"
  />

  <Button 
    text="Export PDF" 
    :icon="FileText" 
    variant="danger" 
    @click="exportPDF"
  />

  <Button 
    text="Upload" 
    :icon="Upload" 
    variant="primary" 
    @click="uploadFile"
  /> 

<Button :text="isEditing ? 'Update' : 'Create'" :icon="isEditing ? 'edit' : 'create'" variant="primary"
    @click="handleClick" />

<Button text="Toggle Icon" :icon="iconVisible ? 'eye' : false" variant="outline"
    @click="iconVisible = !iconVisible" />
-->