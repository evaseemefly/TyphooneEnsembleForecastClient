import { SET_TYPHOON_CODE, GET_TYPHOON_CODE } from './../types'

export interface ITyphoon {
    tyCode?: string
}

const state: ITyphoon = {
    tyCode: undefined
}

const getters = {
    [GET_TYPHOON_CODE](state: ITyphoon): string | undefined {
        return state.tyCode
    }
}

const mutations = {
    [SET_TYPHOON_CODE](state: ITyphoon, code: string): void {
        state.tyCode = code
    }
}

export default {
    // TODO:[-] 21-07-24 切记此处是 namespaced 而不是 namespace
    namespaced: true,
    state: state,
    mutations,
    getters
}
