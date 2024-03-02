<template>
    <div class="w-full h-auto">
      <h1 class="text-2xl">Allowed Client</h1>
      <AllowedClientForm/>
      <AllowedClientTable ref="AllowedClientTable" />
    </div>
</template>
  
<script>
import AllowedClientForm from '@/components/AllowedClientForm.vue';
import AllowedClientTable from '@/components/AllowedClientTable.vue';

export default {
  components: {
    AllowedClientTable,
    AllowedClientForm,
  }
}
</script>