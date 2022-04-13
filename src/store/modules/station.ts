import { SET_SHOW_STATION_ICON, GET_SHOW_STATION_ICON } from '../types'

interface IStation {
    isShowStationIcon: boolean
}

const state: IStation = {
    isShowStationIcon: false
}

const getters = {
    [GET_SHOW_STATION_ICON](state: IStation): boolean {
        return state.isShowStationIcon
    }
}
const actions = {}
const mutations = {
    [SET_SHOW_STATION_ICON](state: IStation, val: boolean): void {
        state.isShowStationIcon = val
    }
}

export default {
    namespaced: true,
    state: state,
    actions,
    mutations,
    getters
}
