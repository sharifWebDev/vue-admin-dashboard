<template>
    <div v-if="needRefresh" class="pwa-toast" role="alert">
        <div class="message">
            <span>নতুন আপডেট পাওয়া গেছে! রিফ্রেশ করুন।</span>
        </div>
        <div class="actions">
            <button class="update-btn" @click="updateServiceWorker()">Update</button>
            <button class="close-btn" @click="close">Close</button>
        </div>
    </div>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

// এই হুকটি অটোমেটিক সার্ভিস ওয়ার্কার রেজিস্টার করে
const {needRefresh, updateServiceWorker} = useRegisterSW({
    onRegistered(r) {console.log('SW Registered: ', r)},
    onRegisterError(error) {console.error('SW registration error', error)}
})

const close = () => {
    needRefresh.value = false
}
</script>

<style scoped>
.pwa-toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    padding: 15px;
    border-radius: 8px;
    background: #2c3e50;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.actions {
    display: flex;
    gap: 8px;
}

button {
    cursor: pointer;
    border: none;
    padding: 5px 12px;
    border-radius: 4px;
}

.update-btn {
    background: #4DBA87;
    color: white;
    font-weight: bold;
}

.close-btn {
    background: #eee;
    color: #333;
}
</style>