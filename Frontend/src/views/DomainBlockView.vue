<template>
    <div class="w-full h-full">
      <h1 class="text-2xl">Domain Block List</h1>
      <DomainBlockFormComponentVue/>
      <DomainBlockComponentVue ref="domainBlockTable" />
    </div>
</template>
  
  <script>
    import DomainBlockComponentVue from "@/components/DomainBlockComponent.vue";
    import DomainBlockFormComponentVue from "@/components/DomainBlockFormComponent.vue"

    export default {
      components: {
        DomainBlockComponentVue,
        DomainBlockFormComponentVue,
      }
    }
  </script>