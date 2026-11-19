<template>
    <button @click="exportPdf" :disabled="loading" :style="buttonStyle"
        class="flex items-center justify-center rounded-lg text-white transition-colors disabled:opacity-50">
        <i class="fas fa-file-pdf mr-2"></i>

        {{ loading ? 'Exporting...' : label }}
    </button>
</template>


<script setup>
import { ref, computed } from "vue";
import axiosClient from "@/axiosClient";
import { useToast } from "vue-toastification";

const toast = useToast();

const props = defineProps({
    apiUrl: {
        type: String,
        required: true
    },

    fileName: {
        type: String,
        default: "report"
    },

    label: {
        type: String,
        default: "Export PDF"
    },

    padding: {
        type: String,
        default: "px-4 py-2"
    },

    width: {
        type: String,
        default: "auto"
    },

    color: {
        type: String,
        default: "#0891b2"
    },

    params: {
        type: Object,
        default: () => ({})
    }
});


const loading = ref(false);


const buttonStyle = computed(() => ({
    padding: props.padding.replace("px-", "").replace("py-", ""),
    width: props.width,
    backgroundColor: props.color
}));



const exportPdf = async () => {

    loading.value = true;

    try {

        const query = new URLSearchParams({
            export: "pdf",
            format: "pdf",
            ...props.params
        });


        const response = await axiosClient.get(
            `${props.apiUrl}?${query}`,
            {
                responseType: "blob"
            }
        );


        const blob = new Blob(
            [response.data],
            {
                type: "application/pdf"
            }
        );


        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download =
            `${props.fileName}-${new Date().toISOString().split("T")[0]}.pdf`;


        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

        toast.success('PDF exported successfully');

    } catch (error) {

        toast.error('Failed to export PDF');

    } finally {

        loading.value = false;

    }

};

</script>

<!-- 
<ExportPdfButton
        api-url="/warehouse-stocks"
        file-name="RCCTLBD-warehouse-stocks"
        :params="{
            search: searchQuery,
            ...filters
        }"
        padding="px-5 py-3"
        width="160px"
        color="#0891b2"
    />
-->