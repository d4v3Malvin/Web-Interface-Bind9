<template>
    <div class="w-full grid grid-cols-5">
        <div class="w-full"/>
        <div class="col-span-3">
            <button id="addbutton" @click="openmodal()" class="py-1 px-2 bg-green-300 mt-2">Add Domain Block</button>
            <div id="div-modal" class="py-3 insert-div mt-2 border border-black">
                <form @submit.prevent="add_domain_block" method="post">
                    <div class="w-full grid grid-cols-3">
                        <div class="col-span-2 text-left label-input">
                            <label for="domain">Domain : </label>
                        </div>
                        <div>
                            <input type="text" v-model="domaindata.domain" id="domain_field" class="w-4/5">
                        </div>
                        <div class="col-span-2 text-left label-input pt-2">
                            <label for="type">Type : </label>
                        </div>
                        <div class="pt-2">
                            <select v-model="domaindata.type" id="" class="w-4/5 text-center">
                                <option value="ads">ADS</option>
                                <option value="dns">Domain</option>
                            </select>
                        </div>
                        <div class="col-span-3 py-3">
                            <button class="border bg-green-400 px-2 py-1 " type="submit">Submit</button>
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
                domaindata: {
                    domain: '',
                    type: 'dns'
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
            add_domain_block() {
                axios.post(`http://${process.env.VUE_APP_HOST_API}:3000/add-dns-block`, this.domaindata)
                .then(response => {
                    alert(response.data)
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