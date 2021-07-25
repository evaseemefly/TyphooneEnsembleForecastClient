import { SET_TYPHOON_CODE, GET_TYPHOON_CODE, SET_TYPHOON_ID, GET_TYPHOON_ID } from './../types'
import { DEFAULT_TYPHOON_ID, DEFAULT_TYPHOON_CODE } from '@/const/common'
export interface ITyphoon {
    tyCode?: string
    tyId: number
}

const state: ITyphoon = {
    tyCode: DEFAULT_TYPHOON_CODE,
    tyId: DEFAULT_TYPHOON_ID
}

const getters = {
    [GET_TYPHOON_CODE](state: ITyphoon): string | undefined {
        return state.tyCode
    },
    [GET_TYPHOON_ID](state: ITyphoon): number {
        return state.tyId
    }
}

const mutations = {
    [SET_TYPHOON_CODE](state: ITyphoon, code: string): void {
        state.tyCode = code
    },
    [SET_TYPHOON_ID](state: ITyphoon, tyId: number): void {
        state.tyId = tyId
    }
}

export default {
    // TODO:[-] 21-07-24 切记此处是 namespaced 而不是 namespace
    namespaced: true,
    state: state,
    mutations,
    getters
}
