import axios, { AxiosResponse } from 'axios'
import { host } from './common'
import authHeader from './auth-header'
// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}

const area = '/oilspilling'

/**
 * 21-01-12
 * 获取指定 caseId 的全部散点并返回 geojson
 *
 * @param {(string | number)} caseId
 * @return {*}
 */
const loadOilTrackAllTime = (caseId: string | number) => {
    const url = `${host}${area}/track/all/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            case_id: caseId
        }
    })
}

/**
 * + 21-01-25
 * 按照时间索引分页加载 溢油散点
 * @param {string} code
 * @param {Date} targetDate
 * @return {*}
 */
const loadOilTrackCurrent = (code: string, targetDate: Date) => {
    const oilTrackUrl = `${host}/oilspilling/track/`
    return axios.get(oilTrackUrl, {
        headers: authHeader(),
        params: {
            code: code,
            date: targetDate,
            is_geojson: true
        }
    })
}

export { loadOilTrackAllTime, loadOilTrackCurrent }
