import {
    SET_TYPHOON_CODE,
    GET_TYPHOON_CODE,
    SET_TYPHOON_ID,
    GET_TYPHOON_ID,
    SET_TYPHOON_TIMESTAMP,
    GET_TYPHOON_TIMESTAMP
} from './../types'
import { DEFAULT_TYPHOON_ID } from '@/const/common'
import { DEFAULTTIMESTAMP, DEFAULTTYCODE } from '@/const/typhoon'
export interface ITyphoon {
    tyCode?: string
    tyId: number
    tyTimeStamp: string
}

const state: ITyphoon = {
    tyCode: DEFAULTTYCODE,
    tyId: DEFAULT_TYPHOON_ID,
    tyTimeStamp: DEFAULTTIMESTAMP
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
    }
}

export default {
    // TODO:[-] 21-07-24 切记此处是 namespaced 而不是 namespace
    namespaced: true,
    state: state,
    mutations,
    getters
}
