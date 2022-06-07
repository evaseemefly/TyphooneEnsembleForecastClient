<template>
    <div id="bottom-right-main-bar">
        <ColorBar></ColorBar>
        <ColorGridBar></ColorGridBar>
        <SwitchBaseMap></SwitchBaseMap>
        <StationSurgeLevelLegeng></StationSurgeLevelLegeng>
        <TyphoonLevelLegeng></TyphoonLevelLegeng>
        <!-- <ForecastAreaBar
            :tyCode="tyCode"
            :timeStampStr="timeStampStr"
            :forecastDt="forecastDt"
        ></ForecastAreaBar> -->
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
// 引入组件
import ColorBar from '@/views/members/bar/colorBar.vue'
import ForecastAreaBar from '@/views/members/bar/forecastAreaBar.vue'
import SwitchBaseMap from '@/components/bar/switchBaseMap.vue'
import StationSurgeLevelLegeng from '@/components/bar/stationSurgeLevelLegend.vue'
import TyphoonLevelLegeng from '@/components/bar/typhoonLevelLegend.vue'
// + 22-06-06 加入了动态格点数据色标
import ColorGridBar from '@/views/members/bar/colorGridBar.vue'
// 引入部分中间变量
import CoverageMin from '@/views/content/oilspilling/coverage.vue'
@Component({
    components: {
        ColorBar,
        ForecastAreaBar,
        SwitchBaseMap,
        StationSurgeLevelLegeng,
        TyphoonLevelLegeng,
        ColorGridBar
    }
})
export default class BottomRightMainBar extends Vue {
    mydata: any = null
    @Prop(String)
    tyCode
    @Prop(String)
    timeStampStr
    @Prop(Date)
    forecastDt
    mounted() {}
    get computedTest() {
        return null
    }
}
</script>
<style scoped lang="less">
#bottom-right-main-bar {
    // position: relative;

    display: flex;
    flex-direction: column-reverse;
    align-items: flex-end; // 副轴向左对齐
}
</style>
