/**
 * 实现方法 toHtml 类的接口
 *
 * @export
 * @interface IToHtml
 */
export interface IToHtml {
    toHtml(): string
    getClassName(): string
}

class IconFormDefaultMidModel implements IToHtml {
    toHtml(): string {
        throw new Error('Method not implemented.')
    }
    getClassName(): string {
        throw new Error('Method not implemented.')
    }
}

/**
 * 潮位 详细 form icon
 * 继承自 IToHtml
 *
 * @class IconFormStationDetialedMidModel
 * @implements {IToHtml}
 */
class IconFormStationDetialedMidModel implements IToHtml {
    stationName: string
    max: number
    min: number
    surge?: number
    constructor(stationName: string, surge: number, max: number, min: number) {
        this.stationName = stationName
        this.max = max
        this.min = min
        this.surge = surge
    }
    toHtml(): string {
        const divHtml = `<div id="my_station_surge_div">
        <div class="station-min-div-title green">${this.stationName}</div>
        <div class="station-min-div-content">
          <div class="station-min-div-content-horizontal">
            <div class="station-min-div-content-field green">潮位</div>
            <div class="station-min-div-content-val yellow">${this.surge}</div>
          </div>
          <div class="station-min-div-content-horizontal">
            <div class="station-min-div-content-field yellow">${this.max}</div>
            <div class="station-min-div-content-val red">${this.min}</div>
          </div>
        </div>
      </div>`
        return divHtml
    }
    getClassName(): string {
        return 'station-surge-icon-default'
    }
}

class IconFormMinStationSurgeMidModel implements IToHtml {
    stationName: string
    surge: number
    productTypeStr: string
    constructor(stationName: string, surge: number, productTypeStr = '潮位') {
        this.stationName = stationName
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
    getClassName(): string {
        return 'station-surge-icon-default'
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

export { IconFormStationDetialedMidModel, IconFormDefaultMidModel, IconFormMinStationSurgeMidModel }
