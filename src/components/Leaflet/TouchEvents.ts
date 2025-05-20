import { DomEvent, Handler, Map } from 'leaflet'

Map.mergeOptions({
  touchExtend: true,
})

const TouchExtend = Handler.extend({
  // @method initialize(): void
  // Sets TouchExtend private accessor variables
  initialize: function (map: Map) {
    this._map = map
    this._container = map.getContainer()
    this._pane = map.getPanes().overlayPane
  },

  // @method addHooks(): void
  // Adds dom listener events to the map container
  addHooks: function () {
    DomEvent.on(this._container, 'touchstart', this._onTouchStart, this)
    DomEvent.on(this._container, 'touchend', this._onTouchEnd, this)
    DomEvent.on(this._container, 'touchmove', this._onTouchMove, this)
    DomEvent.on(this._container, 'touchcancel', this._onTouchCancel, this)
    DomEvent.on(this._container, 'touchleave', this._onTouchLeave, this)
  },

  // @method removeHooks(): void
  // Removes dom listener events from the map container
  removeHooks: function () {
    DomEvent.off(this._container, 'touchstart', this._onTouchStart, this)
    DomEvent.off(this._container, 'touchend', this._onTouchEnd, this)
    DomEvent.off(this._container, 'touchmove', this._onTouchMove, this)
    DomEvent.off(this._container, 'MSPointerDown', this._onTouchStart, this)
    DomEvent.off(this._container, 'MSPointerUp', this._onTouchEnd, this)
    DomEvent.off(this._container, 'MSPointerMove', this._onTouchMove, this)
    DomEvent.off(this._container, 'MSPointerCancel', this._onTouchCancel, this)
  },

  _touchEvent: function (e: any, type: string) {
    // #TODO: fix the pageX error that is do a bug in Android where a single touch triggers two click events
    // _filterClick is what leaflet uses as a workaround.
    // This is a problem with more things than just android. Another problem is touchEnd has no touches in
    // its touch list.
    let touchEvent: any = {}
    if (typeof e.touches !== 'undefined') {
      if (!e.touches.length) {
        return
      }
      touchEvent = e.touches[0]
    } else if (e.pointerType === 'touch') {
      touchEvent = e
      if (!this._filterClick(e)) {
        return
      }
    } else {
      return
    }

    const containerPoint = this._map.mouseEventToContainerPoint(touchEvent)
    const layerPoint = this._map.mouseEventToLayerPoint(touchEvent)
    const latlng = this._map.layerPointToLatLng(layerPoint)

    this._map.fire(type, {
      latlng: latlng,
      layerPoint: layerPoint,
      containerPoint: containerPoint,
      pageX: touchEvent.pageX,
      pageY: touchEvent.pageY,
      originalEvent: e,
    })
  },

  lastClick: 0,

  /** Borrowed from Leaflet and modified for bool ops **/
  _filterClick: function (e: any) {
    const timeStamp = e.timeStamp || e.originalEvent.timeStamp
    const elapsed = this.lastClick && timeStamp - this.lastClick

    // are they closer together than 500ms yet more than 100ms?
    // Android typically triggers them ~300ms apart while multiple listeners
    // on the same event should be triggered far faster;
    // or check if click is simulated on the element, and if it is, reject any non-simulated events
    if (
      (elapsed && elapsed > 100 && elapsed < 500) ||
      (e.target._simulatedClick && !e._simulated)
    ) {
      DomEvent.stop(e)
      return false
    }
    this.lastClick = timeStamp
    return true
  },

  _onTouchStart: function (e: Event) {
    if (!this._map._loaded) {
      return
    }

    const type = 'touchstart'
    this._touchEvent(e, type)
  },

  _onTouchEnd: function (e: Event) {
    if (!this._map._loaded) {
      return
    }

    const type = 'touchend'
    this._map.fire(type, {
      originalEvent: e,
    })
  },

  _onTouchCancel: function (e: Event) {
    if (!this._map._loaded) {
      return
    }

    let type = 'touchcancel'
    if (this._detectIE()) {
      type = 'pointercancel'
    }
    this._touchEvent(e, type)
  },

  _onTouchLeave: function (e: Event) {
    if (!this._map._loaded) {
      return
    }

    const type = 'touchleave'
    this._touchEvent(e, type)
  },

  _onTouchMove: function (e: Event) {
    if (!this._map._loaded) {
      return
    }

    const type = 'touchmove'
    this._touchEvent(e, type)
  },
})

Map.addInitHook('addHandler', 'touchExtend', TouchExtend)
