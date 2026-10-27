<template>
    <div class="relative w-full">
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }}
            <span v-if="required" class="text-xs text-red-500">*</span>
        </label>

        <div :class="[
            'border rounded-lg overflow-hidden',
            hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        ]">
            <!-- Toolbar -->
            <div v-if="showToolbar"
                class="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
                <!-- Undo/Redo -->
                <button type="button" @click="editor?.chain().focus().undo().run()" :disabled="!editor?.can().undo()"
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Undo">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M8 5v3l-4-4 4-4v3c3.3 0 6 2.7 6 6 0 1.5-.5 2.8-1.4 3.9l-1.4-1.4c.5-.7.8-1.6.8-2.5 0-2.2-1.8-4-4-4z" />
                    </svg>
                </button>

                <button type="button" @click="editor?.chain().focus().redo().run()" :disabled="!editor?.can().redo()"
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redo">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M12 5v3l4-4-4-4v3c-3.3 0-6 2.7-6 6 0 1.5.5 2.8 1.4 3.9l1.4-1.4c-.5-.7-.8-1.6-.8-2.5 0-2.2 1.8-4 4-4z" />
                    </svg>
                </button>

                <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <!-- Text Formatting -->
                <button type="button" @click="editor?.chain().focus().toggleBold().run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Bold">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 5h6.5a3.5 3.5 0 0 1 0 7H4V5zm0 7h7a3.5 3.5 0 0 1 0 7H4v-7z" />
                    </svg>
                </button>

                <button type="button" @click="editor?.chain().focus().toggleItalic().run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Italic">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M8 5h6.5a.5.5 0 0 1 0 1H8a.5.5 0 0 1 0-1zm-2 4h6.5a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1zm-2 4h6.5a.5.5 0 0 1 0 1H4a.5.5 0 0 1 0-1z" />
                    </svg>
                </button>

                <button type="button" @click="editor?.chain().focus().toggleUnderline().run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive('underline') ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Underline">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3h10v2H5V3zm0 4h10v2H5V7zm0 4h10v2H5v-2z" />
                    </svg>
                </button>

                <button type="button" @click="editor?.chain().focus().toggleStrike().run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive('strike') ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Strikethrough">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 10h12v2H4z" />
                    </svg>
                </button>

                <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <!-- Headings -->
                <select @change="setHeading" class="px-2 py-1 text-sm border rounded dark:bg-gray-700"
                    :value="getCurrentHeading()">
                    <option value="">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                </select>

                <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <!-- Text Color -->
                <div class="relative">
                    <button type="button" @click="showColorPicker = !showColorPicker"
                        class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Text Color">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 3v10H7v2h6v-2h-2V3H9z" />
                        </svg>
                    </button>
                    <div v-if="showColorPicker"
                        class="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-20">
                        <div class="grid grid-cols-5 gap-1">
                            <button v-for="color in colors" :key="color" @click="setTextColor(color)"
                                class="w-6 h-6 rounded border" :style="{ backgroundColor: color }"
                                :title="color"></button>
                        </div>
                    </div>
                </div>

                <!-- Highlight Color -->
                <div class="relative">
                    <button type="button" @click="showHighlightPicker = !showHighlightPicker"
                        class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Highlight Color">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 14l4-4 4 4-4 4-4-4zM12 6l4-4 4 4-4 4-4-4z" />
                        </svg>
                    </button>
                    <div v-if="showHighlightPicker"
                        class="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-20">
                        <div class="grid grid-cols-5 gap-1">
                            <button v-for="color in highlightColors" :key="color" @click="setHighlightColor(color)"
                                class="w-6 h-6 rounded border" :style="{ backgroundColor: color }"
                                :title="color"></button>
                        </div>
                    </div>
                </div>

                <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <!-- Lists -->
                <button type="button" @click="editor?.chain().focus().toggleBulletList().run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Bullet List">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 5h10v2H5V5zm0 4h10v2H5V9zm0 4h10v2H5v-2z" />
                    </svg>
                </button>

                <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Ordered List">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 5h10v2H5V5zm0 4h10v2H5V9zm0 4h10v2H5v-2z" />
                    </svg>
                </button>

                <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <!-- Alignment -->
                <button type="button" @click="editor?.chain().focus().setTextAlign('left').run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Align Left">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 5h14v2H3V5zm0 4h10v2H3V9zm0 4h14v2H3v-2z" />
                    </svg>
                </button>

                <button type="button" @click="editor?.chain().focus().setTextAlign('center').run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Align Center">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 5h10v2H5V5zm-2 4h14v2H3V9zm2 4h10v2H5v-2z" />
                    </svg>
                </button>

                <button type="button" @click="editor?.chain().focus().setTextAlign('right').run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Align Right">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 5h14v2H3V5zm6 4h8v2H9V9zm-6 4h14v2H3v-2z" />
                    </svg>
                </button>

                <button type="button" @click="editor?.chain().focus().setTextAlign('justify').run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Justify">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" />
                    </svg>
                </button>

                <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <!-- Link & Image -->
                <button type="button" @click="addLink"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive('link') ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Add Link">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M8.556 6.536a4 4 0 0 1 5.657 0l2.828 2.828a4 4 0 0 1 0 5.657l-2.828 2.828a4 4 0 0 1-5.657 0l-1.414-1.414 1.414-1.414 1.414 1.414a2 2 0 0 0 2.828 0l2.828-2.828a2 2 0 0 0 0-2.828l-2.828-2.828a2 2 0 0 0-2.828 0l-1.414 1.414-1.414-1.414 1.414-1.414z" />
                        <path
                            d="M11.444 13.464a4 4 0 0 1-5.657 0l-2.828-2.828a4 4 0 0 1 0-5.657l2.828-2.828a4 4 0 0 1 5.657 0l1.414 1.414-1.414 1.414-1.414-1.414a2 2 0 0 0-2.828 0l-2.828 2.828a2 2 0 0 0 0 2.828l2.828 2.828a2 2 0 0 0 2.828 0l1.414-1.414 1.414 1.414-1.414 1.414z" />
                    </svg>
                </button>

                <button type="button" @click="addImage" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Add Image">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4h12v12H4V4zm2 2v8h8V6H6zm2 2h4v4H8V8z" />
                    </svg>
                </button>

                <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <!-- Blockquote -->
                <button type="button" @click="editor?.chain().focus().toggleBlockquote().run()"
                    :class="['p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', editor?.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-600' : '']"
                    title="Blockquote">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4h12v2H4V4zm0 4h12v2H4V8zm0 4h12v2H4v-2z" />
                    </svg>
                </button>

                <!-- Horizontal Rule -->
                <button type="button" @click="editor?.chain().focus().setHorizontalRule().run()"
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Horizontal Rule">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 10h12v2H4z" />
                    </svg>
                </button>

                <!-- Clear Formatting -->
                <button type="button" @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Clear Formatting">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 5h10v2H5V5zm0 4h10v2H5V9zm0 4h10v2H5v-2z" />
                    </svg>
                </button>
            </div>

            <!-- Editor Content -->
            <div v-if="editor" class="prose dark:prose-invert max-w-none">
                <editor-content :editor="editor" class="p-3 min-h-[200px] focus:outline-none" />
            </div>
        </div>

        <!-- Helper Text -->
        <p v-if="helperText && !hasError" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ helperText }}
        </p>

        <!-- Error Message -->
        <p v-if="hasError" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ errorMessage }}
        </p>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

// Fix for extension imports - using named imports instead of default
import * as TextStyle from '@tiptap/extension-text-style'
import * as Color from '@tiptap/extension-color'
import * as Highlight from '@tiptap/extension-highlight'

// Extract the extension from the module
const TextStyleExtension = TextStyle.TextStyle || TextStyle.default
const ColorExtension = Color.Color || Color.default
const HighlightExtension = Highlight.Highlight || Highlight.default

const props = defineProps({
    modelValue: { type: String, default: '' },
    label: { type: String, default: '' },
    placeholder: { type: String, default: 'Write something...' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: [Array, String, Object], default: null },
    helperText: { type: String, default: '' },
    showToolbar: { type: Boolean, default: true },
    minHeight: { type: String, default: '200px' }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

const showColorPicker = ref(false)
const showHighlightPicker = ref(false)

const colors = [
    '#000000', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
    '#3498db', '#9b59b6', '#1abc9c', '#e84393', '#95a5a6'
]

const highlightColors = [
    '#ffffff', '#fce4ec', '#fff3e0', '#fff9c4', '#e8f5e9',
    '#e3f2fd', '#f3e5f5', '#e0f7fa', '#ffebee', '#f5f5f5'
]

const hasError = computed(() => {
    if (!props.error) return false
    return Array.isArray(props.error) ? props.error.length > 0 : !!props.error
})

const errorMessage = computed(() => {
    if (Array.isArray(props.error)) return props.error[0]
    return props.error
})

const editor = useEditor({
    content: props.modelValue,
    editable: !props.disabled,
    extensions: [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3, 4]
            }
        }),
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer'
            }
        }),
        Image.configure({
            inline: true,
            allowBase64: true,
            HTMLAttributes: {
                class: 'rounded-lg max-w-full'
            }
        }),
        Placeholder.configure({
            placeholder: props.placeholder
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph']
        }),
        Underline,
        TextStyleExtension,
        ColorExtension,
        HighlightExtension.configure({
            multicolor: true
        })
    ],
    onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        emit('update:modelValue', html)
        emit('change', html)
    },
    onBlur: () => {
        emit('blur')
    },
    onFocus: () => {
        emit('focus')
    }
})

const setHeading = (event) => {
    const value = event.target.value
    if (value) {
        const level = parseInt(value[1])
        editor.value?.chain().focus().toggleHeading({ level }).run()
    } else {
        editor.value?.chain().focus().setParagraph().run()
    }
}

const getCurrentHeading = () => {
    if (!editor.value) return ''
    if (editor.value.isActive('heading', { level: 1 })) return 'h1'
    if (editor.value.isActive('heading', { level: 2 })) return 'h2'
    if (editor.value.isActive('heading', { level: 3 })) return 'h3'
    if (editor.value.isActive('heading', { level: 4 })) return 'h4'
    return ''
}

const setTextColor = (color) => {
    editor.value?.chain().focus().setColor(color).run()
    showColorPicker.value = false
}

const setHighlightColor = (color) => {
    editor.value?.chain().focus().toggleHighlight({ color }).run()
    showHighlightPicker.value = false
}

const addLink = () => {
    const url = window.prompt('Enter URL:', 'https://')
    if (url) {
        editor.value?.chain().focus().setLink({ href: url }).run()
    }
}

const addImage = () => {
    const url = window.prompt('Enter image URL:', 'https://')
    if (url) {
        editor.value?.chain().focus().setImage({ src: url }).run()
    }
}

// Close color pickers when clicking outside
const handleClickOutside = (event) => {
    if (!event.target.closest('.relative')) {
        showColorPicker.value = false
        showHighlightPicker.value = false
    }
}

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
    if (editor.value && newValue !== editor.value.getHTML()) {
        editor.value.commands.setContent(newValue || '')
    }
})

// Watch for disabled state changes
watch(() => props.disabled, (isDisabled) => {
    if (editor.value) {
        editor.value.setEditable(!isDisabled)
    }
})

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    editor.value?.destroy()
})
</script>

<style>
/* TipTap Editor Styles */
.ProseMirror {
    outline: none;
    min-height: 200px;
}

.ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
}

.ProseMirror a {
    color: #3b82f6;
    text-decoration: underline;
    cursor: pointer;
}

.ProseMirror ul,
.ProseMirror ol {
    margin-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.ProseMirror h1 {
    font-size: 1.875rem;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.ProseMirror h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
}

.ProseMirror h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.ProseMirror h4 {
    font-size: 1.125rem;
    font-weight: bold;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.ProseMirror p {
    margin-bottom: 0.5rem;
}

.ProseMirror blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    margin: 0.5rem 0;
    color: #6b7280;
    font-style: italic;
}

.ProseMirror hr {
    margin: 1rem 0;
    border: none;
    border-top: 1px solid #e5e7eb;
}

.ProseMirror img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
}

.ProseMirror mark {
    background-color: #fef08a;
    padding: 0.125rem 0;
    border-radius: 0.25rem;
}

/* Dark mode styles */
.dark .ProseMirror blockquote {
    border-left-color: #4b5563;
    color: #9ca3af;
}

.dark .ProseMirror hr {
    border-top-color: #4b5563;
}

.dark .ProseMirror mark {
    background-color: #854d0e;
    color: #fef08a;
}
</style>
