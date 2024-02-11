<template>
    <div class="w-full h-auto">
      <h1 class="text-2xl">Client Block</h1>
      <ClientBlockForm/>
      <ClientBlockTable ref="clientBlockTable" />
    </div>
</template>
  
<script>
import ClientBlockForm from '@/components/ClientBlockForm.vue';
import ClientBlockTable from '@/components/ClientBlockTable.vue';

export default {
  components: {
    ClientBlockTable,
    ClientBlockForm,
  }
}
</script>