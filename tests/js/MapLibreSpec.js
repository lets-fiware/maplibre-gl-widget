/*
 * MapLibre GL
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021-2023 Kazuhito Suda
 * Licensed under the 3-Clause BSD License
 */

/* globals MashupPlatform, MockMP */

(function () {

    "use strict";

    describe("MapLibre", function () {

        var widget;

        beforeAll(function () {
            window.MashupPlatform = new MockMP({
                type: 'widget',
                prefs: {
                    'initialCenter': '',
                    'initialZoom': '6',
                    'initialPitch': '0',
                    'mapStyle': 'OSM',
                    'customStyle': '',
                    'minzoom': '4',
                    'maxzoom': '18',
                    'minpitch': '0',
                    'maxpitch': '60',
                    'navigationControl': 'off',
                    'geolocateControl': 'off',
                    'fullscreenControl': 'off',
                    'scaleControl': 'off',
                    'attributionControl': false,
                    'debug': false
                },
                inputs: ['layerInfo', 'poiInput', 'poiInputCenter', 'replacePoIs', 'deletePoiInput', 'commnadInput'],
                outputs: ['poiOutput', 'poiListOutput']
            });
        });

        beforeEach(function () {
            MashupPlatform.reset();
            MashupPlatform.prefs.set.calls.reset();
            // widget = new MapLibre();
        });

        it("Dummy test", function () {
            expect(widget).not.toBe(null);
        });

    });

})();
