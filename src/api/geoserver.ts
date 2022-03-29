/*
    21-03-05 + 新加入的关于加载 geoserver 发布的 wfs 服务所使用的api归结
*/

import axios from 'axios'
import { hostGeo, host, hostGeoCors } from './common'
import authHeader from './auth-header'
import { DEFAULT_COVERAGE_AREA, DEFAULT_COVERAGE_TYPE } from '@/const/common'
// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = false
axios.defaults.headers = {}

import { SelectTypeEnum } from '../enum/select'
import Axios from 'axios'

const area = '/SearchRescue'

/**
 * 21-03-05 + 加载 grid 测试 wfs 服务
 *
 * @param {string} layerName
 * @return {*}
 */
const loadGridGeoJson = (layerName: string) => {
    const url = `${hostGeo}${area}/ows`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: layerName,
            outputFormat: 'application/json'
            // srsName: crs
        }
    })
}
const loadPolyGeoJson = (layerName: string, current: Date) => {
    // const url = `${host}/geo/wave/contour`
    // TODO:[-] 21-03-23 + 修改为使用 geodjango 的geojson序列化工具，而不使用 gisserver
    const url = `${host}/geo/wave/contour/filter/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            service: 'WFS',
            version: '2.0.0',
            request: 'GetFeature',
            typeNames: 'wavecontourlevelmodel', // TODO:[-] 21-03-19 注意此参数需要与 gisserver 中的 feature_type 中的 queryset 的model 名称相同
            typeName: 'WFS',
            layerName: layerName,
            outputFormat: 'geojson',
            current: current
            // srsName: crs
        }
    })
}

const loadSurgeForecastAreaGeoJson = () => {
    const url = `${hostGeo}nmefc_common/ows?`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            // typeNames: 'nmefc_common%3Asurge_area_south_polygon', // TODO:[-] 21-03-19 注意此参数需要与 gisserver 中的 feature_type 中的 queryset 的model 名称相同
            typeName: 'nmefc_common:surge_area_south_polygon',
            maxFeatures: '50',
            // layerName: 'nmefc_common:surge_area_south_polygon',
            outputFormat: 'application/json'
            // srsName: crs
        }
    })
}

/**
 * 获取指定 海浪等值线的 不同值数组
 *
 * @param {string} layerName
 * @param {Date} current
 * @return {*}
 */
const loadWaveContourDistinctList = (current: Date) => {
    const url = `${host}/geo/wave/distinct/level/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            current: current
            // srsName: crs
        }
    })
}

export {
    loadGridGeoJson,
    loadPolyGeoJson,
    loadWaveContourDistinctList,
    loadSurgeForecastAreaGeoJson
}
