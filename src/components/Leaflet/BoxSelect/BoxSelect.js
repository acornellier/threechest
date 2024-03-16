import { Bounds, DomEvent, DomUtil, Handler, LatLngBounds, Map, Util } from 'leaflet'

Map.mergeOptions({
  // @option boxSelect: Boolean = true
  // Whether the map can be zoomed to a rectangular area specified by
  // dragging the mouse while pressing the shift key.
  boxSelect: true,
})

export var BoxSelect = Handler.extend({
  initialize: function (map) {
    this._map = map
    this._container = map._container
    this._pane = map._panes.overlayPane
    this._resetStateTimeout = 0
    map.on('unload', this._destroy, this)
  },

  addHooks: function () {
    DomEvent.on(this._container, 'mousedown', this._onMouseDown, this)
  },

  removeHooks: function () {
    DomEvent.off(this._container, 'mousedown', this._onMouseDown, this)
  },

  moved: function () {
    return this._moved
  },

  _destroy: function () {
    DomUtil.remove(this._pane)
    delete this._pane
  },

  _resetState: function () {
    this._resetStateTimeout = 0
    this._moved = false
    this._inverse = false
  },

  _clearDeferredResetState: function () {
    if (this._resetStateTimeout !== 0) {
      clearTimeout(this._resetStateTimeout)
      this._resetStateTimeout = 0
    }
  },

  _onMouseDown: function (e) {
    if (!e.shiftKey || (e.which !== 1 && e.button !== 1)) {
      return false
    }

    // Clear the deferred resetState if it hasn't executed yet, otherwise it
    // will interrupt the interaction and orphan a box element in the container.
    this._clearDeferredResetState()
    this._resetState()

    DomUtil.disableTextSelection()
    DomUtil.disableImageDrag()

    this._startPoint = this._map.mouseEventToContainerPoint(e)
    this._setInverse(e.altKey)

    DomEvent.on(
      document,
      {
        contextmenu: DomEvent.stop,
        mousemove: this._onMouseMove,
        mouseup: this._onMouseUp,
        keydown: this._onKeyDown,
        keyup: this._onKeyUp,
      },
      this,
    )
  },

  _onMouseMove: function (e) {
    if (!this._moved) {
      this._moved = true

      this._box = DomUtil.create('div', 'leaflet-zoom-box', this._container)
      DomUtil.addClass(this._container, 'leaflet-crosshair')

      this._map.fire('boxselectstart', this._inverse)
    }

    this._point = this._map.mouseEventToContainerPoint(e)

    const bounds = new Bounds(this._point, this._startPoint)
    const size = bounds.getSize()

    DomUtil.setPosition(this._box, bounds.min)

    this._box.style.width = size.x + 'px'
    this._box.style.height = size.y + 'px'

    this._fireMove()
  },

  _finish: function () {
    if (this._moved) {
      DomUtil.remove(this._box)
      DomUtil.removeClass(this._container, 'leaflet-crosshair')
    }

    DomUtil.enableTextSelection()
    DomUtil.enableImageDrag()

    DomEvent.off(
      document,
      {
        contextmenu: DomEvent.stop,
        mousemove: this._onMouseMove,
        mouseup: this._onMouseUp,
        keydown: this._onKeyDown,
        keyup: this._onKeyUp,
      },
      this,
    )
  },

  _onMouseUp: function (e) {
    if (e.which !== 1 && e.button !== 1) {
      return
    }

    this._finish()

    if (!this._moved) {
      return
    }
    // Postpone to next JS tick so internal click event handling
    // still see it as "moved".
    this._clearDeferredResetState()
    this._resetStateTimeout = setTimeout(Util.bind(this._resetState, this), 0)

    const bounds = new LatLngBounds(
      this._map.containerPointToLatLng(this._startPoint),
      this._map.containerPointToLatLng(this._point),
    )

    this._map.fire('boxselectend', { bounds, inverse: this._inverse })
  },

  _setInverse: function (inverse) {
    this._inverse = inverse
    if (this._box) this._box.classList.toggle('inverse', inverse)
  },

  _fireMove: function () {
    const latLngBounds = new LatLngBounds(
      this._map.containerPointToLatLng(this._startPoint),
      this._map.containerPointToLatLng(this._point),
    )

    this._map.fire('boxselectmove', {
      bounds: latLngBounds,
      inverse: this._inverse,
    })
  },

  _onKeyDown: function (e) {
    if (e.key === 'Escape') {
      this._finish()
      this._clearDeferredResetState()
      this._resetState()
    } else if (e.key === 'Alt') {
      this._setInverse(true)
      this._fireMove()
    }
  },

  _onKeyUp: function (e) {
    if (e.key === 'Alt') {
      this._setInverse(false)
      this._fireMove()
    }
  },
})

Map.addInitHook('addHandler', 'boxSelect', BoxSelect)
