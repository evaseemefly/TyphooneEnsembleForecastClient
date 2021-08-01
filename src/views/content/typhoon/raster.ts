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
import * as geotiff from 'geotiff'
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
import { loadCurrentTif, loadFieldSurgeTif } from '@/api/geo'
import { MaxSurge } from './surge'
import { AreaEnum } from '@/enum/area'
import { DictEnum, ProductEnum } from '@/enum/dict'
import { USELESS_COVERAGE_ID } from '@/const/common'

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

        // TODO:[*] 21-04-30 测试 暂时将 读取的 tif路径写死(最大增水)
        // const urlGeoTifUrl =
        //     'http://localhost:82/images/TY_GROUP_RESULT/TY2107_2021072110/maxSurge_TY2107_2021072110_c0_p00.tif'
        const urlGeoTifUrl =
            'http://localhost:82/images/TY_GROUP_RESULT/TY2022_2021010416/maxSurge_TY2022_2021010416_c0_p00.tif'
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
        const scale = chroma.scale([
            'rgb(50, 158, 186)',
            'rgb(48, 128, 164)',
            'rgb(48, 128, 164)',
            'rgb(52, 101, 166)',
            'rgb(56, 104, 192)',
            'rgb(56, 83, 169)',
            'rgb(57, 61, 143)',
            'rgb(134, 48, 49)',
            'rgb(194, 76, 91)',
            'rgb(192, 118, 105)',
            'rgb(192, 162, 157)',
            'rgb(192, 162, 157)'
        ])

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

class SurgeRasterGeoLayer {
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

    constructor(tyCode: string, tyTimestamp: string, forecastDt: Date) {
        this.tyCode = tyCode
        this.tyTimestamp = tyTimestamp
        this.forecastDt = forecastDt
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
        const scale = chroma.scale([
            '#00429d',
            '#4771b2',
            '#73a2c6',
            '#a5d5d8',
            '#ffffe0',
            '#ffbcaf',
            '#f4777f',
            '#cf3759',
            '#93003a'
        ])

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
            // TODO:[*] 21-04-30 测试 暂时将 读取的 tif路径写死(最大增水)
            const tifResp = await loadFieldSurgeTif(that.tyCode, that.tyTimestamp, that.forecastDt)
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
            // 使用 import 'georaster' 的方式引入会出现没有智能提示的问题
            // TODO:[-] 20-11-04
            // Uncaught (in promise) TypeError: Invalid byte order value.
            // at Function.fromSource (e2c99254-e67c-4422-be5d-01e0b254a36b:10)

            const georasterResponse = await parseGeoraster(arrayBuffer)
            // TODO:[*] 21-05-31 将 风暴潮的范围写成固定值
            // const min = georasterResponse.mins[0]
            // const max = georasterResponse.maxs[0]
            // const range = georasterResponse.ranges[0]
            const min = 0
            const max = 0.5
            const range = max - min
            // const scale = chroma.scale('Viridis')
            const scale = chroma.scale([
                '#00429d',
                '#4771b2',
                '#73a2c6',
                '#a5d5d8',
                '#ffffe0',
                '#ffbcaf',
                '#f4777f',
                '#cf3759',
                '#93003a'
            ])

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
            errorCallBackFun({
                message: `不存在指定时间${forecastDtStr}台风逐时增水场(field_surge)的tif`,
                type: 'warning'
            })
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
    FieldSurgeGeoLayer
}
