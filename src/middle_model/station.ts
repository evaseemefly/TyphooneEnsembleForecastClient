/**
 * 实现方法 toHtml 类的接口
 *
 * @export
 * @interface IToHtml
 */
export interface IToHtml {
    toHtml(): string
    getClassName(): string
    getStationCode(): string
}

class IconFormDefaultMidModel implements IToHtml {
    toHtml(): string {
        throw new Error('Method not implemented.')
    }
    getClassName(): string {
        throw new Error('Method not implemented.')
    }
    getStationCode(): string {
        return ''
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
    stationCode: string
    max: number
    min: number
    surge: number
    constructor(stationName: string, stationCode: string, surge: number, max: number, min: number) {
        this.stationName = stationName
        this.stationCode = stationCode
        this.max = max
        this.min = min
        this.surge = surge
    }
    toHtml(): string {
        const divHtml = `<div id="my_station_surge_div">
        <div class="station-min-div-title">${this.stationName}</div>
        <div class="station-min-div-content">
          <div class="station-min-div-content-horizontal">
            <div class="station-min-div-content-field liner-cell-default">潮位</div>
            <div class="station-min-div-content-val ${this.getAlarmColor(this.surge)}">${
            this.surge
        }</div>
          </div>
          <div class="station-min-div-content-horizontal">
            <div class="station-min-div-content-field ${this.getAlarmColor(this.max)}">${
            this.max
        }</div>
            <div class="station-min-div-content-val ${this.getAlarmColor(this.min)}">${
            this.min
        }</div>
          </div>
        </div>
      </div>`
        return divHtml
    }
    getClassName(): string {
        return 'station-surge-icon-default'
    }
    getStationCode(): string {
        return this.stationCode
    }

    private getAlarmColor(val: number): string {
        const surge = val
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

class IconFormMinStationSurgeMidModel implements IToHtml {
    stationName: string
    stationCode: string
    surge: number
    productTypeStr: string
    constructor(stationName: string, stationCode: string, surge: number, productTypeStr = '潮位') {
        this.stationName = stationName
        this.stationCode = stationCode
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
    getStationCode(): string {
        return this.stationCode
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
