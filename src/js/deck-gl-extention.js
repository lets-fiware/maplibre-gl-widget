/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the 3-Clause BSD License
 */

import { MapboxLayer } from '@deck.gl/mapbox';
import { Deck } from '@deck.gl/core';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { Tiles3DLoader } from '@loaders.gl/3d-tiles';
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
    const deck = new Deck({
        gl: map.painter.context.gl,
        layers: [
            layer
        ]
    });
    map.addLayer(new MapboxLayer({id: id, deck}));
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
    const deck = new Deck({
        gl: map.painter.context.gl,
        layers: [
            tile3dLayer
        ]
    });
    map.addLayer(new MapboxLayer({id: id, deck}));
}

export { addTile3Dlayer };
