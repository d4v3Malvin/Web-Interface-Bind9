<template>
  <div class="w-full min-h-screen bg-gradient-to-r from-indigo-500 to-indigo-300">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/dns-log">Dns Log</router-link> | 
      <router-link to="/domain-block">Domain Block</router-link> |
      <router-link to="/dns-cache">DNS Cache</router-link>
    </nav>
    <router-view/>
  </div>
</template>

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

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
