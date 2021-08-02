import * as L from 'leaflet'

/**
 * 从map中清除指定 layer
 *
 * @param {L.Map} map
 * @param {L.Layer} layer
 * @return {*}  {boolean}
 */
const clearRasterFromMap = (map: L.Map, layer: L.Layer): boolean => {
    let isOk = false
    try {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer)
            isOk = true
        }
    } catch (error) {
        console.warn(error)
    }
    return isOk
}

export { clearRasterFromMap }
