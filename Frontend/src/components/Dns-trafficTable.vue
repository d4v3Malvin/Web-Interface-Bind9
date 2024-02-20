<template>
    <div class="w-full min-h-full">
        <h1 class="text-2xl text-center">BIND DNS History Log</h1>
        <div class="w-full h-auto">
            
            <div v-if="isrefresh">
                <h1 class="text-white text-2xl">Refreshing...</h1>
            </div>
            <div class="flex-row w-full" v-if="tableData.length && !loading">
                <div class="w-full flex justify-center">
                    <div class="w-4/5 h-min grid grid-cols-5 py-5">
                        <div class="col-span-2">
                            <Multiselect class="w-full" v-model="selectedcat" :options="category" />
                        </div>
                        <div class="text-center flex flex-col justify-center items-center">Search :</div>
                        <div class="flex flex-col justify-center items-center">
                            <input class="w-3/4 h-3/5" type="text" v-model="searchQuery">
                        </div>
                        <div class="flex flex-col justify-center items-center">
                            <button @click="refreshlist()" class="w-full h-3/4 w-3/4 bg-purple-200">Refresh</button>
                        </div>
                    </div>
                </div>
                <div class="w-full flex justify-center">
                    <table class="table w-4/5 bg-white text-sm" data-toogle="table">
                        <thead class="table-row-group">
                            <tr class="table-row">
                                <th class="table-cell p-1 text-white" v-for="column in columns" :key=column>{{ column }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="table-row text-wrap" v-for="data in filteredPageData" :key="data">
                                <td class="table-cell p-1">{{ data.type }}</td>
                                <td class="table-cell p-1 ">{{ data.domain }}</td>
                                <td class="table-cell p-1 ">{{ data.ip_source }}</td>
                                <td class="table-cell p-1 ">{{ data.dns_type }}</td>
                                <td class="table-cell p-1 ">{{ data.date }}</td>
                                <td class="table-cell p-1 ">{{ data.time }}</td>
                                <td class="table-cell p-1 ">{{ data.note }}</td>
                                <td class="table-cell p-1 ">
                                    <button class="w-2/5 mx-1 py-0.5 bg-green-700 text-white rounded-md" @click="add_domain_block(data.domain)" >Domain</button>
                                    <button class="w-2/5 mx-1 py-0.5 bg-blue-700 text-white rounded-md" @click="add_client_block(data.ip_source)">Client</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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
            <div class="pt-2" v-else>
                <h1 class="text-center text-xl">NO DATA, Loading ...</h1>
            </div>
        </div>
    </div>
</template>

<script>

    import axios from 'axios'
    import Multiselect from '@vueform/multiselect'

    let max = 10
    let start = 1

    async function createwsconnection(){
        try {
            await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-dns-traffic`)
            
            this.ws = new WebSocket(`ws://${process.env.VUE_APP_HOST_API}:3000`)

            this.ws.onmessage = (event) => {
                this.tableData = JSON.parse(event.data).reverse()
                console.log(event.data)
                this.loading = false
            }
        } catch (error) {
            console.error("There was an error fetching the data", error);
        }
    }

    export default  {
        components: {
            Multiselect,
        },
        data() {
            return {
                loading: true,
                columns: ['type', 'Domain', 'Ip Address', 'Dns Type','Date','Time','Note','Add to block'],
                isrefresh: false,
                selectedcat: "queries",
                category: ['queries','rpz','query-errors'],
                tableData: [],
                ws : null,
                currentpage: 1,
                totalitem: 10,
                searchQuery: '',
                prevSearchQuery: '',
                totalfilterdata: 0,
                topsuccessdomain: [],
                topblockeddomain: []
            }
        },
        computed: {
            totalpage() {
                return Math.ceil(this.tableData.length / this.totalitem)
            },
            totalpagefilter(){
                return Math.ceil(this.datafilter().length / this.totalitem)
            },
            filteredPageData() {

                const start = (this.currentpage - 1) * this.totalitem
                const end = start + this.totalitem

                // this.gettopsuccessdomain()
                // this.gettopblockeddomain()

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
        mounted() {
        },
        created() {
            this.fetchData()
        },
        methods: {
            async fetchData() {
                try {
                    this.loading = true
                    createwsconnection.call(this)
                    
                    setInterval(() => {
                        this.loading = true
                        this.ws.close();
                        this.ws.onclose = () => {
                            createwsconnection.call(this)
                        }
                    }, 60000);
                     
                } catch (error) {
                    this.error = "Error fetching data";
                    console.error("There was an error fetching the data", error);
                }
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
            datafilter(){
            
                let pagedata;

                if (this.searchQuery != this.prevSearchQuery) {
                        this.currentpage = 1
                        this.prevSearchQuery = this.searchQuery // Store the previous search query
                }

                if (this.searchQuery.toString().trim().length == 0){
                    const filtered = this.tableData.filter((data) => {
                        if (data.type == this.selectedcat){
                            return (
                                data.type ||
                                data.domain || 
                                data.ip_source ||
                                data.dns_type || 
                                data.date ||
                                data.time
                            )
                        }
                    })
                    pagedata = filtered
                }
                else{
                    const filtered = this.tableData.filter((data) => {
                        if (data.type == this.selectedcat){
                            return (
                                data.type.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                data.domain.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                data.ip_source.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                data.dns_type.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                data.date.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                data.time.toLowerCase().includes(this.searchQuery.toLowerCase())
                            );
                        }
                    });

                    pagedata =  filtered
                }

                return pagedata
            },
            invokeFirst(){
                start = 1
                max = this.totalitem
                this.jumppage(1)
            },
            invokeLast(){
                max = this.totalpagefilter
                let a = 0
                if (max % this.totalitem == 0){
                    a = this.totalitem
                }
                else{
                    a = max % this.totalitem -1
                }
                start = max - a
                this.jumppage(this.totalpagefilter)
            },
            async refreshlist(){
                try {
                    // Replace with your API endpoint
                    this.isrefresh = true
                    this.ws.close();
                    this.ws.onclose = () => {
                        createwsconnection.call(this)
                        this.isrefresh = false
                    }
                } catch (error) {
                    this.error = "Error fetching data";
                    alert(error)
                    console.error("There was an error fetching the data", error);
                }
            },
            add_domain_block(domain) {
                let domaindata = {
                    domain: domain,
                    type: 'domain'
                }
                if (confirm("Are you sure you want to block this domain?")){
                    axios.post(`http://${process.env.VUE_APP_HOST_API}:3000/add-dns-block`, domaindata)
                    .then(response => {
                        alert(response.data)
                        this.refreshlist()
                    })
                }
            },
            add_client_block(ip){
                const block = 32;
                let clientData = {
                    ip: ip,
                    blocks: block.toString()
                }
                if (confirm("Are you sure you want to block this client ip?")){
                    axios.post(`http://${process.env.VUE_APP_HOST_API}:3000/add-ip-block`, clientData)
                    .then(response => {
                        alert(response.data)
                        this.refreshlist()
                    })
                }
            }
        },
        beforeUnmount() {
            if (this.ws){
                this.ws.close()
            }
        }

    }
</script>

<style src="@vueform/multiselect/themes/default.css"></style>