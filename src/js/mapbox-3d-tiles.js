/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021-2023 Kazuhito Suda
 * Licensed under the 3-Clause BSD License
 */

import Mapbox3DTiles from '@lets-fiware/mapbox-3dtiles';

const addMapbox3DTiles = function AddMapbox3DTiles(map, value) {
    const tiles = new Mapbox3DTiles.Layer(value.data)
    map.addLayer(tiles)
}

export { addMapbox3DTiles };
