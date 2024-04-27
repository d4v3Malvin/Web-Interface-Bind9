<template>
    <div>
        <div class="w-full pb-5">
            <h1 class="text-center text-xl">Web Interface BIND9</h1>
            <h1 class="text-center text-xl mt-5 mb-3">Basic Stats</h1>
        </div>
        <div class="w-full mt-2 mb-5 flex flex-row justify-left">
            <select v-model="time" id="type" class="w-1/5 text-center ms-10">
                <option value="60m">60 Minutes</option>
                <option value="1d">1 Days</option>
                <option value="1m">1 Months</option>
                <option value="1y">1 Year</option>
                <option value="all">All time</option>
            </select>
        </div>
        <div class="w-full flex flex-row justify-center">
            <div class="w-4/5 h-auto py-5 rounded-md opacity-75" style="background-color: #d8d8d8">
                <div class="w-full col-span-2">
                    <h1 v-if="time == '60m'" class="text-center pb-5 text-xl">Top Client Request Last 60 Min</h1>
                    <h1 v-else-if="time == '1d'" class="text-center pb-5 text-xl">Top Client Request Last 1 Day</h1>
                    <h1 v-else-if="time == '1m'" class="text-center pb-5 text-xl">Top Client Request Last 1 Month</h1>
                    <h1 v-else-if="time == '1y'" class="text-center pb-5 text-xl">Top Client Request Last 1 Year</h1>
                    <h1 v-if="time == 'all'" class="text-center pb-5 text-xl">Top Client Request</h1>
                </div>
                <div class="w-full h-full flex flex-row justify-center">
                    <div style="width: 80%;" >
                        <canvas id="client_stats"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full pt-5 mb-5">
            <form @submit.prevent="change_password" method="post">
                <div class="w-full flex flex-row justify-center">
                    <div class="w-4/5 py-5 rounded-md opacity-75" style="background-color: #d8d8d8">
                        <div class="text-xl text-center">
                            Change the password
                        </div>
                        <label for="old_field">Old Password</label><br>
                        <input type="password" v-model="old_password" id="old_field" class="w-3/5 text-center"><br>
                        <div class="w-full py-1"></div>
                        <label for="new_field">New Password</label><br>
                        <input type="password" v-model="new_password" id="new_field" class="w-3/5 text-center"><br>
                        <div class="w-full py-1"></div>
                        <label for="confirm_field">Confirm New Password</label><br>
                        <input type="password" v-model="confirm_password" id="confirm_field" class="w-3/5 text-center">
                        <div class="w-full pt-5">
                            <button class="border bg-green-400 px-2 py-1 " type="submit">Submit</button>
                        </div>
                    </div>
                </div>
            </form>
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
                all_client: [],
                old_password: '',
                new_password: '',
                confirm_password: ''
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
                                label: 'Client Request',
                                data: data.map(row => row.count),
                                backgroundColor: [
                                    'rgba(201, 203, 207, 0.8)',
                                    'rgba(255, 99, 132, 0.8)',
                                    'rgba(255, 159, 64, 0.8)',
                                    'rgba(255, 205, 86, 0.8)',
                                    'rgba(75, 192, 192, 0.8)',
                                    'rgba(54, 162, 235, 0.8)',
                                    'rgba(153, 102, 255, 0.8)',
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
            },
            change_password() {
                const packages = {
                    old_pass: this.old_password,
                    new_pass: this.new_password,
                    confirm_pass: this.confirm_password
                }

                if (packages.new_pass.length > 0){
                    axios.post(`http://${process.env.VUE_APP_HOST_API}:3000/change-password`, packages)
                    .then(response => {
                        let result = response.data
                        alert(result.message)
                        this.old_password = ""
                        this.new_password = ""
                        this.confirm_password = ""
                    })
                    .catch(error => {
                        alert(error)
                    })
                }
                else{
                    alert("Your new password cant be empty")
                    this.old_password = ""
                    this.new_password = ""
                    this.confirm_password = ""
                }
            },
        }
    }
</script>