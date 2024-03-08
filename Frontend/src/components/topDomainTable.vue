<template>
    <div class="w-full h-auto snap-y snap-mandatory">
        <h1 class="text-2xl col-span-2">DNS Stats</h1>
        <div class="w-full my-2 flex flex-row justify-left">
            <select v-model="time" id="type" class="w-1/5 text-center ms-10">
                <option value="60m">60 Minutes</option>
                <option value="1d">1 Days</option>
                <option value="1m">1 Months</option>
                <option value="1y">1 Year</option>
                <option value="all">All time</option>
            </select>
        </div>
        <div class="w-full h-auto grid grid-cols-2 snap-center">
            <div class="w-full col-span-2">
                <h1 v-if="time == '60m'" class="text-center py-5 text-xl text-white">Top All Domain Request Last 60 Min</h1>
                <h1 v-else-if="time == '1d'" class="text-center py-5 text-xl text-white">Top All Domain Request Last 1 Day</h1>
                <h1 v-else-if="time == '1m'" class="text-center py-5 text-xl text-white">Top All Domain Request Last 1 Month</h1>
                <h1 v-else-if="time == '1y'" class="text-center py-5 text-xl text-white">Top All Domain Request Last 1 Year</h1>
                <h1 v-else-if="time == 'all'" class="text-center py-5 text-xl text-white">Top All Domain Request</h1>
            </div>
            <div class="w-3/5 h-auto" style="margin-left: calc(20%); margin-right: calc(20%);">
                <div class="flex justify-center w-full">
                    <table class="table w-full bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Domain</th>
                                <th class="table-cell">Request</th>
                            </tr>
                        </thead>
                        <tbody v-if="all_domain.length > 0" style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200" v-for="domain in all_domain" :key="domain">
                                <td class="table-cell">{{ domain.domain }}</td>
                                <td class="table-cell" >{{ domain.count }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200">
                                <td class="table-cell" colspan="2">No Domain Available</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="w-full h-full">
                <div style="width: 60%; height: 100%;" >
                    <canvas id="all_domain_stats" style="width: 60%; height: 60%;"></canvas>
                </div>
            </div>
        </div>
        <div class="w-full h-auto grid grid-cols-2 snap-center mb-5">
            <div class="w-full col-span-2">
                <h1 v-if="time == '60m'" class="text-center py-5 text-xl text-white">Top Success Domain Request Last 60 Min</h1>
                <h1 v-else-if="time == '1d'" class="text-center py-5 text-xl text-white">Top Success Domain Request Last 1 Day</h1>
                <h1 v-else-if="time == '1m'" class="text-center py-5 text-xl text-white">Top Success Domain Request Last 1 Month</h1>
                <h1 v-else-if="time == '1y'" class="text-center py-5 text-xl text-white">Top Success Domain Request Last 1 Year</h1>
                <h1 v-else-if="time == 'all'" class="text-center py-5 text-xl text-white">Top Success Domain Request</h1>
            </div>
            <div class="w-3/5 h-auto" style="margin-left: calc(20%); margin-right: calc(20%);">
                <div class="flex justify-center w-full">
                    <table class="table w-full bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Domain</th>
                                <th class="table-cell">Request</th>
                            </tr>
                        </thead>
                        <tbody v-if="success_domain.length > 0" style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200" v-for="domain in success_domain" :key="domain">
                                <td class="table-cell">{{ domain.domain }}</td>
                                <td class="table-cell" >{{ domain.count }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200">
                                <td class="table-cell" colspan="2">No Success Domain Available</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="w-full h-full">
                <div style="width: 60%; height: 100%;" >
                    <canvas id="success_domain_stats" style="width: 60%; height: 60%;"></canvas>
                </div>
            </div>
        </div>
        <div class="w-full h-auto grid grid-cols-2 snap-center mb-5">
            <div class="w-full col-span-2">
                <h1 v-if="time == '60m'" class="text-center py-5 text-xl text-white">Top Blocked Domain Request Last 60 Min</h1>
                <h1 v-else-if="time == '1d'" class="text-center py-5 text-xl text-white">Top Blocked Domain Request Last 1 Day</h1>
                <h1 v-else-if="time == '1m'" class="text-center py-5 text-xl text-white">Top Blocked Domain Request Last 1 Month</h1>
                <h1 v-else-if="time == '1y'" class="text-center py-5 text-xl text-white">Top Blocked Domain Request Last 1 Year</h1>
                <h1 v-else-if="time == 'all'" class="text-center py-5 text-xl text-white">Top Blocked Domain Request</h1>
            </div>
            <div class="w-3/5 h-auto" style="margin-left: calc(20%); margin-right: calc(20%);">
                <div class="flex justify-center w-full">
                    <table class="table w-full bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Domain</th>
                                <th class="table-cell">Request</th>
                            </tr>
                        </thead>
                        <tbody v-if="blocked_domain.length > 0" style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200" v-for="domain in blocked_domain" :key="domain">
                                <td class="table-cell">{{ domain.domain }}</td>
                                <td class="table-cell" >{{ domain.count }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200">
                                <td class="table-cell" colspan="2">No Blocked Domain Available</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="w-full h-full">
                <div style="width: 60%; height: 100%;" >
                    <canvas id="blocked_domain_stats" style="width: 60%; height: 60%;"></canvas>
                </div>
            </div>
        </div>
        <div class="w-full h-auto grid grid-cols-2 snap-center mb-5">
            <div class="w-full col-span-2">
                <h1 v-if="time == '60m'" class="text-center py-5 text-xl text-white">Top Failed Domain Request Last 60 Min</h1>
                <h1 v-else-if="time == '1d'" class="text-center py-5 text-xl text-white">Top Failed Domain Request Last 1 Day</h1>
                <h1 v-else-if="time == '1m'" class="text-center py-5 text-xl text-white">Top Failed Domain Request Last 1 Month</h1>
                <h1 v-else-if="time == '1y'" class="text-center py-5 text-xl text-white">Top Failed Domain Request Last 1 Year</h1>
                <h1 v-else-if="time == 'all'" class="text-center py-5 text-xl text-white">Top Failed Domain Request</h1>
            </div>
            <div class="w-3/5 h-auto" style="margin-left: calc(20%); margin-right: calc(20%);">
                <div class="flex justify-center w-full">
                    <table class="table w-full bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Domain</th>
                                <th class="table-cell">Request</th>
                            </tr>
                        </thead>
                        <tbody v-if="failed_domain.length > 0" style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200" v-for="domain in failed_domain" :key="domain">
                                <td class="table-cell">{{ domain.domain }}</td>
                                <td class="table-cell" >{{ domain.count }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200">
                                <td class="table-cell" colspan="2">No Failed Domain Available</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="w-full h-full">
                <div style="width: 60%; height: 100%;position: relative;" >
                    <canvas id="failed_domain_stats" style="width: 60%; height: 60%;"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import Chart from 'chart.js/auto'
    import axios from 'axios'

    let all_domain_graph = null
    let success_domain_graph = null
    let blocked_domain_graph = null
    let failed_domain_graph = null

    export default {
        data() {
            return {
                all_domain: [],
                success_domain: [],
                blocked_domain: [],
                failed_domain: [],
                time: 'all',
            }
        },
        mounted() {
            this.initialize()
        },
        watch: {
            time() {
                this.updateChart()
            }
        },
        methods: {
            async getTopDomain(){
                let response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-top-query/all/${this.time}`)
                this.all_domain = response.data
                response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-top-query/success/${this.time}`)
                this.success_domain = response.data
                response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-top-query/blocked/${this.time}`)
                this.blocked_domain = response.data
                response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-top-query/failed/${this.time}`)
                this.failed_domain = response.data
            },
            async generate_chart(id,datalist){
                const data = datalist

                return new Chart(
                    document.getElementById(id),
                    {
                        type:'pie',
                        data: {
                            labels: data.map(row => row.domain),
                            datasets: [{
                                data: data.map(row => row.count),
                                backgroundColor: [
                                    'rgb(53, 104, 45)',
                                    'rgb(244, 244, 244)',
                                    'rgb(32, 96, 61)',
                                    'rgb(115, 66, 34)',
                                    'rgb(243, 159, 24)',
                                    'rgb(74, 25, 44)',
                                    'rgb(117, 092, 72)',
                                    'rgb(255, 255, 0)',
                                    'rgb(228, 160, 16)',
                                    'rgb(28, 28, 28)',
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        font: {
                                            size: 12
                                        }
                                    }
                                }
                            },
                            layout: {
                                padding: {
                                    bottom: 100
                                }
                            }
                        }
                    }
                )
            },
            async initialize(){
                await this.getTopDomain()

                all_domain_graph = await this.generate_chart("all_domain_stats",this.all_domain)
                success_domain_graph = await this.generate_chart("success_domain_stats",this.success_domain)
                blocked_domain_graph = await this.generate_chart("blocked_domain_stats",this.blocked_domain)
                failed_domain_graph = await this.generate_chart("failed_domain_stats",this.failed_domain)
            },
            async updateChart() {
                await this.getTopDomain()
                all_domain_graph.data.datasets[0].data = this.all_domain.map(row => row.count)
                all_domain_graph.data.labels = this.all_domain.map(row => row.domain)
                all_domain_graph.update()
                success_domain_graph.data.datasets[0].data = this.success_domain.map(row => row.count)
                success_domain_graph.data.labels = this.success_domain.map(row => row.domain)
                success_domain_graph.update()
                blocked_domain_graph.data.datasets[0].data = this.blocked_domain.map(row => row.count)
                blocked_domain_graph.data.labels = this.blocked_domain.map(row => row.domain)
                blocked_domain_graph.update()
                failed_domain_graph.data.datasets[0].data = this.failed_domain.map(row => row.count)
                failed_domain_graph.data.labels = this.failed_domain.map(row => row.domain)
                failed_domain_graph.update()
            }
        }
    }
</script>
<style scoped>
thead {
    background-color: #413f54; 
    color: white;
}

tbody tr:nth-of-type(even) {
    background-color: rgb(206, 206, 206);
}
</style>