import {
    SET_TYPHOON_CODE,
    GET_TYPHOON_CODE,
    SET_TYPHOON_ID,
    GET_TYPHOON_ID,
    SET_TYPHOON_TIMESTAMP,
    GET_TYPHOON_TIMESTAMP,
    SET_TYPHOON_PATH_LIST,
    GET_TYPHOON_PATH_LIST,
    SET_SHOW_TYPHOON_LEGEND_ICON,
    GET_SHOW_TYPHOON_LEGEND_ICON
} from './../types'
import { DEFAULT_TYPHOON_ID } from '@/const/common'
import { DEFAULTTIMESTAMP, DEFAULTTYCODE } from '@/const/typhoon'
export interface ITyphoon {
    tyCode?: string
    tyId: number
    tyTimeStamp: string
    tyPathList: {
        forecastDt: Date
        lat: number
        lon: number
        bp: number
        isForecast: boolean
        tyType: string
    }[] // 台风路径
    isShowTyLegend: boolean
}

const state: ITyphoon = {
    tyCode: DEFAULTTYCODE,
    tyId: DEFAULT_TYPHOON_ID,
    tyTimeStamp: DEFAULTTIMESTAMP,
    tyPathList: [],
    isShowTyLegend: false
}

const getters = {
    [GET_TYPHOON_CODE](state: ITyphoon): string | undefined {
        return state.tyCode
    },
    [GET_TYPHOON_ID](state: ITyphoon): number {
        return state.tyId
    },
    [GET_TYPHOON_TIMESTAMP](state: ITyphoon): string {
        return state.tyTimeStamp
    },
    [GET_TYPHOON_PATH_LIST](
        state: ITyphoon
    ): {
        forecastDt: Date
        lat: number
        lon: number
        bp: number
        isForecast: boolean
        tyType: string
    }[] {
        return state.tyPathList
    },
    [GET_SHOW_TYPHOON_LEGEND_ICON](state: ITyphoon): boolean {
        return state.isShowTyLegend
    }
}

const mutations = {
    [SET_TYPHOON_CODE](state: ITyphoon, code: string): void {
        state.tyCode = code
    },
    [SET_TYPHOON_ID](state: ITyphoon, tyId: number): void {
        state.tyId = tyId
    },
    [SET_TYPHOON_TIMESTAMP](state: ITyphoon, tyTS: string): void {
        state.tyTimeStamp = tyTS
    },
    [SET_TYPHOON_PATH_LIST](
        state: ITyphoon,
        pathList: {
            forecastDt: Date
            lat: number
            lon: number
            bp: number
            isForecast: boolean
            tyType: string
        }[]
    ): void {
        state.tyPathList = pathList
    },
    [GET_TYPHOON_ID](state: ITyphoon): number | undefined {
        return state.tyId
    },
    [SET_SHOW_TYPHOON_LEGEND_ICON](state: ITyphoon, val: boolean): void {
        state.isShowTyLegend = val
    }
}

export default {
    // TODO:[-] 21-07-24 切记此处是 namespaced 而不是 namespace
    namespaced: true,
    state: state,
    mutations,
    getters
}
