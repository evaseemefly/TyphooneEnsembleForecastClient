import axios, { AxiosResponse } from 'axios'
import { host } from './common'
import authHeader from './auth-header'
// 引入 views/members/form/create_case/case_child/oil/select.ts
import {
    IFormOilCaseInfo,
    IFormOilCaseModel
} from '@/views/members/form/create_case/case_child/oil/select'

// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}

const area = '/users'
/**
 * 需要提交的CaseModel
 *
 * @interface IMerageOilCase
 * @extends {IFormOilCaseInfo}
 * @extends {IFormOilCaseModel}
 */
interface IMerageOilCase extends IFormOilCaseInfo, IFormOilCaseModel {}

const loadCaseListByUser = (type: number, page: number, size: number, isPage = 1) => {
    const url = `${host}${area}/case/list/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            type: type,
            page: page,
            size: size,
            isPage: isPage
        }
    })
}

const loadCaseHistory = (type: number) => {
    const url = `${host}${area}/case/history/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            type: type
        }
    })
}

/**
 * 创建 case
 *
 * @param {number} type
 * @param {IMerageOilCase} oilModel
 * @returns
 */
const createCaseInfo = (type: number, oilModel: IMerageOilCase): Promise<AxiosResponse<any>> => {
    const url = `${host}${area}/case/create/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            type: type,
            case: oilModel
        }
    })
}

const createOilCase = (params: any): Promise<AxiosResponse<any>> => {
    const url = `${host}${area}/case/model/`
    // TODO:[-] 20-05-19 注意 axios的post与get的添加参数及header的写法有所区别
    return axios.post(url, params, { headers: authHeader() })
}

const loadCaseModelInfo = (code: string) => {
    const url = `${host}${area}/case/model/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            casecode: code
        }
    })
}

export { loadCaseListByUser, loadCaseHistory, createCaseInfo, loadCaseModelInfo, createOilCase }
