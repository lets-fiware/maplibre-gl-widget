/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the 3-Clause BSD License
 */

import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import { RASTER_MAPS } from './rater_maps';

import "../css/styles.css";
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapLibre() {
    this.pois = {};
    this.geoUpdated = false;
    this.queue = [];
    this.executingCmd = '';
    this.hoveredStateId = null;
    this.naviControl = null;
    this.scaleControl = null;
    this.geolocateControl = null;
    this.attributionControl = null;
    this.fullscreenControl = null;
    this.animating = false;
    this.waiting = false;
    this.debug = MashupPlatform.prefs.get('debug');
    this.geojsonSource = {
        type: 'FeatureCollection',
        features: []
    }

    MashupPlatform.prefs.registerCallback(function (new_preferences) {
        const propValue = {
            'initialZoom': this.map.setZoom,
            'initialPitch': this.map.setPitch,
            'minzoom': this.map.setMinZoom,
            'maxzoom': this.map.setMaxZoom,
            'minpitch': this.map.setMinPitch,
            'maxpitch': this.map.setMaxPitch,
        }

        if (new_preferences.hasOwnProperty('initialCenter')) {
            this.map.setCenter(MashupPlatform.prefs.get('initialCenter').split(','));
        }
        if (new_preferences.hasOwnProperty('mapStyle') || new_preferences.hasOwnProperty('customStyle')) {
            this.map.setStyle(getBaseStyle());
        }
        if (new_preferences.hasOwnProperty('debug')) {
            this.debug = MashupPlatform.prefs.get('debug');
        }

        for (let prop in propValue) {
            if (new_preferences.hasOwnProperty(prop)) {
                propValue[prop](MashupPlatform.prefs.get(prop))
            }
        }

        for (let prop in propControl) {
            if (new_preferences.hasOwnProperty(prop)) {
                propControl[prop].call(this)
            }
        }

        this.waiting = false;
        this.animating = false;
        this.queue = [];
        this.executingCmd = '';
    }.bind(this));
};

MapLibre.prototype.init = function init() {
    let initialCenter = MashupPlatform.prefs.get('initialCenter').split(',').map(Number);
    if (initialCenter.length != 2 || !Number.isFinite(initialCenter[0]) || !Number.isFinite(initialCenter[1])) {
        if (MashupPlatform.context.get('language') == 'ja') {
            initialCenter = [135,35];
        } else {
            initialCenter = [-3.7,40.4];
        }
    }

    const options = {
        container: 'map',
        center: initialCenter,
        zoom: parseInt(MashupPlatform.prefs.get('initialZoom'), 10),
        pitch: parseInt(MashupPlatform.prefs.get('initialPitch'), 10),
        style: getBaseStyle(),
        attributionControl: false
    };

    this.map = new maplibregl.Map(options);

    for (let prop in propControl) {
        if (MashupPlatform.prefs.get(prop)) {
            propControl[prop].call(this)
        }
    }

    updateAttributionControl.call(this)

    this.map.on('load', (event) => {
        createGeojsonLayer.call(this);
        this.debug && MashupPlatform.widget.log('load', MashupPlatform.log.INFO);
        execEnd.call(this);
    });

    this.map.on('moveend', (event) => {
        // this.debug && MashupPlatform.widget.log('moveend', MashupPlatform.log.INFO);
        sendPoIList.call(this);
        execEnd.call(this);
    });

    this.map.on('pitchend', (event) => {
        this.debug && MashupPlatform.widget.log('pitchend', MashupPlatform.log.INFO);
        // execEnd.call(this);
    });

    this.map.on('rotateend', (event) => {
        // this.debug && MashupPlatform.widget.log('rotateend', MashupPlatform.log.INFO);
        execEnd.call(this);
    });

    this.map.on('zoomend', (event) => {
        this.debug && MashupPlatform.widget.log('zoomend', MashupPlatform.log.INFO);
        sendPoIList.call(this);
        execEnd.call(this);
    });

    this.map.on('render', (event) => {
    });

    this.map.on('resize', (event) => {
        sendPoIList.call(this);
        this.debug && MashupPlatform.widget.log('resize', MashupPlatform.log.INFO);
    });

    /*
    this.map.on('mousemove', (event) => {
    });

    this.map.on('mouseleave', (event) => {
    });
    */

    // Porting of https://github.com/Wirecloud/ol3-map-widget
    // Set position button
    const setcenter_button = document.getElementById('setcenter-button');
    setcenter_button.addEventListener('click', (event) => {
        const currentCenter = this.map.getCenter();
        MashupPlatform.prefs.set(
            'initialCenter',
            currentCenter.lng + ',' + currentCenter.lat
        );
    });
    const setzoom_button = document.getElementById('setzoom-button');
    setzoom_button.addEventListener('click', (event) => {
        MashupPlatform.prefs.set(
            'initialZoom',
            this.map.getZoom()
        );
    });
    const setpitch_button = document.getElementById('setpitch-button');
    setpitch_button.addEventListener('click', (event) => {
        MashupPlatform.prefs.set(
            'initialPitch',
            this.map.getPitch()
        );
    });
    const setcenterzoom_button = document.getElementById('setcenterzoom-button');
    setcenterzoom_button.addEventListener('click', (event) => {
        const currentCenter = this.map.getCenter();
        MashupPlatform.prefs.set({
            initialCenter: currentCenter.lng + ',' + currentCenter.lat,
            initialZoom: this.map.getZoom(),
            initialPitch: this.map.getPitch()
        });
    });
    const update_ui_buttons = (changes) => {
        // Use strict equality as changes can not contains changes on the
        // editing parameter
        if (changes.editing === true) {
            setcenter_button.classList.remove('hidden');
            setzoom_button.classList.remove('hidden');
            setpitch_button.classList.remove('hidden');
            setcenterzoom_button.classList.remove('hidden');
        } else if (changes.editing === false) {
            setcenter_button.classList.add('hidden');
            setzoom_button.classList.add('hidden');
            setpitch_button.classList.add('hidden');
            setcenterzoom_button.classList.add('hidden');
        }
    };
    MashupPlatform.mashup.context.registerCallback(update_ui_buttons);
    update_ui_buttons({editing: MashupPlatform.mashup.context.get('editing')});
}

MapLibre.prototype.addLayer = function addLayer(command_info) {
    try {
        if (command_info.source != null) {
            this.map.addSource(command_info.source.name, command_info.source.data);
        }
        this.map.addLayer(command_info.data, command_info.beforeId);
    } catch (e) {
        MashupPlatform.widget.log(e.message);
        throw new MashupPlatform.wiring.EndpointTypeError();
    }
}

MapLibre.prototype.moveLayer = function moveLayer(command_info) {
    this.map.moveLayer(command_info.id, command_info.beforeId);
}

MapLibre.prototype.removeLayer = function removeLayer(command_info) {
    this.map.removeLayer(command_info.id);
}

MapLibre.prototype.setBaseLayer = function setBaseLayer(command_info) {
    if (command_info.options == null) {
        this.map.setStyle(command_info.style);
    } else {
        this.map.setStyle(command_info.style, command_info.options);
    }
}

MapLibre.prototype.registerPoIs = function registerPoIs(pois_info) {
    this.geoUpdated = false;
    pois_info.forEach(poi => registerPoI.call(this, poi, true));
    setGeojsonSource.call(this);
    sendPoIList.call(this);
}

MapLibre.prototype.replacePoIs = function replacePoIs(pois_info) {
    this.geoUpdated = false;
    for (let key in this.pois) {
        this.pois[key].remove();
    };
    this.pois = {};
    this.geojsonSource.features = [];
    this.geoUpdated = true
    setGeojsonSource.call(this)
    pois_info.forEach(poi => registerPoI.call(this, poi, false));
    setGeojsonSource.call(this);
    sendPoIList.call(this);
}

MapLibre.prototype.centerPoI = function centerPoI(poi_info) {
    if (poi_info.length) {
        this.geoUpdated = false;
        poi_info.forEach(poi => registerPoI.call(this, poi, true));
        const poi = poi_info[poi_info.length - 1];
        let coord = poi.location.coordinates;
        if (poi.location.type != 'Point') {
            const feature = this.geojsonSource.features.find(e => e.id == poi.id);
            // coord = turf.center(feature).geometry.coordinates;
            const box = turf.envelope({"type": "FeatureCollection", "features": [feature]}).bbox;
            const bounds = new maplibregl.LngLatBounds([box[0], box[1]], [box[2], box[3]]);
            this.map.fitBounds(bounds, { padding: 20 });
        } else {
            this.map.setCenter(coord);
        }
        setGeojsonSource.call(this);
        sendPoIList.call(this);
    }
}

MapLibre.prototype.removePoIs = function removePoIs(pois_info) {
    let updated = false;
    pois_info.forEach(poi => {
        const p = this.pois[poi.id];
        if (p == null) {
            return;
        }
        if (p.data.location.type == 'Point') {
            this.pois[poi.id].remove();
        } else {
            const index = this.geojsonSource.features.findIndex(e => e.id == poi.id);
            if (index != -1) {
                this.geojsonSource.features.splice(index, 1);
                updated = true
            }
        }
        delete this.pois[poi.id];
    });
    if (updated) {
        this.geoUpdated = true
        setGeojsonSource.call(this)
    }
}

const registerPoI = function registerPoI(poi_info, update) {
    if (poi_info.location.type == 'Point') {
        let poi = this.pois[poi_info.id];

        let el = ('icon' in poi_info)
            ? ('fontawesome' in poi_info.icon)
                ? build_marker_fontawesome(poi_info.icon.fontawesome)
                : build_marker(poi_info.icon)
            : build_marker_webfont(poi_info);

        if (poi == null) {
            poi = new maplibregl.Marker(el).setLngLat(poi_info.location.coordinates).addTo(this.map);
        } else {
            poi.setLngLat(poi_info.location.coordinates);
        }

        // Add popup
        if (poi_info.title || poi_info.infoWindow) {
            let popup = new maplibregl.Popup({ offset: 25 }).setHTML('<b>' + poi_info.title + '</b><br>' + poi_info.infoWindow);
            popup.on('close', () => {
                if (MashupPlatform.widget.outputs.poiOutput.connected) {
                    MashupPlatform.widget.outputs.poiOutput.pushEvent(null);
                }
            });
            poi.setPopup(popup);
        }

        // Save PoI data to send it on the map's outputs
        poi.data = poi_info;

        // bind event to send function
        el.addEventListener('click', sendSelectedPoI.bind(poi));

        this.pois[poi_info.id] = poi;

    } else {
        const feature = {};
        feature.id = poi_info.id;
        feature.type = 'Feature';
        feature.geometry = poi_info.location;
        feature.properties = poi_info;

        if (poi_info.style == null) {
            poi_info.style = {};
        }

        switch (poi_info.location.type) {
        case 'LineString':
        case 'MultiLineString':
            if (poi_info.style.stroke == null) {
                poi_info.style.stroke = {}
            }
            feature.properties.color = poi_info.style.stroke.color || 'blue'
            feature.properties.width = poi_info.style.stroke.width || 3
            break;
        case 'Polygon':
        case 'MultiPolygon':
            if (poi_info.style.fill == null) {
                poi_info.style.fill = {}
            }
            feature.properties.color = poi_info.style.fill.color || 'rgba(0, 0, 255, 0.1)'
            feature.properties.outlineColor = poi_info.style.fill.outlineColor || 'rgba(0, 0, 255, 1)'
            break;
        case 'MultiPoint':
            if (poi_info.style.circle == null) {
                poi_info.style.circle = {}
            }
            feature.properties.color = poi_info.style.circle.color || '#B42222'
            feature.properties.radius = poi_info.style.circle.radius || 6
            break;
        default:
            MashupPlatform.widget.log(`Unknown type: ${poi_info.location.type}, id: ${poi_info.id}`, MashupPlatform.log.INFO);
            return;
        }

        let poi = this.pois[poi_info.id];
        if (poi == null) {
            poi = {};
        }
        poi.data = poi_info;
        this.pois[poi_info.id] = poi;

        this.geoUpdated = true;

        if (update) {
            const index = this.geojsonSource.features.findIndex(e => e.id == feature.id);
            if (index != -1) {
                this.geojsonSource.features[index] = feature;
                return;
            }
        }
        this.geojsonSource.features.push(feature);
    }
}

MapLibre.prototype.execCommands = function (commands) {
    _execCommands.call(this, commands, this.executingCmd);
}

// =========================================================================
// PRIVATE MEMBERS
// =========================================================================
const createGeojsonLayer = function createGeojsonLayer() {
    this.map.addSource('feature-collection', {type: 'geojson', data: this.geojsonSource});
    // MultiPoint
    this.map.addLayer({
        id: `__geojsonMultiPoint`,
        type: 'circle',
        source: 'feature-collection',
        paint: {
            'circle-color': ['get', 'color'],
            'circle-radius': ['get', 'radius']
        },
        'filter': ['==', '$type', 'Point']
    });
    // LineString
    this.map.addLayer({
        id: `__geojsonLineString`,
        type: 'line',
        source: 'feature-collection',
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
        paint: {
            'line-color': ['get', 'color'],
            'line-width': ['get', 'width']
        },
        'filter': ['==', '$type', 'LineString']
    });
    // Polygon
    this.map.addLayer({
        id: `__geojsonPolygon`,
        type: 'fill',
        source: 'feature-collection',
        paint: {
            'fill-color': ['get', 'color'],
            'fill-outline-color': ['get', 'outlineColor']
        },
        'filter': ['==', '$type', 'Polygon']
    });
}

const mapStyles = {
    'OSM': 'map/osm.json',
    'GSI_STD': 'map/gsi/std.json',
    'GSI_STD_VERTICAL': 'map/gsi/std_vertical.json',
    'GSI_PALE': 'map/gsi/pale.json',
    'GSI_BLANK': 'map/gsi/blank.json',
    'GSI_BUILDING3D': 'map/gsi/building3d.json',
    'GSI_BUILDING3D_DARK': 'map/gsi/building3ddark.json',
    'GSI_BUILDING3D_PHOTO': 'map/gsi/building3dphoto.json'
};

const getBaseStyle = function getBaseStyle() {
    let style = MashupPlatform.prefs.get('mapStyle');

    if (style == 'CUSTOM_STYLE') {
        style = MashupPlatform.prefs.get('customStyle');
    } else if (style.startsWith('RASTER_')) {
        const rmap = RASTER_MAPS[style.substr(7)];
        style = {
            version: 8,
            sources: {
                base_style: {
                    type: 'raster',
                    tiles: [rmap.url],
                    tileSize: 256,
                    attribution: rmap.attributions
                },
            },
            layers: [
                {
                    id: 'base_style',
                    type: 'raster',
                    source: 'base_style',
                    minzoom: rmap.minZoomLevel,
                    maxzoom: rmap.maxZoomLevel,
                },
            ],
        }
    } else {
        const url = new URL(mapStyles[style], location.href)
        style = url.href
    }
    return style
}

const updateNavigationControl = function updateNavigationControl() {
    if (this.naviControl != null) {
        this.map.removeControl(this.naviControl);
        this.naviControl = null;
    }
    const value = MashupPlatform.prefs.get('navigationControl');
    if (value != 'off') {
        this.naviControl = new maplibregl.NavigationControl()
        this.map.addControl(this.naviControl, value);
    }
}

const updateScaleControl = function updateScaleControl() {
    if (this.scaleControl != null) {
        this.map.removeControl(this.scaleControl);
        this.scaleControl = null;
    }
    const value = MashupPlatform.prefs.get('scaleControl');
    if (value != 'off') {
        this.scaleControl = new maplibregl.ScaleControl({
            maxWidth: 200,
            unit: 'metric'
        });
        this.map.addControl(this.scaleControl, value);
    }
}

const updateGeolocateControl = function updateGeolocateControl() {
    if (this.geolocateControl != null) {
        this.map.removeControl(this.geolocateControl);
        this.geolocateControl = null;
    }
    const value = MashupPlatform.prefs.get('geolocateControl');
    if (value != 'off') {
        this.geolocateControl = new maplibregl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: false
            },
            fitBoundsOptions: {maxZoom: 6},
            trackUserLocation: true,
            showUserLocation: true
        });
        this.map.addControl(this.geolocateControl, value);
    }
}

const updateAttributionControl = function updateAttributionControl() {
    if (this.attributionControl != null) {
        this.map.removeControl(this.attributionControl);
    }
    this.attributionControl = new maplibregl.AttributionControl({
        compact: MashupPlatform.prefs.get('attributionControl')
    });
    this.map.addControl(this.attributionControl);
}

const updateFullscreenControl = function updateFullscreenControl() {
    if (this.fullscreenControl != null) {
        this.map.removeControl(this.fullscreenControl);
        this.fullscreenControl = null;
    }
    const value = MashupPlatform.prefs.get('fullscreenControl');
    if (value != 'off') {
        this.fullscreenControl = new maplibregl.FullscreenControl();
        this.map.addControl(this.fullscreenControl);
    }
}

const propControl = {
    'navigationControl': updateNavigationControl,
    'scaleControl': updateScaleControl,
    'geolocateControl': updateGeolocateControl,
    'attributionControl': updateAttributionControl,
    'fullscreenControl': updateFullscreenControl,
}

const build_marker = function build_marker(icon) {
    const url = (typeof icon === 'string') ? icon : icon.src;
    let el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(' + url + ')';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundSize = '100% auto';
    el.style.width = '30px';
    el.style.height = '30px';

    return el;
}

const build_marker_fontawesome = function build_marker_fontawesome(fa) {
    if (typeof fa === 'string') {
        fa = {glyph: fa};
    }
    const size = (fa.size || '30') + 'px';
    const i = document.createElement('i');
    i.className = 'se-icon fa ' + ((!fa.glyph || fa.glyph == "") ? 'fa-star' : fa.glyph);
    i.style.fontSize = fa.fontSize || '';

    const span = document.createElement('span');
    span.append(i);
    span.style.display = 'flex';
    span.style.justifyContent = 'center';
    span.style.alignItems = 'center';
    span.style.boxSizing = 'border-box';
    span.style.cursor = 'pointer';

    span.style.width = size;
    span.style.height = size;
    span.style.color = getColorCode(fa.stroke || fa.color, '#fff');
    span.style.background = getColorCode(fa.fill, '#1f2f54');
    span.style.border = 'solid ' + (fa.strokeWidth || '2') + 'px';
    span.style.boxShadow = fa.shadow || '0 0 2px #000';

    switch (fa.form) {
    case 'none':
        span.style.border = '';
        span.style.boxShadow = '';
        break;
    case 'icon':
        i.style.fontSize = size;
        span.style.color = span.style.background;
        span.style.background = '';
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

    const el = document.createElement('div');
    el.append(span);

    return el;
}

const build_marker_webfont = function build_marker_webfont(poi_info) {
    let font = 'se-icon fa fa-star';

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

    let style = poi_info.style;
    let el;

    if ('fontSymbol' in style) {
        let fontSymbol = poi_info.style.fontSymbol;
        let i = document.createElement('i');
        i.className = font;
        i.style.fontSize = fontSymbol.fontSize || '';

        let span = document.createElement('span');
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

        el = document.createElement('div');
        el.append(span);

    } else {
        el = document.createElement('div');
        el.innerHTML = '<span><i class="' + font + '"></i></span>';
        el.className = 'marker2';
    }

    return el;
}

const setGeojsonSource = function updateGetjsonSource() {
    if (this.geoUpdated) {
        const source = this.map.getSource('feature-collection')
        if (source) {
            source.setData(this.geojsonSource)
        }
    }
    this.geoUpdated = false;
}

const colorTable = {
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

const getColorCode = function getColorCode(color, defaultColor) {
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

const sendSelectedPoI = function sendSelectedPoI() {
    if (MashupPlatform.widget.outputs.poiOutput.connected) {
        MashupPlatform.widget.outputs.poiOutput.pushEvent(this.data);
    }
}

const sendPoIList = function sendPoIList() {
    if (MashupPlatform.widget.outputs.poiListOutput.connected) {
        const bounds = this.map.getBounds();
        const w = bounds.getWest();
        const s = bounds.getSouth();
        const e = bounds.getEast();
        const n = bounds.getNorth();
        const bbox = turf.polygon([[[w, n], [e, n], [e, s], [w, s], [w, n]]]);
        let poiList = [];
        for (let key in this.pois) {
            let poi = this.pois[key];
            if (poi.data.location != null && poi.data.location.type == 'Point') {
                if (!poi.hasOwnProperty('__lnglat')) {
                    poi.__lnglat = new maplibregl.LngLat(poi.data.location.coordinates[0], poi.data.location.coordinates[1]);
                }
                if (bounds.contains(poi.__lnglat)) {
                    poiList.push(poi.data);
                }
            } else {
                const feature = this.geojsonSource.features.find(e => e.id == poi.data.id);
                if (feature != null && turf.booleanIntersects(feature, bbox)) {
                    poiList.push(poi.data);
                }
            }
        };
        MashupPlatform.widget.outputs.poiListOutput.pushEvent(poiList);
    }
}

const _execCommands = function _execCommands(commands, _executingCmd) {
    if (!this.waiting) {
        this.executingCmd = _executingCmd;
        if (!Array.isArray(commands)) {
            commands = [commands];
        }
        this.queue = this.queue.concat(commands);

        if (this.executingCmd == '' && this.queue.length > 0) {
            let cmd = this.queue.shift();
            if (!cmd.hasOwnProperty('value')) {
                cmd.value = {};
                cmd.value.data = {};
            }
            if (cmd.type != null) {
                this.executingCmd = cmd.type.toLowerCase();
                commandList[this.executingCmd].call(this, cmd.value);
            }
        }
    }
    this.debug && MashupPlatform.widget.log(`exec: ${this.executingCmd}, queue: ${this.queue.length}`, MashupPlatform.log.INFO);
}

const execEnd = function execEnd() {
    setTimeout(() => {
        _execCommands.call(this, [], '');
    }, 0);
};

const commandList = {
    'addtile3dlayer': function (value) {
        import(/* webpackChunkName: "deck-gl-ext" */ './deck-gl-extension').then(module => {
            module.addTile3Dlayer(this.map, value);
            execEnd.call(this);
        });
    },
    'addhexagonlayer': function (value) {
        import(/* webpackChunkName: "deck-gl-ext" */ './deck-gl-extension').then(module => {
            module.addHexagonLayer(this.map, value);
            execEnd.call(this);
        });
    },
    'add3dterrainlayer': function (value) {
        import('./deck-gl-extension').then(module => {
            module.addGsiTerrainLayer(this.map, value);
            execEnd.call(this);
        });
    },
    'add3dtiles': function (value) {
        import(/* webpackChunkName: "3d-tiles" */ './mapbox-3d-tiles').then(module => {
            module.addMapbox3DTiles(this.map, value);
            execEnd.call(this);
        });
    },
    'addlayer': function (value) {
        if (value.source != null) {
            this.map.addSource(value.source.name, value.source.data);
        }
        this.map.addLayer(value.data, value.beforeId);
        execEnd.call(this);
    },
    'movelayer': function (value) {
        this.map.moveLayer(value.id, value.beforeId);
        execEnd.call(this);
    },
    'removelayer': function (value) {
        this.map.removeLayer(value.id);
        execEnd.call(this);
    },
    'setbaselayer': function (value) {
        this.map.setStyle(value.style, value.options);
        execEnd.call(this);
    },
    'addrasterlayer': function (value) {
        if (typeof value === 'string') {
            value = {map: value};
        }
        const id = value.name || value.map;
        const source = value.source || id;
        const rmap = RASTER_MAPS[value.map];

        this.map.addSource(source, {
            type: 'raster',
            tiles: [rmap.url],
            tileSize: 256,
        });
        this.map.addLayer({
            id: id,
            type: 'raster',
            source: source,
            minzoom: rmap.minZoomLevel,
            maxzoom: rmap.maxZoomLevel,
        });
        execEnd.call(this);
    },
    'rotatecamera': function (value) {
        if (!this.animating) {
            this.animating = true
            let rotateCamera = (value) => {
                if (this.animating) {
                    if (typeof value === 'number') {
                        // clamp the rotation between 0 -360 degrees
                        // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
                        this.map.rotateTo((value / 100) % 360, { duration: 0 });
                    } else {
                        this.map.rotateTo(value.bearing, value.options);
                    }
                    // Request the next frame of the animation.
                    requestAnimationFrame(rotateCamera);
                }
            }
            rotateCamera(value);
        }
        execEnd.call(this);
    },
    'stopcamera': function (value) {
        this.animating = false
        execEnd.call(this);
    },
    'attributioncontrol': function (value) {
        this.map.addControl(new maplibregl.AttributionControl(value));
        execEnd.call(this);
    },
    'setcenter': function (value) {
        this.map.setCenter(value);
    },
    'setpaintproperty': function (value) {
        this.map.setPaintProperty(value.LayerId, value.name, value.value);
        execEnd.call(this);
    },
    'panto': function (value) { // moveend
        this.map.panTo(value);
    },
    'flyto': function (value) { // moveend
        this.map.flyTo(value);
    },
    'setzoom': function (value) { // moveend
        this.map.setZoom(value);
    },
    'setpitch': function (value) { // pitchend
        setTimeout(() => {
            this.map.setPitch(value);
        }, 0);
    },
    'reset': function (value) {
        this.waiting = false;
        this.animating = false;
        this.queue = [];
        this.executingCmd = '';
    },
    'wait': function (value) {
        this.waiting = true;
        setTimeout(() => {
            this.waiting = false;
            _execCommands.call(this, [], '');
        }, value * 1000);
    },
    'clearFeatures': function (value) {
        this.geojsonSource.features = []
        this.geoUpdated = true
        setGeojsonSource.call(this)
    }
}
