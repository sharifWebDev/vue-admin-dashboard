<!-- components/common/ImageTextColumn.vue -->
<template>
    <div class="flex items-center space-x-3">
        <!-- Image -->
        <div class="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
            :class="imageContainerClass">
            <img v-if="imageSrc" :src="imageSrc" :alt="title || 'Image'" class="h-full w-full object-cover"
                :class="imageClass" @error="handleImageError" />
            <div v-else class="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700"
                :class="placeholderBgClass">
                <i :class="[placeholderIcon || 'fas fa-box', placeholderIconClass || 'text-gray-500 dark:text-gray-400 text-lg']"></i>
            </div>
        </div>

        <!-- Text Content -->
        <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 dark:text-white truncate" :class="titleClass">
                {{ title || 'N/A' }}
            </div>
            <div v-if="subtitle || subtitleKey" class="text-xs text-gray-500 dark:text-gray-400 truncate"
                :class="subtitleClass">
                {{ displaySubtitle }}
            </div>
            <div v-if="$slots.extra" class="mt-0.5">
                <slot name="extra" />
            </div>
        </div>

        <!-- Right Slot -->
        <div v-if="$slots.right" class="flex-shrink-0">
            <slot name="right" />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    // Image
    imageSrc: {
        type: String,
        default: ''
    },
    imageAlt: {
        type: String,
        default: ''
    },
    imageClass: {
        type: String,
        default: ''
    },
    imageContainerClass: {
        type: String,
        default: ''
    },
    fallbackImage: {
        type: String,
        default: ''
    },

    // Placeholder
    placeholderIcon: {
        type: String,
        default: 'fas fa-box'
    },
    placeholderIconClass: {
        type: String,
        default: 'text-gray-500 dark:text-gray-400 text-lg'
    },
    placeholderBgClass: {
        type: String,
        default: ''
    },

    // Title
    title: {
        type: String,
        default: ''
    },
    titleClass: {
        type: String,
        default: ''
    },

    // Subtitle
    subtitle: {
        type: String,
        default: ''
    },
    subtitleKey: {
        type: String,
        default: ''
    },
    subtitleClass: {
        type: String,
        default: ''
    },

    // Item (for dynamic data)
    item: {
        type: Object,
        default: () => ({})
    },

    // Image size
    size: {
        type: String,
        default: 'md', // sm, md, lg, xl
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },

    // Shape
    shape: {
        type: String,
        default: 'rounded', // rounded, circle, square
        validator: (value) => ['rounded', 'circle', 'square'].includes(value)
    },

    // Border
    border: {
        type: Boolean,
        default: true
    },

    // Truncate
    truncate: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['image-error'])

// ============ Computed ============
const displaySubtitle = computed(() => {
    if (props.subtitle) return props.subtitle
    if (props.subtitleKey && props.item) {
        const keys = props.subtitleKey.split('.')
        let value = props.item
        for (const key of keys) {
            if (value && typeof value === 'object') {
                value = value[key]
            } else {
                return '-'
            }
        }
        return value || '-'
    }
    return '-'
})

const imageSizeClass = computed(() => {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-14 w-14'
    }
    return sizes[props.size] || sizes.md
})

const imageShapeClass = computed(() => {
    const shapes = {
        rounded: 'rounded-lg',
        circle: 'rounded-full',
        square: 'rounded-none'
    }
    return shapes[props.shape] || shapes.rounded
})

const imageBorderClass = computed(() => {
    return props.border ? 'border border-gray-200 dark:border-gray-600' : ''
})

const containerClass = computed(() => {
    return `${imageSizeClass.value} ${imageShapeClass.value} ${imageBorderClass.value} ${props.imageContainerClass}`
})

// ============ Methods ============
const handleImageError = () => {
    if (props.fallbackImage) {
        // Emit event to handle fallback
        emit('image-error')
    }
}
</script>

<!-- 


<ImageTextColumn
        :image-src="imageSrc"
        :image-alt="imageAlt"
        :image-class="imageClass"
        :image-container-class="imageContainerClass"
        :placeholder-icon="placeholderIcon"
        :placeholder-icon-class="placeholderIconClass"
        :placeholder-bg-class="placeholderBgClass"
        :title="title"
        :title-class="titleClass"
        :subtitle="subtitle"
        :subtitle-key="subtitleKey"
        :subtitle-class="subtitleClass"
        :item="item"
        :size="size"
        :shape="shape"
        :border="border"
        :truncate="truncate"
        @image-error="handleImageError"
      >
      <ImageTextColumn :image-src="data.image_url" :title="data.name" :subtitle="`SKU: ${data.sku || '-'}`" size="md"
        shape="rounded" />

        <ImageTextColumn :item="product" :image-src="product.image_url" :title="product.name" subtitle-key="sku" size="lg"
            shape="circle" />
      
      -->

