import { LayerTypeEnum } from '@/enum/map'
import {
    TyphoonComplexGroupRealDataMidModel,
    TyphoonForecastRealDataMidModel
} from '@/middle_model/typhoon'
import * as L from 'leaflet'

/**
 * 可拆分的折线
 *
 * @class SplitLine
 */
class SplitLine {
    /**
     * 未拆分的折线
     *
     * @type {L.Polyline}
     * @memberof SplitLine
     */
    unSplitLine: L.Polyline
    constructor(polyLine: L.Polyline) {
        this.unSplitLine = polyLine
    }

    get getPolyLatlng(): L.LatLng[] {
        return this.unSplitLine.getLatLngs()
    }

    /**
     * 对于当前的这点按照 spliceUnit 进行插值切分
     *
     * @private
     * @param {number} spliceUnit
     * @return {*}  {L.LatLng[]}
     * @memberof SplitLine
     */
    private _initSplit(spliceUnit: number): L.LatLng[] {
        let splitPointsList: L.LatLng[] = []
        const count = this.getPolyLatlng.length
        const polyPoints = this.getPolyLatlng
        polyPoints.forEach((point: L.LatLng, index: number) => {
            if (index === 0) {
                splitPointsList.push(point)
            } else if (index < count - 1) {
                const currentSplitedPointsList: L.LatLng[] = []
                const previous = polyPoints[index]
                const next = polyPoints[index + 1]
                const dist = Math.sqrt(
                    Math.pow(next.lat - previous.lat, 2) + Math.pow(next.lng - previous.lng, 2)
                )
                const operatorY = next.lat - previous.lat > 0 ? '+' : '-'
                const operatorX = next.lng - previous.lng > 0 ? '+' : '-'
                const currentSplitCount = Math.floor(dist / spliceUnit)
                // const spliceUnitX = Math.abs((next.lng - previous.lng) / currentSplitCount)
                // const spliceUnitY = Math.abs((next.lat - previous.lat) / currentSplitCount)
                const spliceUnitX = (next.lng - previous.lng) / currentSplitCount
                const spliceUnitY = (next.lat - previous.lat) / currentSplitCount
                for (let num = 0; num < currentSplitCount; num++) {
                    currentSplitedPointsList.push(
                        // new L.LatLng(
                        //     operatorX === '+'
                        //         ? previous.lat + spliceUnitX * num
                        //         : previous.lat - spliceUnitX * num,
                        //     operatorY === '+'
                        //         ? previous.lng + spliceUnitY * num
                        //         : previous.lng - spliceUnitY * num
                        // )
                        new L.LatLng(
                            previous.lat + spliceUnitY * num,
                            previous.lng + spliceUnitX * num
                        )
                    )
                }
                splitPointsList = [...splitPointsList, ...currentSplitedPointsList]
            }
        })
        return splitPointsList
    }

    /**
     * 获取插值切分后的分割点
     *
     * @param {number} [spliceUnit=0.05]
     * @return {*}  {L.LatLng[]}
     * @memberof SplitLine
     */
    public getSplitLatlngs(spliceUnit = 0.05): L.LatLng[] {
        return this._initSplit(spliceUnit)
    }
}

/**
 * 切分集合路径
 *
 * @class SplitGroupPathLine
 */
class SplitGroupPathLine {
    tyGroupPathLines: TyphoonComplexGroupRealDataMidModel[]
    constructor(groupLines: TyphoonComplexGroupRealDataMidModel[]) {
        this.tyGroupPathLines = groupLines
    }

    /**
     * 过滤掉重复的路径 只提取 bp=0的
     *
     * @private
     * @memberof SplitGroupPathLine
     */
    private _filterSamePath(): void {
        this.tyGroupPathLines = this.tyGroupPathLines.filter((temp) => {
            return temp.groupBp === 0
        })
    }

    /**
     * 对集合路径根据 spliceUnit 进行插值，并返回插值后的集合(不再按照group进行分组)
     *
     * @private
     * @param {number} spliceUnit 插值的单位(°)
     * @return {*}  {{
     *         latlng: L.LatLng
     *         tyType: string
     *         tyMarking: number
     *     }[]}
     * @memberof SplitGroupPathLine
     */
    private _interpolateLines(
        spliceUnit: number
    ): {
        latlng: L.LatLng
        tyType: string
        tyMarking: number
    }[] {
        let splitPointsList: {
            latlng: L.LatLng
            tyType: string
            tyMarking: number
        }[] = []
        this.tyGroupPathLines.forEach((tempGroupPath) => {
            const count = tempGroupPath.listRealdata.length
            tempGroupPath.listRealdata.forEach((tempTyRealData, index: number) => {
                if (index < count - 1) {
                    const currentSplitedPointsList: {
                        latlng: L.LatLng
                        tyType: string
                        tyMarking: number
                    }[] = []
                    const previous = tempGroupPath.listRealdata[index]
                    const next = tempGroupPath.listRealdata[index + 1]
                    const dist = Math.sqrt(
                        Math.pow(next.lat - previous.lat, 2) + Math.pow(next.lon - previous.lon, 2)
                    )
                    const currentSplitCount = Math.floor(dist / spliceUnit)
                    const spliceUnitX = (next.lon - previous.lon) / currentSplitCount
                    const spliceUnitY = (next.lat - previous.lat) / currentSplitCount
                    // 生成当前两点间的插值后的点
                    for (let num = 0; num < currentSplitCount; num++) {
                        currentSplitedPointsList.push({
                            latlng: new L.LatLng(
                                previous.lat + spliceUnitY * num,
                                previous.lon + spliceUnitX * num
                            ),
                            tyType: tempGroupPath.tyPathType,
                            tyMarking: tempGroupPath.tyPathMarking
                        })
                    }
                    splitPointsList = [...splitPointsList, ...currentSplitedPointsList]
                }
            })
        })

        return splitPointsList
    }

    /**
     * 获取插值后的路径集合(包含了权重: tyMarking)
     *
     * @param {number} [spliceUnit=0.05]
     * @return {*}  {{
     *         latlng: L.LatLng
     *         tyType: string
     *         tyMarking: number
     *     }[]}
     * @memberof SplitGroupPathLine
     */
    public getSplitedGroupModelList(
        spliceUnit = 0.05
    ): {
        latlng: L.LatLng
        tyType: string
        tyMarking: number
    }[] {
        this._filterSamePath()
        return this._interpolateLines(spliceUnit)
    }
}

export { SplitLine, SplitGroupPathLine }
