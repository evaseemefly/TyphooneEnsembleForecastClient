import { getStationSurgeRangeListByGroupPath } from '@/api/station'
import {
    IToHtml,
    IconFormStationDetialedMidModel,
    IconFormDefaultMidModel,
    IconFormMinStationSurgeMidModel,
    IconFormTitleStationSurgeMidModel
} from '@/middle_model/station'
/*
 + 21-05-14 
    台风相关的逻辑代码
*/

class StationSurge {
    tyCode: string
    timeStampStr: string
    forecastDt: Date
    stationName: string
    stationCode: string
    // stationIcons: IconFormStationDetialedMidModel[] = []

    constructor(
        stationName: string,
        stationCode: string,
        tyCode: string,
        timeStampStr: string,
        forecastDt: Date
    ) {
        this.stationName = stationName
        this.stationCode = stationCode
        this.tyCode = tyCode
        this.timeStampStr = timeStampStr
        this.forecastDt = forecastDt
    }

    /**
     * 根据传入的 zoom 返回对应的 icon 实现类
     *
     * @param {number} zoom
     * @memberof StationSurge
     */
    private getStationIconImplements(
        zoom: number,
        options: {
            stationName: string
            stationCode: string
            surgeMax?: number
            surgeMin?: number
            surgeVal: number
        }
    ): IToHtml {
        // const stationIcons: IconFormStationDetialedMidModel[] = []
        // 若放大的倍数大于五，则返回 详细的 station icon
        let iToHtml = new IconFormDefaultMidModel()
        const that = this
        if (zoom > 9) {
            iToHtml = new IconFormStationDetialedMidModel(
                options.stationName,
                options.stationCode,
                options.surgeVal,
                options.surgeMax,
                options.surgeMin
            )
        } else if (zoom > 8 && zoom <= 9) {
            iToHtml = new IconFormMinStationSurgeMidModel(
                that.stationName,
                that.stationCode,
                options.surgeVal
            )
        } else {
            iToHtml = new IconFormTitleStationSurgeMidModel(
                that.stationName,
                that.stationCode,
                options.surgeVal
            )
        }
        return iToHtml
    }
    // private getStationIcon(zoom: number) {
    //     const stationIcons: IconFormStationDetialedMidModel[] = []
    //     // 若放大的倍数大于五，则返回 详细的 station icon
    //     if (zoom >= 5) {
    //         getStationSurgeRangeListByGroupPath(
    //             this.tyCode,
    //             this.forecastDt,
    //             this.timeStampStr
    //         ).then(
    //             (res: {
    //                 status: number
    //                 data: { station_code: string; surge__max: number; surge__min: number }[]
    //             }) => {
    //                 if (res.status === 200) {
    //                     if (res.data.length > 0) {
    //                         res.data.forEach((temp) => {
    //                             stationIcons.push(
    //                                 new IconFormStationDetialedMidModel(
    //                                     temp.station_code,
    //                                     temp.surge__max,
    //                                     temp.surge__min
    //                                 )
    //                             )
    //                         })
    //                         this.stationIcons = stationIcons
    //                     }
    //                 }
    //             }
    //         )
    //     }
    // }

    getImplements(
        zoom: number,
        options: {
            stationName: string
            stationCode: string
            surgeMax: number
            surgeMin: number
            surgeVal: number
        }
    ): IToHtml {
        return this.getStationIconImplements(zoom, options)
    }
}

export { StationSurge, IToHtml }
