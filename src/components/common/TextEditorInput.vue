<template>
    <div class="relative w-full" :data-ai-instance="aiInstanceId">
        <!-- Label -->
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>

        <div v-if="editor"
            class="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-all duration-200 shadow-sm"
            :class="showError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'">

            <!-- Toolbar -->
            <div
                class="flex flex-wrap gap-1 p-1.5 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-600 sticky top-0 z-10">
                <!-- Heading Select -->
                <div class="flex items-center border-r dark:border-gray-600 pr-1.5 mr-1">
                    <select @change="(e) => handleHeadingChange(e.target.value)"
                        class="bg-white dark:bg-gray-600 text-[11px] font-medium text-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 outline-none cursor-pointer px-2 py-1 rounded shadow-sm">
                        <option value="p" :selected="editor.isActive('paragraph')">Paragraph</option>
                        <option value="1" :selected="editor.isActive('heading', { level: 1 })">H1</option>
                        <option value="2" :selected="editor.isActive('heading', { level: 2 })">H2</option>
                        <option value="3" :selected="editor.isActive('heading', { level: 3 })">H3</option>
                    </select>
                </div>

                <!-- Basic Formatting -->
                <div class="flex items-center gap-0.5 border-r dark:border-gray-600 pr-1.5 mr-1">
                    <button type="button" @click="editor.chain().focus().undo().run()" class="toolbar-btn" title="Undo">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button type="button" @click="editor.chain().focus().redo().run()" class="toolbar-btn" title="Redo">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>

                <!-- Text Formatting -->
                <div class="flex items-center gap-0.5 border-r dark:border-gray-600 pr-1.5 mr-1">
                    <button type="button" @click="editor.chain().focus().toggleBold().run()"
                        :class="{ 'is-active': editor.isActive('bold') }" class="toolbar-btn">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button type="button" @click="editor.chain().focus().toggleItalic().run()"
                        :class="{ 'is-active': editor.isActive('italic') }" class="toolbar-btn">
                        <i class="fas fa-italic"></i>
                    </button>
                    <button type="button" @click="editor.chain().focus().toggleUnderline().run()"
                        :class="{ 'is-active': editor.isActive('underline') }" class="toolbar-btn">
                        <i class="fas fa-underline"></i>
                    </button>
                </div>

                <!-- Lists -->
                <div class="flex items-center gap-0.5 border-r dark:border-gray-600 pr-1.5 mr-1">
                    <button type="button" @click="editor.chain().focus().toggleBulletList().run()"
                        :class="{ 'is-active': editor.isActive('bulletList') }" class="toolbar-btn">
                        <i class="fas fa-list-ul"></i>
                    </button>
                    <button type="button" @click="editor.chain().focus().toggleOrderedList().run()"
                        :class="{ 'is-active': editor.isActive('orderedList') }" class="toolbar-btn">
                        <i class="fas fa-list-ol"></i>
                    </button>
                </div>

                <!-- AI Suggestion Button - Using AiSuggestion component -->
                <AiSuggestion v-if="hasAiSuggestions" ref="aiSuggestionRef" :instance-id="aiInstanceId"
                    component-type="rich-text" :label="label" :value="editor?.getHTML() || ''" :required="required"
                    :disabled="disabled" :readonly="readonly" :ai-suggestions="aiSuggestions" :ai-loading="aiLoading"
                    :max-suggestions="5" tone="professional" @apply="applyAISuggestion" @fetch="fetchAISuggestions"
                    @toggle="onAIToggle" @update:suggestions="updateAISuggestions" />

                <!-- Source Code Toggle -->
                <button type="button" @click="toggleCodeView"
                    :class="{ 'bg-gray-800 text-white dark:bg-blue-600': isCodeView }"
                    class="toolbar-btn border border-transparent hover:border-gray-300" title="Source Code">
                    <i class="fas fa-code"></i>
                </button>
            </div>

            <!-- Editor Content -->
            <div class="relative bg-white dark:bg-gray-800">
                <editor-content v-show="!isCodeView" :editor="editor"
                    class="tiptap-manual p-4 outline-none min-h-[200px]" />

                <textarea v-show="isCodeView" v-model="rawHtml" @input="syncFromCode"
                    class="w-full min-h-[200px] p-4 font-mono text-sm bg-gray-900 text-green-400 outline-none block border-none resize-none"
                    spellcheck="false"></textarea>
            </div>

            <!-- Footer -->
            <div
                class="px-3 py-1 bg-gray-50 dark:bg-gray-700/30 text-[10px] text-gray-400 border-t dark:border-gray-600 flex justify-between items-center">
                <div class="flex gap-2">
                    <span class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full"
                            :class="isCodeView ? 'bg-orange-400' : 'bg-green-400'"></span>
                        {{ isCodeView ? 'HTML Source' : 'Visual Mode' }}
                    </span>
                    <span v-if="showError" class="text-red-500">⚠️ Has errors</span>
                </div>
                <span>Characters: {{ characterCount }}</span>
            </div>
        </div>

        <!-- Helper Text -->
        <p v-if="helperText && !showError" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ helperText }}
        </p>

        <!-- Error Message -->
        <p v-if="showError" class="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
        </p>
    </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed, inject, onMounted, nextTick } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Image } from '@tiptap/extension-image'
import { Youtube } from '@tiptap/extension-youtube'
import AiSuggestion from '@/components/common/AiSuggestion.vue'

const props = defineProps({
    modelValue: { type: String, default: '' },
    label: String,
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    error: [String, Array, Object],
    helperText: String,
    placeholder: { type: String, default: 'Start typing here...' },
    // AI Props - Can be boolean true, array, or null
    aiSuggestions: {
        type: [Boolean, Array],
        default: null
    },
    aiLoading: {
        type: Boolean,
        default: false
    },
    // Validation Props
    validationRules: {
        type: Object,
        default: () => ({})
    },
    customValidator: { type: Function, default: null },
    minLength: { type: Number, default: null },
    maxLength: { type: Number, default: null },
    validateOnBlur: { type: Boolean, default: true },
    validateOnInput: { type: Boolean, default: false }
})

const emit = defineEmits([
    'update:modelValue',
    'change',
    'blur',
    'focus',
    'ai-suggest'
])

// Generate unique ID for this instance
const aiInstanceId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Refs
const isCodeView = ref(false)
const rawHtml = ref('')
const internalError = ref(null)
const hasBeenTouched = ref(false)
const hasBeenFocused = ref(false)
const submitAttempted = ref(false)
const aiSuggestionRef = ref(null)
const localAiSuggestions = ref([])

// Computed: Check if AI is enabled
const hasAiSuggestions = computed(() => {
    return props.aiSuggestions !== null && props.aiSuggestions !== undefined
})

// Get form validation from parent
const formValidation = inject('formValidation', null)

// Component reference for form registration
let componentRef = null

// Editor with proper extensions (no duplicates)
const editor = useEditor({
    content: props.modelValue,
    extensions: [
        StarterKit.configure({
            underline: false,
            link: false,
        }),
        Underline,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'text-blue-600 underline cursor-pointer hover:text-blue-800'
            }
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph']
        }),
        Highlight,
        Table.configure({
            resizable: true
        }),
        TableRow,
        TableHeader,
        TableCell,
        CharacterCount,
        Placeholder.configure({
            placeholder: props.placeholder
        }),
        TextStyle,
        Color,
        Image.configure({
            inline: true,
            allowBase64: true
        }),
        Youtube.configure({
            width: 480,
            height: 320
        }),
    ],
    onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        rawHtml.value = html
        emit('update:modelValue', html)
        emit('change', html)

        if (!hasBeenTouched.value) {
            hasBeenTouched.value = true
        }

        if (props.validateOnInput) {
            internalError.value = getValidationMessage(html)
        }

        if (formValidation && formValidation.validateForm) {
            nextTick(() => {
                formValidation.validateForm()
            })
        }
    },
})

// Register with form
onMounted(() => {
    if (formValidation) {
        componentRef = {
            validate: (triggerSubmit = true) => {
                if (triggerSubmit) {
                    submitAttempted.value = true
                }
                const error = getValidationMessage(editor.value?.getHTML() || '', triggerSubmit)
                internalError.value = error
                return !error
            },
            resetValidation: () => {
                internalError.value = null
                hasBeenTouched.value = false
                submitAttempted.value = false
            },
            get errorMessage() {
                return internalError.value
            },
            get internalError() {
                return internalError
            },
            $el: document.querySelector('.relative.w-full')
        }

        formValidation.register(componentRef)
    }
})

// Unregister on unmount
onBeforeUnmount(() => {
    if (formValidation && componentRef) {
        formValidation.unregister(componentRef)
        componentRef = null
    }
    if (editor.value) editor.value.destroy()
})

/**
 * Character count
 */
const characterCount = computed(() => {
    if (editor.value && editor.value.storage?.characterCount) {
        return editor.value.storage.characterCount.characters?.() || 0
    }
    return 0
})

/**
 * Helper: Strip HTML tags
 */
const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
}

/**
 * AI Methods
 */
const fetchAISuggestions = () => {
    if (props.aiSuggestions === true) {
        return
    }
    emit('ai-suggest')
}

const applyAISuggestion = (value) => {
    if (!editor.value) return
    editor.value.commands.setContent(value)
    hasBeenTouched.value = true
    internalError.value = getValidationMessage(value)

    if (formValidation && formValidation.validateForm) {
        nextTick(() => {
            formValidation.validateForm()
        })
    }
}

const onAIToggle = (isOpen) => {
    // Handle AI dropdown toggle if needed
}

const updateAISuggestions = (suggestions) => {
    localAiSuggestions.value = suggestions
}

/**
 * Frontend Validation
 */
const validateValue = (htmlContent, triggerSubmit = false) => {
    const errors = []
    const text = stripHtml(htmlContent)

    const shouldValidateRequired =
        triggerSubmit ||
        submitAttempted.value ||
        (hasBeenTouched.value && (hasBeenFocused.value || !text.trim()))

    if (props.required && shouldValidateRequired) {
        if (!text.trim()) {
            errors.push(`${props.label || 'This field'} is required`)
        }
    }

    if (text.trim()) {
        if (props.minLength && text.length < props.minLength) {
            errors.push(`Must be at least ${props.minLength} characters`)
        }

        if (props.maxLength && text.length > props.maxLength) {
            errors.push(`Must be at most ${props.maxLength} characters`)
        }

        if (props.validationRules) {
            Object.entries(props.validationRules).forEach(([rule, ruleValue]) => {
                switch (rule) {
                    case 'minLength':
                        if (text.length < ruleValue) {
                            errors.push(`Must be at least ${ruleValue} characters`)
                        }
                        break
                    case 'maxLength':
                        if (text.length > ruleValue) {
                            errors.push(`Must be at most ${ruleValue} characters`)
                        }
                        break
                    case 'contains':
                        if (ruleValue && !text.includes(ruleValue)) {
                            errors.push(`Must contain "${ruleValue}"`)
                        }
                        break
                }
            })
        }

        if (props.customValidator) {
            const customError = props.customValidator(text, htmlContent)
            if (customError) {
                errors.push(customError)
            }
        }
    }

    return errors
}

const getValidationMessage = (htmlContent, triggerSubmit = false) => {
    const errors = validateValue(htmlContent, triggerSubmit)
    if (errors.length > 0) {
        return errors[0]
    }
    return null
}

/**
 * Editor Methods
 */
const handleHeadingChange = (value) => {
    if (!editor.value) return
    if (value === 'p') {
        editor.value.chain().focus().setParagraph().run()
    } else {
        editor.value.chain().focus().toggleHeading({ level: parseInt(value) }).run()
    }
}

const toggleCodeView = () => {
    if (!editor.value) return
    if (!isCodeView.value) rawHtml.value = editor.value.getHTML()
    isCodeView.value = !isCodeView.value
}

const syncFromCode = () => {
    if (!editor.value) return
    editor.value.commands.setContent(rawHtml.value, true)
    emit('update:modelValue', rawHtml.value)
}

/**
 * Public method to trigger validation
 */
const validate = (triggerSubmit = true) => {
    if (triggerSubmit) {
        submitAttempted.value = true
    }
    const error = getValidationMessage(editor.value?.getHTML() || '', triggerSubmit)
    internalError.value = error
    return !error
}

// Expose validate method to parent
defineExpose({
    validate,
    resetValidation: () => {
        internalError.value = null
        hasBeenTouched.value = false
        hasBeenFocused.value = false
        submitAttempted.value = false
    },
    clearError: () => {
        internalError.value = null
    }
})

/**
 * Visual States
 */
const hasError = computed(() => {
    if (props.error) return true
    if (internalError.value) {
        if (props.required && internalError.value.includes('required')) {
            return submitAttempted.value || (hasBeenTouched.value && hasBeenFocused.value === false)
        }
        return submitAttempted.value || hasBeenTouched.value
    }
    return false
})

const showError = computed(() => hasError.value)

const errorMessage = computed(() => {
    if (props.error) {
        return Array.isArray(props.error) ? props.error[0] : props.error
    }
    return internalError.value
})

// Watch for model value changes
watch(() => props.modelValue, (val) => {
    if (editor.value && editor.value.getHTML() !== val) {
        editor.value.commands.setContent(val || '', false)
        rawHtml.value = val || ''
    }
})

// Watch for validation
watch(() => editor.value?.getHTML(), (newVal) => {
    if (hasBeenTouched.value || submitAttempted.value) {
        if (!hasBeenTouched.value && !submitAttempted.value && !newVal) {
            return
        }
        internalError.value = getValidationMessage(newVal)
    }
})
</script>

<style scoped>
/* Toolbar Button Styling */
.toolbar-btn {
    @apply p-1 w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all duration-200 focus:outline-none text-[13px];
}

.is-active {
    @apply bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 font-bold shadow-sm ring-1 ring-blue-200 dark:ring-blue-800;
}

/* Editor Content Styling */
:deep(.tiptap-manual .ProseMirror) {
    @apply min-h-[200px] outline-none text-sm text-gray-800 dark:text-gray-200;
    line-height: 1.6;
}

:deep(.tiptap-manual .ProseMirror h1) {
    @apply text-2xl font-bold my-3 leading-tight;
}

:deep(.tiptap-manual .ProseMirror h2) {
    @apply text-xl font-bold my-2 leading-tight;
}

:deep(.tiptap-manual .ProseMirror h3) {
    @apply text-lg font-bold my-2 leading-tight;
}

:deep(.tiptap-manual .ProseMirror p) {
    @apply my-1.5 leading-relaxed;
}

:deep(.tiptap-manual .ProseMirror ul) {
    @apply list-disc ml-4 my-1.5;
}

:deep(.tiptap-manual .ProseMirror ol) {
    @apply list-decimal ml-4 my-1.5;
}

:deep(.tiptap-manual .ProseMirror blockquote) {
    @apply border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic my-2 text-gray-600 dark:text-gray-400;
}

:deep(.tiptap-manual .ProseMirror a) {
    @apply text-blue-600 underline cursor-pointer hover:text-blue-800;
}

:deep(.tiptap-manual .ProseMirror table) {
    @apply border-collapse table-fixed w-full my-2 border border-gray-300 dark:border-gray-600;
}

:deep(.tiptap-manual .ProseMirror td),
:deep(.tiptap-manual .ProseMirror th) {
    @apply border border-gray-300 dark:border-gray-600 p-2 min-w-[1em] relative;
}

:deep(.tiptap-manual .ProseMirror th) {
    @apply bg-gray-50 dark:bg-gray-700 font-bold text-left;
}

:deep(.tiptap-manual .ProseMirror img) {
    @apply max-w-full h-auto rounded-lg my-2 shadow-sm;
}

:deep(.tiptap-manual .ProseMirror iframe) {
    @apply w-full aspect-video rounded-lg my-2 shadow-sm;
}

:deep(.tiptap-manual .ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    @apply float-left text-gray-400 pointer-events-none h-0 italic;
}

/* Scrollbar Customization */
textarea::-webkit-scrollbar {
    width: 8px;
}

textarea::-webkit-scrollbar-thumb {
    @apply bg-gray-300 dark:bg-gray-600 rounded;
}
</style>

<!-- 

<TextEditorInput 
    v-model="form.description" 
    label="Description" 
    required
    :min-length="10"
    :max-length="5000"
    helper-text="Enter a detailed description (10-5000 characters)"
/>
Usage Examples:
1. No AI (Default)
vue
<TextEditorInput v-model="form.description" label="Description" required :min-length="10" :max-length="5000"
    helper-text="Enter a detailed description (10-5000 characters)" />
2. Auto AI Suggestions (True - Auto Fetch)
vue
<TextEditorInput v-model="form.content" label="Content" required :ai-suggestions="true" />
3. Static AI Suggestions (Array Data)
vue
<TextEditorInput v-model="form.content" label="Content" required :ai-suggestions="[
        { 
            label: 'Professional Description', 
            value: '<p>This is a professional description with <strong>key features</strong> and benefits.</p>'
        },
        { 
            label: 'Simple Description', 
            value: '<p>A simple and clear description of the product.</p>'
        },
        { 
            label: 'Marketing Copy', 
            value: '<p><strong>Amazing Product!</strong> Discover the <em>best quality</em> at an unbeatable price.</p>'
        }
    ]" />
4. Dynamic AI Suggestions (Manual Fetch)
vue
<TextEditorInput v-model="form.bio" label="Bio" required :ai-suggestions="aiSuggestions" @ai-suggest="fetchAIContent" />
vue
<script setup>
import { ref } from 'vue'

const aiSuggestions = ref([])

const fetchAIContent = async () => {
    // Fetch from API
    const response = await fetch('/api/ai/content-suggestions')
    const data = await response.json()
    aiSuggestions.value = data.map(item => ({
        label: item.label,
        value: item.content
    }))
}
</script>
5. With Custom Validation
vue
<TextEditorInput v-model="form.bio" label="Bio" required :custom-validator="(text, html) => {
        if (text.split(' ').length < 10) {
            return 'Please write at least 10 words'
        }
        if (text.length > 500) {
            return 'Bio must be less than 500 characters'
        }
        return null
    }" :ai-suggestions="true" />
6. With Form Registration
vue
<GlobalForm ref="formRef" @submit="handleSubmit">
    <TextEditorInput v-model="formData.description" label="Description" required :min-length="20" :max-length="10000"
        :ai-suggestions="true" />
</GlobalForm>

-->