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
            <div class="pt-5 mb-5">
                <form @submit.prevent="change_password" method="post">
                    <div class="w-full flex flex-row justify-center">
                        <div class="w-4/5 py-5 rounded-md" style="background-color: #d8d8d8">
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
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        data() {
            return {
                rrl_value: 0,
                old_password: '',
                new_password: '',
                confirm_password: ''
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