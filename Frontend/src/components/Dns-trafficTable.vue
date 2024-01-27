<template>
    <div class="w-full min-h-full">
        <div class="w-full h-auto">
            <div class="w-full grid grid-cols-2 px-10 py-3">
                <div class="w-full flex justify-center py-5" v-if="tableData.length && !loading">
                    <div class="w-3/5">
                        <h1 class="text-center p-5 text-xl text-white">Top Success Domain Request</h1>
                        <div class="flex justify-center w-full">
                            <table class="table w-full bg-white">
                                <thead class="table-row-group bg-blue-400">
                                    <tr>
                                        <th class="table-cell border border-black">Domain</th>
                                        <th class="table-cell border border-black">Request</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="table-row" v-for="domain in topsuccessdomain" :key="domain">
                                        <td class="table-cell border border-black">{{ domain[0] }}</td>
                                        <td class="table-cell border border-black" >{{ domain[1] }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="w-full flex justify-center py-5" v-if="tableData.length && !loading">
                    <div class="w-3/5">
                        <h1 class="text-center p-5 text-xl text-white">Top Blocked Domain Request</h1>
                        <div class="flex justify-center w-full">
                            <table class="table w-full bg-white">
                                <thead class="table-row-group bg-blue-400">
                                    <tr>
                                        <th class="table-cell border border-black">Domain</th>
                                        <th class="table-cell border border-black">Request</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="table-row" v-for="domain in topblockeddomain" :key="domain">
                                        <td class="table-cell border border-black">{{ domain[0] }}</td>
                                        <td class="table-cell border border-black" >{{ domain[1] }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-5 p-5">
                <div class="grid grid-cols-4 col-span-2">
                    <div/>
                    <Multiselect class="col-span-2" v-model="selectedcat" :options="category" />
                    <div/>
                </div>
                <div class="text-xl text-end pe-16">Search :</div>
                <div class="flex justify-start">
                    <input class="w-9/12 border border-black appearance-none" type="text" v-model="searchQuery">
                </div>
                <div class="flex justify-start">
                    <button @click="refreshlist()" class="border py-2 px-7 bg-purple-200">Refresh</button>
                </div>
            </div>
            <div v-if="isrefresh">
                <h1 class="text-white text-2xl">Refreshing...</h1>
            </div>
            <h1 class="text-2xl text-center pb-10 pt-5">BIND DNS History Log</h1>
            <div class="flex-row w-full" v-if="tableData.length && !loading">
                <div class="w-full flex justify-center">
                    <table class="table w-4/5 bg-white" data-toogle="table">
                        <thead class="table-row-group">
                            <tr class="table-row bg-blue-400">
                                <th class="table-cell p-2 border border-black text-white" v-for="column in columns" :key=column>{{ column }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="table-row" v-for="data in filteredPageData" :key="data">
                                <td class="table-cell p-2 border border-black">{{ data.type }}</td>
                                <td class="table-cell p-2 border border-black">{{ data.domain }}</td>
                                <td class="table-cell p-2 border border-black">{{ data.ip_source }}</td>
                                <td class="table-cell p-2 border border-black">{{ data.dns_type }}</td>
                                <td class="table-cell p-2 border border-black">{{ data.date }}</td>
                                <td class="table-cell p-2 border border-black">{{ data.time }}</td>
                                <td class="table-cell p-2 border border-black">{{ data.note }}</td>
                                <td class="table-cell p-2 border border-black">
                                    <button class="p-2 bg-green-400">Add to Domain Block</button>
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
                columns: ['type', 'Domain', 'Ip Address', 'Dns Type','Date','Time','Note','Action'],
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

                this.gettopsuccessdomain()
                this.gettopblockeddomain()

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
            gettopsuccessdomain(){
                let domainlist = []
                let rpz = []

                this.tableData.map(object => {
                    if (object.type == "rpz"){
                        if (!rpz.includes(object.domain)){
                            rpz.push(object.domain)
                        }
                    }
                })

                this.tableData.map(object => {

                    if (object.type == "queries"){
                        

                        if (domainlist[object.domain]){
                            domainlist[object.domain]++
                        }
                        else{
                            domainlist[object.domain] = 1
                        }
                    }
                })

                for (let i = 0; i < rpz.length; i++) {
                    const rpzdomain = rpz[i];
                    domainlist[rpzdomain] = 0
                }

                let sorteddomain = Object.entries(domainlist).sort((a,b) => b[1] - a[1])

                sorteddomain = sorteddomain.slice(0,10  )

                this.topsuccessdomain = sorteddomain

            },
            gettopblockeddomain(){
                let domainlist = []
                let rpz = []

                this.tableData.map(object => {
                    if (object.type == "rpz"){
                        if (!rpz.includes(object.domain)){
                            rpz.push(object.domain)
                        }
                    }
                })

                this.tableData.map(object => {

                    if (rpz.includes(object.domain))
                    {
                        if (domainlist[object.domain]){
                            domainlist[object.domain]++
                        }
                        else{
                            domainlist[object.domain] = 1
                        }
                    }
                })

                let sorteddomain = Object.entries(domainlist).sort((a,b) => b[1] - a[1])

                sorteddomain = sorteddomain.slice(0,10)

                this.topblockeddomain = sorteddomain
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
                    }
                } catch (error) {
                    this.error = "Error fetching data";
                    alert(error)
                    console.error("There was an error fetching the data", error);
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