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
import { loadCurrentTif } from '@/api/geo'
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
/**
 * 对于栅格数据加载等值线
 *
 * @class RasterIsoline
 * @implements {IRaster}
 */
class RasterIsoline implements IRaster {
    public add2map(map: any): void {
        // 以下实现详见:https://geoexamples.com/d3-raster-tools-docs/plot/drawing-raster-data.html
        // 参考:https://geoexamples.com/d3-raster-tools-docs/code_samples/leaflet-iso-page.html
        // geotiff.fromUrl('/data/test.tiff').then((tiff) => {
        //     console.log(tiff)
        // })
        d3.request('/data/test.tif')
            .responseType('arraybuffer')
            .get(function(error, tiffData) {
                /*
                    错误1- Uncaught TypeError: geotiff__WEBPACK_IMPORTED_MODULE_19__.default.parse is not a function
                    import geotiff.js 错误导致的

                    错误2-
                    Uncaught (in promise) TypeError: Invalid byte order value.

                    createError.js?2d83:16 Uncaught (in promise) Error: Request failed with status code 500

                    出现以上错误是由于 读取的文件路径有错误导致的

                */
                geotiff.fromArrayBuffer(tiffData.response).then(async (tiff) => {
                    // 'await' expressions are only allowed within async functions and at the top levels of modules.
                    // 需要在 then 的 res 加入 async 标识
                    const tiffImage = await tiff.getImage()
                    const rasters = await tiffImage.readRasters()
                    const tiepoint = tiffImage.getTiePoints()[0]
                    const pixelScale = tiffImage.getFileDirectory().ModelPixelScale
                    const tiffWidth = tiffImage.getWidth()
                    const tiffHeight = tiffImage.getHeight()
                    const geoTransform = [
                        tiepoint.x,
                        pixelScale[0],
                        0,
                        tiepoint.y,
                        0,
                        -1 * pixelScale[1]
                    ]

                    // ----
                    // 之前的备份
                    const pressData = new Array(tiffHeight)
                    const tempData = new Array(tiffHeight)
                    const uData = new Array(tiffHeight)
                    const vData = new Array(tiffHeight)
                    const spdData = new Array(tiffHeight)
                    for (let j = 0; j < tiffHeight; j++) {
                        pressData[j] = new Array(tiffWidth)
                        tempData[j] = new Array(tiffWidth)
                        uData[j] = new Array(tiffWidth)
                        vData[j] = new Array(tiffWidth)
                        spdData[j] = new Array(tiffWidth)
                        for (let i = 0; i < tiffWidth; i++) {
                            // TODO:[*] 20-09-07 我个人的理解是 raster 是根据读取的tiff中的变量存在不同的维度，即tiff中可以有多个变量?，而我的tiff中实际测试用的只有一个 x_wind_10m 变量
                            pressData[j][i] = rasters[0][i + j * tiffWidth]
                            // Uncaught (in promise) TypeError: Cannot read property '0' of undefined
                            // tempData[j][i] = rasters[1][i + j * tiffWidth]
                            // uData[j][i] = rasters[2][i + j * tiffWidth]
                            // vData[j][i] = rasters[3][i + j * tiffWidth]
                            // spdData[j][i] =
                            //     1.943844492 *
                            //     Math.sqrt(uData[j][i] * uData[j][i] + vData[j][i] * vData[j][i])
                        }
                    }
                    const intervalsSpd = [
                        -7,
                        -6,
                        -5,
                        -4,
                        -3,
                        -2,
                        -1,
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10
                    ]
                    // const bandsWind = rastertools.isobands(spdData, geoTransform, intervalsSpd)
                    const bandsWind = rasterMarching.isobands(pressData, geoTransform, intervalsSpd)

                    function getColor(d) {
                        return d > 10
                            ? '#643c32'
                            : d > 9
                            ? '#a50000'
                            : d > 8
                            ? '#c10000'
                            : d > 7
                            ? '#e11400'
                            : d > 6
                            ? '#ff3200'
                            : d > 5
                            ? '#ff6000'
                            : d > 4
                            ? '#ffa100'
                            : d > 3
                            ? '#ffe978'
                            : d > 2
                            ? '#c9ffbf'
                            : d > 1
                            ? '#b5fbab'
                            : d > 0
                            ? '#97f58d'
                            : d > -1
                            ? '#78f572'
                            : d > -2
                            ? '#36d33c'
                            : d > -3
                            ? '#1eb31e'
                            : d > -4
                            ? '#e1ffff'
                            : d > -5
                            ? '#97d3fb'
                            : d > -6
                            ? '#78b9fb'
                            : d > -7
                            ? '#50a5f5'
                            : '#ffffff'
                    }

                    function style(feature) {
                        return {
                            fillColor: getColor(feature.properties[0].lowerValue),
                            weight: 2,
                            opacity: 1,
                            color: getColor(feature.properties[0].lowerValue),
                            dashArray: '3',
                            fillOpacity: 0.5
                            // zindex: 1500
                        }
                    }

                    const bandsWindLayer = L.geoJson(bandsWind, {
                        style: style
                    })
                    bandsWindLayer.addTo(map)
                })
            })
    }
}

class RasterPixel implements IRaster {
    public add2map(map: any): void {
        d3.request('/data/vardah.tiff')
            .responseType('arraybuffer')
            .get(function(error, tiffData) {
                /*
                    错误1- Uncaught TypeError: geotiff__WEBPACK_IMPORTED_MODULE_19__.default.parse is not a function
                    import geotiff.js 错误导致的

                    错误2-
                    Uncaught (in promise) TypeError: Invalid byte order value.

                    createError.js?2d83:16 Uncaught (in promise) Error: Request failed with status code 500

                    出现以上错误是由于 读取的文件路径有错误导致的

                */
                geotiff.fromArrayBuffer(tiffData.response).then(async (tiff) => {
                    const tiffImage = await tiff.getImage()
                    const rasters = await tiffImage.readRasters()
                    const tiepoint = tiffImage.getTiePoints()[0]
                    const pixelScale = tiffImage.getFileDirectory().ModelPixelScale
                    const tiffWidth = tiffImage.getWidth()
                    const tiffHeight = tiffImage.getHeight()
                    const geoTransform = [
                        tiepoint.x,
                        pixelScale[0],
                        0,
                        tiepoint.y,
                        0,
                        -1 * pixelScale[1]
                    ]
                    const pressData = new Array(tiffHeight)
                    const tempData = new Array(tiffHeight)
                    const uData = new Array(tiffHeight)
                    const vData = new Array(tiffHeight)
                    const spdData = new Array(tiffHeight)
                    for (let j = 0; j < tiffHeight; j++) {
                        pressData[j] = new Array(tiffWidth)
                        tempData[j] = new Array(tiffWidth)
                        uData[j] = new Array(tiffWidth)
                        vData[j] = new Array(tiffWidth)
                        spdData[j] = new Array(tiffWidth)
                        for (let i = 0; i < tiffWidth; i++) {
                            pressData[j][i] = rasters[0][i + j * tiffWidth]
                            tempData[j][i] = rasters[1][i + j * tiffWidth]
                            uData[j][i] = rasters[2][i + j * tiffWidth]
                            vData[j][i] = rasters[3][i + j * tiffWidth]
                            spdData[j][i] =
                                1.943844492 *
                                Math.sqrt(uData[j][i] * uData[j][i] + vData[j][i] * vData[j][i])
                        }
                    }
                    // ---
                    const cs_def = {
                        positions: [
                            0.0,
                            0.030303030303,
                            0.0606060606061,
                            0.0909090909091,
                            0.121212121212,
                            0.151515151515,
                            0.181818181818,
                            0.212121212121,
                            0.242424242424,
                            0.272727272727,
                            0.30303030303,
                            0.333333333333,
                            0.363636363636,
                            0.393939393939,
                            0.424242424242,
                            0.454545454545,
                            0.484848484848,
                            0.515151515152,
                            0.545454545455,
                            0.575757575758,
                            0.606060606061,
                            0.636363636364,
                            0.666666666667,
                            0.69696969697,
                            0.727272727273,
                            0.757575757576,
                            0.787878787879,
                            0.818181818182,
                            0.848484848485,
                            0.878787878788,
                            0.909090909091,
                            0.939393939394,
                            0.969696969697,
                            1.0
                        ],
                        colors: [
                            '#ffffff',
                            '#e5e5e6',
                            '#d1d1d1',
                            '#bababa',
                            '#979797',
                            '#646464',
                            '#1464d3',
                            '#1e6eeb',
                            '#2883f1',
                            '#3c97f5',
                            '#50a5f5',
                            '#78b9fb',
                            '#97d3fb',
                            '#b5f1fb',
                            '#e1ffff',
                            '#0ea10e',
                            '#1eb31e',
                            '#36d33c',
                            '#50ef50',
                            '#78f572',
                            '#97f58d',
                            '#b5fbab',
                            '#c9ffbf',
                            '#ffe978',
                            '#ffc13c',
                            '#ffa100',
                            '#ff6000',
                            '#ff3200',
                            '#e11400',
                            '#c10000',
                            '#a50000',
                            '#643c32',
                            '#785046',
                            '#8d645a'
                        ]
                    }
                    const scaleWidth = 256
                    const canvasColorScale = document.createElement('canvas')
                    canvasColorScale.width = scaleWidth
                    canvasColorScale.height = 1
                    canvasColorScale.style.display = 'none'

                    document.body.appendChild(canvasColorScale)

                    const contextColorScale = canvasColorScale.getContext('2d')
                    const gradient = contextColorScale.createLinearGradient(0, 0, scaleWidth, 1)

                    for (let i = 0; i < cs_def.colors.length; ++i) {
                        gradient.addColorStop(cs_def.positions[i], cs_def.colors[i])
                    }
                    contextColorScale.fillStyle = gradient
                    contextColorScale.fillRect(0, 0, scaleWidth, 1)

                    // ---
                    const csImageData = contextColorScale.getImageData(0, 0, scaleWidth - 1, 1).data
                    const width = 680,
                        height = 500

                    const canvasRaster = document.createElement('canvas')
                    canvasRaster.width = width
                    canvasRaster.height = height
                    canvasRaster.style.display = 'none'

                    document.body.appendChild(canvasRaster)

                    const contextRaster = canvasRaster.getContext('2d')

                    const id = contextRaster.createImageData(width, height)
                    const data = id.data
                    let pos = 0
                    const invGeoTransform = [
                        -geoTransform[0] / geoTransform[1],
                        1 / geoTransform[1],
                        0,
                        -geoTransform[3] / geoTransform[5],
                        0,
                        1 / geoTransform[5]
                    ]
                    for (let j = 0; j < height; j++) {
                        for (let i = 0; i < width; i++) {
                            const pointCoordsX =
                                geoTransform[0] + (i * tiffWidth * geoTransform[1]) / width
                            const pointCoordsY =
                                geoTransform[3] + (j * tiffHeight * geoTransform[5]) / height

                            const px = invGeoTransform[0] + pointCoordsX * invGeoTransform[1]
                            const py = invGeoTransform[3] + pointCoordsY * invGeoTransform[5]

                            let value: number
                            if (
                                Math.floor(px) >= 0 &&
                                Math.ceil(px) < tiffImage.getWidth() &&
                                Math.floor(py) >= 0 &&
                                Math.ceil(py) < tiffImage.getHeight()
                            ) {
                                const dist1 = (Math.ceil(px) - px) * (Math.ceil(py) - py)
                                const dist2 = (px - Math.floor(px)) * (Math.ceil(py) - py)
                                const dist3 = (Math.ceil(px) - px) * (py - Math.floor(py))
                                const dist4 = (px - Math.floor(px)) * (py - Math.floor(py))
                                if (dist1 != 0 || dist2 != 0 || dist3 != 0 || dist4 != 0) {
                                    value =
                                        spdData[Math.floor(py)][Math.floor(px)] * dist1 +
                                        spdData[Math.floor(py)][Math.ceil(px)] * dist2 +
                                        spdData[Math.ceil(py)][Math.floor(px)] * dist3 +
                                        spdData[Math.ceil(py)][Math.ceil(px)] * dist4
                                } else {
                                    value = spdData[Math.floor(py)][Math.floor(px)]
                                }
                            } else {
                                value = -999
                            }
                            const c = Math.round((scaleWidth - 1) * ((value - 8) / 88))
                            let alpha = 200
                            if (c < 0 || c > scaleWidth - 1) {
                                alpha = 0
                            }
                            data[pos] = csImageData[c * 4]
                            data[pos + 1] = csImageData[c * 4 + 1]
                            data[pos + 2] = csImageData[c * 4 + 2]
                            data[pos + 3] = alpha
                            pos = pos + 4
                        }
                    }
                    contextRaster.putImageData(id, 0, 0)
                    const imageBounds = [
                        [geoTransform[3], geoTransform[0]],
                        [
                            geoTransform[3] + tiffHeight * geoTransform[5],
                            geoTransform[0] + tiffWidth * geoTransform[1]
                        ]
                    ]

                    // ---

                    const imageLayer = L.imageOverlay(canvasRaster.toDataURL(), imageBounds, {
                        opacity: 0.5
                    })
                    imageLayer.addTo(map)
                })
            })
    }
}

/**
 * 20-09-08 尝试使用 Leaflet.CanvasLayer.Field
 * https://github.com/IHCantabria/Leaflet.CanvasLayer.Field
 * 目前存在的问题是库中由于依赖的 geotiff.js 版本为 0.4 这个版本，会导致 GeoTIFF is not defined 的错误
 *  20-09-08 放弃此种方式，因为不支持 es6 的 import的方式导入，且导入后会找不到 GeoTIFF
 * @class RasterScalarField
 * @implements {IRaster}
 */
class RasterScalarField implements IRaster {
    public add2map(map: any): void {
        d3.request('/data/test.tiff')
            .responseType('arraybuffer')
            .get(function(error, tiffData) {
                // Geopotential height (BAND 0)
                /*
                    Property 'ScalarField' does not exist on type 'typeof import("d:/01proj/SearchRescueSys/webclient/node_modules/@types/leaflet/index")'.
                */
                // TODO:[*] 20-09-02 此处的错误为 Uncaught ReferenceError: GeoTIFF is not defined
                console.log(L.ScalarField)
                // console.log(leafletGeotiff)
                // const geo_tiff = geotiff
                // console.log(geotiff)
                // console.log(geotiff.ScalarField)
                // VM176340:1 Uncaught ReferenceError: GeoTIFF is not defined
                const scalar = L.ScalarField
                const geo = scalar.fromGeoTIFF(tiffData.response)

                // 可用的配色 greys|rdbu|greens|
                const layerGeo = L.canvasLayer
                    .scalarField(geo, {
                        color: chroma.scale('greys').domain(geo.range),
                        opacity: 0.65
                    })
                    .addTo(map)

                // Temperature (BAND 1)
                const t = new leafletGeotiff.ScalarField.fromGeoTIFF(tiffData.response)
                const layerT = L.canvasLayer.scalarField(t, {
                    color: chroma.scale('OrRd').domain(t.range),
                    opacity: 0.65
                })
                map.fitBounds(layerGeo.getBounds())
            })
    }
}
class RasterPixelbakup implements IRaster {
    public add2map(map: any): void {
        d3.request('/data/test.tif')
            .responseType('arraybuffer')
            .get(function(error, tiffData) {
                /*
                    错误1- Uncaught TypeError: geotiff__WEBPACK_IMPORTED_MODULE_19__.default.parse is not a function
                    import geotiff.js 错误导致的

                    错误2-
                    Uncaught (in promise) TypeError: Invalid byte order value.

                    createError.js?2d83:16 Uncaught (in promise) Error: Request failed with status code 500

                    出现以上错误是由于 读取的文件路径有错误导致的

                */
                geotiff.fromArrayBuffer(tiffData.response).then(async (tiff) => {
                    const tiffImage = await tiff.getImage()
                    const rasters = await tiffImage.readRasters()
                    const tiepoint = tiffImage.getTiePoints()[0]
                    const pixelScale = tiffImage.getFileDirectory().ModelPixelScale
                    const tiffWidth = tiffImage.getWidth()
                    const tiffHeight = tiffImage.getHeight()
                    const geoTransform = [
                        tiepoint.x,
                        pixelScale[0],
                        0,
                        tiepoint.y,
                        0,
                        -1 * pixelScale[1]
                    ]
                    const pressData = new Array(tiffHeight)
                    const tempData = new Array(tiffHeight)
                    const uData = new Array(tiffHeight)
                    const vData = new Array(tiffHeight)
                    const spdData = new Array(tiffHeight)
                    for (let j = 0; j < tiffHeight; j++) {
                        pressData[j] = new Array(tiffWidth)
                        tempData[j] = new Array(tiffWidth)
                        uData[j] = new Array(tiffWidth)
                        vData[j] = new Array(tiffWidth)
                        spdData[j] = new Array(tiffWidth)
                        for (let i = 0; i < tiffWidth; i++) {
                            // TODO:[*] 20-09-07 我个人的理解是 raster 是根据读取的tiff中的变量存在不同的维度，即tiff中可以有多个变量?，而我的tiff中实际测试用的只有一个 x_wind_10m 变量
                            pressData[j][i] = rasters[0][i + j * tiffWidth]
                            // Uncaught (in promise) TypeError: Cannot read property '0' of undefined
                            // tempData[j][i] = rasters[1][i + j * tiffWidth]
                            // uData[j][i] = rasters[2][i + j * tiffWidth]
                            // vData[j][i] = rasters[3][i + j * tiffWidth]
                            // spdData[j][i] =
                            //     1.943844492 *
                            //     Math.sqrt(uData[j][i] * uData[j][i] + vData[j][i] * vData[j][i])
                        }
                    }
                    // ---
                    // 与上面通用的代码
                    const cs_def = {
                        positions: [
                            0.0,
                            0.030303030303,
                            0.0606060606061,
                            0.0909090909091,
                            0.121212121212,
                            0.151515151515,
                            0.181818181818,
                            0.212121212121,
                            0.242424242424,
                            0.272727272727,
                            0.30303030303,
                            0.333333333333,
                            0.363636363636,
                            0.393939393939,
                            0.424242424242,
                            0.454545454545,
                            0.484848484848,
                            0.515151515152,
                            0.545454545455,
                            0.575757575758,
                            0.606060606061,
                            0.636363636364,
                            0.666666666667,
                            0.69696969697,
                            0.727272727273,
                            0.757575757576,
                            0.787878787879,
                            0.818181818182,
                            0.848484848485,
                            0.878787878788,
                            0.909090909091,
                            0.939393939394,
                            0.969696969697,
                            1.0
                        ],
                        colors: [
                            '#ffffff',
                            '#e5e5e6',
                            '#d1d1d1',
                            '#bababa',
                            '#979797',
                            '#646464',
                            '#1464d3',
                            '#1e6eeb',
                            '#2883f1',
                            '#3c97f5',
                            '#50a5f5',
                            '#78b9fb',
                            '#97d3fb',
                            '#b5f1fb',
                            '#e1ffff',
                            '#0ea10e',
                            '#1eb31e',
                            '#36d33c',
                            '#50ef50',
                            '#78f572',
                            '#97f58d',
                            '#b5fbab',
                            '#c9ffbf',
                            '#ffe978',
                            '#ffc13c',
                            '#ffa100',
                            '#ff6000',
                            '#ff3200',
                            '#e11400',
                            '#c10000',
                            '#a50000',
                            '#643c32',
                            '#785046',
                            '#8d645a'
                        ]
                    }
                    const scaleWidth = 256
                    const canvasColorScale = document.createElement('canvas')
                    canvasColorScale.width = scaleWidth
                    canvasColorScale.height = 1
                    canvasColorScale.style.display = 'none'

                    document.body.appendChild(canvasColorScale)

                    const contextColorScale = canvasColorScale.getContext('2d')
                    const gradient = contextColorScale.createLinearGradient(0, 0, scaleWidth, 1)

                    for (var i = 0; i < cs_def.colors.length; ++i) {
                        gradient.addColorStop(cs_def.positions[i], cs_def.colors[i])
                    }
                    contextColorScale.fillStyle = gradient
                    contextColorScale.fillRect(0, 0, scaleWidth, 1)

                    const csImageData = contextColorScale.getImageData(0, 0, scaleWidth - 1, 1).data

                    // 将色标创建为隐藏的画布（请阅读详细的说明）
                    // 我试图使用与等频带相同的标度。应该找到一种定义比例的更好方法，也许可以创建一个函数来实现。
                    //Calculating the image
                    const width = 680,
                        height = 500

                    const canvasRaster = document.createElement('canvas')
                    canvasRaster.width = width
                    canvasRaster.height = height
                    canvasRaster.style.display = 'none'

                    document.body.appendChild(canvasRaster)

                    const contextRaster = canvasRaster.getContext('2d')

                    const id = contextRaster.createImageData(width, height)
                    const data = id.data
                    let pos = 0
                    const invGeoTransform = [
                        -geoTransform[0] / geoTransform[1],
                        1 / geoTransform[1],
                        0,
                        -geoTransform[3] / geoTransform[5],
                        0,
                        1 / geoTransform[5]
                    ]
                    for (let j = 0; j < height; j++) {
                        for (var i = 0; i < width; i++) {
                            const pointCoordsX =
                                geoTransform[0] + (i * tiffWidth * geoTransform[1]) / width
                            const pointCoordsY =
                                geoTransform[3] + (j * tiffHeight * geoTransform[5]) / height

                            const px = invGeoTransform[0] + pointCoordsX * invGeoTransform[1]
                            const py = invGeoTransform[3] + pointCoordsY * invGeoTransform[5]

                            let value: number

                            // TODO: 插值部分，可以暂时注释掉
                            if (
                                Math.floor(px) >= 0 &&
                                Math.ceil(px) < tiffImage.getWidth() &&
                                Math.floor(py) >= 0 &&
                                Math.ceil(py) < tiffImage.getHeight()
                            ) {
                                const dist1 = (Math.ceil(px) - px) * (Math.ceil(py) - py)
                                const dist2 = (px - Math.floor(px)) * (Math.ceil(py) - py)
                                const dist3 = (Math.ceil(px) - px) * (py - Math.floor(py))
                                const dist4 = (px - Math.floor(px)) * (py - Math.floor(py))
                                if (dist1 != 0 || dist2 != 0 || dist3 != 0 || dist4 != 0) {
                                    // TODO:[-] 20-09-07 注意此处替换为 pressData (原本为:spdData)
                                    value =
                                        pressData[Math.floor(py)][Math.floor(px)] * dist1 +
                                        pressData[Math.floor(py)][Math.ceil(px)] * dist2 +
                                        pressData[Math.ceil(py)][Math.floor(px)] * dist3 +
                                        pressData[Math.ceil(py)][Math.ceil(px)] * dist4
                                } else {
                                    value = pressData[Math.floor(py)][Math.floor(px)]
                                }
                            } else {
                                value = -999
                            }
                            // 注意此处的 c
                            const c = Math.round((scaleWidth - 1) * ((value - 14) / 24))
                            let alpha = 200
                            if (c < 0 || c > scaleWidth - 1) {
                                alpha = 0
                            }
                            data[pos] = csImageData[c * 4]
                            data[pos + 1] = csImageData[c * 4 + 1]
                            data[pos + 2] = csImageData[c * 4 + 2]
                            data[pos + 3] = alpha
                            pos = pos + 4
                        }
                    }
                    contextRaster.putImageData(id, 0, 0)
                    const imageBounds = [
                        [geoTransform[3], geoTransform[0]],
                        [
                            geoTransform[3] + tiffHeight * geoTransform[5],
                            geoTransform[0] + tiffWidth * geoTransform[1]
                        ]
                    ]

                    const imageLayer = L.imageOverlay(canvasRaster.toDataURL(), imageBounds, {
                        opacity: 0.5
                    })
                    imageLayer.addTo(map)
                })
            })
    }
}
/**
 * TODO:[-] 20-09-12 出现了图片高度会有偏移的bug，且暂时无法解决，暂时放弃
 * @class RasterScalar
 * @implements {IRaster}
 */
class RasterScalar implements IRaster {
    public add2map(map: any): void {
        // TODO: [-] 20-09-11 : 替换为流场的数据 | 之前备份的风场:/data/test_all_fet.tiff
        // 此处的问题是投影貌似有一些偏移
        d3.request('/data/ecsnew_current_20200618.tiff')
            .responseType('arraybuffer')
            .get(function(error, tiffData) {
                geotiff.fromArrayBuffer(tiffData.response).then(async (tiff) => {
                    // 下面的备注是家在测试 tiff的 vardah.tiff
                    // geotiff.js 是最常用的格式化 geotiff 的工具
                    // const tiff = await tiffRes.getImage()
                    const image = await tiff.getImage()
                    // [Float32Array(25756), Float32Array(25756), Float32Array(25756), Float32Array(25756)]
                    const rasters = await image.readRasters()
                    // 相当于是 geotiff 本身的 宽高
                    // 188
                    const tiffWidth = image.getWidth()
                    //137
                    const tiffHeight = image.getHeight()

                    // i: 0
                    // j: 0
                    // k: 0
                    // x: 69.90238016932595
                    // y: 20.03206514657981
                    // z: 0
                    const tiepoint = image.getTiePoints()[0]
                    const pixelScale = image.getFileDirectory().ModelPixelScale
                    // [对角线 左侧顶部 ,像素大小[0] ,对角线 右下 ,像素大小 [1]]
                    // [69.90238016932595, 0.11718756105503093, 0, 20.03206514657981, 0, -0.11714657980456025]
                    const geoTransform = [
                        tiepoint.x,
                        pixelScale[0],
                        0,
                        tiepoint.y,
                        0,
                        -1 * pixelScale[1]
                    ]

                    const pressData = new Array(tiffHeight)
                    const tempData = new Array(tiffHeight)
                    for (var j = 0; j < tiffHeight; j++) {
                        pressData[j] = new Array(tiffWidth) // tempData[j] = new Array(tiffWidth);
                        for (var i = 0; i < tiffWidth; i++) {
                            pressData[j][i] = rasters[0][i + j * tiffWidth]
                        }
                    }

                    //Creating the color scale https://github.com/santilland/plotty/blob/master/src/plotty.js
                    // 把他理解为色标 0 -> 1 即可
                    const cs_def = {
                        positions: [0.0, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07],
                        colors: [
                            '#1464d3',
                            '#2883f1',
                            '#78b9fb',
                            '#b5f1fb',
                            '#1eb31e',
                            '#ffa100',
                            '#a50000'
                        ]
                    }
                    const scaleWidth = 256
                    const canvasColorScale = document.createElement('canvas')
                    canvasColorScale.width = scaleWidth
                    canvasColorScale.height = 1
                    canvasColorScale.style.display = 'none'
                    document.body.appendChild(canvasColorScale)
                    // 获得渲染上下文和它的绘画功能
                    const contextColorScale = canvasColorScale.getContext('2d')

                    // 定义从黑到白的渐变（从左向右），作为矩形的填充样式：
                    // createLinearGradient() 方法创建线性的渐变对象。
                    // 渐变可用于填充矩形、圆形、线条、文本等等。
                    // 提示：请使用该对象作为 strokeStyle 或 fillStyle 属性的值。
                    // 提示：请使用 addColorStop() 方法规定不同的颜色，以及在 gradient 对象中的何处定位颜色。
                    // 参数值
                    // 参数	描述
                    // x0	渐变开始点的 x 坐标
                    // y0	渐变开始点的 y 坐标
                    // x1	渐变结束点的 x 坐标
                    // y1	渐变结束点的 y 坐标
                    // context.createLinearGradient(x0,y0,x1,y1);
                    const gradient = contextColorScale.createLinearGradient(
                        0,
                        0,
                        scaleWidth, //256
                        1
                    )

                    for (var i = 0; i < cs_def.colors.length; ++i) {
                        gradient.addColorStop(cs_def.positions[i], cs_def.colors[i])
                    }

                    contextColorScale.fillStyle = gradient
                    // 绘制“已填色”的矩形。默认的填充颜色是黑色
                    // context.fillRect(x,y,width,height);
                    // x	矩形左上角的 x 坐标
                    // y	矩形左上角的 y 坐标
                    // width	矩形的宽度，以像素计
                    // height	矩形的高度，以像素计
                    contextColorScale.fillRect(0, 0, scaleWidth, 1)

                    // 返回一个ImageData对象，用来描述canvas区域隐含的像素数据，这个区域通过矩形表示，起始点为(sx, sy)、宽为sw、高为sh。
                    // ImageData ctx.getImageData(sx, sy, sw, sh);
                    // sx 将要被提取的图像数据矩形区域的左上角 x 坐标。
                    // sy 将要被提取的图像数据矩形区域的左上角 y 坐标。
                    // sw 将要被提取的图像数据矩形区域的宽度。
                    // sh 将要被提取的图像数据矩形区域的高度。
                    const csImageData = contextColorScale.getImageData(0, 0, scaleWidth - 1, 1).data

                    // ---

                    //Calculating the image
                    // TODO:[*] 这个尺寸目前不知道是怎么确定的
                    // const width = 680,
                    //     height = 500
                    // TODO:[-] 20-09-11 尝试调整一下这个长宽，改成流场的长宽
                    const width = 564,
                        height = 565

                    // TODO:[-] 20-09-09 注意此处与 raster-pixels 中的对比(关于渲染canvas的)
                    const canvasRaster = document.createElement('canvas')
                    canvasRaster.width = width
                    canvasRaster.height = height
                    canvasRaster.style.display = 'none'

                    document.body.appendChild(canvasRaster)

                    const contextRaster = canvasRaster.getContext('2d')

                    const id = contextRaster.createImageData(width, height)
                    const data = id.data
                    let pos = 0

                    // geoTransform: [对角线 左侧顶部 ,像素大小[0] ,对角线 右下 ,像素大小 [1]]
                    // invGeoTransform: (6) [-596.5, 8.533328887443975, 0, 171.00000000000006, 0, -8.536314091869649]
                    // TODO:[*] invGeoTransform 何用?
                    const invGeoTransform = [
                        -geoTransform[0] / geoTransform[1],
                        1 / geoTransform[1],
                        0,
                        -geoTransform[3] / geoTransform[5],
                        0,
                        1 / geoTransform[5]
                    ]
                    for (var j = 0; j < height; j++) {
                        for (var i = 0; i < width; i++) {
                            const pointCoordsX =
                                geoTransform[0] + (i * tiffWidth * geoTransform[1]) / width
                            const pointCoordsY =
                                geoTransform[3] + (j * tiffHeight * geoTransform[5]) / height

                            // ---
                            // 以下为内插像素
                            const px = invGeoTransform[0] + pointCoordsX * invGeoTransform[1]
                            const py = invGeoTransform[3] + pointCoordsY * invGeoTransform[5]

                            var value
                            if (
                                Math.floor(px) >= 0 &&
                                Math.ceil(px) < image.getWidth() &&
                                Math.floor(py) >= 0 &&
                                Math.ceil(py) < image.getHeight()
                            ) {
                                // Math.ceil 对数字进行向上取整
                                const dist1 = (Math.ceil(px) - px) * (Math.ceil(py) - py)
                                const dist2 = (px - Math.floor(px)) * (Math.ceil(py) - py)
                                // Math.floor()执行向下舍入
                                const dist3 = (Math.ceil(px) - px) * (py - Math.floor(py))
                                const dist4 = (px - Math.floor(px)) * (py - Math.floor(py))
                                if (dist1 != 0 || dist2 != 0 || dist3 != 0 || dist4 != 0) {
                                    value =
                                        pressData[Math.floor(py)][Math.floor(px)] * dist1 +
                                        pressData[Math.floor(py)][Math.ceil(px)] * dist2 +
                                        pressData[Math.ceil(py)][Math.floor(px)] * dist3 +
                                        pressData[Math.ceil(py)][Math.ceil(px)] * dist4
                                } else {
                                    value = pressData[Math.floor(py)][Math.floor(px)]
                                }
                            } else {
                                value = -999
                            }
                            // ---
                            // TODO:[*] 8 与 88 是如何取值的
                            // Math.round()执行标准舍入
                            // var c = Math.round((scaleWidth-1) * ((value - domain[0])/(domain[1]-domain[0])));
                            // 计算从0到255的位置。domain [0]是最小值，domain [1]是最大值
                            // 感觉此处在调整rgb的值
                            // 建议将 domain[0] 改为0.1 如果是0的话，则无法区分无值的情况
                            const c = Math.round((scaleWidth - 1) * ((value - 0.1) / 170))
                            // var c = Math.round((scaleWidth - 0) * ((value - 8) / 96));
                            // 背景深度 灰色 还是 黑色
                            // 如果该值低于或超出标尺的极限，则必须使用alpha部分来避免出现奇怪的颜色。它将透明度设置为100％
                            // 此处为 rgb 的除了三原色之外的第四个值，实际对应的是透明度
                            let alpha = 255
                            if (c < 0 || c > scaleWidth - 1) {
                                alpha = 0
                            }
                            data[pos] = csImageData[c * 4]
                            data[pos + 1] = csImageData[c * 4 + 1]
                            data[pos + 2] = csImageData[c * 4 + 2]
                            data[pos + 3] = alpha
                            pos = pos + 4
                        }
                    }

                    // TODO:[-] 20-09-09 此处做针对 leaflet 的处理
                    contextRaster.putImageData(id, 0, 0)
                    const imageBounds = [
                        [geoTransform[3], geoTransform[0]],
                        [
                            geoTransform[3] + tiffHeight * geoTransform[5],
                            geoTransform[0] + tiffWidth * geoTransform[1]
                        ]
                    ]

                    const imageLayer = L.imageOverlay(canvasRaster.toDataURL(), imageBounds, {
                        opacity: 0.8
                    })
                    imageLayer.addTo(map)
                })
            })
    }
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
        try {
            const tifResp = await loadCurrentTif(
                this.coverageId,
                this.forecastDt,
                this.forecastArea,
                DictEnum.COVERAGE_TYPE_CURRENT
            )
            if (tifResp.status == 200) {
                // TODO:[-] 20-11-04 暂时注释掉，调取远程的文件会出现错误
                const urlGeoTifUrl = tifResp.data

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

                const georasterResponse = await parseGeoraster(arrayBuffer)
                const min = georasterResponse.mins[0]
                const max = georasterResponse.maxs[0]
                const range = georasterResponse.ranges[0]
                const scale = chroma.scale('Viridis')

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
                // 去掉定位至中心位置
                // map.fitBounds(layer.getBounds())

                // parseGeoraster(arrayBuffer).then((georaster) => {
                //     const min = georaster.mins[0]
                //     const max = georaster.maxs[0]
                //     const range = georaster.ranges[0]
                //     const scale = chroma.scale('Viridis')

                //     const layer = new GeoRasterLayer({
                //         georaster: georaster,
                //         opacity: 0.6,
                //         pixelValuesToColorFn: function(pixelValues) {
                //             const pixelValue = pixelValues[0] // there's just one band in this raster

                //             // if there's zero wind, don't return a color
                //             if (pixelValue === 0) return null

                //             // scale to 0 - 1 used by chroma
                //             const scaledPixelValue = (pixelValue - min) / range

                //             const color = scale(scaledPixelValue).hex()

                //             return color
                //         },
                //         resolution: 256
                //     })
                //     addedLayer = layer.addTo(map)
                //     this.rasterLayer = addedLayer
                //     console.log(addedLayer)

                //     map.fitBounds(layer.getBounds())
                // })

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
    RasterIsoline,
    RasterPixel,
    RasterScalarField,
    RasterScalar,
    RasterGeoLayer,
    WindRasterGeoLayer,
    WaveRasterGeoLayer
}
