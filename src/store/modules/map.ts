import { State } from './map'
import { Commit, Dispatch } from 'vuex'
import { LayerTypeEnum, MapLayerEnum } from '@/enum/map'
import {
    SET_MAP_NOW,
    GET_MAP_NOW,
    SET_CREATE_OIL_CASE_MODAL,
    GET_CREATE_OIL_CASE_MODAL,
    SET_CURRENT_LATLNG,
    GET_CURRENT_LATLNG,
    SET_MAP_LAYERS,
    GET_MAP_LAYERS,
    INIT_MAP_LAYERS,
    GET_IS_INIT_LAYERS,
    SET_IS_INIT_LAYERS,
    SET_CURRENT_LATLNG_LOCK,
    GET_CURRENT_LATLNG_LOCK,
    SET_INITIAL_LATLNG,
    GET_INITIAL_LATLNG,
    SET_TIMER_LOCK,
    GET_TIMER_LOCK,
    SET_AUTO_PLAY,
    GET_AUTO_PLAY,
    SET_CREATE_FORM,
    GET_CREATE_FORM,
    SET_BASE_MAP_KEY,
    GET_BASE_MAP_KEY
} from '../types'
export interface State {
    // range:number,
    // 风场与流场需要使用的当前时间（datetime）
    current: string
    now: Date
    isShowCreateOilCaseModal: boolean
    isShowCreateForm: boolean
    currentLatlng: Array<number>
    layers: LayerTypeEnum[]
    // 21-01-05 + 当前点选位置的经纬度锁
    currentLatlngLock: boolean
    initialLatlng: Array<number>
    // + 21-01-27 新加入的 timer 锁，正常为 false，代表未锁住
    timerLock: boolean
    // + 21-01-29 配合 map -> SET_TIMER_LOCK 使用的, lock = true 锁住,lock =false 打开
    autoPlay: boolean
    //
    baseMapKey: MapLayerEnum
    // 是否需要重置 图层 layers
    isInitLayers: boolean
}

// 用来存储应用状态的数据对象
const state: State = {
    // 地图中使用的指定经纬度的范围半径
    // range: 20000,
    current: '',
    now: new Date(),
    isShowCreateOilCaseModal: false,
    isShowCreateForm: false,
    currentLatlng: [],
    layers: [],
    // 21-01-05 + 当前点选位置的经纬度锁
    // 只有 currentLatlngLock =false时，才可以移动点选的位置，否则不可移动
    currentLatlngLock: false,
    initialLatlng: [],
    // + 21-01-27 新加入的 timer 锁，正常为 false，代表未锁住
    timerLock: false,
    // + 21-01-29 配合 map -> SET_TIMER_LOCK 使用的, lock = true 锁住,lock =false 打开
    autoPlay: false,
    // + 21-08-23 切换底图的key
    baseMapKey: MapLayerEnum.SIMPLE_MAP,
    isInitLayers: false
}

// 用来改变应用状态的函数
const mutations = {
    setcurrent(state: State, current: string) {
        state.current = current
    },
    // 最新使用此种方式进行 对 store 的赋值,上面的方式弃用
    [SET_MAP_NOW](state: State, now: Date): void {
        state.now = now
    },
    [GET_MAP_NOW](state: State): Date {
        return state.now
    },
    /**
     * 是否show map -> 创建 oil case 的modal框
     *
     * @param {State} state
     * @returns {boolean}
     */
    [GET_CREATE_OIL_CASE_MODAL](state: State): boolean {
        return state.isShowCreateOilCaseModal
    },
    [SET_CREATE_OIL_CASE_MODAL](state: State, isShow: boolean): void {
        state.isShowCreateOilCaseModal = isShow
    },

    /**
     * + 21-07-11 是否在 map 页面 show -> 风暴潮 create form
     *
     * @param {State} state
     * @return {*}  {boolean}
     */
    [GET_CREATE_FORM](state: State): boolean {
        return state.isShowCreateForm
    },

    [SET_CREATE_FORM](state: State, isShow: boolean): void {
        state.isShowCreateForm = isShow
    },

    /**
     * 当前选定位置的 经纬度 数组
     *
     * @param {State} state
     * @param {Array<number>} latlon
     */
    [SET_CURRENT_LATLNG](state: State, latlon: Array<number>): void {
        // console.log(`set的latlng:${latlon}`)
        state.currentLatlng = latlon
    },

    /**
     * 设置初始经纬度，设置后一般不改变
     *
     * @param {State} state
     * @param {number[]} latlon
     */
    [SET_INITIAL_LATLNG](state: State, latlon: number[]): void {
        state.initialLatlng = latlon
    },
    [SET_MAP_LAYERS](state: State, layers: LayerTypeEnum[]): void {
        state.layers = layers
    },
    // TODO:[-] 22-01-04 初始化 layers
    [INIT_MAP_LAYERS](state: State): void {
        state.layers = [LayerTypeEnum.GROUP_PATH_LAYER]
    },
    // TODO:[-] 21-01-06 map - 选中的经纬度位置锁
    [SET_CURRENT_LATLNG_LOCK](state: State, lock: boolean): void {
        state.currentLatlngLock = lock
    },
    // + 21-01-27 新加入的 timer 锁，正常为 false，代表未锁住
    [SET_TIMER_LOCK](state: State, lock: boolean): void {
        state.timerLock = lock
    },
    [SET_AUTO_PLAY](state: State, play: boolean): void {
        state.autoPlay = play
    },
    [SET_BASE_MAP_KEY](state: State, mapKey: MapLayerEnum): void {
        state.baseMapKey = mapKey
    },
    [SET_IS_INIT_LAYERS](state: State, isInit: boolean): void {
        state.isInitLayers = isInit
    }
}

/** @type {*} */
const getters = {
    getCurrent(state: State) {
        return state.current
    },
    getNow: (state: State) => {
        return state.now
    },
    [GET_MAP_NOW](state: State): Date {
        return state.now
    },
    [GET_CREATE_OIL_CASE_MODAL]: (state: State): boolean => {
        return state.isShowCreateOilCaseModal
    },
    [GET_CURRENT_LATLNG](state: State): Array<number> {
        // console.log(`get的latlng:${state.currentLatlng}`)
        return state.currentLatlng
    },

    /**
     * 初始经纬度，一般不改变
     *
     * @param {State} state
     * @return {*}  {number[]}
     */
    [GET_INITIAL_LATLNG](state: State): number[] {
        return state.initialLatlng
    },
    [GET_MAP_LAYERS](state: State): LayerTypeEnum[] {
        return state.layers
    },
    [GET_IS_INIT_LAYERS](state: State): boolean {
        return state.isInitLayers
    },
    // TODO:[-] 21-01-06 map - 选中的经纬度位置锁
    [GET_CURRENT_LATLNG_LOCK]: (state: State): boolean => {
        return state.currentLatlngLock
    },
    // + 21-01-27 新加入的 timer 锁，正常为 false，代表未锁住
    [GET_TIMER_LOCK]: (state: State): boolean => {
        return state.timerLock
    },
    [GET_AUTO_PLAY]: (state: State): boolean => {
        return state.autoPlay
    },

    // + 21-07-11 是否在 map 页面 show -> 风暴潮 create form
    [GET_CREATE_FORM]: (state: State): boolean => {
        return state.isShowCreateForm
    },
    [GET_BASE_MAP_KEY]: (state: State): MapLayerEnum => {
        return state.baseMapKey
    }
}

// 异步调用api的函数（暂时不用）
const actions = {
    setNow({ commit }, now: Date) {
        commit(SET_MAP_NOW, now)
    },
    getNow({ commit }): Date {
        return commit(GET_MAP_NOW)
    }
}
export default {
    // TODO [*] 19-03-21 暂时取消namespaced，先实现功能
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
