import {
    SET_PRODUCT_TYPE,
    GET_PRODUCT_TYPE,
    SET_SCALE_KEY,
    GET_SCALE_KEY,
    GET_SCALE_RANGE,
    SET_SCALE_RANGE,
    SET_SCALE_DESC,
    GET_SCALE_DESC,
    GET_SHOW_OPTS_FORM,
    SET_SHOW_OPTS_FORM,
    SET_ISOSURGE_COLOR_SCALE_VAL_RANGE,
    GET_ISOSURGE_COLOR_SCALE_VAL_RANGE,
    SET_ISOSURGE_COLOR_SCALE_STR_LIST,
    GET_ISOSURGE_COLOR_SCALE_STR_LIST
} from '../types'
import { CaseTypeEnum } from '@/enum/case'
import { DEFAULT_DICT_KEY, DEFAULT_SELECT_VAL } from '@/const/common'
// export enum ProductType {
//     oil = 0,
//     rescue = 1
// }

interface Common {
    // productType: ProductType
    productType: CaseTypeEnum
    // color scale 的key
    scaleKey: string
    scaleRange: number[]
    isoSurgeScaleValRange: number[]
    isoSurgeScaleStrList: string[]
    isShowOptionsForm: boolean
    scaleDesc: string
}

// const actions={

// }
const state: Common = {
    // productType: ProductType.oil
    productType: CaseTypeEnum.OIL,
    scaleKey: DEFAULT_SELECT_VAL,
    scaleRange: [],
    isShowOptionsForm: false,
    isoSurgeScaleStrList: [],
    isoSurgeScaleValRange: [],
    scaleDesc: ''
}
const getters = {
    productType: (state) => state.productType,

    //
    [GET_SCALE_KEY](state: Common): string {
        return state.scaleKey
    },
    [GET_SCALE_RANGE](state: Common): number[] {
        return state.scaleRange
    },
    [GET_SHOW_OPTS_FORM](state: Common): boolean {
        return state.isShowOptionsForm
    },
    [GET_ISOSURGE_COLOR_SCALE_VAL_RANGE](state: Common): number[] {
        return state.isoSurgeScaleValRange
    },
    [GET_ISOSURGE_COLOR_SCALE_STR_LIST](state: Common): string[] {
        return state.isoSurgeScaleStrList
    },
    [GET_SCALE_DESC](state: Common): string {
        return state.scaleDesc
    }
}
// 使用dispatch调用
const actions = {
    setProductType({ commit }, type) {
        commit(SET_PRODUCT_TYPE, type)
    },
    // setProductType({ commit }, { type }) {
    //     commit(SET_PRODUCT_TYPE, type)
    // },
    login({ commit }, { type }) {
        console.log(type)
    }
}
// 使用commit调用
const mutations = {
    [SET_PRODUCT_TYPE](state: Common, type: CaseTypeEnum): void {
        state.productType = type
    },
    [GET_PRODUCT_TYPE](state: Common): CaseTypeEnum {
        return state.productType
    },
    [SET_SCALE_KEY](state: Common, key: string): void {
        state.scaleKey = key
    },
    [SET_SCALE_RANGE](state: Common, range: number[]): void {
        state.scaleRange = range
    },
    [SET_SCALE_DESC](state: Common, desc: string): void {
        state.scaleDesc = desc
    },
    [SET_SHOW_OPTS_FORM](state: Common, val: boolean): void {
        state.isShowOptionsForm = val
    },
    [SET_ISOSURGE_COLOR_SCALE_VAL_RANGE](state: Common, range: number[]): void {
        state.isoSurgeScaleValRange = range
    },
    [SET_ISOSURGE_COLOR_SCALE_STR_LIST](state: Common, scaleList: string[]): void {
        state.isoSurgeScaleStrList = scaleList
    }
}

export default {
    namespaced: true,
    state: state,
    mutations,
    actions,
    getters
}
