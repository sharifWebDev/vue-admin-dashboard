<template>
    <button @click="exportExcel" :disabled="loading" :style="buttonStyle"
        class="flex items-center justify-center rounded-lg text-white transition-colors disabled:opacity-50">

        <i class="fas fa-file-excel mr-2"></i>

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
        default: "Export Excel"
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
        default: "#16a34a"
    },


    params: {
        type: Object,
        default: () => ({})
    }

});


const loading = ref(false);



const buttonStyle = computed(() => ({

    padding: props.padding,

    width: props.width,

    backgroundColor: props.color

}));



const exportExcel = async () => {


    loading.value = true;


    try {


        const query = new URLSearchParams({

            export: "excel",

            format: "excel",

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
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }

        );



        const url =
            window.URL.createObjectURL(blob);



        const link =
            document.createElement("a");



        link.href = url;


        link.download =
            `${props.fileName}-${new Date().toISOString().split("T")[0]}.xlsx`;



        document.body.appendChild(link);


        link.click();


        link.remove();



        window.URL.revokeObjectURL(url);

        toast.success('Excel exported successfully');



    } catch (error) {

        toast.error('Failed to export Excel');

    } finally {

        loading.value = false;

    }


};


</script>

<!-- 
<ExportExcelButton
        api-url="/warehouse-stocks"
        file-name="RCCTLBD-warehouse-stocks"
        :params="{
            search: searchQuery,
            ...filters
        }"
        padding="px-5 py-3"
        width="160px"
        color="#16a34a"
    />
-->