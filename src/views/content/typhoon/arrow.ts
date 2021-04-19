import { WindBarb } from '@/common/leaflet-windbar'
import * as L from 'leaflet'
// 尝试加入 canvas-markers.js 由于该插件不支持 npm 安装，只能尝试直接引入
// 会提示出现以下的错误
// leaflet.canvas-markers.js?6435:420 Uncaught TypeError: Cannot assign to read only property 'exports' of object '#<Object>'
// import '@/common/leaflet.canvas-markers'
// 尝试使用 https://github.com/lipton-ice-tea/leaflet-canvas-markers
// 注意此插件并不支持自定义的icon marker，暂时放弃
// import 'leaflet-canvas-markers'

// TODO: 注意我目前使用的是 https://github.com/eJuke/Leaflet.Canvas-Markers，注意与上面的区别！！
// import '@/common/canvasMakerLayer'
import { CanvasMarkerLayer } from '@/common/canvasMakerLayer'

// icon 要根据指定角度进行旋转
// 引用插件:https://github.com/bbecquet/Leaflet.RotatedMarker
import 'leaflet-rotatedmarker'

// 引入 api
import { loadWindBar, loadWindBarPaged } from '@/api/geo'

// 20-10-22 引入 查询 mid model
import { WindBarOptMidModel } from '@/middle_model/geo'
export interface IArrow {
    /**
     * 添加至地图中
     *
     * @param {*} map
     * @memberof IArrow
     */
    add2map(map: L.Map, windbarOpt: WindBarOptMidModel): Promise<L.Layer>

    /**
     * + 21-03-31 由于 风场 + 海浪 据需要加载全球(至多)范围的数据，所以改为分页加载，加入了pageIndex
     *
     * @param {L.Map} map
     * @param {WindBarOptMidModel} windbarOpt
     * @param {number} pageIndex
     * @return {*}  {Promise<L.Layer>}
     * @memberof IArrow
     */
    add2mapGlobal(map: L.Map, windbarOpt: WindBarOptMidModel, pageIndex: number): Promise<L.Layer>

    /**
     * 清除 layers
     *
     * @memberof IArrow
     */
    clearLayers(map: L.Map): void
}

/**
 * 风力杆类
 *
 * @class WindArrow
 */
class WindArrow implements IArrow {
    private _canvasMarkerLayer: L.Layer
    // TODO:[-] 21-02-08 新加入的 canvasMarkerLayer 数组
    private _canvasMarkerLayers: L.Layer[] = []

    private _canvasMarkerLayersGroup: L.LayerGroup

    private _canvasMarkerIds: number[] = []
    testLayer = 23

    /**
     * 新加入的 canvasMarkerLayer 存取器
     *
     * @private
     * @memberof WindArrow
     */
    private set canvasMarkerLayer(layer: L.Layer) {
        this._canvasMarkerLayer = layer
    }

    private get canvasMarkerLayer(): L.Layer {
        return this._canvasMarkerLayer
    }
    /**
     * 从map中清除 WindArrow layer
     *
     * @param {L.Map} map
     * @memberof WindArrow
     */
    clearLayers(map: L.Map): void {
        const that = this
        if (that._canvasMarkerLayers.length > 0) {
            this._canvasMarkerLayers.forEach((markerTemp) => {
                map.removeLayer(markerTemp)
            })
        }
        // this.canvasMarkerLayer.clearLayers()

        // throw new Error('Method not implemented.')
    }

    /**
     * 将layer 添加至 map 中
     * 20-10-30
     * 重新做了修改，将返回的this.canvasMarkerLayer -> CanvasLayerMidModel
     * @param {L.Map} map
     * @returns {Promise<L.Layer>} canvasMarkerLayer
     * @memberof WindArrow
     */
    async add2map(map: L.Map, windbarOpt: WindBarOptMidModel): Promise<L.Layer> {
        const myself = this
        const markers: L.Marker<any>[] = []
        // const my_self=this
        await loadWindBar(windbarOpt.coverageId, windbarOpt.forecastDt, windbarOpt.level).then(
            (res) => {
                if (res.status === 200) {
                    // console.log(res.data)
                    /*
                coords:
                    coordinates: Array(2)
                    0: 100
                    1: 0
                    length: 2
                    __proto__: Array(0)
                    type: "Point"
                    __proto__: Object
                        dir_wind: -167.86944580078125
                        spd_wind: 1.2298332452774048
                        time: "2020-06-18T00:00:00Z"
                        x_wind: -1.202372670173645
                        y_wind: -0.25843682885169983
                */
                    const windBarPoints: {
                        lat: number
                        lon: number
                        windDir: number
                        windSpd: number
                    }[] = []
                    const myRender = L.canvas({ padding: 0.5 })
                    res.data.forEach(
                        (temp: {
                            coords: { coordinates: number[] }
                            dir_wind: number
                            spd_wind: number
                        }) => {
                            windBarPoints.push({
                                lat: temp.coords.coordinates[1],
                                lon: temp.coords.coordinates[0],
                                windDir: temp.dir_wind,
                                windSpd: temp.spd_wind
                            })
                        }
                    )
                    // TODO:[-] 20-10-26 不在此处 addTo map ，改在外侧
                    // const canvasMarkerLayer=new CanvasMarkerLayer()
                    const ciLayer: L.Layer = new CanvasMarkerLayer().addTo(map)
                    // const ciLayer: L.Layer = new CanvasMarkerLayer()
                    if (this.canvasMarkerLayer !== undefined) {
                        this.clearLayers(map)
                    }
                    if (this.canvasMarkerLayer === undefined) {
                        // console.log('已清除')
                    }
                    this.canvasMarkerLayer = ciLayer

                    windBarPoints.forEach(function(p) {
                        const absDir = p.windDir < 0 ? 360 + p.windDir : p.windDir
                        if (absDir > 360 || absDir < 0) {
                            console.log(absDir)
                        }
                        const spdImgSrc: string = myself.getSpdImg(p.windSpd)
                        // TODO:[-] 20-10-27 暂时去掉
                        // const htmlDiv = `<img src="${spdImgSrc}"style="-webkit-transform: rotate(${absDir}deg); -moz-transform:rotate(${absDir}deg);">`
                        // 实现方式4:
                        // 测试官方demo的icon是否可行
                        // [x] 提供图片的方式可行
                        // [x] 测试对图片进行旋转
                        const iconDemo = L.icon({
                            iconUrl: spdImgSrc,
                            iconSize: [20, 18],
                            iconAnchor: [10, 9]
                        })

                        const marker = L.marker([p.lat, p.lon], {
                            // 保留可行的，但是会影响性能的方式
                            // icon: iconDiv
                            // 尝试 canvasMarker 的方式
                            icon: iconDemo,
                            // ---
                            rotationAngle: absDir
                        }).bindPopup('I Am ' + p)
                        // ---
                        markers.push(marker)
                    })
                    // 使用canvas 渲染
                    if (windBarPoints.length > 0) {
                        ciLayer.addLayers(markers)
                    }
                    this.canvasMarkerLayer = ciLayer
                }
            }
        )
        // return new CanvasLayerMidModel(markers, this.canvasMarkerLayer)
        return this.canvasMarkerLayer
    }

    /**
     * 批量将 arrow layer 添加至 map
     * 21-02-01
     *
     * @param {L.Map} map
     * @param {WindBarOptMidModel} windbarOpt
     * @memberof WindArrow
     */
    async addBatchLayer2MapGlobal(map: L.Map, windbarOpt: WindBarOptMidModel): void {
        const that = this
        const count = 4
        for (let index = 0; index < count; index++) {
            await that.add2mapGlobal(map, windbarOpt, index)
        }
    }

    /**
     * 添加全球风场 add to map
     * 21-02-01
     *
     * @param {L.Map} map
     * @param {WindBarOptMidModel} windbarOpt
     * @param {number} pageIndex
     * @return {*}  {Promise<L.Layer>}
     * @memberof WindArrow
     */
    async add2mapGlobal(
        map: L.Map,
        windbarOpt: WindBarOptMidModel,
        pageIndex: number
    ): Promise<L.Layer> {
        const myself = this
        const markers: L.Marker<any>[] = []
        // TODO:[-] 21-02-08 每次调用 添加 全球风场时先清除
        // const my_self=this
        await loadWindBarPaged(
            windbarOpt.coverageId,
            windbarOpt.forecastDt,
            windbarOpt.level,
            windbarOpt.step,
            pageIndex
        ).then((res) => {
            if (res.status === 200) {
                // console.log(res.data)
                /*
                coords:
                    coordinates: Array(2)
                    0: 100
                    1: 0
                    length: 2
                    __proto__: Array(0)
                    type: "Point"
                    __proto__: Object
                        dir_wind: -167.86944580078125
                        spd_wind: 1.2298332452774048
                        time: "2020-06-18T00:00:00Z"
                        x_wind: -1.202372670173645
                        y_wind: -0.25843682885169983
                */
                const windBarPoints: {
                    lat: number
                    lon: number
                    windDir: number
                    windSpd: number
                }[] = []
                const myRender = L.canvas({ padding: 0.5 })
                res.data.forEach(
                    (temp: {
                        coords: { coordinates: number[] }
                        dir_wind: number
                        spd_wind: number
                    }) => {
                        windBarPoints.push({
                            lat: temp.coords.coordinates[1],
                            lon: temp.coords.coordinates[0],
                            windDir: temp.dir_wind,
                            windSpd: temp.spd_wind
                        })
                    }
                )
                // TODO:[-] 20-10-26 不在此处 addTo map ，改在外侧
                // const canvasMarkerLayer=new CanvasMarkerLayer()
                const ciLayer: L.Layer = new CanvasMarkerLayer().addTo(map)
                // const ciLayer: L.Layer = new CanvasMarkerLayer()
                if (this.canvasMarkerLayer !== undefined) {
                    // this.clearLayers()
                }
                if (this.canvasMarkerLayer === undefined) {
                    // console.log('已清除')
                }
                this.canvasMarkerLayer = ciLayer

                windBarPoints.forEach(function(p) {
                    const absDirTemp =
                        typeof p.windDir === 'string' ? parseFloat(p.windDir) : p.windDir

                    if (absDirTemp < 0) {
                        // console.log(p.windDir)
                    }
                    // 360-6.6414
                    const absDir = absDirTemp < 0 ? 360 + absDirTemp : absDirTemp
                    if (absDir > 360 || absDir < 0) {
                        // console.log(absDir)
                    }
                    const spdImgSrc: string = myself.getSpdImg(p.windSpd)
                    // TODO:[-] 20-10-27 暂时去掉
                    // const htmlDiv = `<img src="${spdImgSrc}"style="-webkit-transform: rotate(${absDir}deg); -moz-transform:rotate(${absDir}deg);">`
                    // 实现方式4:
                    // 测试官方demo的icon是否可行
                    // [x] 提供图片的方式可行
                    // [x] 测试对图片进行旋转
                    const iconDemo = L.icon({
                        iconUrl: spdImgSrc,
                        iconSize: [20, 18],
                        iconAnchor: [10, 9]
                    })

                    const marker = L.marker([p.lat, p.lon], {
                        // 保留可行的，但是会影响性能的方式
                        // icon: iconDiv
                        // 尝试 canvasMarker 的方式
                        icon: iconDemo,
                        // ---
                        rotationAngle: absDir
                    }).bindPopup('I Am ' + p)
                    // ---
                    markers.push(marker)
                })
                // 使用canvas 渲染
                ciLayer.addLayers(markers)
                this._canvasMarkerLayers.push(ciLayer)
                // this._canvasMarkerIds.push(ciLayer.Id)
            }
        })
        // return new CanvasLayerMidModel(markers, this.canvasMarkerLayer)
        return this.canvasMarkerLayer
    }

    /**
     * 将layer 添加至 map 中
     * 20-09-21 的备份，里面有其余的多种实现方式
     *
     * @param {*} map
     * @memberof WindArrow
     */
    add2map_backup(map: L.Map): void {
        const myself = this
        // const my_self=this
        loadWindBar().then((res) => {
            if (res.status === 200) {
                // console.log(res.data)
                /*
                coords:
                    coordinates: Array(2)
                    0: 100
                    1: 0
                    length: 2
                    __proto__: Array(0)
                    type: "Point"
                    __proto__: Object
                        dir_wind: -167.86944580078125
                        spd_wind: 1.2298332452774048
                        time: "2020-06-18T00:00:00Z"
                        x_wind: -1.202372670173645
                        y_wind: -0.25843682885169983
                */
                const windBarPoints: {
                    lat: number
                    lon: number
                    windDir: number
                    windSpd: number
                }[] = []
                const myRender = L.canvas({ padding: 0.5 })
                res.data.forEach(
                    (temp: {
                        coords: { coordinates: number[] }
                        dir_wind: number
                        spd_wind: number
                    }) => {
                        windBarPoints.push({
                            lat: temp.coords.coordinates[1],
                            lon: temp.coords.coordinates[0],
                            windDir: temp.dir_wind,
                            windSpd: temp.spd_wind
                        })
                    }
                )
                // const ciLayer: L.Layer = L.canvasMarkerLayer({}).addTo(map)
                const ciLayer: L.Layer = new CanvasMarkerLayer()
                // console.log(this)
                // console.log(myself)
                if (this.canvasMarkerLayer !== undefined) {
                    this.clearLayers(map)
                }
                if (this.canvasMarkerLayer === undefined) {
                    // console.log('已清除')
                }
                this.canvasMarkerLayer = ciLayer
                const markers: L.Marker<any>[] = []
                const markerGroup: L.layerGroup = null
                windBarPoints.forEach(function(p) {
                    const absDir = p.windDir < 0 ? 360 + p.windDir : p.windDir
                    const spdImgSrc: string = myself.getSpdImg(p.windSpd)
                    const htmlDiv = `<img src="${spdImgSrc}"style="-webkit-transform: rotate(${absDir}deg); -moz-transform:rotate(${absDir}deg);">`
                    // 使用 canvasIconLayer 创建 marker layer (canvas的实现方式)
                    // [-] 最终可以实现的方式1:但会引起生成多个dom元素，导致性能受影响
                    // console.log(new WindBarb())
                    // [27.0, 121.7, 5, 190],
                    // vue.runtime.esm.js?2b0e:1888 TypeError: _common_leaflet_windbar__WEBPACK_IMPORTED_MODULE_2__.WindBarb.icon is not a function
                    // const icon = new WindBarb().icon({
                    //     deg: p.windDir,
                    //     speed: p.windSpd,
                    //     iconSize: [14, 14],
                    //     iconAnchor: [10, 9]
                    //     // width: 14,
                    //     // height: 14
                    // })
                    // const marker = L.marker([p.lat, p.lon], { icon: icon, renderer: myRender })
                    // markers.push(marker)
                    // ---
                    // --
                    // .addTo(map)
                    // .bindPopup(
                    //     '<p>Wind Speed: ' +
                    //         p.windSpd +
                    //         '</p>' +
                    //         '<p>Wind Direction: ' +
                    //         p.windDir +
                    //         '</p>'
                    // )

                    // 实现方式2: 此种方式不可行
                    // const canvasMarker = L.canvasMarker([p.lat, p.lon], {
                    //     icon: icon,
                    //     renderer: myRender
                    // })
                    //     .addTo(map)
                    //     .bindPopup(
                    //         '<p>Wind Speed: ' +
                    //             p.windSpd +
                    //             '</p>' +
                    //             '<p>Wind Direction: ' +
                    //             p.windDir +
                    //             '</p>'
                    //     )

                    // 实现方式3:
                    // const marker = L.canvasMarkerLayer([p.lat, p.lon], {
                    //     icon: icon
                    // })
                    //     .addTo(map)
                    //     .bindPopup(
                    //         '<p>Wind Speed: ' +
                    //             p.windSpd +
                    //             '</p>' +
                    //             '<p>Wind Direction: ' +
                    //             p.windDir +
                    //             '</p>'
                    //     )
                    // ---
                    // 实现方式4:
                    // 测试官方demo的icon是否可行
                    // [x] 提供图片的方式可行
                    // [x] 测试对图片进行旋转
                    const iconDemo = L.icon({
                        iconUrl: spdImgSrc,
                        iconSize: [20, 18],
                        iconAnchor: [10, 9]
                        // style: '-webkit-transform: rotate(39deg);'
                        // 尝试添加一个class，根据class来控制方向; canvas 无法通过 img 自定义样式的方法实现对 img 图片的旋转
                        // className: 'rotate-39'
                    })
                    // 创建的 divIcon 无法加载url的图片，放弃
                    const iconRotation = L.divIcon({
                        // 为 canvasMarkerLayer.ts 使用的属性
                        iconUrl: '/static/windbaricon/level5.png'
                        // 以下为通用的属性
                        // html:
                        //     '<img src="/static/windbaricon/level5.png"style="-webkit-transform: rotate(39deg); -moz-transform:rotate(39deg);">'
                    })

                    // 新创建一个divIcon，并在其中做旋转
                    // const htmlDiv =
                    //     '<img src="/static/windbaricon/level5.png"style="-webkit-transform: rotate(39deg); -moz-transform:rotate(39deg);">'
                    // 需要手动进行角度转换 p.windDir,
                    /*
                        0->-180 
                        需要转换:
                        if <0 & >-90 
                        360+dir
                        else if <0 <-90
                        360+

                    */
                    // [-] 最终可以实现的方式2:

                    const iconDiv = L.divIcon({
                        className: 'my-icon-arrow-36',
                        html: htmlDiv,
                        // iconUrl: '/static/windbaricon/level5.png',
                        iconSize: [20, 18],
                        iconAnchor: [10, 9]
                    })
                    const marker = L.marker([p.lat, p.lon], {
                        // 保留可行的，但是会影响性能的方式
                        // icon: iconDiv
                        // 尝试 canvasMarker 的方式
                        icon: iconDemo,
                        // ---
                        rotationAngle: absDir
                    }).bindPopup('I Am ' + p)
                    // ---
                    markers.push(marker)
                    // 将当前 marker 添加至 groupLayer 中
                    // marker.addTo(markerGroup)
                })
                // Uncaught (in promise) TypeError: Cannot read property '0' of undefined
                // 统一添加 markers，先添加至 layerGroup 中
                // markerGroup = L.layerGroup(markers)
                // markerGroup.addTo(map)
                // 使用canvas 渲染
                ciLayer.addLayers(markers)
                this.canvasMarkerLayer = ciLayer
                return ciLayer
            }
        })
    }

    /**
     * 根据风速返回对应的风力杆img url
     *
     * @private
     * @param {number} spd
     * @returns {string}
     * @memberof WindArrow
     */
    private getSpdImg(spd: number): string {
        const src = '/static/windbaricon/'
        let imgName = ''
        if (spd <= 2) {
            imgName = 'level1.png'
        } else if (spd > 2 && spd <= 4) {
            imgName = 'level2.png'
        } else if (spd > 4 && spd <= 6) {
            imgName = 'level3.png'
        } else if (spd > 6 && spd <= 8) {
            imgName = 'level4.png'
        } else if (spd > 8 && spd <= 10) {
            imgName = 'level5.png'
        } else if (spd > 10 && spd <= 12) {
            imgName = 'level6.png'
        } else if (spd > 12 && spd <= 14) {
            imgName = 'level7.png'
        } else {
            imgName = 'level7.png'
        }
        // TODO:[*] 20-10-27 修复了由于风速较大而出现的 image Url 不存在导致绘制 canvas 的错误
        // else if (spd > 14 && spd <= 16) {
        //     imgName = 'level8.png'
        // } else if (spd > 16 && spd <= 20) {
        //     imgName = 'level9.png'
        // } else if (spd > 20 && spd <= 24) {
        //     imgName = 'level10.png'
        // } else if (spd > 24 && spd <= 28) {
        //     imgName = 'level11.png'
        // } else if (spd > 28 && spd <= 32) {
        //     imgName = 'level12.png'
        // } else if (spd > 32 && spd <= 36) {
        //     imgName = 'level13.png'
        // } else {
        //     imgName = 'level14.png'
        // }
        return `${src}${imgName}`
    }
}
export { WindArrow }
