import * as L from 'leaflet'

import chroma from 'chroma-js'
import { loadGridGeoJson, loadPolyGeoJson, loadWaveContourDistinctList } from '@/api/geoserver'
import { loadWaveBarPaged } from '@/api/geo'
import { ScaleColor } from '@/common/scaleColor'
import { WindBarOptMidModel } from '@/middle_model/geo'
import { IArrow } from '@/views/content/oilspilling/arrow'
import { CanvasMarkerLayer } from '@/common/canvasMakerLayer'
class WaveContourLine {
    // 当前时间
    private current: Date
    // 对应的 schema name
    private schemaName: string

    constructor(schemaName: string) {
        this.schemaName = schemaName
    }

    public async loadPolyWFS(map: L.Map, current: Date): Promise<L.Layer | undefined> {
        const that = this
        // eg: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        let waveContoursDistinctArr: number[] = []
        await loadWaveContourDistinctList(current).then((res) => {
            if (res.status === 200) {
                waveContoursDistinctArr = res.data
            }
        })
        return loadPolyGeoJson(that.schemaName, current).then((res) => {
            /*
            res.data.features[0]
            {type: "Feature", id: "shaped_contour.1", geometry: {…}, geometry_name: "the_geom", properties: {…}}
                geometry:
                coordinates: Array(1)
                0: [Array(118)]
                length: 1
                __proto__: Array(0)
                type: "MultiPolygon"
                __proto__: Object
                geometry_name: "the_geom"
                id: "shaped_contour.1"
                properties: {z: 2.5}
                type: "Feature"
                __proto__: Object
            */
            if (res.status === 200) {
                const geosjon = L.geoJSON(res.data, { style: that.getPolyStyle })
                const layer: L.Layer = geosjon.addTo(map)
                return layer
            }
        })
        // .catch((err) => {
        //     errorCallBackFun(err)
        // })
    }

    public getStyle(val: {
        val: number
    }): {
        fillColor: any
        weight: number
        opacity: number
        color: string
        dashArray: string
        fillOpacity: number
    } {
        /*
        {type: "Feature", id: "020Grid_TEST_EWT_DIFF.1", geometry: {…}, geometry_name: "the_geom", properties: {…}, …}
geometry: {type: "MultiPolygon", coordinates: Array(1)}
            geometry_name: "the_geom"
            id: "020Grid_TEST_EWT_DIFF.1"
            properties: {id: 156, left: 103.117235198, top: 11.179733315999997, right: 103.317235198, bottom: 10.979733315999997}
            type: "Feature"
            val: 0.8304777386882245
            __proto__: Object
        */
        const that = this
        return {
            fillColor: that.getColor(val.val),
            weight: 2,
            opacity: 0.9,
            color: '#16a085',
            dashArray: '3',
            fillOpacity: 0.7
        }
    }
    getColor(pixelValue: number): string {
        const max = this.gridMaxVal
        const min = this.gridMinVal
        // const range = this.range
        const scale = this.gridScale
        if (pixelValue === 0 || Number.isNaN(pixelValue)) return '#7f8c8d'

        // scale to 0 - 1 used by chroma
        const scaledPixelValue = (pixelValue - min) / (max - min)

        const color = scale(scaledPixelValue).hex()

        return color
    }

    /**
     * 多边形 样式
     *
     * @param {*} feature
     * @return {*}  {{ color: string; fillColor: string }}
     * @memberof WaveContourLine
     */
    getPolyStyle(feature: any): { color: string; fillColor: string } {
        let style: { color: string } = null
        const scaleColor: ScaleColor = new ScaleColor(0, 13.5)
        scaleColor.setScale()
        const color15 = scaleColor.getColor(1.5)
        const color30 = scaleColor.getColor(3)
        const color45 = scaleColor.getColor(4.5)
        const color60 = scaleColor.getColor(6)
        const color75 = scaleColor.getColor(7.5)
        const color90 = scaleColor.getColor(9)
        const color105 = scaleColor.getColor(10.5)
        const color120 = scaleColor.getColor(12)
        const color135 = scaleColor.getColor(13.5)
        const featureBaseStyle = {
            fillOpacity: 0.7,
            stroke: false,
            weight: 0.1,
            lineJoin: 'miter',
            lineCap: 'miter'
        }
        style = featureBaseStyle
        const z = feature.properties.z
        switch (true) {
            // TODO:[-] 21-03-26 备份之前的色标
            // case z <= 1.5:
            //     style['color'] = '#153C83'
            //     break
            // case z <= 3:
            //     style['color'] = '#4199E2'
            //     break
            // case z <= 4.5:
            //     style['color'] = '#F0DC62'
            //     break
            // case z <= 6:
            //     style['color'] = '#F0DC62'
            //     break
            // case z <= 7.5:
            //     style['color'] = '#DD8839'
            //     break
            // case z <= 9:
            //     style['color'] = '#F22015'
            //     break
            // case z <= 10.5:
            //     style['color'] = '#F22015'
            //     break
            // case z <= 12:
            //     style['color'] = '#C40E0F'
            //     break
            // case z <= 13.5:
            //     style['color'] = '#C40E0F'
            //     break
            case z <= 1:
                style['color'] = '#38276D'
                break
            case z <= 2:
                style['color'] = '#4451BF'
                break
            case z <= 3:
                style['color'] = '#4778F0'
                break
            case z <= 4:
                style['color'] = '#3D9EFE'
                break
            case z <= 5:
                style['color'] = '#23C3E4'
                break
            case z <= 6:
                style['color'] = '#18E0BD'
                break
            case z <= 7:
                style['color'] = '#35F394'
                break
            case z <= 8:
                style['color'] = '#6DFE62'
                break
            case z <= 9:
                style['color'] = '#A4FC3C'
                break
            case z > 9:
                style['color'] = '#F22015'
                break
        }

        return style
    }
}

/**
 * 21-03-31 新加入的 海浪浪向 继承自 IArrow
 *
 * @class WaveArrow
 * @implements {IArrow}
 */
class WaveArrow implements IArrow {
    private _canvasMarkerLayers: L.Layer[] = []
    async add2mapGlobal(
        map: L.Map,
        windbarOpt: WindBarOptMidModel,
        pageIndex: number
    ): Promise<L.Layer> {
        const myself = this
        const markers: L.Marker<any>[] = []
        // TODO:[-] 21-02-08 每次调用 添加 全球风场时先清除
        // const my_self=this
        await loadWaveBarPaged(
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
                    0: "81.2500"
                    1: "12.7500"
                    length: 2
                __proto__: Array(0)
                type: "Point"
                __proto__: Object
                dir_wave: "9.9382"
                spd_wave: null
                */
                const waveBarPoints: {
                    lat: number
                    lon: number
                    waveDir: number
                    waveSpd: number | null
                }[] = []
                const myRender = L.canvas({ padding: 0.5 })
                res.data.forEach(
                    (temp: {
                        coords: { coordinates: number[] }
                        dir_wave: number
                        spd_wave: number | null
                    }) => {
                        waveBarPoints.push({
                            lat: temp.coords.coordinates[0],
                            lon: temp.coords.coordinates[1],
                            waveDir: temp.dir_wave,
                            waveSpd: temp.spd_wave
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

                this.canvasMarkerLayer = ciLayer

                waveBarPoints.forEach(function(p) {
                    const absDirTemp =
                        typeof p.waveDir === 'string' ? parseFloat(p.waveDir) : p.waveDir

                    if (absDirTemp < 0) {
                        // console.log(p.windDir)
                    }
                    // 360-6.6414
                    const absDir = absDirTemp < 0 ? 360 + absDirTemp : absDirTemp
                    if (absDir > 360 || absDir < 0) {
                        // console.log(absDir)
                    }
                    const spdImgSrc: string = myself.getSpdImg(p.waveSpd)
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
    add2map(map: L.Map, barOpt: WindBarOptMidModel): Promise<L.Layer> {
        // loadWaveBarPaged(barOpt.coverageId, barOpt.forecastDt, barOpt.level).then((res) => {
        //     if (res.status === 200) {
        //     }
        // })
        console.log('暂时未实现')
        // throw new Error('Method not implemented.')
    }
    clearLayers(map: L.Map): void {
        console.log('暂时未实现')
    }
    /**
     * 根据风速返回对应的风力杆img url
     *
     * @private
     * @param {number} spd
     * @returns {string}
     * @memberof WindArrow
     */
    private getSpdImg(spd: number | null): string {
        const src = '/static/wavebaricon/'
        const imgName = 'S.gif'
        return `${src}${imgName}`
    }
}
export { WaveContourLine, WaveArrow }
