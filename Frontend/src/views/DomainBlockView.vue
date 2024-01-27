<template>
    <div class="w-full h-full">
      <h1 class="text-2xl">Domain Block List</h1>
      <DomainBlockComponentVue/>
    </div>
</template>
  
  <script>
    import DomainBlockComponentVue from "@/components/DomainBlockComponent.vue";

    export default {
      components: {
        DomainBlockComponentVue,
      }
    }
  </script>