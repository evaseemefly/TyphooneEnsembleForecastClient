import * as L from 'leaflet'
import * as turf from '@turf/turf'
import 'georaster'
import { DEFAULT_LAYER_ID } from '@/const/common'
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
    addSosurfaceToMap(): L.Layer

    /**
     * 获取等值面的layer id
     *
     * @return {*}  {number}
     * @memberof ISosurface
     */
    getLayerId(): number
}

class SurgeSosurface implements ISosurface {
    options: {
        url: string
    }
    geoOptions: {
        xmax: number // lon
        xmin: number
        ymax: number // lat
        ymin: number
        pixelHeight: number
        pixelWidth: number
    } = {
        xmax: 123.00000203639075, // lon
        xmin: 104.99999796360925,
        ymax: 26.00000012734953, // lat
        ymin: 14.999999872650472,
        pixelHeight: 0.01666666705257433,
        pixelWidth: 0.01666667043776066
    }
    url: string
    map: L.Map
    _layer: L.Layer

    constructor(url: string) {
        this.url = url
        // this.map = map
    }

    private _id: number = DEFAULT_LAYER_ID

    addSosurfaceToMap(map: L.Map): Promise<any> {
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
                    // console.log(parseRes)
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
                    // y 660
                    for (let y = 0; y < parseRes.height; y++) {
                        // x 1080
                        const xarr: number[] = []
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
                    const isobands = turf.isobands(
                        gridPoints,
                        [0.5, 1, 1.5, 2, 2.5, 3],
                        isobandsOptions
                    )
                    //5、把turf的FeatureCollection转换成leaflet的feature数组
                    const geoArr = isobands.features
                    //console.log(geoArr);

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

                    // return that._id
                }
            )
    }

    addIsobandIntersectionToMap(map: L.Map): Promise<any> {
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
                    // y 660
                    for (let y = 0; y < parseRes.height; y++) {
                        // x 1080
                        const xarr: number[] = []
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

                    // return that._id
                }
            )
    }

    /**
     * 将 格点以div icon 的方式添加至 map 中
     *
     * @param {L.Map} map
     * @param {L.FeatureCollection} featureCollection
     * @memberof SurgeSosurface
     */
    _addPointsTitle2Map(map: L.Map, points: number[][], width: number, height: number): void {
        const pointArr = []
        const latlngs = []
        // TODO:[-] 22-06-05 尝试对其进行抽稀(使用非均值的方式)

        const height = parseRes.height // y 660
        const width = parseRes.width // x 1080
        //   height = height / 10;
        //   width = width / 10;
        const x_step = 30
        const y_step = 30
        const nan_stamp = 'NaN'
        // y 660
        for (let y = 0; y < height; y = y + y_step) {
            // x 1080
            const xarr = []
            for (let x = 0; x < width; x = x + x_step) {
                const obj = {
                    type: 'Feature',
                    properties: { value: 0 },
                    geometry: {
                        type: 'Point',
                        coordinates: null
                    }
                }
                const point_val = arr[y][x].toFixed(1)
                if (point_val !== nan_stamp) {
                    obj.properties = { value: point_val } //网格中心点数值
                    obj.geometry.coordinates = getGridCenterCoordinates(x, y) //网格中心点坐标
                    pointArr.push(obj)
                    xarr.push(obj.geometry.coordinates)
                }
            }
            latlngs.push(xarr)
        }
        // points -> featureCollection
        const grid_points = turf.featureCollection(pointArr)
        console.log(grid_points)
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
        const pointsTxtLay = L.geoJSON(grid_points, {
            // 添加geojson数据
            pointToLayer: function(feature, latlng) {
                //marker的icon文字
                const myIcon = L.divIcon({
                    html:
                        "<div class='grid_font' style='margin-top:-5px'>" +
                        feature.properties.value +
                        '</div>',
                    className: 'my-div-icon',
                    iconSize: 30
                })
                return L.marker(latlng, { icon: myIcon })
            }
        }).addTo(map)
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
    getGridCenterCoordinates(x: number, y: number): number[] {
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
