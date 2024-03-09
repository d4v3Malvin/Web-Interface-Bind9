<template>
    <div>
        <div class="w-full pb-5">
            <h1 class="text-center text-xl">Web Interface BIND9</h1>
            <h1 class="text-center text-xl mt-5 mb-3">Basic Stats</h1>
        </div>
        <div class="w-full my-2 flex flex-row justify-left">
            <select v-model="time" id="type" class="w-1/5 text-center ms-10">
                <option value="60m">60 Minutes</option>
                <option value="1d">1 Days</option>
                <option value="1m">1 Months</option>
                <option value="1y">1 Year</option>
                <option value="all">All time</option>
            </select>
        </div>
        <div class="w-full h-auto grid grid-cols-2">
            <div class="w-full col-span-2">
                <h1 v-if="time == '60m'" class="text-center py-5 text-xl text-white">Top Client Request Last 60 Min</h1>
                <h1 v-else-if="time == '1d'" class="text-center py-5 text-xl text-white">Top Client Request Last 1 Day</h1>
                <h1 v-else-if="time == '1m'" class="text-center py-5 text-xl text-white">Top Client Request Last 1 Month</h1>
                <h1 v-else-if="time == '1y'" class="text-center py-5 text-xl text-white">Top Client Request Last 1 Year</h1>
                <h1 v-if="time == 'all'" class="text-center py-5 text-xl text-white">Top Client Request</h1>
            </div>
            <div class="w-3/5 h-auto" style="margin-left: calc(20%); margin-right: calc(20%);">
                <div class="flex justify-center w-full">
                    <table class="table w-full bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Client</th>
                                <th class="table-cell">Count</th>
                            </tr>
                        </thead>
                        <tbody v-if="all_client.length > 0" style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200" v-for="client in all_client" :key="client">
                                <td class="table-cell">{{ client.ip }}</td>
                                <td class="table-cell" >{{ client.count }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200">
                                <td class="table-cell" colspan="2">No Client Available</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="w-full h-full">
                <div style="width: 60%; height: 100%; position: relative;" >
                    <canvas id="client_stats" style="width: 60%; height: 60%;"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import Chart from 'chart.js/auto'

    let client_graph = null

    export default {
        data() {
            return {
                time: "60m",
                all_client: []
            }
        },
        watch: {
            time() {
                this.updateChart()
            },
        },
        mounted() {
            this.initialize()
        },
        methods: {
            async getTopClient(){
                let response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-top-client/${this.time}`)
                this.all_client = response.data
            },
            generateChart(id,datalist){
                const data = datalist

                return new Chart(
                    document.getElementById(id),
                    {
                        type: 'bar',
                        data: {
                            labels: data.map(row => row.ip),
                            datasets: [{
                                label: 'List of Client iP',
                                data: data.map(row => row.count),
                                backgroundColor: [
                                    'rgba(201, 203, 207, 0.2)',
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(255, 159, 64, 0.2)',
                                    'rgba(255, 205, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(153, 102, 255, 0.2)',
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true
                        }
                    }
                )
            },
            async initialize(){
                await this.getTopClient()
                client_graph = this.generateChart("client_stats",this.all_client)
            },
            async updateChart() {
                await this.getTopClient()
                client_graph.data.datasets[0].data = this.all_client.map(row => row.count)
                client_graph.data.labels = this.all_client.map(row => row.ip)
                client_graph.update()
            }
        }
    }
</script>