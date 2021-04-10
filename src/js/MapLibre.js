/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the BSD 3-Clause License
 */

/* globals maplibregl, Mapbox3DTiles */

(function () {

    "use strict";

    // =========================================================================
    // CLASS DEFINITION
    // =========================================================================
    var map;
    var PoIs = {};
    var debug = false;

    var MapLibre = function MapLibre() {
        this.queue = [];
        this.executingCmd = "";
        this.hoveredStateId = null;

        MashupPlatform.prefs.registerCallback(function (new_preferences) {
            debug = MashupPlatform.prefs.get('debug');
        }.bind(this));

    };

    var mapStyles = {
        'OSM': 'map/osm.json',
        'GSI_STD': 'map/gsi/std.json',
        'GSI_STD_VERTICAL': 'map/gsi/std_vertical.json',
        'GSI_PALE': 'map/gsi/pale.json',
        'GSI_BLANK': 'map/gsi/blank.json',
        'GSI_BUILDING3D': 'map/gsi/building3d.json',
        'GSI_BUILDING3D_DARK': 'map/gsi/building3ddark.json',
        'GSI_BUILDING3D_PHOTO': 'map/gsi/building3dphoto.json'
    };

    MapLibre.prototype.init = function init() {

        debug = MashupPlatform.prefs.get('debug');

        var initialCenter = MashupPlatform.prefs.get("initialCenter").split(",").map(Number);
        if (initialCenter.length != 2 || !Number.isFinite(initialCenter[0]) || !Number.isFinite(initialCenter[1])) {
            initialCenter = [0, 0];
        }

        var style = MashupPlatform.prefs.get('mapStyle');

        if (style == 'CUSTOM_STYLE') {
            style = MashupPlatform.prefs.get('customStyle');
        } else {
            var url = new URL(mapStyles[style], location.href)
            style = url.href
        }

        var options = {
            container: 'map',
            center: initialCenter,
            zoom: parseInt(MashupPlatform.prefs.get('initialZoom'), 10),
            pitch: parseInt(MashupPlatform.prefs.get('initialPitch'), 10),
            style: style,
            attributionControl: false
        };

        map = new maplibregl.Map(options);

        if (MashupPlatform.prefs.get("navigationControl")) {
            map.addControl(new maplibregl.NavigationControl());
        }

        if (MashupPlatform.prefs.get("scaleControl")) {
            map.addControl(new maplibregl.ScaleControl({
                maxWidth: 200,
                unit: 'metric'
            }));
        }

        map.addControl(new maplibregl.AttributionControl({
            compact: MashupPlatform.prefs.get("attributionControl")
        }));

        if (MashupPlatform.prefs.get("geolocateControl")) {
            map.addControl(new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: false
                },
                fitBoundsOptions: {maxZoom: 6},
                trackUserLocation: true,
                showUserLocation: true
            }));
        }

        map.on('load', () => {
            debug && MashupPlatform.widget.log('load', MashupPlatform.log.INFO);
            execEnd.call(this);
        });

        map.on('moveend', () => {
            // debug && MashupPlatform.widget.log('moveend', MashupPlatform.log.INFO);
            execEnd.call(this);
        });

        map.on('pitchend', () => {
            debug && MashupPlatform.widget.log('pitchend', MashupPlatform.log.INFO);
            // execEnd.call(this);
        });

        map.on('rotateend', () => {
            // debug && MashupPlatform.widget.log('rotateend', MashupPlatform.log.INFO);
            execEnd.call(this);
        });

        map.on('zoomend', () => {
            debug && MashupPlatform.widget.log('zoomend', MashupPlatform.log.INFO);
            execEnd.call(this);
        });

        map.on('render', () => {
        });

        map.on('resize', () => {
            debug && MashupPlatform.widget.log('resize', MashupPlatform.log.INFO);
        });

        map.on('mousemove', (e) => {
        });

        map.on('mouseleave', () => {
        });
    }

    MapLibre.prototype.addLayer = function addLayer(command_info) {
        try {
            if (command_info.source != null) {
                map.addSource(command_info.source.name, command_info.source.data);
            }
            map.addLayer(command_info.data, command_info.beforeId);
        } catch (e) {
            MashupPlatform.widget.log(e.message);
            throw new MashupPlatform.wiring.EndpointTypeError();
        }
    }

    MapLibre.prototype.moveLayer = function moveLayer(command_info) {
        map.moveLayer(command_info.id, command_info.beforeId);
    }

    MapLibre.prototype.removeLayer = function removeLayer(command_info) {
        map.removeLayer(command_info.id);
    }

    MapLibre.prototype.setBaseLayer = function setBaseLayer(command_info) {
        if (command_info.options == null) {
            map.setStyle(command_info.style);
        } else {
            map.setStyle(command_info.style, command_info.options);
        }
    }

    MapLibre.prototype.registerPoI = function registerPoI(poi_info) {

        if (poi_info.location.type == "Point") {
            var poi = PoIs[poi_info.id];

            var el = ('icon' in poi_info)
                ? build_marker(poi_info.icon)
                : build_marker_webfont(poi_info);

            if (poi == null) {
                poi = new maplibregl.Marker(el).setLngLat(poi_info.location.coordinates).addTo(map);
            } else {
                poi.setLngLat(poi_info.location.coordinates);
            }

            // Add popup
            if (poi_info.title || poi_info.infoWindow) {
                poi.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML("<b>" + poi_info.title + "</b><br>" + poi_info.infoWindow));
            }

            // Save PoI data to send it on the map's outputs
            poi.data = poi_info;

            // bind event to send function
            el.addEventListener("click", sendSelectedPoI.bind(poi));

            PoIs[poi_info.id] = poi;

        } else if (poi_info.location.type == "LineString") {
            map.addSource(poi_info.id, {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': poi_info.location.coordinates
                    }
                }
            });
            map.addLayer({
                'id': poi_info.id,
                'type': 'line',
                'source': poi_info.id,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 8
                }
            });
        } else if (poi_info.location.type == 'Polygon') {
            map.addSource(poi_info.id, {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': poi_info.location.coordinates
                    }
                }
            });
            map.addLayer({
                'id': poi_info.id,
                'type': 'fill',
                'source': poi_info.id,
                'layout': {},
                'paint': {
                    'fill-color': '#E92D63',
                    'fill-opacity': 0.4
                }
            });
        }
    }

    MapLibre.prototype.replacePoIs = function replacePoIs(poi_info) {
        for (var key in PoIs) {
            PoIs[key].remove();
        }
        PoIs = {};
        poi_info.forEach(this.registerPoI, this);
    }

    MapLibre.prototype.centerPoI = function centerPoI(poi_info) {
        if (poi_info.length) {
            poi_info.forEach(this.registerPoI, this);
            map.setCenter(poi_info[poi_info.length - 1 ].location.coordinates);
        }
    }

    MapLibre.prototype.removePoI = function removePoI(poi_info) {
        PoIs[poi_info.id].remove;
        delete PoIs[poi_info.id];
    }

    MapLibre.prototype.execCommands = function (commands) {
        _execCommands.call(this, commands, this.executingCmd);
    }

    // =========================================================================
    // PRIVATE MEMBERS
    // =========================================================================
    var build_marker = function build_marker(icon) {
        var url = (typeof icon === 'string') ? icon : icon.src;
        var el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = 'url(' + url + ')';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = '100% auto';
        el.style.width = '30px';
        el.style.height = '30px';

        return el;
    }

    var build_marker_webfont = function build_marker_webfont(poi_info) {
        var font = 'se-icon fa fa-star';

        if ('style' in poi_info) {
            if ('fontSymbol' in poi_info.style && 'glyph' in poi_info.style.fontSymbol) {
                font = poi_info.style.fontSymbol.glyph;
                if (font.substr(0, 3) == 'fa-') {
                    font = 'se-icon fa ' + font;
                }
            }
        } else {
            poi_info.style = {};
        }

        var style = poi_info.style;

        if ('fontSymbol' in style) {
            var fontSymbol = poi_info.style.fontSymbol;
            var i = document.createElement('i');
            i.className = font;
            i.style.fontSize = fontSymbol.fontSize || '';

            var span = document.createElement('span');
            span.append(i);
            span.style.display = 'flex';
            span.style.justifyContent = 'center';
            span.style.alignItems = 'center';
            span.style.boxSizing = 'border-box';
            span.style.cursor = 'pointer';

            span.style.width = fontSymbol.size || '30px';
            span.style.height = fontSymbol.size || '30px';
            span.style.color = getColorCode(fontSymbol.color, '#fff');
            span.style.background = getColorCode(fontSymbol.fillColor, '#1f2f54');
            span.style.border = 'solid ' + (fontSymbol.border || '2') + 'px';
            span.style.boxShadow = fontSymbol.shadow || '0 0 2px #000';

            switch (fontSymbol.form) {
            case 'none':
                span.style.border = '';
                span.style.boxShadow = '';
                break;
            case 'box':
                span.style.borderRadius = '';
                break;
            case 'circle':
                span.style.borderRadius = '70% 70% 70% 70%';
                break;
            default:
                i.style.transform = 'rotateZ(135deg)';
                span.style.borderRadius = '0 70% 70%';
                span.style.transform = 'rotateZ(-135deg)';
                break;
            }

            var el = document.createElement('div');
            el.append(span);

        } else {
            var el = document.createElement('div');
            el.innerHTML = '<span><i class="' + font + '"></i></span>';
            el.className = 'marker2';
        }

        return el;
    }

    var colorTable = {
        transparent: '',
        white: '#ffffff',
        silver: '#c0c0c0',
        gray: '#808080',
        black: '#000000',
        red: '#ff0000',
        maroon: '#800000',
        yellow: '#ffff00',
        olive: '#808000',
        lime: '#00ff00',
        green: '#008000',
        aqua: '#00ffff',
        teal: '#008080',
        blue: '#0000ff',
        navy: '#000080',
        fuchsia: '#ff00ff',
        purple: '#800080',
        orange: '#ffa500',
        naivy: '#1f2f54',
        'fi-cyan': '#5dc0cf',
        'fi-naivy': '#002e67',
        'fi-green': '#15a97c',
        'fi-grey': '#b1b2b4',
        'fi-red': '#d36b59',
    }

    var getColorCode = function getColorCode(color, defaultColor) {
        if (color != null) {
            color = color.toLowerCase();
            if (color.substr(0, 1) == '#') {
                return color;
            } else if (color in colorTable) {
                return colorTable[color];
            }
        }
        return defaultColor;
    }

    var sendSelectedPoI = function sendSelectedPoI() {
        if (MashupPlatform.widget.outputs.poiListOutput.connected) {
            MashupPlatform.widget.outputs.poiListOutput.pushEvent(this.data);
        }
    }

    var _execCommands = function _execCommands(commands, _executingCmd) {
        this.executingCmd = _executingCmd;
        if (!Array.isArray(commands)) {
            commands = [commands];
        }
        this.queue = this.queue.concat(commands);

        if (this.executingCmd == "" && this.queue.length > 0) {
            var cmd = this.queue.shift();
            this.executingCmd = cmd.type.toLowerCase();
            commandList[this.executingCmd].call(this, cmd.value);
        }
        MashupPlatform.widget.log(`exec: ${this.executingCmd}, queue: ${this.queue.length}`, MashupPlatform.log.INFO);
    }

    var execEnd = function execEnd() {
        setTimeout(() => {
            _execCommands.call(this, [], "");
        }, 0);
    };

    var commandList = {
        'add3dtiles': function (value) {
            const tiles = new Mapbox3DTiles.Layer(value.data)
            map.addLayer(tiles);
            execEnd.call(this);
        },
        'addlayer': function (value) {
            if (value.source != null) {
                map.addSource(value.source.name, value.source.data);
            }
            map.addLayer(value.data, value.beforeId);
            execEnd.call(this);
        },
        'movelayer': function (value) {
            map.moveLayer(value.id, value.beforeId);
            execEnd.call(this);
        },
        'removelayer': function (value) {
            map.removeLayer(value.id);
            execEnd.call(this);
        },
        'setbaselayer': function (value) {
            map.setStyle(value.style, value.options);
            execEnd.call(this);
        },
        'rotatecamera': function (value) {
            var timestamp = value
            var rotateCamera = function rotateCamera(timestamp) {
                // clamp the rotation between 0 -360 degrees
                // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
                map.rotateTo((timestamp / 100) % 360, { duration: 0 });
                // Request the next frame of the animation.
                requestAnimationFrame(rotateCamera);
            }
            rotateCamera(timestamp);
            execEnd.call(this);
        },
        'attributioncontrol': function (value) {
            map.addControl(new maplibregl.AttributionControl(value));
            execEnd.call(this);
        },
        'setcenter': function (value) {
            map.setCenter(value);
        },
        'setpaintproperty': function (value) {
            map.setPaintProperty(value.LayerId, value.name, value.value);
            execEnd.call(this);
        },
        'panto': function (value) { // moveend
            map.panTo(value);
        },
        'flyto': function (value) { // moveend
            map.flyTo(value);
        },
        'setzoom': function (value) { // moveend
            map.setZoom(value);
        },
        'setpitch': function (value) { // pitchend
            setTimeout(() => {
                map.setPitch(value);
            }, 0);
        },
        'reset': function (value) {
            this.queue = [];
            this.executingCmd = "";
        },
        'wait': function (value) {
            setTimeout(() => {
                _execCommands.call(this, [], "");
            }, value);
        },
    }

    window.MapLibre = MapLibre;

})();
