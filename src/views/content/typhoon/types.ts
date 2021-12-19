import { ProductEnum } from '@/enum/dict'
import { LayerTypeEnum } from '@/enum/map'
import { AreaEnum } from '@/enum/area'
import { DEFAULT_TYPHOON_GROUP_PATH_ID, DEFAULT_DATE } from '@/const/common'
import { DEFAULTTYCODE, DEFAULTTIMESTAMP } from '@/const/typhoon'
import { Layer } from 'leaflet'

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
 * + 潮位图层接口
 *   台风编号
 *   时间戳
 * @export
 * @interface ISurgeLayer
 */
export interface ISurgeLayer {
    tyCode: string
    tyTimeStamp: string
}

/**
 * + 21-08-19
 *   色标接口 *
 * @export
 * @interface IScale
 */
export interface IScale {
    scaleList: string[] | string
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
    gpId: DEFAULT_TYPHOON_GROUP_PATH_ID,
    tyCode: DEFAULTTYCODE,
    forecastDt: DEFAULT_DATE,
    timeStamp: DEFAULTTIMESTAMP,
    isShow: false,
    layerType: LayerTypeEnum.GROUP_PATH_LAYER
}

export interface ITyLayer extends ILayerDisplayOptions, ISurgeLayer {}

export interface IRasterLayer extends ILayerDisplayOptions, ISurgeLayer, IScale {}
/**
 * 台风增水配置接口
 *
 * @export
 * @interface ITySurgeOptions
 * @extends {ILayerDisplayOptions}
 * @extends {ISurgeLayer}
 */
export interface ITySurgeLayerOptions extends IRasterLayer {
    forecastDt: Date
}

/**
 * 概率增水
 *
 * @export
 * @interface ITyProLayerOptions
 * @extends {ITyLayer}
 */
export interface ITyProLayerOptions extends IRasterLayer {
    pro: number
}

export interface ITyStationLayerOptions extends ITyLayer {
    forecastDt: Date
    gpId: number
}

export { DefaultTyGroupPathOptions }
