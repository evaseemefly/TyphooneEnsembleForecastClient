<template>
    <div id="center">
        <TopNavbar></TopNavbar>
        <router-view></router-view>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import TopNavbar from '@/views/members/bar/topNavbar.vue'
@Component({
    components: {
        TopNavbar
    }
})
export default class CenterMap extends Vue {}
</script>
<style scoped>
#center {
    display: flex;
    flex-direction: column;
    flex: 8;
    /* background: #80c3c5; */
}
</style>
