<template>
    <div class="w-full min-h-full">
        <h1 class="text-2xl text-center">BIND DNS History Log</h1>
        <div class="w-full h-auto">
            <div v-if="isrefresh">
                <h1 class="text-white text-2xl">Refreshing...</h1>
            </div>
            <div class="flex-row w-full" v-if="!loading">
                <div class="w-full flex justify-center">
                    <div class="w-4/5 h-min grid grid-cols-8 py-5">
                        <div class="flex flex-col justify-center items-center col-span-4">
                            <Multiselect class="w-full" v-model="selectedcat" :options="category" />
                        </div>
                        <div class="flex flex-col justify-center items-end col-span-4">
                            <button @click="refreshlist()" class="h-full w-3/4 bg-purple-200 rounded-md">Refresh</button>
                        </div>
                        <div class="flex flex-col justify-center items-start col-span-3 mt-3">
                            <input class="w-4/5 h-full text-l rounded-md" placeholder="Domain Search" name="query" type="text" v-model="searchQuery">
                        </div>
                        <div class="w-full flex flex-col justify-center items-center col-span-3 mt-3">
                            <div class="w-full" id="daterange">
                                <div class="w-5/6"><VueDatePicker v-model="date" range :enable-time-picker="false"/></div>
                            </div>
                        </div>
                        <div class="flex flex-col justify-center items-center col-span-2 mt-3">
                            <button @click="checkval()" style="margin-left: calc(5%);" class="w-full h-full bg-purple-200 rounded-md">Search</button>
                        </div>
                    </div>
                </div>
                <div class="w-full flex justify-center">
                    <table class="table w-4/5 bg-white text-sm table-fixed" data-toogle="table">
                        <thead class="table-row-group">
                            <tr class="table-row">
                                <td class="table-cell w-1/12 p-0.5 text-prety">type</td>
                                <td class="table-cell w-3/12 p-0.5 text-prety">Domain</td>
                                <td class="table-cell w-2/12 p-0.5 text-prety">Ip Address</td>
                                <td class="table-cell w-1/12 p-0.5 text-prety">Dns Type</td>
                                <td class="table-cell w-1/12 p-0.5 text-prety">Date</td>
                                <td class="table-cell w-1/12 p-0.5 text-prety">Time</td>
                                <td class="table-cell w-2/12 p-0.5 text-prety">Note</td>
                                <td class="table-cell w-1/12 py-0.5 text-prety">Add to Block</td>
                            </tr>
                        </thead>
                        <tbody v-if="this.totalpages > 0">
                            <tr class="table-row" v-for="data in this.tableData" :key="data">
                                <td class="table-cell p-0.5 text-prety">{{ data.type }}</td>
                                <td class="table-cell p-0.5 whitespace-pre-line break-words text-pretty">{{ data.domain }}</td>
                                <td class="table-cell p-0.5 text-prety">{{ data.ip_source }}</td>
                                <td class="table-cell p-0.5 text-prety">{{ data.dns_type }}</td>
                                <td class="table-cell p-0.5 text-prety">{{ getdate(data.date) }}</td>
                                <td class="table-cell p-0.5 text-prety">{{ gettime(data.date) }}</td>
                                <td class="table-cell p-0.5 whitespace-pre-line break-all text-prety">{{ data.note }}</td>
                                <td class="table-cell py-0.5 text-xs ">
                                    <div class="flex flex-row justify-center">
                                        <div class="w-4/5 grid grid-cols-1 space-y-1 py-1">
                                            <button class="w-full whitespace-pre-line break-all mx-0.5 py-1 bg-green-700 text-white rounded-md" @click="add_domain_block(data.domain,data.dns_type)" >Domain</button>
                                            <button class="w-full whitespace-pre-line break-all mx-0.5 py-1 bg-blue-700 text-white rounded-md" @click="add_client_block(data.ip_source)">Client</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody v-else>
                            <tr class="table-row text-wrap">
                                <td class="table-cell" colspan="8">No DNS Log</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="w-full flex justify-center py-4">
                    <button class="py-1 px-2 mx-1 border border-white text-white" @click="invokeFirst()" :disabled="currentpage === 1">First</button>
                    <button class="py-1 px-2 mx-1 border border-white text-white" @click="previouspage" :disabled="currentpage === 1">Previous</button>
                    <div v-for="pagenumber in array_pages" :key="pagenumber">
                        <button class="py-1 px-2 mx-1 border" :class="currentpage == pagenumber ? 'border-black bg-white text-black' : 'border-white text-white'" :hidden="pagenumber > totalpages"  @click="jumppage(pagenumber)" >{{ pagenumber }}</button>
                    </div>
                    <button class="py-1 px-2 mx-1 border border-white text-white" @click="nextpage" :disabled="currentpage >= totalpages">Next</button>
                    <button class="py-1 px-2 mx-1 border border-white text-white" @click="invokeLast()" :disabled="currentpage >= this.totalpages">Last</button>
                </div>
            </div>
            <div class="pt-2" v-else>
                <h1 class="text-center text-xl">Loading ...</h1>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import moment from 'moment'
    import Multiselect from '@vueform/multiselect'
    import VueDatePicker from '@vuepic/vue-datepicker';
    import '@vuepic/vue-datepicker/dist/main.css'

    let startpoint = 1

    export default  {
        components: {
            Multiselect,
            VueDatePicker
        },
        data() {
            return {
                loading: true,
                isrefresh: false,
                selectedcat: "queries",
                category: ['queries','rpz','query-errors'],
                tableData: [],
                currentpage: 1,
                totalitem: 10,
                searchQuery: '',
                prevSearchQuery: '',
                date: null,
                totalpages: 0,
                array_pages: []
            }
        },
        created() {
            this.fetchData()
        },
        watch: {
            selectedcat() {
                this.invokeFirst()
                this.getdata()
            },
            currentpage() {
                this.getdata()
            }
        },
        methods: {
            async getdata(start= undefined, end= undefined){
                await this.calculaterangepage(start,end)
                const data = {search: this.searchQuery}
                if (start && end){
                    data.start = moment(start).toISOString()
                    data.end = moment(end).toISOString()
                }
                else{
                    data.start = ""
                    data.end = ""
                }
                const params = new URLSearchParams(data)
                let response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-dns-log/${this.currentpage}/${this.selectedcat}?${params.toString()}`)
                this.tableData = response.data
                this.loading = false
            },
            async getdatacount(start= undefined, end= undefined){
                const data = {search: this.searchQuery}
                if (start && end){
                    data.start = moment(start).toISOString()
                    data.end = moment(end).toISOString()
                }
                else{
                    data.start = ""
                    data.end = ""
                }
                const params = new URLSearchParams(data)
                let response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-count/${this.selectedcat}?${params.toString()}`)
                console.log(response.data.count)
                this.totalpages = Math.ceil(response.data.count / this.totalitem)
            },
            async fetchData() {
                try {
                    this.loading = true
                    this.getdata()
                    setInterval(() => {
                        this.loading = true
                        this.getdata()
                    }, 60000);
                     
                } catch (error) {
                    this.error = "Error fetching data";
                    console.error("There was an error fetching the data", error);
                }
            },
            gettime(datetime){
                return moment(datetime).format('LTS')
            },
            getdate(datetime){
                return moment(datetime).format('ll')
            },
            async calculaterangepage(start= undefined, end= undefined){
                await this.getdatacount(start,end)
                let current_stop = startpoint+(this.totalitem-1)
                let start_change = false

                if (this.currentpage > current_stop &&  this.currentpage - current_stop == 1){
                    startpoint = this.currentpage
                    start_change = true
                }
                else if (this.currentpage < startpoint && this.currentpage != 1){
                    startpoint = this.currentpage - (this.totalitem-1)
                    start_change = true
                }

                current_stop = startpoint+(this.totalitem-1)

                if (start_change || startpoint == 1) {
                    if (this.totalpages < current_stop){
                        current_stop = this.totalpages
                    }
                    this.array_pages = []

                    for (let i = startpoint; i<= current_stop; i++){
                        this.array_pages.push(i)
                    }
                }
            },
            nextpage(){
                if (this.currentpage < this.totalpages){
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
                startpoint = 1
                this.jumppage(1)
            },
            invokeLast(){
                startpoint = this.totalpages - (this.totalpages % 10)
                this.array_pages = []

                for (let i = startpoint; i<= startpoint+(this.totalitem - 1); i++){
                    this.array_pages.push(i)
                }
                this.jumppage(this.totalpages)
            },
            async refreshlist(){
                try {
                    // Replace with your API endpoint
                    this.isrefresh = true
                    this.getdata()
                    this.isrefresh = false
                } catch (error) {
                    this.error = "Error fetching data";
                    alert(error)
                    console.error("There was an error fetching the data", error);
                }
            },
            add_domain_block(domain,record) {
                let domaindata = {
                    domain: domain,
                    type: 'domain',
                    record: record,
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
            },
            checkval(){
                if (this.date !== null){
                    if (moment(this.date[0]).isValid() && moment(this.date[1]).isValid()){
                        this.getdata(this.date[0],this.date[1])
                    }
                }
                else{
                    this.getdata()
                }
            }
        }
    }
</script>

<style src="@vueform/multiselect/themes/default.css"></style>