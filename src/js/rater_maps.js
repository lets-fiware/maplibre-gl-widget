/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the 3-Clause BSD License
 */

const maps = {
    // https://maps.gsi.go.jp/development/ichiran.html
    GSI_STD: {
        title: '地理院 標準地図',
        attributions: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
        minZoomLevel: 2,
        maxZoomLevel: 18,
        projection: "EPSG:3857"
    },
    GSI_PALE: {
        title: '地理院 淡色地図',
        attributions: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
        minZoomLevel: 5,
        maxZoomLevel: 18,
        projection: "EPSG:3857"
    },
    GSI_ENG: {
        title: '地理院 English',
        attributions: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        url: "https://cyberjapandata.gsi.go.jp/xyz/english/{z}/{x}/{y}.png",
        minZoomLevel: 5,
        maxZoomLevel: 11,
        projection: "EPSG:3857"
    },
    GSI_BLANK: {
        title: '地理院 白地図',
        attributions: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        url: "https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png",
        minZoomLevel: 5,
        maxZoomLevel: 14,
        projection: "EPSG:3857"
    },
    GSI_PHOTO: {
        title: '地理院 写真',
        attributions: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
        minZoomLevel: 2,
        maxZoomLevel: 18,
        projection: "EPSG:3857"
    },
    GSI_ORT: {
        title: '地理院 写真',
        attributions: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        url: "https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg",
        minZoomLevel: 15,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    GSI_RELIEF: {
        title: '地理院 色別標高図',
        attributions: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        url: "https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png",
        minZoomLevel: 5,
        maxZoomLevel: 15,
        projection: "EPSG:3857"
    },
    GSI_AFM: {
        title: '地理院 活断層図',
        attributions: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        url: "https://cyberjapandata.gsi.go.jp/xyz/afm/{z}/{x}/{y}.png",
        minZoomLevel: 11,
        maxZoomLevel: 16,
        projection: "EPSG:3857"
    },
    GSI_SHINSUISHIN: { // 洪水浸水想定区域(想定最大規模)
        title: '洪水浸水想定区域',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        url: "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png",
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    GSI_SHINSUISHIN_KUNI: { // 洪水浸水想定区域(想定最大規模)_国管理河川
        title: '洪水浸水想定区域_国管理河川',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        url: "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_kuni_data/{z}/{x}/{y}.png",
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    GSI_TSUNAMI: { // 津波浸水想定
        title: '津波浸水想定',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        url: "https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png",
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    GSI_DOSEKIRYUKEIKAIKUIKI: { // 土砂災害警戒区域(土石流)
        title: '土砂災害警戒区域(土石流)',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        url: "https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png",
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    GSI_KYUKEISHAKEIKAIKUIKI: { // 土砂災害警戒区域(急傾斜地の崩壊)
        title: '土砂災害警戒区域(急傾斜地の崩壊)',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        url: "https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png",
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    GSI_JISUBERIKEIKAIKUIKI: { // 土砂災害警戒区域(地滑り)
        title: '土砂災害警戒区域(地滑り)',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        url: 'https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png',
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"

    },
    GSI_DOSEKIRYUKIKENKEIRYU: { // 土石流危険渓流
        title: '土石流危険渓流',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        url: 'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukikenkeiryu/{z}/{x}/{y}.png',
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    GSI_KYUKEISYACHIHOUKAI: { // 急傾斜地崩壊危険箇所
        title: '急傾斜地崩壊危険箇所',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        url: 'https://disaportaldata.gsi.go.jp/raster/05_kyukeisyachihoukai/{z}/{x}/{y}.png',
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    GSI_JISUBERIKIKENKASYO: { // 地すべり危険箇所
        title: '地すべり危険箇所',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        url: 'https://disaportaldata.gsi.go.jp/raster/05_jisuberikikenkasyo/{z}/{x}/{y}.png',
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    GSI_NADAREKIKENKASYO: { // 雪崩危険箇所
        title: '雪崩危険箇所',
        attributions: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html" target="_blank">ハザードマップ</a>',
        minZoomLevel: 2,
        maxZoomLevel: 17,
        projection: "EPSG:3857"
    },
    OSM: {
        title: 'Open Street Map',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attributions: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        minZoomLevel: 0,
        maxZoomLevel: 18,
    },
};

export {maps as RASTER_MAPS };