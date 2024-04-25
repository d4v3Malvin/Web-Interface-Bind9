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
                        <div class="flex flex-col justify-center items-center col-span-2">
                            <Multiselect class="w-full" v-model="selectedcat" :options="category" />
                        </div>
                        <div class="flex flex-col justify-center items-center col-span-2">
                            <input class="w-4/5 h-3/5 text-l" placeholder="Search" name="query" type="text" v-model="searchQuery">
                        </div>
                        <div class="w-full flex flex-col justify-center items-center col-span-3">
                            <div class="w-full" id="daterange">
                                <input class="w-2/6 text-l" style="margin-right: calc(5%);" v-model="datestart" type="text" ref="datestart">
                                <input class="w-2/6 text-l" v-model="datefinish" type="text" ref="datedone">
                                <button @click="checkval()" style="margin-left: calc(5%);" class="w-1/6 bg-purple-200 rounded-md">Search</button> 
                            </div>
                        </div>
                        <div class="flex flex-col justify-center items-center">
                            <button @click="refreshlist()" class="h-3/4 w-3/4 bg-purple-200 rounded-md">Refresh</button>
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
                        <tbody v-if="datafilter().length > 0">
                            <tr class="table-row" v-for="data in this.tableData" :key="data">
                                <td class="table-cell p-0.5 text-prety">{{ data.type }}</td>
                                <td class="table-cell p-0.5 whitespace-pre-line break-words text-pretty">{{ data.domain }}</td>
                                <td class="table-cell p-0.5 text-prety">{{ data.ip_source }}</td>
                                <td class="table-cell p-0.5 text-prety">{{ data.dns_type }}</td>
                                <td class="table-cell p-0.5 text-prety">{{ data.date }}</td>
                                <td class="table-cell p-0.5 text-prety">{{ data.time }}</td>
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
    import Multiselect from '@vueform/multiselect'
    import { DateRangePicker } from 'vanillajs-datepicker'

    let daterangeone

    let start = 1

    export default  {
        components: {
            Multiselect,
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
                datestart: '',
                prevdatestart: '',
                datefinish: '',
                prevdatefinish: '',
                totalpages: 0,
                array_pages: []
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

                return this.datafilter().slice(start,end)
            }
        },
        mounted() {
            this.getdatacount()
            this.calculaterangepage()
        },
        updated() {
            this.$nextTick(() => {
                if (document.getElementById('daterange')){
                    daterangeone = new DateRangePicker(document.getElementById('daterange'),{format : 'dd/mm/yyyy'})
                    daterangeone.setDates( this.datestart, this.datefinish )
                }
            })
        },
        created() {
            this.calculaterangepage()
            this.fetchData()
        },
        watch: {
            selectedcat() {
                this.invokeFirst()
                this.getdata()
            },
            currentpage() {
                this.calculaterangepage()
                this.getdata()
            }
        },
        methods: {
            async importdata(){
                let response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-dns-log`)
                this.tableData = response.data
                this.tableData.reverse()
                this.loading = false
            },
            async getdata(){
                let response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-dns-log/${this.currentpage}/${this.selectedcat}`)
                this.tableData = response.data
                this.loading = false
            },
            async getdatacount(){
                let response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-count`)
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
            calculaterangepage(){
                let current_stop = start+(this.totalitem-1)
                let start_change = false

                if (this.currentpage > current_stop &&  this.currentpage - current_stop == 1){
                    start = this.currentpage
                    start_change = true
                }
                else if (this.currentpage < start && this.currentpage != 1){
                    start = this.currentpage - (this.totalitem-1)
                    start_change = true
                }

                if (start_change || start == 1) {
                    this.array_pages = []

                    for (let i = start; i<= start+9; i++){
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
            datafilter(){
            
                let pagedata;

                if (this.searchQuery != this.prevSearchQuery) {
                    this.currentpage = 1
                    this.prevSearchQuery = this.searchQuery // Store the previous search query
                }

                if (this.datestart != this.prevdatestart || this.datefinish != this.prevdatefinish) {
                    this.currentpage = 1
                    this.prevdatestart = this.datestart
                    this.prevdatefinish = this.datefinish
                }

                if (this.searchQuery.toString().trim().length == 0){
                    const filtered = this.tableData.filter((data) => {
                        if (data.type == this.selectedcat){
                            return data
                        }
                    })
                    pagedata = filtered
                }
                else{
                    const filtered = this.tableData.filter((data) => {
                        if (data.type == this.selectedcat){
                            return (
                                data.type.toString().toLowerCase().includes(this.searchQuery.toString().toLowerCase()) ||
                                data.domain.toString().toLowerCase().includes(this.searchQuery.toString().toLowerCase()) ||
                                data.ip_source.toString().toLowerCase().includes(this.searchQuery.toString().toLowerCase()) ||
                                data.dns_type.toString().toLowerCase().includes(this.searchQuery.toString().toLowerCase()) ||
                                data.date.toString().toLowerCase().includes(this.searchQuery.toString().toLowerCase()) ||
                                data.time.toString().toLowerCase().includes(this.searchQuery.toString().toLowerCase())
                            );
                        }
                    });

                    pagedata =  filtered
                }

                if (this.datestart.length > 0 && this.datefinish.length > 0){
                    let date_min = this.datestart.split('/')
                    let date_min_epoch = new Date(date_min[2],date_min[1],date_min[0]).getTime()
                    let date_max = this.datefinish.split('/')
                    let date_max_epoch = new Date(date_max[2],date_max[1],date_max[0]).getTime()
                    pagedata = pagedata.filter((data) => {
                        let date_array = data.date.split('/')
                        let data_epoch = new Date(date_array[2],date_array[1],date_array[0]).getTime()
                        if (data_epoch >= date_min_epoch && data_epoch <= date_max_epoch){
                            return data
                        }
                    })
                }
                
                return pagedata
            },
            invokeFirst(){
                start = 1
                this.jumppage(1)
            },
            invokeLast(){
                start = this.totalpages - (this.totalpages % 10)
                this.array_pages = []

                for (let i = start; i<= start+9; i++){
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
                let dates = daterangeone.getDates('dd/mm/yyyy')
                if (dates[0] && dates[1]){
                    this.datestart = dates[0]
                    this.datefinish = dates[1]
                    this.refreshlist()
                }
                else{
                    alert("Input cant be empty")
                }
            }
        }
    }
</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style src="vanillajs-datepicker/css/datepicker-foundation.css"></style>