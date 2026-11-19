<template>
  <thead class="bg-gray-100 dark:bg-gray-800">
    <tr>
      <th v-if="showCheckboxColumn" scope="col"
        class="w-10 px-2 py-2 text-center sm:px-3 sm:py-3 md:px-4">
        <TableCheckBoxRow :model-value="selectedIds" :row-ids="items.map(item => item.id)" select-all
          @update:model-value="emit('selection-change', $event)" />
      </th>

      <!-- SL Column -->
      <th v-if="showSlColumn" scope="col"
        class="max-w-[30px] cursor-pointer px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-3 sm:py-3 sm:text-xs md:px-4 dark:text-gray-400"
        @click="handleSort('id')" :class="{ 'bg-gray-100 dark:bg-gray-700': currentSortColumn === 'id' }">
        <div class="flex items-center justify-start">
          <span>S/L</span>
          <i :class="[
            'fas ml-1',
            currentSortColumn === 'id'
              ? currentSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
              : 'fa-sort text-gray-300'
          ]"></i>
        </div>
      </th>

      <!-- Dynamic Columns -->
      <th v-for="column in visibleColumns" :key="column.key"
        class="cursor-pointer px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-4 sm:py-3 sm:text-xs md:px-6"
        @click="handleSort(column.key)" :class="{
          'bg-gray-100 dark:bg-gray-700': currentSortColumn === column.key,
          'text-right': column.align === 'right'
        }" :style="column.width ? `width: ${column.width}` : ''">
        <div :class="['flex items-center', column.align === 'right' ? 'justify-end' : '']">
          <span>{{ column.label }}</span>
          <i v-if="column.sortable !== false" :class="[
            'fas ml-1',
            currentSortColumn === column.key
              ? currentSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
              : 'fa-sort text-gray-300'
          ]"></i>
        </div>
      </th>

      <!-- Actions Column -->
      <th v-if="showActionsColumn" scope="col"
        class="px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-4 sm:py-3 sm:text-xs md:px-6">
        Actions
      </th>
    </tr>
  </thead>
</template>

<script setup>
import { computed } from 'vue';
import TableCheckBoxRow from './TableCheckBoxRow.vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    default: () => []
  },

  // Sort State - Accept both string or object
  sortBy: {
    type: [String, Object],
    default: ''
  },
  sortDirection: {
    type: String,
    default: 'asc',
    validator: (value) => ['asc', 'desc'].includes(value)
  },

  // Column Visibility
  showSlColumn: {
    type: Boolean,
    default: true
  },
  showCheckboxColumn: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array,
    default: () => []
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  showActionsColumn: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['sort', 'selection-change']);

const visibleColumns = computed(() =>
  props.columns.filter(column => !(column.key === 'id' && column.type === 'false'))
);

// Computed properties to handle both cases
const currentSortColumn = computed(() => {
  if (typeof props.sortBy === 'string') {
    return props.sortBy;
  } else if (props.sortBy && typeof props.sortBy === 'object' && props.sortBy.column) {
    return props.sortBy.column;
  }
  return '';
});

const currentSortDirection = computed(() => {
  if (typeof props.sortBy === 'string') {
    return props.sortDirection;
  } else if (props.sortBy && typeof props.sortBy === 'object' && props.sortBy.direction) {
    return props.sortBy.direction;
  }
  return props.sortDirection || 'asc';
});

// Methods
const handleSort = (columnKey) => {
  const column = props.columns.find(col => col.key === columnKey);

  // Check if column is sortable
  if (column && column.sortable === false) {
    return;
  }

  let newDirection = 'asc';

  if (currentSortColumn.value === columnKey) {
    // Toggle direction if same column
    newDirection = currentSortDirection.value === 'asc' ? 'desc' : 'asc';
  }

  emit('sort', {
    column: columnKey,
    direction: newDirection
  });
};
</script>