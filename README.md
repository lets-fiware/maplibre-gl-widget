# MapLibre GL widget

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

In order to build this widget, you need to download grunt:

```bash
sudo npm install -g grunt-cli
```

And now, you can use grunt:

```bash
grunt
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

| Libraries                                                             | OSS License          |
| --------------------------------------------------------------------- | -------------------- |
| [maplibre/maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) | 3-Clause BSD License |
| [Geodan/mapbox-3dtiles](https://github.com/Geodan/mapbox-3dtiles)     | 3-Clause BSD License |
| [mrdoob/three.js](https://github.com/mrdoob/three.js/)                | MIT License          |

The dependencies of dependencies have been omitted from the list.

## Copyright and License

Copyright (c) 2021 Kazuhito Suda<br>
Licensed under the [3-Clause BSD License](./LICENSE).
