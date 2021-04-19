// 本插件来自 http://eJuke.github.io/Leaflet.Canvas-Markers

/*
RBush是用于点和矩形的2D 空间索引的高性能JavaScript库。
它基于具有批量插入支持的优化R树数据结构。
空间索引是用于点和矩形的特殊数据结构，它使您可以高效地执行查询，例如“边界框内的所有项目”（例如，比遍历所有项目快数百倍）。
它最常用于地图和数据可视化中。
 git地址:https://github.com/mourner/rbush
*/
const Rbush = require('rbush')

/* global L */

const CanvasMarkerLayer = (L.Layer ? L.Layer : L.Class).extend({
    // Add event listeners to initialized section.
    initialize: function(options) {
        L.setOptions(this, options)
        this._onClickListeners = []
        this._onHoverListeners = []
    },

    setOptions: function(options) {
        L.setOptions(this, options)
        return this.redraw()
    },

    redraw: function() {
        this._redraw(true)
    },

    // Multiple layers at a time for rBush performance
    addMarkers: function(markers) {
        const self = this
        const tmpMark = []
        const tmpLatLng = []

        markers.forEach(function(marker) {
            if (!(marker.options.pane === 'markerPane' && marker.options.icon)) {
                console.error('Layer isn\'t a marker')
                return
            }

            const latlng = marker.getLatLng()
            const isDisplaying = self._map.getBounds().contains(latlng)
            const s = self._addMarker(marker, latlng, isDisplaying)

            // Only add to Point Lookup if we are on map
            if (isDisplaying === true) tmpMark.push(s[0])

            tmpLatLng.push(s[1])
        })

        self._markers.load(tmpMark)
        self._latlngMarkers.load(tmpLatLng)
    },

    // Adds single layer at a time. Less efficient for rBush
    addMarker: function(marker) {
        const self = this
        const latlng = marker.getLatLng()
        const isDisplaying = self._map.getBounds().contains(latlng)
        const dat = self._addMarker(marker, latlng, isDisplaying)

        // Only add to Point Lookup if we are on map
        if (isDisplaying === true) self._markers.insert(dat[0])

        self._latlngMarkers.insert(dat[1])
    },

    addLayer: function(layer) {
        if (layer.options.pane === 'markerPane' && layer.options.icon) this.addMarker(layer)
        else console.error('Layer isn\'t a marker')
    },

    addLayers: function(layers) {
        this.addMarkers(layers)
    },

    removeLayer: function(layer) {
        this.removeMarker(layer, true)
    },

    removeMarker: function(marker, redraw) {
        const self = this

        // If we are removed point
        if (marker['minX']) marker = marker.data

        const latlng = marker.getLatLng()
        const isDisplaying = self._map.getBounds().contains(latlng)

        const markerData = {
            minX: latlng.lng,
            minY: latlng.lat,
            maxX: latlng.lng,
            maxY: latlng.lat,
            data: marker
        }

        self._latlngMarkers.remove(markerData, function(a, b) {
            return a.data._leaflet_id === b.data._leaflet_id
        })

        self._latlngMarkers.total--
        self._latlngMarkers.dirty++

        if (isDisplaying === true && redraw === true) {
            self._redraw(true)
        }
    },

    onAdd: function(map) {
        this._map = map

        if (!this._canvas) this._initCanvas()

        if (this.options.pane) this.getPane().appendChild(this._canvas)
        else map._panes.overlayPane.appendChild(this._canvas)

        map.on('moveend', this._reset, this)
        map.on('resize', this._reset, this)

        map.on('click', this._executeListeners, this)
        map.on('mousemove', this._executeListeners, this)
    },

    onRemove: function(map) {
        if (this.options.pane) this.getPane().removeChild(this._canvas)
        else map.getPanes().overlayPane.removeChild(this._canvas)

        map.off('click', this._executeListeners, this)
        map.off('mousemove', this._executeListeners, this)

        map.off('moveend', this._reset, this)
        map.off('resize', this._reset, this)
    },

    addTo: function(map) {
        map.addLayer(this)
        return this
    },

    clearLayers: function() {
        this._latlngMarkers = null
        this._markers = null
        this._redraw(true)
    },

    _addMarker: function(marker, latlng, isDisplaying) {
        const self = this
        // Needed for pop-up & tooltip to work.
        marker._map = self._map

        // _markers contains Points of markers currently displaying on map
        // 相当于创建了一个 矩形
        if (!self._markers) self._markers = new Rbush()

        // _latlngMarkers contains Lat\Long coordinates of all markers in layer.
        if (!self._latlngMarkers) {
            self._latlngMarkers = new Rbush()
            self._latlngMarkers.dirty = 0
            self._latlngMarkers.total = 0
        }

        L.Util.stamp(marker)

        const pointPos = self._map.latLngToContainerPoint(latlng)
        const iconSize = marker.options.icon.options.iconSize

        const adjX = iconSize[0] / 2
        const adjY = iconSize[1] / 2
        const ret = [
            {
                minX: pointPos.x - adjX,
                minY: pointPos.y - adjY,
                maxX: pointPos.x + adjX,
                maxY: pointPos.y + adjY,
                data: marker
            },
            {
                minX: latlng.lng,
                minY: latlng.lat,
                maxX: latlng.lng,
                maxY: latlng.lat,
                data: marker
            }
        ]

        self._latlngMarkers.dirty++
        self._latlngMarkers.total++

        // Only draw if we are on map
        if (isDisplaying === true) self._drawMarker(marker, pointPos)

        return ret
    },

    _drawMarker: function(marker, pointPos) {
        const self = this

        if (!this._imageLookup) this._imageLookup = {}
        if (!pointPos) {
            pointPos = self._map.latLngToContainerPoint(marker.getLatLng())
        }

        // 注意此处支持用户自定义 一个绘制的 func 在 this.options.userDrawFunc 中定义
        if (this.options.userDrawFunc && typeof this.options.userDrawFunc === 'function') {
            const size = marker.options.icon.options.iconSize
            this.options.userDrawFunc(this, marker, pointPos, size)
        } else {
            self._drawIcon(marker, pointPos)
        }
    },

    _drawIcon: function(marker, pointPos) {
        const self = this
        const iconUrl = marker.options.icon.options.iconUrl

        if (marker.canvas_img) {
            self._drawImage(marker, pointPos)
        } else {
            if (self._imageLookup[iconUrl]) {
                // TODO: 此处无法处理传入的类型为: L.divIcon
                marker.canvas_img = self._imageLookup[iconUrl][0]

                if (self._imageLookup[iconUrl][1] === false) {
                    self._imageLookup[iconUrl][2].push([marker, pointPos])
                } else {
                    self._drawImage(marker, pointPos)
                }
            } else {
                // TODO: 此处创建了一个 Image 标签对象
                // 需要在其中定义style的话可以在此处进行
                // 创建了一个 HTMLImageElement 对象
                const i = new window.Image()
                // "/static/windbaricon/level5.png"
                i.src = iconUrl
                marker.canvas_img = i

                // Image,isLoaded,marker\pointPos ref
                self._imageLookup[iconUrl] = [i, false, [[marker, pointPos]]]

                i.onload = function() {
                    self._imageLookup[iconUrl][1] = true
                    self._imageLookup[iconUrl][2].forEach(function(e) {
                        self._drawImage(e[0], e[1])
                    })
                }
            }
        }
    },

    _drawImage: function(marker, pointPos) {
        const self = this
        const options = marker.options.icon.options

        // TODO: 20-09-16 我加入的旋转方向的尝试
        // 不能直接对 this._context 进行旋转
        // const ctx = canvas.getContext('2d')
        // this._context.rotate(45)

        // TODO: 20-09-16 marker.canvas_img 实际是一个 HTMLImageElement
        // HTMLImageElement -> HTMLElement
        // 可以通过 HTMLElement.style 去修改其样式
        // 注意此处的 style 是一个 CSSStyleDeclaration，不能直接为其赋值
        // marker.canvas_img.style = '-webkit-transform: rotate(30deg); -moz-transform:rotate(30deg);'
        // 这种方式貌似是只读的
        marker.canvas_img.style.offsetRotate = '45'
        // TODO: 目前看可以为 该 image 添加 style了，但是 canvas.drawImage 时却无法渲染 style，只能默认加载 img 的url 的图片
        // marker.canvas_img.style.setProperty('offsetRotate', '45')
        // marker.canvas_img.style.setProperty('color', 'yellow')
        // marker.canvas_img.style.setProperty('background-color', 'yellow')
        // --- 以上方式不可行，以下可行
        marker.canvas_img.style.setProperty('-webkit-transform', 'rotate(90deg)')
        marker.canvas_img.style.setProperty('transform;', 'rotate(90deg)')
        // marker.canvas_img.style.setProperty('-moz-transform', 'rotate(45)')
        // <img src="/static/windbaricon/level5.png" style="transform: rotate(90deg);">
        // console.log(marker.canvas_img)
        // this._context.save()
        // --- 以上暂时备注掉
        // 使用手动创建 Image 的方式
        const img = new Image()
        // 手动获取 marker 中传入的 iconUrl,貌似不可行，放弃
        const iconUrl = marker.options.icon.options.iconUrl
        img.src = iconUrl
        // ---
        // TODO:[-] 20-09-16 方法2, 将 canvas -> png -> add to canvas content
        // const tempCreateCanvas = document.createElement('canvas')
        // const ctx = tempCreateCanvas.getContext('2d')
        // const imgCreated = new Image()
        // imgCreated.setAttribute('crossOrigin', 'Anonymous')
        // imgCreated.src = '/static/windbaricon/level5.png'
        // imgCreated.onload = function() {
        //     ctx.rotate((Math.PI / 180) * 45)
        //     const drawImage = ctx.drawImage(img, 0, 0, 100, 100)
        //     // 将 drawimage -> image
        //     const pngImage = self._convertCanvasToImage(ctx)
        //     pngImage.onload = function() {
        //         // existCanvasCtx.drawImage(pngImage, 10, 10, 100, 100)
        //         self._context.drawImage(
        //             pngImage,
        //             pointPos.x - options.iconAnchor[0],
        //             pointPos.y - options.iconAnchor[1],
        //             options.iconSize[0],
        //             options.iconSize[1]
        //         )
        //     }
        // }

        // ---
        // 之前的备份
        this._context.drawImage(
            marker.canvas_img,
            pointPos.x - options.iconAnchor[0],
            pointPos.y - options.iconAnchor[1],
            options.iconSize[0],
            options.iconSize[1]
        )
        // 尝试以下对 上下文 对象进行旋转
        // this._context.rotate(60)
        // this._context.save()
    },

    // 根据传入的 canvas 上下文对象将 canvas -> png 并返回
    _convertCanvasToImage: function(tempCtx) {
        const image = new Image()
        // 出现错误: Uncaught DOMException: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.
        // 参考:https://www.jianshu.com/p/6fe06667b748
        image.src = tempCtx.canvas.toDataURL('image/png')
        return image
    },

    _reset: function() {
        const topLeft = this._map.containerPointToLayerPoint([0, 0])
        L.DomUtil.setPosition(this._canvas, topLeft)

        const size = this._map.getSize()

        this._canvas.width = size.x
        this._canvas.height = size.y

        this._redraw()
    },

    _redraw: function(clear) {
        const self = this

        if (clear) this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
        if (!this._map || !this._latlngMarkers) return

        let tmp = []

        // If we are 10% individual inserts\removals, reconstruct lookup for efficiency
        if (self._latlngMarkers.dirty / self._latlngMarkers.total >= 0.1) {
            self._latlngMarkers.all().forEach(function(e) {
                tmp.push(e)
            })

            self._latlngMarkers.clear()
            self._latlngMarkers.load(tmp)
            self._latlngMarkers.dirty = 0
            tmp = []
        }

        const mapBounds = self._map.getBounds()

        // Only re-draw what we are showing on the map.

        const mapBoxCoords = {
            minX: mapBounds.getWest(),
            minY: mapBounds.getSouth(),
            maxX: mapBounds.getEast(),
            maxY: mapBounds.getNorth()
        }

        self._latlngMarkers.search(mapBoxCoords).forEach(function(e) {
            // Readjust Point Map
            const pointPos = self._map.latLngToContainerPoint(e.data.getLatLng())

            const iconSize = e.data.options.icon.options.iconSize
            const adjX = iconSize[0] / 2
            const adjY = iconSize[1] / 2

            const newCoords = {
                minX: pointPos.x - adjX,
                minY: pointPos.y - adjY,
                maxX: pointPos.x + adjX,
                maxY: pointPos.y + adjY,
                data: e.data
            }

            tmp.push(newCoords)

            // Redraw points
            self._drawMarker(e.data, pointPos)
        })

        // Clear rBush & Bulk Load for performance
        this._markers.clear()
        this._markers.load(tmp)
    },

    // 初始化 canvas 画布，主要是创建一个 2d 的 canvas 上下文对象(CanvasRenderingContext2D)
    _initCanvas: function() {
        this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-icon-layer leaflet-layer')
        const originProp = L.DomUtil.testProp([
            'transformOrigin',
            'WebkitTransformOrigin',
            'msTransformOrigin'
        ])
        this._canvas.style[originProp] = '50% 50%'

        const size = this._map.getSize()
        this._canvas.width = size.x
        this._canvas.height = size.y

        this._context = this._canvas.getContext('2d')

        const animated = this._map.options.zoomAnimation && L.Browser.any3d
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'))
    },

    addOnClickListener: function(listener) {
        this._onClickListeners.push(listener)
    },

    addOnHoverListener: function(listener) {
        this._onHoverListeners.push(listener)
    },

    _executeListeners: function(event) {
        if (!this._markers) return

        const me = this
        const x = event.containerPoint.x
        const y = event.containerPoint.y

        if (me._openToolTip) {
            me._openToolTip.closeTooltip()
            delete me._openToolTip
        }

        const ret = this._markers.search({ minX: x, minY: y, maxX: x, maxY: y })

        if (ret && ret.length > 0) {
            me._map._container.style.cursor = 'pointer'

            if (event.type === 'click') {
                const hasPopup = ret[0].data.getPopup()
                if (hasPopup) ret[0].data.openPopup()

                me._onClickListeners.forEach(function(listener) {
                    listener(event, ret)
                })
            }

            if (event.type === 'mousemove') {
                const hasTooltip = ret[0].data.getTooltip()
                if (hasTooltip) {
                    me._openToolTip = ret[0].data
                    ret[0].data.openTooltip()
                }

                me._onHoverListeners.forEach(function(listener) {
                    listener(event, ret)
                })
            }
        } else {
            me._map._container.style.cursor = ''
        }
    }
})

L.canvasMarkerLayer = function(options) {
    return new CanvasMarkerLayer(options)
}
