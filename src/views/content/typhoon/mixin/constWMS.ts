import * as L from 'leaflet'
import { Component, Vue, Watch } from 'vue-property-decorator'
// 20-08-11 wms 相关的中间 model
import { WMSOptionsMidModel, WMSMidModel } from '@/middle_model/geo'
import { AreaEnum } from '@/enum/area'
import { baseUrl } from '@/api/common'
import { loadSurgeForecastAreaGeoJson } from '@/api/geoserver'

function onEachFeature(feature, layer) {
    const v = this
    layer.on('mouseover', function(e) {
        e.target.setStyle({
            color: '#1abc9cb4',
            opacity: 0.8,
            fill: false // 默认不再填充区域内的颜色
            // fillColor: '#34495e'
        })
    })
    layer.on('mouseout', function(e) {
        e.target.setStyle({
            color: '#1abc9c07'
            // fillColor: '#16a085'
        })
    })
}

/**
 * + 21-01-27 作为 mixin 的 wms常量
 *
 * @class WMSMixin
 * @extends {Vue}
 */
@Component
class WMSMixin extends Vue {
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

    // TODO:[-] 22-03-29 风暴潮南海区预报范围多边形
    surgeForecastAreaSouthWMS: WMSMidModel = new WMSMidModel(
        `${this.baseUrl}/geoserver/nmefc_common/wms?`,
        new WMSOptionsMidModel('nmefc_common:surge_area_south_polygon')
    )
    // TODO:[-] 20-08-26 使用本地 nginx 映射的文件系统
    // http://localhost:8080/content/localhost/images/map/tdt-8level/5/31/11.png
    // url = 'http://localhost:82/images/map/tdt-8level/{z}/{x}/{y}.png'
    // TODO:[-] 21-06-10 尝试引入 mapbox=
    mapBoxToken =
        'pk.eyJ1IjoiZXZhc2VlbWVmbHkxIiwiYSI6ImNrcHE4OHJsejBobnoyb3BhOTkwb3MzbGwifQ.5ThyBJrIccBpeVi9pUdJnw'

    // url = `https://api.mapbox.com/styles/evaseemefly1/ckpq8ftgx0zhn17r0vidbxbwr/{z}/{x}/{y}.png?access_token=${this.mapBoxToken}`
    url =
        'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
    // leaflet 右下角的文字显示
    attribution =
        'powered by Ocean Flow © 2022 authors: <a href="https://github.com/evaseemefly">evaseemefly</a> & <a href="limj@nmefc.cn"> limj</a> | nmefc '

    surgeForecastAreaPolygon = null
    surgeForecastAreaPolygonOpts = {
        onEachFeature: onEachFeature.bind(this),
        style: {
            weight: 2,
            opacity: 0.4,
            color: '#1abc9c07',
            // color: '#16a085',
            dashArray: '3',
            fillOpacity: 0.7
        }
    }
    surgeForecastArea: AreaEnum = AreaEnum.SOUTHCHINASEA
    // 三个海区的多边形 geojson
    surgeForecastAreaNorthPolygonGeoJson: L.GeoJSON = null
    surgeForecastAreaEastPolygonGeoJson: L.GeoJSON = null
    surgeForecastAreaSouthPolygonGeoJson: L.GeoJSON = null
    // 暂时不用
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
                    },
                    onEachFeature: this.onEachFeature
                })
                const layer: L.Layer = geosjon.addTo(map)
                return layer
            }
        })
    }
    // 创建 三个海区的 的geojson多边形数据(wfs)
    async createSurgeForecastAreaByWFS(): Promise<void> {
        const areaStr: string = this.getForeacastAreaStamp(AreaEnum.BOHAISEA)
        const res = await loadSurgeForecastAreaGeoJson('nmefc_common', areaStr)
        const resEast = await loadSurgeForecastAreaGeoJson(
            'nmefc_common',
            this.getForeacastAreaStamp(AreaEnum.EASTCHINASEA)
        )
        const resSouth = await loadSurgeForecastAreaGeoJson(
            'nmefc_common',
            this.getForeacastAreaStamp(AreaEnum.SOUTHCHINASEA)
        )
        this.surgeForecastAreaNorthPolygonGeoJson = res.data
        this.surgeForecastAreaEastPolygonGeoJson = resEast.data
        this.surgeForecastAreaSouthPolygonGeoJson = resSouth.data
    }
    /**
     *TODO:[-] 22-03-30 根据传入的预报区域获取不同的字符串戳
     *
     * @param {AreaEnum} area 传入预报区域枚举
     * @return {*}  {string} eg: surge_area_north_polygon
     * @memberof WMSMixin
     */
    getForeacastAreaStamp(area: AreaEnum): string {
        let areaStr = ''
        switch (true) {
            case area === AreaEnum.BOHAISEA:
                areaStr = 'surge_area_north_polygon'
                break
            case area === AreaEnum.EASTCHINASEA:
                areaStr = 'surge_area_east_polygon'
                break
            case area === AreaEnum.SOUTHCHINASEA:
                areaStr = 'surge_area_south_polygon'
                break
        }
        return areaStr
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

    onEachFeature(geojson: L.GeoJSON, feature: any, layer: L.Layer): void {
        function highlightFeature(e) {
            const layer = e.target

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            })

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront()
            }
        }
        function resetHighlight(e) {
            geojson.resetStyle(e.target)
        }
        layer.on({ mouseover: highlightFeature, mouseout: resetHighlight })
    }
}
export { WMSMixin }
