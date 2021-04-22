import fecha from 'fecha'

const DEFAULT_RADIUS = 1

/**
 * + 21-04-20 台风圆 状态
 *
 * @class TyphoonCircleStatus
 */
class TyphoonCircleStatus {
    // color_enum=Color
    // 最大风速
    radius = DEFAULT_RADIUS
    // 气压
    bp: number
    forecastDt: Date
    lat: number
    lon: number

    constructor(radius: number, bp: number, forecastDt: Date, lat: number, lon: number) {
        this.radius = radius
        this.bp = bp
        this.forecastDt = forecastDt
        this.lat = lat
        this.lon = lon
    }

    //获取颜色（string）
    getColor(): string {
        let colorStr = 'blue'
        const val = this.radius
        if (val <= 2) {
            // return color_str
        } else if (val < 4) {
            colorStr = 'yellow'
            // return color_str
        } else if (val < 6) {
            colorStr = 'red'
        }
        return colorStr
    }

    //获取圆圈的半径
    getWeight(): number {
        let weight = 2
        const val = this.radius
        if (val <= 30) {
            weight = 3
        } else if (val < 40) {
            weight = 5
        } else if (val < 60) {
            weight = 8
        } else if (val < 100) {
            weight = 10
        } else {
            weight = 12
        }
        return weight
    }

    toDivIconHtml(): string {
        const that = this
        const htmlStr = `
    <div class='typhoon_data_div card mb-4 col-md-4 box-shadow'>
				<div class='card-header'>台风数据</div>
				<div class='card-body'>
					<div class='row'>
						<div class='col-md-4'>时间</div>
						<div class='col-md-8'>${fecha.format(new Date(that.forecastDt), 'YYYY-MM-DD HH:mm')}</div>
					</div>
					<div class='row'>
						<div class='col-md-4'>中心位置</div>
						<div class='col-md-8'>${(that.lat, that.lon)}</div>
					</div>
					<div class='row row_footer'>
						<div class='typhoon_footer'>
							<div class='columnar'>
								<div class='subitem_top'>${that.bp}</div>
								<div class='subitem_foot'>气压</div>
							</div>
							<div class='columnar'>
								<div class='subitem_top'>${that.radius}</div>
								<div class='subitem_foot'>大风半径</div>
							</div>
						</div>
					</div>
				</div>
			</div>
    `
        return htmlStr
    }
}

export { TyphoonCircleStatus }
