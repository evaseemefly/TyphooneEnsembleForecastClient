import * as L from 'leaflet'
// TODO:[-] 22-02-25 圆 -> 多边形
import '@geoman-io/leaflet-geoman-free'
import 'leaflet-semicircle' // 绘制半圆
import * as pointInPolygon from 'point-in-polygon' // 判断点是否在多边形中 - https://github.com/substack/point-in-polygon

/*
+ 21-05-18 关于 tyGroupPath 相关的class
*/
import { IconTypeEnum } from '@/enum/common'
import { DEFAULT_COLOR } from '@/const/common'
import { RADIUSUNIT } from '@/const/typhoon'
import { DEFAULTTYCODE, DEFAULTTIMESTAMP } from '@/const/typhoon'
import { ScaleColor, TyGroupPathScaleColor } from '@/common/scaleColor'
import { getTargetTyGroupDistDate, getTargetTyGroupDateRange } from '@/api/tyhoon'
import { IconTyphoonCirlePulsing } from '@/views/members/icon/pulsingIcon'
// mid models
import {
    TyphoonComplexGroupRealDataMidModel,
    TyphoonForecastRealDataMidModel
} from '@/middle_model/typhoon'
import { TyphoonCircleStatus } from '@/common/circleStatus'
import moment from 'moment'
import { getTaskStateVal } from '@/enum/task'
export interface ITyGroupPathOptions {
    tyCode: string
    timestamp: string
}

class TyGroupPath {
    defaultOptions: ITyGroupPathOptions = {
        tyCode: DEFAULTTYCODE,
        timestamp: DEFAULTTIMESTAMP
    }
    tyCode: string
    timestamp: string
    constructor(tyCode?: string, timestamp?: string) {
        this.tyCode = this.defaultOptions.tyCode
        this.timestamp = this.defaultOptions.timestamp
        if (tyCode) {
            this.tyCode = tyCode
        }
        if (timestamp) {
            this.timestamp = timestamp
        }
    }

    async getTargetTyGroupDateRange(tyCode?: string, timestamp?: string): Promise<Date[]> {
        let dateRange: Date[] = []
        if (tyCode) {
            this.tyCode = tyCode
        }
        if (timestamp) {
            this.timestamp = timestamp
        }
        await getTargetTyGroupDateRange(this.tyCode, this.timestamp).then(
            (res: { status: number; data: string[] }) => {
                if (res.status === 200) {
                    const dateList: Date[] = []
                    if (res.data.length > 0) {
                        res.data.forEach((temp) => {
                            // "2021-05-18T11:00:00"
                            const temoDt: Date = new Date(temp)
                            // console.log(moment(temp, 'YYYY-MM-DDTHH:mm:ss').utc())
                            // console.log(moment(temp, 'YYYY-MM-DDTHH:mm:ss'))
                            dateList.push(temoDt)
                        })
                    }
                    dateRange = dateList
                }
            }
        )
        return dateRange
    }
    async getTargetTyGroupDistDate(tyCode?: string, timestamp?: string): Promise<Date[]> {
        let dateList: Date[] = []
        if (tyCode) {
            this.tyCode = tyCode
        }
        if (timestamp) {
            this.timestamp = timestamp
        }
        await getTargetTyGroupDistDate(this.tyCode, this.timestamp).then((res) => {
            if (res.status === 200) {
                dateList = res.data
            }
        })
        return dateList
    }
}

/**
 * + 21-10-19 添加的台风集合路径 line
 *
 * @class TyGroupPathLine
 */
class TyGroupPathLine {
    tyGroupPathLines: Array<TyphoonComplexGroupRealDataMidModel>
    myMap: L.Map
    tyColorScale: any
    public tyGroupPolyLineLayer: L.Layer[]
    polyColor = DEFAULT_COLOR
    tyGroupProPathCircles: { lat: number; lon: number; radius: number }[] = []
    // tyCenterPath:any
    constructor(
        mymap: L.Map,
        tyGroupPathLines: Array<TyphoonComplexGroupRealDataMidModel>,
        isDynamicColorScale = true
    ) {
        this.tyGroupPathLines = tyGroupPathLines
        this.myMap = mymap
        this.tyGroupPolyLineLayer = []
        // + 21-11-16 对 grouppath 进行排序
        this.sortTyGroupLinesList()
        //
        this.initColorScale()
        this.initTyGroupPolyLineLayer(isDynamicColorScale)
    }

    get tyGroupPathListCount(): number {
        return this.tyGroupPathLines.length
    }

    protected initColorScale(): void {
        this.tyColorScale = new TyGroupPathScaleColor(0, this.tyGroupPathListCount)
    }

    public getTyColor(index: number): string {
        return this.tyColorScale.getColor(index)
    }

    protected initTyGroupPolyLineLayer(isDynamicColorScale = true): void {
        let indexTyGroup = 0

        this.tyGroupPathLines.map((temp) => {
            indexTyGroup++
            const polygonPoint: L.LatLng[] = []
            const cirleScaleColor = new ScaleColor(0, temp.listRealdata.length)
            cirleScaleColor.setScale('Viridis')
            let indexDate = 0
            const cirleLayers: L.Layer[] = []
            // TODO:[*] 22-02-09 尝试在每个节点加入 cirle
            const cirlePointsLayers: L.Circle[] = []
            // TODO:[-] 21-08-26 新加入的台风所在位置 point
            const tyPointsLayers: L.Layer[] = []

            temp.listRealdata.forEach((tempRealdata) => {
                indexDate++
                polygonPoint.push(new L.LatLng(tempRealdata.lat, tempRealdata.lon))
                // TODO:[-] 21-05-12 此处加入判断，对于 非中心路径不做 circle 的 push操作
            })

            // 添加折线
            const polyColor = isDynamicColorScale ? this.getTyColor(indexTyGroup) : this.polyColor
            // 设置鼠标移入时触发的事件
            // 为当前 线段添加 自定义 data
            const groupPolyLine = L.polyline(polygonPoint, {
                color: polyColor,
                opacity: 0.2,
                fillOpacity: 0.2,
                weight: 3
            })
            // TODO:[*] 22-02-09 尝试在每个节点加入 cirle
            // polygonPoint.map((temp) => {
            //     const groupCirleLayers = L.circle(temp, { radius: 50 }).addTo(this.myMap)
            // })

            // TODO:[-] 21-04-21 此处尝试将同一个 集合路径的 折线 + points 统一 add -> groupLayer
            // 目前看均无法设置 折线的 zindex
            let tempLayer = L.layerGroup([...cirleLayers])
            tempLayer = tempLayer.setZIndex(2000)
            // 21-08-26 暂时不在显示 台风风圈
            // groupPolyLine.addTo(mymap)
            this.tyGroupPolyLineLayer.push(groupPolyLine)
        })
        // 添加 24,,48,72,96,120 对应的大风概率半径(注意此半径目前是写死的)，相当于是集合预报路径的一个显示轮廓的半径
    }

    public getTyGroupPolyLineLayers(): L.Layer[] {
        return this.tyGroupPolyLineLayer
    }

    /**
     * + 22-03-04
     * 获取台风集合路径外侧路径的多边形
     * @return {*}  {L.Polygon}
     * @memberof TyGroupPathLine
     */
    public getOutLinePoly(): L.Polygon {
        return new L.Polygon(this.getOutLinePolyLatlng(), {
            color: '#34495e',
            opacity: 0,
            fillOpacity: 0.4
        })
    }

    public addPolyLines2MapByGroup(): L.LayerGroup<any> {
        const tyGroupPolyLineLayers = this.getTyGroupPolyLineLayers()
        const tempTyGroupPolyLineLayerGroup = L.layerGroup([...tyGroupPolyLineLayers]).addTo(
            this.myMap
        )
        return tempTyGroupPolyLineLayerGroup
    }

    /**
     * + 21-11-16 对 this.tyGroupPathLines 进行排序，主要为了动态生成配色使用
     *
     * @protected
     * @memberof TyGroupPathLine
     */
    protected sortTyGroupLinesList(): void {
        let arr1: TyphoonComplexGroupRealDataMidModel[] = []
        let arr2: TyphoonComplexGroupRealDataMidModel[] = []
        // 将 标识符为 : [c,f,s] 提起出来存在 arr1 中
        // 将 标识符为 : [r,l] 提取出来存在 arr2 中
        this.tyGroupPathLines.forEach((temp) => {
            if (['r', 'l'].includes(temp.tyPathType)) {
                arr2.push(temp)
            } else if (['c', 'f', 's'].includes(temp.tyPathType)) {
                arr1.push(temp)
            }
        })
        // [r,l]
        // 对于 arr2 对 数字进行排序  升序排列
        arr2 = arr2.sort((a, b) => {
            return a.tyPathMarking - b.tyPathMarking
        })
        console.log('------')
        //以下均为测试内容
        arr2.forEach((temp) => {
            if ((temp.tyPathType === 'l' || temp.tyPathType === 'r') && temp.tyPathMarking === 0) {
                const logObj = {}
                logObj['id'] = temp.gpId
                logObj['index'] = arr2.findIndex((val) => {
                    return val.gpId === temp.gpId
                })

                console.log(temp.gpId)
                console.log(
                    arr2.findIndex((val) => {
                        return val.gpId === temp.gpId
                    })
                )
            }
        })
        // TODO:[-] 22-03-03 注意 l 与 r 的tyPathMarking =0 的情况都是最外侧的路径，需要提取并排序
        // 单独找到 ty_marking =0 的放到末尾
        // 此处需要注意，由于有不同的气压的变化，所以路径需要剔除 p00,p05,p10,p_05,p_10
        // 方式1:目前只能剔除一个，实际还剩余5种情况
        // const leftOuttestIndex: number = arr2.findIndex((temp) => {
        //     return temp.tyPathType === 'l' && temp.tyPathMarking === 0
        // })
        // const leftOuttestObj = arr2[leftOuttestIndex]
        // arr2.splice(leftOuttestIndex, 1)
        // arr2.push(leftOuttestObj)
        // const rightOuttestIndex: number = arr2.findIndex((temp) => {
        //     return temp.tyPathType === 'r' && temp.tyPathMarking === 0
        // })
        // const rightOuttestObj = arr2[rightOuttestIndex]
        // arr2.splice(rightOuttestIndex, 1)
        // arr2.push(rightOuttestObj)
        // --
        // 方式2:
        const arr2New = [...arr2]
        arr2.forEach((val, index) => {
            // const index
            // if (val.tyPathType === 'l' && val.tyPathMarking === 0) {
            //     arr2New.splice(index, 1)
            //     arr2New.push(val)
            // } else if (val.tyPathType === 'r' && val.tyPathMarking === 0) {
            //     arr2.splice(index, 1)
            //     arr2.push(val)
            // }
            if (val.gpId === 9644) {
                console.log('-')
            }
            if ((val.tyPathType === 'l' || val.tyPathType === 'r') && val.tyPathMarking === 0) {
                const indexSpliceObj = arr2New.findIndex((temp) => {
                    return temp.gpId === val.gpId
                })

                const spliceObj = arr2New.splice(indexSpliceObj, 1)[0]
                arr2New.push(spliceObj)
            }
        })
        console.log('sort后')
        arr2New.forEach((temp) => {
            if ((temp.tyPathType === 'l' || temp.tyPathType === 'r') && temp.tyPathMarking === 0) {
                console.log(temp.gpId)
                console.log(
                    arr2New.findIndex((val) => {
                        return val.gpId === temp.gpId
                    })
                )
            }
        })
        console.log('-----')
        // -----

        arr1 = arr1.sort((a, b) => {
            if (a.tyPathType === 'c' && b.tyPathType !== 'c') {
                return -1
            } else if (a.tyPathType === 'c' && b.tyPathType === 'c') {
                return 0
            } else if (['f', 's'].includes(a.tyPathType) && ['f', 's'].includes(b.tyPathType)) {
                return a.tyPathMarking - b.tyPathMarking
            } else {
                return 0
            }
        })
        this.tyGroupPathLines = [...arr1, ...arr2New]
        //
        console.log('合并数组后----')
        this.tyGroupPathLines.forEach((temp) => {
            if ((temp.tyPathType === 'l' || temp.tyPathType === 'r') && temp.tyPathMarking === 0) {
                console.log(temp.gpId)
                console.log(
                    arr2New.findIndex((val) => {
                        return val.gpId === temp.gpId
                    })
                )
            }
        })
        console.log('-----')
        // TODO:[-] 21-05-13 新加入一个对其倒叙，因为此种方式排序完的数组，中间路径会出现在最前，也就是最先被叠加
        this.tyGroupPathLines = this.tyGroupPathLines.sort((a, b) => {
            return -1
        })
        console.log('倒叙排列后')
        this.tyGroupPathLines.forEach((temp) => {
            if ((temp.tyPathType === 'l' || temp.tyPathType === 'r') && temp.tyPathMarking === 0) {
                console.log(temp.gpId)
                console.log(
                    arr2.findIndex((val) => {
                        return val.gpId === temp.gpId
                    })
                )
            }
        })
        console.log('-----')
    }

    addPathOutline2Map(): void {
        // this.mergePolyCircle()
    }

    /**
     * 获取最外侧台风路径的包络
     *
     * @return {*}  {L.LatLng[]}
     * @memberof TyGroupPathLine
     */
    getOutLinePolyLatlng(): L.LatLng[] {
        /*
          大体设计
               将所有路径将排序后的路径提取最外侧的路径形成多边形
               获取最后时刻的台风中心位置的园
               对两者填色
        */
        // 取出最外侧的 路径后需要对其排序
        // step1: 描绘最外侧的轮廓，通过多边形
        // const pathOutter1 = this.tyGroupPathLines[0]
        const pathOutter1 = this.tyGroupPathLines.find((temp) => {
            return temp.tyPathType === 'r' && temp.groupBp === 0 && temp.tyPathMarking === 0
        })
        const latlng1 = pathOutter1.listRealdata.sort((a, b) => {
            if (a.lat > b.lat || a.lon > b.lon) {
                return -1
            } else {
                return 0
            }
        })
        // const pathOutter2 = this.tyGroupPathLines[1]
        const pathOutter2 = this.tyGroupPathLines.find((temp) => {
            return temp.tyPathType === 'l' && temp.groupBp === 0 && temp.tyPathMarking === 0
        })
        const latlng2 = pathOutter2.listRealdata.sort((a, b) => {
            if (a.lat > b.lat || a.lon > b.lon) {
                return 1
            } else {
                return 0
            }
        })
        const lines: L.LatLng[] = []

        latlng1.forEach((temp) => {
            lines.push(new L.LatLng(temp.lat, temp.lon))
        })
        latlng2.forEach((temp) => {
            lines.push(new L.LatLng(temp.lat, temp.lon))
        })
        return lines
        // L.polygon(lines, { color: '#76eec6', opacity: 1, fillOpacity: 1 }).addTo(this.myMap)

        // step2: 加入顶部圆形
    }

    // 根据传入的 时间 index 返回当前 dateIndex 对应的 大风概率半径
    // 只对应时刻 24,48,72,96,120 且对应的 大风概率半径是写死的,注意！！
    getTyProPathRadius(
        index: number,
        count: number,
        options: { interval: number } = { interval: 6 }
    ): number {
        let radius = 0
        const indexTemp = index - 1
        // 此处需要加入一个判断，若index=count的话，说明是最后一个时刻也需要返回一个半径
        if (index === count) {
            if (count * options.interval < 24) {
                radius = (60 / options.interval) * count
            } else if (count * options.interval < 48) {
                radius = 60 + ((100 - 60) / options.interval) * (count - 24 / options.interval)
            } else if (count * options.interval < 72) {
                radius = 100 + ((120 - 100) / options.interval) * (count - 24 / options.interval)
            } else if (count * options.interval < 96) {
                radius = 120 + ((150 - 120) / options.interval) * (count - 24 / options.interval)
            }
        } else {
            switch (true) {
                // TODO:[-] 21-03-26 备份之前的色标
                case indexTemp * options.interval === 24:
                    radius = 60
                    break
                case indexTemp * options.interval === 48:
                    radius = 100
                    break
                case indexTemp * options.interval === 72:
                    radius = 120
                    break
                case indexTemp * options.interval === 96:
                    radius = 150
                    break
                case indexTemp * options.interval === 120:
                    radius = 180
                    break
                default:
                    radius = 0
                    break
            }
        }

        return radius
    }
}

/**
 * + 21-10-19 台风集合路径 中间路径 类
 *   有高亮 + 差值后的路径示意脉冲原点显示
 *
 * @class TyGroupCenterPathLine
 * @extends {TyGroupPathLine}
 */
class TyGroupCenterPathLine extends TyGroupPathLine {
    protected tyCenterPointsLayers: L.Layer[] = []
    constructor(mymap: L.Map, tyGroupPathLines: Array<any>) {
        super(mymap, tyGroupPathLines, false)
        this.initCenterPulsingIcon()
    }
    /**
     * 初始化 中间 路径的路径线段 layer
     *
     * @protected
     * @memberof TyGroupCenterPathLine
     */
    // protected initTyGroupPolyLineLayer(): void {
    //     let indexTyGroup = 0
    //     this.tyGroupPathLines.map((temp) => {
    //         indexTyGroup++
    //         const polygonPoint: L.LatLng[] = []
    //         const cirleScaleColor = new ScaleColor(0, temp.listRealdata.length)
    //         cirleScaleColor.setScale('Viridis')
    //         let indexDate = 0
    //         const cirleLayers: L.Layer[] = []
    //         // TODO:[-] 21-08-26 新加入的台风所在位置 point
    //         const tyPointsLayers: L.Layer[] = []
    //         temp.listRealdata.forEach((tempRealdata) => {
    //             indexDate++
    //             polygonPoint.push(new L.LatLng(tempRealdata.lat, tempRealdata.lon))
    //             // TODO:[-] 21-05-12 此处加入判断，对于 非中心路径不做 circle 的 push操作
    //         })
    //         // 添加折线
    //         const polyColor = this.getTyColor(indexTyGroup)
    //         // 设置鼠标移入时触发的事件
    //         // 为当前 线段添加 自定义 data
    //         const groupPolyLine = L.polyline(polygonPoint, {
    //             color: polyColor,
    //             opacity: 0.2,
    //             fillOpacity: 0.2,
    //             weight: 3
    //         })
    //         // TODO:[-] 21-04-21 此处尝试将同一个 集合路径的 折线 + points 统一 add -> groupLayer
    //         // 目前看均无法设置 折线的 zindex
    //         let tempLayer = L.layerGroup([...cirleLayers])
    //         tempLayer = tempLayer.setZIndex(2000)
    //         // 21-08-26 暂时不在显示 台风风圈
    //         // groupPolyLine.addTo(mymap)
    //         this.tyGroupPolyLineLayer.push(groupPolyLine)
    //     })
    //     // 添加 24,,48,72,96,120 对应的大风概率半径(注意此半径目前是写死的)，相当于是集合预报路径的一个显示轮廓的半径
    // }

    /**
     * 初始化中间路径的脉冲icon
     *
     * @protected
     * @memberof TyGroupCenterPathLine
     */
    protected initCenterPulsingIcon(): void {
        let indexTyGroup = 0
        const tyPointsLayers: L.Layer[] = []
        this.tyGroupPathLines.map((temp) => {
            {
                indexTyGroup++
                temp.listRealdata.forEach((tempRealdata) => {
                    // TODO:[-] 21-08-26 新加入的台风所在位置 point
                    const tyMax = 10
                    const tyMin = 1
                    // TODO:[-] 21-08-13 对于当前台风位置的脉冲icon
                    const tyCirleIcon = new IconTyphoonCirlePulsing({
                        val: 10,
                        max: tyMax,
                        min: tyMin,
                        iconType: IconTypeEnum.TY_PATH_ICON
                    })
                    const typhoonStatus = new TyphoonCircleStatus(
                        tempRealdata.galeRadius,
                        tempRealdata.realdataBp,
                        tempRealdata.forecastDt,
                        tempRealdata.lat,
                        tempRealdata.lon
                    )
                    const tyDivIcon = L.divIcon({
                        className: 'surge_pulsing_icon_default',
                        html: tyCirleIcon.toHtml()
                    })
                    const tyPulsingMarker = L.marker([tempRealdata.lat, tempRealdata.lon], {
                        icon: tyDivIcon,
                        customData: typhoonStatus
                    })
                    tyPointsLayers.push(tyPulsingMarker)
                })
            }
        })
        this.tyCenterPointsLayers = tyPointsLayers
    }

    addCenterCirlePulsing2MapByGroup(): L.LayerGroup<any> {
        const tyCenterPointsLayersGroup = L.layerGroup([...this.tyCenterPointsLayers])
        tyCenterPointsLayersGroup.addTo(this.myMap)
        return tyCenterPointsLayersGroup
    }

    /**
     * + 22-02-24 中间路径 按照指定时间列表生成的 概率 半径圆的示意
     *
     * @memberof TyGroupCenterPathLine
     */
    addProRadiusCirle2MapByCenter(): L.LayerGroup<any> {
        let indexTyGroup = 0
        let indexDate = 0
        const tyPointsLayers: L.Layer[] = []
        const tyProRadiusCircleLayerGroup: L.LayerGroup<any> = []

        const mymap: any = this.myMap
        const cirleLayers: L.Circle[] = []

        this.tyGroupPathLines.map((temp) => {
            {
                indexTyGroup++
                const cirleScaleColor = new ScaleColor(0, temp.listRealdata.length)
                cirleScaleColor.setScale('Viridis')
                temp.listRealdata.forEach((tempRealdata) => {
                    indexDate++
                    const typhoonStatus = new TyphoonCircleStatus(
                        tempRealdata.galeRadius,
                        0,
                        tempRealdata.forecastDt,
                        tempRealdata.lat,
                        tempRealdata.lon
                    )
                    if (temp.tyPathType === 'c' && temp.tyPathMarking === 0) {
                        // 根据传入的 时间 index 返回当前 dateIndex 对应的 大风概率半径
                        // 获取中间路径的总数
                        const centerPathCount: number = temp.listRealdata.length
                        const tempProPathRadius: number = this.getTyProPathRadius(
                            indexDate,
                            centerPathCount
                        )
                        if (tempProPathRadius !== 0) {
                            this.tyGroupProPathCircles.push({
                                lat: tempRealdata.lat,
                                lon: tempRealdata.lon,
                                radius: tempProPathRadius
                            })
                        }
                    }
                    // tyPointsLayers.push(tyPulsingMarker)
                })
            }
        })

        if (this.tyGroupProPathCircles.length > 0) {
            const tyGroupProPathMaxCircle: number = Math.max.apply(
                Math,
                this.tyGroupProPathCircles.map((temp) => {
                    return temp.radius
                })
            )
            const cirleScaleColor = new ScaleColor(0, tyGroupProPathMaxCircle)
            this.tyGroupProPathCircles.forEach((tempTyGroup) => {
                const circleTemp = L.circle(new L.LatLng(tempTyGroup.lat, tempTyGroup.lon), {
                    // color: cirleScaleColor.getColor(tempTyGroup.radius),
                    color: '#76eec6',
                    radius: tempTyGroup.radius * RADIUSUNIT,
                    fill: true,
                    fillOpacity: 1,
                    //weight: tempTyGroup.radius,
                    opacity: 1
                })

                // layersCircle.push
                cirleLayers.push(circleTemp)
            })
            // tyProRadiusCircleLayerGroup = L.layerGroup([...cirleLayers]).addTo(mymap)
        }
        // this.getOutLinePolyLatlng()
        const circle2poly = L.PM.Utils.circleToPolygon(cirleLayers[1], 60)
        return tyProRadiusCircleLayerGroup
    }

    getLastRadiusCirle2Poly(): L.Polygon {
        let indexTyGroup = 0
        let indexDate = 0
        const tyPointsLayers: L.Layer[] = []
        // let tyProRadiusCircleLayerGroup: L.LayerGroup<any> = []

        const mymap: any = this.myMap
        const cirleLayers: L.Circle[] = []

        this.tyGroupPathLines.map((temp) => {
            {
                indexTyGroup++
                const cirleScaleColor = new ScaleColor(0, temp.listRealdata.length)
                cirleScaleColor.setScale('Viridis')
                temp.listRealdata.forEach((tempRealdata) => {
                    const typhoonStatus = new TyphoonCircleStatus(
                        tempRealdata.galeRadius,
                        0,
                        tempRealdata.forecastDt,
                        tempRealdata.lat,
                        tempRealdata.lon
                    )
                    if (temp.tyPathType === 'c' && temp.tyPathMarking === 0 && temp.groupBp === 0) {
                        // 根据传入的 时间 index 返回当前 dateIndex 对应的 大风概率半径
                        // 获取中间路径的总数
                        indexDate++
                        const centerPathCount: number = temp.listRealdata.length
                        const tempProPathRadius: number = this.getTyProPathRadius(
                            indexDate,
                            centerPathCount
                        )
                        if (tempProPathRadius !== 0) {
                            this.tyGroupProPathCircles.push({
                                lat: tempRealdata.lat,
                                lon: tempRealdata.lon,
                                radius: tempProPathRadius
                            })
                        }
                    }
                    // tyPointsLayers.push(tyPulsingMarker)
                })
            }
        })

        if (this.tyGroupProPathCircles.length > 0) {
            const tyGroupProPathMaxCircle: number = Math.max.apply(
                Math,
                this.tyGroupProPathCircles.map((temp) => {
                    return temp.radius
                })
            )
            const cirleScaleColor = new ScaleColor(0, tyGroupProPathMaxCircle)
            this.tyGroupProPathCircles.forEach((tempTyGroup) => {
                const circleTemp = L.circle(new L.LatLng(tempTyGroup.lat, tempTyGroup.lon), {
                    // color: cirleScaleColor.getColor(tempTyGroup.radius),
                    color: '#76eec6',
                    radius: tempTyGroup.radius * RADIUSUNIT,
                    fill: true,
                    fillOpacity: 1,
                    //weight: tempTyGroup.radius,
                    opacity: 1
                })

                // layersCircle.push
                cirleLayers.push(circleTemp)
            })
            // tyProRadiusCircleLayerGroup = L.layerGroup([...cirleLayers]).addTo(mymap)
        }
        // this.mergePolyCircle()
        const circle2poly = L.PM.Utils.circleToPolygon(cirleLayers[1], 60)
        return circle2poly
    }
}

/**
 * 台风结束圆
 * + 22-02-28
 * 台风路径最后一个时刻的圆
 *
 * @class TyphoonCircle
 */
class TyphoonCircle {
    /**
     * 台风终点中心位置
     *
     * @type {L.LatLng}
     * @memberof TyphoonCircle
     */
    // center: L.LatLng

    /**
     * 台风终点圆半径
     *
     * @type {number}
     * @memberof TyphoonCircle
     */
    // radius: number

    // dir: number
    defaultOptions: { interval: number } = { interval: 6 }
    circleSpliceNum: number
    groupPath: TyphoonComplexGroupRealDataMidModel[]
    // constructor(center: L.LatLng, radius: number, dir: number, circleSpliceNum: number) {
    //     this.center = center
    //     this.radius = radius
    //     this.dir = dir
    //     this.circleSpliceNum = circleSpliceNum
    // }

    /**
     * Creates an instance of TyphoonCircle.
     * @param {any[]} groupPath 中间路径
     * @param {number} circleSpliceNum 台风最后位置对圆切分为多边形的切分数量
     * @memberof TyphoonCircle
     */
    constructor(
        groupPath: TyphoonComplexGroupRealDataMidModel[],
        circleSpliceNum: number,
        options?: any
    ) {
        this.groupPath = groupPath
        this.circleSpliceNum = circleSpliceNum
        this.defaultOptions = { ...this.defaultOptions, ...options }
    }

    /**
     * 台风终点中心位置
     *
     * @readonly
     * @type {L.LatLng}
     * @memberof TyphoonCircle
     */
    get circleCenter(): L.LatLng {
        const count = this.centerPath.length
        const centerLatlng: L.LatLng = new L.LatLng(
            this.centerPath[count - 1].lat,
            this.centerPath[count - 1].lon
        )
        return centerLatlng
    }

    /**
     * 中心路径的各时刻的位置数据
     *
     * @readonly
     * @type {TyphoonForecastRealDataMidModel[]}
     * @memberof TyphoonCircle
     */
    get centerPath(): TyphoonForecastRealDataMidModel[] {
        const centerGroupPath = this.groupPath.filter((temp) => {
            return temp.tyPathType === 'c' && temp.tyPathMarking === 0 && temp.groupBp === 0
        })
        return centerGroupPath[0].listRealdata
    }

    /**
     * 获取台风终点中心位置的半径
     * 单位 km
     *
     * @readonly
     * @type {number}
     * @memberof TyphoonCircle
     */
    get circleRadius(): number {
        let radius = 0
        // const count = this.centerPath.length
        // const rightPath = this.groupPath.filter((temp) => {
        //     return (
        //         temp.tyPathType === 'r' &&
        //         temp.tyPathMarking === 0 &&
        //         temp.groupBp === 10 &&
        //         temp.isBpIncrease === false
        //     )
        // })[0].listRealdata[count - 1]

        // const leftPath = this.groupPath.filter((temp) => {
        //     return (
        //         temp.tyPathType === 'l' &&
        //         temp.tyPathMarking === 0 &&
        //         temp.groupBp === 10 &&
        //         temp.isBpIncrease === false
        //     )
        // })[0].listRealdata[count - 1]
        const rightPath: L.LatLng = this.getCircleRadiusLine().getLatLngs()[0]
        const leftPath: L.LatLng = this.getCircleRadiusLine().getLatLngs()[1]
        radius =
            Math.sqrt(
                Math.pow((rightPath.lat - leftPath.lat) * 111, 2) +
                    Math.pow((rightPath.lng - leftPath.lng) * 111, 2)
            ) / 2

        return radius
    }

    // get circleRadius(): number {
    //     let radius = 0
    //     const count = this.centerPath.length
    //     if (count * this.defaultOptions.interval < 24) {
    //         radius = (60 / this.defaultOptions.interval) * count
    //     } else if (count * this.defaultOptions.interval < 48) {
    //         radius =
    //             60 +
    //             ((100 - 60) / this.defaultOptions.interval) *
    //                 (count - 24 / this.defaultOptions.interval)
    //     } else if (count * this.defaultOptions.interval < 72) {
    //         radius =
    //             100 +
    //             ((120 - 100) / this.defaultOptions.interval) *
    //                 (count - 24 / this.defaultOptions.interval)
    //     } else if (count * this.defaultOptions.interval < 96) {
    //         radius =
    //             120 +
    //             ((150 - 120) / this.defaultOptions.interval) *
    //                 (count - 24 / this.defaultOptions.interval)
    //     }
    //     return radius
    // }

    /**
     * 获取台风终点位置的方向
     *
     * @readonly
     * @type {void}
     * @memberof TyphoonCircle
     */
    get circleDir(): number {
        /*
          获取台风中心路径最后两个位置的经纬度计算角度
        */
        // 方式1
        const count = this.centerPath.length
        // const lastPoint: L.LatLng = new L.LatLng(
        //     this.centerPath[count - 1].lat,
        //     this.centerPath[count - 1].lon
        // )
        // const secPoint: L.LatLng = new L.LatLng(
        //     this.centerPath[count - 2].lat,
        //     this.centerPath[count - 2].lon
        // )
        // 方式2:
        const rightPath = this.groupPath.filter((temp) => {
            return (
                temp.tyPathType === 'r' &&
                temp.tyPathMarking === 0 &&
                temp.groupBp === 10 &&
                temp.isBpIncrease === false
            )
        })[0].listRealdata[count - 1]

        const leftPath = this.groupPath.filter((temp) => {
            return (
                temp.tyPathType === 'l' &&
                temp.tyPathMarking === 0 &&
                temp.groupBp === 10 &&
                temp.isBpIncrease === false
            )
        })[0].listRealdata[count - 1]

        const rightPoint: L.LatLng = new L.LatLng(rightPath.lat, rightPath.lon)
        const leftPoint: L.LatLng = new L.LatLng(leftPath.lat, leftPath.lon)
        // ---- 以上无问题
        const angle: number = Math.atan2(
            rightPoint.lat - leftPoint.lat,
            rightPoint.lng - leftPoint.lng
        )
        let theta: number = angle * (180 / Math.PI)
        // 目前先只考虑1,2 象限的情况
        theta = theta + 90
        // 第二象限
        if (theta > 90 && theta < 180) {
            theta = 360 - (theta - 90)
        }
        return theta
    }

    getCircleRadiusLine(): L.Polyline {
        const count = this.centerPath.length
        // 方式2:
        const rightPath = this.groupPath.filter((temp) => {
            return (
                temp.tyPathType === 'r' &&
                temp.tyPathMarking === 0 &&
                temp.groupBp === 10 &&
                temp.isBpIncrease === false
            )
        })[0].listRealdata[count - 1]

        const leftPath = this.groupPath.filter((temp) => {
            return (
                temp.tyPathType === 'l' &&
                temp.tyPathMarking === 0 &&
                temp.groupBp === 10 &&
                temp.isBpIncrease === false
            )
        })[0].listRealdata[count - 1]

        const rightPoint: L.LatLng = new L.LatLng(rightPath.lat, rightPath.lon)
        const leftPoint: L.LatLng = new L.LatLng(leftPath.lat, leftPath.lon)
        return new L.Polyline([rightPoint, leftPoint])
    }
    /**
     * 获取台风最后一个时间节点的圆形
     *
     * @readonly
     * @type {L.Circle}
     * @memberof TyphoonCircle
     */
    get getCircle(): L.Circle {
        const circle = new L.Circle(this.circleCenter, {
            radius: this.circleRadius
        })
        return circle
    }

    /**
     * 获取圆的多边形
     *
     * @return {*}  {L.Polygon}
     * @memberof TyphoonCircle
     */
    getPolygon(): L.Polygon {
        const circle: L.Circle = this.getCircle
        const circle2poly = L.PM.Utils.circleToPolygon(circle, this.defaultOptions.interval)
        return circle2poly
    }

    /**
     * 多边形转成lines
     *
     * @return {*}  {L.Polyline}
     * @memberof TyphoonCircle
     */
    outLinePolylines(): L.Polyline {
        const polyLatlngs: L.LatLng[] = this.getPolygon().getLatLngs()
        const outline = new L.Polyline(polyLatlngs)
        return outline
    }

    /**
     * 获取外侧半圆的多边形
     *
     * @return {*}  {L.Polygon}
     * @memberof TyphoonCircle
     */
    semicirclePolygon(splicePolygon: L.Polygon): L.Polygon {
        const circlePolyLatlngs: L.LatLng[] = this.getPolygon().getLatLngs()
    }

    /**
     * + 22-03-03 获取最后时刻的中心路径圆
     *
     * @return {*}  {L.Circle}
     * @memberof TyphoonCircle
     */
    getLastCenterCircle(): L.Circle {
        return new L.Circle(this.circleCenter, {
            radius: this.circleRadius * 1000,
            fillColor: '#34495e',
            opacity: 0,
            fillOpacity: 0.8
        })
    }

    semiCircle(): any {
        // const semiCircle = L.semiCircle([this.circleCenter.lat, this.circleCenter.lng], {
        //     radius: 500,
        //     startAngle: 50,
        //     stopAngle: 210,
        //     color: 'rgba(255,0,0,0.5)'
        // })
        const dir = parseFloat(this.circleDir.toFixed(4))
        return L.semiCircle(
            [
                parseFloat(this.circleCenter.lat.toFixed(4)),
                parseFloat(this.circleCenter.lng.toFixed(4))
            ],
            {
                radius: this.circleRadius * 1000,
                startAngle: dir - 89.999,
                stopAngle: dir + 89.999,
                // color: '#34495e',
                // fill: 'rgba(255,0,0,0.5)',
                fillColor: '#34495e',
                opacity: 0,
                fillOpacity: 0.8
            }
        )
        // }).setDirection(dir, 180)
    }
}
/**
 * 台风最后的半径圆多边形
 *
 * @class TyphoonLastCirclePolygon
 */
class TyphoonLastSemiCirclePolygon {
    groupPath: TyphoonComplexGroupRealDataMidModel[]

    /**
     *将圆切分为多边形的份数
     *
     * @type {number}
     * @memberof TyphoonLastSemiCirclePolygon
     */
    circleSpliceNum: number

    tyOutlinePolygon: L.Polygon
    center: L.LatLng
    radius: number
    defaultOptions: {} = {}
    constructor(
        center: L.LatLng,
        radius: number,
        groupPath: TyphoonComplexGroupRealDataMidModel[],
        circleSpliceNum: number,
        tyOutlinePolygon: L.Polygon,
        options?: any
    ) {
        this.center = center
        this.radius = radius
        this.groupPath = groupPath
        this.circleSpliceNum = circleSpliceNum
        this.tyOutlinePolygon = tyOutlinePolygon
        this.defaultOptions = { ...this.defaultOptions, ...options }
    }

    /**
     * 获取最后位置的中心圆
     *
     * @readonly
     * @type {L.Circle}
     * @memberof TyphoonLastSemiCirclePolygon
     */
    get lastCenterCircle(): L.Circle {
        return new L.Circle(this.center, { radius: this.radius })
    }

    /**
     * 最后位置的中心圆->多边形-> 点
     *
     * @readonly
     * @type {L.Polygon}
     * @memberof TyphoonLastSemiCirclePolygon
     */
    get lastCenterCirclePolyPoints(): L.LatLng[] {
        return L.PM.Utils.circleToPolygon(
            this.lastCenterCircle,
            this.circleSpliceNum
        ).getLatLngs()[0]
    }

    /**
     * 最后位置的中心圆 -> 多边形 -> 点 -> 多边形
     *
     * @readonly
     * @type {L.Polygon}
     * @memberof TyphoonLastSemiCirclePolygon
     */
    get lastCenterCirclePolylines(): L.Polygon {
        return new L.Polygon(this.lastCenterCirclePolyPoints)
    }

    /**
     * 获取与台风轮廓多边形不相交的最后中心位置的半圆的外侧半圆
     *
     * @return {*}  {L.Polyline}
     * @memberof TyphoonLastSemiCirclePolygon
     */
    public getOutterSemicirclePolylines(): L.Polyline {
        //
        const that = this
        const outterPoints: L.LatLng[] = []
        this.lastCenterCirclePolyPoints.forEach((temp: L.LatLng) => {
            const isOutPoly = false
            // isOutPoly = pointInPolygon(temp, that.lastCenterCirclePolylines)
            if (!isOutPoly) {
                outterPoints.push(temp)
            }
        })
        return new L.Polyline(outterPoints)
    }

    /**
     * 获取与台风轮廓多边形不相交的最后中心位置的半圆的内侧半圆
     *
     * @return {*}  {L.Polyline}
     * @memberof TyphoonLastSemiCirclePolygon
     */
    public getInnerSemicirclePolylines(): L.Polyline {}
}

class TyphoonOutLinePolygon {}

/**
 * 台风多边形
 * + 22-02-28
 * 台风集合路径包络
 *
 * @class TyphoonPolygron
 */
class TyphoonPolygon {
    tyCircle: TyphoonCircle
    tyOutLine: TyphoonOutLinePolygon
    tyGroupPath: TyphoonComplexGroupRealDataMidModel[]
    map: L.Map
    // constructor(circle: TyphoonCircle, outline: TyphoonOutLine) {
    //     this.tyOutLine = outline
    //     this.tyCircle = circle
    // }
    constructor(groupPath: TyphoonComplexGroupRealDataMidModel[], map: L.Map) {
        this.tyGroupPath = groupPath
        this.map = map
    }

    get centerGroupPath(): TyphoonComplexGroupRealDataMidModel {
        const centerGroupPath = this.tyGroupPath.filter((temp) => {
            return temp.tyPathType === 'c' && temp.tyPathMarking === 0 && temp.groupBp === 0
        })
        return centerGroupPath[0]
    }

    /**
     * * 22-03-03
     * 生成台风包络 最外侧路径多边形 + 终点圆
     *
     * @param {L.LatLng[]} tyOutlinePoints
     * @memberof TyphoonPolygon
     */
    generateCircle(tyOutlinePoints: L.LatLng[] = []): L.LayerGroup {
        const that = this
        const circleTy = new TyphoonCircle(this.tyGroupPath, 60)
        const polyTyGroupPath = new TyGroupPathLine(this.map, this.tyGroupPath)
        // 台风最外侧路径多边形
        const polyTyGroupPathLayer = polyTyGroupPath.getOutLinePoly()
        // 台风终点圆形
        const circleTyLayer = circleTy.getLastCenterCircle()
        const groupLayers = new L.LayerGroup([circleTyLayer, polyTyGroupPathLayer])
        // 方法1:  使用描绘半圆的方式，会有一点偏差，暂时注释掉
        const semicircle = circleTy.semiCircle()
        // semicircle.addTo(that.map)
        const lastCirclePoly = new TyphoonLastSemiCirclePolygon(
            circleTy.circleCenter,
            circleTy.circleRadius,
            this.tyGroupPath,
            60,
            new L.Polyline(tyOutlinePoints)
        )
        // new L.Polyline(tyOutlinePoints).addTo(that.map)
        // lastCirclePoly.getOutterSemicirclePolylines().addTo(that.map)
        const circileRadiusLine = circleTy.getCircleRadiusLine()
        return groupLayers.addTo(that.map)
    }
}
/**
 * 对 layers 差值获取 对应时刻的 台风 layer
 *
 * @param {L.Layer[]} layers
 * @param {Date} targetDt
 * @return {*}  {L.Layer}
 */
const getTyCenterGroupDiffLayer = (
    layers: L.Layer[],
    targetDt: Date
): { bp: number; radius: number; lat: number; lon: number; forecastDt: Date } | undefined => {
    const existLayer = layers.find((temp) => {
        return temp.options.customData.forecastDt - targetDt === 0
    })
    const res: L.Layer[] = []
    let customData: {
        bp: number
        radius: number
        lat: number
        lon: number
        forecastDt: Date
    } = {}
    if (existLayer === undefined) {
        // step:
        // 1- 根据当前整点时间 获取对应的临近两个台风位置信息 lastPoint earlyPoint
        // 1-1 对时间进行排序
        // 2- 获取两个临近位置的时间差(换算成小时)
        // 3- 差之后获取对应的 台风位置
        layers.sort((a, b) => {
            return a.options.customData.forecastDt - b.options.customData.forecastDt
        })

        for (let i = 0; i < layers.length; i++) {
            // 方式1: 只适合找到最接近的一个值
            // 当前的差值
            // const tempDiff = Math.abs(layers[i].options.customData.forecastDt - targetDt)
            // if (!isNaN(tempDiff)) {
            //     // 对于当前 res 为空的情况，先加入一个 layer
            //     // * 注意此处需要起始放入两个 layer，之后每次遍历剔除一个时间差较大的
            //     if (res.length <= 1) {
            //         res.push(layers[i])
            //     } else {
            //         res.sort((a, b) => {
            //             return a.options.customData.forecastDt - b.options.customData.forecastDt
            //         })
            //         // 若当前的结果集中预报时间-当前时间差>当前循环的时间差
            //         if (
            //             Math.abs(res[res.length - 1].options.customData.forecastDt - targetDt) >
            //             tempDiff
            //         ) {
            //             res.pop()
            //             res.push(layers[i])
            //         }
            //     }
            // }
            // 方式2:
            if (layers[i + 1] !== undefined) {
                if (
                    layers[i].options.customData.forecastDt < targetDt &&
                    layers[i + 1].options.customData.forecastDt > targetDt
                ) {
                    res.push(layers[i])
                    res.push(layers[i + 1])
                }
            }
        }
    } else {
        res.push(existLayer)
        customData = existLayer.options.customData
    }
    // step2:
    /*
        判断 res 长度 >1
        差值
    */
    if (res.length > 1) {
        const early: { bp: number; radius: number; lat: number; lon: number; forecastDt: Date } =
            res[0].options.customData
        const last: { bp: number; radius: number; lat: number; lon: number; forecastDt: Date } =
            res[1].options.customData
        const diffDt = last.forecastDt - early.forecastDt
        const hourUnit = 60 * 60 * 1000
        // 相差的小时数
        const diffHour = diffDt / hourUnit
        const diffNow2Early = targetDt - early.forecastDt
        // eg:4
        const diffNow2EarlyHour = diffNow2Early / hourUnit
        const diffCustonDataUnit = {
            bpUnit: (last.bp - early.bp) / diffHour,
            radiusUnit: (last.radius - early.radius) / diffHour,
            latUnit: (last.lat - early.lat) / diffHour,
            lonUnit: (last.lon - early.lon) / diffHour,
            forecastDt: (last.forecastDt - early.forecastDt) / diffHour
        }
        const diffCustonData = {
            bp: early.bp + diffNow2EarlyHour * diffCustonDataUnit.bpUnit,
            radius: early.radius + diffNow2EarlyHour * diffCustonDataUnit.radiusUnit,
            lat: early.lat + diffNow2EarlyHour * diffCustonDataUnit.latUnit,
            lon: early.lon + diffNow2EarlyHour * diffCustonDataUnit.lonUnit,
            forecastDt: targetDt
        }
        customData = diffCustonData
    }
    return customData
}

export {
    TyGroupPath,
    getTyCenterGroupDiffLayer,
    TyGroupPathLine,
    TyGroupCenterPathLine,
    TyphoonPolygon,
    TyphoonOutLinePolygon,
    TyphoonCircle,
    TyphoonLastSemiCirclePolygon
}
