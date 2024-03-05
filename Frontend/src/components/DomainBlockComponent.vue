<template>
    <div>
        <div class="w-full grid grid-cols-5">
            <div class="w-full"/>
            <div class="col-span-3">
                <div>
                    <div class="p-5">
                        <label class="text-xl" for="searchquery">Search : </label>
                        <input type="text" name="searchquery" v-model="searchQuery"> <br>
                    </div>
                </div>
                <div class="w-full">
                    <table class="table w-full text-sm bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Domain</th>
                                <th class="table-cell">DNS Types</th>
                                <th class="table-cell">Block Types</th>
                                <th class="table-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="table-row w-full" v-for="data in filteredPageData" :key="data">
                                <td class="table-cell w-50">{{ data.split(',')[0] }}</td>
                                <td class="table-cell w-50">{{ data.split(',')[1] }}</td>
                                <td class="table-cell w-50">{{ data.split(',')[2] }}</td>
                                <td class="table-cell w-50">
                                    <button id="deletebutton" @click="remove_block(data.split(',')[0],data.split(',')[2],data.split(',')[1])" class="px-2 bg-red-500 my-1 text-white rounded-md">Delete</button>
                                </td>
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
    </div>
</template>

<script>
    import axios from 'axios'

    let max = 10
    let start = 1

    export default {
        data() {
            return {
                ListBlockedDomain: [],
                currentpage: 1,
                totalitem: 10,
                searchQuery: '',
                prevSearchQuery: '',
                totalfilterdata: 0,
            }
        },
        computed: {
            totalpage() {
                return Math.ceil(this.ListBlockedDomain.length / this.totalitem)
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
                    const response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/list-dns-block`);
                    this.ListBlockedDomain = response.data
                } catch (error) {
                    this.error = "Error fetching data";
                    console.error("There was an error fetching the data", error);
                }
            },
            datafilter(){
                let pagedata;
                if (this.searchQuery != this.prevSearchQuery) {
                        this.currentpage = 1
                        this.prevSearchQuery = this.searchQuery // Store the previous search query
                }
                if (this.searchQuery.toString().trim().length == 0){
                    pagedata = this.ListBlockedDomain
                }
                else{
                    const filtered = this.ListBlockedDomain.filter((data) => {
                        console.log(data)
                        return (
                            data.toLowerCase().includes(this.searchQuery.toLowerCase())
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
                if (max % this.totalitem == 0){
                    a = this.totalitem
                }
                else{
                    a = max % this.totalitem -1
                }
                start = max - a
                this.jumppage(this.totalpage)
            },
            remove_block(domain, type, record){
                if (confirm("Are You Sure you want to remove this domain from block?")){
                    axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/delete-dns-block/${domain}?type=${type}&record=${record}`)
                    .then(response => {
                        alert(response.data)
                        this.fetchData()
                    })
                    .catch(error => {
                        alert(error)
                    })
                }
            }
        }
    }
</script>
<style scoped>

    label{
        padding-right: calc(50%);
    }

</style>