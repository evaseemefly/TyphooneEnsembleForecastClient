<template>
    <div class="right-station-bar">
        <StationCharts></StationCharts>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import StationCharts from '@/views/members/charts/StationCharts.vue'
@Component({ components: { StationCharts } })
export default class RightStationBar extends Vue {
    mydata: any = null
    mounted() {}
    get computedTest() {
        return null
    }
}
</script>
<style scoped lang="less">
.right-station-bar {
}
</style>
