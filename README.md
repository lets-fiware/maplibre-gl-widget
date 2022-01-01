# MapLibre GL widget

[![](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/visualization.svg)](https://www.fiware.org/developers/catalogue/)
[![License: BSD-3-Clause](https://img.shields.io/github/license/lets-fiware/maplibre-gl-widget.svg)](https://opensource.org/licenses/BSD-3-Clause)<br/>
![Build](https://github.com/lets-fiware/maplibre-gl-widget/workflows/Build/badge.svg)
![GitHub all releases](https://img.shields.io/github/downloads/lets-fiware/maplibre-gl-widget/total)

This is a map viewer widget uses MapLibre GL. It can receive Layers or Point of Interest data and display them on the map.

Build
-----

Be sure to have installed [Node.js](http://node.js) in your system. For example, you can install it on Ubuntu and Debian running the following commands:

```bash
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs
sudo apt-get install npm
```

Install other npm dependencies by running:

```bash
npm install
```

In order to build this widget, you can use npm :

```bash
npm run build
```

or

```bash
npm run dev
```

If everything goes well, you will find a wgt file in the `dist` folder.

## Documentation

Documentation about how to use this widget is available on the
[User Guide](src/doc/userguide.md). Anyway, you can find general information
about how to use widgets on the
[WireCloud's User Guide](https://wirecloud.readthedocs.io/en/stable/user_guide/)
available on Read the Docs.

## Third party libraries

The Maplibre GL widget makes use of the following libraries:

| Libraries                                                                                 | OSS License          |
| ----------------------------------------------------------------------------------------- | -------------------- |
| [maplibre/maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js)                     | 3-Clause BSD License |
| [lets-fiware/mapbox-3dtiles](https://github.com/lets-fiware/mapbox-3dtiles)               | 3-Clause BSD License |
| [mrdoob/three.js](https://github.com/mrdoob/three.js/)                                    | MIT License          |
| [Turfjs/turf](https://github.com/Turfjs/turf)                                             | MIT License          |
| [visgl/deck.gl](https://github.com/visgl/deck.gl)                                         | MIT License          |
| [visgl/loaders.gl](https://github.com/visgl/loaders.gl)                                   | MIT License          |
| [uber-web/math.gl](https://github.com/uber-web/math.gl)                                   | MIT License          |
| [Kanahiro/deckgl-gsi-terrain-layer](https://github.com/Kanahiro/deckgl-gsi-terrain-layer) | MIT License          |

The dependencies of dependencies have been omitted from the list.

## Copyright and License

Copyright (c) 2021-2022 Kazuhito Suda<br>
Licensed under the [3-Clause BSD License](./LICENSE).
