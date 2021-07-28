import { ProductEnum } from '@/enum/dict'
import { LayerTypeEnum } from '@/enum/map'
import { AreaEnum } from '@/enum/area'

export interface IVelocityOptions {
    coverageId: number
    current: Date
    isShow: boolean
    productType: ProductEnum
}

/**
 * layer 显示参数
 *
 * @export
 * @interface ILayerDisplayOptions
 */
export interface ILayerDisplayOptions {
    isShow: boolean
    layerType: LayerTypeEnum
}

/**
 * 矢量配置的接口
 *
 * @export
 * @interface IVelocityOptions
 */
export interface IRasterOptions extends IVelocityOptions, IForecastArea {
    level: number
}

/**
 * 21-02-18 + 预报区域
 *
 * @export
 * @interface IForecastArea
 */
export interface IForecastArea {
    area: AreaEnum
}

/**
 * 多边形line的接口
 *
 * @export
 * @interface IPolyLine
 */
export interface IPolyLine {
    latlngs: [number, number][]
    style: {
        stroke: boolean
        opacity: number
        color: string
    }
}

/**
 *
 * 加入了 ILayerDisplayOptions
 *
 * @export
 * @interface ITyGroupPathOptions
 * @extends {ILayerDisplayOptions}
 */
export interface ITyGroupPathOptions extends ILayerDisplayOptions {
    tyCode: string
    forecastDt: Date
    timeStamp: string
    gpId: number
}

/**
 *
 * ITyGroupPathOptions 的默认实现
 * + 21-05-20
 * 加入了 ILayerDisplayOptions
 * @type {*}
 *
 * */
const DefaultTyGroupPathOptions: ITyGroupPathOptions = {
    tyCode: '',
    forecastDt: new Date(1970, 1, 1),
    timeStamp: '',
    isShow: false,
    layerType: LayerTypeEnum.GROUP_PATH_LAYER
}
export { DefaultTyGroupPathOptions }
