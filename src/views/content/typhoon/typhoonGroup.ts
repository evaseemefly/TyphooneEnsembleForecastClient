import * as L from 'leaflet'
/*
+ 21-05-18 关于 tyGroupPath 相关的class
*/
import { IconTypeEnum } from '@/enum/common'
import { DEFAULT_COLOR } from '@/const/common'
import { TyphoonCircleStatus } from '@/common/circleStatus'
import { DEFAULTTYCODE, DEFAULTTIMESTAMP } from '@/const/typhoon'
import { ScaleColor, TyGroupPathScaleColor } from '@/common/scaleColor'
import { getTargetTyGroupDistDate, getTargetTyGroupDateRange } from '@/api/tyhoon'
import { IconTyphoonCirlePulsing } from '@/views/members/icon/pulsingIcon'
// mid models
import { TyphoonComplexGroupRealDataMidModel } from '@/middle_model/typhoon'
import moment from 'moment'
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
    protected tyGroupPolyLineLayer: L.Layer[]
    polyColor = DEFAULT_COLOR
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
        // 对于 arr2 对 数字进行排序
        arr2 = arr2.sort((a, b) => {
            return a.tyPathMarking - b.tyPathMarking
        })
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
        this.tyGroupPathLines = [...arr1, ...arr2]
        // TODO:[-] 21-05-13 新加入一个对其倒叙，因为此种方式排序完的数组，中间路径会出现在最前，也就是最先被叠加
        this.tyGroupPathLines = this.tyGroupPathLines.sort((a, b) => {
            return -1
        })
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

export { TyGroupPath, getTyCenterGroupDiffLayer, TyGroupPathLine, TyGroupCenterPathLine }
