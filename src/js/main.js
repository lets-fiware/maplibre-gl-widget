/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the 3-Clause BSD License
 */

import MapLibre from './MapLibre';

"use strict";

(function () {

    const parseInputEndpointData = function parseInputEndpointData(data) {
        if (data == null) {
            data = [];
        }

        if (typeof data === "string") {
            try {
                data = JSON.parse(data);
            } catch (e) {
                throw new MashupPlatform.wiring.EndpointTypeError();
            }
        } else if (typeof data !== "object") {
            throw new MashupPlatform.wiring.EndpointTypeError();
        }
        return data;
    };

    var maplibre = new MapLibre();
    maplibre.init();

    MashupPlatform.wiring.registerCallback('layerInfo', (command_info) => {
        command_info = parseInputEndpointData(command_info);

        switch (command_info.action) {
        case "addLayer":
            maplibre.addLayer(command_info);
            break;
        case "moveLayer":
            maplibre.moveLayer(command_info);
            break;
        case "removeLayer":
            maplibre.removeLayer(command_info);
            break;
        case "setBaseLayer":
            maplibre.setBaseLayer(command_info);
            break;
        case "command":
            maplibre.command(command_info);
            break;
        default:
            throw new MashupPlatform.wiring.EndpointValueError();
        }
    });

    MashupPlatform.wiring.registerCallback('poiInput', (poi_info) => {
        poi_info = parseInputEndpointData(poi_info);

        if (!Array.isArray(poi_info)) {
            poi_info = [poi_info];
        }
        maplibre.registerPoIs(poi_info);
    });

    MashupPlatform.wiring.registerCallback('replacePoIs', (poi_info) => {
        poi_info = parseInputEndpointData(poi_info);

        if (!Array.isArray(poi_info)) {
            poi_info = [poi_info];
        }
        maplibre.replacePoIs(poi_info);
    });

    MashupPlatform.wiring.registerCallback('poiInputCenter', (poi_info) => {
        poi_info = parseInputEndpointData(poi_info);

        if (!Array.isArray(poi_info)) {
            poi_info = [poi_info];
        }

        maplibre.centerPoI(poi_info);
    });

    MashupPlatform.wiring.registerCallback('deletePoiInput', (poi_info) => {
        poi_info = parseInputEndpointData(poi_info);

        if (!Array.isArray(poi_info)) {
            poi_info = [poi_info];
        }
        maplibre.removePoIs(poi_info);
    });

    MashupPlatform.wiring.registerCallback('commnadInput', (commandList) => {
        maplibre.execCommands(commandList);
    });

})();
