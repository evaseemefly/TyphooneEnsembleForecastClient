import axios from 'axios'
import { host } from './common'
import authHeader from './auth-header'
import { DEFAULT_COVERAGE_AREA, DEFAULT_COVERAGE_TYPE } from '@/const/common'
// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}

const area = '/station'

const getStationListByGroupPath = (gpId: number, forecastDt: Date) => {
    const url = `${host}${area}/station/list`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            gp_id: gpId,
            forecast_dt: forecastDt
        }
    })
}

/**
 * + 21-05-14 
 * 根据 forecast | ts | ty_code 获取
        tb:station_forecast_realdata 与 tb:station_info
        获取预报范围值 和 当前中心路径的实际值
 *
 * @param {string} tyCode
 * @param {Date} forecastDt
 * @param {string} timestampStr
 * @return {*} 
 */
const getStationSurgeRangeListByGroupPath = (
    gpId: number,
    tyCode: string,
    forecastDt: Date,
    timestampStr: string
) => {
    const url = `${host}${area}/station/realdata/range/list`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            gp_id: gpId,
            ty_code: tyCode,
            forecast_dt: forecastDt,
            timestamp: timestampStr
        }
    })
}

/**
 *
 *
 * @param {number} gpId
 * @param {string} tyCode
 * @param {Date} forecastDt
 * @param {string} timestampStr
 * @return {*}
 */
const getStaticStationList = (
    gpId: number,
    tyCode: string,
    forecastDt: Date,
    timestampStr: string
) => {
    const url = `${host}${area}/station/list/area`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            timestamp: timestampStr
        }
    })
}

/**
 * + 21-05-26
 * 根据 tyCode | timestamp | stationCode
 * 获取对应的 tb:station_forecast_realdata 的 data list 与 max,min list
 *
 * @param {string} tyCode
 * @param {string} timestamp
 * @param {string} stationCode
 * @return {*}
 */
const getStationSurgeRealDataListAndRange = (
    tyCode: string,
    timestamp: string,
    stationCode: string
) => {
    const url = `${host}${area}/station/reallist/list`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            timestamp: timestamp,
            station_code: stationCode
        }
    })
}

/**
 * + 21-08-24
 * 获取天文潮数据列表
 *
 * @param {string} tyCode
 * @param {string} timestamp
 * @param {string} stationCode
 * @return {*}
 */
const getAstronomictideTideRealDataList = (
    tyCode: string,
    timestamp: string,
    stationCode: string
) => {
    const url = `${host}${area}/station/astronomictide/range/list`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            timestamp: timestamp,
            station_code: stationCode
        }
    })
}

/**
 * + 21-10-29
 * 加入 对于 中位数 ,1/4,3/4 百分位数的统计
 * @param {string} tyCode
 * @param {string} timestamp
 * @param {string} stationCode
 * @return {*}
 */
const getStationSurgeRealDataQuarterList = (
    tyCode: string,
    timestamp: string,
    stationCode: string
) => {
    const url = `${host}${area}/station/realdata/quarter/list`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            timestamp: timestamp,
            station_code: stationCode
        }
    })
}

/**
 * + 21-08-25
 *  获取对应站点的警戒潮位值
 *
 * @param {string} tyCode
 * @return {*}
 */
const getStationAlert = (tyCode: string) => {
    const url = `${host}${area}/station/alert`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            station_code: tyCode
        }
    })
}

export {
    getStationListByGroupPath,
    getStationSurgeRangeListByGroupPath,
    getStationSurgeRealDataListAndRange,
    getAstronomictideTideRealDataList,
    getStationAlert,
    getStationSurgeRealDataQuarterList,
    getStaticStationList
}
