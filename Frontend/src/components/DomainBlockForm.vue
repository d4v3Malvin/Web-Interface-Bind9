<template>
    <div class="w-full grid grid-cols-5">
        <div class="w-full"/>
        <div class="col-span-3">
            <button id="addbutton" @click="openmodal()" class="py-1 px-2 bg-green-300 mt-2 rounded-md">Add Domain Block</button>
            <div id="div-modal" class="py-3 insert-div mt-2 rounded-md" style="background-color: #d8d8d8">
                <form @submit.prevent="add_domain_block" method="post">
                    <div class="w-full grid grid-cols-3">
                        <div class="w-full col-span-3 flex">
                            <div class="w-1/2">
                                <label for="domain_field" class="text-s">Domain</label><br>
                                <input type="text" v-model="domaindata.domain" id="domain_field" class="w-4/5">
                            </div>
                            <div class="w-1/2">
                                <label for="type" class="text-s">Block Type</label>
                                <select v-model="domaindata.type" id="type" class="w-4/5 text-center">
                                    <option value="ads">ADS</option>
                                    <option value="dns">Domain</option>
                                </select>
                            </div>
                        </div>
                        <div class="w-full col-span-3 flex flex-col justify-center items-center">
                            <label for="type" class="text-s">Record Type</label>
                            <select v-model="domaindata.record" id="type" class="w-2/5 text-center">
                                <option value="A">A</option>
                                <option value="AAAA">AAAA</option>
                                <option value="CNAME">CNAME</option>
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
                    record:'A',
                    type: 'dns'
                }
            }
        },
        methods: {
            openmodal() {
                var modal = document.getElementById('div-modal')
                modal.style.display = (modal.style.display === 'none' || modal.style.display === '') ? 'block' : 'none'
            },
            add_domain_block() {
                if (this.domaindata.domain.length <= 0){
                    alert("Input cant be Empty")
                }
                else {
                    axios.post(`http://${process.env.VUE_APP_HOST_API}:3000/add-dns-block`, this.domaindata)
                    .then(response => {
                        var modal = document.getElementById('div-modal')
                        modal.style.display = 'none'
                        alert(response.data)
                        this.domaindata.domain = ''
                        this.domaindata.record = 'A'
                        this.domaindata.type = 'dns'
                        this.$parent.$refs.domainBlockTable.fetchData()
                    })
                    .catch(error => {
                        alert(error)
                    })
                }
                
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