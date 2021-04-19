class CustomerMarker {
    public name: string
    public color: string
    constructor(name = 'default', color = 'red') {
        this.name = name
        this.color = color
    }
    toHtml(): string {
        const htmlStr = `
        <div class="my-leaflet-pulsing-marker">
        <div class="my-leaflet-icon-border"></div>
        <div class="my-leaflet-pulsing-icon"></div>
      </div>
        `
        return htmlStr
    }
}

class CustomerGisFormMarker {
    private defaultNum = 0
    public name: string
    public color: string
    public latlon: number[] = []

    constructor(latlon: number[], name = 'default', color = 'red') {
        this.name = name
        this.color = color
        this.latlon = latlon
    }

    /**
     * 纬度
     *
     * @returns {number}
     * @memberof CustomerGisFormMarker
     */
    lat(): number {
        return this.latlon[0] ? this.latlon[0] : this.defaultNum
    }

    /**
     * 经度
     *
     * @returns {number}
     * @memberof CustomerGisFormMarker
     */
    lon(): number {
        return this.latlon[1] ? this.latlon[1] : this.defaultNum
    }

    /**
     * 返回一个需要插入的 html 段
     *
     * @returns {string}
     * @memberof CustomerGisFormMarker
     */
    toHtml(): string {
        const htmlStr = `
        <div class="card box-shadow my-gis-form-marker">
        <div class="card-header">
            <span>当前位置</span>
            <div class="gis-form-circle fa fa-location-arrow"></div>
        </div>
        <div class="card-body">
          <div class="row row_footer">
            <div class="gis-form-footer">
              <div class="columnar">
                <div class="subitem_top">${this.lat()}</div>
                <div class="subitem_foot">维度</div>
              </div>
              <div class="columnar">
                <div class="subitem_top">${this.lon()}</div>
                <div class="subitem_foot">经度</div>
              </div>
            </div>
          </div>
        </div>
      </div>
        `
        return htmlStr
    }
}

export { CustomerGisFormMarker, CustomerMarker }
