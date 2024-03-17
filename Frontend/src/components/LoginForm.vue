<template>
    <div>
        <div class="text-xl pb-5 text-center">
            Web Interface BIND9 login
        </div>
        <div class="w-full flex flex-row justify-center">
            <div class="py-3 rounded-md w-1/5" style="background-color: #d8d8d8">
                <form @submit.prevent="login" method="post">
                    <div class="w-full grid grid-cols-3">
                        <div class="w-full col-span-3">
                            <div class="w-full pt-4 pb-2">
                                <label for="username_field" class="text-s">Username</label><br>
                                <input type="text" v-model="username" id="username_field" class="w-3/5 text-center">
                            </div>
                            <div class="w-full pt-2 pb-4        ">
                                <label for="password_field" class="text-s">Password</label><br>
                                <input type="password" v-model="password" id="password_field" class="w-3/5 text-center">
                            </div>
                        </div>
                        <div class="col-span-3 py-3">
                            <button class="rounded-md bg-green-400 px-2 py-1 " type="submit">Login</button>
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
                username: "",
                password: ""
            }
        },
        methods: {
            login() {
                const userData = {
                    username: this.username,
                    password: this.password
                }
                axios.post(`http://${process.env.VUE_APP_HOST_API}:3000/login`, userData)
                .then(response => {
                    if (response.data.code == 200){
                        document.cookie = `user=${JSON.stringify(userData)};max-age=3600`
                        window.location.href = '/'
                    }
                    alert(response.data.message)
                    this.username = ""
                    this.password = ""
                })
                .catch(error => {
                    alert(error)
                })
            }
        }
    }
</script>