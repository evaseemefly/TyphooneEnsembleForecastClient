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

export { getStationListByGroupPath }
