/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the 3-Clause BSD License
 */

import { MapboxLayer } from '@deck.gl/mapbox';
import { Deck } from '@deck.gl/core';
import { ArcLayer, GeoJsonLayer, IconLayer, LineLayer, ScatterplotLayer } from '@deck.gl/layers';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { Tiles3DLoader } from '@loaders.gl/3d-tiles';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { Vector3 } from 'math.gl';

import { GsiTerrainLayer } from 'deckgl-gsi-terrain-layer';

const addGsiTerrainLayer = function addGsiTerrainLayer(map, value) {
    const id = value.data.id || '__gsiTerrain';
    const terrain_image = value.data.terrain_image || 'https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png';
    const surface_image = value.data.surface_image || 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg';
    const elevation_decoder = {
        scaler: value.data.scaler || 0.01,
        offset: value.data.offset || 0,
    };
    const layer = new GsiTerrainLayer({
        id: id,
        minZoom: 0,
        maxZoom: 15,
        elevationDecoder: elevation_decoder,
        elevationData: terrain_image,
        texture: surface_image,
    });
    addDeckglLayer(map, layer);
}

export { addGsiTerrainLayer };

const addTile3Dlayer = function addTile3Dlayer(map, value) {
    const id = value.data.id || '__tile-3d-layer';
    const offset = value.data.offset || 40;
    const tile3dLayer = new Tile3DLayer({
        id: id,
        pointSize: 1,
        data: value.data.url,
        loader: Tiles3DLoader,
        onTileLoad: (tileHeader) => {
            tileHeader.content.cartographicOrigin = new Vector3(
                tileHeader.content.cartographicOrigin.x,
                tileHeader.content.cartographicOrigin.y,
                tileHeader.content.cartographicOrigin.z - offset,
            );
        }
    });
    addDeckglLayer(map, tile3dLayer);
}

export { addTile3Dlayer };

const addHexagonLayer = function addHexagonLayer(map, value) {
    const hexagonLayer = new HexagonLayer(value);
    addDeckglLayer(map, hexagonLayer);
}

export { addHexagonLayer };

const addArcLayer = function addArcLayer(map, value) {
    const hexagonLayer = new ArcLayer(value);
    addDeckglLayer(map, hexagonLayer);
}

export { addArcLayer };

const addScatterplotLayer = function addScatterplotLayer(map, value) {
    const hexagonLayer = new ScatterplotLayer(value);
    addDeckglLayer(map, hexagonLayer);
}

export { addScatterplotLayer };

const addIconLayer = function addIconLayer(map, value) {
    const hexagonLayer = new IconLayer(value);
    addDeckglLayer(map, hexagonLayer);
}

export { addIconLayer };

const addLineLayer = function addLineLayer(map, value) {
    const hexagonLayer = new LineLayer(value);
    addDeckglLayer(map, hexagonLayer);
}

export { addLineLayer };

const addGeoJsonLayer = function addGeoJsonLayer(map, value) {
    const hexagonLayer = new GeoJsonLayer(value);
    addDeckglLayer(map, hexagonLayer);
}

export { addGeoJsonLayer };

let layers = [];
let deck = null;

const addDeckglLayer = function addDeckglLayer(map, newLayer) {
    const id = '__deckgl-layer';

    layers = layers.filter(layer => layer.id != newLayer.id);
    layers.push(newLayer);

    if (!deck) {
        deck = new Deck({
            gl: map.painter.context.gl,
            layers: layers
        });
        map.addLayer(new MapboxLayer({id: id, deck}));
    } else {
        deck.setProps({layers: layers});
    }
}