<template>
    <div class="relative w-full">
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }}
            <span v-if="required" class="text-xs text-red-500">*</span>
        </label>

        <!-- Drag & Drop Zone -->
        <div :class="[
            'relative border-2 border-dashed rounded-lg transition-all duration-200',
            isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600',
            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
            hasError ? 'border-red-500' : '',
            dropzonePaddingClass
        ]" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop"
            @click="!disabled && triggerFileInput()">
            <div :class="dropzoneContentClass">
                <svg class="mx-auto text-gray-400" :class="iconSizeClass" :style=" { 'text-blue-500': isDragOver }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>

                <div :class="textSizeClass" class="mt-2 text-gray-600 dark:text-gray-400 text-center">
                    <span class="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        Click to upload
                    </span>
                    <span> or drag and drop</span>
                </div>

                <p :class="helperTextSizeClass" class="text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {{ fileTypesText }} up to {{ maxSizeText }}
                </p>
            </div>

            <input ref="fileInputRef" type="file" :accept="accept" :multiple="multiple" :disabled="disabled"
                class="hidden" @change="handleFileSelect" />
        </div>

        <!-- Image Preview Section -->
        <div v-if="showPreview && imagePreviewUrls.length > 0" class="mt-4">
            <div class="flex items-center justify-between mb-3 px-1">
                <h4 :class="labelSizeClass" class="font-bold uppercase tracking-widest text-slate-400">
                    Media Gallery
                </h4>
                <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500">
                    {{ imagePreviewUrls.length }} FILES
                </span>
            </div>

            <div class="flex flex-wrap gap-3">
                <div v-for="(preview) in imagePreviewUrls" :key="preview.id" class="relative group">
                    <div
                        class="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <img :src="preview.url" :alt="preview.name" :class="previewImageSizeClass"
                            class="object-cover" />

                        <div
                            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div class="flex space-x-2">
                                <button type="button" @click.stop="previewImage(preview.url)"
                                    class="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                                    title="View full size">
                                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>

                                <button v-if="!disabled && removable" type="button"
                                    @click.stop="removeFile(preview.fileIndex)"
                                    class="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                    title="Remove">
                                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 truncate"
                            :class="previewTextSizeClass">
                            {{ preview.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- File List for Non-Image Files -->
        <div v-if="showFileList && nonImageFiles.length > 0" class="mt-3 space-y-2">
            <label :class="labelSizeClass" class="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Files
            </label>
            <div v-for="(file, index) in nonImageFiles" :key="file.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <div class="flex-shrink-0">
                        <svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                            <p :class="fileNameSizeClass" class="font-medium text-gray-900 dark:text-white truncate">
                                {{ file.name }}
                            </p>
                            <span :class="fileInfoSizeClass" class="text-gray-500 dark:text-gray-400">
                                ({{ formatFileSize(file.size) }})
                            </span>
                        </div>

                        <div v-if="uploading && file.progress !== undefined && file.progress < 100" class="mt-1">
                            <div class="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Uploading...</span>
                                <span>{{ file.progress }}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-1.5">
                                <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                    :style="{ width: `${file.progress}%` }"></div>
                            </div>
                        </div>

                        <div v-if="file.uploaded" class="mt-1">
                            <span class="text-xs text-green-600 dark:text-green-400">✓ Uploaded successfully</span>
                        </div>

                        <p v-if="file.error" class="text-xs text-red-500 mt-1">
                            {{ file.error }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center space-x-2 ml-3">
                    <button v-if="!disabled && removable" type="button" @click.stop="removeFile(index)"
                        class="text-red-400 hover:text-red-600" title="Remove">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <p v-if="helperText && !hasError" :class="helperTextSizeClass" class="text-gray-500 dark:text-gray-400 mt-2">
            {{ helperText }}
        </p>

        <p v-if="hasError" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ errorMessage }}
        </p>
    </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
    modelValue: {
        type: [File, Array, null],
        default: null
    },
    label: String,
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    error: { type: [Array, String, Object], default: null },
    helperText: String,
    accept: { type: String, default: '' },
    maxSize: { type: Number, default: 5 * 1024 * 1024 },
    maxFiles: { type: Number, default: 1 },
    minFiles: { type: Number, default: 0 },
    multiple: { type: Boolean, default: false },
    showFileList: { type: Boolean, default: true },
    showPreview: { type: Boolean, default: true },
    removable: { type: Boolean, default: true },
    autoUpload: { type: Boolean, default: false },
    previewEnabled: { type: Boolean, default: true },
    uploadUrl: String,
    uploadHeaders: { type: Object, default: () => ({}) },
    maxSizeText: { type: String, default: '5MB' },
    fileTypesText: { type: String, default: 'Images, PDFs, Documents' },
    inputFieldSize: { type: String, default: 'md' } // sm, md, lg
})

const emit = defineEmits([
    'update:modelValue',
    'change',
    'upload',
    'upload-progress',
    'upload-success',
    'upload-error',
    'remove',
    'error'
])

// Size configurations
const sizeConfig = {
    sm: {
        dropzonePadding: 'p-1',
        dropzoneContentPadding: 'p-2',
        iconSize: 'h-6 w-6',
        textSize: 'text-xs',
        helperTextSize: 'text-[10px]',
        labelSize: 'text-xs',
        previewImageSize: 'h-20 w-28',
        previewTextSize: 'text-[10px]',
        fileNameSize: 'text-xs',
        fileInfoSize: 'text-[10px]'
    },
    md: {
        dropzonePadding: 'p-3',
        dropzoneContentPadding: 'p-3',
        iconSize: 'h-12 w-12',
        textSize: 'text-xs',
        helperTextSize: 'text-xs',
        labelSize: 'text-sm',
        previewImageSize: 'h-32 w-40',
        previewTextSize: 'text-xs',
        fileNameSize: 'text-sm',
        fileInfoSize: 'text-xs'
    },
    lg: {
        dropzonePadding: 'p-5',
        dropzoneContentPadding: 'p-5',
        iconSize: 'h-16 w-16',
        textSize: 'text-sm',
        helperTextSize: 'text-sm',
        labelSize: 'text-base',
        previewImageSize: 'h-40 w-48',
        previewTextSize: 'text-sm',
        fileNameSize: 'text-base',
        fileInfoSize: 'text-sm'
    }
}

const currentSize = computed(() => sizeConfig[props.inputFieldSize] || sizeConfig.md)

const dropzonePaddingClass = computed(() => currentSize.value.dropzonePadding)
const dropzoneContentClass = computed(() => currentSize.value.dropzoneContentPadding)
const iconSizeClass = computed(() => currentSize.value.iconSize)
const textSizeClass = computed(() => currentSize.value.textSize)
const helperTextSizeClass = computed(() => currentSize.value.helperTextSize)
const labelSizeClass = computed(() => currentSize.value.labelSize)
const previewImageSizeClass = computed(() => currentSize.value.previewImageSize)
const previewTextSizeClass = computed(() => currentSize.value.previewTextSize)
const fileNameSizeClass = computed(() => currentSize.value.fileNameSize)
const fileInfoSizeClass = computed(() => currentSize.value.fileInfoSize)

const fileInputRef = ref(null)
const isDragOver = ref(false)
const uploading = ref(false)
const fileList = ref([])
const imagePreviewUrls = ref([])
const maxFilesError = ref(null)

const generateFileId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isImageFile = (file) => {
    return file.type.startsWith('image/')
}

const validateFile = (file) => {
    if (props.accept) {
        const acceptedTypes = props.accept.split(',').map(t => t.trim())
        const fileType = file.type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

        const isValid = acceptedTypes.some(type => {
            if (type.startsWith('.')) {
                return fileExtension === type.toLowerCase()
            }
            if (type.includes('/*')) {
                const mainType = type.split('/')[0]
                return fileType.startsWith(mainType)
            }
            return fileType === type
        })

        if (!isValid) {
            return `File type not accepted. Allowed: ${props.accept}`
        }
    }

    if (file.size > props.maxSize) {
        return `File size exceeds ${formatFileSize(props.maxSize)}`
    }

    return null
}

const addFiles = (files) => {
    const newFiles = Array.from(files)

    const currentCount = fileList.value.length
    const availableSlots = props.maxFiles - currentCount

    if (newFiles.length > availableSlots) {
        const error = `Maximum ${props.maxFiles} file(s) allowed. You already have ${currentCount} file(s).`
        maxFilesError.value = error
        emit('error', error)
        return
    }

    maxFilesError.value = null
    const validatedFiles = []

    for (const file of newFiles) {
        const error = validateFile(file)
        if (error) {
            emit('error', { file, error })
            continue
        }

        validatedFiles.push({
            id: generateFileId(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            error: null,
            uploaded: false,
            previewUrl: null
        })
    }

    const updatedFiles = [...fileList.value, ...validatedFiles]
    fileList.value = updatedFiles
    updateImagePreviews()

    const modelFiles = fileList.value.map(item => item.file)
    if (props.multiple) {
        emit('update:modelValue', modelFiles)
    } else {
        emit('update:modelValue', modelFiles[0] || null)
    }

    emit('change', modelFiles)

    if (props.autoUpload && validatedFiles.length > 0) {
        uploadFiles(validatedFiles)
    }
}

const removeFile = (index) => {
    const removed = fileList.value.splice(index, 1)[0]

    if (removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl)
    }

    updateImagePreviews()
    emit('remove', removed)

    const modelFiles = fileList.value.map(item => item.file)
    if (props.multiple) {
        emit('update:modelValue', modelFiles)
    } else {
        emit('update:modelValue', modelFiles[0] || null)
    }

    emit('change', modelFiles)
}

const createImagePreview = (file, fileIndex, fileId) => {
    const url = URL.createObjectURL(file)
    return {
        id: fileId,
        url: url,
        name: file.name,
        fileIndex: fileIndex
    }
}

const updateImagePreviews = () => {
    imagePreviewUrls.value.forEach(preview => {
        URL.revokeObjectURL(preview.url)
    })

    const newPreviews = []
    fileList.value.forEach((file, index) => {
        if (isImageFile(file.file)) {
            newPreviews.push(createImagePreview(file.file, index, file.id))
        }
    })
    imagePreviewUrls.value = newPreviews
}

const triggerFileInput = () => {
    if (!props.disabled) {
        fileInputRef.value.click()
    }
}

const handleFileSelect = (event) => {
    const files = event.target.files
    if (files && files.length > 0) {
        addFiles(files)
    }
    event.target.value = ''
}

const handleDragOver = (event) => {
    event.preventDefault()
    if (!props.disabled) {
        isDragOver.value = true
    }
}

const handleDragLeave = (event) => {
    event.preventDefault()
    isDragOver.value = false
}

const handleDrop = (event) => {
    event.preventDefault()
    isDragOver.value = false

    if (!props.disabled) {
        const files = event.dataTransfer.files
        if (files && files.length > 0) {
            addFiles(files)
        }
    }
}

const previewImage = (url) => {
    window.open(url, '_blank')
}

const uploadFiles = async (files) => {
    if (!props.uploadUrl) {
        console.warn('No upload URL provided')
        return
    }

    uploading.value = true

    for (const fileItem of files) {
        const formData = new FormData()
        formData.append('file', fileItem.file)

        try {
            const response = await fetch(props.uploadUrl, {
                method: 'POST',
                headers: props.uploadHeaders,
                body: formData
            })

            let progress = 0
            const interval = setInterval(() => {
                if (progress < 90) {
                    progress += 10
                    fileItem.progress = progress
                    emit('upload-progress', { file: fileItem, progress })
                }
            }, 100)

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            clearInterval(interval)
            fileItem.progress = 100
            const result = await response.json()
            fileItem.uploaded = true
            fileItem.response = result
            emit('upload-progress', { file: fileItem, progress: 100 })
            emit('upload-success', { file: fileItem, response: result })
            emit('upload', { file: fileItem, response: result })

        } catch (error) {
            fileItem.error = error.message
            emit('upload-error', { file: fileItem, error })
            emit('error', { file: fileItem, error })
        }
    }

    uploading.value = false
}

const clearFiles = () => {
    imagePreviewUrls.value.forEach(preview => {
        URL.revokeObjectURL(preview.url)
    })
    fileList.value.forEach(file => {
        if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl)
        }
    })
    fileList.value = []
    imagePreviewUrls.value = []
    emit('update:modelValue', props.multiple ? [] : null)
    emit('change', props.multiple ? [] : null)
}

defineExpose({
    clearFiles,
    uploadFiles,
    fileList
})

const nonImageFiles = computed(() => {
    return fileList.value.filter(file => !isImageFile(file.file))
})

const hasError = computed(() => {
    if (maxFilesError.value) return true
    if (!props.error) return false
    return Array.isArray(props.error) ? props.error.length > 0 : !!props.error
})

const errorMessage = computed(() => {
    if (maxFilesError.value) return maxFilesError.value
    if (Array.isArray(props.error)) return props.error[0]
    return props.error
})

watch(() => props.modelValue, (newValue) => {
    if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
        if (fileList.value.length > 0) {
            imagePreviewUrls.value.forEach(preview => {
                URL.revokeObjectURL(preview.url)
            })
            fileList.value = []
            imagePreviewUrls.value = []
        }
    }
}, { deep: true })

onUnmounted(() => {
    imagePreviewUrls.value.forEach(preview => {
        URL.revokeObjectURL(preview.url)
    })
    fileList.value.forEach(file => {
        if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl)
        }
    })
})
</script>

<style scoped>
.drag-over {
    transform: scale(1.02);
    transition: transform 0.2s ease;
}

.group:hover .group-hover\:bg-opacity-50 {
    --tw-bg-opacity: 0.5;
}

.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
}
</style>

<!-- <template>
  <FileInput
    v-model="form.avatar"
    label="Profile Picture"
    accept="image/*"
    :max-size="2 * 1024 * 1024"
    max-size-text="2MB"
    file-types-text="Images only"
    required
  /> 
 

### Multiple Files with Auto Upload
 
  <FileInput
    v-model="form.documents"
    label="Upload Documents"
    accept=".pdf,.doc,.docx"
    :multiple="true"
    :max-files="5"
    :max-size="10 * 1024 * 1024"
    :auto-upload="true"
    upload-url="/api/upload"
    :upload-headers="{ 'X-CSRF-TOKEN': csrfToken }"
    @upload-success="handleUploadSuccess"
    @upload-error="handleUploadError"
  />
  
### Gallery Upload with Preview
  
    <FileInput
      ref="galleryInput"
      v-model="form.images"
      label="Gallery Images"
      accept="image/jpeg,image/png,image/webp"
      :multiple="true"
      :max-files="10"
      :max-size="5 * 1024 * 1024"
      :show-file-list="true"
      :preview-enabled="true"
      @change="handleImageChange"
    />
     
  <FileInput
    v-model="form.attachment"
    label="Attachment"
    accept=".pdf,.doc,.docx,.txt"
    :max-size="15 * 1024 * 1024"
    helper-text="Supported formats: PDF, DOC, DOCX, TXT (Max 15MB)"
    :show-file-list="true"
    :removable="true"
    class="custom-file-input"
  >   

## **Features:**

1. **Drag & Drop Support** - Visual feedback during drag operations
2. **Multiple File Selection** - Configurable max files
3. **File Validation** - Type, size, and count validation
4. **Preview Capability** - Image and PDF preview
5. **Upload Progress** - Real-time upload progress tracking
6. **Auto Upload** - Optional automatic upload on file selection
7. **Customizable** - Accept types, max size, styling
8. **Accessibility** - Keyboard navigation support
9. **Error Handling** - Comprehensive error messages
10. **Dark Mode** - Full dark mode support
11. **File Management** - Remove, preview, clear files
12. **Event Emitters** - Change, upload, error events

## **Props Reference:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| accept | String | '' | Accepted file types (e.g., "image/*, .pdf") |
| maxSize | Number | 5MB | Maximum file size in bytes |
| maxFiles | Number | 1 | Maximum number of files |
| minFiles | Number | 0 | Minimum number of files required |
| multiple | Boolean | false | Allow multiple file selection |
| autoUpload | Boolean | false | Auto upload on file selection |
| uploadUrl | String | null | Endpoint for file upload |
| removable | Boolean | true | Allow file removal |
| previewEnabled | Boolean | true | Enable file preview |
| showFileList | Boolean | true | Show list of selected files | -->