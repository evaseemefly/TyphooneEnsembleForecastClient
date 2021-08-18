<template>
    <div class="color-bar-list">
        <!-- 最终可行的办法，参考自: https://segmentfault.com/q/1010000037424499?utm_source=tag-newest -->
        <!-- 方式2:目前看不可行，https://stackoverflow.com/questions/59552974/how-can-i-bind-a-linear-gradient-background-property-made-up-of-dynamic-variable -->
        <!-- <div class="color-bar-test" :style="{ backgroundImage: createBackgroundString() }">
            <span>m/s</span>
            <span>0</span>
            <span>0.2</span>
            <span>0.4</span>
            <span>0.6</span>
            <span>0.8</span>
            <span>1.0</span>
            <span>1.0</span>
            <span>1.2</span>
        </div> -->
        <transition-group name="color-bar-fade">
            <div
                class="color-bar"
                v-for="(tempScale, index) in colorScales"
                :key="tempScale.key"
                :style="{ backgroundImage: getBackgroundColorStr(tempScale) }"
                @click="setSelectedScale(index)"
                v-show="showScale(index)"
            >
                <span>单位: m</span>
                <span v-for="tempRange in tempScale.scale.range" :key="tempRange.id">{{
                    tempRange
                }}</span>
            </div>
        </transition-group>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation, State, namespace } from 'vuex-class'
// 本项目
import { IColorScale, ColorScales, IScale } from '@/const/colorBar'
import { DEFAULT_DICT_KEY } from '@/const/common'
@Component({})
export default class ColorBar extends Vue {
    colorScales: { key: string; scale: IScale }[] = ColorScales
    selectedScaleIndex = DEFAULT_DICT_KEY
    color1 = 'rgb(151, 75, 145)'
    angle = '50'
    // color1 = 'red'
    color2 = 'blue'
    color3 = 'linear-gradient(to right,rgb(98, 113, 184),rgb(151, 75, 145));'
    testColorStyle = {
        // background: 'red'  // 可行
        // background: 'linear-gradient(to right,rgb(98, 113, 184),rgb(151, 75, 145));' // 不可行
        backgroundImage: this.createBackgroundString()
        // background: 'rgb(151, 75, 145)' // 可行
        // background: '#081d58' // 可行
        // backgroundImage: 'linear-gradient(to right, red , yellow);' // 无效
        // background: this.createBackgroundString()
    }
    createBackgroundString() {
        // return `linear-gradient(${this.angle}deg, ${this.color1}, ${this.color2})`
        // TODO:!] 此种办法也可行
        return `linear-gradient(to right, ${this.color1},  ${this.color2})`
        // return 'rgb(151, 75, 145)'
    }
    getBackgroundColorStr(tempScale: { key: string; scale: IScale }): string {
        // eg: #ee4620,#ee462f,#ed4633,#ef6b6d,#f3a4a5,#f9dcdd,#dcdcfe,
        let colorStr = ''
        if (tempScale.scale !== undefined && tempScale.scale.scaleColorList !== undefined) {
            if (Array.isArray(tempScale.scale.scaleColorList)) {
                for (const temp of tempScale.scale.scaleColorList) {
                    colorStr += temp + ','
                }
                // 需要去掉最后一位的 ,
                colorStr = colorStr.substr(0, colorStr.lastIndexOf(','))
            }
        }

        const colorLinearStr = `linear-gradient(to right, ${colorStr})`
        return colorLinearStr
    }
    setSelectedScale(index: number): void {
        if (index === this.selectedScaleIndex) {
            this.selectedScaleIndex = DEFAULT_DICT_KEY
        } else {
            this.selectedScaleIndex = index
        }
    }
    showScale(index: number): boolean {
        let isShow = false
        if (this.selectedScaleIndex === DEFAULT_DICT_KEY) {
            isShow = true
        }
        if (this.selectedScaleIndex !== DEFAULT_DICT_KEY && index === this.selectedScaleIndex) {
            isShow = true
        }
        return isShow
    }

    get selectedScale(): { key: string; scale: IScale } {
        return this.colorScales[this.selectedScaleIndex]
    }
}
</script>
<style lang="less" scoped>
.color-bar-list {
    margin-top: 10px;
}
.color-bar-list > .color-bar {
    margin-bottom: 5px;
}
.color-bar-list .color-bar {
    margin-bottom: 5px;
}
.color-bar {
    width: 300px;
    border-radius: 0.4em;
    box-shadow: 0 0 4px 0 black;
    span {
        margin-left: 8px;
        width: 15px;
        color: white;
    }
}
.color-bar-test {
    width: 300px;
    border-radius: 0.4em;
    box-shadow: 0 0 4px 0 black;
    span {
        margin-left: 8px;
        width: 15px;
        color: white;
    }
}

// 加入过度动画效果
.color-bar-fade-enter-active,
.color-bar-fade-leave-active {
    transition: all 1s;
}
.color-bar-fade-enter, .color-bar-fade-leave-to
/* .list-leave-active for below version 2.1.8 */ {
    opacity: 0;
    transform: translateX(30px);
}
</style>
