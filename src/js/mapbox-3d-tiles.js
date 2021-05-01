/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the 3-Clause BSD License
 */

import Mapbox3DTiles from 'mapbox-3dtiles/Mapbox3DTiles';

const addMapbox3DTiles = function AddMapbox3DTiles(map, value) {
    const tiles = new Mapbox3DTiles.Layer(value.data)
    map.addLayer(tiles)
}

export { addMapbox3DTiles };
