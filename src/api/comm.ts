// import { Coverage } from './../views/content/oilspilling/coverage';
// 对应 后端 app:common
import axios from 'axios'
import { host } from './common'
import authHeader from './auth-header'
// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}
const area = '/common'

/**
 * 加载预报区域
 *
 * @param {number} [coverageId]
 * @returns
 */
const loadForecastArea = (coverageId?: number) => {
    const url = `${host}${area}/area/list/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            coverage: coverageId
        }
    })
}

const getLayerCheckStatus = (tyCode: string, timeStampStr: string, forecastDt: Date) => {
    const url = `${host}${area}/layers/check`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            timestamp: timeStampStr,
            forecast_dt: forecastDt
        }
    })
}

export { loadForecastArea, getLayerCheckStatus }
