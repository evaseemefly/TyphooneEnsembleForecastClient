import { ProductEnum } from '@/enum/dict'
import { AreaEnum } from '@/enum/area'

export interface IVelocityOptions {
    coverageId: number
    current: Date
    isShow: boolean
    productType: ProductEnum
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

// export { IVelocityOptions }
