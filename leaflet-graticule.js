/**
 *  Create a Canvas as ImageOverlay to draw the Lat/Lon Graticule,
 *  and show the axis tick label on the edge of the map.
 *  Author: lanwei@cloudybay.com.tw
 */

(function (window, document, undefined) {

    L.LeafletGraticule = L.Layer.extend({
        includes: (L.Evented.prototype || L.Mixin.Events),
        options: {
            showLabel: true,
            opacity: 1,
            weight: 0.8,
            color: '#aaa',
            font: '12px Verdana',
            dashArray: [0,0],
            lngLineCurved: 0,
            latLineCurved: 0,
            zoomInterval: [
                {start: 0, end: 1, interval: 60},
                {start: 2, end: 3, interval: 30},
                {start: 4, end: 4, interval: 10},
                {start: 5, end: 6, interval: 5},
                {start: 7, end: 7, interval: 2.5},
                {start: 8, end: 8, interval: 1},
                {start: 9, end: 9, interval: 0.5},
                {start: 10, end: 10, interval: 0.25},
                {start: 11, end: 11, interval: 0.1},
                {start: 12, end: 12, interval: 0.05},
                {start: 13, end: 13, interval: 0.025},
                {start: 14, end: 14, interval: 0.01},
                {start: 15, end: 15, interval: 0.005},
                {start: 16, end: 16, interval: 0.0025},
                {start: 17, end: 22, interval: 0.001}
            ],
            sides: ['N', 'S', 'E', 'W'],
            showSides: true,
            showDegree: true,
            latFormatTickLabel: undefined,
            lngFormatTickLabel: undefined,
        },

        initialize: function (options) {
            L.setOptions(this, options);

            var defaultFontName = 'Arial sans-serif';
            var _ff = this.options.font.split(' ');
            if (_ff.length < 2) {
                this.options.font += ' ' + defaultFontName;
            }

            if (!this.options.fontColor) {
                this.options.fontColor = this.options.color;
            }

            if (this.options.zoomInterval) {
                if (this.options.zoomInterval.latitude) {
                    this.options.latInterval = this.options.zoomInterval.latitude;
                    if (!this.options.zoomInterval.longitude) {
                        this.options.lngInterval = this.options.zoomInterval.latitude;
                    }
                }
                if (this.options.zoomInterval.longitude) {
                    this.options.lngInterval = this.options.zoomInterval.longitude;
                    if (!this.options.zoomInterval.latitude) {
                        this.options.latInterval = this.options.zoomInterval.longitude;
                    }
                }
                if (!this.options.latInterval) {
                    this.options.latInterval = this.options.zoomInterval;
                }
                if (!this.options.lngInterval) {
                    this.options.lngInterval = this.options.zoomInterval;
                }
            }

            this._degreeSign = this.options.showDegree ? '°' : '';
            this._minutesSign = this.options.showDegree ? '′' : '';
            this._secondsSign = this.options.showDegree ? '″' : '';
        },

        onAdd: function (map) {
            this._map = map;

            if (!this._canvas) {
                this._initCanvas();
            }

            map._panes.overlayPane.appendChild(this._canvas);

            map.on('viewreset', this._reset, this);
            map.on('move', this._reset, this);
            map.on('moveend', this._reset, this);

            // if (map.options.zoomAnimation && L.Browser.any3d) {
            //     map.on('zoomanim', this._animateZoom, this);
            // }

            this._reset();
        },

        onRemove: function (map) {
            L.DomUtil.remove(this._canvas);

            map.off('viewreset', this._reset, this);
            map.off('move', this._reset, this);
            map.off('moveend', this._reset, this);

            // if (map.options.zoomAnimation) {
            //     map.off('zoomanim', this._animateZoom, this);
            // }
        },

        addTo: function (map) {
            map.addLayer(this);
            return this;
        },

        setOpacity: function (opacity) {
            this.options.opacity = opacity;
            this._updateOpacity();
            return this;
        },

        bringToFront: function () {
            if (this._canvas) {
                this._map._panes.overlayPane.appendChild(this._canvas);
            }
            return this;
        },

        bringToBack: function () {
            var pane = this._map._panes.overlayPane;
            if (this._canvas) {
                pane.insertBefore(this._canvas, pane.firstChild);
            }
            return this;
        },

        getAttribution: function () {
            return this.options.attribution;
        },

        _initCanvas: function () {

            this._canvas = L.DomUtil.create('canvas', '');

            if (this._map.options.zoomAnimation && L.Browser.any3d) {
                L.DomUtil.addClass(this._canvas, 'leaflet-zoom-animated');
            } else {
                L.DomUtil.addClass(this._canvas, 'leaflet-zoom-hide');
            }

            this._updateOpacity();


            L.extend(this._canvas, {
                onselectstart: L.Util.falseFn,
                onmousemove: L.Util.falseFn,
                onload: L.bind(this._onCanvasLoad, this)
            });
        },

        _animateZoom: function (e) {
            var map = this._map,
                canvas = this._canvas,
                scale = map.getZoomScale(e.zoom),
                nw = map.containerPointToLatLng([0, 0]),
                se = map.containerPointToLatLng([canvas.width, canvas.height]),
                topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center),
                size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft),
                origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));

            L.DomUtil.setTransform(canvas, origin, scale);
        },

        _reset: function () {
            var canvas = this._canvas,
                size = this._map.getSize(),
                lt = this._map.containerPointToLayerPoint([0, 0]);

            L.DomUtil.setPosition(canvas, lt);

            canvas.width  = size.x;
            canvas.height = size.y;
            canvas.style.width  = size.x + 'px';
            canvas.style.height = size.y + 'px';

            this.__calcInterval();

            this.__draw(true);
        },

        _onCanvasLoad: function () {
            this.fire('load');
        },

        _updateOpacity: function () {
            L.DomUtil.setOpacity(this._canvas, this.options.opacity);
        },

        __format_lat: function(lat) {
            if (this.options.latFormatTickLabel) {
                return this.options.latFormatTickLabel(lat);
            }

            const numLat = Math.round((this.options.showSides ? (lat > 0 ? lat : (lat*-1)) : lat) * 10000 ) / 10000;

            if (this.options.showSides){
                if (numLat === 0) return '' + numLat + this._degreeSign;
                return '' + lat > 0
                  ? numLat + this._degreeSign + this.options.sides[0]
                  : numLat + this._degreeSign + this.options.sides[1];
            }

            return '' + numLat + this._degreeSign;
        },

        __format_lng: function(lng) {
            if (this.options.lngFormatTickLabel) {
                return this.options.lngFormatTickLabel(lng);
            }

            lng = Math.round(lng * 10000) / 10000 ;

            if (this.options.showSides) {
                if (lng > 180) {
                    return '' + (360 - lng) + this._degreeSign + this.options.sides[3];
                } else if (lng > 0 && lng < 180) {
                    return '' + lng + this._degreeSign + this.options.sides[2];
                } else if (lng < 0 && lng > -180) {
                    return '' + (lng * -1) + this._degreeSign + this.options.sides[3];
                } else if (lng === -180) {
                    return '' + (lng * -1) + this._degreeSign;
                } else if (lng < -180) {
                    return '' + (360 + lng) + this._degreeSign + this.options.sides[2];
                }
                return '' + lng + this._degreeSign;
            }

            if (lng > 180) { lng = -360 + lng }
            else if (lng < -180) { lng = 360 + lng }

            return '' + lng + this._degreeSign;
        },

        __calcInterval: function() {
            var zoom = this._map.getZoom();
            if (this._currZoom != zoom) {
                this._currLngInterval = 0;
                this._currLatInterval = 0;
                this._currZoom = zoom;
            }

            var interv;

            if (!this._currLngInterval) {
                try {
                    for (var idx in this.options.lngInterval) {
                        var dict = this.options.lngInterval[idx];
                        if (dict.start <= zoom) {
                            if (dict.end && dict.end >= zoom) {
                                this._currLngInterval = dict.interval;
                                break;
                            }
                        }
                    }
                }
                catch(e) {
                    this._currLngInterval = 0;
                }
            }

            if (!this._currLatInterval) {
                try {
                    for (var idx in this.options.latInterval) {
                        var dict = this.options.latInterval[idx];
                        if (dict.start <= zoom) {
                            if (dict.end && dict.end >= zoom) {
                                this._currLatInterval = dict.interval;
                                break;
                            }
                        }
                    }
                }
                catch(e) {
                    this._currLatInterval = 0;
                }
            }
        },

        __draw: function(label) {
            function _parse_px_to_int(txt) {
                if (txt.length > 2) {
                    if (txt.charAt(txt.length-2) === 'p') {
                        txt = txt.substr(0, txt.length-2);
                    }
                }
                try {
                    return parseInt(txt, 10);
                }
                catch(e) {}
                return 0;
            };

            var self = this,
                canvas = this._canvas,
                map = this._map,
                curvedLon = this.options.lngLineCurved,
                curvedLat = this.options.latLineCurved;

            if (L.Browser.canvas && map) {
                if (!this._currLngInterval || !this._currLatInterval) {
                    this.__calcInterval();
                }

                var latInterval = this._currLatInterval,
                    lngInterval = this._currLngInterval;

                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.lineWidth = this.options.weight;
                ctx.strokeStyle = this.options.color;
                ctx.fillStyle = this.options.fontColor;
                ctx.setLineDash(this.options.dashArray);

                if (this.options.font) {
                    ctx.font = this.options.font;
                }
                var txtWidth = ctx.measureText('0').width;
                var txtHeight = 12;
                try {
                    var _font_size = ctx.font.trim().split(' ')[0];
                    txtHeight = _parse_px_to_int(_font_size);
                }
                catch(e) {}

                var ww = canvas.width,
                    hh = canvas.height;

                var lt = map.containerPointToLatLng(L.point(0, 0));
                var rt = map.containerPointToLatLng(L.point(ww, 0));
                var rb = map.containerPointToLatLng(L.point(ww, hh));

                var _lat_b = rb.lat,
                    _lat_t = lt.lat;
                var _lon_l = lt.lng,
                    _lon_r = rt.lng;

                var _point_per_lat = (_lat_t - _lat_b) / (hh * 0.2);
                if (isNaN(_point_per_lat)) {
                    return;
                }

                if (_point_per_lat < 1) { _point_per_lat = 1; }
                if (_lat_b < -90) {
                    _lat_b = -90;
                }
                else {
                    _lat_b = parseInt(_lat_b - _point_per_lat, 10);
                }

                if (_lat_t > 90) {
                    _lat_t = 90;
                }
                else {
                    _lat_t = parseInt(_lat_t + _point_per_lat, 10);
                }

                var _point_per_lon = (_lon_r - _lon_l) / (ww * 0.2);
                if (_point_per_lon < 1) { _point_per_lon = 1; }
                if (_lon_l > 0 && _lon_r < 0) {
                    _lon_r += 360;
                }
                _lon_r = parseInt(_lon_r + _point_per_lon, 10);
                _lon_l = parseInt(_lon_l - _point_per_lon, 10);

                var ll, latstr, lngstr, _lon_delta = 0.5;
                function __draw_lat_line(self, lat_tick) {
                    ll = self._latLngToCanvasPoint(L.latLng(lat_tick, _lon_l));
                    latstr = self.__format_lat(lat_tick);
                    txtWidth = ctx.measureText(latstr).width;
                    var spacer = self.options.showLabel && label ? txtWidth + 10 : 0;

                    if (curvedLat) {
                        if (typeof(curvedLat) == 'number') {
                            _lon_delta = curvedLat;
                        }

                        var __lon_left = _lon_l, __lon_right = _lon_r;
                        if (ll.x > 0) {
                            var __lon_left = map.containerPointToLatLng(L.point(0, ll.y));
                            __lon_left = __lon_left.lng - _point_per_lon;
                            ll.x = 0;
                        }
                        var rr = self._latLngToCanvasPoint(L.latLng(lat_tick, __lon_right));
                        if (rr.x < ww) {
                            __lon_right = map.containerPointToLatLng(L.point(ww, rr.y));
                            __lon_right = __lon_right.lng + _point_per_lon;
                            if (__lon_left > 0 && __lon_right < 0) {
                                __lon_right += 360;
                            }
                        }

                        ctx.beginPath();
                        ctx.moveTo(ll.x + spacer, ll.y);
                        var _prev_p = null;
                        for (var j=__lon_left; j<=__lon_right; j+=_lon_delta) {
                            rr = self._latLngToCanvasPoint(L.latLng(lat_tick, j));
                            ctx.lineTo(rr.x - spacer, rr.y);

                            if (self.options.showLabel && label && _prev_p != null) {
                                if (_prev_p.x < 0 && rr.x >= 0) {
                                    var _s = (rr.x - 0) / (rr.x - _prev_p.x);
                                    var _y = rr.y - ((rr.y - _prev_p.y) * _s);
                                    ctx.fillText(latstr, 0, _y + (txtHeight/2));
                                }
                                else if (_prev_p.x <= (ww-txtWidth) && rr.x > (ww-txtWidth)) {
                                    var _s = (rr.x - ww) / (rr.x - _prev_p.x);
                                    var _y = rr.y - ((rr.y - _prev_p.y) * _s);
                                    ctx.fillText(latstr, ww-txtWidth, _y + (txtHeight/2)-2);
                                }
                            }

                            _prev_p = {x:rr.x, y:rr.y, lon:j, lat:i};
                        }
                        ctx.stroke();
                    }
                    else {
                        var __lon_right = _lon_r;
                        var rr = self._latLngToCanvasPoint(L.latLng(lat_tick, __lon_right));
                        if (curvedLon) {
                            __lon_right = map.containerPointToLatLng(L.point(0, rr.y));
                            __lon_right = __lon_right.lng;
                            rr = self._latLngToCanvasPoint(L.latLng(lat_tick, __lon_right));

                            var __lon_left = map.containerPointToLatLng(L.point(ww, rr.y));
                            __lon_left = __lon_left.lng;
                            ll = self._latLngToCanvasPoint(L.latLng(lat_tick, __lon_left));
                        }

                        ctx.beginPath();
                        ctx.moveTo(1 + spacer, ll.y);
                        ctx.lineTo(rr.x-1 - spacer, rr.y);
                        ctx.stroke();
                        if (self.options.showLabel && label) {
                            var _yy = ll.y + (txtHeight/2)-2;
                            ctx.fillText(latstr, 0, _yy);
                            ctx.fillText(latstr, ww-txtWidth, _yy);
                        }
                    }
                };

                if (latInterval > 0) {
                    for (var i=latInterval; i<=_lat_t; i+=latInterval) {
                        if (i >= _lat_b) {
                            __draw_lat_line(this, i);
                        }
                    }
                    for (var i=0; i>=_lat_b; i-=latInterval) {
                        if (i <= _lat_t) {
                            __draw_lat_line(this, i);
                        }
                    }
                }

                function __draw_lon_line(self, lon_tick) {
                    lngstr = self.__format_lng(lon_tick);
                    txtWidth = ctx.measureText(lngstr).width;
                    var bb = self._latLngToCanvasPoint(L.latLng(_lat_b, lon_tick));
                    var spacer = self.options.showLabel && label ? txtHeight + 5 : 0;

                    if (curvedLon) {
                        if (typeof(curvedLon) == 'number') {
                            _lat_delta = curvedLon;
                        }

                        ctx.beginPath();
                        ctx.moveTo(bb.x, 5 + spacer);
                        var _prev_p = null;
                        for (var j=_lat_b; j<_lat_t; j+=_lat_delta) {
                            var tt = self._latLngToCanvasPoint(L.latLng(j, lon_tick));
                            ctx.lineTo(tt.x, tt.y - spacer);

                            if (self.options.showLabel && label && _prev_p != null) {
                                if (_prev_p.y > 8 && tt.y <= 8) {
                                    ctx.fillText(lngstr, tt.x - (txtWidth/2), txtHeight + 5);
                                }
                                else if (_prev_p.y >= hh && tt.y < hh) {
                                    ctx.fillText(lngstr, tt.x - (txtWidth/2), hh-2);
                                }
                            }

                            _prev_p = {x:tt.x, y:tt.y, lon:lon_tick, lat:j};
                        }
                        ctx.stroke();
                    }
                    else {
                        var __lat_top = _lat_t;
                        var tt = self._latLngToCanvasPoint(L.latLng(__lat_top, lon_tick));
                        if (curvedLat) {
                            __lat_top = map.containerPointToLatLng(L.point(tt.x, 0));
                            __lat_top = __lat_top.lat;
                            if (__lat_top > 90) { __lat_top = 90; }
                            tt = self._latLngToCanvasPoint(L.latLng(__lat_top, lon_tick));

                            var __lat_bottom = map.containerPointToLatLng(L.point(bb.x, hh));
                            __lat_bottom = __lat_bottom.lat;
                            if (__lat_bottom < -90) { __lat_bottom = -90; }
                            bb = self._latLngToCanvasPoint(L.latLng(__lat_bottom, lon_tick));
                        }

                        ctx.beginPath();
                        ctx.moveTo(tt.x, 5 + spacer);
                        ctx.lineTo(bb.x, hh-1 - spacer);
                        ctx.stroke();

                        if (self.options.showLabel && label) {
                            ctx.fillText(lngstr, tt.x - (txtWidth/2), txtHeight+5);
                            ctx.fillText(lngstr, bb.x - (txtWidth/2), hh-3);
                        }
                    }
                };

                if (lngInterval > 0) {
                    for (var i=lngInterval; i<=_lon_r; i+=lngInterval) {
                        if (i >= _lon_l) {
                            __draw_lon_line(this, i);
                        }
                    }
                    for (var i=0; i>=_lon_l; i-=lngInterval) {
                        if (i <= _lon_r) {
                            __draw_lon_line(this, i);
                        }
                    }
                }
            }
        },

        _latLngToCanvasPoint: function(latlng) {
            var map = this._map;
            var projectedPoint = map.project(L.latLng(latlng));
            projectedPoint._subtract(map.getPixelOrigin());
            return L.point(projectedPoint).add(map._getMapPanePos());
        }

    });

    L.leafletGraticule = function (options) {
        return new L.LeafletGraticule(options);
    };


    }(this, document));
