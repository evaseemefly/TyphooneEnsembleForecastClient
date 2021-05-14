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

export { getStationListByGroupPath, getStationSurgeRangeListByGroupPath }
