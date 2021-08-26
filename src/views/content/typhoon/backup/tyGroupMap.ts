// + 21-04-20 将 台风 list add to map
const loadTyphoonLine=(tyCode: string, tyTimestamp: string): void {
    const that = this
    const mymap: any = this.$refs.basemap['mapObject']
    // 1 从后台读取台风路径信息

    //2 将当前的typhoon_data中获取latlongs
    // 2-2 由于不同的集合路径需要使用不同的颜色区分，此处使用 scale 动态生成，目前只是针对编号进行颜色的过渡依据
    const tyGroupListCount = this.tyGroupLineList.length
    let indexTyGroup = 0
    const polyScaleColor = new TyGroupPathScaleColor(0, tyGroupListCount)
    polyScaleColor.setScale('Viridis')
    // galeRadius sCaleColor
    const galeRadiusScaleColor = new ScaleColor(
        that.tyGroupGaleRadiusRange.min,
        that.tyGroupGaleRadiusRange.max
    )
    let forecastDtStart: Date = undefined
    galeRadiusScaleColor.setScale('Viridis')

    // TODO:[-] 21-05-12 新加入的 对 tyGroupLineList 重新进行排序
    // 此处的排序提取在 this.sortTyGroupLineList ,以下暂时注释掉
    // this.tyGroupLineList = this.tyGroupLineList.sort(
    //     (a, b) => a.tyPathMarking - b.tyPathMarking
    // )
    this.sortTyGroupLineList()

    this.tyGroupLineList.map((temp) => {
        indexTyGroup++
        const polygonPoint: L.LatLng[] = []
        const cirleScaleColor = new ScaleColor(0, temp.listRealdata.length)
        cirleScaleColor.setScale('Viridis')
        let indexDate = 0
        const cirleLayers: L.Layer[] = []

        temp.listRealdata.forEach((tempRealdata) => {
            indexDate++
            const typhoonStatus = new TyphoonCircleStatus(
                tempRealdata.galeRadius,
                tempRealdata.bp,
                tempRealdata.forecastDt,
                tempRealdata.lat,
                tempRealdata.lon
            )
            polygonPoint.push(new L.LatLng(tempRealdata.lat, tempRealdata.lon))
            // TODO:[-] 21-05-12 此处加入判断，对于 非中心路径不做 circle 的 push操作
            // 注意! 还需要加入bp==0的判断条件
            if (temp.tyPathType === 'c' && temp.tyPathMarking === 0 && temp.bp === 0) {
                const circleTemp = L.circle(new L.LatLng(tempRealdata.lat, tempRealdata.lon), {
                    color: cirleScaleColor.getColor(indexDate),
                    // radius: 20
                    weight: typhoonStatus.getWeight(),
                    customData: typhoonStatus,
                    radius: typhoonStatus.getWeight() * RADIUSUNIT,
                    // radius: typhoonStatus.getWeight(),
                    fill: true,
                    fillOpacity: 0.7,
                    //weight: tempTyGroup.radius,
                    opacity: 0.7
                })
                // 获取第一个时间作为 预报的起始时间
                if (indexDate === 1) {
                    forecastDtStart = tempRealdata.forecastDt
                }
                // 根据传入的 时间 index 返回当前 dateIndex 对应的 大风概率半径
                const tempProPathRadius: number = that.getTyProPathRadius(indexDate)
                if (tempProPathRadius !== 0) {
                    that.tyGroupProPathCircles.push({
                        lat: tempRealdata.lat,
                        lon: tempRealdata.lon,
                        radius: tempProPathRadius
                    })
                }
                // + 21-04-21 添加鼠标移入 circle 显示大风半径的功能
                circleTemp.on('mouseover', (e: any) => {
                    // console.log(e.target)
                    // 对于移入的 circle 先进行加粗突出显示
                    const layer = e.target
                    layer.setStyle({
                        opacity: 1
                        // weight: layer.options.weight * 1.25
                        // radius:
                    })
                    const customData: { bp: number; radius: number } =
                        e.target.options.customData
                    // 获取半径
                    const targetRadius = customData.radius
                    const coords: L.LatLng = e.latlng
                    /*
                    大体逻辑:
                        -1 根据当前传入的 circle index 找到对应 group -> realdata
                        -2 根据对应的 realdata 获取当前的 radius
                        -3 根据经纬度画圆
                    */
                    // radius 单位为 m ，需要乘以系数 1000m = 1km 为基本单位
                    const radiusUnit = 1000
                    that.currentGaleRadius = L.circle(coords, {
                        radius: targetRadius * radiusUnit,
                        fillColor: galeRadiusScaleColor.getColor(targetRadius),
                        color: galeRadiusScaleColor.getColor(targetRadius),
                        weight: 2,
                        fillOpacity: 0.5
                    }).addTo(mymap)
                    // + 21-04-22 鼠标移入当前 circle 显示该 divIcon
                    that.addTyphoonRealDataDiv2Map(typhoonStatus)
                })

                circleTemp.on('mouseout', (e) => {
                    // console.log(e)
                    const layer = e.target
                    layer.setStyle({
                        opacity: 0.7
                        // weight: layer.options.weight / 1.25
                    })
                    // TODO:[-] 21-05-31 此部分由 this.clearTyRealDataLayer 替代
                    // mymap.removeLayer(that.currentGaleRadius)
                    // // + 21-04-22 移除 当前的 tyDivIcon
                    // if (that.tyRealDataDivIcon) {
                    //     mymap.removeLayer(that.tyRealDataDivIcon)
                    // }
                    // that.currentGaleRadius = null
                    that.clearTyRealDataLayer()
                })
                // + 21-05-07 加入鼠标click 事件
                circleTemp.on('click', (e: any) => {
                    // e.target -> options -> customData
                    console.log(e.target)
                    // 点击向后台发送 获取逐时风暴增水场的请求
                    // 请求参数包含 ty_code | ty_timestamp | forecast_dt
                    const params: { forecastDt: Date } = e.target.options.customData
                    const fieldSurgeGeoLayer = new FieldSurgeGeoLayer({
                        tyCode: tyCode,
                        tyTimestamp: tyTimestamp,
                        forecastDt: params.forecastDt
                    })
                    if (that.fieldSurgeRasterLayer) {
                        mymap.removeLayer(that.fieldSurgeRasterLayer)
                        that.fieldSurgeRasterLayer = null
                    }
                    // ERROR：
                    //  'await' expressions are only allowed within async functions and at the top levels of modules.
                    fieldSurgeGeoLayer
                        .add2map(mymap, () => {})
                        .then((res) => {
                            console.log(res)
                            that.fieldSurgeRasterLayer = res
                        })
                })
                circleTemp.setStyle({ zIndexOffset: 19999 })
                cirleLayers.push(circleTemp)
            }
        })

        // 添加折线
        const polyColor = polyScaleColor.getColor(indexTyGroup)
        // 设置鼠标移入时触发的事件
        // 为当前 线段添加 自定义 data
        let groupPolyLine = L.polyline(polygonPoint, {
            color: polyColor,
            opacity: 0.2,
            fillOpacity: 0.2,
            weight: 3,
            customData: indexTyGroup
        })
        if (temp.tyPathType === 'c' && temp.tyPathMarking === 0 && temp.bp === 0) {
            // groupPolyLine.options['weight'] = 5
            groupPolyLine = L.polyline(polygonPoint, {
                color: polyColor,
                opacity: 1,
                weight: 6,
                fillOpacity: 1,
                customData: indexTyGroup,
                smoothFactor: 3
            })
            // TODO:[*] 21-05-13 尝试修改 zindex
            // 方式1:
            // groupPolyLine.setStyle({ zIndexOffset: 19999 })
            groupPolyLine.options['zIndexOffset'] = 19999
            // groupPolyLine.setZIndexOffset(19999)
        }
        // TODO:[-] 21-04-21 此处尝试将同一个 集合路径的 折线 + points 统一 add -> groupLayer
        // 目前看均无法设置 折线的 zindex
        if (temp.tyPathType === 'c' && temp.tyPathMarking === 0 && temp.bp === 0) {
            // groupPolyLine.setStyle({ zIndex: 9999 })
            // groupPolyLine.setStyle({ zIndexOffset: 9999 })
            groupPolyLine.addTo(mymap)
            // TODO:[-] 21-05-12 尝试只针对折线 修改其 zindex

            // .setZIndex(19999)
            // // .on('mouseover', (event: any) => {
            // //     console.log(event)
            // // })
            // .addTo(mymap)
            let tempLayer = L.layerGroup([...cirleLayers])
            tempLayer = tempLayer.setZIndex(9999)
            // tempLayer.setStyle({ zIndexOffset: 9999 })
            // TODO:[-] 21-08-26 暂时不在显示 台风风圈
            // tempLayer.addTo(mymap)
            console.log(tempLayer)
        } else {
            let tempLayer = L.layerGroup([...cirleLayers])
            tempLayer = tempLayer.setZIndex(2000)
            // TODO:[-] 21-08-26 暂时不在显示 台风风圈
            // tempLayer.addTo(mymap)
            groupPolyLine.addTo(mymap)
            // console.log(tempLayer)
        }

        // TODO:[-] + 21-05-31 只有 center 路径 cirleLayers.length > 0,将 center 路径赋值给 this.tyGroupCenterCirleLayers
        if (cirleLayers.length > 0) {
            that.tyGroupCenterCirleLayers = cirleLayers
        }
    })
    this.addTyGroupProPathCircles()
}