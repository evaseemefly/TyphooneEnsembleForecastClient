import * as L from 'leaflet'
import { Component, Vue } from 'vue-property-decorator'
// 20-08-11 wms 相关的中间 model
import { WMSOptionsMidModel, WMSMidModel } from '@/middle_model/geo'
import { baseUrl } from '@/api/common'
import { loadSurgeForecastAreaGeoJson } from '@/api/geoserver'

/**
 * + 21-01-27 作为 mixin 的 wms常量
 *
 * @class WMSMixin
 * @extends {Vue}
 */
@Component
class WMSMixin extends Vue {
    // baseHost = 'http://128.5.10.21'
    // baseHost = 'http://localhost'
    // basePort = '8084'
    // baseUrl = `${this.baseHost}:${this.basePort}`
    baseUrl = baseUrl
    // mixin definition here
    landWMS: WMSMidModel = new WMSMidModel(
        `${this.baseUrl}/geoserver/nmefc_current/wms?`,
        new WMSOptionsMidModel('nmefc_current:land_china')
    )
    ninelineWMS: WMSMidModel = new WMSMidModel(
        `${this.baseUrl}/geoserver/nmefc_current/wms?`,
        new WMSOptionsMidModel('nmefc_current:9line')
    )
    southlandWMS: WMSMidModel = new WMSMidModel(
        `${this.baseUrl}/geoserver/nmefc_current/wms?`,
        new WMSOptionsMidModel('nmefc_current:southsea_land')
    )
    // 20-07-29 新加入的东中海的区域
    ecsLineWMS: WMSMidModel = {
        url: `${this.baseUrl}/geoserver/nmefc_current/wms?`,
        options: new WMSOptionsMidModel('nmefc_current:ecs_shp')
    }

    ecsLineWMSUrl = `${this.baseUrl}/geoserver/nmefc_current/wms?`

    ecsLineWMSOptions = {
        layers: 'nmefc_current:ecs_shp', //需要加载的图层
        format: 'image/png', //返回的数据格式
        transparent: true
    }

    windWMS: WMSMidModel = {
        url: `${this.baseUrl}/geoserver//wms?TIME=2020-06-18T10:00:00.000Z`,
        options: new WMSOptionsMidModel('nmefc_wind:nmefc_wrf_2020061800')
    }

    // TODO:[-] 20-07-31 新加入的台湾区域的land 多边形 现改为 china
    landTwPoygonsWMS: WMSMidModel = new WMSMidModel(
        `${this.baseUrl}/geoserver/nmefc_common/wms?`,
        new WMSOptionsMidModel('nmefc_common:new_china_land', 1500)
    )

    // TODO:[-] 20-08-26 新加入的全球国境线
    worldLineWMS: WMSMidModel = new WMSMidModel(
        `${this.baseUrl}/geoserver/nmefc_common/wms?`,
        new WMSOptionsMidModel('nmefc_common:world_map_line', 1500)
    )

    // TODO:[-] 21-03-05 新加入的测试西北太剪切过的网格
    ewtDiffPoygonsWMS: WMSMidModel = new WMSMidModel(
        `${this.baseUrl}/geoserver/SearchRescue/wms?`,
        new WMSOptionsMidModel('SearchRescue:020Grid_TEST_EWT_DIFF', 1500)
    )

    // TODO:[-] 22-03-29 风暴潮南海区预报范围多边形
    surgeForecastAreaSouthWMS: WMSMidModel = new WMSMidModel(
        `${this.baseUrl}/geoserver/nmefc_common/wms?`,
        new WMSOptionsMidModel('nmefc_common:surge_area_south_polygon')
    )
    // TODO:[-] 20-08-26 使用本地 nginx 映射的文件系统
    // http://localhost:8080/content/localhost/images/map/tdt-8level/5/31/11.png
    // url = 'http://localhost:82/images/map/tdt-8level/{z}/{x}/{y}.png'
    // TODO:[-] 21-06-10 尝试引入 mapbox
    mapBoxToken =
        'pk.eyJ1IjoiZXZhc2VlbWVmbHkxIiwiYSI6ImNrcHE4OHJsejBobnoyb3BhOTkwb3MzbGwifQ.5ThyBJrIccBpeVi9pUdJnw'

    // url = `https://api.mapbox.com/styles/evaseemefly1/ckpq8ftgx0zhn17r0vidbxbwr/{z}/{x}/{y}.png?access_token=${this.mapBoxToken}`
    url =
        'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
    attribution =
        'powered by Ocean Flow © 2022 <a href="https://github.com/evaseemefly">evaseemefly & nmefc</a> '

    forecastAreaHover(): void {
        console.log('监听到当前wmsTileLayer hovered')
    }
    loadSurgeForecastAreaWFS(map: L.Map): void {
        const that = this
        loadSurgeForecastAreaGeoJson().then((res) => {
            if (res.status === 200) {
                const geosjon = L.geoJSON(res.data, {
                    style: {
                        fillColor: '#16a085',
                        weight: 2,
                        opacity: 0.9,
                        color: '#16a085',
                        dashArray: '3',
                        fillOpacity: 0.7
                    }
                })
                const layer: L.Layer = geosjon.addTo(map)
                return layer
            }
        })
    }
    getStyle(): {
        fillColor: any
        weight: number
        opacity: number
        color: string
        dashArray: string
        fillOpacity: number
    } {
        /*
        {type: "Feature", id: "020Grid_TEST_EWT_DIFF.1", geometry: {…}, geometry_name: "the_geom", properties: {…}, …}
geometry: {type: "MultiPolygon", coordinates: Array(1)}
            geometry_name: "the_geom"
            id: "020Grid_TEST_EWT_DIFF.1"
            properties: {id: 156, left: 103.117235198, top: 11.179733315999997, right: 103.317235198, bottom: 10.979733315999997}
            type: "Feature"
            val: 0.8304777386882245
            __proto__: Object
        */
        const that = this
        return {
            fillColor: '#16a085',
            weight: 2,
            opacity: 0.9,
            color: '#16a085',
            dashArray: '3',
            fillOpacity: 0.7
        }
    }
}
export { WMSMixin }
