import { IBaseUrlOptions } from './../views/content/oilspilling/coverage'
import { CanvasMarkerLayer } from '@/common/canvasMakerLayer'

/*
    所有的和 geo相关的类
*/

/**
 *  coverage 的 概述信息 中间类
 *
 * @class CoverageDetailMidModel
 */
class CoverageDetailMidModel {
    public fileSize: string
    public fileName: string
    public dimessions: string[]
    public variables: string[]
    public forecastStart: Date
    public forecastEnd: Date

    public(
        size: string,
        fileName: string,
        dimessions: string[],
        variables: string[],
        start: Date,
        end: Date
    ) {
        this.fileName = fileName
        this.fileSize = size
        this.dimessions = dimessions
        this.variables = variables
        this.forecastStart = start
        this.forecastEnd = end
    }
}

/**
 * wms 的一些选项
 *
 * @class WMSOptionsMidModel
 */
class WMSOptionsMidModel {
    public layer: string
    public format: string
    public style?: string
    public transparent: boolean
    public zindex?: number

    constructor(layer: string, zindex = 1500, style?: string, format = 'image/png', trans = true) {
        this.layer = layer
        this.format = format
        this.transparent = trans
        this.zindex = zindex
        this.style = style
    }
}

/**
 * wms mid model
 *
 * @class WMSMidModel
 */
class WMSMidModel {
    public url: string
    public options: WMSOptionsMidModel

    constructor(url: string, options: WMSOptionsMidModel) {
        this.url = url
        this.options = options
    }
}

/**
 *  20-10-22
 *  用来传输 wind bar 的查询参数 的 mid model
 *
 * @class WindBarOptMidModel
 */
class WindBarOptMidModel {
    public coverageId: number
    public forecastDt: Date
    public level: number
    public step: number

    constructor(coverageId: number, forecastDt: Date, level: number, step: number) {
        this.coverageId = coverageId
        this.forecastDt = forecastDt
        this.level = level
        this.step = step
    }
}

/**
 * 实现 windy的流动效果改造的 canvasLayer -> @/src/views/content/oilspilling/arrow -> def add2map
 * 20-10-30
 * @class CanvasLayerMidModel
 */
class CanvasLayerMidModel {
    /**
     * marker 数组--暂时不在使用此变量
     *
     * @type {L.Marker<any>[]}
     * @memberof CanvasLayerMidModel
     */
    public canvasMarkers: L.Marker<any>[]
    /**
     * marker 的 canvas Layer
     *
     * @type {CanvasMarkerLayer}
     * @memberof CanvasLayerMidModel
     */
    public canvasMarkerLayer: CanvasMarkerLayer
    // constructor(markers: L.Marker<any>[], layer: CanvasMarkerLayer) {
    //     this.canvasMarkerLayer = markers
    //     this.canvasMarkerLayer = layer
    // }
}

export {
    CoverageDetailMidModel,
    WMSOptionsMidModel,
    WMSMidModel,
    WindBarOptMidModel,
    CanvasLayerMidModel
}
