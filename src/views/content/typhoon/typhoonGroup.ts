import * as L from 'leaflet'
/*
+ 21-05-18 关于 tyGroupPath 相关的class
*/
import { DEFAULTTYCODE, DEFAULTTIMESTAMP } from '@/const/typhoon'
import { getTargetTyGroupDistDate, getTargetTyGroupDateRange } from '@/api/tyhoon'
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

export { TyGroupPath, getTyCenterGroupDiffLayer }
