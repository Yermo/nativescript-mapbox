#!/bin/bash

# invoke with -d (for debug) to avoid stripping out console logs.

SOURCE_DIR=../src;
TO_SOURCE_DIR=src;
PACK_DIR=package;
ROOT_DIR=..;
PUBLISH=--publish
DEBUG=$1

install(){
    npm i
}

pack() {

    echo 'Clearing /src and /package...'
    node_modules/.bin/rimraf "$TO_SOURCE_DIR"
    node_modules/.bin/rimraf "$PACK_DIR"

    # copy src
    echo 'Copying src...'
    node_modules/.bin/ncp "$SOURCE_DIR" "$TO_SOURCE_DIR"

    # copy README & LICENSE to src
    echo 'Copying README and LICENSE to /src...'
    node_modules/.bin/ncp "$ROOT_DIR"/LICENSE "$TO_SOURCE_DIR"/LICENSE
    node_modules/.bin/ncp "$ROOT_DIR"/README.md "$TO_SOURCE_DIR"/README.md

    # compile package and copy files required by npm
    echo 'Building /src...'
    cd "$TO_SOURCE_DIR"
    node_modules/.bin/tsc

    if [ "$DEBUG" != "-d" ]; then
      cd ..
      echo 'Removing console.log() ...'

      node_modules/remove-console-logs/remove-console-logs --io src/geo.utils.js  
      node_modules/remove-console-logs/remove-console-logs --io src/mapbox.android.js  
      node_modules/remove-console-logs/remove-console-logs --io src/mapbox.ios.js  
      node_modules/remove-console-logs/remove-console-logs --io src/mapbox.common.js  

      cd "$TO_SOURCE_DIR"

    fi

    cd ..

    echo 'Creating package...'
    # create package dir
    mkdir "$PACK_DIR"

    # create the package
    cd "$PACK_DIR"
    npm pack ../"$TO_SOURCE_DIR"

    # delete source directory used to create the package
    cd ..
    node_modules/.bin/rimraf "$TO_SOURCE_DIR"
}

install && pack
