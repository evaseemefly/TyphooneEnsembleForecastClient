<template>
    <div class="color-bar-list" v-show="isShow">
        <!-- 最终可行的办法，参考自: https://segmentfault.com/q/1010000037424499?utm_source=tag-newest -->
        <!-- 方式2:目前看不可行，https://stackoverflow.com/questions/59552974/how-can-i-bind-a-linear-gradient-background-property-made-up-of-dynamic-variable -->
        <!-- 此种方式可行 -->
        <!-- <div class="color-bar-test" :style="{ backgroundImage: createBackgroundString() }"> -->
        <!-- 此种方式不可行 -->
        <!-- <div class="color-bar-test" :style="testColorStyle">
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
            <!-- 方式1: 不可行 -->
            <!-- <div
                class="color-bar"
                v-for="(tempScale, index) in colorScales"
                :key="tempScale.key"
                :style="tempScale | filterBackgroundColor"
                @click="setSelectedScale(index)"
                v-show="showScale(index)"
            >
                <span>单位: m</span>
                <span v-for="tempRange in tempScale.scale.range" :key="tempRange.id">{{
                    tempRange
                }}</span>
            </div> -->
            <!-- 方式3: -->
            <el-tooltip
                v-for="(tempScale, index) in colorScales"
                class="item"
                effect="dark"
                content="对于大于1.0m的增水会色标进行原值*0.8"
                placement="top-start"
                :key="tempScale.key"
            >
                <div
                    class="color-bar"
                    :key="tempScale.key"
                    @click="setSelectedScale(index)"
                    v-show="showScale(index)"
                >
                    <div class="color-bar-title" :style="getBackgroundColorFirstStr(tempScale)">
                        <span>单位:m</span>
                    </div>
                    <div class="color-bar-content" :style="getCustomerStyleObj(tempScale)">
                        <span v-for="tempRange in tempScale.scale.range" :key="tempRange.id">{{
                            tempRange
                        }}</span>
                    </div>
                </div>
            </el-tooltip>

            <!-- 方式2: 可行 -->
            <!-- <div
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
            </div> -->
            <!-- --- -->
            <!-- 动态绑定类，写在过滤器中会无法找到对应的  function -->
            <!-- <div
                class="color-bar"
                v-for="(tempScale, index) in colorScales"
                :key="tempScale.key"
                :style="{ backgroundImage: tempScale | filterBackgroundColor(tempScale) }"
                @click="setSelectedScale(index)"
                v-show="showScale(index)"
            >
                <span>单位: m</span>
                <span v-for="tempRange in tempScale.scale.range" :key="tempRange.id">{{
                    tempRange
                }}</span>
            </div> -->
        </transition-group>
    </div>
</template>
<script lang="ts">
import { Prop, Vue, Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { Mutation, State, namespace, Getter } from 'vuex-class'
// 本项目
import { IColorScale, ColorScales, IScale } from '@/const/colorBar'
import { DEFAULT_DICT_KEY } from '@/const/common'
import { SET_SCALE_KEY, GET_SCALE_RANGE } from '@/store/types'
import { GET_RASTER_LAYER_KEY } from '@/store/types'
import { RasterLayerEnum } from '@/enum/map'
@Component({
    filters: {
        filterBackgroundColor(val: { key: string; scale: IScale }): string {
            // eg: #ee4620,#ee462f,#ed4633,#ef6b6d,#f3a4a5,#f9dcdd,#dcdcfe,
            let colorStr = ''
            const styleObj: { backgroundImage: string } = { backgroundImage: '' }
            if (val.scale !== undefined && val.scale.scaleColorList !== undefined) {
                if (Array.isArray(val.scale.scaleColorList)) {
                    for (const temp of val.scale.scaleColorList) {
                        colorStr += temp + ','
                    }
                    // 需要去掉最后一位的 ,
                    colorStr = colorStr.substr(0, colorStr.lastIndexOf(','))
                }
            }

            const colorLinearStr = `linear-gradient(to right, ${colorStr})`
            styleObj.backgroundImage = colorStr
            return styleObj
            // return colorLinearStr
        }
    }
})
export default class ColorBar extends Vue {
    // isShow: boolean = false
    colorScales: { key: string; scale: IScale }[] = ColorScales
    selectedScaleIndex = DEFAULT_DICT_KEY
    colorRange: number[] = []
    splitNum = 6 // 对当前 range 进行切分的数量
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

    toolTip = '对于大于1.0m的增水会色标进行原值*0.8'

    mounted(): void {
        this.setSelectedScale(0)
    }
    createBackgroundString() {
        const that = this
        console.log(that)
        // return `linear-gradient(${this.angle}deg, ${this.color1}, ${this.color2})`
        // TODO:!] 此种办法也可行
        return `linear-gradient(to right, ${this.color1},  ${this.color2})`
        // return 'rgb(151, 75, 145)'
    }
    getCustomerStyleObj(val: { key: string; scale: IScale }): { backgroundImage: string } {
        let colorStr = ''
        const styleObj: { backgroundImage: string } = { backgroundImage: '' }
        if (val.scale !== undefined && val.scale.scaleColorList !== undefined) {
            if (Array.isArray(val.scale.scaleColorList)) {
                for (const temp of val.scale.scaleColorList) {
                    colorStr += temp + ','
                }
                // 需要去掉最后一位的 ,
                colorStr = colorStr.substr(0, colorStr.lastIndexOf(','))
            }
        }

        const colorLinearStr = `linear-gradient(to right, ${colorStr})`
        styleObj.backgroundImage = colorLinearStr
        return styleObj
    }
    getBackgroundColorFirstStr(tempScale: { key: string; scale: IScale }): string {
        // eg: #ee4620,#ee462f,#ed4633,#ef6b6d,#f3a4a5,#f9dcdd,#dcdcfe,
        let colorStr = ''
        if (tempScale.scale !== undefined && tempScale.scale.scaleColorList !== undefined) {
            if (Array.isArray(tempScale.scale.scaleColorList)) {
                if (tempScale.scale.scaleColorList.length > 0) {
                    colorStr = `background:${tempScale.scale.scaleColorList[0]}`
                }
            }
        }

        return colorStr
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
        // 若点击是当前已经选中的 scale index 则将 selectedScaleIndex 改为默认值
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

    @Watch('selectedScale')
    onSelectedScale(temp: { key: string; scale: IScale }, old): void {
        if (temp !== undefined) {
            const key = temp.key
            this.setColorScaleKey(key)
        }
    }

    @Mutation(SET_SCALE_KEY, { namespace: 'common' }) setColorScaleKey

    // + 21-08-20 监听 vuex -> color scale range
    @Getter(GET_SCALE_RANGE, { namespace: 'common' }) getColorScaleRange

    @Watch('getColorScaleRange')
    onColorScaleRange(range: number[]): void {
        // console.log(range)
        const max = Math.max(...range)
        const min = Math.min(...range)
        const spaceUnit = (max - min) / this.splitNum
        const rangeList: number[] = []
        for (let i = 0; i <= this.splitNum; i++) {
            const tempVal = parseFloat((min + i * spaceUnit).toFixed(1))
            rangeList.push(tempVal)
        }
        // 注意需要将 range 按照当前的切分要求进行切分
        this.colorScales.forEach((temp) => (temp.scale.range = rangeList))
    }

    @Getter(GET_RASTER_LAYER_KEY, { namespace: 'map' }) getRasterLayerType

    get isShow(): boolean {
        return this.getRasterLayerType === RasterLayerEnum.RASTER_LAYER
    }
}
</script>
<style lang="less" scoped>
.color-bar-list {
    margin-top: 2px;
}
.color-bar-list > .color-bar {
    margin-bottom: 5px;
}
.color-bar-list .color-bar {
    margin-bottom: 5px;
}
.color-bar {
    display: flex;
    width: 300px;
    border-radius: 0.4em;
    box-shadow: 0 0 4px 0 black;
    // 加入边角弧度并仿制内部填色溢出
    border-radius: 0.4em;
    overflow: hidden;
    .color-bar-content {
        display: flex;
        justify-content: space-around;
        width: 100%;
    }
    span {
        margin-left: 8px;
        width: 24px;
        color: white;
        text-shadow: 0 0 4px black;
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
