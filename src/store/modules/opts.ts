/*
    + 22-03-11 所有配置项
*/
import { GroupPathLayerOptEnum } from '@/enum/layersOpt/LayersOpt'
import { SET_TY_GROUP_PATH_LATERS_OPTS, GET_TY_GROUP_PATH_LATERS_OPTS } from '../types'
export interface IOpts {
    /**
     * 台风集合预报路径的相关加载的layer的配置项
     *
     * @type {{ options: GroupPathLayerOptEnum[] }}
     * @memberof IOpts
     */
    tyGroupPathLayersOpts?: { options: GroupPathLayerOptEnum[] }
}
const state: IOpts = {
    tyGroupPathLayersOpts: { options: [] }
}
const getters = {
    // tyGroupPathLayersOpts: (state: IOpts): { options: GroupPathLayerOptEnum[] } | undefined =>
    //     state.tyGroupPathLayersOpts

    /**
     * 获取 台风级和预报路径的相关加载layers的配置项
     *
     * @param {IOpts} state
     * @return {*}  {({ options: GroupPathLayerOptEnum[] } | undefined)}
     */
    [GET_TY_GROUP_PATH_LATERS_OPTS](
        state: IOpts
    ): { options: GroupPathLayerOptEnum[] } | undefined {
        return state.tyGroupPathLayersOpts
    }
}
const actions = {}
const mutations = {
    /**
     *
     * 设置 台风级和预报路径的相关加载layers的配置项
     * @param {IOpts} state
     * @param {{ options: GroupPathLayerOptEnum[] }} opts
     */
    [SET_TY_GROUP_PATH_LATERS_OPTS](
        state: IOpts,
        opts: { options: GroupPathLayerOptEnum[] }
    ): void {
        state.tyGroupPathLayersOpts = opts
    },

    /**
     * 获取 台风级和预报路径的相关加载layers的配置项
     *
     * @param {IOpts} state
     * @return {*}  {({ options: GroupPathLayerOptEnum[] } | undefined)}
     */
    [GET_TY_GROUP_PATH_LATERS_OPTS](
        state: IOpts
    ): { options: GroupPathLayerOptEnum[] } | undefined {
        return state.tyGroupPathLayersOpts
    }
}
export default {
    namespaced: true,
    state: state,
    mutations,
    actions,
    getters
}
