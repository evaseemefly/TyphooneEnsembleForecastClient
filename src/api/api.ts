import axios from 'axios'
import { host } from './common'
import authHeader from './auth-header'
// import { loadCaseListByUser } from './case'
// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}
/**
 * 根据code以及date 读取指定时刻的散点
 *
 * @param {string} code
 * @returns
 */
const loadTrackList = (code: string, targetDate: Date) => {
    const trackAvglistUrl = `${host}/rescue/track/`
    return axios.get(trackAvglistUrl, {
        headers: authHeader(),
        params: {
            code: code,
            date: targetDate
        }
    })
}

const loadTrackAvgList = (code: string) => {
    const trackAvglistUrl = `${host}/rescue/track/avg/`
    return axios.get(trackAvglistUrl, {
        headers: authHeader(),
        params: {
            code: code
        }
    })
}

const getTargetTimeTrackCount = (code: string, dt: Date, isAll = false) => {
    const countUrl = `${host}/oilspilling/times/count/`
    return axios.get(countUrl, {
        headers: authHeader(),
        params: {
            code: code,
            date: dt,
            isall: isAll
        }
    })
}

/**
 * 加载指定 code 与 date 的溢油 avg realdata
 * 实际与 loadOilRealData 功能相同
 * 推荐使用此api
 * @param {string} code
 * @param {Date} targetDate
 * @returns
 */
const loadOilSpillingAvgRealData = (code: string, targetDate: Date) => {
    const url = `${host}/oilspilling/realdata/target/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            code: code,
            date: targetDate
        }
    })
}

/**
 * 加载溢油平均轨迹（根据:code）
 *
 * @param {string} code
 * @returns
 */
const loadOilSpillingAvgTrackList = (code: string) => {
    const url = `${host}/oilspilling/track/avg/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            code: code
        }
    })
}
/**
 * 加载指定 code 及 对应时间 的散点 原始版本(一次性读取散点版本)
 *
 * @param {string} code
 * @param {Date} targetDate
 * @returns
 */
const loadOilScatterTrackList = (code: string, targetDate: Date) => {
    const trackAvglistUrl = `${host}/oilspilling/track/`
    return axios.get(trackAvglistUrl, {
        headers: authHeader(),
        params: {
            code: code,
            date: targetDate
        }
    })
}

/**
 * 分页读取散点(非一次性读取散点)
 *
 * @param {string} code
 * @param {Date} targetDate
 * @param {number} pageindex
 * @param {number} pagecount
 * @returns
 */
const loadOilScatterTrackListPage = (
    code: string,
    targetDate: Date,
    pageindex: number,
    pagecount: number,
    isPagination = true
) => {
    const trackAvglistUrl = `${host}/oilspilling/track/`
    return axios.get(trackAvglistUrl, {
        headers: authHeader(),
        params: {
            code: code,
            date: targetDate,
            pageindex: pageindex,
            pagecount: pagecount,
            ispagination: isPagination
        }
    })
}
/**
 * 加载指定 code 以及 时间 对应的平均值
 * 实际与 loadOilSpillingAvgRealData 功能相同
 * 推荐使用 loadOilSpillingAvgRealData
 * @param {string} code
 * @param {Date} targetDate
 * @returns
 */
const loadOilRealData = (code: string, targetDate: Date) => {
    const oilRealDataUrl = `${host}/oilspilling/realdata/avg/`
    return axios.get(oilRealDataUrl, {
        headers: authHeader(),
        params: {
            code: code,
            date: targetDate
        }
    })
}

/**
 * 获取指定code对应的时间范围(start,end)
 *
 * @param {string} code
 * @returns
 */
const getTargetCodeDateRange = (code: string) => {
    const tempUrl = `${host}/oilspilling/track/date/range/`
    return axios.get(tempUrl, {
        headers: authHeader(),
        params: {
            code: code
        }
    })
}

const getAuthTest = () => {
    const testUrl = `${host}/oilspilling/testtoken/`
    const authContent = authHeader()
    return axios.get(testUrl, { headers: authHeader() })
}
// const loadOilAvgTargetDateRealData=(code:string,targe)

export {
    loadTrackList,
    loadTrackAvgList,
    loadOilSpillingAvgTrackList,
    loadOilScatterTrackList,
    loadOilRealData,
    loadOilSpillingAvgRealData,
    getTargetCodeDateRange,
    getTargetTimeTrackCount,
    loadOilScatterTrackListPage,
    getAuthTest
    // loadCaseListByUser
}
// TODO:[*] 20-02-14 使用此种方式导出 ./case.ts 中的所有可以导出的模块
export * from './case'
