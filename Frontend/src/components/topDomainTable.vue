<template>
    <div class="w-full h-auto snap-y snap-mandatory">
        <h1 class="text-2xl col-span-2">DNS Stats</h1>
        <div class="w-full h-auto grid grid-cols-2 snap-center">
            <div class="w-full col-span-2"><h1 class="text-center py-5 text-xl text-white">Top All Domain Request Last 30 Min</h1></div>
            <div class="w-3/5 h-auto" style="margin-left: calc(20%); margin-right: calc(20%);">
                <div class="flex justify-center w-full">
                    <table class="table w-full bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Domain</th>
                                <th class="table-cell">Request</th>
                            </tr>
                        </thead>
                        <tbody style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200" v-for="domain in all_domain" :key="domain">
                                <td class="table-cell">{{ domain.domain }}</td>
                                <td class="table-cell" >{{ domain.count }}</td>
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
            <div class="w-full col-span-2"><h1 class="text-center py-5 text-xl text-white">Top Success Domain Request Last 30 Min</h1></div>
            <div class="w-3/5 h-auto" style="margin-left: calc(20%); margin-right: calc(20%);">
                <div class="flex justify-center w-full">
                    <table class="table w-full bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Domain</th>
                                <th class="table-cell">Request</th>
                            </tr>
                        </thead>
                        <tbody style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200" v-for="domain in success_domain" :key="domain">
                                <td class="table-cell">{{ domain.domain }}</td>
                                <td class="table-cell" >{{ domain.count }}</td>
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
            <div class="w-full col-span-2"><h1 class="text-center py-5 text-xl text-white">Top Blocked Domain Request Last 30 Min</h1></div>
            <div class="w-3/5 h-auto" style="margin-left: calc(20%); margin-right: calc(20%);">
                <div class="flex justify-center w-full">
                    <table class="table w-full bg-white">
                        <thead class="table-row-group">
                            <tr>
                                <th class="table-cell">Domain</th>
                                <th class="table-cell">Request</th>
                            </tr>
                        </thead>
                        <tbody style="background-color: #f3eaf4;">
                            <tr class="table-row bg-purple-200" v-for="domain in blocked_domain" :key="domain">
                                <td class="table-cell">{{ domain.domain }}</td>
                                <td class="table-cell" >{{ domain.count }}</td>
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
    </div>
</template>
<script>
    import Chart from 'chart.js/auto'
    import axios from 'axios'

    export default {
        data() {
            return {
                all_domain: [],
                success_domain: [],
                blocked_domain: []
            }
        },
        mounted() {
            this.getTopDomain()
        },
        methods: {
            async getTopDomain(){
                let response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-top-query/all`)
                this.all_domain = response.data
                console.log(response)
                response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-top-query/success`)
                this.success_domain = response.data
                response = await axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-top-query/blocked`)
                this.blocked_domain = response.data
                this.generate_all_diagram()
            },
            async generate_all_diagram(){
                const data = this.all_domain

                new Chart(
                    document.getElementById("all_domain_stats"),
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

                const data_success = this.success_domain

                new Chart(
                    document.getElementById("success_domain_stats"),
                    {
                        type:'pie',
                        data: {
                            labels: data_success.map(row => row.domain),
                            datasets: [{
                                data: data_success.map(row => row.count),
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

                const data_blocked = this.blocked_domain

                new Chart(
                    document.getElementById("blocked_domain_stats"),
                    {
                        type:'pie',
                        data: {
                            labels: data_blocked.map(row => row.domain),
                            datasets: [{
                                data: data_blocked.map(row => row.count),
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