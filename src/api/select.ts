import axios from 'axios'
import { host } from './common'
import authHeader from './auth-header'
// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}

import { SelectTypeEnum } from '../enum/select'

const area = '/common'

/**
 * 根据 type获取下拉框
 *
 * @param {SelectTypeEnum} type
 * @returns
 */
const loadSelectByType = (type: SelectTypeEnum, parent?: number) => {
    const url = `${host}${area}/select/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            type: type,
            parent: parent
        }
    })
}

/**
 *
 * 不涉及到级联菜单的操作时使用，只需要传入dict 即可，
 * dict 为-> enum/dicts
 * type 为-> enum/select
 * @param {number} dict
 * @param {SelectTypeEnum} [type] dict 为-> enum/dicts
 * @param {number} [parent] type 为-> enum/select
 * @returns
 */
const loadSelectParentByType = (dict: number, type?: SelectTypeEnum, parent?: number) => {
    const url = `${host}${area}/select/parent/`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            dict: dict,
            type: type,
            parent: parent
        }
    })
}

export { loadSelectByType, loadSelectParentByType }
