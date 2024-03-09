<template>
    <div class="w-full grid grid-cols-5">
        <div class="w-full"/>
        <div class="col-span-3">
            <button id="addbutton" @click="openmodal()" class="py-1 px-2 bg-green-300 mt-2 rounded-md">Add Allowed Client</button>
            <div id="div-modal" class="py-3 insert-div mt-2 rounded-md" style="background-color: #d8d8d8">
                <form @submit.prevent="add_client_block" method="post">
                    <div class="w-full grid grid-cols-3">
                        <div class="text-xl text-center col-span-3">IP Address / Block</div>
                        <div class="w-full col-span-3 flex flex-row justify-center">
                            <div>
                                <input type="text" v-model="clientData.ip" class="w-full">
                            </div>
                            <div class="ps-3 w-auto">
                                /
                            </div>
                            <div class="w-1/6">
                                <input type="text" v-model="clientData.blocks" class="w-3/5">
                            </div>
                        </div>
                        <div class="col-span-3 py-3">
                            <button class="border bg-green-400 px-2 py-1" type="submit">Submit</button>
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
        data(){
            return {
                clientData: {
                    ip: '',
                    blocks: ''
                }
            }
        },
        methods: {
            openmodal() {
                var modal = document.getElementById('div-modal')
                var button = document.getElementById('addbutton')
                button.innerHTML = (modal.style.display === 'none' || modal.style.display === '') ? 'close' : 'Add Domain Block'
                modal.style.display = (modal.style.display === 'none' || modal.style.display === '') ? 'block' : 'none'
            },
            add_client_block() {
                axios.post(`http://${process.env.VUE_APP_HOST_API}:3000/add-ip-block`, this.clientData)
                .then(response => {
                    var modal = document.getElementById('div-modal')
                    var button = document.getElementById('addbutton')
                    modal.style.display = 'none'
                    button.innerHTML = 'Add Client Block'
                    alert(response.data)
                    this.ip = ''
                    this.blocks = ''
                    this.$parent.$refs.AllowedClientTable.fetchData()
                })
                .catch(error => {
                    alert(error)
                })
            }
        }
    }
</script>

<style scoped>
    .label-input{
        padding-left: calc(10%);
    }
    .insert-div{
        display: none;
    }
</style>