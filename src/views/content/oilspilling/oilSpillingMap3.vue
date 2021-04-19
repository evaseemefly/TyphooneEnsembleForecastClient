<template>
    <div id="rescue_map">
        <div id="map_content">
            <l-map
                ref="basemap"
                :zoom="zoom"
                :center="center"
                @click="createMarker"
                @update:zoom="zoomUpdated"
                :options="mapOptions"
                :maxZoom="mapOptions.maxZoom"
                :minZoom="mapOptions.minZoom"
            >
                <l-tile-layer :url="url"></l-tile-layer>
                <!-- <l-tile-layer :url="coverageUrl"></l-tile-layer> -->
                <!-- 加载 发布的岸线服务 -->
                <!-- TODO:[-] 20-09-01 统一将岸线 wms 整合至全球国境线 wms 服务中，此处暂时注释掉 -->
                <!-- <l-wms-tile-layer
                    :baseUrl="landWMS.url"
                    :layers="landWMS.options.layer"
                    :format="landWMS.options.format"
                    :transparent="landWMS.options.transparent"
                ></l-wms-tile-layer> -->
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
                <!-- TODO:[-] 20-07-31 添加一个china的图层 -->
                <!-- <l-wms-tile-layer
                    :baseUrl="landTwPoygonsWMS.url"
                    :layers="landTwPoygonsWMS.options.layer"
                    :format="landTwPoygonsWMS.options.format"
                    :transparent="landTwPoygonsWMS.options.transparent"
                    :zIndex="landTwPoygonsWMS.options.zindex"
                ></l-wms-tile-layer> -->

                <!-- TODO:[-] 20-08-26 新加入的世界国境线 -->
                <l-wms-tile-layer
                    :baseUrl="worldLineWMS.url"
                    :layers="worldLineWMS.options.layer"
                    :format="worldLineWMS.options.format"
                    :transparent="worldLineWMS.options.transparent"
                    :zIndex="worldLineWMS.options.zindex"
                ></l-wms-tile-layer>

                <!-- TODO:[*] 20-08-11 叠加的风场的 wms dir layer 注意使用此种方式会导致更新 data 后并不会触发wms的刷新！ -->
                <!-- <l-wms-tile-layer
                    :baseUrl="windWMS.url"
                    :layers="windWMS.options.layer"
                    :format="windWMS.options.format"
                    :transparent="windWMS.options.transparent"
                    :styles="windWMS.options.style"
                ></l-wms-tile-layer> -->
                <!-- TODO:[-] 20-08-06 新加入的 china 的 dem 图层 
                        不使用此种方式了，会拖慢加载的速度
                -->
                <!-- <l-wms-tile-layer
                    :baseUrl="landChinaDemUrl"
                    :layers="landChinaDemOptions.layers"
                    :format="landChinaDemOptions.format"
                    :transparent="true"
                    :zIndex="landChinaDemOptions.zIndex"
                ></l-wms-tile-layer> -->
                <!-- 东中国海所在区域 -->
                <!-- <l-wms-tile-layer
                    :baseUrl="ecsLineWMSUrl"
                    :layers="ecsLineWMSOptions.layers"
                    :format="ecsLineWMSOptions.format"
                    :transparent="true"
                ></l-wms-tile-layer> -->

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
                <!-- TODO:[-] 21-03-05 新加入的 西北太测试0.2度切分后的网格 -->
                <!-- 21-03-06 + 暂时注释掉，使用 wfs 的方式加载并 add to map -->
                <!-- <l-wms-tile-layer
                    :baseUrl="ewtDiffPoygonsWMS.url"
                    :layers="ewtDiffPoygonsWMS.options.layer"
                    :format="ewtDiffPoygonsWMS.options.format"
                    :transparent="ewtDiffPoygonsWMS.options.transparent"
                    :zIndex="ewtDiffPoygonsWMS.options.zindex"
                ></l-wms-tile-layer> -->
                <l-circle
                    v-for="temp in oilAvgPointList"
                    :key="temp.id"
                    :lat-lng="temp.latlon"
                    @click="testOnOver(temp)"
                />
                <!-- <l-marker :lat-lng="makerLatlng"></l-marker> -->
                <l-circle :lat-lng="makerLatlng"></l-circle>
                <!-- <LeafletHeatmap :lat-lng="oilHeatmapList" :radius="15"></LeafletHeatmap> -->
                <!-- TODO:[*] 19-10-16 注意若动态的添加latlng的话会报错 -->
                <!-- 参考的错误如下：
        https://github.com/jurb/vue2-leaflet-heatmap/issues/2-->
                <!-- 使用的插件：
        https://github.com/jurb/vue2-leaflet-heatmap-->
                <!-- <LeafletHeatmap
        :lat-lng="oilHeatmapList"
        :radius="60"
        :min-opacity=".75"
        :max-zoom="10"
        :blur="60"
        ></LeafletHeatmap>-->
                <!-- <l-circle v-for="temp in oilScatterPointList" :key="temp.id" :lat-lng="temp" /> -->
            </l-map>
            <!-- TODO:[-] 20-07-20 新加入的 main bar 替换之前的 time bar -->
            <!-- <TimeBar :targetDate="startDate" :days="days" :interval="interval"></TimeBar> -->
            <BottomMainBar
                :startDate="startDate"
                :endDate="finishDate"
                :interval="interval"
                :days="days"
                :currentCaseCoverageList="currentCaseCoverageList"
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
                :targetDate="current"
                :numsData="processOptions.num"
                :oilModelData="targetOilModelData"
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
// TODO:[-] 20-08-19 在前端实现根据加载的geojson生成的栅格图层
// 引入第三方的 leaflet-canvaslayer-field
// TODO:[*] 20-08-24 使用此插件会引发一个未知错误，就是会导致流场首次加载时出现偏移，只能暂时注释掉
// import 'leaflet-canvaslayer-field/dist/leaflet.canvaslayer.field'
// 目前无法通过es6的方式引入该模块
// Module not found: Error: Can't resolve 'ih-leaflet-canvaslayer-field'
// import 'ih-leaflet-canvaslayer-field'
// Module not found: Error: Can't resolve 'leaflet-canvaslayer-field'
// import 'leaflet-canvaslayer-field'

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
// import 'leaflet-geotiff'
// import 'leaflet-geotiff/leaflet-geotiff-plotty'
// import 'leaflet-geotiff/leaflet-geotiff'
// import 'leaflet-geotiff/leaflet-geotiff-plotty'
// ----
// 使用以下方式可以成功引入(尝试别的办法暂时注释掉，可用)
// import * as geotiff from 'leaflet-geotiff/leaflet-geotiff'
// import * as plotty from 'leaflet-geotiff/leaflet-geotiff-plotty'
// ----
// 20-09-02 尝试使用:georaster-layer-for-leaflet
// import * as parse_georaster from 'georaster'
// import * as GeoRasterLayer from 'georaster-layer-for-leaflet'
//---
// 20-09-07 引入了raster-marching-squares
import * as rasterMarching from 'raster-marching-squares'

// 20-09-0 引入 leaflet-windbarb.js
// Vue.loadScript('@/common/leaflet-windbarb')

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
// 各api
import {
    loadOilSpillingAvgTrackList,
    loadOilScatterTrackListPage,
    loadOilRealData,
    loadOilSpillingAvgRealData,
    getTargetCodeDateRange,
    getTargetTimeTrackCount
} from '@/api/api'
import { loadWindFlow, loadCurrentTif } from '@/api/geo'

// TODO:[-] 20-01-23 尝试将oil的部分操作放在oil 类中()
// TODO:[-] 21-01-12
import { Oil, IOptions, OilScatter } from './oil'
import { Coverage, IOptions as ICoverageOptions } from './coverage'
import { OilPointRealDataMidModel } from '@/middle_model/rescue'
import { OilMidModel } from '@/middle_model/oil'
import { ICaseMin, CaseMinInfo, CaseOilModel } from '@/middle_model/case'
// 20-10-30 引入 CanvasLayerMidModel
import { CanvasLayerMidModel } from '@/middle_model/geo'
import { getDaysNum } from '@/common/date'

// 各类 DTO
import { CustomerMarker, CustomerGisFormMarker } from './marker'
// 20-08-11 wms 相关的中间 model
import { WMSOptionsMidModel, WMSMidModel, WindBarOptMidModel } from '@/middle_model/geo'

// TODO:[-] 20-07-06 将 与 flow 相关的放入在.flow.ts 中
import { IVelocityDisplayOpt, IVelocityLayerOpt, ICoverageFlow, CoverageCurrentFlow } from './flow'

// 引入常量
import { optionsFactors, optionsShowTypes } from '@/const/Oil'
import { DEFAULT_COVERAGE_ID, DEFAULT_NUMBER, USELESS_COVERAGE_ID } from '@/const/common'
import { OilFactor, ShowType } from '@/enum/OilSelect'
// 20-10-23 产品种类
import { ProductEnum } from '@/enum/dict'
import { AreaEnum } from '@/enum/area'
import { Case, CaseModelInfo } from '@/views/content/oilspilling/case'
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
    IRaster
} from '@/views/content/oilspilling/raster'
import { WindArrow } from '@/views/content/oilspilling/arrow'
// + 21-03-24 海浪等值线绘制类
import { WaveContourLine, WaveArrow } from '@/views/content/oilspilling/wave'
// 引入枚举
import { DictEnum } from '@/enum/dict'
import { LayerTypeEnum } from '@/enum/map'

// api
import { loadCoverageInfo, loadGeoserverInfo, loadCoverageListByIds } from '@/api/geo'

// STORE 常量
import {
    GET_MAP_NOW,
    GET_CREATE_OIL_CASE_MODAL,
    GET_CURRENT_LATLNG,
    GET_GEO_COVERAGETYPE,
    GET_MAP_LAYERS,
    GET_CURRENT_LATLNG_LOCK,
    SET_INITIAL_LATLNG,
    GET_INITIAL_LATLNG,
    // + 21-01-27 新加入的用来控制组件间触发异步时间造成的错位情况的 时间锁
    SET_TIMER_LOCK,
    GET_TIMER_LOCK
} from '@/store/types'
import { DEFAULT_LAYER_ID } from '@/const/common'
import { ArrayPropsDefinition } from 'vue/types/options'
import { SET_CURRENT_LATLNG } from '@/store/types'

import { IVelocityOptions, IPolyLine, IRasterOptions } from './types'

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
        BottomMainBar
        // GridDetailForm
        // LeafletHeatmap
    }
    // + 21-01-27 新引入的 mixin
    // mixins: [WMSMixin, CommonOptMixin]
})
export default class OilSpillingMap extends mixins(
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
    zoom = 5
    center: number[] = [17.6, 131.6]
    // TODO:[-] 20-11-09 新加入的 map 相关的一些基础静态配置
    mapOptions: {} = {
        preferCanvas: true,
        minZoom: 3,
        // 可缩放的最大 level
        maxZoom: 11,
        render: L.canvas()
    }
    isZoomLock = false
    // url =
    //     'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    // TODO:[-] 20-06-23 由于智图的坐标系是GCJ02 ,需要改为 WGS-84的坐标系

    //     '//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
    // https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer
    // url =
    //     'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'

    // + 21-01-27 使用 mixin 进行拆分

    // 使用 上面的 landWMS替代
    // 岸线服务
    // landWMSUrl = 'http://localhost:8082/geoserver/nmefc_current/wms?'
    // landWMSOptions = {
    //     layers: 'nmefc_current:land_china', //需要加载的图层
    //     format: 'image/png', //返回的数据格式
    //     transparent: true
    // }

    // ninelinesWMSUrl = 'http://localhost:8082/geoserver/nmefc_current/wms?'
    // ninelinesWMSOptions = {
    //     layers: 'nmefc_current:9line', //需要加载的图层
    //     format: 'image/png', //返回的数据格式
    //     transparent: true
    // }

    // southLandsWMSUrl = 'http://localhost:8082/geoserver/nmefc_current/wms?'
    // southLandsWMSOptions = {
    //     layers: 'nmefc_current:southsea_land', //需要加载的图层
    //     format: 'image/png', //返回的数据格式
    //     transparent: true
    // }

    // landTwPoygonsUrl = 'http://localhost:8082/geoserver/nmefc_common/wms?'
    // landTwPoygonsOptions = {
    //     // 新修改为世界的 国境线 shp 图层了
    //     layers: 'nmefc_common:new_china_land', //需要加载的图层
    //     // layers: 'nmefc_common:world_map_line', //需要加载的图层
    //     format: 'image/png', //返回的数据格式
    //     transparent: true,
    //     zIndex: 1500
    // }

    // landChinaDemUrl = 'http://localhost:8082/geoserver/nmefc_common/wms?'
    // landChinaDemOptions = {
    //     layers: 'nmefc_common:china_dem_geo',
    //     format: 'image/png', //返回的数据格式
    //     transparent: true,
    //     zIndex: 1500
    // }
    // TODO:[-] 20-08-24 改为使用本地的map瓦片地图，之前的备份先注释掉
    // url =
    //     'http://{s}.sm.mapstack.stamen.com/' +
    //     '(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/' +
    //     '{z}/{x}/{y}.png'

    coverageUrl = ''
    makerLatlng = [0, 0]
    // TODO:[-] 21-01-06 初始位置，加载 case 后将case的初始位置赋值于此
    initialLatLng = [0, 0]
    // 指定时间
    // targetDate: Date = new Date();
    // 溢油平均轨迹
    oilAvgPointList: OilPointRealDataMidModel[] = []
    // TODO:[*] 19-10-31 由于设置类型为any，且赋值为null，引发的子组件在为null的情况下未渲染
    oilAvgRealData: OilMidModel = new OilMidModel()
    // 指定时刻的全部轨迹散点数组
    oilScatterPointList: number[][] = []
    oilScatterCircleList: any[] = []
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

    // TODO:[-] 20-05-25 是否显示 创建 case 的 modal 框
    isCaseDialogVisible = false

    // TODO:[*] 19-11-04 heatLayer 当前的热图layer
    tempHeatLayer: HeatmapOverlay = null
    // TODO:[*] 20-06-13 修改 heatLayer 为一个数组
    tempHeatLayers: any[] = []
    // tempHeatData: { lat: number; lng: number }[] = []
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

    tempOilDivIcon: any = null
    tempOil: any = null
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

    // TODO:[-] 20-10-25 加入的用来处理 风力杆 的 opt
    windOptions: IRasterOptions = {
        coverageId: DEFAULT_COVERAGE_ID,
        current: new Date(),
        isShow: false,
        productType: ProductEnum.COVERAGE_TYPE_WIND,
        level: 3,
        area: AreaEnum.GLOBAL
    }
    windRasterOptions: IRasterOptions = {
        // TODO:[-] 21-02-10 注意 coverageId 是由 watch casecode -> loadTargetOilModelData 中修改的，而非 getCoverageId
        coverageId: DEFAULT_COVERAGE_ID,
        current: new Date(),
        isShow: false,
        productType: ProductEnum.COVERAGE_TYPE_WIND,
        level: 3,
        area: AreaEnum.GLOBAL
    }
    // TODO:[*] 20-10-31 新加入了用来处理 流场raster 的 opt
    currentRasterOptions: IRasterOptions = {
        coverageId: DEFAULT_COVERAGE_ID,
        current: new Date(),
        isShow: false,
        productType: ProductEnum.COVERAGE_TYPE_CURRENT,
        level: 5,
        area: AreaEnum.GLOBAL
    }
    currentRasterLayerId: number = DEFAULT_LAYER_ID
    // TODO:[-] 21-03-01 + 加入的 当前 风场 layerId
    windRasterLayerId: number = DEFAULT_LAYER_ID
    // TODO:[-] 21-04-05 + 当前的 海浪-海表面高度 LayerId
    waveWveRasterLayerId: number = DEFAULT_LAYER_ID
    // TODO:[*] 20-10-22 + 缩放等级
    zoomLevel = 5
    // TODO:[-] 20-07-07 + 用来监听实现 windy 效果
    velocityOptions: IRasterOptions = {
        coverageId: DEFAULT_COVERAGE_ID,
        current: new Date(),
        isShow: false,
        productType: ProductEnum.COVERAGE_TYPE_CURRENT,
        level: 5,
        area: AreaEnum.GLOBAL
    }
    // TODO:[-] 21-04-05 + 用来监听 海浪-海表面 高度的 raster
    waveWveRasterOption: IRasterOptions = {
        // TODO:[-] 21-04-06 + 区别 DEFAULT
        coverageId: USELESS_COVERAGE_ID,
        current: new Date(),
        isShow: false,
        productType: ProductEnum.COVERAGE_TYPE_WAVE_WVE,
        level: 5,
        area: AreaEnum.GLOBAL
    }
    // 风场 layer
    windLayer: any = null
    // TODO:[*] 20-10-26 + 风力杆 layer (canvasMarkerLayer)
    windBarLayer: L.Layer = null

    // TODO:[-] 20-07-30 新加入的 风场 abs的 wms layer
    windAbsLayer: any = null
    // 用于动态加载的 wms 的 ws 的str
    wmsWorkSpace = ''
    layerControl: any = null
    // 流场 layer (注意是一个矢量 layer 注意与上面的 风场的区分)
    velocityLayer: any = null
    currentRaster: IRaster = null
    // TODO:[*] 20-07-27 记录当前 add layers to map 时的 layers种类数组
    existLayers: LayerTypeEnum[] = []
    // TODO:[-] 20-06-20 加入的是否分页的标识符
    isPagination = true
    // 创建大量散点使用 add layerGroup 的方式添加，记录 group 的 id
    layerGroupId: number = DEFAULT_NUMBER
    layerGroupIds: number[] = []
    // 当前的 caseCode 对应的 coverage info min model 集合
    currentCaseCoverageList: CoverageMin[] = []

    // TODO:[-] 21-01-12
    oilScatters: OilScatter = null

    // windLayer: any = null

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
        this.loadDateRange()
    }

    mounted() {
        // 由于是测试，页面加载完成后先加载当前 code 的平均轨迹
        // TODO:[*] 20-01-23 暂时去掉页面加载后读取平均轨迹的步骤(暂时去掉)
        // this.loadTrackAvgList();
        // TODO:[*] 19-11-07 将loadDate的操作放在created中
        // this.startDate = new Date(2018, 0, 14, 22, 20);
        // // TODO:[*] 19-11-05:页面加载时需要获取当前code对应的旗帜时间
        // this.loadDateRange();
        // TODO:[-] 20-02-18 页面加载完成先加载历史case list
        // console.log(caseList)
        // 将加载工作放在 JobListMin 组件中
        // this.loadCaseList()
        // this.loadWindFlow()
        // this.initLandWMS()
        // this.loadGeoTiffD3js()
        const mymap: L.Map = this.$refs.basemap['mapObject']

        // TODO:[*] 21-03-09 加载 wfs 的mixin组件后会出现错误，暂时放弃加载
        // this.loadGridWFS(mymap)
        // this.loadPolyWFS(mymap)
        // TODO:[*] 21-03-10 加载 测试 的 wave 等值线
        // this.loadWave(mymap)

        // this.addWaveLayer2Map(mymap)
        // TODO:[-] 21-03-31 新加入的测试加载全球流场流向的逻辑
        const wave = new WaveArrow()
        const barOpt = new WindBarOptMidModel(9995, new Date(), 5, 5)
        // wave.add2mapGlobal(mymap, barOpt, 0)
        // TODO:[-] 21-04-05 去掉之前测试加载全球流场-海表面高度的 geotiff
        // const waveRasterLayer = new WaveRasterGeoLayer(9995, new Date(), AreaEnum.GLOBAL)
        // waveRasterLayer.add2map(mymap)
    }

    loadCaseList() {
        this.clearCaseList()
        const productType = this.$store.getters['common/productType']
        const caseList: CaseMinInfo[] = []
        const caseFactory = new Case(productType)
        caseFactory.getCaseListByUser().then((res) => {
            // console.log(`获取到上面的promise传给的 CaseMinInfo[]:${res}`)
            this.caseList = res
        })
    }

    clearCaseList() {
        this.caseList = []
    }

    clearVelocityLayer() {
        const mymap: any = this.$refs.basemap['mapObject']
        // 从 layerControl 中剔除当前的 矢量 layer
        if (this.velocityLayer !== null) {
            // 1 需要从 control 中清除当前的layer
            this.layerControl.removeLayer(this.velocityLayer)
            // 2 注意还需要从地图中清除 layer
            mymap.removeLayer(this.velocityLayer)
            // 3 赋值 this.velocityLayer 为 null
            this.velocityLayer = null
            this.velocityOptions.isShow = false
        }
    }

    // 20-10-26 清除 风力杆 layer
    clearwindBarLayer(): void {
        const mymap: any = this.$refs.basemap['mapObject']
        if (this.windBarLayer != null) {
            mymap.removeLayer(this.windBarLayer)
            this.windBarLayer = null
        }
        this.arrow.clearLayers(mymap)
    }

    // TODO:[-] 21-02-10 + 清除 风场 geotiff layer
    // 21-03-01 修改为根据 id 进行删除图层
    clearWindRasterLayer(): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        // TODO:[-] 21-03-01 此处是有错误的
        if (this.windRasterLayerId !== DEFAULT_LAYER_ID) {
            this.clearLayerById(this.windRasterLayerId)
        }
    }

    // TODO:[-] 21-04-05 + 清除 海浪-海表面高度 geotiff layer
    clearWaveWveRasterLayer(): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        // TODO:[-] 21-03-01 此处是有错误的
        if (this.waveWveRasterLayerId !== DEFAULT_LAYER_ID) {
            this.clearLayerById(this.waveWveRasterLayerId)
        }
    }

    // 加载指定code的平均轨迹
    loadTrackAvgList(): void {
        // const myself = this
        loadOilSpillingAvgTrackList(this.code).then((res) => {
            if (res.status === 200) {
                res.data.forEach((temp: any) => {
                    this.oilAvgPointList.push(
                        new OilPointRealDataMidModel(
                            [temp.point.coordinates[1], temp.point.coordinates[0]],
                            new Date(temp.time)
                        )
                    )
                    this.polyline.latlngs.push([
                        temp.point.coordinates[1],
                        temp.point.coordinates[0]
                    ])
                })
            }
        })
    }

    // TODO:[+] 20-06-05 流场——尝试加入 windy 的流动效果
    loadWindFlow(): void {
        loadWindFlow().then((res) => {
            // console.log(res)
            this.initDemoMap(res.data)
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

    // 使用 windy 的效果实现 流场
    initDemoMap(data: any): void {
        // TODO:[-] 20-07-07 此处的问题已经在地图中渲染的 flow ，并未被及时清除，导致会叠加多个 flow
        // TODO:[-] 20-07-08 将初始化 layer control 放在 this.initLayerControl 方法中
        // const mymap: any = this.$refs.basemap['mapObject']
        // const esriDarkGreyCanvas = L.tileLayer(
        //     'http://{s}.sm.mapstack.stamen.com/' +
        //         '(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/' +
        //         '{z}/{x}/{y}.png',
        //     {
        //         attribution: 'Tiles &copy; Esri &mdash; Esri,WMS'
        //     }
        // )
        // const baseLayers = {
        //     '风+流场': esriDarkGreyCanvas
        // }

        // this.clearVelocityLayer()
        // 每次需要判断当前的 layerControl 是否为null，若不为null需要清除

        // if (this.layerControl != null) {
        //     this.layerControl.remove()
        // }
        // this.layerControl = L.control.layers(baseLayers)
        // this.layerControl.addTo(mymap)

        // TODO:[-] 20-07-08 清除 矢量 layer 以及 初始化 layer control 放在 getcurrent 与 casecode 监听中
        // this.clearVelocityLayer()
        // this.initLayerControl()
        const mymap = this.$refs.basemap['mapObject']
        // TODO:[-] 21-03-04 每次添加 图层前，需要先判断该图层是否定义，若定义则先remove
        this.clearVelocityLayer()
        const currentFlow = new CoverageCurrentFlow()
        currentFlow.initLayer(data)
        // 暂时去掉 layerControl
        // this.layerControl.addOverlay(currentFlow.velocityLayer, '流场-flow-nmefc')
        this.velocityLayer = currentFlow.velocityLayer
        // TODO:[*] 21-03-04 缺少 add to map 的步骤
        this.velocityLayer.addTo(mymap)

        // TODO:[*] 20-08-18 新尝试加入风场的 栅格 图层
        // d3.json(data, (res) => {
        //     console.log(res)
        // })
        // const s = L.ScalarField.fromASCIIGrid(data)
        // TODO:[*] 20-09-02 暂时未搞定，先去掉
        // this.loadGeoTiff()
        // 20-09-02 此种方式会有无法设置透明度的bug
        // this.addGeoTiff()
        // this.addGeoTiff2()

        // this.loadGeoTiffCustomer()
    }

    // 方式2: 通过使用:leaflet-geotiff,暂时不再使用，有无法设置透明度的bug
    addGeoTiff(): void {
        // 通过使用:leaflet-geotiff
        // https://github.com/stuartmatthews/leaflet-geotiff
        // 设置透明度引起的错误:
        // https://github.com/stuartmatthews/leaflet-geotiff/issues/9
        const mymap = this.$refs.basemap['mapObject']
        // oilSpillingMap3.vue?19ef:771 Uncaught (in promise) TypeError: leaflet__WEBPACK_IMPORTED_MODULE_11__.leafeltGeotiff is not a function
        const options = {
            band: 0,
            name: 'Custom Mask',
            opacity: 0.5,
            renderer: new plotty.Plotty({
                colorScale: 'spring'
            })
        }
        new geotiff.LeafletGeotiff('/data/test.geotiff', options).addTo(mymap)
        // L.leafletGeotiff('/data/test.tiff').addTo(mymap)
    }

    // 方式3: 使用的 georaster-layer-for-leaflet，也是走不通
    addGeoTiff2(): void {
        const mymap = this.$refs.basemap['mapObject']
        const url_to_geotiff_file = '/data/test.tiff'

        fetch(url_to_geotiff_file)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => {
                // Uncaught (in promise) TypeError: Cannot read property 'GeographicTypeGeoKey' of null
                parse_georaster(arrayBuffer).then((georaster) => {
                    console.log('georaster:', georaster)

                    /*
          GeoRasterLayer is an extension of GridLayer,
          which means can use GridLayer options like opacity.

          Just make sure to include the georaster option!

          Optionally set the pixelValuesToColorFn function option to customize
          how values for a pixel are translated to a color.

          http://leafletjs.com/reference-1.2.0.html#gridlayer
      */
                    const layer = new GeoRasterLayer({
                        georaster: georaster,
                        opacity: 0.7,
                        pixelValuesToColorFn: (values) =>
                            values[0] === 42 ? '#ffffff' : '#000000',
                        resolution: 64 // optional parameter for adjusting display resolution
                    })
                    layer.addTo(mymap)

                    mymap.fitBounds(layer.getBounds())
                })
            })
    }

    // 方式1: 使用 Leaflet.CanvasLayer.Field
    // TODO:[*] 20-08-20 继续使用 leaflet-canvaslayer-field
    // 加载 geotiff
    loadGeoTiff(): void {
        // const mymap = this.$refs.basemap['mapObject']
    }

    loadGeoTiffCustomer(): void {
        d3.request('tz850.tiff')
            .responseType('arraybuffer')
            .get((error, tiffData) => {
                const tiff = geotiff.parse(tiffData.response)
                const image = tiff.getImage()
                const rasters = image.readRasters()
                const tiepoint = image.getTiePoints()[0]
                const pixelScale = image.getFileDirectory().ModelPixelScale
                const geoTransform = [
                    tiepoint.x,
                    pixelScale[0],
                    0,
                    tiepoint.y,
                    0,
                    -1 * pixelScale[1]
                ]
                const invGeoTransform = [
                    -geoTransform[0] / geoTransform[1],
                    1 / geoTransform[1],
                    0,
                    -geoTransform[3] / geoTransform[5],
                    0,
                    1 / geoTransform[5]
                ]

                const tempData = new Array(image.getHeight())
                for (let j = 0; j < image.getHeight(); j++) {
                    tempData[j] = new Array(image.getWidth())
                    for (let i = 0; i < image.getWidth(); i++) {
                        tempData[j][i] = rasters[1][i + j * image.getWidth()]
                    }
                }
            })
    }

    // TODO:[-] 20-09-07 加载等值线
    // 原名:loadGeoTiffD3js
    //
    loadWindLayer(coverageId: number, current: Date, level: number): void {
        // 根据传入的 coverage id 与 时间 current 与 缩放等级 level 获取 风力杆 及 tiff 并叠加值地图中
        const that = this

        const mymap = this.$refs.basemap['mapObject']
        const myRaster: IRaster = new RasterGeoLayer(coverageId, current)
        // TODO:[*] 21-02-08 此处不在 loadWind 中实例化 windArrow 对象，放在 mixin -> ConstArrowMixin 中
        // 21-02-08 暂时注释掉
        // const myArrow: WindArrow = new WindArrow()
        // --- 21-02-08
        // 以下为 raster 的等值线
        // myRaster = new RasterIsoline()
        // 以下为 raster 的 pixel image
        // myRaster = new RasterPixel()
        // myArrow = new WindArrow()
        // myRaster = new RasterScalar()
        // TODO:[-] 20-09-08 恢复使用 https://github.com/IHCantabria/Leaflet.CanvasLayer.Field 的方式
        // myRaster = new RasterScalarField()

        // TODO:[-] 20-09-12 出现了一个未知的错误，若使用 d3js 进行手动绘制，出现的问题是投影会有偏移
        // myRaster = new RasterScalar()

        // myRaster = new RasterGeoLayer()
        // TODO:[-] 20-10-26 暂时去掉写死的 加载 tif
        // myRaster.add2map(mymap)
        // myRaster
        // myArrow.add2map(mymap)
        // TODO:[*] 21-02-25 + 对于全球风场加入的 dict_level
        const dictGlbLevel = {
            7: 20,
            5: 15,
            3: 15
        }
        // TODO:[*] 20-10-22 + 根据 当前时间， coverage_id , 缩放等级 加载风力杆
        const windbarOpt = new WindBarOptMidModel(coverageId, current, level, dictGlbLevel[level])
        // TODO:[-] 21-02-03 测试分批加载全球流场
        // 此部分暂时注释掉，之后再恢复
        // myArrow.add2map(mymap, windbarOpt).then((res) => {
        //     // 从 add2amp 中传出一个 L.Layers
        //     // 将 箭头 layer 添加至 windBarLayer
        //     this.windBarLayer = res
        //     // console.log(res)
        // })

        // 21-02-08 暂时注释掉
        // myArrow.addBatchLayer2MapGlobal(mymap, windbarOpt)
        // --- 21-02-08
        // TODO:[*] 21-02-08 每次添加之前需要先手动 clear Layer
        this.arrow.clearLayers(mymap)
        this.arrow.addBatchLayer2MapGlobal(mymap, windbarOpt)
    }

    // TODO:[-] 21-03-31 加载海浪浪向
    loadWaveLayer(coverageId: number, current: Date, level: number): void {}

    // TODO:[-] 21-02-09 + add wind geotiff to map
    loadWindRasterLayer(coverageId: number, current: Date, level: number, area: AreaEnum): void {
        // 根据传入的 coverage id 与 时间 current 与 缩放等级 level 获取 风力杆 及 tiff 并叠加值地图中
        const that = this
        const mymap: L.Map = this.$refs.basemap['mapObject']
        const myRaster: IRaster = new WindRasterGeoLayer(coverageId, current, area)
        // console.log('触发loadWindRasterLayer')
        myRaster
            .add2map(
                mymap,
                (opt = { message: `当前时间${current}没有对应的tif文件`, type: 'warning' }) => {
                    this.$message({
                        message: `当前时间${current}没有对应的tif文件`,
                        type: 'warning'
                    })
                }
            )
            .then((res) => {
                // 21-02-10 以下暂时注释掉，需要重新梳理一下
                // this.currentRaster = myRaster
                // this.currentRasterLayerId = this.currentRaster.rasterLayer._leaflet_id
                if (myRaster.rasterLayer) {
                    this.windRasterLayerId = myRaster.rasterLayer._leaflet_id
                }
            })
    }

    // TODO:[-] 21-04-05 + add wave wve geotiff -> map
    loadWaveWveRasterLayer(coverageId: number, current: Date, level: number, area: AreaEnum): void {
        // 根据传入的 coverage id 与 时间 current 与 缩放等级 level 获取 风力杆 及 tiff 并叠加值地图中
        const that = this
        const mymap: L.Map = this.$refs.basemap['mapObject']
        const myRaster: IRaster = new WaveRasterGeoLayer(coverageId, current, area)
        // console.log('触发loadWindRasterLayer')
        myRaster
            .add2map(mymap, (opt: { message: string; type: string }) => {
                that.$message({
                    message: opt.message,
                    type: opt.type
                })
            })
            .then((res) => {
                // 21-02-10 以下暂时注释掉，需要重新梳理一下
                if (myRaster.rasterLayer) {
                    this.waveWveRasterLayerId = myRaster.rasterLayer._leaflet_id
                }
            })
    }

    // TODO:[*] 20-08-19 以下为使用d3js的测试，暂时不使用d3js了，实现起来较为复杂

    initial() {
        const mymap = this.$refs.basemap['mapObject']
        const svg = d3
                .select(mymap.getPanes().overlayPane)
                .append('svg')
                .attr('class', 'leaflet-zoom-hide'),
            g = svg.append('g')
        svg.attr('width', 1500).attr('height', 800)
        drawCircle()
    }

    drawCircle() {
        const mymap = this.$refs.basemap['mapObject']
        //加载SVG
        const svg = d3
                .select(mymap.getPanes().overlayPane)
                .append('svg')
                .attr('class', 'leaflet-zoom-hide'),
            g = svg.append('g')

        const jsonCircles = []
        const circleData = [
            { lat: '51.513336399623476', lng: '-0.0885772705078125' },
            { lat: '51.511092905004745', lng: '-0.09733200073242189' },
            { lat: '51.50543026060531', lng: '-0.10145187377929689' },
            { lat: '51.499980636437265', lng: '-0.09853363037109376' },
            { lat: '51.497202145853784', lng: ' -0.08806228637695314' },
            { lat: '51.4978433510224', lng: '-0.08222579956054689' },
            { lat: '51.50051494213075', lng: '-0.07570266723632814' },
            { lat: '51.50564395807757', lng: '-0.07209777832031251' },
            { lat: '51.51312273822952', lng: '-0.08050918579101564' },
            { lat: '51.51002453540032', lng: '-0.07535934448242189' }
        ]
        circleData.forEach(function(d) {
            console.log(d)
            jsonCircles.push({ x_axis: d.lat, y_axis: d.lng, radius: 12, color: 'green' })
        })
        console.log('drawCircle')
        console.log(jsonCircles)
        const t = svg.selectAll('circle').data(jsonCircles)
        const circleAttributes = t
            .enter()
            .append('circle')
            .attr('cx', function(d) {
                // console.log(mymap.latLngToLayerPoint(L.latLng(d.x_axis, d.y_axis)))
                return mymap.latLngToLayerPoint(L.latLng(d.x_axis, d.y_axis)).x
            })
            .attr('cy', function(d) {
                return mymap.latLngToLayerPoint(L.latLng(d.x_axis, d.y_axis)).y
            })
            .attr('r', function(d) {
                return d.radius
            })
            .style('fill', function(d) {
                return d.color
            })
    }

    adjustCircle() {
        const mymap = this.$refs.basemap['mapObject']
        console.log('draw')
        d3.selectAll('circle')
            .attr('cx', (o) => mymap.latLngToLayerPoint([o.x_axis, o.y_axis]).x)
            .attr('cy', (o) => mymap.latLngToLayerPoint([o.x_axis, o.y_axis]).y)
    }

    // ------------

    initControlLayer(isRemove = false): void {
        const esriDarkGreyCanvas = L.tileLayer(
            'http://{s}.sm.mapstack.stamen.com/' +
                '(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/' +
                '{z}/{x}/{y}.png',
            {
                attribution: 'Tiles &copy; Esri &mdash; Esri,WMS'
            }
        )
        const baseLayers = {
            '风+流场': esriDarkGreyCanvas
        }
        if (isRemove) {
            if (this.layerControl != null) {
                this.layerControl.remove()
            }
        }
        this.layerControl = L.control.layers(baseLayers)
    }

    // 向 controller 中添加 wms layers
    addWMSLayer(): void {}

    // 根据当前选中的时间加载该时间的全部溢油 散点轨迹
    loadTrackHeatmap(code: string, dt: Date, index: number, count: number): Promise<void> {
        // const myself = this
        //TODO:[*] 19-11-13 清除统一放在clearAllLayer中，此处暂时注释掉
        // this.clearScatterPoint();
        const mymap: any = this.$refs.basemap['mapObject']
        this.oilHeatmapList = []
        //TODO:[*] 19-11-04 清除layerHeat
        // this.clearHeatLayer()
        // TODO:[*] 19-10-16 尝试加入热力图的效果
        // TODO:[*] 20-01-23 注意此处由直接调用当前的vue中的data取值，改为由方法参数取值
        return loadOilScatterTrackListPage(code, dt, index, count).then((res) => {
            if (res.status === 200) {
                // TODO : [*] 19-09-25 注意此处 使用leaflet2vue插件会导致vue的组件崩溃。
                // 尝试使用直接添加的方式
                res.data.forEach((temp: any) => {
                    this.oilScatterPointList.push([
                        temp.point.coordinates[1],
                        temp.point.coordinates[0]
                    ])
                    // 20-07-14 暂时去掉 状态为1的点
                    if (temp.status === 0) {
                        // if (temp.status === 1 || temp.status === 0) {
                        this.oilHeatmapList.push({
                            lat: temp.point.coordinates[1],
                            lng: temp.point.coordinates[0],
                            count: 2
                        })
                    }
                })
                // 获取到当前的map

                // 对应的是Leaflet.heat库
                // 但是会提示：Property 'heatLayer' does not exist on type 'typeof import("D:/02proj/SearchRescue/SearchRescueSys/webclient/node_modules/@types/leaflet/index")'.

                // TODO:[X] 20-06-14 以下注释掉，放在 外侧的then中实现如下效果
                // const list = this.oilHeatmapList

                // const heatData = {
                //     max: 2,
                //     data: list
                // }
                // const heatConfig = {
                //     radius: 0.01,
                //     maxOpacity: 0.8,
                //     scaleRadius: true,
                //     useLocalExtrema: true,
                //     latField: 'lat',
                //     lngField: 'lng',
                //     valueField: 'count'
                // }
                // let heatLayer: HeatmapOverlay = null
                // console.log(
                //     `[x] oilSpillingMap3 -> loadTrackHeatmap -> loadOilScatterTrackListPage -- add data start:[${new Date()}]`
                // )
                // if (this.tempHeatLayer == null) {
                //     heatLayer = new HeatmapOverlay(heatConfig)
                // } else {
                //     heatLayer = this.tempHeatLayer
                // }
                // console.log(
                //     `[x] oilSpillingMap3 -> loadTrackHeatmap -> loadOilScatterTrackListPage -- init data:[${new Date()}]`
                // )
                // // TODO:[*] 20-06-14 此部分当分页加载时此处比较费时
                // if (heatLayer != null) {
                //     if (this.tempHeatLayer == null) {
                //         heatLayer.setData(heatData)
                //         heatLayer.addTo(mymap)
                //     } else {
                //         if (list.length > 0) {
                //             console.log(
                //                 `[x] oilSpillingMap3 -> loadTrackHeatmap -> loadOilScatterTrackListPage -- add data start:[${new Date()}]`
                //             )
                //             heatLayer.addData(list)
                //             console.log(
                //                 `[x] oilSpillingMap3 -> loadTrackHeatmap -> loadOilScatterTrackListPage -- add data end:[${new Date()}]`
                //             )
                //         }
                //     }

                //     // TODO:[*] 19-11-04 添加完heatlayer后，再次更新时记得需要remove
                //     console.log(
                //         `[x] oilSpillingMap3 -> loadTrackHeatmap -> loadOilScatterTrackListPage -- copy 2 heatlayer:[${new Date()}]`
                //     )
                //     this.tempHeatLayer = heatLayer
                //     // this.tempHeatLayers.push(heatLayer)
                // }
                // console.log(
                //     `[x] oilSpillingMap3 -> loadTrackHeatmap -> loadOilScatterTrackListPage -- add data finish:[${new Date()}]`
                // )
            }
        })
    }

    // 加载散点图
    loadTrackScatterPoint(code: string, dt: Date, index: number, count: number): Promise<void> {
        // const myself = this
        //TODO:[*] 19-11-13 清除统一放在clearAllLayer中，此处暂时注释掉
        // this.clearScatterPoint();
        const mymap: L.Map = this.$refs.basemap['mapObject']
        const colorInSea = '#3388ff'
        const colorOnLand = '#FFE123'
        const colorEnd = '#E74C3C'

        // TODO:[*] 20-01-23 注意此处由直接调用当前的vue中的data取值，改为由方法参数取值
        return loadOilScatterTrackListPage(code, dt, index, count, this.isPagination).then(
            (res) => {
                if (res.status === 200) {
                    if (res.data.length > 0) {
                        const myRender = L.canvas({ padding: 0.5 })
                        // TODO : [*] 19-09-25 注意此处 使用leaflet2vue插件会导致vue的组件崩溃。
                        // 尝试使用直接添加的方式
                        // 需要添加至 map 的 circle 数组
                        // const oilScatters: Array<L.Circle> = []
                        const oilScattersMarkers: L.CircleMarker[] = []
                        res.data.forEach((temp: any) => {
                            let tempColor = colorInSea
                            // todo:[*] 19-10-16 暂时去掉散点，只保留热图
                            if (temp.status === 1) {
                                tempColor = colorOnLand
                            }
                            if (temp.status === 2) {
                                tempColor = colorEnd
                            }
                            // oilScatters.push(
                            //     L.circle([temp.point.coordinates[1], temp.point.coordinates[0]], {
                            //         renderer: myRender,
                            //         radius: 20,
                            //         color: tempColor
                            //     })
                            // )
                            oilScattersMarkers.push(
                                new L.CircleMarker(
                                    [temp.point.coordinates[1], temp.point.coordinates[0]],
                                    {
                                        // renderer: myRender,
                                        radius: 1,
                                        color: tempColor
                                    }
                                )
                            )
                        })
                        // 加入自动缩放功能
                        if (oilScattersMarkers.length > 0 && this.isZoomLock == false) {
                            this.isZoomLock = true
                            this.zoomLocation(oilScattersMarkers[0]._latlng)
                        }
                        // TODO:[*] 20-07-09 注意由于分页的情况，所以此处的 res.data 有可能length=0.对于此种情况，以下不执行
                        // TODO:[-] 21-01-04 由于使用分页查询，散点总数 > page_count 则会加载多次，所以会有多个 layerGroup
                        if (oilScattersMarkers.length > 0) {
                            const oilScatterGroupTemp = L.layerGroup(oilScattersMarkers).addTo(
                                mymap
                            )
                            // vue.runtime.esm.js?2b0e:929 Uncaught (in promise) RangeError: Maximum call stack size exceeded
                            this.layerScatterMarkersGroups.push(oilScatterGroupTemp)
                            // this.layerGroupTemp = oilScatterGroupTemp
                            this.layerGroupScatters = oilScattersMarkers
                            // oilScatterGroup.addTo(mymap)

                            // TODO:[*] 20-07-09 方式2: 获取 layerGroup 的 id，但此种方法会引起 map 的layers 会会不断追加？何原因未找到
                            // const id = L.stamp(oilScatterGroup)
                            // // const tagetId = oilScatterGroup._leaflet_id
                            // this.layerGroupId = id
                            // this.layerGroupIds.push(id)
                            // 加载当前的current
                            this.processOptions.num.current =
                                this.processOptions.num.current + res.data.length
                        }
                    }
                }
            }
        )
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

    clearAllLayer(): void {
        this.clearOilAvgPolyLine()
        this.clearOilAvgPointList()
        this.clearAllPoint()
        // this.clearScatterPoint()
        this.clearHeatLayer()
    }

    clearScatterPointByGroup(): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        // console.log(`当前的layers数量:${Object.keys(mymap._layers)}`)
        // 方式2:
        // mymap.eachLayer((layer: L.Layer) => {
        //     // 找到当前的 group layer -> map.remove
        //     if (this.layerGroupIds.indexOf(layer._leaflet_id) >= 0) {
        //         const targetGroup = layer
        //         mymap.removeLayer(targetGroup)
        //     }
        // })

        // TODO:[*] 20-07-09 方式1：
        // if (this.layerGroupTemp != null) {
        //     mymap.removeLayer(this.layerGroupTemp)
        // }
        // TODO:[-] 21-01-04 由于使用分页查询，散点总数 > page_count 则会加载多次，所以会有多个 layerGroup
        if (this.layerScatterMarkersGroups.length > 0) {
            this.layerScatterMarkersGroups.forEach((temp) => {
                mymap.removeLayer(temp)
            })
        }

        this.layerGroupIds = []
    }

    // 清除全部的散点(及热力图)
    clearAllPoint(): void {
        this.clearScatterPoint()
        this.clearHeatLayer()
        this.clearScatterCircleList()
        this.clearScatterPointByGroup()
    }

    clearScatterPoint(): void {
        // const mymap: any = this.$refs.basemap['mapObject']
        this.oilScatterPointList = []

        // 以下暂时注释掉，修改为 removelayer
        // this.oilScatterCircleList.forEach((temp) => {
        //     mymap.removeLayer(temp)
        // })
        // TODO:[-] 20-06-21 修改后的批量从地图中删除 group -> 散点
        // if (this.layerGroupScatters != null) {
        //     mymap.removeLayer(this.layerGroupScatters)
        // }
    }

    // 清除散点list
    clearScatterCircleList(): void {
        this.oilScatterCircleList = []
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

    clearHeatLayer(): void {
        const mymap: any = this.$refs.basemap['mapObject']
        //去除掉heatlayer
        if (this.tempHeatLayer != null) {
            mymap.removeLayer(this.tempHeatLayer)
            this.tempHeatLayer = null
        }

        // this.tempHeatLayers.forEach((temp) => {
        //     mymap.removeLayer(temp)
        // })
        // 清除之后再赋空值
        // this.tempHeatLayers = []
    }

    // 清除与point与poly相关
    clearOilAvgPointList(): void {
        this.oilAvgPointList = []
    }

    clearOilAvgPolyLine(): void {
        this.polyline.latlngs = []
    }

    testOnOver(temp: OilPointRealDataMidModel): void {
        // console.log("鼠标移入点");
        if (this.tempOilDivIcon != null) {
            this.clearOilDivFromMap()
        }
        // console.log(temp);
        loadOilRealData(this.code, temp.date).then((res) => {
            if (res.status === 200) {
                // console.log(res);
                const tempData = res.data
                const oilTemp = new OilMidModel(
                    tempData['time'],
                    tempData['status'],
                    tempData['code'],
                    tempData['point']['coordinates'],
                    tempData['current'],
                    tempData['wind']
                )
                this.tempOil = oilTemp
                // this.addOilDiv2Map(oilTemp);
            }
        })
        // 鼠标移入散点之后加载详细数据的div
        // 需要向后台发送请求，parms有 date，code
    }

    // 向地图中添加溢油详细数据的div
    // 暂时不用
    addOilDiv2Map(tempOil: OilMidModel): void {
        // const myself = this
        const baseMap: any = this.$refs.basemap
        const myMap: any = baseMap['mapObject']
        const oilDivHtml = tempOil.toDivHtml()
        const oilDivIcon = L.divIcon({
            className: 'oil_icon_default',
            html: oilDivHtml,
            // 坐标，[相对于原点的水平位置（左加右减），相对原点的垂直位置（上加下减）]
            iconAnchor: [-20, 30]
        })

        const oilDivIconTemp = L.marker([tempOil.latlon[1], tempOil.latlon[0]], {
            icon: oilDivIcon
        }).addTo(myMap)
        // console.log("将divIcon插入map中");
        this.tempOilDivIcon = oilDivIconTemp
    }

    // 根据 case code 获取对应的 case model 信息
    loadTargetOilModelData(code: string) {
        this.currentCaseCoverageList = []
        const oilModel = new CaseModelInfo(code)
        this.initControlLayer(true)
        return oilModel.getCaseModelInfo().then((res) => {
            this.targetOilModelData = res
            // TODO:[-] 20-12-31 注意对于 流场 + 风场，有一个未选择时，会出现 gids 出现 -1 的情况，需要剔除？
            // 此处目前的解决办法是从 gids 中剔除 默认的 -1
            res.gids = res.gids.filter((val) => val !== DEFAULT_COVERAGE_ID)
            loadCoverageListByIds(res.gids).then((resCoverageList) => {
                /*
                    coverage_area: 502
                    coverage_type: 401
                    create_date: "2020-06-19T06:20:31Z"
                    dimessions: "time,lat,lon"
                    file_name: "ecsnew_current_20200618.nc"
                    file_size: 369656808
                    id: 65
                    is_original: null
                    relative_path: "COMMON\DAILY\2020\06\16"
                    root_path: "D:\03data\geoserver_data\current"
                    variables: "u,v"
                    []
                */
                // 返回 指定 ids 的对应的 geo_coverageinfo 集合
                if (resCoverageList.status == 200) {
                    loadGeoserverInfo().then((resGeoSer) => {
                        // 此处只是用于获取 geoserver 的服务地址
                        if (resGeoSer.status == 200) {
                            const server: { host: string } = resGeoSer.data[0]
                            resCoverageList.data.forEach(
                                (temp: {
                                    id: number
                                    file_name: string
                                    coverage_type: number
                                    coverage_area: number
                                }) => {
                                    const coverageName = temp.file_name.split('.')[0]
                                    this.currentCaseCoverageList.push(
                                        new CoverageMin(
                                            temp.id,
                                            coverageName,
                                            temp.coverage_type,
                                            temp.coverage_area
                                        )
                                    )
                                    // 执行 add wms layer (to control 不再使用 control 了)
                                    if (temp.coverage_type === DictEnum.COVERAGE_TYPE_WIND) {
                                        // TODO:[-] 20-07-07 注意若 返回的 coverage 为 风场(风场数据是需要加载wms服务的),所以此处需要修改 this.wmsOptions -> coverageId
                                        this.wmsOptions.coverageId = temp.id
                                        this.windOptions.coverageId = temp.id
                                        // TODO:[-] 21-02-10 新加入了 wind raster
                                        this.windRasterOptions.coverageId = temp.id
                                        // TODO:[-] 21-03-04 由于在加载 case info 时，不需要手动触发加载 wms 相关服务以及 windy 效果的服务,以下暂时注释掉
                                        // this.loadWMSFactory(temp.id, this.targetDate, server)
                                    }
                                    // TODO:[-] + 20-07-07 执行 add velocity layer
                                    if (temp.coverage_type == DictEnum.COVERAGE_TYPE_CURRENT) {
                                        this.velocityOptions.coverageId = temp.id
                                        // 20-11-01 + 修改 currentRaster Opt
                                        this.currentRasterOptions.coverageId = temp.id
                                        // TODO:[-] 21-03-04 由于在加载 case info 时，不需要手动触发加载 wms 相关服务以及 windy 效果的服务,以下暂时注释掉
                                        // this.loadFlowWindyFactory(temp.id, this.targetDate)
                                    }
                                }
                            )
                        }
                    })
                }
            })
        })
    }

    loadTargetRealData(code: string, date: Date) {
        // const myself = this
        loadOilSpillingAvgRealData(code, date).then((res) => {
            if (res.status === 200) {
                // console.log(res.data);
                const data = res.data
                this.oilAvgRealData = new OilMidModel(
                    data['time'],
                    data['status'],
                    data['code'],
                    data['point']['coordinates'].reverse(),
                    data['current'],
                    data['wind']
                )
            }
        })
    }

    // TODO:[*] 19-11-05 根据当前的 code 获取oil avg的起止时间
    loadDateRange(): void {
        // const myself = this
        getTargetCodeDateRange(this.code)
            .then((res) => {
                if (res.status === 200) {
                    // 获取起止时间
                    const start = new Date(res.data['start'])
                    const end = new Date(res.data['end'])
                    /*
          下面需要获取：
                [ ] -1 有多少天
                [ ] -2 起始时间
                [ ] -3 每天的格子数量

        */
                    // console.log(res);
                    const daysCount = getDaysNum(start, end)
                    this.days = daysCount
                    // 20-02-20 加载其实时间范围时，为current赋值
                    // TODO:[-] 20-06-20 在获取时间范围时，只需要为起止时间赋值，不需要设置当前的时间
                    // this.$store.dispatch('map/setNow', start)
                    this.startDate = start
                    this.finishDate = end
                    // TODO:[*] 19-11-07 此处每次获取完start之后，先赋值给current，之后再由timebar选择之后再更新
                    this.targetDate = start
                }
            })
            .catch((res) => {
                console.log(`获取时间范围出错${res}`)
            })
    }

    // TODO:[*] 20-04-17 根据当前的 task -> db: user_taskinfo -> rela_geo_base -> geo_coverageinfo
    loadDateRangeByCoverage(): void {}

    // 将当前的溢油数据的div从map中移出
    clearOilDivFromMap(): void {
        // console.log("鼠标移出");
        // const myself = this
        const mymap: any = this.$refs.basemap['mapObject']
        mymap.removeLayer(this.tempOilDivIcon)
        this.tempOilDivIcon = null
    }

    // TODO:[*] 19-11-12 不再使用此种方式，暂时注释掉
    get current(): void {}

    handleClose(): void {}

    submitCaseModel(): void {}

    // 20-11-05 为了使监听 -> currentRasterOptions 可以监听到其中的值发生变化
    get getCurrentRasterOptions(): IRasterOptions {
        return { ...this.currentRasterOptions }
    }

    // TODO:[*] 19-11-08 使用vuex-clas的方式监听oil 的两个select
    @Getter('getShowFactor', { namespace: 'oil' }) getShowFactor

    @Watch('getShowFactor')
    OnShowFactor(val: number) {
        // console.log(`监听到vuex中namespace:oil factor发生变化:${valNew}`);
        this.showFactor = val
        // TODO:[-] 20-01-23 此处暂时注释掉对于factor改变后应该加载的业务逻辑
    }

    // TODO:[*] 19-11-12 根据 current showType showFactor决定的加载的layer
    loadTrackFactory(count: number): void {
        const valNew: number = this.showType
        // TODO:[*] 19-11-13 加入了clear方法，清除散点以及热图（或放在各个load方法中）
        // this.clearAllLayer()
        // TODO:[-] 20-02-21 此处不再调用 清除全部图层 的方法改为清除散点(热力图)
        this.clearAllPoint()

        this.clearHeatLayer()
        const oilCls = new Oil({
            code: this.code,
            dt: this.targetDate,
            interval: 1000,
            pageCount: this.isPagination === false ? count : DEFAULT_SCATTER_PAGE_COUNT,
            isPagination: this.isPagination
        })
        switch (valNew) {
            // 散点
            case ShowType.SCATTER:
                // 切换为散点视图
                // TODO:[-] 20-01-23 此处放弃读取散点的原先方式，改为直接调用oil.ts的方法的方式
                // this.loadTrackScatterPoint();

                // TODO:[-] 20-07-09 暂时去掉看 mymap._layers 是否还会增加
                oilCls
                    .intervalLoadTracks(count, this.loadTrackScatterPoint, this.processOptions)
                    .then((_) => {
                        this.isZoomLock = false
                        // 加入提示
                        this.$message({ message: `加载完成case:${this.casecode}`, type: 'success' })
                    })
                    .catch((res) => {
                        this.$message.error('加载出错')
                    })
                break
            case ShowType.HEATMAP:
                // 切换为热图视图
                // TODO:[*] 20-01-23 此处改为和上面的加载散点的相同的方式
                // 20-01-23 原始版本注释掉

                // const intervalPromist = (resolve, reject) => {}
                // new Promise(intervalPromist).then((_) => {
                //     console.log('所有请求均已执行结束')
                // })
                oilCls
                    .intervalLoadTracks(count, this.loadTrackHeatmap, this.processOptions)
                    .then((_) => {
                        // console.log('all 异步调用结束')
                        const mymap: any = this.$refs.basemap['mapObject']
                        const heatData = {
                            max: 2,
                            data: this.oilHeatmapList
                        }
                        const heatConfig = {
                            // 此半径可以有效的滤掉由于 status = 2 造成的应该滤掉区域
                            radius: 0.002,
                            // radius: 0.01,
                            maxOpacity: 0.8,
                            scaleRadius: true,
                            useLocalExtrema: true,
                            latField: 'lat',
                            lngField: 'lng',
                            valueField: 'count'
                        }
                        let heatLayer: HeatmapOverlay = null
                        if (this.tempHeatLayer == null) {
                            heatLayer = new HeatmapOverlay(heatConfig)
                        } else {
                            heatLayer = this.tempHeatLayer
                        }
                        heatLayer.setData(heatData)
                        heatLayer.addTo(mymap)
                        this.tempHeatLayer = heatLayer
                    })
                // TODO:[*] 20-06-14 由于 intervalLoadTracks 需要延时的循环调用 this.loadTrackHeatmap 异步方法，现在将
                break
        }
    }

    @Getter('casecode', { namespace: 'case' }) casecode: string

    @Watch('casecode')
    onCaseCode(valNew: string): void {
        // console.log(`监听到store中的case code 变化 :${valNew}`)
        this.code = valNew
        // TODO:[-] 20-03-02 注意每次cascode发生变化后需要重新加载时间范围！
        this.loadDateRange()
        // TODO:[-] 20-07-02 加入根据指定 casecode 加载对应的 风场 及 流场 数据
        // 清除当前的散点
        this.clearAllLayer()
        this.initLayerControl()
        // 调用加载指定code的平均轨迹的方法
        this.loadTargetOilModelData(valNew).then((_) => {
            console.log(`释放时长${this.targetOilModelData.simulationDuration}`)
            // 注意此处需要判断模拟时长是否存在 (>0) 若存在则不加载平均轨迹
            if (this.targetOilModelData.simulationDuration === 0) {
                this.loadTrackAvgList()
            }
        })
        // 20-06-20 新加入了选择 case code 后需要加载全部的散点并聚焦
        // 由于性能不行，暂时去掉加载全部散点
        // 1- 加载全部的散点,并修改 this.isPagination =false
        // TODO:[-] 20-06-24 默认切换 case_code 后加载第一个时刻的散点(不再加载全部散点)
        this.isPagination = true
        this.loadTrack(false)
        // TODO:[-] 20-10-24 更新 casecode 后获取风场+流场的 id
    }

    @Getter('getShowType', { namespace: 'oil' }) getShowType: number

    @Watch('getShowType')
    onShowType(valNew: number) {
        // console.log(`监听到vuex中namespace:oil type发生变化:${valNew}`);
        this.showType = valNew

        this.isPagination = true
        // 20-06-13 对于切换了 showType 调用 loadTrack
        this.loadTrack()
    }

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

    // @Getter('getNow', { namespace: 'map' }) getcurrent

    // TODO:[*] 20-02-20 监听 store->map->mutations->GET_MAP_NOW
    // @Mutation(GET_MAP_NOW, { namespace: 'map' }) getcurrent

    @Getter('getNow', { namespace: 'map' }) getcurrent

    // @Debounce(2000)
    @Watch('getcurrent')
    async onCurrent(valNew: Date): Promise<void> {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        const that = this
        // TODO:[-] 21-01-27 将异步时间锁锁住
        this.setTimerLock(true)
        this.targetDate = new Date(valNew)
        // 注意此处缺少清除全部的layer
        this.clearAllLayer()
        this.clearVelocityLayer()
        this.initLayerControl()
        this.wmsOptions.current = valNew
        this.windOptions.current = valNew
        this.velocityOptions.current = valNew
        // 20-11-01 + 修改 currentRaster Opt
        this.currentRasterOptions.current = valNew
        // TODO:[*] 21-02-10 + 加入风场 raster 修改当前 current
        this.windRasterOptions.current = valNew
        // TODO:[-] 21-03-24 + 加入 海浪等值线的 监听当前时间事件
        this.waveOptions.current = valNew
        // TODO:[-] 21-04-05 + 加入 海浪-海表面高度 监听当前时间的事件
        this.waveWveRasterOption.current = valNew
        // TODO:[-] 20-06-13 将 监听 current 的方法抽象至 loadTrack() 中，以下注释
        this.isPagination = true
        // TODO:[-] 21-01-14 暂时取消 loadTrack 分时加载的情况
        // this.loadTrack()
        // TODO:[-] 21-01-12 新加入的一次性读取 geojson 散点
        // TODO:[-] 21-01-25 修改 优化后的加载溢油散点 由一次性加载 -> 由 case 与 current 分页加载
        _.defer(() => {
            _.debounce(
                async () => {
                    console.log(`异步操作开始|${new Date()}`)
                    if (that.code !== DEFAULT) {
                        if (that.oilScatters === null) {
                            const oilScatter = new OilScatter(that.code, 'mass_oil')
                            // TODO:[*] 21-01-25 修改了逻辑改为按照时间切片加载
                            // oilScatter.initGeoJson(this.code, 'mass_oil').then((_) => {
                            //     this.oilScatters = oilScatter
                            //     oilScatter.add2Map(mymap)
                            //     this.oilScatters.setCurrent(valNew)
                            // })
                            await oilScatter
                                .loadTargetDtTrack(that.code, that.targetDate, 'mass_oil')
                                .then((_) => {
                                    oilScatter.add2Map(mymap)
                                    oilScatter.setCurrent(that.targetDate)
                                    // TODO:[-] 21-01-13 设置 z-index
                                    mymap.getPane('myCustom').style.zIndex = 1900
                                })
                            that.oilScatters = oilScatter
                        } else {
                            await that.oilScatters
                                .loadTargetDtTrack(that.code, that.targetDate, 'mass_oil')
                                .then((_) => {
                                    that.oilScatters.setCurrent(that.targetDate)
                                })
                        }
                        console.log(`异步操作结束|${new Date()}`)
                    }
                    // 结束后解除锁定
                    // 设置一个延时
                    setTimeout(() => {
                        that.setTimerLock(false)
                        console.log('延迟解除 timer lock')
                    }, 1500)
                    // this.setTimerLock(false)})
                },
                1500,
                {
                    trailing: true,
                    leading: true
                }
            )()
        })
    }

    loadTrack(isAll = false): void {
        // const current = this.wmsOptions.current
        const current = this.windOptions.current
        const showType = this.showType
        if (this.code !== DEFAULT) {
            // TODO:[*] 20-01-23 选定时间更新后先获取当前时间的散点总数
            getTargetTimeTrackCount(this.code, current, isAll).then((res) => {
                if (res.status === 200) {
                    const trackCount = res.data
                    // TODO:[-] 20-02-01 将散点的总数赋值给options
                    this.processOptions.num.sum = trackCount
                    this.loadTrackFactory(trackCount)
                    // TODO:[*] 19-11-12 调用修改后的loadTrack 工厂方法

                    // TODO:[*] 20-01-23 根据获取的当前时间的散点的数量，执行分页请求
                    // 先加载oil 的realdata，再加载热力图
                    this.loadTargetRealData(this.code, this.targetDate)
                }
            })
        }
    }

    // TODO:[-] 20-04-16 注意此处的 Getter -> geo.ts -> getters 而不是 actions!
    @Getter('coverageid', { namespace: 'geo' }) getCoverageId

    @Watch('getCoverageId')
    onCoverageId(valNew: number): void {
        // TODO:[*] 21-04-06 注意此处的 监听 coverageid，不会有改变
        // this.wmsOptions.coverageId = valNew
        this.windOptions.coverageId = valNew
        this.velocityOptions.coverageId = valNew
        // 20-11-01 + 修改 currentRaster Opt
        this.currentRasterOptions.coverageId = valNew
        // 20-02-10 + 加入修改 wind raster coverage_id
        this.windRasterOptions.coverageId = valNew
        // TODO:[-] 21-04-05 + 修改 海浪-海表面高度
        this.waveWveRasterOption.coverageId = valNew
        // 2- 获取时间范围等信息(概述信息)
    }

    @Getter('coverageType', { namespace: 'geo' }) getCoverageType

    @Watch('getCoverageType')
    onCoverageType(valNew: number): void {
        // console.log(`|oilSpillingMap3| -> 监听到 coverageType 发生变化${valNew}`)
        const typeDict = DictEnum[valNew]
        if (DictEnum[typeDict] == DictEnum.COVERAGE_TYPE_CURRENT) {
            this.wmsWorkSpace = 'nmefc_current'
        } else if (DictEnum[typeDict] == DictEnum.COVERAGE_TYPE_WIND) {
            this.wmsWorkSpace = 'nmefc_wind'
        }
    }

    // 由于 current + coverageId 发生变化时触发的方法
    get currentAndCoverage(): any {
        // console.log('-------------------')
        // console.log('由 current 或 coverageId 触发的计算属性！！')
        // console.log(`current:${this.getcurrent}|coverageId:${this.getCoverageId}`)
        // console.log('-------------------')
        return this.getcurrent + this.getCoverageId
    }

    @Watch('velocityOptions', { immediate: true, deep: true })
    onVelocityOptions(valNew: IVelocityOptions, valOld: IVelocityOptions): void {
        // 监听流场 opt
        // TODO:[*] 20-10-25 此处加入一个判断
        if (this.verifyOpt(valNew, false)) {
            // TODO:[-] 20-10-23 此处需要改造为工厂方法
            if (valNew.coverageId != DEFAULT_COVERAGE_ID) {
                switch (valNew.productType) {
                    // 流场则通过类windy的方式加载流场动效
                    case ProductEnum.COVERAGE_TYPE_CURRENT: {
                        loadGeoserverInfo().then((res) => {
                            if (res.status == 200) {
                                const server: { host: string } = res.data[0]
                                this.loadFlowWindyFactory(valNew.coverageId, valNew.current)
                            }
                        })
                        break
                    }
                    // 风场则调用风场方法
                    case ProductEnum.COVERAGE_TYPE_WIND: {
                        // TODO:[*] 20-10-26 对于监听的 velocityOptions 中不再会触发风场的相关操作，集合至 监听 windOptions 中
                        // this.loadGeoTiffD3js(valNew.coverageId, valNew.current, this.zoomLevel)
                        break
                    }
                }
            }
        }
    }

    // TODO:[*] 20-10-26 + 加入用来验证 风场|流场|流场raster opt 的变动情况
    verifyOpt(newvalNew: { coverageId: number; isShow: boolean }, unChechShow = true): boolean {
        if (newvalNew.coverageId === DEFAULT_COVERAGE_ID) {
            return false
        }
        return (unChechShow || newvalNew.isShow) && this.loadRasterLock
    }

    @Watch('wmsOptions', { immediate: true, deep: true })
    onWmsOptions(valNew: { coverageId: number; current: Date }): void {
        const that = this
        if (valNew.coverageId !== DEFAULT_COVERAGE_ID) {
            // TODO:[-] 20-06-02 每次先清除 layer wms
            const basemap: any = this.$refs.basemap
            const mymap: any = basemap['mapObject']
            /*
            逻辑: 根据 coverage_id -> geo_coverageinfo -> rela_geo_base
                                                                        -> geo_workspaceinfo
                                                                        -> geo_storeinfo
                                                                        -> geo_layerinfo
        */
            // 1- 加载 geo_layerinfo
            loadGeoserverInfo().then((res) => {
                if (res.status == 200) {
                    // TODO:[-] 20-07-07 以下部分已经封装至 this.loadWMSFactory 中
                    const server: { host: string } = res.data[0]
                    this.loadWMSFactory(valNew.coverageId, valNew.current, server).then((_) => {
                        // TODO:[-] 20-08-12 loadWMSFactory后调用 coverageWMS2Map
                        // console.log(this.getLayers)
                        this.coverageWMS2Map(this.getLayers)
                    })

                    // TODO:[*] 20-07-07 以下部分注释掉由上面 this.loadWMSFactory封装
                    // 是一个server list
                    // const server: { host: string } = res.data[0]
                    // const options: ICoverageOptions = {
                    //     baseUrl: server.host,
                    //     workSpace: '',
                    //     layer: '',
                    //     style: ''
                    // }

                    // const coverageTemp = new Coverage(options)
                    // coverageTemp.loadGeoLayer(valNew.coverageId).then((resCoverage) => {
                    //     const currentStr = moment.utc(valNew.current).toISOString()
                    //     // TODO:[*] 20-06-04 新加入 对于 工作区的动态添加功能
                    //     const wmsLayer = L.tileLayer.wms(
                    //         `http://localhost:8082/geoserver/${this.wmsWorkSpace}/wms?TIME=${currentStr}`,
                    //         {
                    //             layers: coverageTemp.layer,
                    //             styles: coverageTemp.style,
                    //             format: 'image/png',
                    //             transparent: true
                    //         }
                    //     )
                    //     // TODO:[*] 20-07-07 调取 wms 工厂方法
                    //     if (this.windLayer !== null) {
                    //         this.windLayer.removeFrom(mymap)
                    //     }
                    //     this.windLayer = wmsLayer

                    //     const fluxDivIconTarget = wmsLayer.addTo(mymap)

                    //     // 加入 windy 的效果
                    //     loadWindFlow(valNew.current, valNew.coverageId).then((res) => {
                    //         if (res.status == 200) {
                    //             // console.log(res.data)
                    //             this.initDemoMap(res.data)
                    //         }
                    //     })
                    // })
                }
            })
        }
    }

    // TODO:[-] 20-10-25 + 加入的监听风场变化
    @Watch('windOptions', { immediate: true, deep: true })
    onWindOptions(valNew: IRasterOptions, valOld: IRasterOptions): void {
        if (this.verifyOpt(valNew, false)) {
            if (valNew.productType === ProductEnum.COVERAGE_TYPE_WIND) {
                // 先清除当前的 windBarLayer，再load
                this.clearwindBarLayer()
                this.loadWindLayer(valNew.coverageId, valNew.current, valNew.level)
            }
        } else if (this.verifyOpt(valNew)) {
            if (this.windOptions.isShow === false) {
                this.clearwindBarLayer()
            }
        }
    }

    // TODO:[-] 21-03-24 + 监听全球海浪等值线
    @Watch('waveOptions', { immediate: true, deep: true })
    onWaveOptions(valNew: IRasterOptions): void {
        const schema = 'ecmwf_wve_global'
        const basemap: any = this.$refs.basemap
        const mymap: L.Map = basemap['mapObject']
        const waveContour = new WaveContourLine(schema)
        const that = this

        // TODO:[-] 21-03-26 注意海浪由于不需要与 coverage 对应，
        /* 查询方式:
                    -1 直接根据 current 获取 wave 等值线的对应表名称 (pg)
        */
        // 手动添加一个 非查询后的 coverage_id
        if (this.verifyOpt(valNew, false)) {
            if (this.waveContourLayer) {
                mymap.removeLayer(that.waveContourLayer)
            }
            waveContour
                .loadPolyWFS(mymap, valNew.current)
                .then((layer) => {
                    if (layer) {
                        that.waveContourLayer = layer
                    }
                })
                .catch((e) => {
                    that.$message.error('当前时间没有对应的海浪等值线')
                })
        } else if (this.verifyOpt(valNew)) {
            if (!this.waveOptions.isShow) {
                mymap.removeLayer(that.waveContourLayer)
            }
        }
    }

    // TODO:[-] 21-02-10 + 监听风场 raster 的变化以加载风场 geotiff to map
    @Watch('windRasterOptions', { immediate: true, deep: true })
    onWindRasterOptions(valNew: IRasterOptions, valOld: IRasterOptions): void {
        if (this.verifyOpt(valNew, false)) {
            if (valNew.productType === ProductEnum.COVERAGE_TYPE_WIND) {
                // 先清除当前的 windBarLayer，再load
                this.clearWindRasterLayer()
                this.loadWindRasterLayer(
                    valNew.coverageId,
                    valNew.current,
                    valNew.level,
                    valNew.area
                )
            }
        } else if (this.verifyOpt(valNew)) {
            if (!this.windRasterOptions.isShow) {
                this.clearWindRasterLayer()
            }
        }
    }

    // TODO:[-] 21-04-05 + 监听 海浪-海表面高度 raster 的变化以加载海浪 geotiff -> map
    @Watch('waveWveRasterOption', { immediate: true, deep: true })
    onWaveWveRasterOptions(valNew: IRasterOptions): void {
        const that = this
        if (this.verifyOpt(valNew, false)) {
            if (valNew.productType === ProductEnum.COVERAGE_TYPE_WAVE_WVE) {
                // 先清除当前的 windBarLayer，再load
                this.clearWaveWveRasterLayer()
                this.loadWaveWveRasterLayer(
                    valNew.coverageId,
                    valNew.current,
                    valNew.level,
                    valNew.area
                )
            }
        } else if (this.verifyOpt(valNew)) {
            if (!this.waveWveRasterOption.isShow) {
                this.clearWaveWveRasterLayer()
            }
        }
    }

    @Watch('getCurrentRasterOptions', { immediate: true, deep: true })
    onCurrentRasterOptions(valNew: IRasterOptions, valOld: IRasterOptions): void {
        // console.log(`测试时使用:onCurrentRasterOptions valNew:${valNew}| oldNew:${valOld}`)

        if (this.verifyOpt(valNew, false)) {
            const mymap: L.Map = this.$refs.basemap['mapObject']
            if (valNew.productType === ProductEnum.COVERAGE_TYPE_CURRENT) {
                // 加载 流场raster
                const myRaster: IRaster = new RasterGeoLayer(
                    valNew.coverageId,
                    valNew.current,
                    valNew.area
                )
                myRaster
                    .add2map(
                        mymap,
                        (
                            opt = {
                                message: `当前时间${current}没有对应的tif文件`,
                                type: 'warning'
                            }
                        ) => {
                            this.$message({
                                message: `当前时间${current}没有对应的tif文件`,
                                type: 'warning'
                            })
                        }
                    )
                    .then((res) => {
                        this.currentRaster = myRaster
                        this.currentRasterLayerId = this.currentRaster.rasterLayer._leaflet_id
                    })
            }
        }
        // ---
        // if (valOld != undefined && valNew.current != valOld.current && this.currentRaster != null) {
        //     const mymap: L.Map = this.$refs.basemap['mapObject']
        //     // 清除 raster layer
        //     this.clearLayerById(this.currentRasterLayerId)
        //     this.currentRaster = null
        // }
        // ---
        if (valNew.isShow === false && this.currentRaster != null) {
            // 清除 raster layer
            this.clearLayerById(this.currentRasterLayerId)
            // this.currentRaster = null
            // this.currentRasterLayerId=DEFAULT_LAYER_ID
        }
    }

    @Watch('currentRasterLayerId')
    onCurrentRasterLayerId(valNew: number, valOld: number): void {
        if (valOld !== DEFAULT_LAYER_ID) {
            this.clearLayerById(valOld)
        }
    }

    // 加载 wms 相关的工厂方法
    loadWMSFactory(coverageId: number, current: Date, ser: { host: string }): Promise<void> {
        const that = this
        const basemap: any = this.$refs.basemap
        const mymap: any = basemap['mapObject']
        const options: ICoverageOptions = {
            baseUrl: ser.host,
            workSpace: '',
            layer: '',
            style: ''
        }
        const coverageTemp = new Coverage(options)
        return coverageTemp.loadGeoLayer(coverageId).then((resCoverage) => {
            // TODO:[-] 20-07-08 将 加载的风场 wms 的layer 也加入 control layer 中
            const currentStr = moment.utc(current).toISOString()
            // TODO:[*] 20-06-04 新加入 对于 工作区的动态添加功能
            const wmsLayer = L.tileLayer.wms(
                `http://localhost:8082/geoserver/${this.wmsWorkSpace}/wms?TIME=${currentStr}`,
                {
                    layers: coverageTemp.layer,
                    styles: coverageTemp.style,
                    format: 'image/png',
                    transparent: true
                }
            )
            // this.windWMS = new WMSMidModel(
            //     `http://localhost:8082/geoserver${this.wmsWorkSpace}/wms?TIME=${currentStr}`,
            //     new WMSOptionsMidModel(coverageTemp.layer, 1500, coverageTemp.style)
            // )
            // TODO:[-] 20-07-30 新加入的 关于 wind abs 的wms服务
            const wmsAbsLayer = L.tileLayer.wms(
                `http://localhost:8082/geoserver/${this.wmsWorkSpace}/wms?TIME=${currentStr}`,
                {
                    // p500
                    layers: 'nmefc_wind:nmefc_wrf_2020061800_abs_new',
                    // razer
                    // layers: 'nmefc_wind:nmefc_wrf_2020062200_abs_new',
                    // razer
                    // layers: 'nmefc_wind:nmefc_wrf_2020060200_abs',
                    styles: 'nmefc_wind:wind_abs_new',
                    format: 'image/png',
                    transparent: true
                }
            )
            if (this.windLayer !== null && this.windAbsLayer != null) {
                this.windLayer.removeFrom(mymap)
                this.windAbsLayer.removeFrom(mymap)
            }
            // 主要是为当前的 windLayer 与 windAbsLayer 赋值
            this.windLayer = wmsLayer
            this.windAbsLayer = wmsAbsLayer
            // TODO:[*] 20-07-22 新加入了自定义样式的功能
            const customerLayers = {
                '<i class="fa fa-user" aria-hidden="true"></i> <span class="my-layer-item">风场-nmefc</span>': wmsLayer
            }
            // TODO:[*] 20-07-24 此处修改为通过监听 vuex -> map -> GET_MAP_LAYERS 来手动加载 layer的方式
            if (this.layerControl != null) {
                this.layerControl.addOverlay(wmsLayer, '风场-nmefc')
                this.layerControl.addOverlay(wmsAbsLayer, '风场 abs -nmefc')
                // this.layerControl.addOverlay(customerLayers)
            }
            // 20-07-08 去掉 add to map,因为使用了 layercontrol
            // wmsLayer.addTo(mymap)

            // TODO:[*] 20-07-06 加入在 control 中,不直接添加至地图中
            // oilSpillingMap3.vue?19ef:1124 Uncaught (in promise) TypeError: Cannot read property 'addOverlay' of null
            // this.layerControl.addOverlay(wmsLayer, '风场-nmefc')
            // this.layerControl.addTo(mymap)
            // const fluxDivIconTarget = wmsLayer.addTo(mymap)
        })
    }

    // 加载 风场 flow 效果的工厂方法
    loadFlowWindyFactory(coverageId: number, current: Date): void {
        // 加入 windy 的效果
        loadWindFlow(current, coverageId).then((res) => {
            if (res.status == 200) {
                // console.log(res.data)
                this.initDemoMap(res.data)
            }
        })
    }

    get wmsOpt(): any {
        const { getCoverageId, getcurrent } = this
        return { getCoverageId, getcurrent }
    }

    @Watch('wmsOpt')
    onWmsOpt(valNew: any): void {
        // console.log(valNew)
    }

    @Mutation(SET_CURRENT_LATLNG, { namespace: 'map' })
    setLatlng

    @Getter('GET_CURRENT_LATLNG', { namespace: 'map' }) getLatlng: Array<number>

    @Watch('getLatlng')
    onLatlng(valNew: Array<number>): void {
        this.addPositionMarker2Map(valNew)
    }

    @Mutation(SET_INITIAL_LATLNG, { namespace: 'map' })
    setInitialLatlng

    @Getter(GET_INITIAL_LATLNG, { namespace: 'map' })
    getInitialLatlng: number[]

    @Getter('GET_CURRENT_LATLNG_LOCK', { namespace: 'map' }) getCurrentLatlngLock: boolean

    // 监听当前 map 需要叠加的 layer
    @Getter(GET_MAP_LAYERS, { namespace: 'map' })
    getLayers: LayerTypeEnum[]

    // + 21-01-27 新加入的用来控制组件间触发异步时间造成的错位情况的 时间锁
    @Mutation(SET_TIMER_LOCK, { namespace: 'map' })
    setTimerLock

    @Getter(GET_TIMER_LOCK, { namespace: 'map' }) getMapTimerLock: boolean

    // 动态将 coverage wms add to map
    coverageWMS2Map(lays: LayerTypeEnum[]): void {
        // TODO:[-] 20-10-26 暂时放弃此方法，因为不再使用 wms 的方式加载风场|流场
        // console.log(`主map中监听到vuex -> map -> GET_MAP_LAYERS 的变化为:${valNew}`)
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
            if (lays.findIndex((temp) => temp === lastLayer) < 0) {
                // 说明没有
                if (lastLayer === LayerTypeEnum.WIND_RASTER_LAYER) {
                    this.windLayer.removeFrom(mymap)
                    this.windAbsLayer.removeFrom(mymap)
                    this.windRasterOptions.isShow = false

                    // this.currentRasterOptions.isShow = false
                } else if (lastLayer === LayerTypeEnum.WIND_BAR_LAYER) {
                    // 风力杆
                    this.clearwindBarLayer()
                    this.windOptions.isShow = false
                } else if (
                    lastLayer === LayerTypeEnum.CURRENT_FLOW_LAYER &&
                    this.velocityLayer != undefined
                ) {
                    // TODO:[-] 21-01-29 ERROR:
                    // Uncaught (in promise) TypeError: Cannot read property 'removeFrom' of null
                    // TODO:[*] 21-03-04 以下封装至 this.clearVelocityLayer 中
                    // this.velocityLayer.removeFrom(mymap)
                    // this.velocityOptions.isShow=false
                    // ---
                    this.clearVelocityLayer()
                } else if (lastLayer === LayerTypeEnum.CURRENT_RASTER_LAYER) {
                    this.currentRasterOptions.isShow = false
                } else if (lastLayer === LayerTypeEnum.WAVE_CONTOUR) {
                    this.waveOptions.isShow = false
                } else if (lastLayer === LayerTypeEnum.WAVE_WVE_RASTER) {
                    // + 21-04-08 海浪-高度栅格
                    this.waveWveRasterOption.isShow = false
                }
            }
        })
        // 先清除 this.existLayers
        this.existLayers = []
        lays.forEach((tempLayerType) => {
            switch (tempLayerType) {
                // 风场 bar
                case LayerTypeEnum.WIND_BAR_LAYER:
                    // loseWindLayer = true
                    this.existLayers.push(tempLayerType)
                    // 西北太风场
                    // TODO:[-] 20-10-26 此处已修改为 windBarLayer -- 由于此处使用的 canvasMarkerLayer 是改造后的 Layer 并没有 .addTo 方法
                    // if (this.windBarLayer.canvasMarkerLayer != null) {
                    //     this.windBarLayer.canvasMarkerLayer.addTo(mymap)
                    // }
                    // TODO:[-] 20-10-30 新的逻辑是通过 修改 this.windOptions.isShow 来触发相关的显示|remove的操作
                    this.windOptions.isShow = true
                    // if (this.windAbsLayer != null) {
                    //     this.windAbsLayer.addTo(mymap)
                    // }
                    break
                // 流场 flow
                case LayerTypeEnum.CURRENT_FLOW_LAYER:
                    // loseCurrentLayer = true
                    this.existLayers.push(tempLayerType)
                    this.velocityOptions.isShow = true
                    // 东中国海流场
                    // 此处应该有提示
                    if (this.velocityLayer != null) {
                        this.velocityLayer.addTo(mymap)
                    }
                    break
                // 流场 raster (geotiff)
                case LayerTypeEnum.CURRENT_RASTER_LAYER:
                    this.existLayers.push(tempLayerType)
                    this.currentRasterOptions.isShow = true
                    // TODO:[-] 21-03-01 由于 风场 和 流场 的加载是互斥，所以此处 流场 isShow 则需要手动将 风场 的 isShow -> false
                    this.windRasterOptions.isShow = false
                    break
                // 对于 流场的 放在 -> onCurrentRasterOptions 中操作
                // 判断一下 this.currentRasterOptions
                // if (this.currentRaster != null) {
                //     const mymap = this.$refs.basemap['mapObject']
                //     this.currentRaster.add2map(mymap)
                // }
                // TODO:[-] 21-02-10 新加入的 风场 raster layer
                case LayerTypeEnum.WIND_RASTER_LAYER:
                    this.existLayers.push(tempLayerType)
                    this.windRasterOptions.isShow = true
                    // 注意风场与流场的互斥性
                    this.currentRasterOptions.isShow = false
                    // 需要添加一个类似 windOptions.isShow的属性
                    break
                case LayerTypeEnum.WAVE_CONTOUR:
                    this.existLayers.push(tempLayerType)
                    this.waveOptions.isShow = true
                    break
                case LayerTypeEnum.WAVE_WVE_RASTER:
                    this.existLayers.push(tempLayerType)
                    this.waveWveRasterOption.isShow = true
                    break
            }
        })
    }

    @Watch('zoom')
    OnZoom(valNew: number, valOld: number): void {
        // 使用此种方式实现对于平移触发 -> update:zoom 相同值的过滤
        // console.log(`new:${valNew}|old:${valOld}`)
        let level = 0
        if (valNew > 5) {
            level = 5
        } else if (valNew <= 5) {
            level = 3
        }
        // 修改对应的风力杆 -> windOptions
        this.windOptions.level = level
    }

    zoomUpdated(valNew: number, valOld: number): void {
        this.zoom = valNew
        // console.log(`new:${valNew}|old:${valOld}`)
    }

    @Watch('getLayers')
    OnLayers(valNews: LayerTypeEnum[]): void {
        this.coverageWMS2Map(valNews)
    }
}
</script>
<style lang="less">
// TODO:[*] 19-11-13 注意引入less时不需要加.less后缀
@import '../../../styles/base';
@import '../../../styles/map/my-leaflet';
@import './style/arrow';

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

.typhoon_data_div .row {
    color: white;
}

.typhoon_data_div .card-body {
    color: white;
}

.typhoon_data_div {
    z-index: 10000;
    color: white;
    padding-left: 0px !important;
    padding-right: 0px !important;
    background: linear-gradient(to right, #1a6865 30%, rgba(4, 107, 114, 0.103));
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

.row_footer {
    margin-left: -21px;
    margin-right: -21px;
    margin-bottom: -21px;
}

/* 底部div */
.typhoon_footer {
    display: flex;
    flex-direction: row;

    background: #0044cc;
    width: 100%;
    color: white;
    border: 1px;
    text-align: center;
    /* 设置圆角 */
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    /* margin-left: -21px;
				margin-right: -21px; */
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

.my-marker {
    .my-leaflet-pulsing-icon {
        width: 12px;
        height: 12px;
        border-radius: 100%;
        -webkit-box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);
        box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);
        background: #76eec6;
    }
}

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
