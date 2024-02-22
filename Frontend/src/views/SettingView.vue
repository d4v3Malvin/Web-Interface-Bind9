<template>
    <div class="w-full min-h-screen">
        <h1 class="text-2xl">DNS Setting</h1>
        <SettingForm/>
    </div>
</template>

<script>

    import SettingForm from '@/components/SettingForm.vue';

    export default {
        components: {
            SettingForm,
        }
    }
</script>