<template>
    <div class="w-full grid grid-cols-5">
        <div class="w-full"/>
        <div class="col-span-3">
            <button @click="openmodal()" class="py-1 px-2 bg-green-300 mt-2">Add Domain Block</button>
            <div id="div-modal" class="py-3 insert-div mt-2 border border-black">
                <form action="" method="post">
                    <label for="domain">Domain : </label>
                    <input type="text" name="domain" id="domain_field"> <br>
                    <button class="border bg-green-400 px-2 py-1 mt-3" type="submit">Submit</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            openmodal() {
                var modal = document.getElementById('div-modal')
                modal.style.display = (modal.style.display === 'none' || modal.style.display === '') ? 'block' : 'none'
            }
        }
    }
</script>

<style scoped>
    label{
        padding-right: calc(50%);
    }
    .insert-div{
        display: none;
    }
</style>