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
    // radiusUnit:number=
    // x 与 y 的偏移量
    shiftX = 4
    shiftY = 4
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

    /**
     * 获取当前 surge 在 min - max 的百分位数
     *
     * @returns {number}
     * @memberof IconCirlePulsing
     */
    getRadius(): number {
        const val =
            Math.abs(this.config.val - this.config.min) /
            Math.abs(this.config.max - this.config.min)
        return val
    }

    /**
     * + 21-06-02 获取当前的 surge 的 脉冲icon的绝对半径
     *
     * @returns {number}
     * @memberof IconCirlePulsing
     */
    getPlusingIconAbsRadius(): number {
        // 半径的最大 px
        const radiusMaxVal = 15
        // 半径的最小 px
        const radiusMinVal = 6
        // 半径最大与最小的差值 px
        const radiusDiffVal = radiusMaxVal - radiusMinVal
        // 半径差值的绝对值
        const radiusDiffAbsVal = radiusDiffVal * this.getRadius()
        return radiusMinVal + radiusDiffAbsVal
    }

    /**
     * + 21-06-02 获取当前 surge 的 脉冲icon矩形的 width 与 height
     *
     * @returns {number[]}
     * @memberof IconCirlePulsing
     */
    getPlusingIconRectangle(): number[] {
        const width = 2 * (this.getPlusingIconAbsRadius() + this.shiftX)
        const height = 2 * (this.getPlusingIconAbsRadius() + this.shiftY)
        return [width, height]
    }

    getPlusingIconBorderAbsRadius(): number {
        // 半径的最大 px
        const radiusMaxVal = 19
        // 半径的最小 px
        const radiusMinVal = 10
        // 半径最大与最小的差值 px
        const radiusDiffVal = radiusMaxVal - radiusMinVal
        // 半径差值的绝对值
        const radiusDiffAbsVal = radiusDiffVal * this.getRadius()
        return radiusMinVal + radiusDiffAbsVal
    }
}

/**
 * 海洋站精简 icon form 精简信息框
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
    private getAlarmColor(): string {
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

/**
 * 潮位站的详细 icon form 详情信息框
 *
 * @class IconDetailedStationSurge
 */
class IconDetailedStationSurge {
    stationName: string
    surge: number
    productTypeStr: string
    surgeMin: number
    surgeMax: number
    constructor(
        name: string,
        surge: number,
        surgeMin: number,
        surgeMax: number,
        productTypeStr = '潮位'
    ) {
        this.stationName = name
        this.surge = surge
        this.surgeMin = surgeMin
        this.surgeMax = surgeMax
        this.productTypeStr = productTypeStr
    }
}
export { IconCirlePulsing, IconMinStationSurge, IconDetailedStationSurge }
