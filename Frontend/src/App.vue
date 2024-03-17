<template class="overflow-scroll">
  <div class="w-full min-h-screen bg-gradient-to-r from-indigo-500 to-indigo-300">
    <div v-if="isLogin" class="w-full h-full grid grid-cols-6">
      <div class="min-h-screen h-auto col-span-1 sidebar">
        <div class="w-full sidebar-menu">
          <router-link to="/" :active-class="'bg-gray-100 text-black'" class="link" >Home</router-link>
        </div>
        <div class="w-full sidebar-menu">
          <router-link to="/client-block" :active-class="'bg-gray-100 text-black'" class="link">Allowed Client</router-link>
        </div>
        <div class="w-full sidebar-menu">
          <router-link to="/stats" :active-class="'bg-gray-100 text-black'" class="link">DNS Stats</router-link>
        </div>
        <div class="w-full sidebar-menu">
          <router-link to="/dns-log" :active-class="'bg-gray-100 text-black'" class="link">Dns Log</router-link>
        </div>
        <div class="w-full sidear-menu">
          <router-link to="/domain-block" :active-class="'bg-gray-100 text-black'" class="link">Domain Block</router-link>
        </div>
        <div class="w-full sidebar-menu">
          <router-link to="/dns-cache" :active-class="'bg-gray-100 text-black'" class="link">DNS Cache</router-link>
        </div>
      </div>
      <div class="col-span-5">
        <router-view class="pt-5"/>
      </div>
    </div>
    <div v-else class="w-full h-full">
      <router-view class="pt-5"/>
    </div>
  </div>
</template>

<script>
  export default {
    data() { 
      return {
        isLogin: false,
      }
    },
    beforeMount(){
      const usercookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user='))
      if (usercookie){
        this.isLogin = true
      }
    },
  }
</script>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

.sidebar {
  font-weight: bold;
  color: white;
  text-align: start;
  /* padding-left: calc(10%); */
  background-color: #413f54;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

.link {
  display: inline-block;
  width: 100%;
  height: 100%;
  padding-left: calc(10%);
  padding-top: calc(5%);
  padding-bottom: calc(5%);
}

nav a.router-link-exact-active {
  color: #42b983;
}

thead {
    background-color: #413f54; 
    color: white;
}

tbody tr:nth-of-type(even) {
    background-color: #c6e9de;
}
</style>