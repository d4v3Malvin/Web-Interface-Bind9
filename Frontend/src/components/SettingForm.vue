<template>
    <div>
        <div class="w-full mt-5">
            <div>
                <form @submit.prevent="change_rrl_limit" method="post">
                    <div class="w-full flex flex-row justify-center">
                        <div class="w-4/5 py-5 rounded-md" style="background-color: #d8d8d8">
                            <div class="text-xl pb-5 text-center">
                                Setup Rate Limiting
                            </div>
                            <label for="rrl_field">Response Rate Limit</label><br>
                            <input type="number" v-model="rrl_value" id="rrl_field" class="w-3/5 text-center">
                            <div class="w-full pt-5">
                                <button class="border bg-green-400 px-2 py-1 " type="submit">Submit</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="pt-5">
                <form @submit.prevent="add_domain_block" method="post">
                    <div class="w-full flex flex-row justify-center">
                        <div class="w-4/5 py-5 rounded-md" style="background-color: #d8d8d8">
                            <div class="text-xl pb-5 text-center">
                                Change the password
                            </div>
                            <label for="rrl_field">New Password</label><br>
                            <input type="text" v-model="new_password" id="rrl_field" class="w-3/5 text-center"><br>
                            <div class="w-full py-1"></div>
                            <label for="rrl_field">Confirm New Password</label><br>
                            <input type="text" v-model="new_password" id="rrl_field" class="w-3/5 text-center">
                            <div class="w-full pt-5">
                                <button class="border bg-green-400 px-2 py-1 " type="submit">Submit</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        data() {
            return {
                rrl_value: 0,
                new_password: ''
            }
        },
        mounted() {
            this.getSetting()
        },
        methods: {
            async getSetting() {
                axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/get-rrl-setting`)
                .then(response => {
                    let temp = response.data
                    this.rrl_value = temp[0].value
                })
                .catch(error => {
                    console.log(error)
                })
            },
            change_rrl_limit() {
                if (confirm("Are you sure you want to change the rate limit value?")){
                    axios.get(`http://${process.env.VUE_APP_HOST_API}:3000/set-rrl-setting?limit=${this.rrl_value}`)
                    .then(response => {
                        alert(response.data)
                    })
                    .catch(error => {
                        console.log(error)
                    })
                }
            }
        }
    }
</script>