/*
    实现一次性加载 geojson 并以动态 color的方式展示
    源码详见:
    https://github.com/evaseemefly/leaflet-temporal-geojson
*/
const TemporalGeoJSONLayer = (L.Layer ? L.Layer : L.Class).extend({
    /*------------------------------------ LEAFLET SPECIFIC ------------------------------------------*/

    _active: false,
    _map: null,
    _renderer: null,
    // the DOM leaflet-pane that contains our layer
    _pane: null,
    _paneName: 'overlayPane',

    // just inherit leaflet defaults?
    _defaultStyle: {},

    // user options
    options: {
        features: [],
        frameKey: null
    },

    initialize: function(options) {
        L.setOptions(this, options)
    },

    /**
     * @param map {Object} Leaflet map
     */
    onAdd: function(map) {
        this._active = true
        this._map = map
        this._frameKey = null
        if (!this.options.rendererFactory) this.options.rendererFactory = L.canvas
        this._setPane()
        this._createFrames()
        if (this.options.onAdd) this.options.onAdd()
    },

    /**
     * Remove the pane from DOM, and void pane when layer removed from map
     */
    onRemove() {
        const currentFrame = this._frameLayers[this._frameKey]
        if (currentFrame) this._map.removeLayer(currentFrame)
        this._active = false
        if (this.options.onRemove) this.options.onRemove()
    },

    /*------------------------------------ PUBLIC ------------------------------------------*/

    /**
     * check if the particle layer is currently active on the map
     * @returns {boolean}
     */
    isActive() {
        return this._active
    },

    /**
     * Get the current frame key
     * @returns {string} the keyframe time
     */
    getFrame() {
        if (!this.isActive()) return -1
        return this._frameKey
    },

    /**
     * Get ascending array of available frame keys
     * @returns {array} the keyframe time ISO strings
     */
    getFrameKeys() {
        return this._times.slice()
    },

    /**
     * Display the frame at the given frame key
     * @param key {string} the keyframe time
     */
    setFrame(key: string, features: [] = []) {
        // key: "2021-01-16T06:00:00.000Z"
        if (!this.isActive()) return

        // clear existing
        const prevFrame = this._frameLayers[this._frameKey]
        if (prevFrame) this._map.removeLayer(prevFrame)
        // 由于已经修改了由之前的一次性加载 全时间段的 散点改为按照时间切片进行加载，此处改为，若不存在指定 frameKey ,则添加新的 frameKey("2021-01-16T06:00:00.000Z")
        // 添加 新的 key，并去重
        // 若新传入的 key 不在当前的 frameKeys 中，且 features 有内容 ,len >0
        if (this.getFrameKeys().indexOf(key) < 0 && features.length > 0) {
            this._times = [new Set([...this._times, key])]
            this._insertFrame(key, features)
        }

        // set new if we have target
        this._frameKey = key
        const nextFrame = this._frameLayers[this._frameKey]
        if (nextFrame) this._map.addLayer(nextFrame)
    },

    /**
     * + 21-01-26 新添加的手动根据 指定 key 添加对应的 features 集合
     *
     * @param {string} key 时间 str | eg: "2021-01-16T06:00:00.000Z"
     * @param {{type:string,features:[]}} featureCollection
     */
    _insertFrame(key: string, featureCollection: { type: string; features: [] }) {
        const that = this
        let style = () => {
            return that._defaultStyle
        }
        if (that.options.style) style = that.options.style

        const layer = this._createFrameLayer(featureCollection, this._renderer, style)
        this._frameLayers[key] = layer
    },

    /**
     * Changes styles of GeoJSON vector layers with the given style function
     * @param {function} style
     */
    setStyle(style) {
        // clear any current keyframe
        const staleFrame = this._frameLayers[this._frameKey]
        if (staleFrame) this._map.removeLayer(staleFrame)

        // use default style if none provided
        if (!style)
            style = (feature) => {
                return this._defaultStyle
            }

        // re-init each frame with style
        this._times.forEach((time) => {
            const slicedFeatures = this.options.features.filter(
                (f) => f.properties[this.options.timeKey] === time
            )
            const featureCollection = { type: 'FeatureCollection', features: slicedFeatures }
            const layer = this._createFrameLayer(featureCollection, this._renderer, style)
            this._frameLayers[time] = layer
        })

        // restore frame with new style
        if (staleFrame) this.setFrame(this._frameKey)
    },

    /**
     * Returns L.latLngBounds at the supplied time,
     * if time omited, it returns bounds of the **current** keyframe layer,
     * and if no frame is active - returns bounds of the **first** keyframe
     */
    getBounds(time) {
        if (time === undefined && this._frameKey) {
            time = this._frameKey
        } else if (index === undefined) {
            time = this._times[0]
        }
        const layer = this._frameLayers[time]
        return layer.getBounds()
    },

    /*------------------------------------ PRIVATE ------------------------------------------*/

    /**
     * Build keyframes from geojson features.
     */
    _createFrames() {
        const features = this.options.features

        // get sorted list of dates
        const dates = features
            .map((f) => new Date(f.properties[this.options.timeKey]))
            .sort((a, b) => a - b)

        // uniq list of ISO strings
        // TODO:[-] 21-01-26 查看一下 Set ，去重
        this._times = [...new Set(dates.map((d) => d.toISOString()))]
        this._frameLayers = {}
        this._renderer = this.options.rendererFactory({ pane: this._paneName })

        const that = this
        this._times.forEach((time) => {
            const slicedFeatures = features.filter(
                (f) => f.properties[this.options.timeKey] === time
            )
            const featureCollection = { type: 'FeatureCollection', features: slicedFeatures }
            let style = () => {
                return that._defaultStyle
            }
            if (that.options.style) style = that.options.style

            const layer = this._createFrameLayer(featureCollection, this._renderer, style)
            this._frameLayers[time] = layer
        })
    },

    /**
     * Create a L.geoJSON layer for the keyframe
     * @param {object} featureCollection
     * @param {object} renderer - L.renderer
     * @param {function} style
     */
    _createFrameLayer(featureCollection, renderer, style) {
        const circleMarkerOptions = this.options.circleMarkerOptions || {}
        circleMarkerOptions.renderer = renderer

        const frameLayer = L.geoJSON(featureCollection, {
            pointToLayer(geoJsonPoint, latlng) {
                return L.circleMarker(latlng, circleMarkerOptions)
            },
            style,
            renderer
        })

        if (this.options.popupFunction) frameLayer.bindPopup(this.options.popupFunction)
        return frameLayer
    },

    /**
     * Create custom pane if necessary
     * @private
     */
    _setPane() {
        // determine where to add the layer
        this._paneName = this.options.paneName || 'overlayPane'

        // fall back to overlayPane for leaflet < 1
        let pane = this._map._panes.overlayPane
        if (this._map.getPane) {
            // attempt to get pane first to preserve parent (createPane voids this)
            pane = this._map.getPane(this._paneName)
            if (!pane) {
                pane = this._map.createPane(this._paneName)
            }
        }

        this._pane = pane
    },

    /**
     * Deep merge Objects,
     * Note that destination arrays will be overwritten where they exist in source.
     * @param destination
     * @param source
     * @returns {*}
     */
    _extendObject(destination, source) {
        const self = this
        for (const property in source) {
            // .constructor avoids tripping over prototypes etc.
            // don't traverse the data..
            if (property === 'data') {
                destination[property] = source[property]
            } else if (
                source[property] &&
                source[property].constructor &&
                source[property].constructor === Object
            ) {
                destination[property] = destination[property] || {}
                self._extendObject(destination[property], source[property])
            } else {
                destination[property] = source[property]
            }
        }
        return destination
    }
})

L.temporalGeoJSONLayer = function(options) {
    return new TemporalGeoJSONLayer(options)
}

export default L.temporalGeoJSONLayer
export { TemporalGeoJSONLayer }
