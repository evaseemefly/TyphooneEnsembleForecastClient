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
                :class="[
                    'tools-icon',
                    item.isTitleShow || item.checked ? 'show-icon' : 'hidden-icon',
                    item.checked ? 'icon-checked' : ''
                ]"
                @click="onClick(item)"
                @mouseover="setItemShow(item, true)"
                @mouseleave="setItemShow(item, false)"
            >
                <!-- 由于使用 font-icon 此处div会生成 svg，svg无法直接触发click事件，需要在外侧再套一层div -->
                <div
                    :class="[
                        item.isChildren ? 'sub-title' : '',
                        item.iconClass,
                        item.isTitleShow ? 'show-icon' : 'hidden-icon'
                    ]"
                ></div>
            </div>
            <div
                class="tools-font"
                :class="[item.isTitleShow ? 'show-font form-fade-in' : 'hidden-font form-fade-out']"
                @click="onClick(item)"
            >
                {{ item.title }}
            </div>
            <div class="child-options" v-show="item.showOptions">
                <div class="child-options-title">概率</div>
                <el-select v-model="proSurgeLayerItem" placeholder="请选择" value-key="key">
                    <el-option
                        v-for="tempOptions in item.options"
                        :key="tempOptions.key"
                        :label="tempOptions.val"
                        :value="tempOptions"
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
import { Mutation, namespace, Getter } from 'vuex-class'
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
import {
    SET_MAP_LAYERS,
    SET_CURRENT_LATLNG_LOCK,
    GET_IS_INIT_LAYERS,
    SET_IS_INIT_LAYERS,
    SET_SHOW_OPTS_FORM
} from '@/store/types'
import { IExpandModel, ToolTypeEnum } from './types'

// 引入其他的需要继承的组件
import OilShowTypeSelectBar from './showTypeSelectBaseBar.vue'
import FactorSelectBaseBar from './factorSelectBaseBar.vue'
import { DEFAULT_LAYER_ITEM } from './const'
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
    isShowOpts = false
    mounted() {
        this.toolsBar = [...this.toolsBar, ...this.toolsShowTypeBar, ...this.toolsFactorBar]
        this.initToolsBar2ConvertedBar()
        this.checkLayerInToolsBar(this.layers, [])
    }
    toolsBar: IExpandModel[] = [
        {
            isExpanded: true,
            html: '',
            iconClass: 'fas fa-tasks',
            title: '选择图层',
            hasChildren: true,
            isChildren: false,
            toolType: ToolTypeEnum.OPTION,
            val: '',
            checked: false,
            isTitleShow: false,
            children: [
                // + 21-03-26 海浪等值线按钮
                {
                    isExpanded: true,
                    html: '',
                    iconClass: 'fas fa-route',
                    title: '集合路径',
                    hasChildren: false,
                    isChildren: true,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.GROUP_PATH_LAYER,
                    val: '',
                    checked: false,
                    group: 2,
                    isTitleShow: false
                },
                {
                    isExpanded: true,
                    html: '',
                    iconClass: 'fas fa-infinity',
                    title: '最大风暴增水',
                    hasChildren: false,
                    isChildren: true,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.RASTER_MAX_SURGE_LAYER,
                    val: '最大风暴增水',
                    checked: false,
                    group: 1,
                    isTitleShow: false
                },
                {
                    isExpanded: true,
                    html: '',
                    iconClass: 'fas fa-wave-square',
                    title: '逐时风暴增水',
                    hasChildren: false,
                    isChildren: true,
                    hasOptions: false,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.RASTER_HOURLY_SURGE_LAYER,
                    val: '逐时风暴增水',
                    checked: false,
                    group: 1,
                    isTitleShow: false
                },
                {
                    isExpanded: true,
                    html: '',
                    iconClass: 'fas fa-percentage',
                    title: '概率风暴增水',
                    hasChildren: false,
                    isChildren: true,
                    hasOptions: true,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER,
                    val: '概率风暴增水',
                    checked: false,
                    showOptions: false,
                    group: 1,
                    isTitleShow: false,
                    options: [
                        // {
                        //     key: -1,
                        //     val: '未选择',
                        //     optionsType: LayerTypeEnum.UN_LAYER,
                        //     group: 1
                        // },
                        {
                            key: 0,
                            val: '大于0.5m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT05,
                            group: 1
                        },
                        {
                            key: 1,
                            val: '大于1.0m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT10,
                            group: 1
                        },
                        {
                            key: 2,
                            val: '大于1.5m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT15,
                            group: 1
                        },
                        {
                            key: 3,
                            val: '大于2.0m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT20,
                            group: 1
                        },
                        {
                            key: 4,
                            val: '大于2.5m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT25,
                            group: 1
                        },
                        {
                            key: 5,
                            val: '大于3.0m',
                            optionsType: LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT30,
                            group: 1
                        }
                    ]
                },
                // 显示潮位站位置示意不显示对应的增水
                // {
                //     isExpanded: false,
                //     html: '',
                //     iconClass: 'fas fa-laptop-house',
                //     title: '海洋站静态位置',
                //     hasChildren: false,
                //     isChildren: true,
                //     toolType: ToolTypeEnum.LAYER,
                //     layerType: LayerTypeEnum.STATION_ICON_LAYER,
                //     val: '',
                //     checked: false,
                //     group: 3,
                //     isTitleShow: false
                // },
                // 显示潮位站位置示意不显示对应的增水
                {
                    isExpanded: true,
                    html: '',
                    iconClass: 'fas fa-home',
                    title: '海洋站',
                    hasChildren: false,
                    isChildren: true,
                    toolType: ToolTypeEnum.LAYER,
                    layerType: LayerTypeEnum.STATION_ICON_LAYER,
                    val: '海洋站',
                    checked: false,
                    group: 3,
                    isTitleShow: false
                }, // 显示潮位站位置示意不显示对应的增水
                {
                    isExpanded: true,
                    html: '',
                    iconClass: 'fas fa-sitemap',
                    title: '配置',
                    hasChildren: false,
                    isChildren: true,
                    toolType: ToolTypeEnum.OPTIONS,
                    layerType: LayerTypeEnum.UN_LAYER,
                    val: '',
                    checked: false,
                    group: 4,
                    isTitleShow: false
                }
                // {
                //     isExpanded: false,
                //     html: '',
                //     iconClass: 'fas fa-house-damage',
                //     title: '海洋站极值',
                //     hasChildren: false,
                //     isChildren: true,
                //     toolType: ToolTypeEnum.LAYER,
                //     layerType: LayerTypeEnum.STATION_ICON_MAX_LAYER,
                //     val: '',
                //     checked: false,
                //     group: 3,
                //     isTitleShow: false
                // }
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

    // layers: LayerTypeEnum[] = [LayerTypeEnum.GROUP_PATH_LAYER]
    layers: LayerTypeEnum[] = []
    layersItem: { group: number; layerType: LayerTypeEnum; val: string }[] = []

    defaultGroup = 1

    proSurgeLayer: LayerTypeEnum = LayerTypeEnum.UN_LAYER
    proSurgeLayerVal: LayerTypeEnum = LayerTypeEnum.UN_LAYER
    proSurgeLayerItem: { group: number; layerType: LayerTypeEnum; val: string } = null

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
        group?: number
        optionsType?: ToolBarOptionsEnum

        options?: { key: number; val: string }[]
        layerType: LayerTypeEnum
        isTitleShow: false
    }[] = []

    // 将 toolsbar 转换 -> convertToolsBar
    initToolsBar2ConvertedBar(): {
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
                id: index
                // checked: false
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
            group?: number
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

    @Watch('proSurgeLayerItem')
    onProSurgeLayer(
        newLayer: { group: number; optionsType: LayerTypeEnum; val: string },
        oldLayer: { group: number; optionsType: LayerTypeEnum; val: string }
    ): void {
        // step: 若 oldLayer 存在则从当前 layers 中找到并去掉，若不存在则不执行以上操作
        if (newLayer.optionsType !== LayerTypeEnum.UN_LAYER) {
            // TODO:[-] 22-03-22 在此处需要从 checkedLayers 中删除 概率增水场
            const index = this.checkedLayers.findIndex((temp) => {
                return temp === LayerTypeEnum.RASTER_PRO_SURGE_LAYER
            })
            if (index >= 0) {
                this.checkedLayers.splice(index, 1)
            }

            // --
            // this.checkedLayers.push(newLayer.optionsType)
            // TODO:[-] 22-03-23 此处需要加入判断 概率增水场是否在当前的layers中
            this._checkProSurgeLayerInLayersItem(newLayer)
            // 此处还需要去掉 convertlayer 中的同group的checked=false
            this.converToolsBar.map((temp) => {
                if (temp.group === newLayer.group) {
                    temp.checked = false
                }
            })

            this.insertLayers({
                group: newLayer.group,
                layerType: newLayer.optionsType,
                val: newLayer.val
            })
        } else if (newLayer.optionsType === LayerTypeEnum.UN_LAYER) {
            // 若当前选择的是未选择 option ，则去掉所有的概率增水场图层
            this._removeProSurgeLayers()
        }
    }

    // 传入概率增水场 layer ，并判断当前 this.layersItem 中是否存在pro layer，若 toPop =true则删掉并插入
    _checkProSurgeLayerInLayersItem(
        tempLayerType: {
            group: number
            optionsType: LayerTypeEnum
            val: string
        },
        toPop = true
    ): boolean {
        const that = this
        const sameGroupIndexs: number[] = []
        this.layersItem.forEach((val, index) => {
            if (val.group === tempLayerType.group) {
                sameGroupIndexs.push(index)
            }
        })
        if (toPop) {
            sameGroupIndexs.forEach((index) => {
                that.layersItem.splice(index, 1)
            })
        }
        return sameGroupIndexs.length > 0
    }

    // 判断 layer 是否存在当前 layers 中
    _getTargetLayerInLayersIndex(tempLayer: {
        group: number
        layerType: LayerTypeEnum
        val: string
    }): number {
        let index = -1
        let indexStation = -1
        indexStation = this.layersItem.findIndex((temp) => {
            return (
                temp.layerType === LayerTypeEnum.STATION_ICON_LAYER ||
                temp.layerType === LayerTypeEnum.STATION_ICON_FIELD_LAYER ||
                temp.layerType === LayerTypeEnum.STATION_ICON_MAX_LAYER
            )
        })
        if (indexStation >= 0) {
            index = this.layersItem.findIndex((temp) => {
                return temp.layerType === tempLayer.layerType
            })
        }

        return index
    }

    // 设置当前传入的 item 是否显示 (isTitleShow)
    setItemShow(
        item: {
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
            group?: number
            optionsType?: ToolBarOptionsEnum
            options?: { key: number; val: string }[]
            layerType: LayerTypeEnum
            isTitleShow: boolean
        },
        isShow: boolean
    ): void {
        item.isTitleShow = isShow
    }

    // + 22-01-10 判断当前 layer 在 this.layersItem 中是否存在相同 group 的layer
    // 若存在则返回 index
    _getSameGroupLayer(tempLayer: {
        group: number
        layerType: LayerTypeEnum
        val: string
    }): number {
        let isExisted = false
        let index = -1
        // const indexStation = this.layersItem.findIndex((temp) => {
        //     return (
        //         temp.layerType === LayerTypeEnum.STATION_ICON_LAYER ||
        //         temp.layerType === LayerTypeEnum.STATION_ICON_FIELD_LAYER ||
        //         temp.layerType === LayerTypeEnum.STATION_ICON_MAX_LAYER
        //     )
        // })
        // if (indexStation > 0) {
        //     index = indexStation
        // } else {
        //     index = this.layersItem.findIndex((temp) => {
        //         return temp.group === tempLayer.group
        //     })
        // }
        index = this.layersItem.findIndex((temp) => {
            return temp.group === tempLayer.group
        })

        if (index >= 0) {
            isExisted = true
        }
        return index
    }

    /*
        + 22-03-22
        判断当前 checkedLayers 中是否已经存在了 pro surge

    */
    _checkProSurgeRaster(
        tempLayerType: {
            group: number
            optionsType: LayerTypeEnum
            val: string
        },
        toPop = true
    ): boolean {
        let existed = false
        // 若传入的当前 surge type 不为 pro surge
        const rasterProSurgeLayerEnum = this.toolsBar[0].children.filter((temp) => {
            return temp.layerType === LayerTypeEnum.RASTER_PRO_SURGE_LAYER
        })
        // 获取当前 layer -> .options 中 group==1的所有 options，并获取所有options的 optionsType
        const rasterProSurgeLayersEnums: LayerTypeEnum[] = []
        if (rasterProSurgeLayerEnum.length > 0) {
            rasterProSurgeLayerEnum[0].options
                .filter((temp) => {
                    return temp.group === 1 && temp.optionsType
                })
                .forEach((lay) => {
                    if (lay.optionsType !== undefined) {
                        rasterProSurgeLayersEnums.push(lay.optionsType)
                    }
                })
        }
        //

        if (tempLayerType.optionsType !== LayerTypeEnum.RASTER_PRO_SURGE_LAYER) {
            // 判断当前的 checkedLayers 中是否存在当前的 实际概率增水场 type
            const index = this.checkedLayers.findIndex((temp) => {
                return temp === tempLayerType.optionsType
            })
            if (index >= 0) {
                // 若存在，根据 toPop 判断是否需要剔除
                existed = true
                if (toPop) {
                    this.checkedLayers.splice(index, 1)
                }
            }
            // 判断当前的 checkedLayers 中是否存在 rasterProSurgeLayersEnums 的layer

            const intersection = this.checkedLayers.filter((item) =>
                new Set(rasterProSurgeLayersEnums).has(item)
            )
            if (intersection.length > 0) {
                intersection.forEach((item) => {
                    const spliceIndex = this.checkedLayers.findIndex((layerTemp) => {
                        return layerTemp === item
                    })
                    if (spliceIndex >= 0) {
                        this.checkedLayers.splice(spliceIndex, 1)
                    }
                })
            }
        }
        return existed
    }

    // 插入layers ，若已经存在则删除
    insertLayers(tempLayerType: { group: number; layerType: LayerTypeEnum; val: string }): void {
        const index = this._getTargetLayerInLayersIndex(tempLayerType)
        const indexSameGroup = this._getSameGroupLayer(tempLayerType)
        if (index >= 0) {
            this._removeLayerByIndex(indexSameGroup)
        }
        // TODO:[-] 22-01-09 在插入时，需要
        if (indexSameGroup >= 0) {
            // this.removeLayers(tempLayerType)
            this._removeLayerByIndex(indexSameGroup)
        }
        this.layersItem.push(tempLayerType)
        this.checkedLayers.push(tempLayerType.layerType)
    }

    // TODO:[-] 22-03-22 获取 convertedLayers 中的checked 的layers
    get getCheckedLayers(): LayerTypeEnum[] {
        const convertedLayers: LayerTypeEnum[] = []
        this.converToolsBar.forEach((temp) => {
            if (temp.checked) {
                convertedLayers.push(temp.layerType)
            }
        })

        // this.setLayers(convertedLayers)
        this.checkedLayers = convertedLayers
        return convertedLayers
    }
    get getCheckedLayersSet(): Set<LayerTypeEnum> {
        return new Set(this.checkedLayers)
    }
    checkedLayers: LayerTypeEnum[] = []

    // 从当前 layers 中删除指定layers
    removeLayers(tempLayerType: { group: number; layerType: LayerTypeEnum; val: string }): void {
        const index = this._getTargetLayerInLayersIndex(tempLayerType)
        this._removeLayerByIndex(index)
    }

    // 从 this.layersItem 中删除 index 下标的 layers
    _removeLayerByIndex(index: number): boolean {
        let isOk = false
        if (index >= 0) {
            this.layersItem.splice(index, 1)
            isOk = true
        }
        return isOk
    }

    // 删除所有概率增水场图层
    _removeProSurgeLayers(): void {
        const removeIndex = this.layersItem.findIndex((temp) => {
            return temp.group === 1
        })
        this._removeLayerByIndex(removeIndex)
    }

    // 重置layers 数组
    initLayers(): void {
        // this.layers = [LayerTypeEnum.GROUP_PATH_LAYER]
        this.layersItem = [DEFAULT_LAYER_ITEM]
    }

    @Mutation(SET_MAP_LAYERS, { namespace: 'map' }) setLayers

    // TODO:[-] 21-01-05
    @Mutation(SET_CURRENT_LATLNG_LOCK, { namespace: 'map' }) setCurrentLatlngLock

    // TODO:[-] 22-01-05 加入的监听是否要重置当前 layers
    @Getter(GET_IS_INIT_LAYERS, { namespace: 'map' }) getIsInitLayers

    @Mutation(SET_IS_INIT_LAYERS, { namespace: 'map' }) setInitLayers

    // 已经废弃！点击展开节点或将节点设置为选中状态，并根据toolType判断是否为 ToolTypeEnum.LAYER ，若为 layer 则添加至 layers
    onClickBak(item: {
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
        group?: number
    }): void {
        const that = this
        // 1- 执行展开操作
        // s1- 注意此处有一个先导的判断，先判断是否为children，若为child则不用
        if (!item.isChildren) {
            item.isExpanded = !item.isExpanded
        }
        this.converToolsBar.map((child) => {
            if (child.pid === item.id) {
                child.isExpanded = !item.isExpanded
            }
        })
        item.checked = !item.checked
        // 2-1 若为 layer 则去执行修改layer的操作
        if (
            item.toolType == ToolTypeEnum.LAYER &&
            item['showOptions'] === undefined &&
            !item.showOptions
        ) {
            // TODO:[-] 21-08-11 此处将以上方法封装至 insertLayers 中
            // this.insertLayers(item.layerType)
            // TODO:[-] 22-01-10 注意此处的 item 被修改为 { group: number; layerType: LayerTypeEnum; val: string }
            this.insertLayers({ group: item.group, layerType: item.layerType, val: item.val })
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
            //---
            // 修改数组的方式3:[可行]
            // const tempIndex = this.converToolsBar.findIndex((temp) => {
            //     return temp.id == item.id
            // })
            // // 更新数组
            // const tempObj = this.converToolsBar[tempIndex]
            // tempObj.checked = !item.checked
            // this.$set(this.converToolsBar, tempIndex, tempObj)
            // --
            // 修改数组的方式4:[ ]
            // this.converToolsBar.map((temp) => {
            //     if (temp.id === item.id) {
            //         temp.checked = !item.checked
            //     }
            // })

            // 找到当前 pid 对应的全部 children 将其余 children.checked 设置为 false
            const unCheckedList: number[] = []
            this.converToolsBar.map((temp) => {
                if (temp.pid === item.pid && temp.isRadio === true && temp.id !== item.id) {
                    unCheckedList.push(temp.id)
                    temp.checked = false
                }
            })
            // unCheckedList.forEach(tempIndex=>{
            //     that.$set(that.converToolsBar,tempIndex,)
            // })
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
        } else if (item.toolType === ToolTypeEnum.OPTIONS) {
            this.showOptions()
        }

        // 2-3 TODO:[-] 21-08-11 若 存在 showOptions 属性，则对 showOptions 取反
        if (item['showOptions'] !== undefined) {
            item.showOptions = !item.showOptions
        }
        if (item['group']) {
            console.log(`当前item为:${item}`)
            // this.converToolsBar.map((temp) => {
            //     if (temp['group'] && temp['group'] === item['group']) {
            //         temp.checked = false
            //         console.log(`与当前item同组的item为:${temp.title}`)
            //     }
            //     return temp
            // })
            // ----
            // const tempToolsBar = [...this.converToolsBar]
            // console.log(tempToolsBar)
            // tempToolsBar.map((temp) => {
            //     if (temp['group'] && temp['group'] === item['group'] && temp.id !== item.id) {
            //         temp.checked = false
            //         console.log(`与当前item同组的item为:${temp.title}:checked:${temp.checked}`)
            //     }
            // })
            // 方式1: 目前无法更新至 converToolsBar
            // const tempToolsBar = this.converToolsBar.map((temp) => {
            //     if (temp['group'] && temp['group'] === item['group'] && temp.id !== item.id) {
            //         temp.checked = false
            //         // return (temp.checked = false)
            //         console.log(`与当前item同组的item为:${temp.title}:checked:${temp.checked}`)
            //     }
            //     return temp
            // })
            // console.log(tempToolsBar)
            // console.log('-----')
            // this.converToolsBar = [...tempToolsBar]
            // console.log(this.converToolsBar)
            // 方式2:
            this.converToolsBar.forEach((temp, index) => {
                if (temp['group'] && temp['group'] === item['group'] && temp.id !== item.id) {
                    temp.checked = false
                    // return (temp.checked = false)
                    console.log(`与当前item同组的item为:${temp.title}:checked:${temp.checked}`)
                    that.$set(that.converToolsBar, index, temp)
                    // that.removeLayers(temp.layerType)
                    // TODO:[-] 22-01-10
                    // that.removeLayers({
                    //     group: item.group,
                    //     layerType: item.layerType,
                    //     val: item.val
                    // })
                }
            })
        }
        // TODO:[-] 22-03-22 加入若取消 surge layer 需要同时取消 station layer
        // 判断是否为 surge layer
        const isInLayer =
            [
                LayerTypeEnum.RASTER_MAX_SURGE_LAYER,
                LayerTypeEnum.RASTER_PRO_SURGE_LAYER,
                LayerTypeEnum.RASTER_HOURLY_SURGE_LAYER
            ].findIndex((layer) => {
                return layer === item.layerType
            }) >= 0
        // 判断当前点击的item是 surge layer ，且是未选中状态 -> 从当前convertList 中找到 station layer并设置为未选择状态
        if (item.toolType === ToolTypeEnum.LAYER && isInLayer && !item.checked) {
            const stationLayerIndex = this.converToolsBar.findIndex((layer) => {
                return layer.layerType === LayerTypeEnum.STATION_ICON_LAYER
            })
            // const stationLayerIndex = [
            //     LayerTypeEnum.STATION_ICON_STATIC_LAYER,
            //     LayerTypeEnum.STATION_ICON_FIELD_LAYER,
            //     LayerTypeEnum.STATION_ICON_MAX_LAYER,
            //     LayerTypeEnum.STATION_ICON_LAYER
            // ].findIndex((layer) => {
            //     return layer === item.layerType
            // })
            this.converToolsBar[stationLayerIndex].checked = false
        }
    }

    //  22-03-24 layersItem 计算属性
    get computedLayersItem(): LayerTypeEnum[] {
        const layers: LayerTypeEnum[] = []

        // step1: 获取非 station 的layer
        this.layersItem.forEach((element) => {
            if (element.layerType != LayerTypeEnum.STATION_ICON_LAYER) {
                layers.push(element.layerType)
            }
        })
        // step2-1: 找到 station_icon_layer 的 index
        const stationLayerIndex =
            this.layersItem.findIndex((temp) => {
                return temp.layerType === LayerTypeEnum.STATION_ICON_LAYER
            }) >= 0
                ? this.layersItem.findIndex((temp) => {
                      return temp.layerType === LayerTypeEnum.STATION_ICON_LAYER
                  })
                : -1
        // step2-2: 根据当前 layers 中选中的栅格图层类型向layers中加入对应的 station layer 枚举
        if (stationLayerIndex >= 0) {
            let stationLayerEnum = LayerTypeEnum.STATION_ICON_STATIC_LAYER
            if (
                this.layersItem.findIndex((temp) => {
                    return temp.layerType === LayerTypeEnum.RASTER_HOURLY_SURGE_LAYER
                }) >= 0
            ) {
                stationLayerEnum = LayerTypeEnum.STATION_ICON_FIELD_LAYER
            } else if (
                this.layersItem.findIndex((temp) => {
                    return temp.layerType === LayerTypeEnum.RASTER_MAX_SURGE_LAYER
                }) >= 0
            ) {
                stationLayerEnum = LayerTypeEnum.STATION_ICON_MAX_LAYER
            }
            layers.push(stationLayerEnum)
        }
        return layers
    }

    @Watch('computedLayersItem')
    onComputedLayersItem(layers: LayerTypeEnum[]): void {
        this.setLayers(layers)
    }

    // TODO:[-] 22-03-24 重构 onClick 逻辑
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
        group?: number
    }): void {
        /*
            step1: 修改当前 item.checked
            step2: 判断 this.layersItem 去掉同 group 的item
                   注意: 此处还需要修改当前 converToolsBar 的checked的状态
            step3: 将当前 item push this.layersItem
            step4: 判断传入的 layerType 是否为特殊 layertype
        */
        // step1:
        item.checked = !item.checked
        // step2-1: 从 this.layersItem 中去掉同 group 的 item
        const spliceIndexs: number[] = []

        this.layersItem.forEach((val, index) => {
            if (val.group === item.group) {
                spliceIndexs.push(index)
            }
        })
        spliceIndexs.forEach((index) => {
            this.layersItem.splice(index, 1)
        })
        // step2-2: 修改同 group 的其他 layertype 的 checked为未选中状态
        if (item.checked) {
            const spliceIds: number[] = []
            const convertLayersIndex: number[] = []
            this.converToolsBar.forEach((val, index) => {
                if (val.group === item.group && val.layerType != item.layerType) {
                    spliceIds.push(val.id)
                    convertLayersIndex.push(index)
                }
            })
            convertLayersIndex.forEach((index) => {
                this.converToolsBar[index].checked = false
            })
        }

        // step3: 将当前的 item push 至 this.layersItem
        if (item.checked) {
            this.layersItem.push({
                group: item.group ? item.group : -1,
                layerType: item.layerType,
                val: item.val
            })
        }

        // step4: 若房钱选择的是特殊 layer( 概率增水场，则展开 概率增水场的options)
        if (item.layerType === LayerTypeEnum.RASTER_PRO_SURGE_LAYER) {
            item.showOptions = !item.showOptions
        } else if (item.toolType === ToolTypeEnum.OPTIONS) {
            this.showOptions()
        }
    }
    showOptions(): void {
        this.isShowOpts = !this.isShowOpts
        this.setShowOptsForm(this.isShowOpts)
    }

    @Mutation(SET_SHOW_OPTS_FORM, { namespace: 'common' }) setShowOptsForm

    @Watch('getIsInitLayers')
    onIsInitLayers(isInit: boolean): void {
        if (isInit) {
            this.layersItem = []
            this.setInitLayers(false)
        }
    }

    checkLayerInToolsBar(newLayers: LayerTypeEnum[], oldLayers: LayerTypeEnum[]): void {
        const that = this
        if (newLayers.length > 0) {
            newLayers.forEach((tempLayer) => {
                const convertedTool = that.converToolsBar.filter((tempTool) => {
                    return (
                        tempTool.toolType === ToolTypeEnum.LAYER &&
                        tempTool.layerType &&
                        tempTool.layerType === tempLayer
                    )
                })
                const toolObj = that.converToolsBar.find((tempTool) => {
                    return (
                        tempTool.toolType === ToolTypeEnum.LAYER && tempTool.layerType === tempLayer
                    )
                })
                if (convertedTool.length === 1) {
                    convertedTool[0].checked = true
                }
                if (toolObj) {
                    toolObj.checked = true
                }
            })
        }
        // 若 OldLayer 存在
        if (oldLayers.length > 0) {
            // 从旧的数组中找到在新数组中不存在的值
            const newLayersSet = new Set([...newLayers])
            const oldLayersSet = new Set([...oldLayers])
            const delOldLayersSet = new Set([...oldLayers].filter((x) => !newLayersSet.has(x)))
            const delOldLayers = Array.from(delOldLayersSet)
            console.log(`layers中剔除掉的:${delOldLayers}`)
            delOldLayers.forEach((tempDelLayer) => {
                const toolObj = that.converToolsBar.find((tempTool) => {
                    return (
                        tempTool.toolType === ToolTypeEnum.LAYER &&
                        tempTool.layerType === tempDelLayer
                    )
                })
                if (toolObj) {
                    toolObj.checked = false
                }
            })
        }
    }

    // 暂时不用
    checkLayerItemInToolsBar(
        newLayers: { group: number; layerType: LayerTypeEnum; val: string }[],
        oldLayers: { group: number; layerType: LayerTypeEnum; val: string }[]
    ): void {
        const that = this
        if (newLayers.length > 0) {
            newLayers.forEach((tempLayer) => {
                const convertedTool = that.converToolsBar.filter((tempTool) => {
                    return (
                        tempTool.toolType === ToolTypeEnum.LAYER &&
                        tempTool.layerType &&
                        tempTool.layerType === tempLayer.layerType
                    )
                })
                const toolObj = that.converToolsBar.find((tempTool) => {
                    return (
                        tempTool.toolType === ToolTypeEnum.LAYER &&
                        tempTool.layerType === tempLayer.layerType
                    )
                })
                if (convertedTool.length === 1) {
                    convertedTool[0].checked = true
                }
                if (toolObj) {
                    toolObj.checked = true
                }
            })
        }
        // 若 OldLayer 存在
        if (oldLayers.length > 0) {
            // 从旧的数组中找到在新数组中不存在的值
            const newLayersSet = new Set([...newLayers])
            const oldLayersSet = new Set([...oldLayers])
            const delOldLayersSet = new Set([...oldLayers].filter((x) => !newLayersSet.has(x)))
            const delOldLayers = Array.from(delOldLayersSet)
            console.log(`layers中剔除掉的:${delOldLayers}`)
            delOldLayers.forEach((tempDelLayer) => {
                const toolObj = that.converToolsBar.find((tempTool) => {
                    return (
                        tempTool.toolType === ToolTypeEnum.LAYER &&
                        tempTool.layerType === tempDelLayer.layerType
                    )
                })
                if (toolObj) {
                    toolObj.checked = false
                }
            })
        }
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
@import '../../../../styles/base';
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
    @baseboxshadow();
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
    backdrop-filter: blur(4px);
    @baseboxshadow();
    // 暂时未用
    .main-title {
        background: @main-title-color;
        .checked {
            background: @main-title-color;
        }
    }
    .sub-title {
        // background: @sub-title-color;
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
    .tools-icon.show-icon {
        svg {
            color: #f39c12;
        }
    }
    .tools-icon.hidden-icon:not(.icon-checked) {
        svg {
            color: whitesmoke;
        }
    }
    a > div.tools-font.hidden-font {
        display: none;
    }
    a > div.tools-font.show-font {
        display: flex;
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
        animation: go_in 0.5s;
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
        animation: go_out 0.5s;
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
