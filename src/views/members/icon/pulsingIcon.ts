/**
 * 脉冲圆形icon
 *
 * @class IconCirlePulsing
 */

import { IconTypeEnum } from '@/enum/common'

interface IIconPlusingOptions {
    val?: number
    min?: number
    max?: number
    radius?: number
    iconType: IconTypeEnum
}

const iconPlusingDefaultOptions = {
    min: 1,
    max: 10,
    radius: 20,
    iconType: IconTypeEnum.TY_PULSING_ICON
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
    shiftX = 0
    shiftY = 0
    iconBorder = 3
    /**
     * 当前 cirle 对应的 surge val
     *
     * @type {number}
     * @memberof IconCirlePulsing
     */
    val: number
    max: number
    min: number
    radius: number
    config: IIconPlusingOptions
    constructor(options: IIconPlusingOptions) {
        // Object.assign(this, { max: 10, min: 1, radius: 10 }, options)
        this.config = { ...iconPlusingDefaultOptions, ...options }
    }
    toHtml(): string {
        const that = this
        // 海洋站icon的宽高
        const iconPulsingWidth = that.getPlusingIconRectangle()[0]
        const iconPulsingHeight = that.getPlusingIconRectangle()[1]
        // icon 的外侧脉冲的宽高
        const iconBorderWidth = that.getPlusingIconBorderRectangle()[0]
        const iconBorderHeight = that.getPlusingIconBorderRectangle()[1]
        // 第一个div是外侧脉冲,第二个div是内部的icon
        const divHtml = `<div class="my-leaflet-pulsing-marker" >
        <div class="my-leaflet-icon-border ${this.getAlarmColor()}" style="width: ${iconBorderWidth}px;height:${iconBorderHeight}px;left:${-iconBorderWidth /
            2}px;top:${-iconBorderHeight / 2}px"></div>
        <div class="my-leaflet-pulsing-icon ${this.getAlarmColor()}" style="width: ${iconPulsingWidth}px;height:${iconPulsingHeight}px;left:${-iconPulsingWidth /
            2}px;top:${-iconPulsingHeight / 2}px"></div>
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
        //
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
        const radiusMaxVal = 10
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
        const confficient = 1.5
        const width = confficient * (this.getPlusingIconAbsRadius() + this.shiftX)
        const height = confficient * (this.getPlusingIconAbsRadius() + this.shiftY)
        return [width, height]
    }

    getPlusingIconBorderAbsRadius(): number {
        // 半径的最大 px
        const radiusMaxVal = 16
        // 半径的最小 px
        // const radiusMinVal = 10
        const radiusMinVal = 8
        // 半径最大与最小的差值 px
        const radiusDiffVal = radiusMaxVal - radiusMinVal
        // 半径差值的绝对值
        const radiusDiffAbsVal = radiusDiffVal * this.getRadius()
        return radiusMinVal + radiusDiffAbsVal
    }

    getPlusingIconBorderRectangle(): number[] {
        const confficient = 1.5
        const width = confficient * this.getPlusingIconBorderAbsRadius()
        const height = confficient * this.getPlusingIconBorderAbsRadius()
        return [width, height]
    }

    private getAlarmColor(): string {
        // TODO:[-] 21-06-08 此处代码与 middle_model -> stations.ts -> IconFormMinStationSurgeMidModel -> getAlarmColor 重复
        const surge = this.config.val
        let colorStr = 'green'
        if (surge) {
            switch (true) {
                case surge <= 100:
                    colorStr = 'green'
                    break
                case surge <= 150:
                    colorStr = 'blue'
                    break
                case surge <= 200:
                    colorStr = 'yellow'
                    break
                case surge <= 250:
                    colorStr = 'orange'
                    break
                case surge > 250:
                    colorStr = 'red'
                    break
            }
        }

        return colorStr
    }
}

class IconTyphoonCirlePulsing {
    // radiusUnit:number=
    // x 与 y 的偏移量
    shiftX = 4
    shiftY = 4
    /**
     * 当前 cirle 对应的 surge val
     *
     * @type {number}
     * @memberof IconCirlePulsing
     */
    val: number
    max: number
    min: number
    radius: number
    config: IIconPlusingOptions
    constructor(options: IIconPlusingOptions) {
        // Object.assign(this, { max: 10, min: 1, radius: 10 }, options)
        this.config = { ...iconPlusingDefaultOptions, ...options }
    }
    toHtml(): string {
        const that = this
        const iconBorderWidth = that.getPlusingIconRectangle()[0]
        const iconBorderHeight = that.getPlusingIconRectangle()[1]
        const iconPulsingWidth = that.getPlusingIconBorderRectangle()[0]
        const iconPulsingHeight = that.getPlusingIconBorderRectangle()[1]
        let divHtml = ''
        switch (true) {
            case this.config.iconType === IconTypeEnum.TY_PULSING_ICON:
                divHtml = `<div class="my-leaflet-pulsing-marker" >
            <div class="my-leaflet-icon-border ${this.getAlarmColor()}" style="width: ${iconBorderWidth}px;height:${iconBorderHeight}px;left:${
                    that.shiftX
                }px;top:${that.shiftY}px"></div>
            <div class="my-leaflet-pulsing-icon ${this.getAlarmColor()}" style="width: ${iconPulsingWidth}px;height:${iconPulsingHeight}px;"></div>
          </div>`
                break
            case this.config.iconType === IconTypeEnum.TY_PATH_ICON:
                // 台风路径示意点
                const cirleRadius = '12px'
                divHtml = `<div class="my-leaflet-pulsing-marker" >
                <div class="my-leaflet-icon-border orange}" style="width:${cirleRadius};height:${cirleRadius};left:${that.shiftX}px;top:${that.shiftY}px"></div>
                <div class="my-leaflet-pulsing-icon orange}" style="width: ${cirleRadius};height:${cirleRadius};"></div>
              </div>`
                break
        }

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
        const radiusMaxVal = 10
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
        const confficient = 1.8
        const width = confficient * (this.getPlusingIconAbsRadius() + this.shiftX)
        const height = confficient * (this.getPlusingIconAbsRadius() + this.shiftY)
        return [width, height]
    }

    getPlusingIconBorderAbsRadius(): number {
        // 半径的最大 px
        const radiusMaxVal = 16
        // 半径的最小 px
        // const radiusMinVal = 10
        const radiusMinVal = 8
        // 半径最大与最小的差值 px
        const radiusDiffVal = radiusMaxVal - radiusMinVal
        // 半径差值的绝对值
        const radiusDiffAbsVal = radiusDiffVal * this.getRadius()
        return radiusMinVal + radiusDiffAbsVal
    }

    getPlusingIconBorderRectangle(): number[] {
        const confficient = 1.5
        const width = confficient * this.getPlusingIconBorderAbsRadius()
        const height = confficient * this.getPlusingIconBorderAbsRadius()
        return [width, height]
    }

    private getAlarmColor(): string {
        // TODO:[-] 21-06-08 此处代码与 middle_model -> stations.ts -> IconFormMinStationSurgeMidModel -> getAlarmColor 重复
        const surge = this.config.val
        let colorStr = 'green'
        if (surge) {
            switch (true) {
                case surge <= 100:
                    colorStr = 'green'
                    break
                case surge <= 150:
                    colorStr = 'blue'
                    break
                case surge <= 200:
                    colorStr = 'yellow'
                    break
                case surge <= 250:
                    colorStr = 'orange'
                    break
                case surge > 250:
                    colorStr = 'red'
                    break
            }
        }

        return colorStr
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
            case surge <= 100:
                colorStr = 'green'
                break
            case surge <= 150:
                colorStr = 'blue'
                break
            case surge <= 200:
                colorStr = 'yellow'
                break
            case surge <= 250:
                colorStr = 'orange'
                break
            case surge > 250:
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
export { IconCirlePulsing, IconMinStationSurge, IconDetailedStationSurge, IconTyphoonCirlePulsing }
