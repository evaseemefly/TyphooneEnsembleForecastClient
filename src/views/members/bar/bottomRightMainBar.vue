<template>
    <div id="bottom-right-main-bar">
        <ColorBar></ColorBar>
        <ForecastAreaBar :currentCaseCoverageList="currentCaseCoverageList"></ForecastAreaBar>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
// 引入组件
import ColorBar from '@/views/members/bar/colorBar.vue'
import ForecastAreaBar from '@/views/members/bar/forecastAreaBar.vue'

// 引入部分中间变量
import CoverageMin from '@/views/content/oilspilling/coverage.vue'
@Component({
    components: {
        ColorBar,
        ForecastAreaBar
    }
})
export default class BottomRightMainBar extends Vue {
    mydata: any = null
    @Prop(Array)
    currentCaseCoverageList!: CoverageMin[]
    mounted() {}
    get computedTest() {
        return null
    }
}
</script>
<style scoped lang="less">
#bottom-right-main-bar {
    position: relative;
}
</style>
