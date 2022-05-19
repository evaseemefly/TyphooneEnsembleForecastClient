import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { IPolyLine } from '@/views/content/typhoon/types'
@Component
class MapMixin extends Vue {
    // 123,105;26,15
    // 预报南区的范围
    SouthAreaPolyLine: IPolyLine = {
        latlngs: [
            [15.0, 105.0],
            [15.0, 123.0],
            [26.0, 123.0],
            [26, 105.0],
            [15.0, 105.0]
        ],
        style: {
            stroke: true,
            opacity: 0.7,
            color: '#f39c12'
        }
    }

    EastAreaPolyLine: IPolyLine = {
        latlngs: [
            [19.0, 110.0],
            [19.0, 129.0],
            [31.0, 129.0],
            [31.0, 110.0],
            [19.0, 110.0]
        ],
        style: {
            stroke: true,
            opacity: 0.7,
            color: '#2ecc71'
        }
    }

    NorthAreaPolyLine: IPolyLine = {
        latlngs: [
            [24.0, 117.0],
            [24.0, 129.0],
            [41.0, 129.0],
            [41.0, 117.0],
            [24.0, 117.0]
        ],
        style: {
            stroke: true,
            opacity: 0.7,
            color: '#e74c3c'
        }
    }

    get getPolyLines(): IPolyLine[] {
        return [this.SouthAreaPolyLine, this.EastAreaPolyLine, this.NorthAreaPolyLine]
    }

    /**
     *根据 leaflet_id -> map.removce(layer)
     *
     * @param {number} id
     * @memberof MapMixin
     */
    clearLayerById(id: number): void {
        const mymap: L.Map = this.$refs.basemap['mapObject']
        if (mymap) {
            mymap.eachLayer((layer: L.Layer) => {
                if (layer._leaflet_id === id) {
                    mymap.removeLayer(layer)
                }
            })
        }
    }
}

export { MapMixin }
