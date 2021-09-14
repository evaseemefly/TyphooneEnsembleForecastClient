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

export { getTaskRateByTy }
