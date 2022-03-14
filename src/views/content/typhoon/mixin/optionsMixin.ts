import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, State, namespace } from 'vuex-class'
import { mixins } from 'vue-class-component'
import { GroupPathLayerOptEnum } from '@/enum/layersOpt/LayersOpt'
// STORE 常量
import {
    GET_TY_GROUP_PATH_LATERS_OPTS // +22-03-13 台风集合预报路径配置项
} from '@/store/types'
/**
 * + 22-03-13
 * 基础的配置 mixin
 *
 * @class BaseOptionsMixin
 * @extends {Vue}
 */
@Component
class BaseOptionsMixin extends Vue {
    /**
     * 台风集合预报路径图层的配置项
     *
     * @type {GroupPathLayerOptEnum[]}
     * @memberof BaseOptionsMixin
     */
    optsTyGroupPathLayers: GroupPathLayerOptEnum[] = []

    /**
     * + 22-03-13 监听 台风集合预报路径图层配置项
     *
     * @memberof BaseOptionsMixin
     */
    @Getter(GET_TY_GROUP_PATH_LATERS_OPTS, { namespace: 'opts' }) getTyGroupPathLayersOpts

    /**
     *
     *
     * @param {GroupPathLayerOptEnum[]} val
     * @memberof BaseOptionsMixin
     */
    @Watch('getTyGroupPathLayersOpts')
    onTyGroupPathlayersOpts(val: GroupPathLayerOptEnum[]): void {
        this.optsTyGroupPathLayers = val
    }

    /**
     * 判断是否显示 台风外轮廓多边形 图层
     *
     * @readonly
     * @type {boolean}
     * @memberof BaseOptionsMixin
     */
    get isShowOutlinePolyLayer(): boolean {
        return (
            this.optsTyGroupPathLayers.findIndex((temp) => {
                return temp === GroupPathLayerOptEnum.OUTLINE_POLYGON_LAYER
            }) > 0
        )
    }

    getIsShowOutlinePolyLayer(): boolean {
        const index = this.optsTyGroupPathLayers.findIndex((temp) => {
            return temp === GroupPathLayerOptEnum.OUTLINE_POLYGON_LAYER
        })
        return false
    }

    /**
     * 判断是否显示 实时台风信息form(div)
     *
     * @readonly
     * @type {boolean}
     * @memberof BaseOptionsMixin
     */
    get isShowTyRealDataForm(): boolean {
        return (
            this.optsTyGroupPathLayers.findIndex((temp) => {
                return temp === GroupPathLayerOptEnum.TY_REAL_DATA_FORM
            }) > 0
        )
    }
}

export { BaseOptionsMixin }
