<!-- components/common/BaseFileUpload.vue -->
<template>
    <div class="w-full">
        <!-- Label -->
        <label v-if="label" class="block text-sm font-medium mb-1" :class="labelClasses">
            {{ label }}
            <span v-if="required" class="text-red-500 ml-0.5">*</span>
        </label>

        <!-- Main Upload Area -->
        <div @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop" @click="triggerFileInput" :class="[
            'border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
            'hover:border-gray-400 dark:hover:border-gray-500',
            dragOver ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-800/50' : 'border-gray-300 dark:border-gray-700',
            error ? 'border-red-500 dark:border-red-500 hover:border-red-600' : '',
            disabled ? 'cursor-not-allowed opacity-60 pointer-events-none' : ''
        ]">
            <!-- ============ PREVIEW ============ -->
            <div v-if="hasPreview" class="p-1">
                <!-- Multiple Files -->
                <div v-if="multiple && previewFiles.length > 0" class="space-y-3">
                    <div v-for="(file, index) in previewFiles" :key="getFileKey(file, index)"
                        class="flex items-center justify-between p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center space-x-3 min-w-0">
                            <div v-if="isImageItem(file)" class="relative flex-shrink-0">
                                <img :src="resolvePreviewUrl(file)" :alt="getFileName(file)"
                                    class="h-12 w-12 rounded object-cover" />
                            </div>
                            <div v-else
                                class="h-12 w-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                                <i :class="getFileIcon(getFileType(file))" class="text-xl text-gray-400"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{
                                    getFileName(file) }}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(getFileSize(file))
                                    }}</p>
                            </div>
                        </div>
                        <button v-if="!disabled && !readonly" type="button" @click.stop="removeFile(index)"
                            class="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                            title="Remove file">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <button v-if="!disabled && !readonly" type="button" @click.stop="triggerFileInput"
                        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                        <i class="fas fa-plus"></i>
                        <span>Add More Files</span>
                    </button>
                </div>

                <!-- Single File -->
                <div v-else-if="!multiple && singlePreview" class="flex flex-col items-center justify-center space-y-3">
                    <div v-if="singlePreview.isImage" class="relative">
                        <img :src="singlePreview.url" :alt="singlePreview.name || 'Preview'"
                            class="max-h-16 rounded-lg object-contain" />
                        <button v-if="!disabled && !readonly" type="button" @click.stop="clearFiles"
                            class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-1.5 py-0.5 transition-colors shadow-lg"
                            title="Remove image">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>

                    <div v-else
                        class="flex items-center justify-between w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center space-x-3 min-w-0">
                            <div
                                class="h-12 w-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                                <i :class="getFileIcon(singlePreview.type)" class="text-xl text-gray-400"></i>
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{
                                    singlePreview.name }}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">{{
                                    formatFileSize(singlePreview.size) }}</p>
                            </div>
                        </div>
                        <button v-if="!disabled && !readonly" type="button" @click.stop="clearFiles"
                            class="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                            title="Remove file">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- ============ UPLOAD PROMPT ============ -->
            <div v-else class="p-1 sm:p-1 text-center flex flex-row items-center">
                <!-- <button v-if="!disabled && !readonly" type="button" @click.stop="triggerFileInput"
                    class="inline-flex items-center px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-[11px] text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <i class="fas fa-upload mr-1"></i>
                    {{ buttonText }}
                </button> -->
               <div class="flex flex-col items-center mx-auto">
                   <div class="flex gap-2 my-auto items-center">
                       <div
                            class="mx-auto h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                            <i class="fas fa-cloud-upload-alt text-gray-400 text-md"></i>
                        </div>
                        <div>
                            <p class="text-[11px] text-gray-700 dark:text-gray-300">{{ uploadText }}</p>
                            <p class="text-[11px] text-gray-500 dark:text-gray-400 -mt-1">
                                {{ acceptText }}
                                <span v-if="maxSize">(Max: {{ formatFileSize(maxSize) }})</span>
                            </p>
                        </div>
                   </div>
               </div>
            </div>

            <input :id="inputId" ref="fileInput" type="file" :name="name" :accept="accept" :multiple="multiple"
                :disabled="disabled || readonly" @change="onFileChange" class="hidden" />
        </div>

        <!-- Helper Text -->
        <p v-if="helperText && !error" class="text-xs mt-1" :class="helperTextClasses">{{ helperText }}</p>

        <!-- Error -->
        <p v-if="error" class="text-xs mt-1 text-red-600 dark:text-red-400">{{ errorMessage || error }}</p>

        <!-- Count -->
        <div v-if="multiple && modelValue && modelValue.length > 0" class="mt-2">
            <p class="text-xs text-gray-500 dark:text-gray-400">Selected {{ modelValue.length }} file(s)</p>
        </div>
    </div>
</template>

<script setup>
/**
 * ============================================================
 *  BaseFileUpload — Fully Self-Contained
 *  ------------------------------------------------------------
 *  Import korlei ready. Kono extra helper lagbe na.
 *
 *  Features built-in:
 *   - File, Blob, URL string, null — shob support
 *   - Auto blob URL creation + cleanup (no memory leak)
 *   - Image detection (File.type OR URL extension)
 *   - Multiple + single modes
 *   - Drag & drop
 *   - Size + type validation
 *   - FormData helpers (buildFormData / toFormData / hasFile)
 *   - v-model emit (File | URL string | null | Array)
 * ============================================================
 */
import { ref, computed, watch, onUnmounted, getCurrentInstance } from 'vue';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------
const props = defineProps({
    modelValue: { type: [Array, File, Blob, String, null], default: null },
    label: { type: String, default: '' },
    name: { type: String, default: '' },

    accept: { type: String, default: '*/*' },
    multiple: { type: Boolean, default: false },
    maxSize: { type: Number, default: null },
    maxFiles: { type: Number, default: null },

    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    error: { type: [Boolean, String], default: false },
    errorMessage: { type: String, default: '' },
    helperText: { type: String, default: '' },

    uploadText: { type: String, default: 'Drag & drop files here or click to browse' },
    buttonText: { type: String, default: 'Browse Files' },
    acceptText: { type: String, default: '' },
    labelClasses: { type: String, default: '' },
    helperTextClasses: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'change', 'upload', 'remove', 'error', 'clear']);

// ------------------------------------------------------------
// Refs
// ------------------------------------------------------------
const fileInput = ref(null);
const dragOver = ref(false);

/** All blob URLs created by this component — revoked on change/unmount. */
const blobUrls = new Set();

/** Multiple-mode list (File | Blob | URL string). */
const previewFiles = ref([]);

/** Single-mode preview object: { url, name, size, type, isImage }. */
const singlePreview = ref(null);

// ------------------------------------------------------------
// Type helpers (all image/url logic lives here)
// ------------------------------------------------------------
const isFileObject = (v) => v instanceof File || v instanceof Blob;
const isStringUrl = (v) => typeof v === 'string' && v.length > 0;

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|bmp|avif|ico|tiff?)$/i;

const isImageItem = (item) => {
    if (!item) return false;
    if (isFileObject(item)) return (item.type || '').startsWith('image/');
    if (isStringUrl(item)) {
        const clean = item.split('?')[0].split('#')[0];
        return IMAGE_EXT_RE.test(clean);
    }
    return false;
};

const getFileName = (item) => {
    if (!item) return '';
    if (isFileObject(item)) return item.name || 'file';
    try {
        return decodeURIComponent(item.split('/').pop()?.split('?')[0] || item);
    } catch {
        return item;
    }
};

const getFileSize = (item) => (isFileObject(item) ? item.size : 0);
const getFileType = (item) => (isFileObject(item) ? item.type : '');

const getFileKey = (item, index) =>
    isFileObject(item)
        ? `${item.name}-${item.size}-${item.lastModified || 0}-${index}`
        : `${item}-${index}`;

/** Returns a renderable URL for File/Blob/String and tracks blob URLs for cleanup. */
const resolvePreviewUrl = (item) => {
    if (!item) return '';
    if (isStringUrl(item)) return item;
    if (isFileObject(item) && isImageItem(item)) {
        const url = URL.createObjectURL(item);
        blobUrls.add(url);
        return url;
    }
    return '';
};

const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileIcon = (mimeType) => {
    if (!mimeType) return 'fas fa-file';
    const map = {
        'application/pdf': 'fas fa-file-pdf',
        'application/msword': 'fas fa-file-word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
        'application/vnd.ms-excel': 'fas fa-file-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel',
        'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint',
        'text/plain': 'fas fa-file-alt',
        'text/csv': 'fas fa-file-csv',
        'application/zip': 'fas fa-file-archive',
        'application/x-rar-compressed': 'fas fa-file-archive',
        'application/x-7z-compressed': 'fas fa-file-archive',
    };
    return map[mimeType] || 'fas fa-file';
};

const isFileTypeAccepted = (file) => {
    if (props.accept === '*/*') return true;
    const types = props.accept.split(',').map((t) => t.trim().toLowerCase());
    return types.some((type) => {
        if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type);
        if (type.endsWith('/*')) return (file.type || '').toLowerCase().startsWith(type.slice(0, -1));
        return (file.type || '').toLowerCase() === type;
    });
};

// ------------------------------------------------------------
// Preview builders
// ------------------------------------------------------------
const buildSinglePreview = (item) => {
    if (!item) return null;
    return {
        url: resolvePreviewUrl(item),
        name: getFileName(item),
        size: getFileSize(item),
        type: getFileType(item),
        isImage: isImageItem(item),
    };
};

const revokeAllBlobs = () => {
    blobUrls.forEach((u) => URL.revokeObjectURL(u));
    blobUrls.clear();
};

const updatePreviews = (value) => {
    revokeAllBlobs();

    if (props.multiple) {
        previewFiles.value = Array.isArray(value) ? value : value ? [value] : [];
        singlePreview.value = null;
    } else {
        previewFiles.value = [];
        singlePreview.value = buildSinglePreview(value);
    }
};

const hasPreview = computed(() =>
    props.multiple ? previewFiles.value.length > 0 : !!singlePreview.value
);

const inputId = computed(
    () => props.name || `file-upload-${Math.random().toString(36).slice(2, 11)}`
);

// ------------------------------------------------------------
// Events
// ------------------------------------------------------------
const triggerFileInput = () => {
    if (!props.disabled && !props.readonly && fileInput.value) fileInput.value.click();
};

const onFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
        if (props.maxSize && file.size > props.maxSize) {
            emit('error', `File "${file.name}" exceeds maximum size of ${formatFileSize(props.maxSize)}`);
            continue;
        }
        if (!isFileTypeAccepted(file)) {
            emit('error', `File "${file.name}" type not accepted`);
            continue;
        }
        validFiles.push(file);
    }

    if (validFiles.length === 0) {
        if (fileInput.value) fileInput.value.value = '';
        return;
    }

    if (props.multiple) {
        const current = Array.isArray(props.modelValue) ? props.modelValue : [];
        const merged = [...current, ...validFiles];

        if (props.maxFiles && merged.length > props.maxFiles) {
            emit('error', `Maximum ${props.maxFiles} files allowed`);
            if (fileInput.value) fileInput.value.value = '';
            return;
        }

        emit('update:modelValue', merged);
        updatePreviews(merged);
    } else {
        const file = validFiles[0];
        emit('update:modelValue', file);
        updatePreviews(file);
    }

    emit('upload', validFiles);
    emit('change', event);

    if (fileInput.value) fileInput.value.value = '';
};

const onDragOver = (event) => {
    event.preventDefault();
    if (!props.disabled && !props.readonly) dragOver.value = true;
};
const onDragLeave = () => {
    dragOver.value = false;
};
const onDrop = (event) => {
    event.preventDefault();
    dragOver.value = false;
    if (props.disabled || props.readonly) return;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) onFileChange({ target: { files } });
};

const removeFile = (index) => {
    if (props.multiple) {
        const files = [...(props.modelValue || [])];
        const [removed] = files.splice(index, 1);
        emit('update:modelValue', files);
        updatePreviews(files);
        emit('remove', removed);
    } else {
        clearFiles();
    }
};

const clearFiles = () => {
    emit('update:modelValue', props.multiple ? [] : null);
    updatePreviews(props.multiple ? [] : null);
    emit('clear');
};

// ------------------------------------------------------------
// Watch + Lifecycle
// ------------------------------------------------------------
watch(() => props.modelValue, (v) => updatePreviews(v), { immediate: true });
onUnmounted(revokeAllBlobs);

// ------------------------------------------------------------
// 🔓 Public API — parent can call via template ref
//     <BaseFileUpload ref="uploader" ... />
//     uploader.value.appendToFormData(fd, 'image')
// ------------------------------------------------------------
const appendToFormData = (formData, field, options = {}) => {
    const { keepExistingUrls = false, urlCollector = null } = options;
    const value = props.modelValue;

    if (props.multiple) {
        const arr = Array.isArray(value) ? value : [];
        arr.forEach((item) => {
            if (isFileObject(item)) formData.append(`${field}[]`, item);
            else if (isStringUrl(item) && keepExistingUrls) {
                if (urlCollector) urlCollector.push(item);
                else formData.append(`${field}_existing[]`, item);
            }
        });
    } else {
        if (isFileObject(value)) formData.append(field, value);
        else if (isStringUrl(value) && keepExistingUrls) {
            if (urlCollector) urlCollector.push(value);
            else formData.append(`${field}_existing`, value);
        }
    }
    return formData;
};

const hasFile = () => {
    const v = props.modelValue;
    return props.multiple
        ? Array.isArray(v) && v.some(isFileObject)
        : isFileObject(v);
};

const toFormData = (field, options = {}) => {
    const fd = new FormData();
    appendToFormData(fd, field, options);
    return fd;
};

// Expose the API so `<BaseFileUpload ref="x">` can call it
defineExpose({ appendToFormData, hasFile, toFormData, clearFiles });
</script>
<!-- 
<BaseFileUpload ref="uploader" v-model="formData.images" label="Product Images" accept="image/*" multiple :max-files="8" />
 
<BaseFileUpload ref="uploader" v-model="formData.image" label="Profile Image" accept="image/*" :max-size="20971520"
    upload-text="Upload profile image" button-text="Upload Image" />


-->