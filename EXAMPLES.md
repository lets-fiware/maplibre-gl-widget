# Examples

## Input endpoint

### Insert/Update PoIs

```
[
  {
    "id": "place001",
    "type": "PointOfInterest",
    "name": "Madrid",
    "location": {
      "type": "Point",
      "coordinates": [-3.703,40.417]
    },
    "data": {},
    "icon": {
      "fontawesome": "fa-star"
    }
  }
]
```

### Center PoIs

```
[
  {
    "id": "place002",
    "type": "PointOfInterest",
    "name": "Santander",
    "location": {
      "type": "Point",
      "coordinates": [-3.8461563, 43.4613391]
    },
    "data": {},
    "icon": {
      "fontawesome": {
        "glyph": "fa-utensils",
        "fill": "red",
        "form": "box"
      }
    }
  }
]
```

### Replace PoIs

```
[
  {
    "id": "place003",
    "type": "PointOfInterest",
    "name": "Málaga",
    "location": {
      "type": "Point",
      "coordinates": [-4.5193062, 36.7182015]
    },
    "data": {},
    "icon": {
      "fontawesome": {
        "glyph": "fa-bus",
        "fill": "orange",
        "form": "circle"
      }
    }
  }
]
```
### Delete PoIs

```
[
  {
    "id": "place001"
  }
]
```

### Execute command input endpoint

```
[
  {
    "type": "setPitch",
    "value": 60
  },
  {
    "type": "flyTo",
    "value": {
      "center": [
        4.8988217,
        52.3779101
      ],
      "zoom": 17,
      "speed": 0.7,
      "essential": true
    }
  },
  {
    "type": "add3DTiles",
    "value": {
      "data": {
        "id": "amsterdam",
        "url": "https://beta.geodan.nl/data/buildingtiles_amsterdam_3857/tileset.json",
        "opacity": 0.5,
        "color": "#ffff00"
      }
    }
  },
  {
    "type": "rotateCamera",
    "value": 0
  },
  {
    "type": "wait",
    "value": 20
  },
  {
    "type": "stopcamera"
  }
]
```

## 3D terrain in Japan

```
[
  {
    "type": "add3dterrainlayer"
  },
  {
    "type": "setPitch",
    "value": 60
  },
  {
    "type": "flyTo",
    "value": {
      "center": [
        138.7185872,
        35.3606422
      ],
      "zoom": 11.5,
      "speed": 0.7,
      "essential": true
    }
  }
]
```

## Tile 3D Layer

```
[
  {
    "type": "addtile3dlayer",
    "value": {
      "data": {
        "url": "https://[url]/tileset.json"
      }
    }
  }
]
```

## Raster Layer

```
[
  {
    "type": "addlayer",
    "value": {
      "source": {
        "name": "gsi_pale",
        "data": {
          "type": "raster",
          "tiles": ["https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"],
          "tileSize": 256
        }
      },
      "data": {
        "id": "gsi_pale",
        "type": "raster",
        "source": "gsi_pale",
        "minzoom": 0,
        "maxzoom": 18
      }
    }
  }
]
```

```
[
  {
    "type": "addRasterLayer",
    "value": "GSI_PHOTO"
  }
]
```

## PoI style

### default

```
"style": {
  "fontSymbol": {
    "glyph": "fa-star",
    "size": "30px",
    "color": "#fff",
    "fillColor": "#1f2f54",
    "border": "2",
    "shadow": "0 0 2px #000",
    "form": "poi"
  }
}
```

- glyph: Font Awesome 4 icon
- color: #xxxxxx or color name
- fillColor: #xxxxxx or  color name

#### color name

| name        | value   |
| ----------- | ------- |
| transparent | (empty) | 
| white       | #ffffff |
| silver      | #c0c0c0 |
| gray        | #808080 |
| black       | #000000 |
| red         | #ff0000 |
| maroon      | #800000 |
| yellow      | #ffff00 |
| olive       | #808000 |
| lime        | #00ff00 |
| green       | #008000 |
| aqua        | #00ffff |
| teal        | #008080 |
| blue        | #0000ff |
| navy        | #000080 |
| fuchsia     | #ff00ff |
| purple      | #800080 |
| orange      | #ffa500 |
| naivy       | #1f2f54 |
| fi-cyan     | #5dc0cf |
| fi-naivy    | #002e67 |
| fi-green    | #15a97c |
| fi-grey     | #b1b2b4 |
| fi-red      | #d36b59 |
