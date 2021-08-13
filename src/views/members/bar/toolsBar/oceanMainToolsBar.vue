<template>
    <div class="ocean-main-toolsbar">
        <!-- <transition name="fade"> -->
        <!-- <transition-group name="list" tag="p"> -->
        <a
            v-for="item in converToolsBar"
            :key="item.key"
            v-show="checkexpandedStatue(item)"
            :class="[
                !checkexpandedStatue(item) ? 'children-hidden' : 'children-show',
                item.isChildren ? 'sub-title' : 'main-title'
            ]"
        >
            <!-- <a v-for="item in converToolsBar" :key="item.key" v-show="checkexpandedStatue(item)"> -->
            <!-- <input v-show="item.isChildren" type="checkbox" /> -->
            <div
                class="tools-icon "
                :class="[item.isChildren ? 'sub-title' : '', item.iconClass]"
            ></div>
            <div class="tools-font" :class="{ checked: item.checked }" @click="onClick(item)">
                {{ item.title }}
            </div>
            <div class="child-options" v-show="item.showOptions">
                <div class="child-options-title">概率</div>
                <el-select v-model="proSurgeLayerVal" placeholder="请选择" @change="setOptions">
                    <el-option
                        v-for="tempOptions in item.options"
                        :key="tempOptions.key"
                        :label="tempOptions.val"
                        :value="tempOptions.optionsType"
                    ></el-option>
                </el-select>
            </div>
            <!-- TODO:[-] 20-11-14 将 is-show 放在组建中 以下暂时注释掉 采用动态添加组件的方式替代 -->
            <!-- <transition name="fade">
                <div
                    class="show-form"
                    :class="item.isExpanded ? 'form-fade-in' : 'form-fade-out'"
                    v-show="item.isExpanded"
                >
                    <component v-bind:is="item.html"></component>
                </div>
            </transition> -->
        </a>

        <div id="insert-container">
            <div v-for="item in insertComponents" :key="item.key">
                <component v-bind:is="item.html" v-if="item.isShow"></component>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Mutation, namespace } from 'vuex-class'
import { mapMutations } from 'vuex'
import moment, { parseTwoDigitYear } from 'moment'
// leaflet 相关
import * as L from 'leaflet'

// 各类组件
import OilShowTypeSelect from '@/views/members/select/oilShowTypeSelect.vue'
import OilFactorSelect from '@/views/members/select/OilFactorSelect.vue'
import MakePointBtn from '@/views/members/tools/MakePointBtn.vue'

// 枚举
import { LayerTypeEnum } from '@/enum/map'
import { ToolBarOptionsEnum } from '@/enum/options'

// vuex 常量
import { SET_MAP_LAYERS, SET_CURRENT_LATLNG_LOCK } from '@/store/types'
import { IExpandModel, ToolTypeEnum } from './types'

// 引入其他的需要继承的组件
import OilShowTypeSelectBar from './showTypeSelectBaseBar.vue'
import FactorSelectBaseBar from './factorSelectBaseBar.vue'
import { mixins } from 'vue-class-component'
// ----
// TODO:[-] 20-11-11 组件中的类型放在 ./types.ts 文件中
@Component({
    components: {
        OilShowTypeSelect,
        OilFactorSelect,
        MakePointBtn
    }
})
export default class OceanMainToolsBar extends mixins(OilShowTypeSelectBar, FactorSelectBaseBar) {
    // 是否展开窗口| false:未展开, true:展开了|默认未展开
    isExpanded = false
    mounted() {
        this.toolsBar = [...this.toolsBar, ...this.toolsShowTypeBar, ...this.toolsFactorBar]
        this.getToolsBar()
    }
    toolsBar: IExpandModel[] = [
        {
            isExpanded: false,
            html: 'MakePointBtn',
            iconClass: 'fas fa-map-marked-alt',
            title: '选取位置',
            hasChildren: false,
            isChildren: false,
            toolType: ToolTypeEnum.SELECTPOSITION,
            val: '',
            checked: false
        },
        {
            isExpanded: false,
            html: '',
            iconClass: 'fas fa-tasks',
            title: '选择图层',
            hasChildren: true,
            isChildren: false,
            toolType: ToolTypeEnum.OPTION,
            val: '',
            checked: false,
            // isFather: true,
            children: [
                // + 21-03-26 海浪等值线按钮
                {
                    isExpanded: false,
                    html: '',
                    iconClass: 'fas fa-wind',
                    title: '集合路径',
                    hasChildren: false,
                    isChildren: true,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.GROUP_PATH_LAYER,
                    val: '',
                    checked: false
                },
                {
                    isExpanded: false,
                    html: '',
                    iconClass: 'fas fa-wind',
                    title: '最大风暴增水',
                    hasChildren: false,
                    isChildren: true,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.RASTER_MAX_SURGE_LAYER,
                    val: '',
                    checked: false
                },
                {
                    isExpanded: false,
                    html: '',
                    iconClass: 'fas fa-water',
                    title: '逐时风暴增水',
                    hasChildren: false,
                    isChildren: true,
                    hasOptions: true,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.RASTER_HOURLY_SURGE_LAYER,
                    val: '',
                    checked: false
                },
                {
                    isExpanded: false,
                    html: '',
                    iconClass: 'fas fa-water',
                    title: '概率风暴增水',
                    hasChildren: false,
                    isChildren: true,
                    hasOptions: true,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER,
                    val: '',
                    checked: false,
                    showOptions: false,
                    options: [
                        {
                            key: 0,
                            val: '大于0.5m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT05
                        },
                        {
                            key: 1,
                            val: '大于1.0m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT10
                        },
                        {
                            key: 2,
                            val: '大于1.5m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT15
                        },
                        {
                            key: 3,
                            val: '大于2.0m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT20
                        },
                        {
                            key: 4,
                            val: '大于2.5m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT25
                        },
                        {
                            key: 5,
                            val: '大于3.0m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT30
                        }
                    ]
                },
                // 流场 的 masked 的 栅格
                {
                    isExpanded: false,
                    html: '',
                    iconClass: 'fas fa-globe-asia',
                    title: '潮位站',
                    hasChildren: false,
                    isChildren: true,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.STATION_ICON_LAYER,
                    val: '',
                    checked: false
                }
            ]
        }
        // {
        //     isExpanded: false,
        //     html: 'OilShowTypeSelect',
        //     iconClass: 'fa fa-television',
        //     title: 'last',
        //     hasChildren: false,
        //     isChildren: false,
        //     toolType: ToolTypeEnum.OPTION,
        //     val: ''
        // }
    ]

    insertComponents = [
        {
            toolType: ToolTypeEnum.SELECTPOSITION,
            html: 'MakePointBtn',
            isShow: false
        }
    ]

    layers: LayerTypeEnum[] = []

    proSurgeLayer: LayerTypeEnum = LayerTypeEnum.UN_LAYER
    proSurgeLayerVal: LayerTypeEnum = LayerTypeEnum.UN_LAYER

    // tempOptions?: { key: number; val: string }[] = [
    //     { key: 0, val: '测试1' },
    //     { key: 1, val: '测试2' }
    // ]

    converToolsBar: {
        id: number
        // 只有 isChildren 才有 pid
        pid?: number
        // 是否展开
        isExpanded: boolean
        html: string
        iconClass: string
        title: string
        // 是否有 子节点
        isChildren: boolean
        toolType: ToolTypeEnum
        val: string
        checked: boolean
        isRadio?: boolean
        optionsType?: ToolBarOptionsEnum
        options?: { key: number; val: string }[]
    }[] = []

    // 将 toolsbar 转换 -> convertToolsBar
    getToolsBar(): {
        isExpanded: boolean
        html: string
        iconClass: string
        title: string
        isChildren: boolean
    }[] {
        let index = 0
        let pid = 0
        let cid = 0
        const convertTools: {
            isExpanded: boolean
            html: string
            iconClass: string
            title: string
            // hasChildren: boolean
            isChildren: boolean
        }[] = []
        this.toolsBar.map((father) => {
            pid = ++index
            this.converToolsBar.push({
                ...father,
                isChildren: false,
                id: index,
                checked: false
            })
            if (father.hasChildren) {
                father.children.map((child) => {
                    cid = ++index
                    this.converToolsBar.push({
                        id: cid,
                        ...child,
                        isChildren: true,
                        pid: pid
                        // checked: false
                    })
                })
            }
        })
        // this.converToolsBar = convertTools
        return convertTools
    }

    get getConverToolsBar(): {
        id: number
        // 只有 isChildren 才有 pid
        pid?: number
        // 是否展开
        isExpanded: boolean
        html: string
        iconClass: string
        title: string
        // 是否有 子节点
        isChildren: boolean
        toolType: ToolTypeEnum
        val: string
        checked: boolean
    }[] {
        return [...this.converToolsBar]
    }

    @Watch('converToolsBar')
    onConvertToolsBar(
        toolsBar: {
            id: number
            // 只有 isChildren 才有 pid
            pid?: number
            // 是否展开
            isExpanded: boolean
            html: string
            iconClass: string
            title: string
            // 是否有 子节点
            isChildren: boolean
            toolType: ToolTypeEnum
            val: string
            checked: boolean
            isRadio?: boolean
            optionsType?: ToolBarOptionsEnum
        }[]
    ): void {
        // 找到显示模式相关的 children
        const childrenShowType = toolsBar.filter(
            (temp) => temp.toolType === ToolTypeEnum.SHOWTYPEOPTION
        )
        const onlyShowTypeObj = childrenShowType.find((temp) => temp.checked === true)
        if (onlyShowTypeObj !== undefined) {
            this.handleOption(onlyShowTypeObj.optionsType)
        }
    }

    setOptions(item: LayerTypeEnum, tempOptions: any): void {
        console.info(`监听到item发生变化:${item}`)
        // console.info(`监听到tempOptions发生变化:${tempOptions}`)
        this.proSurgeLayer = item
        // this.insertLayers(item)
    }

    @Watch('proSurgeLayer')
    onProSurgeLayer(newLayer: LayerTypeEnum, oldLayer: LayerType): void {
        // step: 若 oldLayer 存在则从当前 layers 中找到并去掉，若不存在则不执行以上操作
        if (oldLayer !== LayerTypeEnum.UN_LAYER) {
            const index = this.layers.findIndex((item) => item === oldLayer)
            if (index >= 0) {
                this.layers.splice(index, 1)
            }
        }
        this.layers.push(newLayer)
    }

    insertLayers(tempLayerType: LayerTypeEnum): void {
        if (this.layers.indexOf(tempLayerType) === -1) {
            this.layers.push(tempLayerType)
        } else {
            // 若已经存在则删除
            const index = this.layers.findIndex((temp) => temp === tempLayerType)
            if (index != -1) {
                this.layers.splice(index, 1)
            }
        }
    }

    @Mutation(SET_MAP_LAYERS, { namespace: 'map' }) setLayers

    // TODO:[-] 21-01-05
    @Mutation(SET_CURRENT_LATLNG_LOCK, { namespace: 'map' }) setCurrentLatlngLock

    // 点击展开节点或将节点设置为选中状态，并根据toolType判断是否为 ToolTypeEnum.LAYER ，若为 layer 则添加至 layers
    onClick(item: {
        isExpanded: boolean
        toolType: ToolTypeEnum
        layerType: LayerTypeEnum
        id: number
        // 只有 isChildren 才有 pid
        pid?: number
        val: string
        isChildren: boolean
        optionsType?: ToolBarOptionsEnum
        // 是否为勾选状态
        checked?: boolean
        // 是否为单选按钮
        isRadio?: boolean
        showOptions?: boolean
    }): void {
        // 1- 执行展开操作
        // s1- 注意此处有一个先导的判断，先判断是否为children，若为child则不用
        if (!item.isChildren) {
            item.isExpanded = !item.isExpanded
        }
        // item.checked = !item.checked
        // item.isExpanded = !item.isExpanded
        this.converToolsBar.map((child) => {
            if (child.pid === item.id) {
                child.isExpanded = !item.isExpanded
            }
        })
        // 2-1 若为 layer 则去执行修改layer的操作
        if (
            item.toolType == ToolTypeEnum.LAYER &&
            item['showOptions'] === undefined &&
            !item.showOptions
        ) {
            // TODO:[-] 21-08-11 此处将以上方法封装至 insertLayers 中
            this.insertLayers(item.layerType)
        }
        // TODO:[-] 20-11-11
        // 2-2 若为 SHOWTYPEOPTION -> optionsType
        else if (item.toolType === ToolTypeEnum.SHOWTYPEOPTION && item.isChildren) {
            // 调用子类实现的 点击 option 调用的方法
            // item.checked = !item.checked
            // 修改数组的方式1:[可行]
            // 非引用类型
            // const tempIndex = this.converToolsBar.findIndex((temp) => {
            //     return temp.id == item.id
            // })
            // const tempBar = this.converToolsBar.find((temp) => {
            //     return temp.id == item.id
            // })
            // this.converToolsBar[tempIndex].checked = !item.checked
            // console.log(`${tempIndex} + ${this.converToolsBar[tempIndex].checked}`)
            // this.handleOption(item.optionsType)
            // 以上会出现直接根据索引修改数值的值造成无法监听其变化的问题
            // 修改数组的方式2； [可行]
            // const tempArr = [...this.converToolsBar]
            // const tempIndex = tempArr.findIndex((temp) => {
            //     return temp.id == item.id
            // })
            // tempArr[tempIndex].checked = !item.checked
            // this.converToolsBar = tempArr
            // 修改数组的方式3:[可行]
            const tempIndex = this.converToolsBar.findIndex((temp) => {
                return temp.id == item.id
            })
            // 更新数组
            const tempObj = this.converToolsBar[tempIndex]
            tempObj.checked = !item.checked
            this.$set(this.converToolsBar, tempIndex, tempObj)
            // 修改数组的方式4:[ ]
            // this.converToolsBar.map((temp) => {
            //     if (temp.id === item.id) {
            //         temp.checked = !item.checked
            //     }
            // })

            // 找到当前 pid 对应的全部 children 将其余 children.checked 设置为 false
            this.converToolsBar.map((temp) => {
                if (temp.pid === item.pid && temp.isRadio === true && temp.id !== item.id) {
                    temp.checked = false
                }
            })
        } else if (item.toolType === ToolTypeEnum.SELECTPOSITION) {
            // TODO:[*] 20-11-15 + 动态添加组件
            // 选取位置，方式1： 动态添加 组件
            // const MakePointBtnCls = Vue.extend(MakePointBtn)
            // const makePointInstance = new MakePointBtnCls()
            // makePointInstance.$mount('#insert-container')

            // 方式2: 通过 insertComponents[] 来控制 动态组件
            this.insertComponents.filter((temp) => {
                temp.isShow = !temp.isShow
                this.setCurrentLatlngLock(!temp.isShow)
            })
        }
        // 2-3 TODO:[-] 21-08-11 若 存在 showOptions 属性，则对 showOptions 取反
        if (item['showOptions'] !== undefined) {
            item.showOptions = !item.showOptions
        }
    }

    @Watch('layers')
    onLayers(layers: LayerTypeEnum[]): void {
        // console.log(layers)
        this.setLayers(layers)
    }

    checkexpandedStatue(item: {
        isExpanded: boolean
        html: string
        iconClass: string
        title: string
        isChildren: boolean
    }): boolean {
        let isShow = false
        // 只要不是 children 全部显示
        if (!item.isChildren) {
            isShow = true
        }
        // 若是 children ，则要判断 isExpanded 是否为 true，true的才显示
        else if (item.isChildren && item.isExpanded) {
            isShow = true
        }
        // else if (item)
        return isShow
    }
}
</script>
<style scoped lang="less">
// @import '../../styles/base';
// TODO:[-] 20-08-31 由于在加载风场的情况下会有些偏绿，所以操作框的背景颜色不适合此颜色，改为深蓝色
// @background: #4c818aad;
@background: #34495ed0;
@main-title-color: #34495ed0;
@sub-title-color: #f39d129a;
@border-radius: 2em;
@margin: 0.4em 0.4em;
@padding: 0.4em 0.4em;
@checked: {
    // TODO:[-] 20-11-14 此处的颜色应该 根据 title 的类型进行动态调整
    background-color: @sub-title-color;
    border-radius: @border-radius;
    margin: 0 0.4em;
    width: 150px;
    // margin: @margin;
    transition: background-color 0.8s;
    transition: width 0.8s;
    transition-property: background-color;
    transition-duration: 0.8s;
    transition-timing-function: ease;
    transition-delay: 0s;
};
.ocean-main-toolsbar {
    // TODO:[-] 20-08-31 注意此处的阴影效果与 curd btn 的阴影效果要相同
    box-shadow: 0px 5px 11px #333333;
    // width: 100px;
    // background-color: @background;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    border-radius: @border-radius;
    // 加入了文字不可选
    user-select: none;
    width: 40px;
    // 暂时未用
    .main-title {
        background: @main-title-color;
        .checked {
            background: @main-title-color;
        }
    }
    .sub-title {
        background: @sub-title-color;
        .checked {
            background: @sub-title-color;
        }
    }
    a {
        position: relative;
        color: #fff3e1;
        text-shadow: 0 0 4px black;
        // margin: @margin;
        padding: @padding;
        cursor: pointer;
    }
    a > .checked {
        @checked();
    }
    a > div.tools-font:hover {
        @checked();
    }
    a > div.tools-font {
        // 20-11-09 修改了 font 的宽度，保证选中时的蓝色底色不会太窄
        width: 150px;
        position: float;
        position: absolute;
        float: rigth;
        left: 30px;
        top: 0px;
        // 20-11-14 加入了右侧文字的 padding
        padding: @padding;
    }
    a > div.show-form {
        background-color: @background;
        border-radius: 0.8em;
        // width: 130px;
        position: float;
        position: absolute;
        float: rigth;
        left: 130px;
        // background-color: white;
        top: 0px;
        transform: translate(-0, -45%);
        box-shadow: 1px 2px 8px black;
    }
    a > div.show-form:hover {
        color: #fff3e1;
    }

    // TODO:[-] 21-08-11 加入的对于下拉框组件的样式
    .child-options {
        /* position: relative; */
        display: flex;
        /* float: left; */
        width: 200px;
        margin: 3px;
        .child-options-title {
            display: inline-block;
            width: 50;
            width: 100px;
            color: white;
            text-align: left;
            font-size: 17px;
            font-weight: bold;
        }
        .el-select {
        }
    }

    // show 的 动画
    .form-fade-in {
        animation: go_in 1s;
        // transition: transform 2s;
    }
    @keyframes go_in {
        0% {
            opacity: 0;
            transform: scale(0.5);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    .form-fade-out {
        animation: go_out 1s;
        // transition: transform 2s;
    }
    @keyframes go_out {
        0% {
            opacity: 1;
            // transform: scale(1);
            // visibility: visible;
        }
        100% {
            opacity: 0;
            // transform: scale(0);
        }
    }
}
// 20-11-14 新加入的不论 ocean-main-toolsbar 中嵌套的是什么元素，对子元素的首个及尾部加入圆角
.ocean-main-toolsbar a:first-child {
    border-radius: 2em 2em 0 0;
}
.ocean-main-toolsbar a:last-child {
    border-radius: 0 0 2em 2em;
}

// ---------------

// TODO:[*] 20-07-28 尝试加入 transition-group
.list-enter-active,
.list-leave-active {
    transition: all 1s;
}
.list-enter,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

// ---------------

.children-show {
    // animation: transform-up-heigh ease-in-out 0.7s;
    animation: go_in 0.7s;
    // transition-property: visibility, height, max-height, padding, margin;
    // transition-delay: 150ms, 0ms, 0ms, 0ms, 0ms;
    // visibility: visible;
    // max-height: 25px;
}
.children-hidden {
    // animation: transform-down-heigh ease-in-out 0.7s;
    animation: go_out 0.7s;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}

// 部分动画效果
@keyframes transform-up-heigh {
    0% {
        height: 0%;
    }
    100% {
        height: 100%;
    }
}
@keyframes transform-down-heigh {
    0% {
        height: 100%;
    }
    100% {
        height: 0%;
    }
}
</style>
