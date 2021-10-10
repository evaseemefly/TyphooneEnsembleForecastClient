/*
   + 21-04-20 台风相关的 mid model
*/
import fecha from 'fecha'

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
    realdataBp: number
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
        this.realdataBp = bp
        this.galeRadius = galeRadius
    }

    toHtml(): string {
        const that = this
        const htmlStr = `
    <div class='typhoon_data_div mb-4 col-md-4 box-shadow'>
				<div class='card-header'>台风数据</div>
				<div class='card-body'>
					<div class='row'>
						<div class='col-md-4'>时间</div>
						<div class='col-md-8'>${fecha.format(new Date(that.forecastDt), 'YYYY-MM-DD HH:mm')}</div>
					</div>
					<div class='row'>
						<div class='col-md-4'>中心位置</div>
						<div class='col-md-8'>${that.lat}-${that.lon}</div>
					</div>
					
				</div>
				<div class='row row_footer'>
						<div class='typhoon_footer'>
							<div class='columnar'>
								<div class='subitem_top'>${that.realdataBp}</div>
								<div class='subitem_foot'>气压</div>
							</div>
							<div class='columnar'>
								<div class='subitem_top'>${that.galeRadius}</div>
								<div class='subitem_foot'>大风半径</div>
							</div>
						</div>
					</div>
			</div>
    `
        return htmlStr
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
    groupBp: number
    isBpIncrease: boolean
    // + 21-10-10 新加入的 group_id 之前在 listRealdata 中
    gpId: number
    listRealdata: Array<TyphoonForecastRealDataMidModel>

    constructor(
        tyId: number,
        gpId: number,
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
        this.groupBp = bp
        this.gpId = gpId
        this.listRealdata = listRealdata
    }
}

export { TyphoonComplexGroupRealDataMidModel, TyphoonForecastRealDataMidModel }
