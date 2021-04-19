import axios from 'axios'
import { host } from './common'
import authHeader from './auth-header'
import { DEFAULT_COVERAGE_AREA, DEFAULT_COVERAGE_TYPE } from '@/const/common'
// 后端的请求地址及端口
// export const host = host
axios.defaults.withCredentials = true
axios.defaults.headers = {}

import { SelectTypeEnum } from '../enum/select'
import Axios from 'axios'

const area = '/typhoon'

const getTargetTyGroupComplexModel = (tyId: number) => {
    const url = `${host}${area}/tyComplex/group/realdata/list`
    return axios.get(url, {
        headers: authHeader(),
        params: {
            ty_id: tyId
        }
    })
}

export { getTargetTyGroupComplexModel }
