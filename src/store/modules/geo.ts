import { Commit, Dispatch } from 'vuex'
import {
    SET_GEO_COVERAGEID,
    GET_GEO_COVERAGEID,
    SET_GEO_COVERAGETYPE,
    GET_GEO_COVERAGETYPE
} from './../types'
import { DictEnum } from '@/enum/dict'

export interface IGeo {
    coverageid?: number
    coverageType?: DictEnum
}

const state: IGeo = {
    coverageid: undefined,
    coverageType: undefined
}

const getters = {
    coverageid: (state: IGeo): number | undefined => state.coverageid,
    coverageType: (state: IGeo): DictEnum | undefined => state.coverageType
}

const actions = {
    setCoverageID({ commit }, id: number): void {
        commit(SET_GEO_COVERAGEID, id)
    },
    getCoverageID({ commit }): number {
        return commit(GET_GEO_COVERAGEID)
    },
    setCoverageType({ commit }, type: DictEnum): void {
        console.log(`-> geo ->$setCoverageType: state ${state}|type ${type}`)
        commit(SET_GEO_COVERAGETYPE, type)
    },
    getCoverageType({ commit }): DictEnum {
        return commit(GET_GEO_COVERAGETYPE)
    }
}

const mutations = {
    [SET_GEO_COVERAGEID](state: IGeo, id: number): void {
        // console.log(`-> geo ->${SET_GEO_COVERAGEID}: state ${state}|id ${id}`)
        state.coverageid = id
    },
    [GET_GEO_COVERAGEID](state: IGeo): number | undefined {
        return state.coverageid
    },
    [SET_GEO_COVERAGETYPE](state: IGeo, type: DictEnum): void {
        console.log(`-> geo ->${SET_GEO_COVERAGETYPE}: state ${state}|id ${type}`)
        state.coverageType = type
    },
    [GET_GEO_COVERAGETYPE](state: IGeo): DictEnum | undefined {
        return state.coverageType
    }
}

export default {
    namespaced: true,
    state: state,
    mutations,
    actions,
    getters
}
