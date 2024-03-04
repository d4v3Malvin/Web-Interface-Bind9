<template>
    <div>
        <div class="w-full grid grid-cols-5" v-if="!this.isloading">
            <div class="w-full"/>
            <div class="col-span-3">
                <div class="w-full pt-5">
                    <h1 class="text-center">Cache Size : {{ cacheSize }}</h1>
                </div>
                <div>
                    <div class="grid grid-cols-4 p-5">
                        <div><button @click="fetchData()" class="border py-2 px-7 bg-purple-200 rounded-md">Refresh</button></div>
                        <div class="text-xl">Search :</div>
                        <div><input class="w-9/12 border border-black appearance-none" type="text" v-model="searchQuery"></div>
                        <div><button @click="flushCache()" class="border py-2 px-7 bg-red-100 rounded-md">Flush Cache</button></div>
                    </div>
                </div>
                <div class="w-full">
                    <table class="table w-full bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Domain</th>
                                <th class="table-cell">Ttl</th>
                                <th class="table-cell">Type</th>
                                <th class="table-cell">Address</th>
                            </tr>
                        </thead>
                        <tbody v-if="filteredPageData.length > 0">
                            <tr class="table-row w-full" v-for="data in filteredPageData" :key="data">
                                <td class="table-cell w-50 px-2">{{ data.domain }}</td>
                                <td class="table-cell w-50 px-2">{{ data.ttl }}</td>
                                <td class="table-cell w-50 px-2">{{ data.type }}</td>
                                <td class="table-cell w-50 px-2">{{ data.address }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else>
                            <tr class="table-row w-full">
                                <td class="table-cell" colspan="4">No DNS Cache yet</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <div class="w-full flex justify-center py-4">
                        <button class="py-1 px-2 mx-1 border border-white text-white" @click="invokeFirst()" :disabled="currentpage === 1">First</button>
                        <button class="py-1 px-2 mx-1 border border-white text-white" @click="previouspage" :disabled="currentpage === 1">Previous</button>
                        <div v-for="pagenumber in pageNumbers" :key="pagenumber">
                            <button class="py-1 px-2 mx-1 border" :class="currentpage == pagenumber ? 'border-black bg-white text-black' : 'border-white text-white'" :hidden="pagenumber > totalpagefilter"  @click="jumppage(pagenumber)" >{{ pagenumber }}</button>
                        </div>
                        <button class="py-1 px-2 mx-1 border border-white text-white" @click="nextpage" :disabled="currentpage === totalpage">Next</button>
                        <button class="py-1 px-2 mx-1 border border-white text-white" @click="invokeLast()" :disabled="currentpage === this.totalpage">Last</button>
                    </div>
                </div>
            </div>
            <div class="w-full"/>
        </div>
        <div class="w-full" v-else>
            <h1 class="text-center">Loading...</h1>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'

    let max = 10
    let start = 1

    export default {
        data(){
            return{
                ListCache: [],
                cacheSize: "",
                currentpage: 1,
                totalitem: 7,
                searchQuery: '',
                prevSearchQuery: '',
                totalfilterdata: 0,
                isloading: false,
            }
        },
        computed: {
            totalpage() {
                return Math.ceil(this.ListCache.length / this.totalitem)
            },
            totalpagefilter(){
                return Math.ceil(this.datafilter().length / this.totalitem)
            },
            filteredPageData() {
                
                const start = (this.currentpage - 1) * this.totalitem
                const end = start + this.totalitem

                return this.datafilter().slice(start,end)
            },
            pageNumbers() {
                let pagelist = []
                let limit = max
                let indexis = start

                if (this.currentpage > limit){
                    indexis+=10
                    limit=indexis+9
                }
                else if (this.currentpage < indexis && this.currentpage > 1){
                    indexis-=10
                    limit=indexis+9
                }

                for (let i = indexis; i <= limit; i++){
                    pagelist.push(i);
                }

                start = indexis
                max = limit

                return pagelist
            }
        },
        created() {
            this.fetchData()
        },
        mounted() {
        },
        methods: {
            async fetchData() {
                try {
                    // Replace with your API endpoint
                    this.isloading = true
                    const response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-dns-cache`);
                    this.ListCache = response.data.cache
                    this.cacheSize = response.data.size
                    this.isloading = false
                } catch (error) {
                    this.error = "Error fetching data";
                    console.error("There was an error fetching the data", error);
                }
            },
            async flushCache() {
                if (confirm("Are you sure you want to flush the cache?")){
                    try {
                        // Replace with your API endpoint
                        await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/flush-cache`);
                        this.fetchData()
                    } catch (error) {
                        console.error("Error : ", error);
                    }
                }
            },
            datafilter(){
            
                let pagedata;

                if (this.searchQuery != this.prevSearchQuery) {
                        this.currentpage = 1
                        this.prevSearchQuery = this.searchQuery // Store the previous search query
                }

                if (this.searchQuery.toString().trim().length == 0){
                    pagedata = this.ListCache
                }
                else{
                    const filtered = this.ListCache.filter((data) => {
                        return (
                            data.domain.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            data.address.toLowerCase().includes(this.searchQuery.toLowerCase())
                        );
                    });

                    pagedata =  filtered
                }

                return pagedata
            },
            nextpage(){
                if (this.currentpage < this.totalpagefilter){
                    this.currentpage++
                }
            },
            previouspage() {
                if (this.currentpage > 1) {
                    this.currentpage--
                }
            },
            jumppage(pagenum){
                this.currentpage = pagenum
            },
            invokeFirst(){
                start = 1
                max = this.totalitem
                this.jumppage(1)
            },
            invokeLast(){
                max = this.totalpage
                let a = 0
                if (max % 10 == 0){
                    a = 10
                }
                else{
                    a = (max % 10)
                }
                start = max - a + 1
                this.jumppage(max)
            }
        }
    }
</script>

<style src="@vueform/multiselect/themes/default.css"></style>