"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.TemporalGeoJSONLayer = void 0;
/*
    实现一次性加载 geojson 并以动态 color的方式展示
    源码详见:
    https://github.com/evaseemefly/leaflet-temporal-geojson
*/
var TemporalGeoJSONLayer = (L.Layer ? L.Layer : L.Class).extend({
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
    initialize: function (options) {
        L.setOptions(this, options);
    },
    /**
     * @param map {Object} Leaflet map
     */
    onAdd: function (map) {
        this._active = true;
        this._map = map;
        this._frameKey = null;
        if (!this.options.rendererFactory)
            this.options.rendererFactory = L.canvas;
        this._setPane();
        this._createFrames();
        if (this.options.onAdd)
            this.options.onAdd();
    },
    /**
     * Remove the pane from DOM, and void pane when layer removed from map
     */
    onRemove: function () {
        var currentFrame = this._frameLayers[this._frameKey];
        if (currentFrame)
            this._map.removeLayer(currentFrame);
        this._active = false;
        if (this.options.onRemove)
            this.options.onRemove();
    },
    /*------------------------------------ PUBLIC ------------------------------------------*/
    /**
     * check if the particle layer is currently active on the map
     * @returns {boolean}
     */
    isActive: function () {
        return this._active;
    },
    /**
     * Get the current frame key
     * @returns {string} the keyframe time
     */
    getFrame: function () {
        if (!this.isActive())
            return -1;
        return this._frameKey;
    },
    /**
     * Get ascending array of available frame keys
     * @returns {array} the keyframe time ISO strings
     */
    getFrameKeys: function () {
        return this._times.slice();
    },
    /**
     * Display the frame at the given frame key
     * @param key {string} the keyframe time
     */
    setFrame: function (key) {
        if (!this.isActive())
            return;
        // clear existing
        var prevFrame = this._frameLayers[this._frameKey];
        if (prevFrame)
            this._map.removeLayer(prevFrame);
        // set new if we have target
        this._frameKey = key;
        var nextFrame = this._frameLayers[this._frameKey];
        if (nextFrame)
            this._map.addLayer(nextFrame);
    },
    /**
     * Changes styles of GeoJSON vector layers with the given style function
     * @param {function} style
     */
    setStyle: function (style) {
        var _this = this;
        // clear any current keyframe
        var staleFrame = this._frameLayers[this._frameKey];
        if (staleFrame)
            this._map.removeLayer(staleFrame);
        // use default style if none provided
        if (!style)
            style = function (feature) {
                return _this._defaultStyle;
            };
        // re-init each frame with style
        this._times.forEach(function (time) {
            var slicedFeatures = _this.options.features.filter(function (f) { return f.properties[_this.options.timeKey] === time; });
            var featureCollection = { type: 'FeatureCollection', features: slicedFeatures };
            var layer = _this._createFrameLayer(featureCollection, _this._renderer, style);
            _this._frameLayers[time] = layer;
        });
        // restore frame with new style
        if (staleFrame)
            this.setFrame(this._frameKey);
    },
    /**
     * Returns L.latLngBounds at the supplied time,
     * if time omited, it returns bounds of the **current** keyframe layer,
     * and if no frame is active - returns bounds of the **first** keyframe
     */
    getBounds: function (time) {
        if (time === undefined && this._frameKey) {
            time = this._frameKey;
        }
        else if (index === undefined) {
            time = this._times[0];
        }
        var layer = this._frameLayers[time];
        return layer.getBounds();
    },
    /*------------------------------------ PRIVATE ------------------------------------------*/
    /**
     * Build keyframes from geojson features.
     */
    _createFrames: function () {
        var _this = this;
        var features = this.options.features;
        // get sorted list of dates
        var dates = features
            .map(function (f) { return new Date(f.properties[_this.options.timeKey]); })
            .sort(function (a, b) { return a - b; });
        // uniq list of ISO strings
        this._times = __spreadArrays(new Set(dates.map(function (d) { return d.toISOString(); })));
        this._frameLayers = {};
        this._renderer = this.options.rendererFactory({ pane: this._paneName });
        var that = this;
        this._times.forEach(function (time) {
            var slicedFeatures = features.filter(function (f) { return f.properties[_this.options.timeKey] === time; });
            var featureCollection = { type: 'FeatureCollection', features: slicedFeatures };
            var style = function () {
                return that._defaultStyle;
            };
            if (that.options.style)
                style = that.options.style;
            var layer = _this._createFrameLayer(featureCollection, _this._renderer, style);
            _this._frameLayers[time] = layer;
        });
    },
    /**
     * Create a L.geoJSON layer for the keyframe
     * @param {object} featureCollection
     * @param {object} renderer - L.renderer
     * @param {function} style
     */
    _createFrameLayer: function (featureCollection, renderer, style) {
        var circleMarkerOptions = this.options.circleMarkerOptions || {};
        circleMarkerOptions.renderer = renderer;
        var frameLayer = L.geoJSON(featureCollection, {
            pointToLayer: function (geoJsonPoint, latlng) {
                return L.circleMarker(latlng, circleMarkerOptions);
            },
            style: style,
            renderer: renderer
        });
        if (this.options.popupFunction)
            frameLayer.bindPopup(this.options.popupFunction);
        return frameLayer;
    },
    /**
     * Create custom pane if necessary
     * @private
     */
    _setPane: function () {
        // determine where to add the layer
        this._paneName = this.options.paneName || 'overlayPane';
        // fall back to overlayPane for leaflet < 1
        var pane = this._map._panes.overlayPane;
        if (this._map.getPane) {
            // attempt to get pane first to preserve parent (createPane voids this)
            pane = this._map.getPane(this._paneName);
            if (!pane) {
                pane = this._map.createPane(this._paneName);
            }
        }
        this._pane = pane;
    },
    /**
     * Deep merge Objects,
     * Note that destination arrays will be overwritten where they exist in source.
     * @param destination
     * @param source
     * @returns {*}
     */
    _extendObject: function (destination, source) {
        var self = this;
        for (var property in source) {
            // .constructor avoids tripping over prototypes etc.
            // don't traverse the data..
            if (property === 'data') {
                destination[property] = source[property];
            }
            else if (source[property] &&
                source[property].constructor &&
                source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                self._extendObject(destination[property], source[property]);
            }
            else {
                destination[property] = source[property];
            }
        }
        return destination;
    }
});
exports.TemporalGeoJSONLayer = TemporalGeoJSONLayer;
L.temporalGeoJSONLayer = function (options) {
    return new TemporalGeoJSONLayer(options);
};
exports["default"] = L.temporalGeoJSONLayer;
