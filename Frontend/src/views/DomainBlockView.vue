<template>
    <div class="w-full h-full">
      <h1 class="text-2xl">Domain Block List</h1>
      <DomainBlockFormVue/>
      <DomainBlockComponentVue ref="domainBlockTable" />
    </div>
</template>
  
  <script>
    import DomainBlockComponentVue from "@/components/DomainBlockComponent.vue";
    import DomainBlockFormVue from "@/components/DomainBlockForm.vue"

    export default {
      components: {
        DomainBlockComponentVue,
        DomainBlockFormVue,
      }
    }
  </script>