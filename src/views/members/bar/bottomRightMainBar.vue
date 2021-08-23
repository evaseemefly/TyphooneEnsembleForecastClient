<template>
    <div id="bottom-right-main-bar">
        <ColorBar></ColorBar>
        <SwitchBaseMap></SwitchBaseMap>
        <ForecastAreaBar
            :tyCode="tyCode"
            :timeStampStr="timeStampStr"
            :forecastDt="forecastDt"
        ></ForecastAreaBar>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
// 引入组件
import ColorBar from '@/views/members/bar/colorBar.vue'
import ForecastAreaBar from '@/views/members/bar/forecastAreaBar.vue'
import SwitchBaseMap from '@/components/bar/switchBaseMap.vue'

// 引入部分中间变量
import CoverageMin from '@/views/content/oilspilling/coverage.vue'
@Component({
    components: {
        ColorBar,
        ForecastAreaBar,
        SwitchBaseMap
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
}
</style>
