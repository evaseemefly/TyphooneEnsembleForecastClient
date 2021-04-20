/*
   + 21-04-20 台风相关的 mid model
*/

/**
 *
 * 台风实时数据 mid model
 * @class TyphoonForecastRealDataMidModel
 */
class TyphoonForecastRealDataMidModel {
    tyId: number
    gpId: number
    forecastDt: Date
    forecastIndex: number
    lat: number
    lon: number
    bp: number
    galeRadius: number
    constructor(
        tyId: number,
        gpId: number,
        forecastDt: Date,
        forecastIndex: number,
        lat: number,
        lon: number,
        bp: number,
        galeRadius: number
    ) {
        this.tyId = tyId
        this.gpId = gpId
        this.forecastDt = forecastDt
        this.forecastIndex = forecastIndex
        this.lat = lat
        this.lon = lon
        this.bp = bp
        this.galeRadius = galeRadius
    }
}

/**
 * 台风复合 集合预报 实时数据 mid model
 *
 * @class TyphoonComplexGroupRealDataMidModel
 */
class TyphoonComplexGroupRealDataMidModel {
    tyId: number
    tyCode: string
    area: number
    timestamp: string
    tyPathMarking: number
    tyPathType: string
    bp: number
    isBpIncrease: boolean
    listRealdata: Array<TyphoonForecastRealDataMidModel>
    constructor(
        tyId: number,
        tyCode: string,
        timestamp: string,
        tyPathMarking: number,
        tyPathType: string,
        bp: number,
        isBpIncrease: boolean,
        listRealdata: Array<TyphoonForecastRealDataMidModel>
    ) {
        this.tyId = tyId
        this.tyCode = tyCode
        this.timestamp = timestamp
        this.tyPathMarking = tyPathMarking
        this.tyPathType = tyPathType
        this.isBpIncrease = isBpIncrease
        this.bp = bp
        this.listRealdata = listRealdata
    }
}
export { TyphoonComplexGroupRealDataMidModel, TyphoonForecastRealDataMidModel }
