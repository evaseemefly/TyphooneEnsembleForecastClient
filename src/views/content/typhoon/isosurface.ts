import * as L from 'leaflet'
import * as turf from '@turf/turf'
import 'georaster'
import { DEFAULT_LAYER_ID } from '@/const/common'
import { max } from 'moment'
import { Message } from 'element-ui'
import { ElMessage } from 'element-ui/types/message'
/**
 * 等值面实现类接口
 *
 * @export
 * @interface ISosurface
 */
export interface ISosurface {
    // sosurfaceLayer: L.Layer
    /**
     * 生成等值面并添加至 map 中
     *
     * @return {*}  {L.Layer}
     * @memberof ISosurface
     */
    addSosurfaceToMap(
        map: L.Map,
        errorCallBackFun: (ElMessage) => void,
        isShowTitle: boolean
    ): Promise<void>

    /**
     * 获取等值面的layer id
     *
     * @return {*}  {number}
     * @memberof ISosurface
     */
    getLayerId(): number
}

/**
 * 潮位等值线实现类
 * 可实现根据 指定 tif url 绘制 对应的等值线与grid val显示
 *
 * @class SurgeSosurface
 * @implements {ISosurface}
 */
class SurgeSosurface implements ISosurface {
    /**
     * 实际的色标 range 与 color list
     *
     * @type {{
     *         colorScale: string[]
     *         valScale: number[]
     *     }}
     * @memberof SurgeSosurface
     */
    options: {
        /**
         * 实际的色标 color str
         *
         * @type {string[]}
         */
        colorScale: string[]

        /**
         * 实际的色标 range ，会根据最大的值<=1.6 则会在最后添加一个`max`
         *
         * @type {number[]}
         */
        valScale: number[]
    } = {
        colorScale: [
            '#00429d',
            '#4771b2',
            '#73a2c6',
            '#a5d5d8',
            '#ffffe0',
            '#ffbcaf',
            '#f4777f',
            '#cf3759',
            '#93003a'
        ],
        valScale: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6]
    }

    /**
     * 当前 增水场 (对应 tif url) 的范围及极值
     *
     * @type {{
     *         xmax: number // lon
     *         xmin: number
     *         ymax: number // lat
     *         ymin: number
     *         pixelHeight: number
     *         pixelWidth: number
     *     }}
     * @memberof SurgeSosurface
     */
    geoOptions: {
        xmax: number // lon
        xmin: number
        ymax: number // lat
        ymin: number
        pixelHeight: number
        pixelWidth: number
        valMax: number
        valMin: number
    } = {
        xmax: 123.00000203639075, // lon
        xmin: 104.99999796360925,
        ymax: 26.00000012734953, // lat
        ymin: 14.999999872650472,
        pixelHeight: 0.01666666705257433,
        pixelWidth: 0.01666667043776066,
        valMax: 0,
        valMin: 0
    }
    url: string
    map: L.Map
    _layer: L.Layer

    constructor(
        url: string,
        options: {
            colorScale?: string[]
            valScale?: number[]
        } = {
            colorScale: [
                '#00429d',
                '#4771b2',
                '#73a2c6',
                '#a5d5d8',
                '#ffffe0',
                '#ffbcaf',
                '#f4777f',
                '#cf3759',
                '#93003a'
            ],
            valScale: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6]
        }
    ) {
        this.url = url
        // TODO:[*] 22-06-15 注意此处在输入参数中加入default的可选值，若只有一个赋值，另一个未赋值的话则会出现undefined将默认参数覆盖掉的情况
        this.options = { ...this.options, ...options }
        // this.map = map
    }

    /**
     * 加载等值面 layer 的 id
     *
     * @private
     * @type {number}
     * @memberof SurgeSosurface
     */
    private _id: number = DEFAULT_LAYER_ID

    /**
     * 加载的 gird title val layer 的 id
     *
     * @private
     * @type {number}
     * @memberof SurgeSosurface
     */
    private _pointsTitleLayerId: number = DEFAULT_LAYER_ID

    /**
     * 加载 this.url 的 geotiff 加载为 等值线 layer 与 grid title layer ，并记录id this._id , this._pointsTitleLayerId
     *
     * @param {L.Mapm} map
     * @param {boolean} [isShowTitle=true]
     * @returns {Promise<any>}
     * @memberof SurgeSosurface
     */
    private addSosurfaceToMap(
        map: L.Map,
        errorCallBackFun: (ElMessage) => void,
        isShowTitle = true
    ): Promise<void> {
        const that = this
        return fetch(that.url, {
            method: 'GET',
            mode: 'cors'
        })
            .then((res) => {
                return res.arrayBuffer()
            })
            .then((bufRes) => {
                // 注意若读取不存在的 tiff 会抛出异常
                // Uncaught (in promise) TypeError: Invalid byte order value.
                const res = parseGeoraster(bufRes)
                return res
            })
            .then(
                (parseRes: {
                    xmax: number // lon
                    xmin: number
                    ymax: number // lat
                    ymin: number
                    pixelHeight: number
                    pixelWidth: number
                    values: any[]
                    maxs: number[]
                    mins: number[]
                    height: number
                    width: number
                }) => {
                    /*
                        height: 660
                        maxs: [2.2799999713897705]
                        mins: [0]
                        noDataValue: NaN
                        numberOfRasters: 1
                        pixelHeight: 0.01666666705257433
                        pixelWidth: 0.01666667043776066
                        projection: 4326
                        ranges: [2.2799999713897705]
                        rasterType: "geotiff"
                        sourceType: "ArrayBuffer"
                        toCanvas: ƒ (e)
                        values: [Array(660)]
                        width: 1080
                        xmax: 123.00000203639075
                        xmin: 104.99999796360925
                        ymax: 26.00000012734953
                        ymin: 14.999999872650472
                    */

                    const grid = parseRes
                    that.geoOptions = {
                        xmax: parseRes.xmax, // lon
                        xmin: parseRes.xmin,
                        ymax: parseRes.ymax, // lat
                        ymin: parseRes.ymin,
                        pixelHeight: parseRes.pixelHeight,
                        pixelWidth: parseRes.pixelWidth,
                        valMax:
                            parseRes.maxs.length > 0 ? parseFloat(parseRes.maxs[0].toFixed(2)) : 0,
                        valMin: parseRes.mins.length > 0 ? parseRes.mins[0] : 0
                    }
                    const scale: { fill: string }[] = []
                    this.options.colorScale.forEach((temp) =>
                        scale.push({
                            fill: temp
                        })
                    )
                    const isobandsOptions = {
                        zProperty: 'value',
                        commonProperties: {
                            'fill-opacity': 0.8
                        },
                        breaksProperties: scale
                    }
                    // 将 raster -> points
                    const arr = parseRes.values[0]
                    const pointArr: {}[] = []
                    const latlngsGrid: number[][] = []
                    const height = parseRes.height
                    const width = parseRes.width
                    // y 660
                    for (let y = 0; y < parseRes.height; y++) {
                        // x 1080
                        const xarr: number[][] = []
                        for (let x = 0; x < parseRes.width; x++) {
                            const obj: {
                                type: string
                                properties: { value: number }
                                geometry: {
                                    type: string
                                    coordinates: number[]
                                }
                            } = {
                                type: 'Feature',
                                properties: { value: 0 },
                                geometry: {
                                    type: 'Point',
                                    coordinates: []
                                }
                            }
                            obj.properties = { value: arr[y][x] } //网格中心点数值
                            const lnglat: number[] = this.getGridCenterCoordinates(x, y) //网格中心点坐标
                            obj.geometry.coordinates = lnglat
                            pointArr.push(obj)
                            xarr.push(lnglat)
                        }
                        latlngsGrid.push(xarr)
                    }
                    // points -> featureCollection
                    const gridPoints = turf.featureCollection(pointArr)
                    // Uncaught (in promise) Error: Invalid input to Input must contain Points, FeatureCollection required
                    const valScale: number[] = []
                    const rasterMax: number = parseRes.maxs[0]
                    this.options.valScale.forEach((temp) => {
                        valScale.push(temp)
                    })
                    valScale.push(rasterMax)
                    const isobands = turf.isobands(gridPoints, valScale, isobandsOptions)
                    //5、把turf的FeatureCollection转换成leaflet的feature数组
                    const geoArr = isobands.features
                    //6、geoArr在map上绘制
                    const flexpartlayer = L.geoJson(geoArr, {
                        style: that.getFlexStyle
                    })
                    // TODO:[-] 22-06-04 !注意此处! 需要 使用 layer.addTo(map) 的方式可以获取返回的layer -> layer._leaflet_id
                    // const layer = map.addLayer(flexpartlayer)
                    const layer = flexpartlayer.addTo(map)
                    // console.log(layer)
                    that._id = layer._leaflet_id
                    // that._layer = layer
                    if (isShowTitle) {
                        that._pointsTitleLayerId = that.addPointsTitle2Map(map, arr, width, height)
                    }
                    // return that._id
                }
            )
            .catch((err) => {
                console.log(err)
                errorCallBackFun(err)
            })
    }

    /**
     * + 22-06-14
     * 添加等值面至地图中，并返回色标
     *
     * @param {L.Map} map
     * @param {(ElMessage) => void} errorCallBackFun
     * @param { boolean } isShowGridTitle 是否加载格点title至地图
     * @return {*}  {{ colorScale: string[]; valScale?: number[] }}
     * @memberof SurgeSosurface
     */
    async addSosurface2MapbyScale(
        map: L.Map,
        errorCallBackFun: (ElMessage) => void,
        isShowGridTitle = true
    ): Promise<{ colorScale: string[]; valScale?: number[] }> {
        await this.addSosurfaceToMap(map, errorCallBackFun, isShowGridTitle)

        if (this.options.valScale !== undefined) {
            if (this.geoOptions.valMax < this.options.valScale[this.options.valScale.length - 1]) {
                this.options.valScale.push('max')
            } else {
                this.options.valScale.push(this.geoOptions.valMax)
            }
        }
        return this.options
    }

    /**
     * 废弃暂时不使用!
     *
     * @param {L.Map} map
     * @param {boolean} [isShowTitle=true]
     * @returns {Promise<any>}
     * @memberof SurgeSosurface
     */
    addIsobandIntersectionToMap(map: L.Map, isShowTitle = true): Promise<any> {
        const that = this
        return fetch(that.url, {
            method: 'GET',
            mode: 'cors'
        })
            .then((res) => {
                return res.arrayBuffer()
            })
            .then((bufRes) => {
                return parseGeoraster(bufRes)
            })
            .then(
                (parseRes: {
                    xmax: number // lon
                    xmin: number
                    ymax: number // lat
                    ymin: number
                    pixelHeight: number
                    pixelWidth: number
                    values: any[]
                }) => {
                    const grid = parseRes
                    that.geoOptions = {
                        xmax: parseRes.xmax, // lon
                        xmin: parseRes.xmin,
                        ymax: parseRes.ymax, // lat
                        ymin: parseRes.ymin,
                        pixelHeight: parseRes.pixelHeight,
                        pixelWidth: parseRes.pixelWidth
                    }
                    const isobandsOptions = {
                        zProperty: 'value',
                        commonProperties: {
                            'fill-opacity': 0.8
                        },
                        breaksProperties: [
                            { fill: '#e3e3ff' },
                            { fill: '#c6c6ff' },
                            { fill: '#a9aaff' },
                            { fill: '#8e8eff' },
                            { fill: '#7171ff' },
                            { fill: '#5554ff' },
                            { fill: '#3939ff' }
                            //{ fill: "#1b1cff" },
                        ]
                    }
                    // 将 raster -> points
                    const arr = parseRes.values[0]
                    const pointArr: {}[] = []
                    const latlngsGrid: number[][] = []
                    const height = parseRes.height
                    const width = parseRes.width
                    // y 660
                    for (let y = 0; y < height; y++) {
                        // x 1080
                        const xarr: number[] = []
                        for (let x = 0; x < width; x++) {
                            const obj: {
                                type: string
                                properties: { value: number }
                                geometry: {
                                    type: string
                                    coordinates: number[]
                                }
                            } = {
                                type: 'Feature',
                                properties: { value: 0 },
                                geometry: {
                                    type: 'Point',
                                    coordinates: []
                                }
                            }
                            obj.properties = { value: arr[y][x] } //网格中心点数值
                            const lnglat: number[] = this.getGridCenterCoordinates(x, y) //网格中心点坐标
                            obj.geometry.coordinates = lnglat
                            pointArr.push(obj)
                            xarr.push(lnglat)
                        }
                        latlngsGrid.push(xarr)
                    }
                    // points -> featureCollection
                    const gridPoints = turf.featureCollection(pointArr)
                    // Uncaught (in promise) Error: Invalid input to Input must contain Points, FeatureCollection required
                    const isobands = turf.isobands(
                        gridPoints,
                        [0.5, 1, 1.5, 2, 2.5, 3],
                        isobandsOptions
                    )
                    //5、把turf的FeatureCollection转换成leaflet的feature数组
                    const geoArr = isobands.features
                    //console.log(geoArr);

                    // 尝试设置 交互式 的 isobands

                    //6、geoArr在map上绘制
                    const flexpartlayer = L.geoJson(geoArr, {
                        style: that.getFlexStyle
                    })
                    // TODO:[-] 22-06-04 !注意此处! 需要 使用 layer.addTo(map) 的方式可以获取返回的layer -> layer._leaflet_id
                    // const layer = map.addLayer(flexpartlayer)
                    const layer = flexpartlayer.addTo(map)
                    // console.log(layer)
                    that._id = layer._leaflet_id
                    // that._layer = layer
                    if (isShowTitle) {
                        that._pointsTitleLayerId = that.addPointsTitle2Map(map, arr, width, height)
                    }
                    // return that._id
                }
            )
    }

    /**
     * 将 格点以div icon 的方式添加至 map 中 并返回 layer.id
     *
     * @private
     * @param {L.Map} map
     * @param {number[][]} points
     * @param {number} width
     * @param {number} height
     * @param {{ ignoreVal: number }} [kwargs] 可选配置项, ignoreVal 为可选的显示 title val 的下限阈值
     * @return {*}  {number}
     * @memberof SurgeSosurface
     */
    private addPointsTitle2Map(
        map: L.Map,
        points: number[][],
        width: number,
        height: number,
        kwargs?: { ignoreVal?: number }
    ): number {
        const that = this
        const pointArr: {
            type: string
            properties: { value: string }
            geometry: {
                type: string
                coordinates: any
            }
        }[] = []
        const latlngs: number[][] = []
        // TODO:[-] 22-06-05 尝试对其进行抽稀(使用非均值的方式)

        //   height = height / 10;
        //   width = width / 10;
        const xStep = 30
        const yStep = 30
        const nanStamp = 'NaN'
        /** 忽略添加title的值下限，小于此值则会设置 cls 为 'minor' */
        const ignoreVal =
            kwargs !== undefined && kwargs.ignoreVal !== undefined ? kwargs.ignoreVal : 0.2
        // y 660
        for (let y = 0; y < height; y = y + yStep) {
            // x 1080
            const xarr: number[] = []
            for (let x = 0; x < width; x = x + xStep) {
                const obj: {
                    type: string
                    properties: { value: string }
                    geometry: {
                        type: string
                        coordinates: any
                    }
                } = {
                    type: 'Feature',
                    properties: { value: '0' },
                    geometry: {
                        type: 'Point',
                        coordinates: null
                    }
                }
                const pointVal = points[y][x].toFixed(1)
                if (pointVal !== nanStamp) {
                    obj.properties = { value: pointVal } //网格中心点数值
                    obj.geometry.coordinates = that.getGridCenterCoordinates(x, y) //网格中心点坐标
                    pointArr.push(obj)
                    // 此处可去掉
                    xarr.push(obj.geometry.coordinates)
                }
            }
            // 此处可去掉
            latlngs.push(xarr)
        }
        // points -> featureCollection
        const pointsFeatureCollection = turf.featureCollection(pointArr)
        // console.log(pointsFeatureCollection)
        const interpolate_options = {
            gridType: 'points',
            property: 'value',
            units: 'degrees'
            //   weight: 1
        }
        // Uncaught (in promise) Error: Invalid input to Input must contain Points, FeatureCollection required
        //   var data_grid = turf.interpolate(grid_points, 2, interpolate_options);
        //6、geoArr在map上绘制
        // 注意此种方式绘制的 为 point 因为 geojson中的数据是 point 类型
        // const flexpartlayer = L.geoJson(data_grid).addTo(map)
        // 尝试将 point 转换为 divIcon ，divIcon 只显示数字文字
        const pointsTxtLay = L.geoJSON(pointsFeatureCollection, {
            // 添加geojson数据
            pointToLayer: function(feature, latlng) {
                // TODO:[-] 22-06-06 此处加入一个不同样式，对于增水为0的设置一个半透明/或灰色的字体
                //marker的icon文字
                let defaultFontCls = 'default'
                const surgeVal = feature.properties.value
                if (surgeVal <= ignoreVal) {
                    defaultFontCls = 'minor'
                } else {
                    defaultFontCls = 'major'
                }
                const htmlStr: string =
                    `<div class=' ${defaultFontCls}' style='margin-top:-5px'>` + surgeVal + '</div>'
                const myIcon = L.divIcon({
                    html: htmlStr,
                    className: 'grid_font',
                    iconSize: 30
                })
                // 暂时不去掉小于等于忽略值的title
                // if (surgeVal > ignoreVal) {

                // }
                return L.marker(latlng, { icon: myIcon })
            }
        }).addTo(map)

        return pointsTxtLay._leaflet_id
    }

    /**
     * 获取等值线 layer id 若未赋值则为 DEFAULT_LAYER_ID
     *
     * @return {*}  {number}
     * @memberof SurgeSosurface
     */
    getLayerId(): number {
        return this._id
    }

    getPointsTitleLayerId(): number {
        return this._pointsTitleLayerId
    }

    /**
     * 获取等值线 layer
     *
     * @return {*}  {L.Layer}
     * @memberof SurgeSosurface
     */
    getLayer(): L.Layer {
        return this._layer
    }

    /**
     * 根据格点获取对应的中心位置点坐标
     *
     * @param {number} x
     * @param {number} y
     * @return {*}  {number[]} [lng,lat]
     * @memberof SurgeSosurface
     */
    private getGridCenterCoordinates(x: number, y: number): number[] {
        let lnglat: number[] = []
        lnglat = [
            this.geoOptions.xmin + x * this.geoOptions.pixelWidth,
            this.geoOptions.ymax - y * this.geoOptions.pixelHeight
        ] //geojson的格式就是[lon,lat]
        return lnglat
    }

    getFlexStyle(feature): {} {
        return {
            weight: 1,
            opacity: 0,
            color: '#fff',
            fillOpacity: 0.8,
            fillColor: feature.properties.fill
        }
    }
}

export { SurgeSosurface }
