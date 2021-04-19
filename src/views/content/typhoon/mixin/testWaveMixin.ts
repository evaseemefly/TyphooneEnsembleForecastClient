/*
    21-03-06 + 新加入的 加载 wfs 服务的相关操作
    @author: evaseemefly
*/
import { Component, Vue } from 'vue-property-decorator'
import * as L from 'leaflet'
import { loadGridGeoJson } from '@/api/geoserver'
// 20-09-07 引入了raster-marching-squares
import * as rasterMarching from 'raster-marching-squares'
import * as d3 from 'd3'
// 使用leaflet-canvaslayer-field还需要依赖的库
import chroma from 'chroma-js'
// 注意使用 该第三方库，依赖于 georaster
import 'georaster'
// 不同的引入 geotiff
// import GeoTIFF from 'geotiff'
// RasterPixel 中需要使用此种引入方式
import * as geotiff from 'geotiff'
@Component
class WaveMixin extends Vue {
    /**
     *TODO:[*] 21-03-05 新加入的加载 geoserver 发布的 wfs 服务 to geojson
                        部分功能参考: https://leafletjs.com/examples/choropleth/
     *
     * @memberof WFSMixin
     */
    gridMaxVal = 0
    gridMinVal = 0

    async loadWave(map: L.Map): void {
        const urlGeoTifUrl =
            'http://localhost:82/images/TEST/WAVE/TIFF/global_ecmwf_det_wve_2020123000_converted_02.tif'

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
        // this.rasterLayer = addedLayer
    }

    /**
     * 新添加的将 海浪.png 添加至 map
     *
     * @param {L.Map} map
     * @memberof WaveMixin
     */
    addWaveLayer2Map(map: L.Map): void {
        const urlGeoPngUrl =
            'http://localhost:82/images/TEST/WAVE/TIFF/global_ecmwf_det_wve_2020123000_converted_Mercator.png'

        const imageUrl = urlGeoPngUrl,
            imageBounds = [
                [-90.0, -180],
                [90.0, 180]
            ]
        L.imageOverlay(imageUrl, imageBounds, { opacity: 0.95 }).addTo(map)
    }
}
export { WaveMixin }
