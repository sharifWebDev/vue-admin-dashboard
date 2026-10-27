<template>
    <div class="relative w-full">
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }} <span v-if="required" class="text-red-500">*</span>
        </label>

        <div v-if="editor"
            class="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 dark:border-gray-600 shadow-sm">

            <div
                class="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 sticky top-0 z-10">

                <div class="flex flex-wrap gap-1 items-center border-r dark:border-gray-600 pr-2 mr-1">
                    <button type="button" @click="editor.chain().focus().undo().run()" class="toolbar-btn"><i
                            class="fas fa-undo"></i></button>
                    <button type="button" @click="editor.chain().focus().redo().run()" class="toolbar-btn"><i
                            class="fas fa-redo"></i></button>

                    <button type="button" @click="editor.chain().focus().toggleBold().run()"
                        :class="{ 'is-active': editor.isActive('bold') }" class="toolbar-btn"><i
                            class="fas fa-bold"></i></button>
                    <button type="button" @click="editor.chain().focus().toggleItalic().run()"
                        :class="{ 'is-active': editor.isActive('italic') }" class="toolbar-btn"><i
                            class="fas fa-italic"></i></button>

                    <input type="color" @input="editor.chain().focus().setColor($event.target.value).run()"
                        :value="editor.getAttributes('textStyle').color || '#000000'"
                        class="w-8 h-8 p-0 border-none cursor-pointer bg-transparent" title="Text Color" />

                    <button type="button" @click="editor.chain().focus().toggleHighlight().run()"
                        :class="{ 'is-active': editor.isActive('highlight') }" class="toolbar-btn text-yellow-500"><i
                            class="fas fa-highlighter"></i></button>
                </div>

                <div class="flex flex-wrap gap-1 items-center border-r dark:border-gray-600 pr-2 mr-1">
                    <button type="button" @click="editor.chain().focus().setTextAlign('left').run()"
                        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }" class="toolbar-btn"><i
                            class="fas fa-align-left"></i></button>
                    <button type="button" @click="editor.chain().focus().setTextAlign('center').run()"
                        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }" class="toolbar-btn"><i
                            class="fas fa-align-center"></i></button>
                    <button type="button" @click="editor.chain().focus().toggleBulletList().run()"
                        :class="{ 'is-active': editor.isActive('bulletList') }" class="toolbar-btn"><i
                            class="fas fa-list-ul"></i></button>
                </div>

                <div class="flex flex-wrap gap-1 items-center">
                    <button type="button" @click="setLink" :class="{ 'is-active': editor.isActive('link') }"
                        class="toolbar-btn"><i class="fas fa-link"></i></button>
                    <button type="button" @click="addImage" class="toolbar-btn text-blue-500"><i
                            class="fas fa-image"></i></button>
                    <button type="button" @click="addVideo" class="toolbar-btn text-red-500"><i
                            class="fab fa-youtube"></i></button>
                    <button type="button" @click="editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()"
                        class="toolbar-btn"><i class="fas fa-table"></i></button>

                    <button type="button" @click="toggleCodeView" :class="{ 'bg-blue-600 text-white': isCodeView }"
                        class="toolbar-btn ml-auto border-blue-500" title="Source Code">
                        <i class="fas fa-code"></i>
                    </button>
                </div>
            </div>

            <div class="relative bg-white dark:bg-gray-800">
                <editor-content v-show="!isCodeView" :editor="editor"
                    class="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] outline-none" />

                <textarea v-show="isCodeView" v-model="rawHtml" @input="syncFromCode"
                    class="w-full min-h-[300px] p-4 font-mono text-sm bg-gray-900 text-green-400 outline-none block"
                    spellcheck="false"></textarea>
            </div>

            <div
                class="px-4 py-1 bg-gray-50 dark:bg-gray-700 text-[10px] text-gray-400 border-t dark:border-gray-600 flex justify-between">
                <span>{{ isCodeView ? 'Source Mode' : 'Visual Mode' }}</span>
                <span>Characters: {{ editor.storage.characterCount.characters() }}</span>
            </div>
        </div>

        <p v-if="error" class="text-xs text-red-500 mt-1">{{ Array.isArray(error) ? error[0] : error }}</p>
    </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
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
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'

const props = defineProps({
    modelValue: String,
    label: String,
    required: Boolean,
    error: [String, Array]
})

const emit = defineEmits(['update:modelValue'])
const isCodeView = ref(false)
const rawHtml = ref('')

const editor = useEditor({
    content: props.modelValue,
    extensions: [
        StarterKit,
        Underline,
        Highlight,
        TextStyle,
        Color,
        Link.configure({ openOnClick: false }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Table.configure({ resizable: true }),
        TableRow, TableHeader, TableCell,
        CharacterCount,
        Placeholder.configure({ placeholder: 'Start writing something amazing...' }),
        Image.configure({ inline: true, allowBase64: true }),
        Youtube.configure({ width: 480, height: 320 }),
    ],
    onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        rawHtml.value = html
        emit('update:modelValue', html)
    },
})

const toggleCodeView = () => {
    if (!isCodeView.value) rawHtml.value = editor.value.getHTML()
    isCodeView.value = !isCodeView.value
}

const syncFromCode = () => {
    editor.value.commands.setContent(rawHtml.value, true)
    emit('update:modelValue', rawHtml.value)
}

const setLink = () => {
    const url = window.prompt('Enter URL')
    if (url) editor.value.chain().focus().setLink({ href: url }).run()
    else if (url === '') editor.value.chain().focus().unsetLink().run()
}

const addImage = () => {
    const url = window.prompt('Enter Image URL')
    if (url) editor.value.chain().focus().setImage({ src: url }).run()
}

const addVideo = () => {
    const url = window.prompt('Enter YouTube URL')
    if (url) editor.value.chain().focus().setYoutubeVideo({ src: url }).run()
}

watch(() => props.modelValue, (val) => {
    if (editor.value.getHTML() !== val) {
        editor.value.commands.setContent(val || '', false)
        rawHtml.value = val || ''
    }
})

onBeforeUnmount(() => {
    editor.value.destroy()
})
</script>

<style scoped>
.toolbar-btn {
    @apply p-2 w-9 h-9 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all focus:outline-none;
}

.is-active {
    @apply bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800;
}

/* Fix Input Field placeholder color */
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    color: #adb5bd;
    pointer-events: none;
    height: 0;
}

:deep(.ProseMirror focus-visible) {
    outline: none;
}

/* Image & Video responsiveness */
:deep(.ProseMirror img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

:deep(.ProseMirror iframe) {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
}
</style>