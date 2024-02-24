<template>
    <div class="w-full h-auto">
        <div class="w-full h-auto grid grid-cols-2">
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
                <div style="width: 65%; height: 100%;" >
                    <canvas id="all_domain_stats" style="width: 60%; height: 60%;"></canvas>
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
                all_domain: []
            }
        },
        mounted() {
            this.getTopDomain()
        },
        methods: {
            getTopDomain(){
                axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-top-query`)
                .then(response => {
                    console.log(response.data)
                    this.all_domain = response.data.sort((a,b) => b.count - a.count)
                    this.generate_all_diagram()
                })
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