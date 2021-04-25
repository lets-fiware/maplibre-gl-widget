#!/bin/sh
set -ue
cd $(dirname $0)
cd ..

if [ ! -d node_modules/mapbox-3dtiles ]; then
    git clone --depth=1 https://github.com/Geodan/mapbox-3dtiles.git node_modules/mapbox-3dtiles
fi

if [ ! -d build/map/map/gsi ]; then 
    mkdir -p build/map/map/gsi

    for file in std.json std_vertical.json pale.json blank.json
    do
        curl -sS "https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js/master/${file}" --output "build/map/map/gsi/${file}"
    done
 
    for file in building3d.json building3ddark.json building3dphoto.json
    do
        curl -sS "https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-3d-like-building/master/${file}" --output "build/map/map/gsi/${file}"
    done

fi   
