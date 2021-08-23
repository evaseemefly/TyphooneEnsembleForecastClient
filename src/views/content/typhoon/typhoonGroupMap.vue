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
                <l-tile-layer :url="url"></l-tile-layer>
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

                <!-- TODO:[-] 20-08-07 加入预报区域的线段(非多边形，因为很多情况无法闭合) -->
                <l-polyline
                    :lat-lngs="currentPolyLine.latlngs"
                    :fill="false"
                    :color="currentPolyLine.style.color"
                    :stroke="currentPolyLine.style.stroke"
                    :opacity="currentPolyLine.style.opacity"
                ></l-polyline>
                <!-- TODO:[-] 20-08-11 加入的风场的预报区域的线段 -->
                <l-polyline
                    :lat-lngs="windPolyLine.latlngs"
                    :fill="false"
                    :color="windPolyLine.style.color"
                    :stroke="windPolyLine.style.stroke"
                    :opacity="windPolyLine.style.opacity"
                ></l-polyline>
                <!-- ------------------- -->
                <l-polyline
                    :lat-lngs="polyline.latlngs"
                    :fill="false"
                    :color="polyline.color"
                ></l-polyline>
                <!-- <l-marker :lat-lng="makerLatlng"></l-marker> -->
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
                :timeStampStr="timestampStr"
                :forecastDt="targetDate"
            ></BottomMainBar>
            <div id="process">
                <!-- TODO:[-] 20-01-27 使用eu的进度条 -->
                <!-- <el-progress
          :text-inside="true"
          :stroke-width="18"
          :percentage="processOptions.rate"
        ></el-progress> -->
                <!-- 使用bt的进度条 -->
                <!-- <div
          class="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          aria-valuenow="{{processOptions.rate}}"
          aria-valuenow="0"
          aria-valuenow="100"
          style="width: 75%"
        ></div> -->
                <!-- 使用bootstrap-vue的组件 -->
                <b-progress
                    :value="processOptions.rate"
                    :max="100"
                    show-progress
                    animated
                ></b-progress>
            </div>
        </div>
        <div id="ocean-main-toolsbar">
            <OceanMainToolsBar></OceanMainToolsBar>
        </div>
        <!-- <div id="right_opt_toolsbar"> -->
        <div id="right-bar">
            <!-- 19-10-28 加入右侧信息栏_v1版本 -->
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
                :timeStamp="tyTimeStamp"
            ></OilRightBar>

            <!-- TODO:[-] 20-07-17 使用统一风格后的 右侧信息栏 -->
            <!-- <RightOptToolsBar></RightOptToolsBar> -->
        </div>
        <!-- TODO:[-] 20-07-14 去掉了地图点选功能 -->
        <!-- <div id="bottom_btn_make_point">
            <MakePointBtn></MakePointBtn>
        </div> -->
        <div class="left-top-select">
            <!-- <OilFactorSelect></OilFactorSelect> -->
            <CurdBtn :caseList="caseList"></CurdBtn>
        </div>
        <!-- TODO:[-] 20-01-27 在地图页面加入创建等的btn -->
        <div id="toolbar_btns">
            <!-- <CurdBtn></CurdBtn> -->
        </div>

        <div class="dialog-create-case">
            <CreatedCaseForm ref="caseForm"></CreatedCaseForm>
        </div>
        <CreateCaseForm></CreateCaseForm>
        <!-- TODO:[-] 21-05-24 加入右侧 station bar -->
        <!-- <RightStationBar></RightStationBar> -->
        <!-- <div class="">
            <GridDetailForm ref="gridForm"></GridDetailForm>
        </div> -->
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, State, namespace } from 'vuex-class'
import { mixins } from 'vue-class-component'
import { Debounce } from 'vue-debounce-decorator'
import * as L from 'leaflet'
import 'leaflet-velocity'
import _ from 'lodash'
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
    LWMSTileLayer
    // LeafletHeatmap
} from 'vue2-leaflet'
// import LeafletHeatmap from "vue2-leaflet-heatmap";

// github:https://github.com/Leaflet/Leaflet.heat
// npm:https://www.npmjs.com/package/leaflet.heat
// import {}  "leaflet.heat";
// 注意此处的引用方式，极其蛋疼
import HeatmapOverlay from 'heatmap.js/plugins/leaflet-heatmap'
// TODO:[-] 21-04-20 加入的 scaleColor
import { ScaleColor, TyGroupPathScaleColor } from '@/common/scaleColor'
// 此种方式较为繁琐：https://www.patrick-wied.at/static/heatmapjs/example-heatmap-leaflet.html
import 'heatmap.js'
import moment from 'moment'
// 各类组件
import TimeBar from '@/views/members/bar/TimeBar.vue'
import RightDetailBar from '@/views/members/bar/rightBarDetail.vue'
import RightOilBar from '@/views/members/bar/rightOilBar.vue'
// 屏幕右侧的各类信息栏
import OilRightBar from '@/views/bar/oilRightBar.vue'
// import OilFactorSelect from '@/views/members/select/OilFactorSelect.vue'
import CreatedCaseForm from '@/views/members/form/create_case/CreateCaseForm.vue'
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

// + 21-07-01 加入了 createCaseForm
import CreateCaseForm from '@/components/form/CreateCaseForm.vue'
// -----
// 各api
import { loadOilSpillingAvgRealData, getTargetCodeDateRange } from '@/api/api'
import { loadFieldSurgeTif } from '@/api/geo'

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
import { IconFormMinStationSurgeMidModel } from '@/middle_model/station'
import { getDaysNum } from '@/common/date'

// 各类工具类
import { clearRasterFromMap } from '@/util/map'

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
import { OilFactor, ShowType } from '@/enum/OilSelect'
// 20-10-23 产品种类
import { ProductEnum } from '@/enum/dict'
import { AreaEnum } from '@/enum/area'
import { CoverageMin } from '@/views/content/oilspilling/coverage'
// + 21-01-27 引入 提取到外侧的 mixin const wms
import { WMSMixin } from '@/views/content/oilspilling/mixin/constWMS'
import { CommonOptMixin } from '@/views/content/oilspilling/mixin/constOpt'
import { ConstantMixin } from '@/views/content/oilspilling/mixin/constant'
import { TestMixin } from '@/views/content/oilspilling/mixin/testMixin'
import { ConstArrowMixin } from '@/views/content/oilspilling/mixin/constArrow'
import { WFSMixin } from '@/views/content/oilspilling/mixin/wfsMixin'
// TODO:[*] 21-03-10 加入的海浪等值线测试 mixin
// import { WaveMixin } from '@/views/content/oilspilling/mixin/testWaveMixin'
// + 21-03-24 修改后的 海浪 等值线
import { WaveMixin } from '@/views/content/oilspilling/mixin/waveMixin'
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
    ProSurgeGeoLayerByGeotiffjsWay2
} from '@/views/content/typhoon/raster'
// TODO:[*] 21-04-28 + 脉冲 icon 用来示意海洋站所在位置
import {
    IconCirlePulsing,
    IconMinStationSurge,
    IconTyphoonCirlePulsing
} from '@/views/members/icon/pulsingIcon'
import { WindArrow } from '@/views/content/oilspilling/arrow'
// + 21-03-24 海浪等值线绘制类
import { WaveContourLine, WaveArrow } from '@/views/content/oilspilling/wave'
import { StationSurge, IToHtml } from './station'
// + 21-05-18 新加入的关于 tyGroupPath 相关的 逻辑封装类
import { TyGroupPath, getTyCenterGroupDiffLayer } from './typhoonGroup'
// 引入枚举
import { DictEnum } from '@/enum/dict'
import { LayerTypeEnum, SurgeProLayerEnum, MapLayerEnum } from '@/enum/map'

// api
// + 21 typhoon api
import { getTargetTyGroupComplexModel } from '@/api/tyhoon'
// 21-04-28 + station api
import { getStationListByGroupPath, getStationSurgeRangeListByGroupPath } from '@/api/station'
// STORE 常量
import {
    GET_MAP_NOW,
    GET_CREATE_OIL_CASE_MODAL,
    GET_CREATE_FORM,
    GET_CURRENT_LATLNG,
    GET_GEO_COVERAGETYPE,
    GET_MAP_LAYERS,
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
    // + 21-08-19 color scale相关
    GET_SCALE_KEY,
    SET_SCALE_KEY,
    SET_SCALE_RANGE,
    GET_BASE_MAP_KEY // + 21-08-23 监听切换地图的 baseMapKey
} from '@/store/types'
import {
    DEFAULT_LAYER_ID,
    DEFAULT_TYPHOON_CODE,
    DEFAULT_TYPHOON_ID,
    DEFAULT_TYPHOON_GROUP_PATH_ID
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
        TimeBar,
        RightDetailBar,
        RightOilBar,
        OilRightBar,
        CurdBtn,
        CreatedCaseForm,
        // MakePointBtn,
        OceanMainToolsBar,
        RightOptToolsBar,
        BottomMainBar,
        // + 21-05-24 新加入的 右侧显示 测站历史数据曲线的 charts
        RightStationBar,
        CreateCaseForm
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
    WaveMixin,
    WFSMixin
) {
    mydata: any = null
    code = DEFAULT
    zoom = DEFAULT_ZOOM_LEVEL
    center: number[] = [22.45, 113.8833]
    // TODO:[-] 20-11-09 新加入的 map 相关的一些基础静态配置
    mapOptions: {} = {
        preferCanvas: true,
        minZoom: 6,
        // 可缩放的最大 level
        maxZoom: 11,
        // 目前已经使用了 canvas 渲染
        render: L.canvas()
    }
    isZoomLock = false
    coverageUrl = ''
    makerLatlng = [0, 0]
    // TODO:[-] 21-01-06 初始位置，加载 case 后将case的初始位置赋值于此
    initialLatLng = [0, 0]
    // TODO:[*] 19-10-31 由于设置类型为any，且赋值为null，引发的子组件在为null的情况下未渲染
    oilAvgRealData: OilMidModel = new OilMidModel()
    // TODO:[-] 20-06-21 批量添加通过 group 的方式进行添加
    layerGroupScatters: any = null
    // 21-01-04 由 layerScatterMarkersGroups 替代了，因为是分页加载散点
    // layerGroupTemp: any = null
    layerScatterMarkersGroups: L.Layer[] = []
    oilHeatmapList: any[] = []
    polyline: {
        latlngs: []
        color: string
    } = {
        latlngs: [],
        color: 'yellow'
    }

    // 20-08-09 + 当前选中的coverageInfos
    // coverageInfoList: { coverageArea: number; coverageType: number }[] = []

    // 预报区域(线,非多边形)
    currentPolyLine: IPolyLine = {
        latlngs: [
            [41.0, 129.836],
            [41.0, 133.0],
            [22.2, 133.0],
            [22.2, 120.8931],
            [22.2, 120.6888],
            [22.2, 114.2333]
        ],
        style: {
            stroke: true,
            opacity: 0.7,
            color: '#16a085'
        }
    }

    // 20-08-11 风场预报区域
    windPolyLine: IPolyLine = {
        latlngs: [
            [0.0, 100.0],
            [0.0, 150.0],
            [50.0, 150.0],
            [50.0, 100],
            [0.0, 100.0]
        ],
        style: {
            stroke: true,
            opacity: 0.7,
            color: '#f39c12'
        }
    }
    // TODO:[-] 20-05-26 maker icon 样式
    icon_marker = L.icon({
        iconUrl: '/leaflet/images/marker-icon.png',
        iconSize: [32, 37],
        iconAnchor: [16, 37] // 防止地图缩放时产品偏移，需固定绝对位置
    })
    // TODO:[*] 20-07-15 新加入的关于点选位置添加在地图中的 markers
    iconMySelectedMarker: L.Marker = null
    iconMySelectedGisFormMarker: L.Marker = null
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
    // TODO:[-] 21-04-05 + 当前的 海浪-海表面高度 LayerId
    waveWveRasterLayerId: number = DEFAULT_LAYER_ID
    // TODO:[*] 20-10-22 + 缩放等级
    zoomLevel = 7
    // 用于动态加载的 wms 的 ws 的str
    wmsWorkSpace = ''
    layerControl: any = null
    // TODO:[-] + 21-08-05 新加入的全局唯一的 栅格layer
    uniqueRasterLayer: L.Layer = null
    // TODO:[*] 20-07-27 记录当前 add layers to map 时的 layers种类数组
    existLayers: LayerTypeEnum[] = []
    // TODO:[-] 20-06-20 加入的是否分页的标识符
    isPagination = true
    // 创建大量散点使用 add layerGroup 的方式添加，记录 group 的 id
    layerGroupId: number = DEFAULT_NUMBER
    layerGroupIds: number[] = []

    // TODO:[-] 21-04-21 与台风业务相关的 data
    tyGroupLineList: TyphoonComplexGroupRealDataMidModel[] = []
    tyGroupPolyLine = {
        latlngs: [],
        color: 'yellow'
    }
    // TODO:[-] + 21-05-31 中间路径的 cirleLayers 集合
    tyGroupCenterCirleLayers: L.Layer[] = []
    // TODO:[-] + 21-05-12 台风集合预报路径的概率半径集合 24: 60, 48:100,72:120,96:150,120:180
    tyGroupProPathCircles: { lat: number; lon: number; radius: number }[] = []
    // 当前的大风半径范围
    currentGaleRadius: L.Circle = null
    // group_ty_range
    // 台风大风半径的范围
    // 当前显示的 台风realdata div icon
    tyRealDataDivIcon: L.Marker = null

    // + 21-05-10 当前的 逐时风暴增水场 layer，每次切换时会替换，且从 map 中清除
    fieldSurgeRasterLayer: L.Layer = null

    // TODO:[-] + 21-08-02 加入的 风暴最大增水场 layer
    maxSurgeRasterLayer: L.Layer = null
    // + 21-05-14 当前的预报时间
    forecastDt = new Date('2020-09-15T18:00:00Z')
    // + 21-05-14 当前选定的
    // TODO:[*] 21-07-28 将 gpId 放在 tyGroupOptions 中
    // gpId = DEFAULT_TYPHOON_GROUP_PATH_ID
    tyCode = DEFAULTTYCODE
    tyTimeStamp = DEFAULTTIMESTAMP
    stationCode = 'SHW'
    // + 21-05-15 脉冲 groupLayer
    groupLayerSurgePulsing: L.LayerGroup = null

    // + 21-05-15 台站 div groupLayer
    groupLayerSurgeStationDivForm: L.LayerGroup = null
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
        isShow: DefaultTyGroupPathOptions.isShow,
        layerType: DefaultTyGroupPathOptions.layerType,
        gpId: DEFAULT_TYPHOON_GROUP_PATH_ID
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
        tyCode: this.tyCode,
        tyTimeStamp: this.tyTimeStamp,
        forecastDt: new Date(),
        scaleList: DEFAULT_COLOR_SCALE.scaleColorList
    }
    // TODO:[-] 21-08-12 新增的 概率增水配置
    tyProSurgeOptions: ITyProLayerOptions = {
        isShow: false,
        layerType: LayerTypeEnum.UN_LAYER,
        tyCode: this.tyCode,
        tyTimeStamp: this.tyTimeStamp,
        pro: 0.5,
        scaleList: DEFAULT_COLOR_SCALE.scaleColorList
    }

    // TODO:[-] 21-06-08 临时的 潮位站 min marker
    stationMinMarker: L.Marker = undefined
    mapBoxlayerOptions: {
        accessToken: 'pk.eyJ1IjoiZXZhc2VlbWVmbHkxIiwiYSI6ImNrcHE4OHJsejBobnoyb3BhOTkwb3MzbGwifQ.5ThyBJrIccBpeVi9pUdJnw'
        style: '/static/mapbox/style/style_210610/style.json'
    }
    // TODO:[-] 21-06-10 配合 mapbox 使用的 mymap
    mymap: L.Map = undefined
    // + 21-07-01 新加入的用来控制是否显示 创建caseForm
    isShowCreateCaseForm = false

    // + 21-07-25 当前选中的 typhoon id，给一个默认值
    selectedTyId: number = DEFAULT_TYPHOON_ID
    getMapBoxLayerClass(key: string): L.TileLayer {
        // return L.mapboxGL({
        //     accessToken:
        //         'pk.eyJ1IjoiZXZhc2VlbWVmbHkxIiwiYSI6ImNrcHE4OHJsejBobnoyb3BhOTkwb3MzbGwifQ.5ThyBJrIccBpeVi9pUdJnw',
        //     style: '/static/mapbox/style/style_210610/style.json'
        // })
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
                                iconAnchor: [-20, 30]
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
        if (this.groupLayerSurgePulsing) {
            mymap.removeLayer(this.groupLayerSurgePulsing)
        }
        if (this.groupLayerSurgeStationDivForm) {
            mymap.removeLayer(this.groupLayerSurgeStationDivForm)
        }

        this.groupLayerSurgePulsing = null
        this.groupLayerSurgeStationDivForm = null
    }

    // + 21-05-20 清除掉 逐时的风暴潮增水栅格图层
    clearSurgeHourlyRasterLayer(): void {
        const that = this
        const mymap: L.Map = this.$refs.basemap['mapObject']
        if (this.fieldSurgeRasterLayer) {
            mymap.removeLayer(that.fieldSurgeRasterLayer)
            this.fieldSurgeRasterLayer = null
        }
    }

    // clear

    loadStationList(zoom: number): void {
        // const zoom = this.zoom
        const that = this
        const mymap: L.Map = this.$refs.basemap['mapObject']
        const surgeArr: number[] = []
        const iconArr: IconCirlePulsing[] = []
        const iconSurgeMinArr: IconMinStationSurge[] = []

        const surgePulsingMarkersList: L.Marker[] = []
        const surgeDataFormMarkersList: L.Marker[] = []
        this.clearSurgeAllGroupLayers()
        getStationSurgeRangeListByGroupPath(
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
                        res.data.forEach((element) => {
                            surgeArr.push(element.surge)
                        })
                        // 获取极值
                        const surgeMax = Math.max(...surgeArr)
                        const surgeMin = Math.min(...surgeArr)
                        res.data.forEach((temp) => {
                            const icon = new IconCirlePulsing({
                                val: temp.surge,
                                max: surgeMax,
                                min: surgeMin
                            })
                            const iconSurgeMin = new StationSurge(
                                temp.name,
                                temp.station_code,
                                that.tyCode,
                                that.tyTimeStamp,
                                that.forecastDt
                            ).getImplements(zoom, {
                                stationName: temp.name,
                                stationCode: temp.station_code,
                                surgeMax: temp.surge_max,
                                surgeMin: temp.surge_min,
                                surgeVal: temp.surge
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
                                iconAnchor: [-20, 30]
                            })

                            const surgePulsingMarker = L.marker(
                                [res.data[index].lat, res.data[index].lon],
                                {
                                    icon: stationDivIcon,
                                    customData: {
                                        name: res.data[index].name,
                                        surge: res.data[index].surge,
                                        surgeMax: res.data[index].surge_max,
                                        surgeMin: res.data[index].surge_min,
                                        stationCode: res.data[index].station_code,
                                        lat: res.data[index].lat,
                                        lon: res.data[index].lon
                                    }
                                }
                            )
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
                                            iconAnchor: [-20, 30]
                                        })
                                        const tempStationSurgeMarker = L.marker(
                                            [customData.lat, customData.lon],
                                            {
                                                icon: stationSurgeMinDivICOn,
                                                customData: customData
                                            }
                                        )
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
                            surgePulsingMarkersList.push(surgePulsingMarker)
                            const stationSurgeIconMarker = L.marker(
                                [res.data[index].lat, res.data[index].lon],
                                {
                                    icon: stationSurgeMinDivICOn,
                                    customData: { stationCode: res.data[index]['station_code'] }
                                }
                            )

                            stationSurgeIconMarker
                                .on('mouseover', (e) => {
                                    // todo:[-] 21-05-15 加入鼠标移入时置顶，移出时恢复之前的 zindex
                                    stationSurgeIconMarker.setZIndexOffset(19999)
                                })
                                .on('mouseout', (e) => {
                                    stationSurgeIconMarker.setZIndexOffset(1999)
                                })
                                .on('click', (e) => {
                                    // that.stationCode = iconSurgeMinArr[index].getStationCode()
                                    // 通过 -> e -> target -> options -> customData -> stationCode
                                    console.log(e)
                                    that.stationCode = e.target.options.customData.stationCode
                                })
                            surgeDataFormMarkersList.push(stationSurgeIconMarker)
                            index++
                        })
                        // 批量生成 marker后统一添加至 map中
                        that.groupLayerSurgePulsing = L.layerGroup(surgePulsingMarkersList).addTo(
                            mymap
                        )
                        that.groupLayerSurgeStationDivForm = L.layerGroup(
                            surgeDataFormMarkersList
                        ).addTo(mymap)
                    }
                }
            }
        )
    }
    testGetAddTyGroupPath2Map(tyId: number): void {
        const that = this
        const arrTyComplexGroupRealdata: Array<TyphoonComplexGroupRealDataMidModel> = []
        // 每次处理签需要先清除当前的 台风集合预报路径概率半径集合
        this.tyGroupProPathCircles = []

        getTargetTyGroupComplexModel(tyId).then((res) => {
            if (res.status === 200) {
                /*
                  area: -1
                  bp: 0
                  is_bp_increase: true
                  list_realdata: (9) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
                    0:
                    bp: 945
                    forecast_dt: "2020-09-15T17:00:00Z"
                    gale_radius: 39
                    gp_id: 1
                    lat: 18.9
                    lon: 119.2
                    ty_id: 1
                  ty_code: "2022"
                  ty_id: 1
                  ty_path_marking: 0
                  ty_path_type: "c"
                  */

                if (res.data.length > 0) {
                    res.data.map(
                        (temp: {
                            area: number
                            bp: number
                            is_bp_increase: boolean
                            list_realdata: Array<{
                                bp: number
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
                        }) => {
                            const arrTyphoonRealdata: Array<TyphoonForecastRealDataMidModel> = []

                            temp.list_realdata.forEach(
                                (tempRealdata: {
                                    bp: number
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
                                            tempRealdata.bp,
                                            tempRealdata.gale_radius
                                        )
                                    )
                                }
                            )
                            const tempComplexGroup = new TyphoonComplexGroupRealDataMidModel(
                                temp.ty_id,
                                temp.ty_code,
                                '',
                                temp.ty_path_marking,
                                temp.ty_path_type,
                                temp.bp,
                                temp.is_bp_increase,
                                arrTyphoonRealdata
                            )
                            arrTyComplexGroupRealdata.push(tempComplexGroup)
                        }
                    )
                }
                // TODO:[-] 21-07-28 此处需要通过将生成的 145 条集合预报路径，找到中心路径，并找到对应的 gp_id
                const centerGroupPath = arrTyComplexGroupRealdata.find((temp) => {
                    return temp.bp === 0 && temp.tyPathMarking === 0 && temp.tyPathType === 'c'
                })
                let centerGpId = DEFAULT_TYPHOON_GROUP_PATH_ID
                if (centerGroupPath) {
                    centerGpId = centerGroupPath.listRealdata[0].gpId
                }
                this.tyGroupOptions.gpId = centerGpId
                this.stationSurgeIconOptions.gpId = centerGpId
                that.tyGroupLineList = arrTyComplexGroupRealdata
                // TODO:[*] ! WARNING 21-05-07 此处注意需要动态的获取 tyTimestamp 与 tyCode
                that.loadTyphoonLine('2022', '2021010416')
                // console.log(arrTyComplexGroupRealdata)
            }
        })
    }

    // + 21-04-20 将 台风 list add to map
    loadTyphoonLine(tyCode: string, tyTimestamp: string): void {
        const that = this
        const mymap: any = this.$refs.basemap['mapObject']
        // 1 从后台读取台风路径信息

        //2 将当前的typhoon_data中获取latlongs
        // 2-2 由于不同的集合路径需要使用不同的颜色区分，此处使用 scale 动态生成，目前只是针对编号进行颜色的过渡依据
        const tyGroupListCount = this.tyGroupLineList.length
        let indexTyGroup = 0
        const polyScaleColor = new TyGroupPathScaleColor(0, tyGroupListCount)
        polyScaleColor.setScale('Viridis')
        // galeRadius sCaleColor
        const galeRadiusScaleColor = new ScaleColor(
            that.tyGroupGaleRadiusRange.min,
            that.tyGroupGaleRadiusRange.max
        )
        let forecastDtStart: Date = undefined
        galeRadiusScaleColor.setScale('Viridis')

        // TODO:[-] 21-05-12 新加入的 对 tyGroupLineList 重新进行排序
        // 此处的排序提取在 this.sortTyGroupLineList ,以下暂时注释掉
        // this.tyGroupLineList = this.tyGroupLineList.sort(
        //     (a, b) => a.tyPathMarking - b.tyPathMarking
        // )
        this.sortTyGroupLineList()

        this.tyGroupLineList.map((temp) => {
            indexTyGroup++
            const polygonPoint: L.LatLng[] = []
            const cirleScaleColor = new ScaleColor(0, temp.listRealdata.length)
            cirleScaleColor.setScale('Viridis')
            let indexDate = 0
            const cirleLayers: L.Layer[] = []

            temp.listRealdata.forEach((tempRealdata) => {
                indexDate++
                const typhoonStatus = new TyphoonCircleStatus(
                    tempRealdata.galeRadius,
                    tempRealdata.bp,
                    tempRealdata.forecastDt,
                    tempRealdata.lat,
                    tempRealdata.lon
                )
                polygonPoint.push(new L.LatLng(tempRealdata.lat, tempRealdata.lon))
                // TODO:[-] 21-05-12 此处加入判断，对于 非中心路径不做 circle 的 push操作
                // 注意! 还需要加入bp==0的判断条件
                if (temp.tyPathType === 'c' && temp.tyPathMarking === 0 && temp.bp === 0) {
                    const circleTemp = L.circle(new L.LatLng(tempRealdata.lat, tempRealdata.lon), {
                        color: cirleScaleColor.getColor(indexDate),
                        // radius: 20
                        weight: typhoonStatus.getWeight(),
                        customData: typhoonStatus,
                        radius: typhoonStatus.getWeight() * RADIUSUNIT,
                        // radius: typhoonStatus.getWeight(),
                        fill: true,
                        fillOpacity: 0.7,
                        //weight: tempTyGroup.radius,
                        opacity: 0.7
                    })
                    // 获取第一个时间作为 预报的起始时间
                    if (indexDate === 1) {
                        forecastDtStart = tempRealdata.forecastDt
                    }
                    // 根据传入的 时间 index 返回当前 dateIndex 对应的 大风概率半径
                    const tempProPathRadius: number = that.getTyProPathRadius(indexDate)
                    if (tempProPathRadius !== 0) {
                        that.tyGroupProPathCircles.push({
                            lat: tempRealdata.lat,
                            lon: tempRealdata.lon,
                            radius: tempProPathRadius
                        })
                    }
                    // + 21-04-21 添加鼠标移入 circle 显示大风半径的功能
                    circleTemp.on('mouseover', (e: any) => {
                        // console.log(e.target)
                        // 对于移入的 circle 先进行加粗突出显示
                        const layer = e.target
                        layer.setStyle({
                            opacity: 1
                            // weight: layer.options.weight * 1.25
                            // radius:
                        })
                        const customData: { bp: number; radius: number } =
                            e.target.options.customData
                        // 获取半径
                        const targetRadius = customData.radius
                        const coords: L.LatLng = e.latlng
                        /*
                        大体逻辑:
                            -1 根据当前传入的 circle index 找到对应 group -> realdata
                            -2 根据对应的 realdata 获取当前的 radius
                            -3 根据经纬度画圆
                        */
                        // radius 单位为 m ，需要乘以系数 1000m = 1km 为基本单位
                        const radiusUnit = 1000
                        that.currentGaleRadius = L.circle(coords, {
                            radius: targetRadius * radiusUnit,
                            fillColor: galeRadiusScaleColor.getColor(targetRadius),
                            color: galeRadiusScaleColor.getColor(targetRadius),
                            weight: 2,
                            fillOpacity: 0.5
                        }).addTo(mymap)
                        // + 21-04-22 鼠标移入当前 circle 显示该 divIcon
                        that.addTyphoonRealDataDiv2Map(typhoonStatus)
                    })

                    circleTemp.on('mouseout', (e) => {
                        // console.log(e)
                        const layer = e.target
                        layer.setStyle({
                            opacity: 0.7
                            // weight: layer.options.weight / 1.25
                        })
                        // TODO:[-] 21-05-31 此部分由 this.clearTyRealDataLayer 替代
                        // mymap.removeLayer(that.currentGaleRadius)
                        // // + 21-04-22 移除 当前的 tyDivIcon
                        // if (that.tyRealDataDivIcon) {
                        //     mymap.removeLayer(that.tyRealDataDivIcon)
                        // }
                        // that.currentGaleRadius = null
                        that.clearTyRealDataLayer()
                    })
                    // + 21-05-07 加入鼠标click 事件
                    circleTemp.on('click', (e: any) => {
                        // e.target -> options -> customData
                        console.log(e.target)
                        // 点击向后台发送 获取逐时风暴增水场的请求
                        // 请求参数包含 ty_code | ty_timestamp | forecast_dt
                        const params: { forecastDt: Date } = e.target.options.customData
                        const fieldSurgeGeoLayer = new FieldSurgeGeoLayer({
                            tyCode: tyCode,
                            tyTimestamp: tyTimestamp,
                            forecastDt: params.forecastDt
                        })
                        if (that.fieldSurgeRasterLayer) {
                            mymap.removeLayer(that.fieldSurgeRasterLayer)
                            that.fieldSurgeRasterLayer = null
                        }
                        // ERROR：
                        //  'await' expressions are only allowed within async functions and at the top levels of modules.
                        fieldSurgeGeoLayer
                            .add2map(mymap, () => {})
                            .then((res) => {
                                console.log(res)
                                that.fieldSurgeRasterLayer = res
                            })
                    })
                    circleTemp.setStyle({ zIndexOffset: 19999 })
                    cirleLayers.push(circleTemp)
                }
            })

            // 添加折线
            const polyColor = polyScaleColor.getColor(indexTyGroup)
            // 设置鼠标移入时触发的事件
            // 为当前 线段添加 自定义 data
            let groupPolyLine = L.polyline(polygonPoint, {
                color: polyColor,
                opacity: 0.2,
                fillOpacity: 0.2,
                weight: 3,
                customData: indexTyGroup
            })
            if (temp.tyPathType === 'c' && temp.tyPathMarking === 0 && temp.bp === 0) {
                // groupPolyLine.options['weight'] = 5
                groupPolyLine = L.polyline(polygonPoint, {
                    color: polyColor,
                    opacity: 1,
                    weight: 6,
                    fillOpacity: 1,
                    customData: indexTyGroup,
                    smoothFactor: 3
                })
                // TODO:[*] 21-05-13 尝试修改 zindex
                // 方式1:
                // groupPolyLine.setStyle({ zIndexOffset: 19999 })
                groupPolyLine.options['zIndexOffset'] = 19999
                // groupPolyLine.setZIndexOffset(19999)
            }
            // TODO:[-] 21-04-21 此处尝试将同一个 集合路径的 折线 + points 统一 add -> groupLayer
            // 目前看均无法设置 折线的 zindex
            if (temp.tyPathType === 'c' && temp.tyPathMarking === 0 && temp.bp === 0) {
                // groupPolyLine.setStyle({ zIndex: 9999 })
                // groupPolyLine.setStyle({ zIndexOffset: 9999 })
                groupPolyLine.addTo(mymap)
                // TODO:[-] 21-05-12 尝试只针对折线 修改其 zindex

                // .setZIndex(19999)
                // // .on('mouseover', (event: any) => {
                // //     console.log(event)
                // // })
                // .addTo(mymap)
                let tempLayer = L.layerGroup([...cirleLayers])
                tempLayer = tempLayer.setZIndex(9999)
                // tempLayer.setStyle({ zIndexOffset: 9999 })
                tempLayer.addTo(mymap)
                console.log(tempLayer)
            } else {
                let tempLayer = L.layerGroup([...cirleLayers])
                tempLayer = tempLayer.setZIndex(2000)
                tempLayer.addTo(mymap)
                groupPolyLine.addTo(mymap)
                // console.log(tempLayer)
            }

            // TODO:[-] + 21-05-31 只有 center 路径 cirleLayers.length > 0,将 center 路径赋值给 this.tyGroupCenterCirleLayers
            if (cirleLayers.length > 0) {
                that.tyGroupCenterCirleLayers = cirleLayers
            }
        })
        this.addTyGroupProPathCircles()
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
            L.layerGroup([...cirleLayers]).addTo(mymap)
        }
    }

    // + 21-04-22 将 台风实时圆 add to map
    addTyphoonRealDataDiv2Map(tyRealDataCircle: TyphoonCircleStatus): void {
        const myself = this
        const mymap: any = this.$refs.basemap['mapObject']
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
        myself.tyRealDataDivIcon = typhoonDivIconTarget
    }

    // 根据传入的 时间 index 返回当前 dateIndex 对应的 大风概率半径
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
    // TODO:[*] 21-08-15 需要加入差值
    addTyTargetDtRealData2Map(targetDt: Date): void {
        const that = this
        const mymap: any = this.$refs.basemap['mapObject']
        this.clearTyRealDataLayer()
        // TODO:[-] 21-08-15 此处需要加入差值，若未存在对应时间的 layer , 则需要手动找到差值后的对象
        // const targetCircle: L.Layer = this.tyGroupCenterCirleLayers.find((temp) => {
        //     return temp.options.customData.forecastDt - targetDt === 0
        // })
        // const targetCircle: L.Layer = getTyCenterGroupDiffLayer(
        //     this.tyGroupCenterCirleLayers,
        //     targetDt
        // )
        const diffCustomData:
            | {
                  bp: number
                  radius: number
                  lat: number
                  lon: number
                  forecastDt: Date
              }
            | undefined = getTyCenterGroupDiffLayer(this.tyGroupCenterCirleLayers, targetDt)
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
            // TODO:[-] 21-08-13 对于当前台风位置的脉冲icon
            const tyCirleIcon = new IconTyphoonCirlePulsing({
                val: 10,
                max: tyMax,
                min: tyMin
            })
            const tyDivIcon = L.divIcon({
                className: 'surge_pulsing_icon_default',
                html: tyCirleIcon.toHtml()
            })
            const tyPulsingMarker = L.marker([customData.lat, customData.lon], {
                icon: tyDivIcon
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
            that.addTyphoonRealDataDiv2Map(typhoonStatus)
        }
    }

    // TODO:[-] + 21-05-31 去掉
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

    // 根据 leaflet_id -> map.removce(layer)
    clearLayerById(id: number): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        mymap.eachLayer((layer: L.Layer) => {
            if (layer._leaflet_id === id) {
                mymap.removeLayer(layer)
            }
        })
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

    // 20-08-12 监听 当前的 targetOilModelData 的变化，若发生变化后则更新 自定义的 位置 marker
    @Watch('targetOilModelData')
    onOilModelData(res: CaseOilModel): void {
        // 21-01-06 监听到 当前的 oilModelData变化后，将lat,lon 赋值给 this.initialLatlng
        this.setLatlng([res.lat, res.lon])
        this.setInitialLatlng([res.lat, res.lon])
        this.addPositionMarker2Map([res.lat, res.lon])
    }

    addPositionMarker2Map(latlon: number[]): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        this.makerLatlng = latlon
        // TODO:[-] 20-07-15 暂时注释掉 pulse icon 因为会出现偏移
        // const iconMarker = L.icon.pulse({ iconSize: [12, 12], color: 'red' })
        // L.marker(valNew, { icon: iconMarker }).addTo(mymap)

        if (this.iconMySelectedMarker !== null) {
            mymap.removeLayer(this.iconMySelectedMarker)
            mymap.removeLayer(this.iconMySelectedGisFormMarker)
        }
        const myIcon = new CustomerMarker()
        const myIconGisForm = new CustomerGisFormMarker(latlon)
        const myIconHtml = myIcon.toHtml()
        const myMarkerIcon = L.divIcon({
            className: 'my-marker',
            html: myIconHtml,
            iconAnchor: [6, 6]
        })

        // TODO:[*] 21-03-09 ERROR:
        // [Vue warn]: Error in callback for watcher "getLatlng": "RangeError: Maximum call stack size exceeded"
        const myDivIcon = L.marker([latlon[0], latlon[1]], {
            icon: myMarkerIcon
        }).addTo(mymap)
        this.iconMySelectedMarker = myDivIcon

        const myDivIconGisForm = L.marker([latlon[0], latlon[1]], {
            icon: L.divIcon({
                className: 'my-marker-gis-form',
                html: myIconGisForm.toHtml(),
                iconAnchor: [-30, 30]
            })
        }).addTo(mymap)
        this.iconMySelectedGisFormMarker = myDivIconGisForm
    }

    // TODO:[*] 20-02-20 监听 store->map->mutations->GET_MAP_NOW
    // @Mutation(GET_MAP_NOW, { namespace: 'map' }) getcurrent

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
        this.addTyTargetDtRealData2Map(valNew)
    }

    @Watch('stationSurgeIconOptions', { immediate: true, deep: true })
    onStationSurgeIconOptions(val: ITyStationLayerOptions): void {
        console.log(val)
        const that = this
        const mymap: any = this.$refs.basemap['mapObject']
        // if(val)
        if (this.checkStationSurgeOptions(val)) {
            // 加载对应时刻的 潮位站数据
            this.loadStationList(this.zoom)
        } else {
            this.clearSurgeAllGroupLayers()
        }
    }

    @Watch('tyFieldOptions', { immediate: true, deep: true })
    onTyFieldOptions(val: ITySurgeLayerOptions): void {
        const that = this
        const mymap: any = this.$refs.basemap['mapObject']
        // const scaleList: string[] | string = getColorScale('my-colour').scaleColorList
        const scaleList: string[] | string = val.scaleList
        if (this.checkSurgeOptions(val)) {
            // 当 tyGroupOptions 发生变更, tyCode | forecastDt | timeStamp 中一个或多个
            // 执行 loadStationList
            // 执行 load wms 服务
            // 点击向后台发送 获取逐时风暴增水场的请求
            // 请求参数包含 ty_code | ty_timestamp | forecast_dt
            if (this.uniqueRasterLayer) {
                clearRasterFromMap(mymap, this.uniqueRasterLayer)
            }
            const fieldSurgeGeoLayer = new FieldSurgeGeoLayer({
                tyCode: val.tyCode,
                tyTimestamp: val.tyTimeStamp,
                forecastDt: val.forecastDt,
                scaleList: scaleList
            })
            this.clearSurgeHourlyRasterLayer()
            fieldSurgeGeoLayer
                .add2map(mymap, () => {})
                .then((res) => {
                    // console.log(res)
                    this.setScaleRange(fieldSurgeGeoLayer.scaleRange || [])
                    that.uniqueRasterLayer = res
                })
        } else {
            // 若未通过则清除 tyGroup layer
            clearRasterFromMap(mymap, this.uniqueRasterLayer)
        }
    }

    // TODO:[-] 21-05-19 根据监听当前的 tyGroupOptions 来确定 指定 tyGroupPath(center) 对应的时间与 tyCode,timeStamp
    @Watch('tyGroupOptions', { immediate: true, deep: true })
    onTyGroupOptions(val: ITyGroupPathOptions): void {}

    @Watch('tyMaxSurgeOptions', { immediate: true, deep: true })
    onTyMaxSurgeOptions(val: ITySurgeLayerOptions): void {
        const that = this
        // console.log(`监听到tyMaxSurgeOptions:tyCode:${val.tyCode},tyTS:${val.tyTimeStamp}发生变化`)
        const mymap: any = this.$refs.basemap['mapObject']
        // const scaleList: string[] | string = getColorScale('my-colour').scaleColorList
        const scaleList: string[] | string = val.scaleList
        if (val.isShow) {
            if (this.uniqueRasterLayer) {
                clearRasterFromMap(mymap, this.uniqueRasterLayer)
            }
            const surgeRasterLayer = new SurgeRasterGeoLayer({
                tyCode: val.tyCode,
                tyTimestamp: val.tyTimeStamp,
                forecastDt: this.forecastDt,
                scaleList: scaleList
            })
            surgeRasterLayer
                .add2map(mymap, () => {})
                .then((layer) => {
                    // console.log(surgeRasterLayer)
                    this.setScaleRange(surgeRasterLayer.scaleRange || [])
                    this.uniqueRasterLayer = layer
                })
        } else {
            clearRasterFromMap(mymap, this.uniqueRasterLayer)
        }
    }

    @Mutation(SET_SCALE_RANGE, { namespace: 'common' }) setScaleRange

    @Watch('tyProSurgeOptions', { immediate: true, deep: true })
    onTyProSurgeOptions(val: ITySurgeLayerOptions): void {
        const that = this
        // console.log(`监听到tyMaxSurgeOptions:tyCode:${val.tyCode},tyTS:${val.tyTimeStamp}发生变化`)
        const mymap: any = this.$refs.basemap['mapObject']
        // const scaleList: string[] | string = getColorScale('my-colour').scaleColorList
        const scaleList: string[] | string = val.scaleList
        if (val.isShow) {
            if (this.uniqueRasterLayer) {
                clearRasterFromMap(mymap, this.uniqueRasterLayer)
            }
            const surgeRasterLayer = new ProSurgeGeoLayer({
                tyCode: val.tyCode,
                tyTimestamp: val.tyTimeStamp,
                forecastDt: this.forecastDt,
                scaleList: scaleList
            })
            surgeRasterLayer
                .add2map(mymap, () => {}, 0.5, val.layerType)
                .then((layer) => {
                    this.setScaleRange(surgeRasterLayer.scaleRange || [])
                    this.uniqueRasterLayer = layer
                })
        } else {
            clearRasterFromMap(mymap, this.uniqueRasterLayer)
        }
    }

    @Watch('selectedTyId')
    onSelectedTyId(val: number): void {
        if (val != DEFAULT_TYPHOON_ID) {
            const testTyphoonId = val

            this.testGetAddTyGroupPath2Map(testTyphoonId)

            // TODO:[*] 21-04-28 暂时加入的加载 海洋站位置的 测试
            this.loadStationList(this.zoom)

            // + 21-05-18 在页面加载后首先加载当前的 start_dt 与 end_dt
            // const tyGroupPath = new TyGroupPath()
            // TODO:[-] 21-07-28 将 读取指定台风集合路径的 读取 起止时间放到 监听 tyCode 与 tyTimestamp 中
            // tyGroupPath.getTargetTyGroupDateRange(this.tyCode, this.tyTimeStamp).then((res) => {
            //     this.finishDate = new Date(Math.max(...res))
            //     this.startDate = new Date(Math.min(...res))
            // })
        }
    }

    get getTyOptions(): { tyCode: string; tyTimeStamp: string } {
        const { tyCode, tyTimeStamp } = this
        return { tyCode, tyTimeStamp }
    }

    @Watch('getTyOptions')
    onTyOptions(val: { tyCode: string; tyTimeStamp: string }) {
        console.log(`tyGroupPath组件监听到'tyCode'与'tyTimestamp'发生变化:${val}`)
        if (val.tyCode !== DEFAULTTYCODE && val.tyTimeStamp !== DEFAULTTIMESTAMP) {
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

    // + 21-08-16 新加入的检查 stationSurgeIconOptions
    checkStationSurgeOptions(val: ITyStationLayerOptions): boolean {
        let isOk = false
        if (
            val.tyCode === DefaultTyGroupPathOptions.tyCode ||
            val.forecastDt === DefaultTyGroupPathOptions.forecastDt ||
            val.tyTimeStamp === DefaultTyGroupPathOptions.timeStamp ||
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

    checkSurgeOptions(val: ITySurgeLayerOptions): boolean {
        let isOk = false
        // TODO:[*] !! 21-07-28 注意可以将 group path 默认id 统一放在 DefaultTyGroupPathOptions 中
        if (
            val.tyCode === DefaultTyGroupPathOptions.tyCode ||
            val.forecastDt === DefaultTyGroupPathOptions.forecastDt ||
            val.tyTimeStamp === DefaultTyGroupPathOptions.timeStamp
        ) {
            isOk = false
        } else if (val.isShow === false) {
            isOk = false
        } else {
            isOk = true
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

    // + 21-07-28 监听 tyCode
    @Getter(GET_TYPHOON_CODE, { namespace: 'typhoon' }) getTyCode

    @Watch('getTyCode')
    onTyCode(val: string): void {
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
                    this.tyGroupOptions.isShow = false
                } else if (lastLayer === LayerTypeEnum.STATION_ICON_LAYER) {
                    this.stationSurgeIconOptions.isShow = false
                } else if (lastLayer === LayerTypeEnum.RASTER_MAX_SURGE_LAYER) {
                    this.tyMaxSurgeOptions.isShow = false
                } else if (lastLayer === LayerTypeEnum.RASTER_HOURLY_SURGE_LAYER) {
                    this.tyFieldOptions.isShow = false
                } else if (lastLayer === LayerTypeEnum.RASTER_PRO_SURGE_LAYER_GT05) {
                    this.tyFieldOptions.isShow = false
                }
            }
        })
        // 先清除 this.existLayers
        this.existLayers = []
        layers.forEach((tempLayerType) => {
            switch (tempLayerType) {
                case LayerTypeEnum.GROUP_PATH_LAYER:
                    this.existLayers.push(tempLayerType)
                    this.tyGroupOptions.isShow = true
                    break
                case LayerTypeEnum.STATION_ICON_LAYER:
                    this.existLayers.push(tempLayerType)
                    this.stationSurgeIconOptions.isShow = true
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

    // TODO:[-] 21-06-09
    @Watch('zoom')
    OnZoom(valNew: number, valOld: number): void {
        // 使用此种方式实现对于平移触发 -> update:zoom 相同值的过滤
        // if (valNew > 9) {
        //     this.zoomLevel = 10
        // } else if (valNew <= 8) {
        //     this.zoomLevel = 5
        // }
        // TODO:[-] 21-05-20 只有 level的变化超出之前的范围才会触发更新的操作
        // if ((valNew > 9 && valOld <= 9) || (valNew <= 9 && valOld > 9)) {
        //     this.zoomLevel = 11
        // }
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
        // TODO:[-] 21-08-16 注意监听 zoom 只需要判断 stationSurgeOptions 即可
        if (this.checkStationSurgeOptions(this.stationSurgeIconOptions)) {
            this.loadStationList(val)
        }
    }

    zoomUpdated(valNew: number, valOld: number): void {
        this.zoom = valNew
        // console.log(`new:${valNew}|old:${valOld}`)
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
@import '../../../styles/station//icon';

// TODO:[-] 21-06-10 TEST 加入了关于 mybasemap 的测试样式
// #mybasemap {
//     height: 1%;
// }

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
        top: 70px;
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
    padding-top: 10px;

    position: absolute;
    right: 10px;
    z-index: 1500;
    width: 300px;
    top: 70px;
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
