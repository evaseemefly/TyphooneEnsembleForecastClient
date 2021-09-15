import axios, { AxiosResponse } from 'axios'
import { host } from './common'
import authHeader from './auth-header'

// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}

const area = '/task'

/**
 * 根据 ty_id 获取对应的 task rate
 *
 * @param {int} tyId
 * @returns
 */
const getTaskRateByTy = (tyId: int) => {
    const area = '/relation'
    const url = `${host}${area}/get/ty/task`

    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_id: tyId
        }
    })
}

const createTyCase = (params: any): Promise<AxiosResponse<any>> => {
    const url = `${host}${area}/model/create`
    // TODO:[-] 20-05-19 注意 axios的post与get的添加参数及header的写法有所区别
    return axios.post(url, params, { headers: authHeader() })
}

export { getTaskRateByTy, createTyCase }
