/*
    21-03-06 + 新加入的 加载 wfs 服务的相关操作
    @author: evaseemefly
*/
import { Component, Vue } from 'vue-property-decorator'
import * as L from 'leaflet'
import chroma from 'chroma-js'
import { loadGridGeoJson, loadPolyGeoJson } from '@/api/geoserver'
import { ScaleColor } from '@/common/scaleColor'
@Component
class WFSMixin extends Vue {
    /**
     *TODO:[*] 21-03-05 新加入的加载 geoserver 发布的 wfs 服务 to geojson
                        部分功能参考: https://leafletjs.com/examples/choropleth/
     *
     * @memberof WFSMixin
     */
    gridMaxVal = 0
    gridMinVal = 0
    // gridFilterRange = 0
    gridScale: any
    // 加入的测试过滤格点范围
    filterGridCoord: { lat: number; lon: number } = { lat: 21.964, lon: 118.3418 }
    filterRange = 0.8
    loadGridWFS(map: L.Map) {
        const that = this
        loadGridGeoJson('SearchRescue:020Grid_TEST_EWT_DIFF').then((res) => {
            if (res.status === 200) {
                // console.log(res)
                // features
                /*
                    1. geometry: {type: "MultiPolygon", coordinates: Array(1)}
                    2. geometry_name: "the_geom"
                    3. id: "020Grid_TEST_EWT_DIFF.1"
                    4. properties:
                        1. bottom: 10.979733315999997
                        2. id: 156
                        3. left: 103.117235198
                        4. right: 103.317235198
                        5. top: 11.179733315999997
                        6. __proto__: Object
                    type: "Feature"
                */
                // 手动添加一组随机数
                // res.data.features.forEach((feature) => {
                //     if (
                //         that.checkBoundRange(
                //             that.filterGridCoord,
                //             that.filterRange,
                //             feature.properties
                //         )
                //     ) {
                //         // feature['val'] = that.getRandom(0, 0)
                //         feature['val'] = 0.5
                //     } else {
                //         // feature['val'] = 0.1
                //     }
                // })
                // 获取最大值和最小值
                // that.gridMaxVal = Math.max.apply(
                //     Math,
                //     res.data.features.map((feature) => {
                //         return feature.val
                //     })
                // )
                // that.gridMinVal = Math.min.apply(
                //     Math,
                //     res.data.features.map((feature) => {
                //         return feature.val
                //     })
                // )
                // TODO:[-] 21-03-09 暂时不用加载后端发布的 geojson 获取 max 与 min
                that.gridMinVal = 0
                that.gridMaxVal = 1
                that.filterRange = that.gridMaxVal - that.gridMinVal
                // that.gridScale = chroma.scale('Viridis')
                that.gridScale = chroma.scale(['yellow', 'navy']).mode('lch')

                const layer = L.geoJSON(res.data, {
                    style: that.getStyle,
                    onEachFeature: that.onEachFeature
                })
                layer.addTo(map)
            }
        })
    }

    loadPolyWFS(map: L.Map) {
        const that = this
        loadPolyGeoJson('test_shaped_contour_10_level_01', new Date(2020, 11, 30, 8, 0)).then(
            (res) => {
                /*
            res.data.features[0]
            {type: "Feature", id: "shaped_contour.1", geometry: {…}, geometry_name: "the_geom", properties: {…}}
                geometry:
                coordinates: Array(1)
                0: [Array(118)]
                length: 1
                __proto__: Array(0)
                type: "MultiPolygon"
                __proto__: Object
                geometry_name: "the_geom"
                id: "shaped_contour.1"
                properties: {z: 2.5}
                type: "Feature"
                __proto__: Object
            */
                if (res.status === 200) {
                    const layer = L.geoJSON(res.data, { style: that.getPolyStyle })
                    layer.addTo(map)
                }
            }
        )
    }

    // palette(min, max):any {
    //     const d = (max-min)/9;
    //     return = scaleThreshold()
    //         .range(['#00429d', '#4771b2', '#73a2c6', '#a5d5d8', '#ffffe0', '#ffbcaf', '#f4777f', '#cf3759', '#93003a'])
    //         .domain([min + d*1,min + d*2,min + d*3,min + d*4,min + d*5,min + d*6,min + d*7,min + d*8]);
    // }
    // getPolyStyle(feature: any): { color: string; fillColor: string } {
    //     let style: { color: string; fillColor: string } = null
    //     const scaleColor: ScaleColor = new ScaleColor(0, 12.5)
    //     scaleColor.setScale()
    //     const color25 = scaleColor.getColor(2.5)
    //     const color50 = scaleColor.getColor(5)
    //     const color75 = scaleColor.getColor(7.5)
    //     const color100 = scaleColor.getColor(10)
    //     const color125 = scaleColor.getColor(12.5)
    //     switch (feature.properties.z) {
    //         case 2.5:
    //             style = { color: color25, weight: 1, fillOpacity: 0.7, fillColor: color25 }
    //             break
    //         case 5:
    //             style = { color: color50, weight: 1, fillOpacity: 0.7, fillColor: color50 }
    //             break
    //         case 7.5:
    //             style = { color: color75, weight: 1, fillOpacity: 0.7, fillColor: color75 }
    //             break
    //         case 10:
    //             style = { color: color100, weight: 1, fillOpacity: 0.7, fillColor: color100 }
    //             break
    //         case 12.5:
    //             style = { color: color125, weight: 1, fillOpacity: 0.7, fillColor: color125 }
    //             break
    //     }
    //     return style
    // }

    getPolyStyle(feature: any): { color: string; fillColor: string } {
        let style: { color: string } = null
        const scaleColor: ScaleColor = new ScaleColor(0, 13.5)
        scaleColor.setScale()
        const color15 = scaleColor.getColor(1.5)
        const color30 = scaleColor.getColor(3)
        const color45 = scaleColor.getColor(4.5)
        const color60 = scaleColor.getColor(6)
        const color75 = scaleColor.getColor(7.5)
        const color90 = scaleColor.getColor(9)
        const color105 = scaleColor.getColor(10.5)
        const color120 = scaleColor.getColor(12)
        const color135 = scaleColor.getColor(13.5)
        const featureBaseStyle = {
            fillOpacity: 0.7,
            stroke: false,
            weight: 0.1,
            lineJoin: 'miter',
            lineCap: 'miter'
        }
        style = featureBaseStyle
        switch (feature.properties.z) {
            case 1.5:
                style['color'] = '#153C83'
                break
            case 3:
                style['color'] = '#4199E2'
                break
            case 4.5:
                style['color'] = '#F0DC62'
                break
            case 6:
                style['color'] = '#F0DC62'
                break
            case 7.5:
                style['color'] = '#DD8839'
                break
            case 9:
                style['color'] = '#F22015'
                break
            case 10.5:
                style['color'] = '#F22015'
                break
            case 12:
                style['color'] = '#C40E0F'
                break
            case 13.5:
                style['color'] = '#C40E0F'
                break
        }
        return style
    }

    getRandom(max: number, min: number): number {
        return Math.random()
    }
    getStyle(val: { val: number }) {
        /*
        {type: "Feature", id: "020Grid_TEST_EWT_DIFF.1", geometry: {…}, geometry_name: "the_geom", properties: {…}, …}
geometry: {type: "MultiPolygon", coordinates: Array(1)}
            geometry_name: "the_geom"
            id: "020Grid_TEST_EWT_DIFF.1"
            properties: {id: 156, left: 103.117235198, top: 11.179733315999997, right: 103.317235198, bottom: 10.979733315999997}
            type: "Feature"
            val: 0.8304777386882245
            __proto__: Object
        */
        const that = this
        return {
            fillColor: that.getColor(val.val),
            weight: 2,
            opacity: 0.9,
            color: '#16a085',
            dashArray: '3',
            fillOpacity: 0.7
        }
    }
    getColor(pixelValue: number): string {
        const max = this.gridMaxVal
        const min = this.gridMinVal
        // const range = this.range
        const scale = this.gridScale
        if (pixelValue === 0 || Number.isNaN(pixelValue)) return '#7f8c8d'

        // scale to 0 - 1 used by chroma
        const scaledPixelValue = (pixelValue - min) / (max - min)

        const color = scale(scaledPixelValue).hex()

        return color
    }
    setHighLightFeature(e): void {
        const layer: L.Layer = e.target
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        })
    }
    onEachFeature(feature, layer: L.Layer) {
        const that = this
        layer.on({
            // mouseover: that.setHighLightFeature
            // mouseout: resetHighlight,
            // click: zoomToFeature
        })
    }

    checkBoundRange(
        gridCoord: { lat: number; lon: number },
        range: number,
        bound: { bottom: number; left: number; right: number; top: number }
    ): boolean {
        let isOk = false
        // 根据 bound 计算出当前的格点的中心位置
        /*
            {id: 158, left: 103.117235198, top: 10.779733315999994, right: 103.317235198, bottom: 10.579733315999995}
            bottom: 10.579733315999995
            id: 158
            left: 103.117235198
            right: 103.317235198
            top: 10.779733315999994
            __proto__: Object
        */
        const latRadius: number = (bound.top - bound.bottom) / 2
        const lonRadius: number = (bound.right - bound.left) / 2
        const centerCoord: { lat: number; lon: number } = {
            lat: bound.top - latRadius,
            lon: bound.right - lonRadius
        }
        if (
            centerCoord.lat < gridCoord.lat + range / 2 &&
            centerCoord.lat > gridCoord.lat - range / 2 &&
            centerCoord.lon < gridCoord.lon + range / 2 &&
            centerCoord.lon > gridCoord.lon - range / 2
        ) {
            isOk = true
        }

        return isOk
    }

    // resetHighlight(e) {
    //     geojson.resetStyle(e.target)
    // }
}

export { WFSMixin }
