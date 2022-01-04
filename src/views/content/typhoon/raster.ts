import * as L from 'leaflet'
// 20-09-07 引入了raster-marching-squares
import * as rasterMarching from 'raster-marching-squares'
import * as d3 from 'd3'
import moment from 'moment'
// 使用leaflet-canvaslayer-field还需要依赖的库
import chroma from 'chroma-js'

// 不同的引入 geotiff
// import GeoTIFF from 'geotiff'
// RasterPixel 中需要使用此种引入方式
// import * as geotiff from 'geotiff'
// import 'geotiff'
// import * as GeoTIFF from 'geotiff/dist-browser/geotiff.js'
// import * as GeoTIFF from 'geotiff'

// import * as leafletGeotiff from 'leaflet-canvaslayer-field/dist/leaflet.canvaslayer.field.js'
// import 'leaflet-canvaslayer-field/dist/leaflet.canvaslayer.field.js'
// import 'leaflet-canvaslayer-field'

// TODO:[-] 20-09-12 暂时放弃使用 d3js，自己手绘，采用现成的第三方库:
// https://github.com/GeoTIFF/georaster-layer-for-leaflet
// 注意使用 该第三方库，依赖于 georaster
import 'georaster'
// 以下方式引入不成功
// import * as georaster from 'georaster'
import 'georaster-layer-for-leaflet'
// TODO:[*] 21-08-16 尝试使用geotiff.js
// import * as GeoTIFF from 'geotiff'
import GeoTIFF, { fromUrl, fromUrls, fromArrayBuffer, fromBlob } from 'geotiff'
import * as plotty from 'plotty'
// ---
import { loadCurrentTif, loadFieldSurgeTif, loadProSurgeTif } from '@/api/geo'
import { MaxSurge } from './surge'
import { AreaEnum } from '@/enum/area'
import { DictEnum, ProductEnum } from '@/enum/dict'
import {
    USELESS_COVERAGE_ID,
    DEFAULT_TYPHOON_ID,
    DEFAULT_DATE,
    DEFAULT_TIMESTAMP
} from '@/const/common'
import { DEFAULTTYCODE } from '@/const/typhoon'
import { LayerTypeEnum } from '@/enum/map'
import { BIconChevronCompactUp } from 'bootstrap-vue'
// COMMON
import { DEFAULT_COLOR_SCALE, DEFAULT_COLOR_KEY, IScale } from '@/const/colorBar'

export interface IRaster {
    rasterLayer: L.Layer

    /**
     * 将当前 raster 添加至 map
     */
    add2map(
        map: L.Map,
        errorCallBackFun: (opt: { message: string; type: string }) => void
    ): Promise<L.Layer>
}

class RasterBase {
    /**
     * name
     */
}

class RasterGeoLayer implements IRaster {
    rasterLayer: L.Layer

    /**
     * coverage id
     *
     * @type {number}
     * @memberof RasterGeoLayer
     */
    coverageId: number

    /**
     * 预报的时间
     *
     * @type {Date}
     * @memberof RasterGeoLayer
     */
    forecastDt: Date

    /**
     * 预报区域
     *
     * @type {AreaEnum}
     * @memberof RasterGeoLayer
     */
    forecastArea: AreaEnum

    /**
     *Creates an instance of RasterGeoLayer.
     * @param {number} coverageId coverage id
     * @param {Date} forecastDt 预报的时间(utc)
     * @param {AreaEnum} forecastArea 预报范围 -> AreaEnum
     * @memberof RasterGeoLayer
     */
    constructor(coverageId: number, forecastDt: Date, forecastArea: AreaEnum) {
        this.coverageId = coverageId
        this.forecastDt = forecastDt
        this.forecastArea = forecastArea
    }

    // TODO:[*] 20-11-01 若在then中还存在 then，如何做统一的 async 操作
    public async add2map(
        map: L.Map,
        errorCallBackFun: (opt: { message: string; type: string }) => void
    ): Promise<L.Layer> {
        let addedLayer: L.Layer = null
        // TODO:[-] 20-11-04 暂时注释掉，调取远程的文件会出现错误
        // const urlGeoTifUrl = tifResp.data

        // TODO:[-] 21-08-06 暂时加入概率场 tif文件
        // const urlGeoTifUrl =
        //     'http://localhost:82/images/nmefc_download/TY_GROUP_RESULT/test/maxSurge_TY2022_2021010416_c0_p00.tif'
        // 测试使用的 原始 最大增水场 tif
        const urlGeoTifUrl =
            'http://localhost:82/images/nmefc_download/TY_GROUP_RESULT/test/proSurge_TY2022_2021010416_gt1_0m_desc_y.tif'
        // 大体思路 获取 geotiff file 的路径，二进制方式读取 -> 使用 georaster 插件实现转换 -> 获取色标，
        // TODO:[-] 20-11-02 将之前的逻辑方式修改为 await 的方式
        // TODO:[-] 20-11-05 在 fetch 请求头中加入跨域的部分
        const fetchHeader = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8,'
        })
        const response = await fetch(urlGeoTifUrl, {
            method: 'GET',
            // headers: fetchHeader,
            mode: 'cors'
        })
        const arrayBuffer = await response.arrayBuffer()
        // 使用 import 'georaster' 的方式引入会出现没有智能提示的问题
        // TODO:[-] 20-11-04
        // Uncaught (in promise) TypeError: Invalid byte order value.
        // at Function.fromSource (e2c99254-e67c-4422-be5d-01e0b254a36b:10)

        const georasterResponse = await parseGeoraster(arrayBuffer)
        const min = georasterResponse.mins[0]
        const max = georasterResponse.maxs[0]

        const range = georasterResponse.ranges[0]

        georasterResponse.ymax = 14.9999982459352719
        georasterResponse.ymin = 26.00000012734953
        georasterResponse.xmax = 123.00000203639075
        georasterResponse.xmin = 104.9999979636092462
        // const scale = chroma.scale('Viridis')
        // TODO:[-] 21-07-29 之前的色标的备份
        // const scale = chroma.scale([
        //     '#00429d',
        //     '#4771b2',
        //     '#73a2c6',
        //     '#a5d5d8',
        //     '#ffffe0',
        //     '#ffbcaf',
        //     '#f4777f',
        //     '#cf3759',
        //     '#93003a'
        // ])

        //
        // const scale = chroma.scale([
        //     '#0d60dd',
        //     '#3196fe',
        //     '#31c5fe',
        //     '#f8eb4b',
        //     '#fabf3b',
        //     '#ed4b3a',
        //     '#ef1f09'
        // ])

        // + 21-07-30 参考 windy 的色标
        // const scale = chroma.scale([
        //     // 'rgb(50, 158, 186)',
        //     // 'rgb(48, 128, 164)',
        //     'rgb(52, 101, 166)',
        //     'rgb(56, 104, 192)',
        //     'rgb(56, 83, 169)',
        //     'rgb(57, 61, 143)',
        //     '#f8eb4b',
        //     '#fabf3b',
        //     '#ed4b3a'
        // ])
        // 可接手的色标1
        // const scale = chroma.scale('RdYlBu').domain([1, 0])
        // 色标2:
        // const scale = chroma
        //     .scale(['yellow', 'navy'])
        //     .mode('hsl')
        //     .domain([1, 0])

        // 色标3:
        // const scale = chroma
        //     .scale([
        //         '#28005F',
        //         '#0D0074',
        //         '#001289',
        //         '#00489E',
        //         '#0089B1',
        //         '#22BE9C',
        //         '#44CA6F',
        //         '#6CD666',
        //         '#B5E088'
        //     ])
        //     .mode('hsl')
        //     .domain([0, 1])

        // 色标4:
        // const scale = chroma
        //     .scale([
        //         '#ffffd9',
        //         '#edf8b1',
        //         '#c7e9b4',
        //         '#7fcdbb',
        //         '#41b6c4',
        //         '#1d91c0',
        //         '#225ea8',
        //         '#253494',
        //         '#081d58'
        //     ])
        //     .mode('hsl')
        //     .domain([1, 0])

        // 色标5:
        // const scale = chroma
        //     .scale(['#B8CAFF', '#A3BAFF', '#8FABFF', '#7A9CFF', '#527DFF', '#295FFF'])
        //     .mode('hsl')
        //     .domain([1, 0])

        // const scale = chroma
        //     .scale(['#07213A', '#0A2B4D', '#0C3660', '#0E4173', '#104C86'])
        //     .mode('hsl')
        //     .domain([0, 1])

        const scale = chroma
            .scale([
                '#C8FAED',
                '#93F5E3',
                '#5BE1D5',
                '#32C4C2',
                '#01939E',
                '#007387',
                '#005771',
                '#003E5B',
                '#002D4B'
            ])
            .mode('hsl')
            .domain([1, 0])

        // TODO:[*] 21-02-10 此处当加载全球风场的geotiff时，y不在实际范围内，需要手动处理
        // const ymax = georasterResponse.ymax
        // georasterResponse.ymax = 26.00000012734953
        // georasterResponse.ymin = 14.9999998726504717
        // georasterResponse.xmin = 104.9999979636092462
        // georasterResponse.xmax = 123.0000020363907538

        const layer = new GeoRasterLayer({
            georaster: georasterResponse,
            opacity: 0.7,
            pixelValuesToColorFn: function(pixelValues) {
                const pixelValue = pixelValues[0] // there's just one band in this raster

                // if there's zero wind, don't return a color
                if (Number.isNaN(pixelValue)) return null

                // scale to 0 - 1 used by chroma
                const scaledPixelValue = (pixelValue - min) / range

                const color = scale(scaledPixelValue).hex()

                return color
            },
            resolution: 256
        })
        addedLayer = layer.addTo(map)
        this.rasterLayer = addedLayer
        try {
            // const tifResp = await loadCurrentTif(
            //     this.coverageId,
            //     this.forecastDt,
            //     this.forecastArea,
            //     DictEnum.COVERAGE_TYPE_CURRENT
            // )
            if (tifResp.status == 200) {
                return addedLayer
            }
        } catch (error) {
            console.log(error)
            errorCallBackFun
        }
        return addedLayer
    }
}
/**
 * modfiy + 21-08-19
 * 建议在创建时加入scale，可以直接使用 chroma.scale
 *
 * @class SurgeRasterGeoLayer
 */
class SurgeRasterGeoLayer {
    options: {
        rasterLayer: L.Layer

        tyCode: string

        tyTimestamp: string
        /**
         * 预报的时间
         *
         * @type {Date}
         * @memberof RasterGeoLayer
         */
        forecastDt: Date

        /**
         * + 21-08-19 新加入的 chroma.scale 色标变量，在构造函数中给与赋值
         *
         * @type {*}
         * @memberof SurgeRasterGeoLayer
         */
        scaleList: string[] | string
    } = {
        rasterLayer: new L.Layer(),

        tyCode: DEFAULTTYCODE,

        tyTimestamp: DEFAULT_TIMESTAMP,
        /**
         * 预报的时间
         *
         * @type {Date}
         * @memberof RasterGeoLayer
         */
        forecastDt: DEFAULT_DATE,

        /**
         * + 21-08-19 新加入的 chroma.scale 色标变量，在构造函数中给与赋值
         *
         * @type {*}
         * @memberof SurgeRasterGeoLayer
         */
        scaleList: DEFAULT_COLOR_SCALE.scaleColorList
    }

    get rasterLayer(): L.Layer {
        return this.options.rasterLayer
    }

    set rasterLayer(layer: L.Layer) {
        this.options.rasterLayer = layer
    }
    // rasterLayer = this.options.rasterLayer

    // tyCode = this.options.tyCode
    get tyCode(): string {
        return this.options.tyCode
    }

    // tyTimestamp = this.options.tyTimestamp
    get tyTimestamp(): string {
        return this.options.tyTimestamp
    }
    /**
     * 预报的时间
     *
     * @type {Date}
     * @memberof RasterGeoLayer
     */
    // forecastDt = this.options.forecastDt
    get forecastDt(): Date {
        return this.options.forecastDt
    }

    /**
     * + 21-08-19 新加入的 chroma.scale 色标变量，在构造函数中给与赋值
     *
     * @type {*}
     * @memberof SurgeRasterGeoLayer
     */
    // scale = this.options.scale
    get scaleList(): any {
        return this.options.scaleList
    }

    scaleRange: number[] = []

    constructor(options?: {
        tyCode?: string
        tyTimestamp?: string
        forecastDt?: Date
        scaleList: string[] | string
    }) {
        this.options = { ...this.options, ...options }
    }

    public async add2map(
        map: L.Map,
        errorCallBackFun: (opt: { message: string; type: string }) => void
    ): Promise<L.Layer> {
        let addedLayer: L.Layer = null
        // TODO:[-] 20-11-04 暂时注释掉，调取远程的文件会出现错误
        // const urlGeoTifUrl = tifResp.data

        // TODO:[*] 21-04-30 测试 暂时将 读取的 tif路径写死(最大增水)
        let urlGeoTifUrl = ''
        const maxSurge = new MaxSurge(this.tyCode, this.tyTimestamp)

        const awaitUrl = await maxSurge.getGeoTifUrl(this.tyCode, this.tyTimestamp)
        urlGeoTifUrl = awaitUrl
        // const urlGeoTifUrl =
        //     'http://localhost:82/images/TEST/TYPHOONSURGE/maxSurge_TY2022_2021010416_c0_p00.tif'
        // 大体思路 获取 geotiff file 的路径，二进制方式读取 -> 使用 georaster 插件实现转换 -> 获取色标，
        // TODO:[-] 20-11-02 将之前的逻辑方式修改为 await 的方式
        // TODO:[-] 20-11-05 在 fetch 请求头中加入跨域的部分
        const fetchHeader = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8,'
        })
        const response = await fetch(urlGeoTifUrl, {
            method: 'GET',
            // headers: fetchHeader,
            mode: 'cors'
        })
        const arrayBuffer = await response.arrayBuffer()
        // 使用 import 'georaster' 的方式引入会出现没有智能提示的问题
        // TODO:[-] 20-11-04
        // Uncaught (in promise) TypeError: Invalid byte order value.
        // at Function.fromSource (e2c99254-e67c-4422-be5d-01e0b254a36b:10)

        const georasterResponse = await parseGeoraster(arrayBuffer)
        const min = georasterResponse.mins[0]
        const max = georasterResponse.maxs[0]
        const range = georasterResponse.ranges[0]
        // const scale = chroma.scale('Viridis')
        // TODO:[*] 21-08-19 error: chroma 错误
        // chroma.js?6149:180 Uncaught (in promise) Error: unknown format: #ee4620,#ee462f,#ed4633,#ef6b6d,#f3a4a5,#f9dcdd,#dcdcfe
        const scale = chroma.scale([...this.options.scaleList])
        this.scaleRange = [min, max]

        // TODO:[*] 21-02-10 此处当加载全球风场的geotiff时，y不在实际范围内，需要手动处理
        georasterResponse.ymax = georasterResponse.ymax
        georasterResponse.ymin = georasterResponse.ymin

        const layer = new GeoRasterLayer({
            georaster: georasterResponse,
            opacity: 0.6,
            pixelValuesToColorFn: function(pixelValues) {
                const pixelValue = pixelValues[0] // there's just one band in this raster

                // if there's zero wind, don't return a color
                if (pixelValue === 0 || Number.isNaN(pixelValue)) return null

                // scale to 0 - 1 used by chroma
                const scaledPixelValue = (pixelValue - min) / range

                const color = scale(scaledPixelValue).hex()

                return color
            },
            resolution: 256
        })
        addedLayer = layer.addTo(map)
        // TODO:[*] 21-08-19 ERROR:TypeError
        // Uncaught (in promise) TypeError: Cannot set property rasterLayer of #<SurgeRasterGeoLayer> which has only a getter
        // this.rasterLayer 设置了 get 访问器，未设置 set 访问器，加入解决问题
        this.rasterLayer = addedLayer
        try {
            // const tifResp = await loadCurrentTif(
            //     this.coverageId,
            //     this.forecastDt,
            //     this.forecastArea,
            //     DictEnum.COVERAGE_TYPE_CURRENT
            // )
            if (tifResp.status == 200) {
                return addedLayer
            }
        } catch (error) {
            errorCallBackFun({
                message: '无法读取台风最大增水场',
                type: 'error'
            })
        }
        return addedLayer
    }

    /**
     * 判断指定url的文件是否存在
     *
     * @private
     * @param {string} url
     * @return {*}  {boolean}
     * @memberof SurgeRasterGeoLayer
     */
    protected checkRemoteFileExist(url: string): boolean {
        const xhr = new XMLHttpRequest()
        let isExist = false
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                // console.log('存在！')
                isExist = true
            }
        }
        xhr.open('HEAD', url)
        return isExist
    }
}

/**
 * 逐时风暴潮增水场
 *
 * @class FieldSurgeGeoLayer
 * @extends {SurgeRasterGeoLayer}
 */
class FieldSurgeGeoLayer extends SurgeRasterGeoLayer {
    public async add2map(
        map: L.Map,
        errorCallBackFun: (opt: { message: string; type: string }) => void
    ): Promise<L.Layer> {
        let addedLayer: L.Layer = null
        const that = this
        const forecastDtStr = moment(this.forecastDt).format('YYYY-MM-DD HH')
        try {
            const tifResp = await loadFieldSurgeTif(that.tyCode, that.tyTimestamp, that.forecastDt)
            const urlGeoTifUrl = tifResp.data
            // 大体思路 获取 geotiff file 的路径，二进制方式读取 -> 使用 georaster 插件实现转换 -> 获取色标，
            // TODO:[-] 20-11-02 将之前的逻辑方式修改为 await 的方式
            // TODO:[-] 20-11-05 在 fetch 请求头中加入跨域的部分
            const fetchHeader = new Headers({
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8,'
            })
            // TODO：[-] 21-12-27 此处若加载不存在的文件会出现较长时间的等待问题

            // if (this.checkRemoteFileExist(urlGeoTifUrl)) {
            // } else {
            //     throw URIError(`指定:${urlGeoTifUrl}不存在`)
            // }
            const response = await fetch(urlGeoTifUrl, {
                method: 'GET',
                // headers: fetchHeader,
                mode: 'cors'
            })
            const status = response.status
            if (status === 200) {
                console.log('指定文件存在')
            }
            //
            // console.log(`获取指定tif,status:${status}`)
            const arrayBuffer = await response.arrayBuffer()
            // 使用 import 'georaster' 的方式引入会出现没有智能提示的问题
            // TODO:[-] 20-11-04
            // Uncaught (in promise) TypeError: Invalid byte order value.
            // at Function.fromSource (e2c99254-e67c-4422-be5d-01e0b254a36b:10)

            const georasterResponse = await parseGeoraster(arrayBuffer)
            // TODO:[*] 21-05-31 将 风暴潮的范围写成固定值
            const min = georasterResponse.mins[0]
            const max = georasterResponse.maxs[0]
            // const range = georasterResponse.ranges[0]
            // TODO:[*] 21-08-04 此处不使用写死的 range,因为增水实际有可能会是一个负值，所以还是将 min 与 max 设置为 georasterResponse 的 min - max
            // const min = 0
            // const max = 0.5
            const range = max - min
            this.scaleRange = [min, max]
            // const scale = chroma.scale('Viridis')
            // + 21-07-30 参考 windy 的色标
            // const scale = chroma.scale([
            //     'rgb(50, 158, 186)',
            //     'rgb(48, 128, 164)',
            //     'rgb(48, 128, 164)',
            //     'rgb(52, 101, 166)',
            //     'rgb(56, 104, 192)',
            //     'rgb(56, 83, 169)',
            //     'rgb(57, 61, 143)',
            //     'rgb(134, 48, 49)',
            //     'rgb(194, 76, 91)',
            //     'rgb(192, 118, 105)',
            //     'rgb(192, 162, 157)',
            //     'rgb(192, 162, 157)'
            // ])
            // + 21-08-04 : https://colorbrewer2.org/#type=sequential&scheme=YlGnBu&n=9
            // const scale = chroma.scale([
            //     '#081d58',
            //     '#253494',
            //     '#225ea8',
            //     '#1d91c0',
            //     '#41b6c4',
            //     '#7fcdbb',
            //     '#c7e9b4',
            //     '#edf8b1',
            //     '#ffffd9'
            // ])
            const scale = chroma.scale([...this.options.scaleList])
            // const scale = chroma.scale([
            //     '#00429d',
            //     '#4771b2',
            //     '#73a2c6',
            //     '#a5d5d8',
            //     '#ffffe0',
            //     '#ffbcaf',
            //     '#f4777f',
            //     '#cf3759',
            //     '#93003a'
            // ])

            // TODO:[*] 21-02-10 此处当加载全球风场的geotiff时，y不在实际范围内，需要手动处理
            georasterResponse.ymax = georasterResponse.ymax
            georasterResponse.ymin = georasterResponse.ymin
            // georasterResponse.ymax = max
            // georasterResponse.ymin = min

            const layer = new GeoRasterLayer({
                georaster: georasterResponse,
                opacity: 0.6,
                pixelValuesToColorFn: function(pixelValues) {
                    const pixelValue = pixelValues[0] // there's just one band in this raster
                    // TODO:[-] 21-05-31 修改了原始数据，陆地部分采用 Nan，所以不需要将 0 值填充为 null
                    if (Number.isNaN(pixelValue) || pixelValue === -32767) return null

                    // scale to 0 - 1 used by chroma
                    // TODO:[-] 21-05-31 注意若设置固定范围的色标，则此处的scaledPiexelValue 是一个 0-1 的值，也就是 当前值 / range
                    let scaledPixelValue = min
                    if (pixelValue > max) {
                        scaledPixelValue = max / range
                    } else if (pixelValue < min) {
                        scaledPixelValue = min / range
                    } else {
                        scaledPixelValue = (pixelValue - min) / range
                    }
                    // const scaledPixelValue = (pixelValue - min) / range

                    const color = scale(scaledPixelValue).hex()

                    return color
                },
                resolution: 256
            })
            addedLayer = layer.addTo(map)
            that.rasterLayer = addedLayer
        } catch (error) {
            if (error instanceof URIError) {
                errorCallBackFun({
                    message: `无法读取指定时间${forecastDtStr}台风逐时增水场url`,
                    type: 'error'
                })
            } else {
                errorCallBackFun({
                    message: '其他异常',
                    type: 'error'
                })
            }
        }

        return addedLayer
    }
}

/**
 * + 21-08-12
 *  概率增水场
 *
 * @class ProSurgeGeoLayer
 * @extends {SurgeRasterGeoLayer}
 */
class ProSurgeGeoLayer extends SurgeRasterGeoLayer {
    public async add2map(
        map: L.Map,
        errorCallBackFun: (opt: { message: string; type: string }) => void,
        pro: number,
        coverageType: LayerTypeEnum
    ): Promise<L.Layer> {
        let addedLayer: L.Layer = null
        const that = this
        try {
            const tifResp = await loadProSurgeTif(that.tyCode, that.tyTimestamp, pro, coverageType)
            const urlGeoTifUrl = tifResp.data
            // 大体思路 获取 geotiff file 的路径，二进制方式读取 -> 使用 georaster 插件实现转换 -> 获取色标，
            // TODO:[-] 20-11-02 将之前的逻辑方式修改为 await 的方式
            // TODO:[-] 20-11-05 在 fetch 请求头中加入跨域的部分
            const fetchHeader = new Headers({
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8,'
            })
            // if (this.checkRemoteFileExist(urlGeoTifUrl)) {

            // } else {
            //     throw URIError(`指定:${urlGeoTifUrl}不存在`)
            // }
            const response = await fetch(urlGeoTifUrl, {
                method: 'GET',
                // headers: fetchHeader,
                mode: 'cors'
            })
            const arrayBuffer = await response.arrayBuffer()
            // 使用 import 'georaster' 的方式引入会出现没有智能提示的问题
            // TODO:[-] 20-11-04
            // Uncaught (in promise) TypeError: Invalid byte order value.
            // at Function.fromSource (e2c99254-e67c-4422-be5d-01e0b254a36b:10)

            const georasterResponse = await parseGeoraster(arrayBuffer)
            // TODO:[*] 21-05-31 将 风暴潮的范围写成固定值
            const min = georasterResponse.mins[0]
            const max = georasterResponse.maxs[0]
            // const range = georasterResponse.ranges[0]
            // TODO:[*] 21-08-04 此处不使用写死的 range,因为增水实际有可能会是一个负值，所以还是将 min 与 max 设置为 georasterResponse 的 min - max
            // const min = 0
            // const max = 0.5
            const range = max - min
            // + 21-08-04 : https://colorbrewer2.org/#type=sequential&scheme=YlGnBu&n=9
            // const scale = chroma.scale([
            //     '#081d58',
            //     '#253494',
            //     '#225ea8',
            //     '#1d91c0',
            //     '#41b6c4',
            //     '#7fcdbb',
            //     '#c7e9b4',
            //     '#edf8b1',
            //     '#ffffd9'
            // ])
            const scale = chroma.scale([...this.options.scaleList])
            this.scaleRange = [min, max]
            // TODO:[*] 21-02-10 此处当加载全球风场的geotiff时，y不在实际范围内，需要手动处理
            georasterResponse.ymax = georasterResponse.ymax
            georasterResponse.ymin = georasterResponse.ymin
            // georasterResponse.ymax = max
            // georasterResponse.ymin = min

            const layer = new GeoRasterLayer({
                georaster: georasterResponse,
                opacity: 0.6,
                pixelValuesToColorFn: function(pixelValues) {
                    const pixelValue = pixelValues[0] // there's just one band in this raster
                    // TODO:[-] 21-05-31 修改了原始数据，陆地部分采用 Nan，所以不需要将 0 值填充为 null
                    if (Number.isNaN(pixelValue) || pixelValue === -32767) return null

                    // scale to 0 - 1 used by chroma
                    // TODO:[-] 21-05-31 注意若设置固定范围的色标，则此处的scaledPiexelValue 是一个 0-1 的值，也就是 当前值 / range
                    let scaledPixelValue = min
                    if (pixelValue > max) {
                        scaledPixelValue = max / range
                    } else if (pixelValue < min) {
                        scaledPixelValue = min / range
                    } else {
                        scaledPixelValue = (pixelValue - min) / range
                    }
                    // const scaledPixelValue = (pixelValue - min) / range

                    const color = scale(scaledPixelValue).hex()

                    return color
                },
                resolution: 256
            })
            addedLayer = layer.addTo(map)
            that.rasterLayer = addedLayer
        } catch (error) {
            if (error instanceof URIError) {
                errorCallBackFun({
                    message: '无法读取当前台风概率增水场url',
                    type: 'error'
                })
            } else {
                errorCallBackFun({
                    message: '其他异常',
                    type: 'error'
                })
            }
        }

        return addedLayer
    }
}

// 以下采用 https://github.com/837408195/leaflet-learn 的实现方式
/*
    目前可知的优缺点：
        由于有一个根据 width 与 heigh 进行内外循环的操作，速度略慢，但生成之后缩放时较快
*/
class ProSurgeGeoLayerByGeotiffjsWay1 extends SurgeRasterGeoLayer {
    public async add2map(
        map: L.Map,
        errorCallBackFun: (opt: { message: string; type: string }) => void,
        pro: number,
        coverageType: LayerTypeEnum
    ): Promise<L.Layer> {
        let addedLayer: L.Layer = null
        const that = this
        try {
            const tifResp = await loadProSurgeTif(that.tyCode, that.tyTimestamp, pro, coverageType)
            const urlGeoTifUrl = tifResp.data
            // 大体思路 获取 geotiff file 的路径，二进制方式读取 -> 使用 georaster 插件实现转换 -> 获取色标，
            // TODO:[-] 20-11-02 将之前的逻辑方式修改为 await 的方式
            // TODO:[-] 20-11-05 在 fetch 请求头中加入跨域的部分
            const fetchHeader = new Headers({
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8,'
            })
            const response = await fetch(urlGeoTifUrl, {
                method: 'GET',
                // headers: fetchHeader,
                mode: 'cors'
            })
            const arrayBuffer = await response.arrayBuffer()
            // 使用 geotiff.js 的方式实现读取 tif
            const tif = await fromArrayBuffer(arrayBuffer)
            const image = await tif.getImage()
            const data = await image.readRasters()
            const canvas = document.getElementById('plot')
            // const plot = new plotty.plot({
            //     canvas,
            //     data: data[0],
            //     width: image.getWidth(),
            //     height: image.getHeight(),
            //     domain: [0, 256],
            //     colorScale: 'viridis'
            // })
            // plot.render()
            // --
            const noDataValue = 99999
            const tiffWidth = image.getWidth()
            const tiffHeight = image.getHeight()
            const samplesPerPixel = image.getSamplesPerPixel()
            const bounds = image.getBoundingBox()
            const tiepoint = image.getTiePoints()[0]
            const pixelScale = image.getFileDirectory().ModelPixelScale
            const geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1 * pixelScale[1]]
            const tempData = new Array(tiffHeight)
            for (let j = 0; j < tiffHeight; j++) {
                tempData[j] = new Array(tiffWidth)
                for (let i = 0; i < tiffWidth; i++) {
                    tempData[j][i] = data[0][i + j * tiffWidth]
                }
            }
            //   let arr = data[0].filter(item => item!==this.noDataValue);
            //   let min = Math.min(...arr),
            //     max = Math.max(...arr);
            const canvasContent = document.createElement('canvas')
            const rightBottomPixel = map.latLngToContainerPoint([bounds[1], bounds[2]])
            const leftTopPixel = map.latLngToContainerPoint([bounds[3], bounds[0]])
            const tileWidth = rightBottomPixel.x - leftTopPixel.x,
                tileHeight = rightBottomPixel.y - leftTopPixel.y
            canvasContent.width = tileWidth
            canvasContent.height = tileHeight
            const context = canvasContent.getContext('2d')
            const id = context.createImageData(tileWidth, tileHeight)
            const canvasData = id.data
            // const scale = chroma.scale([
            //     '#081d58',
            //     '#253494',
            //     '#225ea8',
            //     '#1d91c0',
            //     '#41b6c4',
            //     '#7fcdbb',
            //     '#c7e9b4',
            //     '#edf8b1',
            //     '#ffffd9'
            // ])
            const scale = chroma.scale([this.options.scaleList])
            for (let y = 0; y < tileHeight; y++) {
                for (let x = 0; x < tileWidth; x++) {
                    const latlng = map.layerPointToLatLng([leftTopPixel.x + x, leftTopPixel.y + y])
                    const px = (latlng.lng - geoTransform[0]) / geoTransform[1]
                    const py = (latlng.lat - geoTransform[3]) / geoTransform[5]
                    if (Math.floor(px) >= 0 && Math.floor(py) >= 0) {
                        // console.log(Math.floor(px),Math.floor(py))
                        let rgba = scale(tempData[Math.floor(py)][Math.floor(px)]).rgba()
                        if (tempData[Math.floor(py)][Math.floor(px)] == noDataValue)
                            rgba = [0, 0, 0, 0]
                        const index = (y * tileWidth + x) * 4
                        canvasData[index + 0] = rgba[0]
                        canvasData[index + 1] = rgba[1]
                        canvasData[index + 2] = rgba[2]
                        canvasData[index + 3] = rgba[3] * 255
                    }
                }
            }
            context.putImageData(id, 0, 0)
            //   return
            console.log(bounds)
            // if (this.imgLayer) this.map.removeLayer(this.imgLayer)
            addedLayer = L.imageOverlay(
                canvasContent.toDataURL(),
                [
                    [bounds[1], bounds[0]],
                    [bounds[3], bounds[2]]
                ],
                {
                    opacity: 0.3
                }
            )
            addedLayer.addTo(map)
            //--
            // addedLayer = layer.addTo(map)
            that.rasterLayer = addedLayer
        } catch (error) {
            console.warn(error.message)
        }

        return addedLayer
    }
}

class ProSurgeGeoLayerByGeotiffjsWay2 extends SurgeRasterGeoLayer {
    public async add2map(
        map: L.Map,
        errorCallBackFun: (opt: { message: string; type: string }) => void,
        pro: number,
        coverageType: LayerTypeEnum
    ): Promise<L.Layer> {
        let addedLayer: L.Layer = null
        const that = this
        try {
            const tifResp = await loadProSurgeTif(that.tyCode, that.tyTimestamp, pro, coverageType)
            const urlGeoTifUrl = tifResp.data
            // 大体思路 获取 geotiff file 的路径，二进制方式读取 -> 使用 georaster 插件实现转换 -> 获取色标，
            // TODO:[-] 20-11-02 将之前的逻辑方式修改为 await 的方式
            // TODO:[-] 20-11-05 在 fetch 请求头中加入跨域的部分
            const fetchHeader = new Headers({
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8,'
            })
            const response = await fetch(urlGeoTifUrl, {
                method: 'GET',
                // headers: fetchHeader,
                mode: 'cors'
            })
            const arrayBuffer = await response.arrayBuffer()
            // 使用 geotiff.js 的方式实现读取 tif
            const tif = await fromArrayBuffer(arrayBuffer)
            const image = await tif.getImage()
            const data = await image.readRasters()
            const canvas = document.getElementById('plot')
            // const plot = new plotty.plot({
            //     canvas,
            //     data: data[0],
            //     width: image.getWidth(),
            //     height: image.getHeight(),
            //     domain: [0, 256],
            //     colorScale: 'viridis'
            // })
            // plot.render()
            // --
            const noDataValue = 99999
            const tiffWidth = image.getWidth()
            const tiffHeight = image.getHeight()
            const samplesPerPixel = image.getSamplesPerPixel()
            const bounds = image.getBoundingBox()
            const tiepoint = image.getTiePoints()[0]
            const pixelScale = image.getFileDirectory().ModelPixelScale
            const geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1 * pixelScale[1]]
            const tempData = new Array(tiffHeight)
            for (let j = 0; j < tiffHeight; j++) {
                tempData[j] = new Array(tiffWidth)
                for (let i = 0; i < tiffWidth; i++) {
                    tempData[j][i] = data[0][i + j * tiffWidth]
                }
            }
            //   let arr = data[0].filter(item => item!==this.noDataValue);
            //   let min = Math.min(...arr),
            //     max = Math.max(...arr);
            const canvasContent = document.createElement('canvas')
            const rightBottomPixel = map.latLngToContainerPoint([bounds[1], bounds[2]])
            const leftTopPixel = map.latLngToContainerPoint([bounds[3], bounds[0]])
            const tileWidth = rightBottomPixel.x - leftTopPixel.x,
                tileHeight = rightBottomPixel.y - leftTopPixel.y
            canvasContent.width = tileWidth
            canvasContent.height = tileHeight
            const context = canvasContent.getContext('2d')
            const id = context.createImageData(tileWidth, tileHeight)
            const canvasData = id.data
            // const scale = chroma.scale([
            //     '#081d58',
            //     '#253494',
            //     '#225ea8',
            //     '#1d91c0',
            //     '#41b6c4',
            //     '#7fcdbb',
            //     '#c7e9b4',
            //     '#edf8b1',
            //     '#ffffd9'
            // ])
            const scale = chroma.scale([this.options.scaleList])

            const plot = new plotty.plot({
                data: data,
                width: tiffWidth,
                height: tiffHeight,
                // domain: [this.options.displayMin, this.options.displayMax],
                colorScale: scale,
                clampLow: true,
                clampHigh: true,
                canvas: canvasContent,
                useWebGL: false
            })
            plot.setNoDataValue(-9999)
            plot.render()

            // this.colorScaleData = plot.colorScaleCanvas.toDataURL()

            const rasterImageData = canvasContent
                .getContext('2d')
                .getImageData(0, 0, canvasContent.width, canvasContent.height)
            // const imageData = this.parent.transform(rasterImageData, args)
            // ctx.putImageData(imageData, args.xStart, args.yStart)

            canvasContent.putImageData(id, 0, 0)
            //   return
            console.log(bounds)
            // if (this.imgLayer) this.map.removeLayer(this.imgLayer)
            addedLayer = L.imageOverlay(
                canvasContent.toDataURL(),
                [
                    [bounds[1], bounds[0]],
                    [bounds[3], bounds[2]]
                ],
                {
                    opacity: 0.3
                }
            )
            addedLayer.addTo(map)
            //--
            // addedLayer = layer.addTo(map)
            that.rasterLayer = addedLayer
        } catch (error) {
            console.warn(error.message)
        }

        return addedLayer
    }
}

/**
 *  风场栅格 layer (继承自 RasterGeoLayer)
 *
 * @class WindRasterGeoLayer
 * @extends {RasterGeoLayer}
 */
class WindRasterGeoLayer extends RasterGeoLayer {
    public async add2map(
        map: L.Map,
        errorCallBackFun: (opt: { message: string; type: string }) => void
    ): Promise<L.Layer> {
        let addedLayer: L.Layer = null
        try {
            const tifResp = await loadCurrentTif(
                this.coverageId,
                this.forecastDt,
                this.forecastArea,
                DictEnum.COVERAGE_TYPE_WIND
            )
            if (tifResp.status === 200) {
                // TODO:[-] 21-02-19 暂时将 与后台交互获取 tif url 放在前台
                // 21-02-16 使用差值抽稀后大概step=10
                let urlGeoTifUrl =
                    'http://localhost:82/images/TEST/WIND/TIFF/global_ecmwf_det_atm_2020123000_SPLICE_STEP_03_ABS_TIME_0.tif'

                urlGeoTifUrl = tifResp.data
                // 使用 21-02-17 osgeo.gdal 转换后的tif
                // urlGeoTifUrl =
                //     'http://localhost:82/images/TEST/WIND/TIFF/global_ecmwf_det_atm_2020123000_SPLICE_STEP_00_ABS_TIME_0_DIFF.tif'
                // 21-02-17  尝试进行有损压缩 -> jpeg
                // urlGeoTifUrl =
                //     'http://localhost:82/images/TEST/WIND/TIFF/global_ecmwf_det_atm_2020123000_SPLICE_STEP_00_ABS_TIME_0_DIFF.jpg'
                // TODO:[*] 20-11-20 为了测试全球流场，暂时替换为全球流场的指定路径
                // urlGeoTifUrl =
                //     'http://localhost:80/images/nmefc_download/COMMON/TEST/YB_rec_HL_GLB_2020043008BJS_a24_1hr_converted.tiff'
                // TODO:[-] 20-11-25 选择了 step=3 的 nc-> tif
                // TODO:[-] 21-01-03 去掉了之前写死的测试文件路径，改为动态获取文件路径
                // urlGeoTifUrl =
                //     'http://localhost:80/images/nmefc_download/COMMON/TEST/YB_rec_HL_GLB_2020043008BJS_a24_1hr_converted_splice_00_3.tiff'
                // 存储在 nginx 目录下的文件，访问时会出错，而vue的静态文件则不会出错
                // urlGeoTifUrl =
                //     'http://localhost/images/nmefc_download/COMMON/DAILY/2020/10/06/CURRENT/ecsnew_current_20201006_masked/ecsnew_current_20201006_masked_202010061200_abs.tif'

                // 大体思路 获取 geotiff file 的路径，二进制方式读取 -> 使用 georaster 插件实现转换 -> 获取色标，
                // 对于 fetch -> .then 的方式进行改造
                // fetch(url_to_geotiff_file)
                //     .then((response) => response.arrayBuffer())
                //     .then((arrayBuffer) => {
                //         // 以下部分暂时提取出来
                //         addedLayer = 123
                //     })
                // TODO:[-] 20-11-02 将之前的逻辑方式修改为 await 的方式
                // TODO:[-] 20-11-05 在 fetch 请求头中加入跨域的部分
                const fetchHeader = new Headers({
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8,'
                })
                const response = await fetch(urlGeoTifUrl, {
                    method: 'GET',
                    // headers: fetchHeader,
                    mode: 'cors'
                })
                const arrayBuffer = await response.arrayBuffer()
                // 使用 import 'georaster' 的方式引入会出现没有智能提示的问题
                // TODO:[-] 20-11-04
                // Uncaught (in promise) TypeError: Invalid byte order value.
                // at Function.fromSource (e2c99254-e67c-4422-be5d-01e0b254a36b:10)
                // TODO:[*] 21-02-10 读取全球风场时，此处存在一个bug
                /*
height: 1439
maxs: [29.234527587890625]
mins: [-22.687347412109375]
noDataValue: -32767
numberOfRasters: 1
pixelHeight: 0.125
pixelWidth: 0.125
projection: 4326
ranges: [51.921875]
rasterType: "geotiff"
sourceType: "ArrayBuffer"
toCanvas: ƒ (e)
values: [Array(1439)]
width: 2879
xmax: 179.9375
xmin: -179.9375
ymax: -89.9375
ymin: -269.8125
_blob_is_available: true
_data: ArrayBuffer(33152387) {}
_url_is_available: true
_web_worker_is_available: true
*/
                const georasterResponse = await parseGeoraster(arrayBuffer)
                const min = georasterResponse.mins[0]
                const max = georasterResponse.maxs[0]
                const range = georasterResponse.ranges[0]
                const scale = chroma.scale('Viridis')

                // TODO:[*] 21-02-10 此处当加载全球风场的geotiff时，y不在实际范围内，需要手动处理
                georasterResponse.ymax = georasterResponse.ymax + 180
                georasterResponse.ymin = georasterResponse.ymin + 180

                const layer = new GeoRasterLayer({
                    georaster: georasterResponse,
                    opacity: 0.6,
                    pixelValuesToColorFn: function(pixelValues) {
                        const pixelValue = pixelValues[0] // there's just one band in this raster

                        // if there's zero wind, don't return a color
                        if (pixelValue === 0 || Number.isNaN(pixelValue)) return null

                        // scale to 0 - 1 used by chroma
                        const scaledPixelValue = (pixelValue - min) / range

                        const color = scale(scaledPixelValue).hex()

                        return color
                    },
                    resolution: 256
                })
                addedLayer = layer.addTo(map)
                this.rasterLayer = addedLayer
                if (tifResp.status == 200) {
                    // TODO:[-] 20-11-04 暂时注释掉，调取远程的文件会出现错误
                    let urlGeoTifUrl = tifResp.data
                    // TODO:[*] 21-02-10 注意此处测试一下加载全球风场的raster to map
                    // urlGeoTifUrl =
                    //     'http://localhost:82/images/TEST/WIND/TIFF/global_ecmwf_det_atm_2020123000_SPLICE_STEP_15_ABS_TIME_0.tif'
                    // TODO:[-] 21-02-16 最终的加载全球风场的 url demo
                    // urlGeoTifUrl =
                    //     'http://localhost:82/images/TEST/WIND/TIFF/global_ecmwf_det_atm_2020123000_SPLICE_STEP_05_ABS_TIME_0.tif'

                    // 21-02-16 未抽稀的原始 tif
                    // urlGeoTifUrl =
                    //     'http://localhost:82/images/TEST/WIND/TIFF/global_ecmwf_det_atm_2020123000_SPLICE_STEP_00_ABS_TIME_0.tif'
                    // 21-02-16 使用差值抽稀后的 tif
                    urlGeoTifUrl =
                        'http://localhost:82/images/TEST/WIND/TIFF/global_ecmwf_det_atm_2020123000_SPLICE_DIFF_ABS_TIME_0.tif'
                }
            }
        } catch (error) {
            console.error(error)
            errorCallBackFun({ message: '不存在指定的tif', type: 'warning' })
        }

        return addedLayer
    }
}

/**
 * + 21-03-31 新加入的 海浪 栅格 图层(加载海表面高度的 geotiff)
 *
 * @class WaveRasterGeoLayer
 * @extends {RasterGeoLayer}
 */
class WaveRasterGeoLayer extends RasterGeoLayer {
    public async add2map(
        map: L.Map,
        errorCallBackFun: (opt: { message: string; type: string }) => void
    ): Promise<L.Layer> {
        const that = this
        const forecastDtStr = moment(that.forecastDt).format('YYYY-MM-DD HH')
        let addedLayer: L.Layer = null
        try {
            const tifResp = await loadCurrentTif(
                this.coverageId,
                this.forecastDt,
                this.forecastArea,
                ProductEnum.COVERAGE_TYPE_WAVE_WVE
            )
            // TODO:[-] 21-02-19 暂时将 与后台交互获取 tif url 放在前台
            // 21-02-16 使用差值抽稀后大概step=10
            // const urlGeoTifUrl =
            //     'http://localhost:82/images/TEST/WAVE/TIFF/global_ecmwf_det_mwe_2021031600_SPLICE_STEP_3_TIME_0.tif'

            const urlGeoTifUrl = tifResp.data
            const fetchHeader = new Headers({
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8,'
            })
            const response = await fetch(urlGeoTifUrl, {
                method: 'GET',
                // headers: fetchHeader,
                mode: 'cors'
            })
            const arrayBuffer = await response.arrayBuffer()
            // 使用 import 'georaster' 的方式引入会出现没有智能提示的问题
            const georasterResponse = await parseGeoraster(arrayBuffer)
            const min = georasterResponse.mins[0]
            const max = georasterResponse.maxs[0]
            const range = georasterResponse.ranges[0]
            const scale = chroma.scale('Viridis')

            // TODO:[*] 21-02-10 此处当加载全球风场的geotiff时，y不在实际范围内，需要手动处理
            // 全球海浪
            /*
          height: 241
          maxs: [8.684290298366296]
          mins: [0.017275460064411163]
          noDataValue: NaN
          numberOfRasters: 1
          pixelHeight: 0.75
          pixelWidth: 0.75
          projection: 4326
          ranges: [8.667014838301885]
          rasterType: "geotiff"
          sourceType: "ArrayBuffer"
          toCanvas: ƒ (e)
          values: [Array(241)]
          width: 480
          xmax: 179.875
          xmin: -180.125
          ymax: 90.375
          ymin: -90.375
      */
            // georasterResponse.ymax = georasterResponse.ymax
            // georasterResponse.ymin = georasterResponse.ymin

            const layer = new GeoRasterLayer({
                georaster: georasterResponse,
                opacity: 0.6,
                pixelValuesToColorFn: function(pixelValues) {
                    const pixelValue = pixelValues[0]
                    // TODO:[-] 21-04-06 + ERROR: 全球海浪-海表面高度 空值为 -32767
                    if (pixelValue === 0 || Number.isNaN(pixelValue) || pixelValue === -32767)
                        return null
                    // scale to 0 - 1 used by chroma
                    const scaledPixelValue = (pixelValue - min) / range

                    const color = scale(scaledPixelValue).hex()

                    return color
                },
                resolution: 256
            })
            addedLayer = layer.addTo(map)
            this.rasterLayer = addedLayer
        } catch (error) {
            // console.error(error)
            errorCallBackFun({
                message: `不存在指定时间${forecastDtStr}海表面高度的tif`,
                type: 'warning'
            })
        }

        return addedLayer
    }
}

export {
    RasterGeoLayer,
    WindRasterGeoLayer,
    WaveRasterGeoLayer,
    SurgeRasterGeoLayer,
    FieldSurgeGeoLayer,
    ProSurgeGeoLayer,
    ProSurgeGeoLayerByGeotiffjsWay1,
    ProSurgeGeoLayerByGeotiffjsWay2
}
