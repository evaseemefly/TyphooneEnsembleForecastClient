<template>
    <div id="rescue_map">
        <div id="map_content">
            <!-- <div id="mybasemap"></div> -->
            <l-map
                ref="basemap"
                :zoom="zoom"
                @update:zoom="zoomUpdated"
                :center="center"
                :options="mapOptions"
                :maxZoom="mapOptions.maxZoom"
                :minZoom="mapOptions.minZoom"
                id="ceshimap"
            >
                <!-- @ready="initMap()" -->
                <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
                <!-- <l-tile-layer :tile-layer-class="getMapBoxLayerClass" /> -->
                <!-- <l-tile-layer :url="coverageUrl"></l-tile-layer> -->
                <!-- 加载 发布的岸线服务 -->
                <!-- TODO:[-] 20-09-01 统一将岸线 wms 整合至全球国境线 wms 服务中，此处暂时注释掉 -->
                <!-- 九段线 -->
                <l-wms-tile-layer
                    :baseUrl="ninelineWMS.url"
                    :layers="ninelineWMS.options.layer"
                    :format="ninelineWMS.options.format"
                    :transparent="ninelineWMS.options.transparent"
                ></l-wms-tile-layer>
                <!-- 南海岛礁 -->
                <l-wms-tile-layer
                    :baseUrl="southlandWMS.url"
                    :layers="southlandWMS.options.layer"
                    :format="southlandWMS.options.format"
                    :transparent="southlandWMS.options.transparent"
                ></l-wms-tile-layer>

                <!-- TODO:[-] 20-08-26 新加入的世界国境线 -->
                <l-wms-tile-layer
                    :baseUrl="worldLineWMS.url"
                    :layers="worldLineWMS.options.layer"
                    :format="worldLineWMS.options.format"
                    :transparent="worldLineWMS.options.transparent"
                    :zIndex="worldLineWMS.options.zindex"
                ></l-wms-tile-layer>
                <!-- TODO:[-] 22-03-29 新加入的风暴潮的预报区域-三个区-多边形 -->
                <!-- <l-wms-tile-layer
                    :baseUrl="surgeForecastAreaSouthWMS.url"
                    :layers="surgeForecastAreaSouthWMS.options.layer"
                    :format="surgeForecastAreaSouthWMS.options.format"
                    :transparent="surgeForecastAreaSouthWMS.options.transparent"
                    :zIndex="surgeForecastAreaSouthWMS.options.zindex"
                    :opacity="0.8"
                    @mouseover="forecastAreaHover()"
                ></l-wms-tile-layer> -->
                <l-geo-json
                    :geojson="surgeForecastAreaNorthPolygonGeoJson"
                    :options="surgeForecastAreaPolygonOpts"
                ></l-geo-json>
                <l-geo-json
                    :geojson="surgeForecastAreaEastPolygonGeoJson"
                    :options="surgeForecastAreaPolygonOpts"
                ></l-geo-json>
                <l-geo-json
                    :geojson="surgeForecastAreaSouthPolygonGeoJson"
                    :options="surgeForecastAreaPolygonOpts"
                ></l-geo-json>
                <!-- TODO:[-] 22-03-08 加入的风暴潮预报的三个区域的多边形区域 -->
                <!-- <l-polyline
                    v-for="temp in getPolyLines"
                    :key="temp.id"
                    :lat-lngs="temp.latlngs"
                    :fill="false"
                    :color="temp.style.color"
                    :stroke="temp.style.stroke"
                    :opacity="temp.style.opacity"
                >
                </l-polyline> -->
                <l-circle :lat-lng="makerLatlng"></l-circle>
            </l-map>
            <!-- TODO:[-] 20-07-20 新加入的 main bar 替换之前的 time bar -->
            <!-- <TimeBar :targetDate="startDate" :days="days" :interval="interval"></TimeBar> -->
            <BottomMainBar
                :startDate="startDate"
                :endDate="finishDate"
                :interval="interval"
                :days="days"
                :tyCode="tyCode"
                :timeStampStr="tyTimeStamp"
                :forecastDt="targetDate"
                :isShowTimeBar="isShowTimeBar"
            ></BottomMainBar>
            <!-- - 21-11-16 去掉了底部的进度条 -->
            <!-- 使用bootstrap-vue的组件 -->
            <!-- <div id="process">
                <b-progress
                    :value="processOptions.rate"
                    :max="100"
                    show-progress
                    animated
                ></b-progress>
            </div> -->
        </div>
        <div id="ocean-main-toolsbar">
            <OceanMainToolsBar></OceanMainToolsBar>
        </div>
        <!-- 19-10-28 加入右侧信息栏_v1版本 -->
        <!-- <div id="right-bar">
            <OilRightBar
                :oilRealData="oilAvgRealData"
                :days="days"
                :startDate="startDate"
                :interval="interval"
                :targetDate="targetDate"
                :numsData="processOptions.num"
                :oilModelData="targetOilModelData"
                :tyCode="tyCode"
                :stationCode="stationCode"
                :stationName="stationName"
                :timeStamp="tyTimeStamp"
            ></OilRightBar>
        </div> -->
        <!-- TODO:[-] 20-07-17 使用统一风格后的 右侧信息栏 -->
        <!-- <RightOptToolsBar></RightOptToolsBar> -->
        <!-- <QuarterView
            :tyCode="tyCode"
            :stationCode="stationCode"
            :timestampStr="tyTimeStamp"
            :stationName="stationName"
        >
        </QuarterView> -->
        <!-- TODO:[-] 21-05-24 加入右侧 station bar -->
        <RightStationBar
            :tyCode="tyCode"
            :stationCode="stationCode"
            :timestampStr="tyTimeStamp"
            :stationName="stationName"
        ></RightStationBar>
        <!-- TODO:[-] 20-07-14 去掉了地图点选功能 -->
        <!-- <div id="bottom_btn_make_point">
            <MakePointBtn></MakePointBtn>
        </div> -->
        <div class="left-top-select">
            <!-- <OilFactorSelect></OilFactorSelect> -->
            <CurdBtn :caseList="caseList"></CurdBtn>
        </div>

        <div id="task_rate_card">
            <TaskRateCard></TaskRateCard>
        </div>

        <!-- <div class="dialog-create-case">
            <CreatedCaseForm ref="caseForm"></CreatedCaseForm>
        </div> -->
        <CreateCaseForm></CreateCaseForm>
        <OptionsDrawer></OptionsDrawer>

        <!-- <div class="">
            <GridDetailForm ref="gridForm"></GridDetailForm>
        </div> -->
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, State, namespace } from 'vuex-class'
import { mixins } from 'vue-class-component'
// import { Debounce } from 'vue-debounce-decorator'
import * as L from 'leaflet'
import 'leaflet-velocity'
// import _ from 'lodash'
// import { debounce } from 'lodash'
import { Debounce } from 'lodash-decorators'
// TODO:[*] 22-05-30 尝试加入 canvas-markers
// https://github.com/eJuke/Leaflet.Canvas-Markers
import { CanvasMarkerLayer } from '@/common/canvasMakerLayer'
// TODO:[*] 22-05-31 加入前台渲染 png
import '@/common/pixel/leaflet-tile-pixelLayer'
// import '@ansur/leaflet-pulse-icon/dist/L.Icon.Pulse'
// 手动引入 第三方的 icon 脉冲效果
// import '@ansur/leaflet-pulse-icon/src/L.Icon.Pulse'
// import '@ansur/leaflet-pulse-icon/src/L.Icon.Pulse.css'
// import L.icon.Pluse from '@ansur/leaflet-pulse-icon'
// import * as LV from 'leaflet-velocity'
// import * as lvts from 'leaflet-velocity-ts'
// TODO:[*] 19-10-16 加入vue2 leaflet heatmap不使用以下的方式
// import { HeatmapOverlay } from "heatmap.js";
// 引入 d3.js
import * as d3 from 'd3'

// 使用leaflet-canvaslayer-field还需要依赖的库
import chroma from 'chroma-js'
import * as geotiff from 'geotiff'
// import * as leafletGeotiff from 'leaflet-canvaslayer-field/dist/leaflet.canvaslayer.field'

// 20-09-02 还是去掉此插件
// import 'leaflet-canvaslayer-field/dist/leaflet.canvaslayer.field.js'
// 使用其他的 geotiff 读取插件
// leaflet-geotiff
// 20-09-02 注意使用 leaflet-geotiff 需要引入 plotty
import 'plotty/dist/plotty'
//---
// 20-09-07 引入了raster-marching-squares
import * as rasterMarching from 'raster-marching-squares'
// TODO:[-] 21-06-10 加入了自定义的地图 mapbox
// import 'mapbox'
// import { mapboxgl } from 'mapbox-gl/dist/mapbox-gl'
// const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')
// import mapboxgl from 'mapbox-gl'
// import 'mapbox-gl-leaflet'
// MapBox GL 库
import 'mapbox-gl/dist/mapbox-gl.css'
import 'mapbox-gl/dist/mapbox-gl'
// npm i mapbox-gl-leaflet 的库
// github:https://github.com/mapbox/mapbox-gl-leaflet
// TODO:[-] WATCH!注意此处安装了 mapbox-gl-leaflet 不要参考 github 官网上的引入方式，该库名称为 mapbox-gl-leaflet
import 'mapbox-gl-leaflet'

import 'heatmap.js'
import HeatmapOverlay from 'heatmap.js/plugins/leaflet-heatmap'

// + mapbox的leaflet插件
// import 'mapbox.js'
// window.mapboxgl = mapboxgl
//---
import {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LPolyline,
    LCircle,
    LIcon,
    LWMSTileLayer,
    LGeoJson
    // LeafletHeatmap
} from 'vue2-leaflet'

// TODO:[-] 21-04-20 加入的 scaleColor
import { ScaleColor, TyGroupPathScaleColor } from '@/common/scaleColor'
import moment from 'moment'
// 各类组件
import TimeBar from '@/views/members/bar/TimeBar.vue'
import RightDetailBar from '@/views/members/bar/rightBarDetail.vue'
import RightOilBar from '@/views/members/bar/rightOilBar.vue'
// 屏幕右侧的各类信息栏
import OilRightBar from '@/views/bar/oilRightBar.vue'
// import OilFactorSelect from '@/views/members/select/OilFactorSelect.vue'
// - 21-11-03 不再需要 该 form 组件
// import CreatedCaseForm from '@/views/members/form/create_case/CreateCaseForm.vue'
// 各类 btn
import CurdBtn from '@/views/members/tools/CurdBtn.vue'
import MakePointBtn from '@/views/members/tools/MakePointBtn.vue'
// 20-07-14 新引入的 屏幕左侧的工具栏
import OceanMainToolsBar from '@/views/members/bar/toolsBar/oceanMainToolsBar.vue'
// TODO:[-] 20-07-17 新加入的 右侧操作工具栏
import RightOptToolsBar from '@/views/members/bar/rightOptToolsBar.vue'
// TODO:[-] 20-07-20 新加入的底部的 main bar (包含 time bar)
import BottomMainBar from '@/views/members/bar/bottomMainBar.vue'
// + 21-03-07 新加入的 grid_charts 模块
import GridDetailForm from '@/views/members/form/grid_form/GridDetailForm.vue'
import RightStationBar from '@/views/members/bar/rightStationBar.vue'
// + 21-09-14 新加入的 作业统计card
import TaskRateCard from '@/components/card/TaskRateCard.vue'

// + 21-07-01 加入了 createCaseForm
import CreateCaseForm from '@/components/form/CreateCaseForm.vue'
import QuarterView from '@/components/charts/QuarterChartView.vue'
// + 22-03-09 加入了左侧的 配置抽屉组件
import OptionsDrawer from '@/components/drawer/OptionDrawer.vue'
// -----
// 各api
import { loadOilSpillingAvgRealData, getTargetCodeDateRange } from '@/api/api'
import { loadFieldSurgeTif, loadMaxSurgeRange } from '@/api/geo'

// TODO:[-] 20-01-23 尝试将oil的部分操作放在oil 类中()
// TODO:[-] 21-01-12
import { Oil, IOptions, OilScatter } from './oil'
import { Coverage, IOptions as ICoverageOptions } from './coverage'
import { OilPointRealDataMidModel } from '@/middle_model/rescue'
import { OilMidModel } from '@/middle_model/oil'
import { ICaseMin, CaseMinInfo, CaseOilModel } from '@/middle_model/case'
// 20-10-30 引入 CanvasLayerMidModel
import { CanvasLayerMidModel } from '@/middle_model/geo'
// + 21-06-8 加入 station 的 Mid model
import { IconFormMinStationSurgeMidModel, StationSurgeMiModel } from '@/middle_model/station'
import { getDaysNum } from '@/common/date'
import { SplitLine, SplitGroupPathLine } from '@/common/line2points'

// 各类工具类
import { clearRasterFromMap } from '@/util/map'
import { formatDate } from '@/common/date'
import {
    TyGroupPathLine,
    TyGroupCenterPathLine,
    TyphoonPolygon,
    TyphoonCircle,
    TyCMAPathLine
} from './typhoonGroup'
import { loading } from '@/common/common'
// 各类 DTO
import { CustomerMarker, CustomerGisFormMarker } from './marker'

// 20-08-11 wms 相关的中间 model
import { WMSOptionsMidModel, WMSMidModel, WindBarOptMidModel } from '@/middle_model/geo'
import {
    TyphoonComplexGroupRealDataMidModel,
    TyphoonForecastRealDataMidModel
} from '@/middle_model/typhoon'
// TODO:[-] 20-07-06 将 与 flow 相关的放入在.flow.ts 中
import { IVelocityDisplayOpt, IVelocityLayerOpt, ICoverageFlow, CoverageCurrentFlow } from './flow'

import { TyphoonCircleStatus } from '@/common/circleStatus'
// 引入常量
import { optionsFactors, optionsShowTypes } from '@/const/Oil'
import {
    DEFAULT_COVERAGE_ID,
    DEFAULT_NUMBER,
    USELESS_COVERAGE_ID,
    DEFAULT_ZOOM_LEVEL
} from '@/const/common'
import { DEFAULT_STATION_CODE, DEFAULT_STATION_NAME } from '@/const/station'
import { OilFactor, ShowType } from '@/enum/OilSelect'
import { IconTypeEnum } from '@/enum/common'
// 20-10-23 产品种类
import { ProductEnum } from '@/enum/dict'
import { AreaEnum } from '@/enum/area'
import { CoverageMin } from '@/views/content/oilspilling/coverage'
// + 21-01-27 引入 提取到外侧的 mixin const wms
// import { WMSMixin } from '@/views/content/oilspilling/mixin/constWMS'
import { WMSMixin } from '@/views/content/typhoon/mixin/constWMS'
import { CommonOptMixin } from '@/views/content/oilspilling/mixin/constOpt'
import { ConstantMixin } from '@/views/content/oilspilling/mixin/constant'
import { TestMixin } from '@/views/content/oilspilling/mixin/testMixin'
import { ConstArrowMixin } from '@/views/content/oilspilling/mixin/constArrow'
import { WFSMixin } from '@/views/content/oilspilling/mixin/wfsMixin'
import { MapMixin } from '@/views/content/typhoon/mixin/constMap'
// TODO:[*] 21-03-10 加入的海浪等值线测试 mixin
// import { WaveMixin } from '@/views/content/oilspilling/mixin/testWaveMixin'
// + 21-03-24 修改后的 海浪 等值线
// import { WaveMixin } from '@/views/content/oilspilling/mixin/waveMixin'
import { BaseOptionsMixin } from '@/views/content/typhoon/mixin/optionsMixin'
// TODO:[-] 20-09-07 对 raster 的业务逻辑进行了拆分
import {
    RasterIsoline,
    RasterPixel,
    RasterScalar,
    RasterScalarField,
    RasterGeoLayer,
    WindRasterGeoLayer,
    WaveRasterGeoLayer,
    IRaster,
    FieldSurgeGeoLayer,
    SurgeRasterGeoLayer,
    ProSurgeGeoLayer,
    ProSurgeGeoLayerByGeotiffjsWay1,
    ProSurgeGeoLayerByGeotiffjsWay2,
    SurgeRasterTifLayer,
    ISurgeRasterLayer
} from '@/views/content/typhoon/raster'
// TODO:[*] 21-04-28 + 脉冲 icon 用来示意海洋站所在位置
import {
    IconCirlePulsing,
    IconMinStationSurge,
    IconTyphoonCirlePulsing
} from '@/views/members/icon/pulsingIcon'
// TODO:[-] 22-06-02 加入前端绘制等值线类
import { SurgeSosurface } from '@/views/content/typhoon/isosurface'
import { WindArrow } from '@/views/content/oilspilling/arrow'
// + 21-03-24 海浪等值线绘制类
import { WaveContourLine, WaveArrow } from '@/views/content/oilspilling/wave'
import { StationSurge, IToHtml } from './station'
// + 21-05-18 新加入的关于 tyGroupPath 相关的 逻辑封装类
import { TyGroupPath, getTyCenterGroupDiffLayer } from './typhoonGroup'
// 引入枚举
import { DictEnum } from '@/enum/dict'
import {
    LayerTypeEnum,
    SurgeProLayerEnum,
    MapLayerEnum,
    StationIconLayerEnum,
    RasterLayerEnum
} from '@/enum/map'
import { GroupPathLayerOptEnum } from '@/enum/layersOpt/LayersOpt'

// api
// + 21 typhoon api
import { getTargetTyGroupComplexModel } from '@/api/tyhoon'
// 21-04-28 + station api
import {
    getStationListByGroupPath,
    getStationSurgeRangeListByGroupPath,
    getStaticStationList,
    getCenterPathStationMaxSurgeList,
    getAllPathStationMaxSurgeList
} from '@/api/station'
// STORE 常量
import {
    GET_MAP_NOW,
    GET_CREATE_OIL_CASE_MODAL,
    GET_CREATE_FORM,
    GET_CURRENT_LATLNG,
    GET_GEO_COVERAGETYPE,
    GET_MAP_LAYERS,
    SET_IS_INIT_LAYERS,
    GET_CURRENT_LATLNG_LOCK,
    SET_INITIAL_LATLNG,
    GET_INITIAL_LATLNG,
    // + 21-01-27 新加入的用来控制组件间触发异步时间造成的错位情况的 时间锁
    SET_TIMER_LOCK,
    GET_TIMER_LOCK,
    GET_TYPHOON_CODE,
    GET_TYPHOON_ID,
    // + 21-07-28
    GET_TYPHOON_TIMESTAMP,
    // + 22-04-07 获取当前爬取到的台风路径
    GET_TYPHOON_PATH_LIST,
    // + 21-08-19 color scale相关
    GET_SCALE_KEY,
    SET_SCALE_KEY,
    SET_SCALE_RANGE,
    GET_BASE_MAP_KEY, // + 21-08-23 监听切换地图的 baseMapKey
    SET_MAP_NOW,
    GET_TY_GROUP_PATH_LATERS_OPTS, // +22-03-13 台风集合预报路径配置项
    SET_SHOW_STATION_ICON,
    SET_SHOW_TYPHOON_LEGEND_ICON,
    SET_ISOSURGE_COLOR_SCALE_VAL_RANGE, // + 22-06-06
    SET_ISOSURGE_COLOR_SCALE_STR_LIST,
    GET_RASTER_LAYER_KEY,
    SET_IS_SHOW_RASTER_LEGEND // + 22-06-10
} from '@/store/types'
import {
    DEFAULT_LAYER_ID,
    DEFAULT_TYPHOON_ID,
    DEFAULT_TYPHOON_GROUP_PATH_ID,
    DEFAULT_TIMESTAMP
} from '@/const/common'
import { RADIUSUNIT, DEFAULTTIMESTAMP, DEFAULTTYCODE } from '@/const/typhoon'
import { ArrayPropsDefinition } from 'vue/types/options'
import { SET_CURRENT_LATLNG } from '@/store/types'
import {
    IVelocityOptions,
    IPolyLine,
    IRasterOptions,
    ITyGroupPathOptions,
    DefaultTyGroupPathOptions,
    ILayerDisplayOptions,
    ITySurgeLayerOptions,
    ITyStationLayerOptions,
    ITyLayer,
    ITyProLayerOptions,
    IRasterLayer
} from './types'
import { ColorScales, getColorScale, DEFAULT_COLOR_SCALE } from '@/const/colorBar'

// TODO:[-] 21-08-23 保存个人token及key，不推送
import { TDT_TOKEN_KEY, MAPTITLELAYER_TOKEN_KEY } from '@/privacy/key'
import { AxiosResponse } from 'axios'

const DEFAULT = 'DEFAULT'
// 21-01-04 分页读取散点的页面散点数
const DEFAULT_SCATTER_PAGE_COUNT = 1000

@Component({
    components: {
        'l-marker': LMarker,
        'l-map': LMap,
        'l-tile-layer': LTileLayer,
        'l-polyline': LPolyline,
        'l-circle': LCircle,
        'l-icon': LIcon,
        'l-wms-tile-layer': LWMSTileLayer,
        'l-geo-json': LGeoJson,
        TimeBar,
        RightDetailBar,
        RightOilBar,
        OilRightBar,
        CurdBtn,
        // CreatedCaseForm,
        // MakePointBtn,
        OceanMainToolsBar,
        RightOptToolsBar,
        BottomMainBar,
        // + 21-05-24 新加入的 右侧显示 测站历史数据曲线的 charts
        RightStationBar,
        CreateCaseForm,
        TaskRateCard,
        QuarterView,
        OptionsDrawer // 抽屉组件
        // GridDetailForm
        // LeafletHeatmap
    }
    // + 21-01-27 新引入的 mixin
    // mixins: [WMSMixin, CommonOptMixin]
})
export default class TyGroupMap extends mixins(
    WMSMixin,
    CommonOptMixin,
    TestMixin,
    ConstantMixin,
    ConstArrowMixin,
    // WaveMixin,
    WFSMixin,
    MapMixin,
    BaseOptionsMixin
) {
    mydata: any = null
    code = DEFAULT
    zoom = DEFAULT_ZOOM_LEVEL
    center: number[] = [22.45, 113.8833]
    // TODO:[-] 20-11-09 新加入的 map 相关的一些基础静态配置
    mapOptions: {} = {
        preferCanvas: true,
        minZoom: 5,
        // 可缩放的最大 level
        maxZoom: 11,
        // 目前已经使用了 canvas 渲染
        render: L.canvas()
    }
    isZoomLock = false
    isShowTimeBar = false // TODO:[-] 21-12-18 是否显示时间轴（加载）
    coverageUrl = ''
    makerLatlng = [0, 0]
    // TODO:[-] 21-01-06 初始位置，加载 case 后将case的初始位置赋值于此
    initialLatLng = [0, 0]

    // TODO:[-] 22-04-07 爬取到的台风路径
    spiderTyphoonPathList: {
        forecastDt: Date
        lat: number
        lon: number
        bp: number
        isForecast: boolean
        // radius: number
    }[] = []

    spiderTyPathLineLayerId: number = DEFAULT_LAYER_ID

    // 20-08-09 + 当前选中的coverageInfos
    // coverageInfoList: { coverageArea: number; coverageType: number }[] = []
    // TODO:[-] 20-05-26 maker icon 样式
    icon_marker = L.icon({
        iconUrl: '/leaflet/images/marker-icon.png',
        iconSize: [32, 37],
        iconAnchor: [16, 37] // 防止地图缩放时产品偏移，需固定绝对位置
    })

    // 当前选定的 case model 信息
    tempCaseModel: CaseOilModel
    // timebar的起始时间
    // TODO:[*] 19-11-07 去掉默认的起始时间
    now: Date = new Date()
    startDate: Date = new Date()
    targetDate: Date = new Date()
    finishDate: Date = new Date()
    // 每天的间隔
    interval = 24
    // timebar共有多少天
    days = 3
    // TODO:[*] 19-11-12 加入show type与show factor
    showType: number
    showFactor: number
    // TODO:[*] 20-01-27 与进度相关的options
    processOptions: { rate: number; num: { current: number; sum: number } } = {
        rate: 0,
        num: { current: 0, sum: 0 }
    }
    caseList: CaseMinInfo[] = []
    // 当前选择的case code对应的 oil 的模型 data
    targetOilModelData: CaseOilModel = new CaseOilModel()
    // 新添加的，供 由 coverageId 与 current 发生改变而触发的方法监听使用
    // TODO:[*] 20-10-25 注意此对象主要是为风场提供使用的
    wmsOptions: IVelocityOptions = {
        coverageId: DEFAULT_COVERAGE_ID,
        current: new Date(),
        isShow: true,
        productType: ProductEnum.COVERAGE_TYPE_WIND
    }
    // TODO:[*] 20-10-22 + 缩放等级
    zoomLevel = 7
    // 用于动态加载的 wms 的 ws 的str
    wmsWorkSpace = ''
    layerControl: any = null
    // TODO:[-] + 21-08-05 新加入的全局唯一的 栅格layer
    uniqueRasterLayer: L.Layer | null = null
    uniqueRasterLayerId = DEFAULT_LAYER_ID
    // TODO:[-] 22-06-02 增水等值面layer id
    sosurfaceLayerId = DEFAULT_LAYER_ID
    surgeGridTitleLayerId = DEFAULT_LAYER_ID // 增水 格点数据 title 图层
    // TODO:[*] 20-07-27 记录当前 add layers to map 时的 layers种类数组
    existLayers: LayerTypeEnum[] = []
    // TODO:[-] 20-06-20 加入的是否分页的标识符
    isPagination = true
    // 创建大量散点使用 add layerGroup 的方式添加，记录 group 的 id
    layerGroupId: number = DEFAULT_NUMBER
    layerGroupIds: number[] = []

    // TODO:[-] 21-04-21 与台风业务相关的 data
    tyGroupLineList: TyphoonComplexGroupRealDataMidModel[] = []

    // TODO:[-] + 21-05-31 中间路径的 cirleLayers 集合
    tyGroupCenterCirleLayers: L.Layer[] = []
    tyOutlineGroupLayers: L.LayerGroup | null = null
    //
    tyOutlineGroupLayersId: number = DEFAULT_LAYER_ID
    // + 21-05-12 台风集合预报路径的概率半径集合 24: 60, 48:100,72:120,96:150,120:180
    tyGroupProPathCircles: { lat: number; lon: number; radius: number }[] = []
    currentStationSurgeList: StationSurgeMiModel[] = []
    // 当前的大风半径范围
    currentGaleRadius: L.Circle | null = null
    // group_ty_range
    // 台风大风半径的范围
    // 当前显示的 台风realdata div icon
    tyRealDataDivIcon: L.Marker | null = null
    isShowTyRealDataDivIcon = true

    // TODO:[-] 21-10-08 当前的台风集合折线
    currentGroupPathPolyLine: L.Polyline | null = null
    // 21-10-08 当前的台风集合预报路径 折线集合 group layer
    currentGroupPathPolyLineGroupLayersId: number = DEFAULT_LAYER_ID
    /** - 21-10-19 台风中间路径的脉冲 layer */
    currentGroupPathPulsingLayerGroup: L.LayerGroup | null = null
    /**  + 22-05-07 当前台风的中间路径的圆点icon layer id (group layer)*/
    currentCenterPathIconLayerId: number = DEFAULT_LAYER_ID
    /** + 22-05-07 当前台风的中间路layer id */
    currentCenterPathLineLayerId: number = DEFAULT_LAYER_ID

    // 中间路径概率圆 layer id
    currentPathProCirclesLayerId = DEFAULT_LAYER_ID

    // + 21-05-10 当前的 逐时风暴增水场 layer，每次切换时会替换，且从 map 中清除
    // TODO:[*] 22-04-19 将layer统一修改为 layerId
    fieldSurgeRasterLayer: L.Layer | null = null

    // + 21-05-14 当前的预报时间
    forecastDt = new Date('2020-09-15T18:00:00Z')
    // + 21-05-14 当前选定的
    // TODO:[*] 21-07-28 将 gpId 放在 tyGroupOptions 中
    // gpId = DEFAULT_TYPHOON_GROUP_PATH_ID
    tyCode = DEFAULTTYCODE
    tyTimeStamp = DEFAULT_TIMESTAMP
    stationCode = DEFAULT_STATION_CODE
    stationName = DEFAULT_STATION_NAME
    // + 21-05-15 脉冲 groupLayer
    groupLayerSurgePulsing: L.LayerGroup | null = null // - 22-05-19 已不再使用，只有 bak 备份中还有使用，暂时不删除
    groupLayerSurgeStationPulsingId: number = DEFAULT_LAYER_ID // - 22-05-19 海洋站脉冲 icon group layer id

    // + 21-05-15 台站 div groupLayer
    groupLayerSurgeStationDivForm: L.LayerGroup | null = null // - 22-05-19 已不再使用，只有 bak 备份中还有使用，暂时不删除
    groupLayerSurgeStationDivId: number = DEFAULT_LAYER_ID // - 22-05-19 将 groupLayerSurgeStationDivForm 替换为 id 保存当前海洋站 icon 的 group layer id
    tyGroupGaleRadiusRange: { max: number; min: number } = { max: 80, min: 31 }

    // + 21-05-19 BottomMainBar -> ForecastAreaBar 需要传入的 currentCaseCoverageList
    currentCaseCoverageList: CoverageMin[] = []

    // TODO:[-] + 21-08-15 当前时间对应的台风脉冲marker(位置示意)
    currentTyPulsingMarker: L.Layer = new L.Layer()

    // + 21-05-19 TyGroupPathOptions 监听该变量但并未实现对应方法
    tyGroupOptions: ITyGroupPathOptions = {
        tyCode: this.tyCode,
        timeStamp: this.tyTimeStamp,
        forecastDt: DefaultTyGroupPathOptions.forecastDt,
        isShow: false, // 是否显示台风轮廓路径图层(只保留中心路径)
        layerType: DefaultTyGroupPathOptions.layerType,
        gpId: DEFAULT_TYPHOON_GROUP_PATH_ID,
        isShowOutlinePolyLayer: false, // 是否显示台风外侧路径多边形图层
        isShowTyDetailForm: false // 是否显示台风实时信息form(div)
        // isShowOutlinePolyLayer:
        //     this.isShowOutlinePolyLayer !== undefined ? this.isShowOutlinePolyLayer : true,
        // isShowOutlinePolyLayer: this.isShowOutlinePolyLayerTest
    }
    @Watch('isShowOutlinePolyLayer')
    onShowOutlinePolyLayer(val: boolean): void {
        this.tyGroupOptions.isShowOutlinePolyLayer = val
    }

    @Watch('isShowTyRealDataForm')
    onShowTyRealDataForm(val: boolean): void {
        this.tyGroupOptions.isShowTyDetailForm = val
    }
    stationSurgeIconOptions: ITyStationLayerOptions = {
        isShow: false,
        layerType: LayerTypeEnum.STATION_ICON_LAYER,
        tyCode: this.tyCode,
        tyTimeStamp: this.tyTimeStamp,
        forecastDt: DefaultTyGroupPathOptions.forecastDt,
        gpId: DEFAULT_TYPHOON_GROUP_PATH_ID
    }

    // TODO:[-] 21-08-01 新增的用来供监听的 最大增水 配置变量，tyCode 与 tyTS 由 this 中对应字段决定
    tyMaxSurgeOptions: ITySurgeLayerOptions = {
        isShow: false,
        layerType: LayerTypeEnum.RASTER_MAX_SURGE_LAYER,
        rasterLayerType: RasterLayerEnum.ISOSURFACE_LAYER,
        // tyCode: this.tyCode,
        // tyTimeStamp: this.tyTimeStamp
        tyCode: this.tyCode,
        tyTimeStamp: this.tyTimeStamp,
        forecastDt: new Date(),
        scaleList: DEFAULT_COLOR_SCALE.scaleColorList
    }

    // TODO:[-] 21-08-04 新增的用来监听 逐时增水配置
    tyFieldOptions: ITySurgeLayerOptions = {
        isShow: false,
        layerType: LayerTypeEnum.RASTER_HOURLY_SURGE_LAYER,
        rasterLayerType: RasterLayerEnum.ISOSURFACE_LAYER,
        tyCode: this.tyCode,
        tyTimeStamp: this.tyTimeStamp,
        forecastDt: new Date(),
        scaleList: DEFAULT_COLOR_SCALE.scaleColorList
    }
    // TODO:[-] 21-08-12 新增的 概率增水配置
    tyProSurgeOptions: ITyProLayerOptions = {
        isShow: false,
        layerType: LayerTypeEnum.UN_LAYER,
        rasterLayerType: RasterLayerEnum.ISOSURFACE_LAYER,
        tyCode: this.tyCode,
        tyTimeStamp: this.tyTimeStamp,
        pro: 0.5,
        scaleList: DEFAULT_COLOR_SCALE.scaleColorList
    }

    // TODO:[-] 21-06-08 临时的 潮位站 min marker
    stationMinMarker: L.Marker | undefined = undefined
    mapBoxlayerOptions: {
        accessToken: 'pk.eyJ1IjoiZXZhc2VlbWVmbHkxIiwiYSI6ImNrcHE4OHJsejBobnoyb3BhOTkwb3MzbGwifQ.5ThyBJrIccBpeVi9pUdJnw'
        style: '/static/mapbox/style/style_210610/style.json'
    }
    // TODO:[-] 21-06-10 配合 mapbox 使用的 mymap
    mymap: L.Map | undefined = undefined
    // + 21-07-01 新加入的用来控制是否显示 创建caseForm
    isShowCreateCaseForm = false

    // + 21-07-25 当前选中的 typhoon id，给一个默认值
    selectedTyId: number = DEFAULT_TYPHOON_ID
    getMapBoxLayerClass(key: string): L.TileLayer {
        return L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${key}`, {
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution:
                '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
            crossOrigin: true
        })
    }
    created() {
        this.startDate = new Date(
            this.now.getFullYear(),
            this.now.getMonth(),
            this.now.getDate(),
            0,
            0
        )
        this.targetDate = moment(this.startDate)
            .add(2, 'days')
            .add(-1, 'seconds')
            .toDate()
        this.finishDate = this.targetDate

        // TODO:[*] 19-11-05:页面加载时需要获取当前code对应的旗帜时间
        // this.loadDateRange()
    }
    testMapBoxLeaflet(): void {
        const mymap = L.map('mybasemap').setView([51.505, -0.09], 9)
        const token =
            'pk.eyJ1IjoiZXZhc2VlbWVmbHkxIiwiYSI6ImNrcHE4OHJsejBobnoyb3BhOTkwb3MzbGwifQ.5ThyBJrIccBpeVi9pUdJnw'
        const gl = new L.MapboxGL({
            accessToken: token,
            style: 'mapbox://styles/mapbox/dark-v10'
        }).addTo(mymap)
    }
    initMap(): void {
        const that = this
        this.mymap = this.$refs.basemap.mapObject
        // TODO:[-] 21-06-10 尝试引入 mapbox 中的自定义样式
        // ERROR: Error: Container 'basemap' not found.
        // 以上错误是由于 使用 vue-leaflet 这个 leaflet 的组件化工具引起的，若直接定义一个div的话不会出现此问题
        const token =
            'pk.eyJ1IjoiZXZhc2VlbWVmbHkxIiwiYSI6ImNrcHE4OHJsejBobnoyb3BhOTkwb3MzbGwifQ.5ThyBJrIccBpeVi9pUdJnw'
        // mapboxgl.accessToken = token
        // const map = new mapboxgl.Map({
        //     container: 'ceshimap',
        //     style: '/static/mapbox/style/style_210610/style.json'
        // })
        // 尝试使用 mapbox.js 中的 layers --- 失败
        // const testLayer = L.mapbox.tileLayer()
        // const layer = L.mapbox.tileLayer('/static/mapbox/style/style_210610/style.json')
        // layer.addTo(this.mymap)
        // 同样使用 leaflet-mapbox-gl
        // const gl = L.mapboxGL({
        //     accessToken: token,
        //     style: '/static/mapbox/style/style_210610/style.json'
        // }).addTo(that.mymap)
        const gl = new L.MapboxGL({
            accessToken: token,
            // style: '/static/mapbox/style/style_210610/style.json'
            style: 'mapbox://styles/mapbox/dark-v10'
        }).addTo(that.mymap)
        // 测试一下不用 leaflet-vue 直接定义一个div通过leaflet初始化map
        // this.testMapBoxLeaflet()
    }

    mounted(): void {
        // 由于是测试，页面加载完成后先加载当前 code 的平均轨迹
        // TODO:[*] 20-01-23 暂时去掉页面加载后读取平均轨迹的步骤(暂时去掉)
        // TODO：[-] 21-05-10 注意 mac 的tyId=1 | 5750 tyId=3
        // + 21-07-25 暂时去掉 以下部分
        // const testTyphoonId = 8
        // this.testGetAddTyGroupPath2Map(testTyphoonId)
        // // TODO:[*] 21-04-28 暂时加入的加载 海洋站位置的 测试
        // this.loadStationList(this.zoom)
        // // TODO:[*] 21-04-30 测试 加入的测试加载台风最大增水
        // // TODO:[*] 21-05-07 暂时去掉增大增水
        // const mymap = this.$refs.basemap.mapObject
        // const testForecastDt = new Date()
        // const raster = new RasterGeoLayer(1, testForecastDt, AreaEnum.NORTHWEST)
        // raster.add2map(
        //     mymap,
        //     (opt = { message: `当前时间${testForecastDt}没有对应的tif文件`, type: 'warning' }) => {
        //         this.$message({
        //             message: `当前时间${testForecastDt}没有对应的tif文件`,
        //             type: 'warning'
        //         })
        //     }
        // )
        // // + 21-05-18 在页面加载后首先加载当前的 start_dt 与 end_dt
        // const tyGroupPath = new TyGroupPath()
        // tyGroupPath.getTargetTyGroupDateRange(this.tyCode, this.tyTimeStamp).then((res) => {
        //     this.finishDate = new Date(Math.max(...res))
        //     this.startDate = new Date(Math.min(...res))
        // })
        const mymap = this.$refs.basemap.mapObject
        this._initOptionsField()
        // TODO:[-] 22-03-29 尝试加载surge预报区域的geojson
        // this.loadSurgeForecastAreaWFS(mymap)
        this.createSurgeForecastAreaByWFS()
    }

    _initOptionsField(): void {
        // TODO:[-] 22-03-15 注意需要将 tyGroupOptions.isShowOutlinePolyLayer 根据 mixin 中的 isShowOutlinePolyLayer 计算属性赋值放到 mounted 中
        this.tyGroupOptions.isShowOutlinePolyLayer = this.isShowOutlinePolyLayer
        this.tyGroupOptions.isShowTyDetailForm = this.isShowTyRealDataForm
    }

    // 加载海洋站风暴潮增水
    loadStationListBackup(): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        /*
            {
                "ty_code": "2022",
                "gp_id": 51,
                "station_code": "SHW",
                "forecast_index": 0,
                "forecast_dt": "2020-09-15T17:00:00Z",
                "surge": 0.0,
                "name": "汕尾",
                "lat": 22.7564,
                "lon": 115.3572
            },
        */
        getStationListByGroupPath(this.tyGroupOptions.gpId, this.forecastDt).then(
            (res: {
                status: number
                data: {
                    ty_code: string
                    gp_id: number
                    station_code: string
                    forecast_index: number
                    forecast_dt: Date
                    surge: number
                    name: string
                    lat: number
                    lon: number
                }[]
            }) => {
                if (res.status === 200) {
                    if (res.data.length > 0) {
                        const surgeArr: number[] = []
                        const iconArr: IconCirlePulsing[] = []
                        const iconSurgeMinArr: IconMinStationSurge[] = []
                        res.data.forEach((element) => {
                            surgeArr.push(element.surge)
                        })
                        // 获取极值
                        const surgeMax = Math.max(surgeArr)
                        const surgeMin = Math.min(surgeArr)
                        res.data.forEach((temp) => {
                            const icon = new IconCirlePulsing({
                                val: temp.surge,
                                max: surgeMax,
                                min: surgeMin
                            })
                            const iconSurgeMin = new IconMinStationSurge(temp.name, temp.surge)
                            iconArr.push(icon)
                            iconSurgeMinArr.push(iconSurgeMin)
                        })
                        let index = 0
                        // 批量添加至 map 中
                        iconArr.forEach((temp) => {
                            const stationDivIcon = L.divIcon({
                                className: 'surge_pulsing_icon_default',
                                html: temp.toHtml()
                                // 目前需要此部分，因为会造成 位置的位移
                                // 坐标，[相对于原点的水平位置（左加右减），相对原点的垂直位置（上加下减）]
                                // iconAnchor: [-20, 30]
                            })
                            const stationSurgeMinDivICOn = L.divIcon({
                                className: 'station-surge-icon-default',
                                html: iconSurgeMinArr[index].toHtml(),
                                // 坐标，[相对于原点的水平位置（左加右减），相对原点的垂直位置（上加下减）]
                                iconAnchor: [-10, 0]
                            })
                            L.marker([res.data[index].lat, res.data[index].lon], {
                                icon: stationDivIcon
                            }).addTo(mymap)
                            L.marker([res.data[index].lat, res.data[index].lon], {
                                icon: stationSurgeMinDivICOn
                            }).addTo(mymap)
                            index++
                        })
                    }
                }
            }
        )
    }

    // 清除掉所有 station 潮位站 divIcon
    clearSurgeAllGroupLayers(): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        if (this.groupLayerSurgeStationPulsingId !== DEFAULT_LAYER_ID) {
            // mymap.removeLayer(this.groupLayerSurgePulsing)
            this.clearLayerById(this.groupLayerSurgeStationPulsingId)
        }
        // 清除潮位站 icon group layer (by id)
        if (this.groupLayerSurgeStationDivId !== DEFAULT_LAYER_ID) {
            this.clearLayerById(this.groupLayerSurgeStationDivId)
        }

        this.groupLayerSurgeStationPulsingId = DEFAULT_LAYER_ID

        this.groupLayerSurgeStationDivId = DEFAULT_LAYER_ID
    }

    // 21-10-08 清除当前台风折线群组 layer
    clearGroupLayer(tempPolyLine: L.LayerGroup | L.Marker | null): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        if (tempPolyLine) {
            // mymap.remove(tempPolyLine)
            mymap.removeLayer(tempPolyLine)
        }
    }

    // + 22-03-04 清除当前台风的外侧包络layers
    clearTyOutlineGroupLayer(): void {
        if (this.tyOutlineGroupLayersId != DEFAULT_LAYER_ID) {
            this.clearLayerById(this.tyOutlineGroupLayersId)
        }
    }

    // + 21-10-20 清除中间路径的 脉冲icon layers + 路线折线layers
    clearCenterGroupAllLayer(): void {
        if (this.currentGroupPathPulsingLayerGroup) {
            this.clearGroupLayer(this.currentGroupPathPulsingLayerGroup)
        }
        if (this.currentCenterPathLineLayerId !== DEFAULT_LAYER_ID) {
            this.clearLayerById(this.currentCenterPathLineLayerId)
            this.currentCenterPathLineLayerId = DEFAULT_LAYER_ID
        }
    }

    // + 22-03-07 清除当前路径的台风集合路径外沿集合layers
    clearTyGroupOutlineGroupLayer(): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        // TODO:[*] 22-04-18 将 removerLayer => clearLayerById
        if (this.tyOutlineGroupLayersId !== DEFAULT_LAYER_ID) {
            // mymap.removeLayer(this.tyOutlineGroupLayers)
            // this.tyOutlineGroupLayers = null
            this.clearLayerById(this.tyOutlineGroupLayersId)
            this.tyOutlineGroupLayersId = DEFAULT_LAYER_ID
        }
    }

    // + 21-05-20 清除掉 逐时的风暴潮增水栅格图层
    clearSurgeHourlyRasterLayer(): void {
        const that = this
        const mymap: L.Map = this.$refs.basemap['mapObject']
        this.clearUniquerRasterLayer()
    }

    // 加载当前时刻的所有潮位站数据 并存储至 that.currentStationSurgeList
    loadCurrentStationList(stationType: LayerTypeEnum): Promise<void> {
        const that = this
        this.clearSurgeAllGroupLayers()

        // TODO:[-] 21-12-27 此处需要判断一下，减少向后台查询的请求次数，若 stationSurgeIconOptions 无变化不需要再次请求
        // TODO:[-] 22-02-11 此处修改为根据 stationType 获取对应的 axois 方法，静态站点与逐时站点的加载方法签名相同!
        let getStationFunc: (
            gpId: number,
            tyCode: string,
            forecastDt: Date,
            timestampStr: string
        ) => Promise<AxiosResponse<any>> | null = null
        switch (stationType) {
            // 静态潮位站
            case LayerTypeEnum.STATION_ICON_STATIC_LAYER:
                // this.$message(`加载台风:${that.stationSurgeIconOptions.tyCode}的海洋站静态位置`)
                getStationFunc = getStaticStationList
                break
            // 逐时潮位站
            case LayerTypeEnum.STATION_ICON_FIELD_LAYER:
                // this.$message(
                //     `加载台风:${that.stationSurgeIconOptions.tyCode},预报时间:${formatDate(
                //         that.stationSurgeIconOptions.forecastDt
                //     )}对应的海洋站`
                // )
                getStationFunc = getStationSurgeRangeListByGroupPath
                break
            // 极值潮位站
            case LayerTypeEnum.STATION_ICON_MAX_LAYER:
                // this.$message(`加载台风:${that.stationSurgeIconOptions.tyCode}全过程海洋站极值`)
                getStationFunc = getAllPathStationMaxSurgeList
                break
            default:
                getStationFunc = getStaticStationList
                break
        }

        return getStationFunc(
            this.stationSurgeIconOptions.gpId,
            this.stationSurgeIconOptions.tyCode,
            this.stationSurgeIconOptions.forecastDt,
            this.stationSurgeIconOptions.tyTimeStamp
        ).then(
            (res: {
                status: number
                data: {
                    ty_code: string
                    gp_id: number
                    station_code: string
                    forecast_index: number
                    forecast_dt: Date
                    surge: number
                    name: string
                    lat: number
                    lon: number
                    surge_max: number
                    surge_min: number
                }[]
            }) => {
                if (res.status === 200) {
                    if (res.data.length > 0) {
                        // TODO:[-] 21-05-14
                        // [
                        //     {
                        //         "ty_code": "2022",
                        //         "gp_id": 1,
                        //         "station_code": "SHW",
                        //         "forecast_index": 3,
                        //         "forecast_dt": "2020-09-15T20:00:00Z",
                        //         "surge": -16.0,
                        //         "name": "汕尾",
                        //         "lat": 22.7564,
                        //         "lon": 115.3572,
                        //         "surge_max": -14.1,
                        //         "surge_min": -17.5
                        //     },
                        // ]
                        const surgeArr: number[] = []
                        const iconArr: IconCirlePulsing[] = []
                        const iconSurgeMinArr: IToHtml[] = []
                        that.currentStationSurgeList = []
                        res.data.forEach((element) => {
                            surgeArr.push(element.surge)

                            that.currentStationSurgeList.push(
                                new StationSurgeMiModel(
                                    element.name,
                                    element.station_code,
                                    element.surge,
                                    element.surge_max,
                                    element.surge_min,
                                    element.forecast_dt,
                                    element.lat,
                                    element.lon
                                )
                            )
                        })
                    }
                }
            }
        )
    }

    // 根据当前缩放等级在地图中加载对应的 station icon
    loadStationIconsByZoom(zoom: number, stationSurgeList: StationSurgeMiModel[]): void {
        // const zoom = this.zoom
        const that = this
        const mymap: L.Map = this.$refs.basemap['mapObject']
        const surgeArr: number[] = []
        const iconArr: IconCirlePulsing[] = []
        const iconSurgeMinArr: IconMinStationSurge[] = []

        const surgePulsingMarkersList: L.Marker[] = []
        // 保存当前海洋站 icon 的 group layer
        const surgeStationIconMarkersList: L.Marker[] = []
        this.clearSurgeAllGroupLayers()
        // this.$message(
        //     `加载台风:${that.stationSurgeIconOptions.tyCode},预报时间:${formatDate(
        //         that.stationSurgeIconOptions.forecastDt
        //     )}对应的海洋站`
        // )
        // 获取极值
        stationSurgeList.forEach((temp) => {
            surgeArr.push(temp.surge)
        })
        const surgeMax = Math.max(...surgeArr).toFixed(2)
        const surgeMin = Math.min(...surgeArr).toFixed(2)
        stationSurgeList.forEach((temp) => {
            const icon = new IconCirlePulsing({
                val: temp.surge,
                max: surgeMax,
                min: surgeMin,
                iconType: IconTypeEnum.TY_PULSING_ICON
            })
            const iconSurgeMin = new StationSurge(
                temp.stationName,
                temp.stationCode,
                that.tyCode,
                that.tyTimeStamp,
                that.forecastDt
            ).getImplements(zoom, {
                stationName: temp.stationName,
                stationCode: temp.stationCode,
                surgeMax: temp.max.toFixed(2),
                surgeMin: temp.min.toFixed(2),
                surgeVal: temp.surge.toFixed(2)
            })
            iconArr.push(icon)
            iconSurgeMinArr.push(iconSurgeMin)
        })
        let index = 0
        // 批量添加至 map 中
        iconArr.forEach((temp) => {
            // 1- 脉冲点 icon
            const stationDivIcon = L.divIcon({
                className: 'surge_pulsing_icon_default',
                html: temp.toHtml()
                // 目前需要此部分，因为会造成 位置的位移
                // 坐标，[相对于原点的水平位置（左加右减），相对原点的垂直位置（上加下减）]
                // iconAnchor: [-20, 30]
            })

            // 2- 台站 station data form icon
            const stationSurgeMinDivICOn = L.divIcon({
                className: iconSurgeMinArr[index].getClassName(),
                html: iconSurgeMinArr[index].toHtml(),
                // 坐标，[相对于原点的水平位置（左加右减），相对原点的垂直位置（上加下减）]
                iconAnchor: [10, 30]
            })
            const tempStationSurge = that.currentStationSurgeList[index]
            const surgePulsingMarker = L.marker([tempStationSurge.lat, tempStationSurge.lon], {
                icon: stationDivIcon,
                customData: {
                    name: tempStationSurge.stationName,
                    surge: tempStationSurge.surge.toFixed(2),
                    surgeMax: tempStationSurge.max.toFixed(2),
                    surgeMin: tempStationSurge.min.toFixed(2),
                    stationCode: tempStationSurge.stationCode,
                    lat: tempStationSurge.lat,
                    lon: tempStationSurge.lon,
                    stationName: tempStationSurge.stationName
                }
            })
            // TODO:[-] 21-06-04 鼠标移入脉冲点，显示 station 的 mini form
            surgePulsingMarker
                .on(
                    'mouseover',
                    (e: {
                        target: {
                            options: {
                                customData: {
                                    name: string
                                    surge: number
                                    surgeMax: number
                                    surgeMin: number
                                    stationCode: string
                                    lat: number
                                    lon: number
                                }
                            }
                        }
                    }) => {
                        const customData = e.target.options.customData
                        const iconSurgeMin = new IconFormMinStationSurgeMidModel(
                            customData.name,
                            customData.stationCode,
                            customData.surge,
                            '潮位'
                        )
                        // TODO:[-] 21-06-08 将弹出的 mini form 放在该脉冲点的旁边位置
                        const stationSurgeMinDivICOn = L.divIcon({
                            className: iconSurgeMin.getClassName(),
                            html: iconSurgeMin.toHtml(),
                            // 坐标，[相对于原点的水平位置（左加右减），相对原点的垂直位置（上加下减）]
                            iconAnchor: [10, 30]
                        })
                        const tempStationSurgeMarker = L.marker([customData.lat, customData.lon], {
                            icon: stationSurgeMinDivICOn,
                            customData: customData
                        })
                        that.stationMinMarker = tempStationSurgeMarker
                        tempStationSurgeMarker.addTo(mymap)
                    }
                )
                .on('mouseout', (e) => {
                    if (that.stationMinMarker) {
                        mymap.removeLayer(that.stationMinMarker)
                        that.stationMinMarker = undefined
                    }
                })
                .on('click', (e) => {
                    // 通过 -> e -> target -> options -> customData -> stationCode
                    that.stationCode = e.target.options.customData.stationCode
                    that.stationName = e.target.options.customData.stationName
                })
            surgePulsingMarkersList.push(surgePulsingMarker)
            const stationSurgeIconMarker = L.marker([tempStationSurge.lat, tempStationSurge.lon], {
                icon: stationSurgeMinDivICOn,
                customData: {
                    stationCode: tempStationSurge.stationCode,
                    stationName: tempStationSurge.stationName
                }
            })

            stationSurgeIconMarker
                .on('mouseover', (e) => {
                    // todo:[-] 21-05-15 加入鼠标移入时置顶，移出时恢复之前的 zindex
                    stationSurgeIconMarker.setZIndexOffset(19999)
                })
                .on('mouseout', (e) => {
                    stationSurgeIconMarker.setZIndexOffset(1999)
                })
                .on('click', (e) => {
                    // 通过 -> e -> target -> options -> customData -> stationCode
                    // console.log(e)
                    that.stationCode = e.target.options.customData.stationCode
                    that.stationName = e.target.options.customData.stationName
                })
            surgeStationIconMarkersList.push(stationSurgeIconMarker)
            index++
        })
        // 批量生成 marker后统一添加至 map中
        // TODO:[x] 22-05-30 尝试引入 canvasMarkers 注意此处经尝试，无法对非图片的icon进行渲染(之前风场是img icon无问题)
        // const surgeStationIconCanvasMarkers = new CanvasMarkerLayer().addTo(mymap)
        // surgeStationIconCanvasMarkers.addLayers(surgeStationIconMarkersList)
        // surgeStationIconCanvasMarkers.addTo(mymap)
        const surgeStationPulsingMarkers = L.layerGroup(surgePulsingMarkersList).addTo(mymap)
        const surgeStationIconMarkers = L.layerGroup(surgeStationIconMarkersList).addTo(mymap)
        this.groupLayerSurgeStationPulsingId = surgeStationPulsingMarkers._leaflet_id
        this.groupLayerSurgeStationDivId = surgeStationIconMarkers._leaflet_id
    }

    // TODO:[-] 21-10-08 清除所有 当前 台风集合路径的相关 layer
    clearGroupPathAllLayer(): void {
        if (
            this.currentGroupPathPolyLineGroupLayersId !== DEFAULT_LAYER_ID &&
            this.currentGroupPathPulsingLayerGroup &&
            this.currentCenterPathLineLayerId !== DEFAULT_LAYER_ID
        ) {
            // TODO:[*] 22-04-18 将 removerLayer => clearLayerById
            // this.clearGroupLayer(this.currentGroupPathPolyLineLayerGroup)
            this.clearLayerById(this.currentPathProCirclesLayerId)
            // 清除台风全部集合路径的折线
            this.clearLayerById(this.currentGroupPathPolyLineGroupLayersId)
            this.currentGroupPathPolyLineGroupLayersId = DEFAULT_LAYER_ID
            this.clearLayerById(this.currentCenterPathLineLayerId)
            this.currentCenterPathLineLayerId = DEFAULT_LAYER_ID
            this.clearGroupLayer(this.currentGroupPathPulsingLayerGroup)
            this.clearTyOutlineGroupLayer()
            this.clearTyGroupOutlineGroupLayer()
        }
        if (this.tyRealDataDivIcon) {
            this.clearTyRealDataLayer()
        }
    }

    // loadTy
    testGetAddTyGroupPath2Map(tyId: number): void {
        const that = this
        // TODO:[-] 21-10-18 非中间路径的台风集合预报路径集合
        const arrTyComplexGroupRealdata: Array<TyphoonComplexGroupRealDataMidModel> = []
        // 中间路径的台风预报路径集合
        const arrTyCenterGroupRealdata: Array<TyphoonComplexGroupRealDataMidModel> = []
        // 每次处理签需要先清除当前的 台风集合预报路径概率半径集合
        this.tyGroupProPathCircles = []

        // TODO:[-] 21-10-08 注意每次加载之前需要先清除一下之前的 group 折线
        this.clearGroupPathAllLayer()
        getTargetTyGroupComplexModel(tyId).then((res) => {
            if (res.status === 200) {
                // TODO:[-] 21-10-10 重新修改了后台返回的 json
                // eg
                /*
                {
                    "gp_id": 2612,
                    "group_bp": 0.0,
                    "ty_path_type": "c",
                    "ty_path_marking": 0,
                    "is_bp_increase": true,
                    "list_realdata": [
                            {
                                "timestamp": "1633659195",
                                "forecast_dt": "2020-09-17T21:00:00Z",
                                "lat": 20.5,
                                "lon": 116.0,
                                "realdata_bp": 995.0,
                                "gale_radius": 80.0,
                                "ty_path_type": "c",
                                "ty_path_marking": 0,
                                "is_bp_increase": true
                            },
                    ]
                }
                */
                // TODO:[-] 21-10-18 中间路径放在 arrTyCenterGroupRealdata 数组中|其余144条存储在 arrTyComplexGroupRealdata。中间路径一旦添加，除非更换 tyId，否则不可消除;其余的144条概率路径可去掉
                if (res.data.length > 0) {
                    res.data.map(
                        (temp: {
                            area: number
                            group_bp: number
                            is_bp_increase: boolean
                            list_realdata: Array<{
                                realdata_bp: number
                                forecast_dt: string
                                gale_radius: number
                                gp_id: number
                                lat: number
                                lon: number
                                ty_id: number
                            }>
                            ty_code: string
                            ty_id: number
                            ty_path_marking: number
                            ty_path_type: string
                            gp_id: number
                        }) => {
                            const arrTyphoonRealdata: Array<TyphoonForecastRealDataMidModel> = []
                            temp.list_realdata.forEach(
                                (tempRealdata: {
                                    realdata_bp: number
                                    forecast_dt: string
                                    gale_radius: number
                                    gp_id: number
                                    lat: number
                                    lon: number
                                    ty_id: number
                                }) => {
                                    arrTyphoonRealdata.push(
                                        new TyphoonForecastRealDataMidModel(
                                            tempRealdata.ty_id,
                                            tempRealdata.gp_id,
                                            new Date(tempRealdata.forecast_dt),
                                            0,
                                            tempRealdata.lat,
                                            tempRealdata.lon,
                                            tempRealdata.realdata_bp,
                                            tempRealdata.gale_radius
                                        )
                                    )
                                }
                            )
                            const tempComplexGroup = new TyphoonComplexGroupRealDataMidModel(
                                temp.ty_id,
                                temp.gp_id,
                                temp.ty_code,
                                '',
                                temp.ty_path_marking,
                                temp.ty_path_type,
                                temp.group_bp,
                                temp.is_bp_increase,
                                arrTyphoonRealdata
                            )
                            arrTyComplexGroupRealdata.push(tempComplexGroup)
                            // if (
                            //     temp.ty_path_marking === 0 &&
                            //     temp.ty_path_type === 'c' &&
                            //     temp.group_bp === 0
                            // ) {
                            //     arrTyCenterGroupRealdata.push(tempComplexGroup)
                            // } else {
                            //     arrTyComplexGroupRealdata.push(tempComplexGroup)
                            // }
                        }
                    )
                }
                // 21-07-28 此处需要通过将生成的 145 条集合预报路径，找到中心路径，并找到对应的 gp_id

                const centerGroupPath = arrTyComplexGroupRealdata.find((temp) => {
                    return temp.tyPathMarking === 0 && temp.tyPathType === 'c' && temp.groupBp === 0
                })
                let centerGpId = DEFAULT_TYPHOON_GROUP_PATH_ID
                if (centerGroupPath) {
                    // TODO:[-] 21-10-10 修改了此处获取 gpId
                    centerGpId = centerGroupPath.gpId
                }
                this.tyGroupOptions.gpId = centerGpId
                this.stationSurgeIconOptions.gpId = centerGpId
                that.tyGroupLineList = arrTyComplexGroupRealdata
                // TODO:[*] ! WARNING 21-05-07 此处注意需要动态的获取 tyTimestamp 与 tyCode
                // 21-10-19 注意此处不再加载中间路径
                // that.loadGroupTyphoonLine(
                //     this.tyGroupOptions.isShowOutlinePolyLayer,
                //     this.tyGroupOptions.isShow
                // )
                that.loadCenterTyphoonPoints()
                that.addTyGroupProPathCircles()

                // console.log(arrTyComplexGroupRealdata)
            }
        })
    }

    // + 21-04-20 将 台风 list add to map
    // + 21-10-19 将获取色标提取到外面来
    loadGroupTyphoonLine(isShowOutlinePolyLayer = false, isShowGroupPathLayer = false): void {
        const that = this
        const mymap: L.Map = this.$refs.basemap['mapObject']
        // TODO:[-] 22-05-07 先清除一下当前的中心路径折线layer
        this.clearLayerById(this.currentGroupPathPolyLineGroupLayersId)
        const tyGroupPathLine = new TyGroupPathLine(mymap, that.tyGroupLineList)
        // 集合路径的折线 line，不包含集合路径包络多边形
        const currentTyGroupPathPoly = tyGroupPathLine.addPolyLines2MapByGroup()
        // TODO:[-] 22-02-25 尝试将概率圆+路径包络拼接成一个图形
        // tyGroupPathLine.addPathOutline2Map()
        const tempCenterPathLine = new TyGroupCenterPathLine(mymap, that.tyGroupLineList)
        // 注意此处还需要对最后的圆根据切线进行横断切分
        const lastCircle2Poly = tempCenterPathLine.getLastRadiusCirle2Poly()

        // TODO:[-] 22-03-04 获取所有的路径折线
        const allPathPolyline: L.Polyline[] = tyGroupPathLine.getTyGroupPolyLineLayers()
        // --------
        // 获取全部路径的散点
        const allPathSplitPoints: L.LatLng[] = []
        const allPathSplitHeadDatas: { lat: number; lng: number; count: number }[] = []
        // 方式1: 测试在每条 grouppath 中插值出散点，将 polyline -> points
        // for (let index = 0; index < allPathPolyline.length; index++) {
        //     const splictLine = new SplitLine(allPathPolyline[index])

        //     const splictLine2PointsList: L.LatLng[] = splictLine.getSplitLatlngs(0.1)

        //     splictLine2PointsList.forEach((temp) => {
        //         // 在地图上打点，测试使用
        //         // const tempCircle = new L.Circle(temp)
        //         // tempCircle.addTo(mymap)
        //         allPathSplitHeadDatas.push({
        //             lat: temp.lat,
        //             lng: temp.lng,
        //             count: 2
        //         })
        //     })
        //     allPathSplitPoints = [...allPathSplitPoints, ...splictLine2PointsList]
        // }

        // ----

        const splictLine = new SplitGroupPathLine(that.tyGroupLineList)

        const splictLine2PointsList = splictLine.getSplitedGroupModelList(0.2)

        splictLine2PointsList.forEach((temp) => {
            // 在地图上打点，测试使用
            // const tempCircle = new L.Circle(temp)
            // tempCircle.addTo(mymap)
            const count = 7
            allPathSplitHeadDatas.push({
                lat: temp.latlng.lat,
                lng: temp.latlng.lng,
                count: temp.tyMarking === 0 ? 0 : Math.pow(count - temp.tyMarking, 2) * 10
            })
        })

        // 22-03-06 对于台风路径加入了热图，效果一般暂时不使用
        // 22-03-06 暂时不使用热图的方式进行加载
        // const heatConfig = {
        //     // 此半径可以有效的滤掉由于 status = 2 造成的应该滤掉区域
        //     radius: 0.25,
        //     // radius: 0.01,
        //     maxOpacity: 0.8,
        //     minOpacity: 0,
        //     blur: 0.35,
        //     scaleRadius: true,
        //     useLocalExtrema: true,
        //     latField: 'lat',
        //     lngField: 'lng',
        //     valueField: 'count'
        // }
        // const heatData = {
        //     max: 500,
        //     data: allPathSplitHeadDatas
        // }
        // const heatLayer = new HeatmapOverlay(heatConfig)
        // heatLayer.setData(heatData)

        // const testHeat = heatLayer.addTo(mymap)
        // heatMap --------
        // 获取台风外侧的包络
        // TODO:[*] 22-03-02 此处会造成绘制多边形错误
        // + 22-03-13 加入了根据配置是否加载 台风集合路径外包络多边形图层
        if (isShowOutlinePolyLayer) {
            // TODO:[*] 22-04-18 将之前的 removeLayer 改为 removeLayerById;
            const tyPolygon = new TyphoonPolygon(that.tyGroupLineList, mymap)
            // this.tyOutlineGroupLayers = tyPolygon.generateCircle()
            // TODO:[*] 22-04-21 注意此处每次调用generateCircle均会执行一次排序操作
            this.tyOutlineGroupLayersId = tyPolygon.generateCircle()._leaflet_id
            // const tyOutLineGroupLayer = tyPolygon.generateCircle(outlines)
            this.currentGroupPathPolyLineGroupLayersId = currentTyGroupPathPoly._leaflet_id
        } else {
            // - 22-05-06 此处加入了 清除台风集合路径外侧轮廓
            this.clearTyGroupOutlineGroupLayer()
        }
        if (!isShowGroupPathLayer) {
            this.clearLayerById(this.currentGroupPathPolyLineGroupLayersId)
        }
        if (!isShowOutlinePolyLayer) {
            this.clearTyOutlineGroupLayer()
        }
    }

    // 加载中间路径的 polyline 与 center
    loadCenterTyphoonPoints(): void {
        const mymap: any = this.$refs.basemap['mapObject']
        this.clearLayerById(this.currentCenterPathLineLayerId)
        this.clearLayerById(this.currentCenterPathIconLayerId)
        const centerGroupLineList = this.tyGroupLineList.filter((temp) => {
            return temp.groupBp === 0 && temp.tyPathType === 'c' && temp.tyPathMarking === 0
        })
        // TODO:[*] 注意此处若使用 this.mymap 会出错
        const tyGroupCenterPathLine = new TyGroupCenterPathLine(mymap, [...centerGroupLineList], {
            lineWeight: 5,
            opacity: 0.8
        })

        /** 当前中心路径的圆点脉冲 group layer @type {*} */
        const currentTyCenterPathIconLayerGroup = tyGroupCenterPathLine.addCenterCirlePulsing2MapByGroup()
        this.currentCenterPathIconLayerId = currentTyCenterPathIconLayerGroup._leaflet_id
        const currentCenterGroupPathPolyLineLayerGroup = tyGroupCenterPathLine.addPolyLines2MapByGroup() // 添加中间路径的折线到map
        this.currentCenterPathLineLayerId = currentCenterGroupPathPolyLineLayerGroup._leaflet_id

        // TODO:[-] 22-02-25 暂时加入的加入概率圆
        tyGroupCenterPathLine.addProRadiusCirle2MapByCenter()

        this.currentGroupPathPulsingLayerGroup = currentTyCenterPathIconLayerGroup
    }

    // + 21-05-12 添加 中间路径的概率半径 -> map
    addTyGroupProPathCircles(): void {
        if (this.tyGroupProPathCircles.length > 0) {
            const mymap: any = this.$refs.basemap['mapObject']
            const cirleLayers: L.Layer[] = []
            const tyGroupProPathMaxCircle: number = Math.max.apply(
                Math,
                this.tyGroupProPathCircles.map((temp) => {
                    return temp.radius
                })
            )
            const cirleScaleColor = new ScaleColor(0, tyGroupProPathMaxCircle)
            this.tyGroupProPathCircles.forEach((tempTyGroup) => {
                const circleTemp = L.circle(new L.LatLng(tempTyGroup.lat, tempTyGroup.lon), {
                    color: cirleScaleColor.getColor(tempTyGroup.radius),
                    radius: tempTyGroup.radius * RADIUSUNIT,
                    fill: true,
                    fillOpacity: 0.7,
                    //weight: tempTyGroup.radius,
                    opacity: 0.7
                })
                cirleLayers.push(circleTemp)
            })
            const tempTyGroupProPathCircles = L.layerGroup([...cirleLayers]).addTo(mymap)
            this.currentPathProCirclesLayerId = tempTyGroupProPathCircles._leaflet_id
        }
    }

    // + 21-04-22 将 台风实时圆 add to map
    addTyphoonRealDataDiv2Map(tyRealDataCircle: TyphoonCircleStatus): void {
        const that = this
        const mymap: L.Map = this.$refs.basemap['mapObject']
        const typhoonDivHtml: string = tyRealDataCircle.toDivIconHtml()

        const typhoonDivIcon = L.divIcon({
            className: 'typhoon_icon_default',
            html: typhoonDivHtml,
            // 坐标，[相对于原点的水平位置（左加右减），相对原点的垂直位置（上加下减）]
            iconAnchor: [-20, 30]
        })

        // console.log(typhoon_div_icon);
        const typhoonDivIconTarget = L.marker([tyRealDataCircle.lat, tyRealDataCircle.lon], {
            icon: typhoonDivIcon
        }).addTo(mymap)
        that.tyRealDataDivIcon = typhoonDivIconTarget
        that.isShowTyRealDataDivIcon = true
    }

    // 根据传入的 时间 index 返回当前 dateIndex 对应的 大风概率半径
    // 只对应时刻 24,48,72,96,120 且对应的 大风概率半径是写死的,注意！！
    getTyProPathRadius(index: number, options: { interval: number } = { interval: 6 }): number {
        let radius = 0
        const indexTemp = index - 1

        switch (true) {
            // TODO:[-] 21-03-26 备份之前的色标
            case indexTemp * options.interval === 24:
                radius = 60
                break
            case indexTemp * options.interval === 48:
                radius = 100
                break
            case indexTemp * options.interval === 72:
                radius = 120
                break
            case indexTemp * options.interval === 96:
                radius = 150
                break
            case indexTemp * options.interval === 120:
                radius = 180
                break
            default:
                radius = 0
                break
        }
        return radius
    }

    // TODO:[-] + 21-05-13 对集合预报路径进行重新排序，越内侧越靠前
    sortTyGroupLineList(): void {
        let arr1: TyphoonComplexGroupRealDataMidModel[] = []
        let arr2: TyphoonComplexGroupRealDataMidModel[] = []
        // 将 标识符为 : [c,f,s] 提起出来存在 arr1 中
        // 将 标识符为 : [r,l] 提取出来存在 arr2 中
        this.tyGroupLineList.forEach((temp) => {
            if (['r', 'l'].includes(temp.tyPathType)) {
                arr2.push(temp)
            } else if (['c', 'f', 's'].includes(temp.tyPathType)) {
                arr1.push(temp)
            }
        })
        // 对于 arr2 对 数字进行排序
        arr2 = arr2.sort((a, b) => {
            return a.tyPathMarking - b.tyPathMarking
        })
        arr1 = arr1.sort((a, b) => {
            if (a.tyPathType === 'c' && b.tyPathType !== 'c') {
                return -1
            } else if (a.tyPathType === 'c' && b.tyPathType === 'c') {
                return 0
            } else if (['f', 's'].includes(a.tyPathType) && ['f', 's'].includes(b.tyPathType)) {
                return a.tyPathMarking - b.tyPathMarking
            } else {
                return 0
            }
        })
        this.tyGroupLineList = [...arr1, ...arr2]
        // TODO:[-] 21-05-13 新加入一个对其倒叙，因为此种方式排序完的数组，中间路径会出现在最前，也就是最先被叠加
        this.tyGroupLineList = this.tyGroupLineList.sort((a, b) => {
            return -1
        })
    }

    // TODO:[-] 20-06-29 加载 岸线的 wms服务
    initLandWMS(): void {
        const mymap: any = this.$refs.basemap['mapObject']
        const wmsLayer = L.tileLayer.wms('http://localhost:8082/geoserver/nmefc_current/wms?', {
            layers: 'nmefc_current:land_china', //需要加载的图层
            format: 'image/png', //返回的数据格式
            transparent: true
            //crs: L.CRS.EPSG4326
        })
        mymap.addLayer(wmsLayer)
    }

    init9LinesWMS(): void {
        const mymap: any = this.$refs.basemap['mapObject']
        const wmsLayer = L.tileLayer.wms('http://localhost:8082/geoserver/nmefc_current/wms?', {
            layers: 'nmefc_current:9line', //需要加载的图层
            format: 'image/png', //返回的数据格式
            transparent: true
            //crs: L.CRS.EPSG4326
        })
        mymap.addLayer(wmsLayer)
    }

    // 初始化 layer control
    // TODO:[*] 20-07-27 以后可以去掉 layer control 的这种操作方式
    initLayerControl(): void {
        // TODO:[*] 20-07-08 注意已经存在了一个 this.initControlLayer 方法
        const mymap: any = this.$refs.basemap['mapObject']
        const esriDarkGreyCanvas = L.tileLayer(
            'http://{s}.sm.mapstack.stamen.com/' +
                '(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/' +
                '{z}/{x}/{y}.png',
            {
                attribution: 'Tiles &copy; Esri &mdash; Esri,WMS'
            }
        )
        // 1- 创建 controler 的 base layer
        const baseLayers = {
            '风+流场': esriDarkGreyCanvas
        }

        // 2- 判断 layer control 是否存在，若存在先清除
        if (this.layerControl != null) {
            this.layerControl.remove()
        }
        // 3- 创建 layer control , add to map
        this.layerControl = L.control.layers(baseLayers)
        this.layerControl.setPosition('bottomright')
        // this.layerControl.addTo(mymap)
    }

    // TODO:[-] 20-05-26 加入了地图选点的功能
    createMarker(event: { latlng: { lat: number; lng: number } }): void {
        let latlon: Array<number> = []
        latlon = [parseFloat(event.latlng.lat.toFixed(4)), parseFloat(event.latlng.lng.toFixed(4))]

        // console.log(`latlon:${latlon}`)
        // TODO:[-] 21-01-06 新加入的判断 lock
        if (!this.getCurrentLatlngLock) {
            this.setLatlng(latlon)
        }
    }

    // 找到当前时间对应的 tyGroup 对应的 realdata,信息,并添加至map
    // 21-08-15 加入差值
    // isShowTyRealDataForm 是否显示台风当前信息框
    addTyTargetDtRealData2Map(targetDt: Date, isShowTyRealDataForm = false): void {
        const that = this
        const mymap: any = this.$refs.basemap['mapObject']
        this.clearTyRealDataLayer()
        // 21-08-15 此处需要加入差值，若未存在对应时间的 layer , 则需要手动找到差值后的对象
        // const targetCircle: L.Layer = this.tyGroupCenterCirleLayers.find((temp) => {
        //     return temp.options.customData.forecastDt - targetDt === 0
        // })
        // const targetCircle: L.Layer = getTyCenterGroupDiffLayer(
        //     this.tyGroupCenterCirleLayers,
        //     targetDt
        // )
        // TODO:[-] 21-10-20 注意此处使用 this.currentGroupPathPulsingLayerGroup.getLayers()
        const diffCustomData:
            | {
                  bp: number
                  radius: number
                  lat: number
                  lon: number
                  forecastDt: Date
              }
            | undefined = getTyCenterGroupDiffLayer(
            this.currentGroupPathPulsingLayerGroup.getLayers(),
            targetDt
        )
        if (diffCustomData !== undefined) {
            const galeRadiusScaleColor = new ScaleColor(
                that.tyGroupGaleRadiusRange.min,
                that.tyGroupGaleRadiusRange.max
            )
            galeRadiusScaleColor.setScale('Viridis')
            // const layer = targetCircle
            // layer.setStyle({
            //     opacity: 1
            // })
            const customData: {
                bp: number
                radius: number
                lat: number
                lon: number
            } = diffCustomData
            // 获取半径
            const targetRadius = customData.radius
            // const coords: L.LatLng = targetCircle.getLatLng()
            // const coords: L.LatLng = { lat: customData.lat, lng: customData.lon }
            const coords: L.LatLng = new L.LatLng(customData.lat, customData.lon)
            /*
                        大体逻辑:
                            -1 根据当前传入的 circle index 找到对应 group -> realdata
                            -2 根据对应的 realdata 获取当前的 radius
                            -3 根据经纬度画圆
                        */
            // radius 单位为 m ，需要乘以系数 1000m = 1km 为基本单位
            const radiusUnit = 1000
            const typhoonStatus = new TyphoonCircleStatus(
                customData.radius,
                customData.bp,
                targetDt,
                customData.lat,
                customData.lon
            )
            const tyMax = 10
            const tyMin = 1
            // TODO:[-] 22-03-07 注意此处的台风脉冲点icon存在偏移
            // + 21-08-13 对于当前台风位置的脉冲icon
            const tyCirleIcon = new IconTyphoonCirlePulsing({
                val: 10,
                max: tyMax,
                min: tyMin,
                iconType: IconTypeEnum.TY_PULSING_ICON
            })
            const tyDivIcon = L.divIcon({
                className: 'surge_pulsing_icon_default',
                html: tyCirleIcon.toHtml()
            })
            const tyPulsingMarker = L.marker([customData.lat, customData.lon], {
                icon: tyDivIcon
            })
            tyPulsingMarker.on('click', (e) => {
                if (that.tyRealDataDivIcon && that.isShowTyRealDataDivIcon) {
                    mymap.removeLayer(that.tyRealDataDivIcon)
                    that.isShowTyRealDataDivIcon = false
                } else if (that.tyRealDataDivIcon) {
                    that.addTyphoonRealDataDiv2Map(typhoonStatus)
                    // that.isShowTyRealDataDivIcon = true
                }
            })
            this.currentTyPulsingMarker = tyPulsingMarker.addTo(mymap)
            // ---
            this.currentGaleRadius = L.circle(coords, {
                radius: targetRadius * radiusUnit,
                fillColor: galeRadiusScaleColor.getColor(targetRadius),
                color: galeRadiusScaleColor.getColor(targetRadius),
                weight: 2,
                fillOpacity: 0.5
            }).addTo(mymap)
            // + 21-04-22 鼠标移入当前 circle 显示该 divIcon
            if (isShowTyRealDataForm) {
                this.addTyphoonRealDataDiv2Map(typhoonStatus)
            }
        }
    }

    // TODO:[-] + 21-05-31 去掉当前时刻对应的台风 原点 + 脉冲圆点 + 半径示意
    clearTyRealDataLayer(): void {
        const mymap: any = this.$refs.basemap['mapObject']
        if (this.tyRealDataDivIcon) {
            mymap.removeLayer(this.tyRealDataDivIcon)
            this.tyRealDataDivIcon = undefined
        }
        if (this.currentGaleRadius) {
            mymap.removeLayer(this.currentGaleRadius)
            this.currentGaleRadius = undefined
        }
        mymap.removeLayer(this.currentTyPulsingMarker)
    }

    // TODO:[*] 19-11-08 使用vuex-clas的方式监听oil 的两个select
    @Getter('getShowFactor', { namespace: 'oil' }) getShowFactor

    @Watch('getShowFactor')
    OnShowFactor(val: number) {
        // console.log(`监听到vuex中namespace:oil factor发生变化:${valNew}`);
        this.showFactor = val
        // TODO:[-] 20-01-23 此处暂时注释掉对于factor改变后应该加载的业务逻辑
    }

    @Getter('casecode', { namespace: 'case' }) casecode: string

    @Getter('getShowType', { namespace: 'oil' }) getShowType: number

    @Watch('processOptions.rate')
    onProcessOptions(rate: number) {
        // console.log(`监听到processOptions发生变化:${rate}`)
    }

    // TODO:[-] 20-06-24 缩放至指定位置
    zoomLocation(point: { lat: number; lng: number }) {
        console.log(point)
        this.center = [point.lat, point.lng]
    }

    @Getter(GET_MAP_NOW, { namespace: 'map' }) getcurrent

    // @Debounce(2000)
    @Watch('getcurrent')
    async onCurrent(valNew: Date): Promise<void> {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        // 修改当前 的 targetDate
        this.targetDate = valNew
        this.tyGroupOptions.forecastDt = valNew
        // TODO:[-] 21-08-05 加入对 this.tyFieldOptions.forecastDt 的修改
        this.tyFieldOptions.forecastDt = valNew
        this.stationSurgeIconOptions.forecastDt = valNew
        // TODO:[-] 21-05-31 将 当前时间对应的台风信息form 添加至 map
        this.addTyTargetDtRealData2Map(valNew, this.tyGroupOptions.isShowTyDetailForm)
    }

    @Watch('stationSurgeIconOptions', { immediate: true, deep: true })
    onStationSurgeIconOptions(val: ITyStationLayerOptions): void {
        // console.log(val)
        const that = this
        const mymap: any = this.$refs.basemap['mapObject']
        // if(val)
        this.setShowStationIcon(val.isShow)
        if (this.checkStationSurgeOptions(val)) {
            // 加载对应时刻的 潮位站数据

            this.loadCurrentStationList(val.layerType).then(() => {
                if (val.layerType === LayerTypeEnum.STATION_ICON_FIELD_LAYER) {
                    that.loadStationIconsByZoom(that.zoomLevel, that.currentStationSurgeList)
                } else if (val.layerType === LayerTypeEnum.STATION_ICON_STATIC_LAYER) {
                    that.loadStationIconsByZoom(5, that.currentStationSurgeList)
                } else if (val.layerType === LayerTypeEnum.STATION_ICON_MAX_LAYER) {
                    that.loadStationIconsByZoom(that.zoomLevel, that.currentStationSurgeList)
                }
            })
        } else {
            this.clearSurgeAllGroupLayers()
        }
    }

    get getTyFieldOptions(): ITySurgeLayerOptions {
        return { ...this.tyFieldOptions }
    }

    @Watch('getTyFieldOptions', { immediate: true, deep: true })
    async onTyFieldOptions(val: ITySurgeLayerOptions, oldVal: ITySurgeLayerOptions): Promise<void> {
        const that = this
        const mymap: any = this.$refs.basemap['mapObject']
        const scaleList: string[] | string = val.scaleList
        if (this.checkSurgeOptions(val)) {
            // 当 tyGroupOptions 发生变更, tyCode | forecastDt | timeStamp 中一个或多个
            // 执行 loadStationList
            // 执行 load wms 服务
            // 点击向后台发送 获取逐时风暴增水场的请求
            // 请求参数包含 ty_code | ty_timestamp | forecast_dt
            this.clearUniquerRasterLayer()
            this.clearSosurfaceLayer()
            const fieldSurgeGeoLayer = new FieldSurgeGeoLayer({
                tyCode: val.tyCode,
                tyTimestamp: val.tyTimeStamp,
                forecastDt: val.forecastDt,
                scaleList: scaleList
            })
            this.clearSurgeHourlyRasterLayer()
            const showMsg = `加载台风code:${val.tyCode},预报时间:${moment(val.forecastDt).format(
                'yyyy-MM-DD HH'
            )}`
            this.$message({
                message: showMsg,
                center: true,
                type: 'success'
            })
            const loadInstance = loading('等待加载等值面', {
                fullscreen: true,
                background: 'rgba(49, 59, 89, 0.733)'
            })
            this.setIsShowRasterLayerLegend(true)

            /** 是否加载栅格增水layer */
            const isLoadingRasterLayer =
                val.rasterLayerType == RasterLayerEnum.RASTER_LAYER ? true : false
            await fieldSurgeGeoLayer
                .add2map(mymap, that.$message, isLoadingRasterLayer)
                .then((_id) => {
                    this.setScaleRange(fieldSurgeGeoLayer.scaleRange || [])
                    that.uniqueRasterLayerId = _id
                })
                .then(async (_) => {
                    if (!isLoadingRasterLayer && fieldSurgeGeoLayer.tiffUrl !== null) {
                        // TODO:[*] 22-06-14 以下部分进行封装
                        const maxSosurface = new SurgeSosurface(
                            fieldSurgeGeoLayer.tiffUrl
                            // sosurfaceOptions
                        )
                        const sosurfaceOpts = await maxSosurface.addSosurface2MapbyScale(
                            mymap,
                            that.$message
                        )
                        this.setIsoSurgeColorScaleValRange(sosurfaceOpts.valScale)
                        this.setIsoSurgeColorScaleStrList(sosurfaceOpts.colorScale)
                        that.sosurfaceLayerId = maxSosurface.getLayerId()
                        that.surgeGridTitleLayerId = maxSosurface.getPointsTitleLayerId()
                        that.sosurfaceLayer = maxSosurface.getLayer()
                    }
                })
                .then((_) => {
                    loadInstance.close()
                })
                .catch((err) => {
                    loadInstance.close()
                    that.$message({
                        message: err,
                        center: true,
                        type: 'warning'
                    })
                })
        } else if (!val.isShow && oldVal.isShow) {
            // 若未通过则清除 tyGroup layer
            this.clearUniquerRasterLayer()
            this.clearSosurfaceLayer()
        }
    }

    async addSurgeLayer2Map(surgeRasterInstance: any): Promise<void> {}

    // TODO:[-] 21-05-19 根据监听当前的 tyGroupOptions 来确定 指定 tyGroupPath(center) 对应的时间与 tyCode,timeStamp
    @Watch('getTyGroupOptions', { immediate: true, deep: true })
    onTyGroupOptions(val: ITyGroupPathOptions, oldVal: ITyGroupPathOptions): void {
        // 现在 isShow=true 且 old isShow=false
        // 需要前后两次 isShow 发生了变化才会触发以下操作
        // - 22-05-06 注意需要将此处的 clearTyGroupOutlineGroupLayer 放在 loadGroupTyphoonLine 中
        if (val.isShow != oldVal.isShow) {
            this.clearTyGroupOutlineGroupLayer()
            if (!val.isShow) {
                // this.clearGroupLayer(this.currentGroupPathPolyLineLayerGroup)
                this.clearLayerById(this.currentGroupPathPolyLineGroupLayersId)
            } else if (val.isShow) {
                const showMsg = `加载台风:${val.tyCode}集合路径`
                this.$notify({ title: '成功', message: showMsg, type: 'success' })
                this.loadGroupTyphoonLine(val.isShowOutlinePolyLayer, val.isShow)
            }
        }
        if (val.isShowTyDetailForm != oldVal.isShowTyDetailForm) {
            if (!val.isShowTyDetailForm) {
                this.clearTyRealDataLayer()
            }
        }
    }

    // - 22-04-24 此处加入了一个 计算属性，这样可以监听到 old 与 new 的差别变化，不然由于是引用类型，无法监听到 new 与 old 的差异
    get getTyMaxSurgeOpts(): ITySurgeLayerOptions {
        return { ...this.tyMaxSurgeOptions }
    }

    @Watch('getTyMaxSurgeOpts', { immediate: true, deep: true })
    async onTyMaxSurgeOptions(val: ITySurgeLayerOptions): Promise<void> {
        const that = this
        const mymap: any = this.$refs.basemap['mapObject']
        const scaleList: string[] | string = val.scaleList
        if (val.isShow && val.isShow === true) {
            this.clearUniquerRasterLayer()
            this.clearSosurfaceLayer()
            const loadInstance = loading('等待加载等值面', {
                fullscreen: true,
                background: 'rgba(49, 59, 89, 0.733)'
            })
            // TODO:[-] 22-03-21 此处修改为使用新的 canvas 渲染 geotiff raster
            const surgeRasterLayer = new SurgeRasterGeoLayer({
                tyCode: val.tyCode,
                tyTimestamp: val.tyTimeStamp,
                forecastDt: this.forecastDt,
                scaleList: scaleList,
                customMin: 0, // 自定义下限为0
                customMax: 2, // TODO:[-] 22-04-14 加入的自定义上限为2
                customCoefficient: 0.8,
                customCoeffMax: 1
            })

            const isLoadingRasterLayer =
                val.rasterLayerType == RasterLayerEnum.RASTER_LAYER ? true : false
            this.setIsShowRasterLayerLegend(true)
            surgeRasterLayer
                .add2map(mymap, that.$message, isLoadingRasterLayer)
                .then((layerId) => {
                    this.setScaleRange(surgeRasterLayer.scaleRange || [])
                    this.uniqueRasterLayerId = layerId
                })
                .then(async (_) => {
                    if (!isLoadingRasterLayer && surgeRasterLayer.tiffUrl !== null) {
                        const maxSosurface = new SurgeSosurface(
                            surgeRasterLayer.tiffUrl
                            // sosurfaceOptions
                        )
                        // 此处会有可能出现错误，对于加载的地主不存在指定文件时会出现错误，但 catch 无法捕捉到
                        const sosurfaceOpts = await maxSosurface.addSosurface2MapbyScale(
                            mymap,
                            that.$message
                        )

                        this.setIsoSurgeColorScaleValRange(sosurfaceOpts.valScale)
                        this.setIsoSurgeColorScaleStrList(sosurfaceOpts.colorScale)
                        that.sosurfaceLayerId = maxSosurface.getLayerId()
                        that.surgeGridTitleLayerId = maxSosurface.getPointsTitleLayerId()
                        that.sosurfaceLayer = maxSosurface.getLayer()
                    }
                })
                .then((_) => {
                    loadInstance.close()
                })
                .catch((err) => {
                    loadInstance.close()
                    that.$message({
                        message: err,
                        center: true,
                        type: 'warning'
                    })
                })
        } else if (!val.isShow) {
            this.clearUniquerRasterLayer()
            this.clearSosurfaceLayer()
        }
    }

    @Mutation(SET_SCALE_RANGE, { namespace: 'common' }) setScaleRange

    // + 22-01-05 重置 当前加载的图层
    @Mutation(SET_IS_INIT_LAYERS, { namespace: 'map' }) setInitLayers

    @Mutation(SET_MAP_NOW, { namespace: 'map' }) setMapNow

    @Mutation(SET_SHOW_STATION_ICON, { namespace: 'station' }) setShowStationIcon

    @Mutation(SET_SHOW_TYPHOON_LEGEND_ICON, { namespace: 'typhoon' }) setShowTyLegend

    /** 设置当前 潮位等值面色标 实际值数组 */
    @Mutation(SET_ISOSURGE_COLOR_SCALE_VAL_RANGE, { namespace: 'common' })
    setIsoSurgeColorScaleValRange

    @Mutation(SET_ISOSURGE_COLOR_SCALE_STR_LIST, { namespace: 'common' })
    setIsoSurgeColorScaleStrList

    /** 设置是否显示 raster layer 图例 */
    @Mutation(SET_IS_SHOW_RASTER_LEGEND, { namespace: 'map' })
    setIsShowRasterLayerLegend

    @Watch('tyProSurgeOptions', { immediate: true, deep: true })
    onTyProSurgeOptions(val: ITySurgeLayerOptions): void {
        const that = this
        // console.log(`监听到tyMaxSurgeOptions:tyCode:${val.tyCode},tyTS:${val.tyTimeStamp}发生变化`)
        const mymap: any = this.$refs.basemap['mapObject']
        // const scaleList: string[] | string = getColorScale('my-colour').scaleColorList
        const scaleList: string[] | string = val.scaleList
        if (val.isShow) {
            this.clearUniquerRasterLayer()
            this.clearSosurfaceLayer()
            const surgeRasterLayer = new ProSurgeGeoLayer({
                tyCode: val.tyCode,
                tyTimestamp: val.tyTimeStamp,
                forecastDt: this.forecastDt,
                scaleList: scaleList
            })
            const loadInstance = loading('等待加载等值面', {
                fullscreen: true,
                background: 'rgba(49, 59, 89, 0.733)'
            })
            const isLoadingRasterLayer =
                val.rasterLayerType == RasterLayerEnum.RASTER_LAYER ? true : false

            this.setIsShowRasterLayerLegend(true)
            surgeRasterLayer
                .add2map(mymap, that.$message, isLoadingRasterLayer, 0.5, val.layerType)
                .then((layerId) => {
                    this.setScaleRange(surgeRasterLayer.scaleRange || [])
                    // this.uniqueRasterLayer = layer
                    this.uniqueRasterLayerId = layerId
                })
                .then(async (_) => {
                    if (!isLoadingRasterLayer && surgeRasterLayer.tiffUrl !== null) {
                        // TODO:[*] 22-06-02 添加等值面
                        const sosurfaceOptions: { colorScale?: string[]; valScale?: number[] } = {
                            // colorScale: [
                            //     '#00429d',
                            //     '#4771b2',
                            //     '#73a2c6',
                            //     '#a5d5d8',
                            //     '#ffffe0',
                            //     '#ffbcaf',
                            //     '#f4777f',
                            //     '#cf3759',
                            //     '#93003a'
                            // ],
                            // colorScale: [
                            //     'rgb(0,97,128)',
                            //     'rgb(0,128,161)',
                            //     'rgb(0,224,255)',
                            //     'rgb(153,252,252)',
                            //     'rgb(252,252,0)',
                            //     'rgb(252,191,0)',
                            //     'rgb(252,97,0)',
                            //     'rgb(191,0,0)',
                            //     'rgb(128,0,0)'
                            // ],
                            colorScale: [
                                '#4575b4',
                                '#74add1',
                                '#abd9e9',
                                '#e0f3f8',
                                'rgb(252,252,0)',
                                'rgb(252,191,0)',
                                'rgb(252,97,0)',
                                'rgb(191,0,0)',
                                'rgb(128,0,0)'
                            ],
                            valScale: [20, 30, 40, 50, 60, 70, 80, 90, 100]
                        }
                        const maxSosurface = new SurgeSosurface(
                            surgeRasterLayer.tiffUrl,
                            sosurfaceOptions
                            // sosurfaceOptions
                        )
                        // 此处会有可能出现错误，对于加载的地主不存在指定文件时会出现错误，但 catch 无法捕捉到
                        const sosurfaceOpts = await maxSosurface.addSosurface2MapbyScale(
                            mymap,
                            that.$message
                        )

                        this.setIsoSurgeColorScaleValRange(sosurfaceOptions.valScale)
                        this.setIsoSurgeColorScaleStrList(sosurfaceOptions.colorScale)
                        that.sosurfaceLayerId = maxSosurface.getLayerId()
                        that.surgeGridTitleLayerId = maxSosurface.getPointsTitleLayerId()
                        that.sosurfaceLayer = maxSosurface.getLayer()
                    }
                })
                .then((_) => {
                    // loadInstance.close()
                })
                .catch((err) => {
                    that.$message({
                        message: err,
                        center: true,
                        type: 'warning'
                    })
                    loadInstance.close()
                })
                .finally((_) => {
                    loadInstance.close()
                })
        } else {
            this.clearUniquerRasterLayer()
            this.clearSosurfaceLayer()
        }
    }

    // + 22-01-05 隐藏station icon 图层
    hideStationLayer(): void {
        this.stationSurgeIconOptions.isShow = false
    }

    // TODO:[-] 22-01-05 重置当前的 ty 时间戳，重置为默认时间戳
    resetTimestamp(): void {
        this.tyTimeStamp = DEFAULT_TIMESTAMP
    }

    // TODO:[-] 22-01-05 重置当前的 station code ，重置为默认code
    resetStationCode(): void {
        this.stationCode = DEFAULT_STATION_CODE
    }

    /*
        监听当前选中的 TyId
            -1: 修改当前的layers
    */
    @Watch('selectedTyId')
    onSelectedTyId(val: number): void {
        if (val != DEFAULT_TYPHOON_ID) {
            const testTyphoonId = val
            // TODO:[-] 22-01-05 加入的当监听到 tyId 发生变化后重置当前选定的 layers
            this.setInitLayers(true)
            // TODO:[-] 22-01-05 注意在切换 tyId 时，需要手动将 stationSurgeOptions.isShow=false !
            this.hideStationLayer()
            this.resetTimestamp()
            this.resetStationCode()
            this.isShowTimeBar = true
            const showMsg = '已加载对应台风信息'
            this.$message({
                message: showMsg,
                center: true,
                type: 'success'
            })
            this.clearGroupPathAllLayer()

            this.testGetAddTyGroupPath2Map(testTyphoonId)

            // TODO:[*] 21-04-28 暂时加入的加载 海洋站位置的 测试
            this.clearSurgeAllGroupLayers()
            // TODO:[*] 22-01-05 将 加载海洋站的入口设置为 监听 stationSurgeIconOptions !
            // if (this.stationSurgeIconOptions.isShow) {
            //     this.loadStationList(this.zoom)
            // }

            // + 21-05-18 在页面加载后首先加载当前的 start_dt 与 end_dt
            // const tyGroupPath = new TyGroupPath()
            // TODO:[-] 21-07-28 将 读取指定台风集合路径的 读取 起止时间放到 监听 tyCode 与 tyTimestamp 中
            // tyGroupPath.getTargetTyGroupDateRange(this.tyCode, this.tyTimeStamp).then((res) => {
            //     this.finishDate = new Date(Math.max(...res))
            //     this.startDate = new Date(Math.min(...res))
            // })
        } else {
            // 对于未选中的 ty 的情况 ，清除 typhoonlie
            this.clearGroupPathAllLayer()
            this.clearCenterGroupAllLayer()
            this.isShowTimeBar = false
        }
        // this.setInitLayers(false)
    }

    get getTyOptions(): { tyCode: string; tyTimeStamp: string } {
        const { tyCode, tyTimeStamp } = this
        return { tyCode, tyTimeStamp }
    }

    @Watch('getTyOptions')
    onTyOptions(val: { tyCode: string; tyTimeStamp: string }) {
        console.log(`tyGroupPath组件监听到'tyCode'与'tyTimestamp'发生变化:${val}`)
        if (val.tyCode !== DEFAULTTYCODE && val.tyTimeStamp !== DEFAULT_TIMESTAMP) {
            // TODO:[*] 21-07-28 此处还需要修改 tyGroupOptions
            this.tyGroupOptions.tyCode = val.tyCode
            this.tyGroupOptions.timeStamp = val.tyTimeStamp
            // TODO:[-] 21-08-02 此处手动加入家庭 到 tyCode 与 tyTS 变化后手动更新 tyMaxSurgeOptions 中的两个字段
            this.tyMaxSurgeOptions.tyCode = val.tyCode
            this.tyMaxSurgeOptions.tyTimeStamp = val.tyTimeStamp
            // TODO:[-] 21-08-04 手动加入修改 tyFieldSurgeOptions 中相应的字段
            this.tyFieldOptions.tyCode = val.tyCode
            this.tyFieldOptions.tyTimeStamp = val.tyTimeStamp
            // TODO:[-] 21-08-12 加入了 概率增水场
            this.tyProSurgeOptions.tyCode = val.tyCode
            this.tyProSurgeOptions.tyTimeStamp = val.tyTimeStamp
            // TODO:[-] 21-08-05 手动加入更新 stationSurgeIconOptions 中的 tyCode 与 tyTS
            this.stationSurgeIconOptions.tyCode = val.tyCode
            this.stationSurgeIconOptions.tyTimeStamp = val.tyTimeStamp
            const tyGroupPath = new TyGroupPath()
            tyGroupPath.getTargetTyGroupDateRange(this.tyCode, this.tyTimeStamp).then((res) => {
                this.finishDate = new Date(Math.max(...res))
                this.startDate = new Date(Math.min(...res))
                this.setMapNow(this.startDate)
            })
        }
    }

    checkTyGroupOptions(val: ITyGroupPathOptions): boolean {
        let isOk = false
        // TODO:[*] !! 21-07-28 注意可以将 group path 默认id 统一放在 DefaultTyGroupPathOptions 中
        if (
            val.tyCode === DefaultTyGroupPathOptions.tyCode ||
            val.forecastDt === DefaultTyGroupPathOptions.forecastDt ||
            val.timeStamp === DefaultTyGroupPathOptions.timeStamp ||
            val.gpId === DEFAULT_TYPHOON_GROUP_PATH_ID
        ) {
            isOk = false
        } else if (val.isShow === false) {
            isOk = false
        } else {
            isOk = true
        }
        return isOk
    }

    /**  清除唯一的栅格图层——以后将所有清除 raster 均调用此方法 */
    clearUniquerRasterLayer(): void {
        if (this.uniqueRasterLayerId !== DEFAULT_LAYER_ID) {
            this.setIsShowRasterLayerLegend(false)
            this.clearLayerById(this.uniqueRasterLayerId)
            this.uniqueRasterLayerId = DEFAULT_LAYER_ID
        }
    }

    /** 清除增水场等值面 layer */
    clearSosurfaceLayer(): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        if (this.sosurfaceLayerId !== DEFAULT_LAYER_ID) {
            this.setIsShowRasterLayerLegend(false)
            this.clearLayerById(this.sosurfaceLayerId)
            this.clearLayerById(this.surgeGridTitleLayerId)
            this.sosurfaceLayerId = DEFAULT_LAYER_ID
            this.surgeGridTitleLayerId = DEFAULT_LAYER_ID
        }
    }

    // + 21-08-16 新加入的检查 stationSurgeIconOptions
    checkStationSurgeOptions(val: ITyStationLayerOptions): boolean {
        let isOk = false
        if (val.isShow) {
            if (val.tyCode === DefaultTyGroupPathOptions.tyCode) {
                this.$message({ message: '请先选择台风!', type: 'warning' })
            } else if (val.layerType !== LayerTypeEnum.STATION_ICON_LAYER) {
                if (
                    val.forecastDt === DefaultTyGroupPathOptions.forecastDt ||
                    val.tyTimeStamp === DefaultTyGroupPathOptions.timeStamp ||
                    val.gpId === DEFAULT_TYPHOON_GROUP_PATH_ID
                ) {
                    this.$message({ message: '需要选择其他参数才可加载', type: 'warning' })
                    isOk = false
                } else {
                    isOk = true
                }
            } else {
                isOk = true
            }
        } else if (val.isShow === false) {
            isOk = false
        }
        return isOk
    }

    checkSurgeOptions(val: ITySurgeLayerOptions): boolean {
        let isOk = false
        // TODO:[*] !! 21-07-28 注意可以将 group path 默认id 统一放在 DefaultTyGroupPathOptions 中
        if (val.isShow) {
            if (
                val.tyCode === DefaultTyGroupPathOptions.tyCode ||
                val.forecastDt === DefaultTyGroupPathOptions.forecastDt ||
                val.tyTimeStamp === DefaultTyGroupPathOptions.timeStamp
            ) {
                this.$message({ message: '需要选择其他参数才可加载图层', type: 'warning' })
                isOk = false
            } else {
                isOk = true
            }
        } else if (val.isShow === false) {
            isOk = false
        }
        return isOk
    }

    // TODO:[-] 20-04-16 注意此处的 Getter -> geo.ts -> getters 而不是 actions!
    @Getter('coverageid', { namespace: 'geo' }) getCoverageId

    @Watch('getCoverageId')
    onCoverageId(valNew: number): void {}

    @Getter(GET_TYPHOON_ID, { namespace: 'typhoon' }) getTyphoonId

    @Getter('coverageType', { namespace: 'geo' }) getCoverageType

    @Watch('getCoverageType')
    onCoverageType(valNew: number): void {}

    // + 21-07-28 监听 tyTimeStamp 台风时间戳
    @Getter(GET_TYPHOON_TIMESTAMP, { namespace: 'typhoon' }) getTyTimeStamp

    @Watch('getTyTimeStamp')
    onTyTimeStamp(val: string): void {
        this.tyTimeStamp = val
    }

    // TODO:-] 22-04-07 store -> 爬取到的台风路径
    @Getter(GET_TYPHOON_PATH_LIST, { namespace: 'typhoon' }) getSpiderTyphoonPathList

    @Watch('getSpiderTyphoonPathList')
    onGetSpiderTyPathList(
        val: {
            forecastDt: Date
            lat: number
            lon: number
            bp: number
            isForecast: boolean
            tyType: string
            // radius: number
        }[]
    ): void {
        this.spiderTyphoonPathList = val
    }

    @Watch('spiderTyphoonPathList', { immediate: true, deep: true })
    onSpiderTyPathList(
        val: {
            forecastDt: Date
            lat: number
            lon: number
            bp: number
            isForecast: boolean
            tyType: string
            // radius: number
        }[]
    ): void {
        const mymap: any = this.$refs.basemap['mapObject']
        if (this.spiderTyPathLineLayerId !== DEFAULT_LAYER_ID) {
            this.clearLayerById(this.spiderTyPathLineLayerId)
        }
        // 添加至地图中
        const cmaPathLine = new TyCMAPathLine(mymap, val)

        // TODO:[*] 22-05-30 注意此处修改尝试使用 canvas 渲染路径中心点(png)
        const cmaPathLineLayer = cmaPathLine.add2Map()
        // cmaPathLine.add2MapByCanvas()
        const lastTyLatlng = cmaPathLine.getlastTyLatlng()
        if (lastTyLatlng) {
            this.center = [lastTyLatlng.lat, lastTyLatlng.lng]
        }
        if (val.length !== 0) {
            this.setShowTyLegend(true)
        } else if (val.length === 0) {
            this.setShowTyLegend(false)
        }
        this.spiderTyPathLineLayerId = cmaPathLineLayer._leaflet_id
    }

    // + 21-07-28 监听 tyCode
    @Getter(GET_TYPHOON_CODE, { namespace: 'typhoon' }) getTyCode

    @Watch('getTyCode')
    onTyCode(val: string): void {
        this.resetTimestamp()
        this.tyCode = val
    }

    // + 21-08-19 common -> 色标相关 scale
    @Getter(GET_SCALE_KEY, { namespace: 'common' }) getScaleKey

    @Watch('getScaleKey')
    onScaleKey(key: string): void {
        // 当当前选择的 color scale 发生变化后，更新当前 isShow==true 的 raster options
        // console.log(`主组件map监听到 scaleKey 发生变化:${key}}`)
        const listRasterOpt: IRasterLayer[] = [
            this.tyMaxSurgeOptions,
            this.tyFieldOptions,
            this.tyProSurgeOptions
        ]
        const index = listRasterOpt.findIndex((temp) => {
            return temp.isShow === true
        })
        if (index >= 0) {
            listRasterOpt[index].scaleList = getColorScale(key).scaleColorList
        }
    }

    @Watch('getTyphoonId')
    onTyphoonId(val: number): void {
        this.selectedTyId = val
    }

    // TODO:[*] 20-10-26 + 加入用来验证 风场|流场|流场raster opt 的变动情况
    verifyOpt(newvalNew: { coverageId: number; isShow: boolean }, unChechShow = true): boolean {
        if (newvalNew.coverageId === DEFAULT_COVERAGE_ID) {
            return false
        }
        return (unChechShow || newvalNew.isShow) && this.loadRasterLock
    }
    @Watch('wmsOpt')
    onWmsOpt(valNew: any): void {
        // console.log(valNew)
    }

    // 监听当前 map 需要叠加的 layer
    @Getter(GET_MAP_LAYERS, { namespace: 'map' })
    getLayers: LayerTypeEnum[]

    @Watch('getLayers')
    OnLayers(layers: LayerTypeEnum[]): void {
        const mymap = this.$refs.basemap['mapObject']
        // 大致流程:
        // 1- 遍历当前的 valNew (layers)
        //  1-1 先判断当前的 this.windLayer 是否为当前的layers中的layer
        //  1-2 将监听道德layers 放在 this.layers 数组中
        //  1-3 之后每次再加载进行将当前的传入 layers(vuex中的) 与 this.layers 进行对比，去掉没有的layers(from map)
        // 2- 加载当前 layers 至map
        const loseWindLayer = false
        const loseCurrentLayer = false
        // 记录一下上一次操作时的 layer 种类数组(不可修改)
        const lastExistLayers: LayerTypeEnum[] = this.existLayers
        // 20-07-27 新加入的步骤是对于上一次的 layer type 本次缺失的进行剔除操作
        lastExistLayers.forEach((lastLayer) => {
            if (layers.findIndex((temp) => temp === lastLayer) < 0) {
                // 说明没有
                if (lastLayer === LayerTypeEnum.GROUP_PATH_LAYER) {
                    const tempTyGroupOptions = { ...this.tyGroupOptions }
                    tempTyGroupOptions.isShow = false
                    this.tyGroupOptions = tempTyGroupOptions
                } else if (
                    [
                        LayerTypeEnum.STATION_ICON_LAYER,
                        LayerTypeEnum.STATION_ICON_FIELD_LAYER,
                        LayerTypeEnum.STATION_ICON_MAX_LAYER,
                        LayerTypeEnum.STATION_ICON_STATIC_LAYER // - 22-04-21 注意需要加入静态station的判断
                    ].includes(lastLayer)
                ) {
                    this.stationSurgeIconOptions.isShow = false
                } else if (lastLayer === LayerTypeEnum.RASTER_MAX_SURGE_LAYER) {
                    this.tyMaxSurgeOptions.isShow = false
                } else if (lastLayer === LayerTypeEnum.RASTER_HOURLY_SURGE_LAYER) {
                    this.tyFieldOptions.isShow = false
                }
                // TODO:[-] 22-01-10 注意此处判断的不仅仅是 GT05
                // else if (lastLayer === LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT05) {
                //     this.tyProSurgeOptions.isShow = false
                // }
                else if (
                    [
                        LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT05,
                        LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT10,
                        LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT15,
                        LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT20,
                        LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT25,
                        LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT30
                    ].includes(lastLayer)
                ) {
                    this.tyProSurgeOptions.isShow = false
                }
            }
        })
        // 先清除 this.existLayers
        this.existLayers = []
        layers.forEach((tempLayerType) => {
            switch (tempLayerType) {
                case LayerTypeEnum.GROUP_PATH_LAYER:
                    this.existLayers.push(tempLayerType)
                    const tempTyGroupOptions = { ...this.tyGroupOptions }
                    tempTyGroupOptions.isShow = true
                    this.tyGroupOptions = tempTyGroupOptions
                    break
                case LayerTypeEnum.STATION_ICON_STATIC_LAYER:
                    // LayerTypeEnum.STATION_ICON_FIELD_LAYER |
                    // LayerTypeEnum.STATION_ICON_MAX_LAYER:
                    this.existLayers.push(tempLayerType)
                    this.stationSurgeIconOptions.isShow = true
                    this.stationSurgeIconOptions.layerType = tempLayerType
                    break
                case LayerTypeEnum.STATION_ICON_FIELD_LAYER:
                    this.existLayers.push(tempLayerType)
                    this.stationSurgeIconOptions.isShow = true
                    this.stationSurgeIconOptions.layerType = tempLayerType
                    break
                case LayerTypeEnum.STATION_ICON_MAX_LAYER:
                    this.existLayers.push(tempLayerType)
                    this.stationSurgeIconOptions.isShow = true
                    this.stationSurgeIconOptions.layerType = tempLayerType
                    break
                case LayerTypeEnum.RASTER_MAX_SURGE_LAYER:
                    this.existLayers.push(tempLayerType)
                    this.tyMaxSurgeOptions.isShow = true
                    break
                case LayerTypeEnum.RASTER_HOURLY_SURGE_LAYER:
                    this.existLayers.push(tempLayerType)
                    this.tyFieldOptions.isShow = true
                    break
                // TODO:[-] 21-08-13 注意修改此处
                default:
                    if (tempLayerType in SurgeProLayerEnum) {
                        this.existLayers.push(tempLayerType)
                        this.tyProSurgeOptions.isShow = true
                        this.tyProSurgeOptions.layerType = tempLayerType
                        break
                    }
            }
        })
    }

    @Getter(GET_RASTER_LAYER_KEY, { namespace: 'map' })
    getRasterLayerType: RasterLayerEnum

    /** 监听 store -> GET_RASTER_LAYER_KEY 监听 raster layer 是否发生变化 */
    @Watch('getRasterLayerType')
    OnRasterLayerType(val: RasterLayerEnum): void {
        // 监听到 raster layer 的显示设置发生变化 -> tyMaxSurgeOptions & tyFieldOptions & tyProSurgeOptions
        this.tyMaxSurgeOptions.rasterLayerType = val
        this.tyFieldOptions.rasterLayerType = val
        this.tyProSurgeOptions.rasterLayerType = val
    }

    // TODO:[-] 21-06-09
    @Debounce(700)
    @Watch('zoom')
    OnZoom(valNew: number, valOld: number): void {
        // 使用此种方式实现对于平移触发 -> update:zoom 相同值的过滤
        console.log(`限流防抖,zoom:${valNew}`)
        if (valNew < 8 && valOld === DEFAULT_ZOOM_LEVEL) {
            this.zoomLevel = 5
        } else if (valNew === 8) {
            this.zoomLevel = 5
        } else if (valNew === 9) {
            this.zoomLevel = 5
        } else if (valNew === 10) {
            this.zoomLevel = 10
        } else if (valNew === 11) {
            this.zoomLevel = 11
        } else if (valNew > 10 && valOld === DEFAULT_ZOOM_LEVEL) {
            this.zoomLevel = 11
        }
    }

    @Debounce(700)
    testdebounce(val: number) {
        console.log(`限流防抖:${val}`)
    }

    // + 21-08-23 监听底图key
    @Getter(GET_BASE_MAP_KEY, { namespace: 'map' }) getBaseMapKey

    @Watch('getBaseMapKey')
    onBaseMapKey(val: MapLayerEnum): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        switch (true) {
            // case val === MapLayerEnum.SATELITE_MAP:
            //     this.url = `https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=${MAPTITLELAYER_TOKEN_KEY}`
            case val === MapLayerEnum.SATELITE_MAP:
                this.url = `https://api.maptiler.com/maps/afe4e54b-c07b-4042-b750-6a83214d0096/{z}/{x}/{y}.jpg?key=${MAPTITLELAYER_TOKEN_KEY}`

                // this.getMapBoxLayerClass('0TuB9SR4KyaoCi4FUrPM').addTo(mymap)
                break
            case val === MapLayerEnum.SIMPLE_MAP:
                // 使用 geoq 的底图
                this.url =
                    'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
                break
        }
    }

    @Watch('zoomLevel')
    onZoomLevel(val: number): void {
        const that = this
        // TODO:[-] 21-08-16 注意监听 zoom 只需要判断 stationSurgeOptions 即可
        // + 22-02-11 加入了非 静态station icon 的判断，对于静态station icon 不需要根据zoom进行更新
        if (
            that.checkStationSurgeOptions(this.stationSurgeIconOptions) &&
            this.stationSurgeIconOptions.layerType !== LayerTypeEnum.STATION_ICON_LAYER
        ) {
            that.loadStationIconsByZoom(val, that.currentStationSurgeList)
        }
    }

    zoomUpdated(valNew: number, valOld: number): void {
        this.zoom = valNew
        // console.log(`new:${valNew}|old:${valOld}`)
    }

    get getTyGroupOptions(): ITyGroupPathOptions {
        return { ...this.tyGroupOptions }
    }

    get getStationOptions(): { stationCode: string; stationName: string } {
        const { stationCode, stationName } = this
        return { stationCode, stationName }
    }

    // + 22-03-28 compute 计算属性—— 获取是否显示海洋站的标识
    get isStationSurgeShow(): boolean {
        // this.setShowStationIcon(this.stationSurgeIconOptions.isShow)
        return this.stationSurgeIconOptions.isShow
    }

    @Watch('getStationOptions')
    onStationOptions(val: { stationCode: string; stationName: string }): void {
        this.$message(`加载台站:${val.stationName}`)
    }
}
</script>
<style lang="less">
// TODO:[*] 19-11-13 注意引入less时不需要加.less后缀
@import '../../../styles/base';
@import '../../../styles/map/my-leaflet';
@import './style/arrow';
// @import './style/typhoon';
@import '../../../styles/typhoon/typhoonDivIcon';

// + 21-04-28 引入 针对 station surge div Icon 的样式
@import '../../../styles/station/icon';
// + 21-12-06 加入重写的 emelemtnui 样式
@import '../../../styles/my-elementui/common';
// + 22-06-06 引入格点数据图层的样式
@import './style/isosurface';
// TODO:[-] 21-06-10 TEST 加入了关于 mybasemap 的测试样式
// #mybasemap {
//     height: 1%;
// }
.test {
    color: #1abc9cb4;
}

#rescue_map {
    /* height: 100%; */
    /* display: flex;
  flex-direction: column; */

    .vue2leaflet-map {
        // TODO:[-] 20-08-07 若使用自己发的地图服务可以使用此空缺配色
        // background: #bdc3c7;
    }
    @center();
    // @test();
    // display: flex;
    // flex: 22;
    // height: 86vh;
    /* width: 1500px;
  height: 700px; */
    /* background: #2a79d4; */

    // 左侧的切换按钮
    .left-top-select {
        position: absolute;
        top: 20px;
        left: 50px;
        z-index: 1500;
        display: flex;
    }

    #toolbar_btns {
        position: absolute;
        top: 17em;
        // left: 10em;
        z-index: 1500;
        width: 70%;
    }

    // TODO:[-] 20-07-13 由于右侧信息栏要隐藏，所以禁用了滚动条
    overflow: hidden;
}

#map_content {
    // 此处放在base.less中的@centermap中
    // padding: 10px;
    flex: 5;
    display: flex;
    flex-direction: column;
    // 留出右侧的 信息栏 的位置
    // margin-right: 50px;
    @centermap();

    #process {
        display: flex;
        z-index: 1500;
        width: 100%;

        .progress {
            width: 100%;
        }

        // margin-right: 10rem;
        // position: absolute;
        // bottom: 8rem;
        // left: 12rem;
        // width: 15em;
    }

    // TODO:[-] 20-06-18 添加的 overlayer 的样式
    .leaflet-control-layers-list label {
        color: black !important;
    }

    // 20-08-04 覆盖一下leaflet的control-zoom 样式
    .leaflet-control-container {
        .leaflet-top {
            top: 60px;
        }
    }
}

#right-bar {
    // 不再需要 右侧信息栏 占位，
    // flex: 1;
    // margin-right: 10px;
    // padding: 10px;
    // padding-top: 10px;

    // position: absolute;
    // right: 10px;
    z-index: 1999;
    // width: 300px;
    // top: 70px;
    /* background: rgba(188, 143, 143, 0.507); */
}

#rescue_map .vue2leaflet-map {
    /* display: flex;
  flex-direction: column;
  flex: 24; */
    display: flex;
    flex: 1;
    /* 底部圆角 */
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

// 加载散点的进度条

// 地图页面的打点功能
#bottom_btn_make_point {
    position: absolute;
    z-index: 1500;
    bottom: 7rem;
    left: 0.5rem;
}

.oil_icon_default {
    width: 750px !important;
    z-index: 1700 !important;
}

#oil_div {
    z-index: 2000;
}

.card-header {
    text-align: center;
    text-shadow: 2px 2px 10px grey;
}

.row {
    text-align: center;
    text-shadow: 2px 2px 10px grey;
    margin-bottom: 10px;
}

/* 注意card有一个左右15px的padding */
.card {
    padding-left: 0px;
    padding-right: 0px;
}

.my_primary {
    color: white;
    background-color: #007bff;
}

.my_success {
    color: white;
    background-color: #28a745;
}

.my_info {
    color: white;
    background-color: #17a2b8;
}

.my_danger {
    color: white;
    background-color: #dc3545;
}

.typhoon_footer .columnar {
    display: flex;
    width: 50%;
    flex-direction: column;
    border-right: 1px solid #0000ff;
}

.typhoon_footer .columnar .main_val {
    display: flex;
    justify-content: center;
    width: 100%;
    text-align: center;
    font-size: 20px;
}

.typhoon_footer .columnar .vice_vak {
    display: flex;
    width: 100%;
    justify-content: center;
    text-align: center;
    font-size: 0.625rem;
}

// TODO:[-] 20-07-08 自定义的 layer control 样式
.leaflet-control-layers-toggle {
    // background: aqua;
}

.leaflet-control-layers-expanded {
    background: linear-gradient(to right, #1a6865 30%, rgba(4, 107, 114, 0.639));
    font-size: 90%;
    text-shadow: 2px 2px 8px #212020;

    span {
        color: #fff !important;
        font-size: 130%;
        text-align: left;
    }
}

// TODO:[-] 20-07-14 新加入的 左侧工具栏
#ocean-main-toolsbar {
    position: absolute;
    left: 60px;
    top: 300px;
    z-index: 1500;
}

// TODO:[-] 20-07-15 加入了用来覆盖 脉冲icon的样式,暂时不再使用,因为无法修改其的偏移
.leaflet-pulsing-icon {
    margin-left: -0px !important;
    margin-top: -0px !important;
}

// .my-marker {
//     .my-leaflet-pulsing-icon {
//         width: 12px;
//         height: 12px;
//         border-radius: 100%;
//         -webkit-box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);
//         box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);
//         background: #76eec6;
//     }
// }

// TODO:[-] 20-07-17 新修改的 右侧工具栏
#right_opt_toolsbar {
    position: absolute;
    right: 50px;
    top: 300px;
    z-index: 1500;
}

#my-test {
    background: #76eec6;
}
</style>
