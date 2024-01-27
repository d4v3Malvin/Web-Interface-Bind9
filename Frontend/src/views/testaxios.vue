<template>
  <div>
    <h1>Data from API:</h1>
    <div v-text="data"></div>
    <!-- <ul v-if="data">
      <li v-for="item in data" :key="item.id">{{ item }}</li>
    </ul> -->
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios'

function parsetable(strdata){
  return strdata.split('|').filter(Boolean).map(item => {
    const part = item.split(',')

    return {
      type : part[0],
      date : part[1],
      time : part[2],
      ip: part[3],
      domain: part[4],
      dns_type: part[5] 
    }
  }).filter(Boolean)
}

export default {
  name: 'TestAxios',
  data() {
    return {
      data: null,
      error: null,
    };
  },
  mounted() {
    // Call our fetch function below once the component mounts
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        // Replace with your API endpoint
        const response = await axios.get('http://localhost:3000/execute?command=./script/extract_log.sh%20/var/log/bind/query.log');
        this.data =  parsetable(response.data.msg);
        console.log(this.data);
        // console.log(response.data)
      } catch (error) {
        this.error = "Error fetching data";
        console.error("There was an error fetching the data", error);
      }
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>

<!-- localhost:3000/execute?command=./script/extract_log.sh%20/var/log/bind/query.log -->