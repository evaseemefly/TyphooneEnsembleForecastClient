<template>
    <div id="bottom-main-bar">
        <TimeBar
            :startDateTime="startDate"
            :endDateTime="endDate"
            :interval="interval"
            :days="days"
        ></TimeBar>
        <!-- TODO:[-] 20-08-09 注意右下角的先改为 bottomright-main-bar,colorbar是其子组件 -->
        <!-- <div class="color-bar"><ColorBar></ColorBar></div> -->
        <div class="color-bar">
            <BottomRightMainBar
                :tyCode="tyCode"
                :timeStampStr="timeStampStr"
                :forecastDt="forecastDt"
            ></BottomRightMainBar>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation, State, namespace } from 'vuex-class'
// 引入的部分组件
import TimeBar from '@/views/members/bar/TimeBar.vue'
import ColorBar from '@/views/members/bar/colorBar.vue'
import BottomRightMainBar from '@/views/members/bar/bottomRightMainBar.vue'
// 引入部分中间变量
import CoverageMin from '@/views/content/oilspilling/coverage.vue'

@Component({
    components: {
        TimeBar,
        ColorBar,
        BottomRightMainBar
    }
})
export default class BottomMainBar extends Vue {
    @Prop(Date)
    startDate!: Date
    @Prop(Date)
    endDate!: Date
    //每日共划分的间隔
    @Prop(Number)
    interval!: number
    @Prop(Number)
    days!: number
    @Prop(String)
    tyCode
    @Prop(String)
    timeStampStr
    @Prop(Date)
    forecastDt
}
</script>

<style scoped lang="less">
#bottom-main-bar {
    z-index: 999;
    position: absolute;
    position: fixed;
    bottom: 50px;
    right: 20px;
    left: 0px;
    right: 0px;
    bottom: 50px;
    white-space: nowrap;
    justify-content: space-between;
    // width: 600px;
    display: flex;
    // 左右还需要加入一个边距
    margin-left: 50px;
    margin-right: 30px;
    .color-bar {
        // display: flex;
        width: 300px;
        // + 21-08-17 将右下侧的 main-bar 修改为绝对定位
        position: fixed;
        bottom: 50px;
        right: 20px;
    }
}
</style>
