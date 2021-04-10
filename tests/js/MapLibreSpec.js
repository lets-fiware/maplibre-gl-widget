/*
 * MapLibre GL
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the 3-Clause BSD License
 */

/* globals $, MashupPlatform, MockMP, maplibre */

(function () {

    "use strict";

    describe("MapLibre", function () {

        var widget;

        beforeAll(function () {
            window.MashupPlatform = new MockMP({
                type: 'widget'
            });
        });

        beforeEach(function () {
            MashupPlatform.reset();
            widget = new MapLibre();
        });

        it("Dummy test", function () {
            expect(widget).not.toBe(null);
        });

    });

})();
