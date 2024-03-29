import axios, { AxiosResponse } from 'axios'
import { host } from './common'
import authHeader from './auth-header'
import { DEFAULT_COVERAGE_AREA, DEFAULT_COVERAGE_TYPE } from '@/const/common'
import { LayerTypeEnum } from '@/enum/map'
// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}

import { SelectTypeEnum } from '../enum/select'
import Axios from 'axios'

const area = '/geo'

const loadCoverageList = (typeVal: number, areaVal: number, current?: Date) => {
    const url = `${host}${area}/coverage/list/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            type: typeVal,
            area: areaVal,
            current: current
        }
    })
}

/**
 * 根据 taskid 获取对应的 geo_taskinfo 表中记录
 *
 * @param {number} taskId
 * @returns
 */
const loadCoverageInfo = (coverageId: number) => {
    const url = `${host}${area}/layer/info/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            coverageId: coverageId
        }
    })
}
/**
 * 加载 geoserver 的服务器列表
 *
 * @returns
 */
const loadGeoserverInfo = () => {
    const url = `${host}${area}/server/list/`
    return axios.get(url, {
        headers: authHeader()
    })
}

/**
 * 根据 指定时间获取符合条件[-7,+2]天的所有 nc 的列表
 *
 * @param {Date} current
 * @returns
 */
const loadFilterCoverageList = (current: Date) => {
    const url = `${host}${area}/coverage/files/filter/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            current: current
        }
    })
}

/**
 *
 *
 * @param {Date} current
 * @param {number} coverageId
 * @return {*}
 */
const loadWindFlow = (current: Date, coverageId: number) => {
    const url = `${host}${area}/flow/wind/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            current: current,
            coverage_id: coverageId
            // current: current
        }
    })
}

const loadCoverageListByIds = (ids: number[]) => {
    const url = `${host}${area}/coverage/list/ids/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ids: '' + ids
            // current: current
        }
    })
}

const loadWindBar = (coverageId: number, forecastDt: Date, level: number) => {
    const url = `${host}${area}/bar/wind/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            coverage_id: coverageId,
            forecast_datetime: forecastDt,
            level: level
        }
    })
}

/**
 * 分页 加载 风力图 (根据 step|level 进行加载)
 *
 * @param {number} coverageId
 * @param {Date} forecastDt
 * @param {number} level : 与 step 一直均为步长
 * @param {number} step : 与 level 一直均为步长
 * @param {number} pageIndex
 * @return {*}
 */
const loadWindBarPaged = (
    coverageId: number,
    forecastDt: Date,
    level: number,
    step: number,
    pageIndex: number
) => {
    const url = `${host}${area}/bar/wind/paged/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            coverage_id: coverageId,
            forecast_datetime: forecastDt,
            level: level,
            page_index: pageIndex,
            step: step
        }
    })
}

/**
 * + 21-03-31 分页加载海浪浪向
 *
 * @param {number} coverageId
 * @param {Date} forecastDt
 * @param {number} level
 * @param {number} step
 * @param {number} pageIndex 前端默认从 0 开始，后端默认将前端传入的 index+1 处理
 * @return {*}
 */
const loadWaveBarPaged = (
    coverageId: number,
    forecastDt: Date,
    level: number,
    step: number,
    pageIndex: number
) => {
    const url = `${host}${area}/bar/wave/paged/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            coverage_id: coverageId,
            forecast_datetime: forecastDt,
            level: level,
            page_index: pageIndex,
            step: step
        }
    })
}

/**
 * 根据指定 coverage_id 以及 预报时间 + 预报区域 获取对应的tif url
 * 21-02-18 + params: area
 * @param {number} coverageId
 * @param {Date} forecastDt
 * @return {*}
 */
const loadCurrentTif = (
    coverageId: number,
    forecastDt: Date,
    forecastArea: number = DEFAULT_COVERAGE_AREA,
    productType: number = DEFAULT_COVERAGE_TYPE
) => {
    const url = `${host}${area}/raster/current/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            coverage_id: coverageId,
            forecast_datetime: forecastDt,
            area: forecastArea,
            product_type: productType
        }
    })
}

/**
 *
 * + 21-05-04
 * + 21-08-04 修改 url 为 geotiff/surge/field
 * 根据 ty_code + timestamp +forecast_dt 获取对应的 tif url 地址
 * @param {string} tyCode
 * @param {string} tyTimeStamp
 * @param {Date} forecastDt
 * @return {*}
 */
const loadFieldSurgeTif = (tyCode: string, tyTimeStamp: string, forecastDt: Date) => {
    const url = `${host}${area}/geotiff/surge/field`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            ty_timestamp: tyTimeStamp,
            forecast_dt: forecastDt
        }
    })
}

/**
 * + 21-08-01
 * 根据 ty_code 与 时间戳，获取最大增水的tif路径
 *
 * @param {string} tyCode
 * @param {string} tyTimeStamp
 * @return {*}  {Promise<AxiosResponse<{ status: number; data: string }>>}
 */
// const loadMaxSurgeTif = (
//     tyCode: string,
//     tyTimeStamp: string
// ): Promise<AxiosResponse<{ status: number; data: string }>> => {
const loadMaxSurgeTif = (tyCode: string, tyTimeStamp: string) => {
    const url = `${host}${area}/geotiff/surge/max`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            ty_timestamp: tyTimeStamp
        }
    })
}

/**
 * + 21-08-12
 *   获取概率增水场 tif url
 *
 * @param {string} tyCode
 * @param {string} tyTimeStamp
 * @param {number} pro
 * @param {LayerTypeEnum} coverageType
 * @return {*}
 */
const loadProSurgeTif = (
    tyCode: string,
    tyTimeStamp: string,
    pro: number,
    coverageType: LayerTypeEnum
) => {
    const url = `${host}${area}/geotiff/surge/pro`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            ty_timestamp: tyTimeStamp,
            pro: pro,
            coverage_type: coverageType
        }
    })
}

export {
    loadCoverageList,
    loadCoverageInfo,
    loadGeoserverInfo,
    loadFilterCoverageList,
    loadWindFlow,
    loadCoverageListByIds,
    loadWindBar,
    loadCurrentTif,
    loadWindBarPaged,
    loadWaveBarPaged,
    loadFieldSurgeTif,
    loadMaxSurgeTif,
    loadProSurgeTif
}
