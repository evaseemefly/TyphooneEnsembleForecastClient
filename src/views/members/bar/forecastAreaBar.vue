<template>
    <div id="forecast-area-bar">
        <div class="subtitle">
            <span>可加载数据</span>
            <div class="color-bar-mini">
                <div class="my-primary">不可加载</div>
                <div class="my-sub">可加载</div>
            </div>
        </div>
        <div class="card-list-bar">
            <!-- <div
                class="card-info "
                :class="[isActive(layer) ? 'active' : '', getCoverageType(layer)]"
                :key="layer.code"
                v-for="layer in showLayers"
            >
                {{ layer.desc }}
            </div> -->
            <div
                class="card-info "
                :class="[layer.isActive ? 'my-sub' : '', getCoverageType(layer)]"
                :key="layer.code"
                v-for="layer in showLayers"
            >
                {{ layer.desc }}
            </div>
            <!-- <div class="card-info">东中国海</div>
            <div class="card-info">东中国海</div>
            <div class="card-info">东中国海</div> -->
            <!-- <div class="board"></div> -->
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { loadForecastArea, getLayerCheckStatus } from '@/api/comm'
import { LayerTypeEnum } from '@/enum/common'
// 引入常量
import { DictEnum } from '@/enum/dict'
// 引入部分中间变量
import { CoverageMin } from '@/views/content/oilspilling/coverage'
const dictLayersType = [
    {
        code: LayerTypeEnum.TYPHOON_GROUPPATH_LAYER,
        name: '台风路径',
        val: '台风路径',
        desc: '台风路径',
        isActive: false
    },
    {
        code: LayerTypeEnum.GEO_RASTER_LAYER,
        name: '增水场',
        val: '增水场',
        desc: '增水场',
        isActive: false
    },
    {
        code: LayerTypeEnum.STATION_SURGE_ICON_LAYER,
        name: '潮位站',
        val: '潮位站',
        desc: '潮位站',
        isActive: false
    }
]
@Component({})
export default class ForecastAreaBar extends Vue {
    mydata: any = null
    areas: { code: number; name: string; val: string; desc: string }[] = []
    showLayers: { code: number; name: string; val: string; desc: string; isActive: boolean }[] = [
        {
            code: LayerTypeEnum.TYPHOON_GROUPPATH_LAYER,
            name: '台风路径',
            val: '台风路径',
            desc: '台风路径',
            isActive: false
        },
        {
            code: LayerTypeEnum.GEO_RASTER_LAYER,
            name: '增水场',
            val: '增水场',
            desc: '增水场',
            isActive: false
        },
        {
            code: LayerTypeEnum.STATION_SURGE_ICON_LAYER,
            name: '潮位站',
            val: '潮位站',
            desc: '潮位站',
            isActive: false
        }
    ]
    // showLayers: { layerType: number; layerName: string; isShow: boolean }[] = []
    showLayersType: LayerTypeEnum[] = []
    // @Prop(Number)
    // currentArea?: number
    @Prop(String)
    tyCode
    @Prop(String)
    timeStampStr
    @Prop(Date)
    forecastDt

    mounted() {
        this.loadForecastAreaList()
    }
    loadForecastAreaList(): void {
        loadForecastArea().then((res) => {
            // console.log(res)
            if (res.status == 200) {
                if (res.data.length > 0) {
                    res.data.forEach(
                        (temp: {
                            code: number
                            desc: string
                            name: string
                            pid: number
                            type_code: string
                            val: string
                        }) => {
                            this.areas.push({ ...temp })
                        }
                    )
                }
            }
        })
        // 以下暂时修改为加载的图层
        this.areas = []
    }

    // @Watch('currentCaseCoverageList')
    get areaList(): number[] {
        const tempAreaList: number[] = []
        if (this.currentCaseCoverageList && this.currentCaseCoverageList.length > 0) {
            this.currentCaseCoverageList.forEach((temp) => {
                tempAreaList.push(temp.coverageArea)
            })
        }
        return tempAreaList
    }
    // @Watch('currentCaseCoverageList')
    get coverageTypeList(): { coverageArea: number; coverageType: DictEnum }[] {
        const coverageList: { coverageArea: number; coverageType: DictEnum }[] = []
        if (this.currentCaseCoverageList && this.currentCaseCoverageList.length > 0) {
            this.currentCaseCoverageList.forEach((temp) => {
                coverageList.push({ ...temp })
            })
        }
        return coverageList
    }

    get getTyOptions(): { tyCode: string; forecastDt: Date; timeStampStr: string } {
        const { tyCode, timeStampStr, forecastDt } = this
        return { tyCode, timeStampStr, forecastDt }
    }

    @Watch('getTyOptions')
    onGetTyOptions(val: { tyCode: string; forecastDt: Date; timeStampStr: string }): void {
        // TODO:[-] 21-05-28 注意 es6 -> map 并不修改原数组本身
        this.showLayers.forEach((temp) => {
            temp.isActive = false
        })
        this.showLayersType = []
        this.loadLayersCheckStatus()
    }
    loadLayersCheckStatus(): void {
        const that = this
        getLayerCheckStatus(this.tyCode, this.timeStampStr, this.forecastDt).then((res) => {
            if (res.status === 200) {
                // TODO:[-] 21-05-28 此处修改为返回当前存在的 layer 的 枚举 value
                // eg: [1002,1001 ]
                // geo_raster_status: false
                // station_realdata_staus: true
                // ty_group_path_status: true
                console.log(res.data)
                const layersType = res.data
                layersType.forEach((item) => {
                    // if (that.showLayers === item) {
                    //     // that.showLayers.push()
                    // }
                    const matchLayer = that.showLayers.find((tempLayer) => {
                        return tempLayer.code === item
                    })
                    that.showLayersType.push(item)
                    // console.log(matchLayer)
                    // 尝试直接修改
                    matchLayer.isActive = true
                })
            }
        })
    }
    isActive(layer: {
        code: number
        name: string
        val: string
        desc: string
        isActive: boolean
    }): boolean {
        if (this.areaList.indexOf(layer.code) != -1) {
            return true
        } else {
            return false
        }
    }
    getCoverageType(area: { code: number }): string {
        if (this.showLayersType.length > 0) {
            return 'my-primary'
        }
        return ''
    }
}
</script>
<style scoped lang="less">
// 21-08-23 将card 相关的 样式提取至 card.less 中
@import '../../../styles/common/card';
#forecast-area-bar {
    width: 300px;
    // position: absolute;
    // bottom: 40px;
}

// 新加入的关于subtitle的
.subtitle {
    width: 300px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.subtitle > .color-bar-mini {
    display: flex;
}
.subtitle > span {
    font-size: 20px;
    color: white;
    text-shadow: 0 0 4px black;
}

.subtitle > .color-bar-mini > div {
    // +21-05-29 对于可加载数据提示框，加入了左右两边的内边距
    padding-right: 10px;
    padding-left: 10px;
    // ---
    // width: 50px;
    height: 30px;
    border-radius: 0.4em;
    box-shadow: 0 0 4px 0 rgb(151, 144, 144);
    margin-right: 5px;
    margin-left: 5px;
    box-shadow: 0 0 4px 0 black;
    /* 设置垂直与上下居中 */
    line-height: 30px;
    text-align: center;
    /* 字体颜色 */
    color: white;
    text-shadow: 0 0 4px black;
}

.subtitle > .color-bar-mini > .my-primary {
    background: #34495e;
}

.subtitle > .color-bar-mini > .my-sub {
    background: #f39c12;
}
</style>
