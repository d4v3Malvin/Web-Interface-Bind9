<template>
    <div class="w-full h-full">
        <h1 class="text-2xl">DNS Stats</h1>
        <TopDomainTable/>
    </div>
</template>

<script>
import TopDomainTable from '@/components/topDomainTable.vue';

export default {
    components: {
        TopDomainTable,
    }
}
</script>