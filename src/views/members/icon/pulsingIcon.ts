/**
 * 脉冲圆形icon
 *
 * @class IconCirlePulsing
 */

interface IIconPlusingOptions {
    val?: number
    min?: number
    max?: number
    radius?: number
}

const iconPlusingDefaultOptions = {
    min: 1,
    max: 10,
    radius: 20
}

/**
 * 实现方式1
 * 功能：根据传入的值，动态调整脉冲边缘的半径以及脉冲圆点的半径大小
 * 具体实现：
 * r=20px
 * math.abs(val-min)/math.abs(max-min) * r
 * @author evaseemefly
 * @class IconCirlePulsing
 */
class IconCirlePulsing {
    val: number
    max: number
    min: number
    radius: number
    config: IIconPlusingOptions
    constructor(options: IIconPlusingOptions) {
        // Object.assign(this, { max: 10, min: 1, radius: 10 }, options)
        this.config = { ...options, ...iconPlusingDefaultOptions }
    }
    toHtml(): string {
        const divHtml = `<div class="my-leaflet-pulsing-marker">
        <div class="my-leaflet-icon-border"></div>
        <div class="my-leaflet-pulsing-icon"></div>
      </div>`
        return divHtml
    }

    getRadius(): number {
        const val =
            Math.abs(this.config.val - this.config.min) /
            Math.abs(this.config.max - this.config.min)
        return val
    }
}

/**
 * 海洋站icon
 *
 * @class IconStationSurge
 */
class IconMinStationSurge {
    stationName: string
    surge: number
    productTypeStr: string
    constructor(name: string, surge: number, productTypeStr = '潮位') {
        this.stationName = name
        this.surge = surge
        this.productTypeStr = productTypeStr
    }
    toHtml(): string {
        const divHtml = `<div class="my-station-surge-div">
        <div class="station-min-div-title">${this.stationName}</div>
        <div class="station-min-div-content liner-default ">${this.productTypeStr}</div>
        <div class="station-min-div-content ${this.getAlarmColor()}">${this.surge}</div>
      </div>`
        return divHtml
    }
    getAlarmColor(): string {
        const surge = this.surge
        let colorStr = 'green'
        switch (true) {
            case surge <= -2:
                colorStr = 'green'
                break
            case surge <= 40:
                colorStr = 'yellow'
                break
            case surge <= 60:
                colorStr = 'orange'
                break
            case surge > 60:
                colorStr = 'red'
                break
        }
        return colorStr
    }
}
export { IconCirlePulsing, IconMinStationSurge }