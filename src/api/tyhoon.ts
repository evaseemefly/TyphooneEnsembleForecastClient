import axios from 'axios'
import { host } from './common'
import authHeader from './auth-header'
import { DEFAULT_COVERAGE_AREA, DEFAULT_COVERAGE_TYPE } from '@/const/common'
// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}

const area = '/typhoon'

/**
 * + 21-07-22 获取指定年份的所有台风列表
 *
 * @param {number} year
 * @returns
 */
const getTyListByYear = (year: number) => {
    const url = `${host}${area}/ty/list`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            year: year
        }
    })
}

/**
 * + 21-07-25 根据指定code获取使用该台风code计算的台风集合预报路径
 *
 * @param {number} tyCode
 * @return {*}
 */
const getTyCaseListByTyCode = (tyCode: string) => {
    const url = `${host}${area}/ty/case/list`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode
        }
    })
}

const getTargetTyGroupComplexModel = (tyId: number) => {
    const url = `${host}${area}/tyComplex/group/realdata/list`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_id: tyId
        }
    })
}

/**
 * + 21-05-18
 * 根据 tyCode 与 timestamp -> tyGroupPath -> 预报的 forecastDate ->[start,end]
 *
 * @param {string} tyCode
 * @param {string} timeStamp
 * @return {*}
 */
const getTargetTyGroupDateRange = (tyCode?: string, timeStamp?: string) => {
    const url = `${host}${area}/tyGroupPath/datarage`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            timestamp: timeStamp
        }
    })
}

/**
 * + 21-05-18
 * 根据 tyCode 与 timestamp -> tyGroupPath -> 预报的 forecastDate -> list_dist
 *
 * @param {string} tyCode
 * @param {string} timeStamp
 * @return {*}
 */
const getTargetTyGroupDistDate = (tyCode?: string, timeStamp?: string) => {
    const url = `${host}${area}/tyGroupPath/dist/date`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_code: tyCode,
            timestamp: timeStamp
        }
    })
}

export {
    getTargetTyGroupComplexModel,
    getTargetTyGroupDateRange,
    getTargetTyGroupDistDate,
    getTyListByYear,
    getTyCaseListByTyCode
}
