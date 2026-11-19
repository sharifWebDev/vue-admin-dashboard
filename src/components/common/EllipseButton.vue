<!-- components/common/EllipseDropdownButton.vue -->
<template>
    <div v-if="hasAnyPermission" class="inline-block text-left">
        <slot name="trigger" :toggle="toggleMenu" :is-open="menuOpen">
            <button ref="triggerRef" type="button" @click.stop="toggleMenu" :title="title" :class="triggerClass"
                data-ellipse-trigger>
                <component :is="triggerIcon" class="w-4 h-4" />
            </button>
        </slot>
    </div>

    <Teleport to="body">
        <div v-if="menuOpen" ref="menuRef" :style="[menuStyle, { width: `${menuWidth}px` }]" :class="menuClass">
            <div v-if="menuTitle" class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {{ menuTitle }}
                </h3>
            </div>

            <div class="py-1">
                <!-- Default Actions -->
                <!-- View -->
                <button v-if="showView" @click="handleAction('view')" type="button"
                    class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <component :is="icons.view" class="w-4 h-4 shrink-0 text-blue-500" />
                    <span class="font-medium">View</span>
                </button>

                <!-- Edit -->
                <button v-if="showEdit" @click="handleAction('edit')" type="button"
                    class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <component :is="icons.edit" class="w-4 h-4 shrink-0 text-yellow-500" />
                    <span class="font-medium">Edit</span>
                </button>

                <!-- Delete -->
                <button v-if="showDelete" @click="handleAction('delete')" type="button"
                    class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">
                    <component :is="icons.delete" class="w-4 h-4 shrink-0 text-red-500" />
                    <span class="font-medium">Delete</span>
                </button>

                <!-- Extra Actions from Slot -->
                <slot :close="closeMenu"></slot>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    nextTick,
    getCurrentInstance,
    useSlots,
} from 'vue';
import { EllipsisVertical, Eye, SquarePen, Trash2 } from 'lucide-vue-next';
import { usePermission } from '@/utils/permission';

const { can } = usePermission();
const instance = getCurrentInstance();
const slots = useSlots();

// Global openId — module scope, sob instance share kore
const openId = ref(null);
let idCounter = 0;

const props = defineProps({
    /** Permission slugs for each action */
    permissions: {
        type: Object,
        default: () => ({
            view: null,
            edit: null,
            delete: null,
        }),
    },

    /** Custom icons (optional override) */
    icons: {
        type: Object,
        default: () => ({
            view: Eye,
            edit: SquarePen,
            delete: Trash2,
        }),
    },

    /** Explicit toggle to force-hide buttons regardless of permissions/listeners */
    viewButton: { type: Boolean, default: true },
    editButton: { type: Boolean, default: true },
    deleteButton: { type: Boolean, default: true },

    menuTitle: { type: String, default: '' },
    title: { type: String, default: 'Actions' },
    triggerIcon: { type: [Object, Function], default: () => EllipsisVertical },
    triggerClass: {
        type: String,
        default: 'p-1.5 rounded-md bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-200',
    },
    menuClass: {
        type: String,
        default: 'origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none',
    },
    menuWidth: { type: Number, default: 176 },
    menuHeightFallback: { type: Number, default: 100 },
    // Allow extra props without warning
    showStatus: { type: Boolean, default: true },
});

const emit = defineEmits(['open', 'close', 'view', 'edit', 'delete']);

const myId = ++idCounter;
const triggerRef = ref(null);
const menuRef = ref(null);
const menuStyle = ref({ top: '0px', left: '0px' });

const menuOpen = computed(() => openId.value === myId);

/**
 * Detect if the parent attached an @view / @edit / @delete listener.
 * Works for both `@view` and `:onView` syntaxes.
 */
const hasListener = (name) => {
    const vnodeProps = instance?.vnode?.props || {};
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    return !!(
        vnodeProps[`on${capitalized}`] ||
        vnodeProps[`on${capitalized}Once`]
    );
};

// ✅ Show buttons only when:
//   1. Explicit prop is not false (viewButton/editButton/deleteButton)
//   2. User has the required permission
//   3. Parent actually attached the corresponding event listener
const showView = computed(
    () =>
        props.viewButton !== false &&
        can(props.permissions.view) &&
        hasListener('view')
);
const showEdit = computed(
    () =>
        props.editButton !== false &&
        can(props.permissions.edit) &&
        hasListener('edit')
);
const showDelete = computed(
    () =>
        props.deleteButton !== false &&
        can(props.permissions.delete) &&
        hasListener('delete')
);

// ✅ Trigger visible if at least one button will render, OR a custom slot is provided
const hasAnyPermission = computed(() => {
    if (showView.value || showEdit.value || showDelete.value) return true;
    // If parent uses default slot for custom menu items, keep trigger visible
    return !!slots.default;
});

const handleAction = (action) => {
    closeMenu();
    emit(action);
};

const toggleMenu = async (e) => {
    e?.stopPropagation();
    e?.preventDefault?.();

    if (menuOpen.value) {
        closeMenu();
        return;
    }

    // Onno sob dropdown force close
    openId.value = myId;
    emit('open');

    await nextTick();
    positionMenu();
};

const positionMenu = () => {
    if (!triggerRef.value) return;
    const rect = triggerRef.value.getBoundingClientRect();
    const menuHeight = menuRef.value?.offsetHeight ?? props.menuHeightFallback;
    const gap = 6;

    let left = rect.right - props.menuWidth;
    let top = rect.bottom + gap;

    if (left < 8) left = 8;
    if (left + props.menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - props.menuWidth - 8;
    }
    if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - gap;
    }
    if (top < 8) top = 8;

    menuStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 2147483647,
    };
};

const closeMenu = () => {
    if (openId.value === myId) {
        openId.value = null;
    }
    emit('close');
};

// Document click — capture phase
const onDocClick = (e) => {
    if (!menuOpen.value) return;

    // Menu nijer bhitore click hole ignore
    if (menuRef.value?.contains(e.target)) return;

    // Nijer trigger e click hole ignore
    if (triggerRef.value?.contains(e.target)) return;

    // Onno EllipseDropdown trigger e click hole oi ta handle korbe
    const clickedOnOtherTrigger = e.target.closest('[data-ellipse-trigger]');
    if (clickedOnOtherTrigger) closeMenu();

    closeMenu();
};

const onScrollOrResize = () => {
    if (menuOpen.value) positionMenu();
};

onMounted(() => {
    document.addEventListener('click', onDocClick, true);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick, true);
    window.removeEventListener('scroll', onScrollOrResize, true);
    window.removeEventListener('resize', onScrollOrResize);

    if (openId.value === myId) {
        openId.value = null;
    }
});

defineExpose({ closeMenu, openMenu: toggleMenu, isOpen: menuOpen });
</script>

<!--
==================== USAGE EXAMPLES ====================

1) Only edit + delete — View auto-hidden (no @view listener)
-----------------------------------------------------------
<EllipseButton
    :permissions="{ edit: 'categories.update', delete: 'categories.delete' }"
    @edit="editItem(data)"
    @delete="confirmDelete(data)"
/>

2) Explicitly disable view button (even if @view is attached)
-------------------------------------------------------------
<EllipseButton
    :permissions="{ view: 'categories.view', edit: 'categories.update', delete: 'categories.delete' }"
    :view-button="false"
    @view="viewItem(data)"
    @edit="editItem(data)"
    @delete="confirmDelete(data)"
/>

3) All three actions
--------------------
<EllipseButton
    :permissions="{ view: 'categories.view', edit: 'categories.update', delete: 'categories.delete' }"
    @view="viewItem(data)"
    @edit="editItem(data)"
    @delete="confirmDelete(data)"
/>

4) Custom menu items via default slot (trigger always visible)
--------------------------------------------------------------
<EllipseButton
    :permissions="{ edit: 'purchase_orders.update', delete: 'purchase_orders.delete' }"
    @edit="editItem(data)"
    @delete="confirmDelete(data)"
>
    <div class="py-1">
        <button
            v-if="data.status === 'draft'"
            @click="editItem(data.id)"
            v-permission="['purchase_orders.update']"
            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
            <i class="fas fa-edit text-yellow-500"></i>
            Edit
        </button>
    </div>
</EllipseButton>

5) Custom trigger via slot
--------------------------
<EllipseButton
    :permissions="{ edit: 'categories.update' }"
    @edit="editItem(data)"
>
    <template #trigger="{ toggle, isOpen }">
        <button @click="toggle" :class="{ 'ring-2 ring-blue-500': isOpen }">
            Actions
        </button>
    </template>
</EllipseButton>

-->