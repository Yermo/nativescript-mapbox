import * as observable from "@nativescript/core/data/observable";
import * as pages from "@nativescript/core/ui/page";
import { Color } from "@nativescript/core";
import { HelloWorldModel } from "./main-view-model";
import { MapboxViewApi, LatLng } from "nativescript-mapbox";

import { SETTINGS } from '../../mapbox_config';

// ----------------------------------------------------------------

/**
* Event handler for Page 'loaded' event attached in main-page.xml
*/

export function pageLoaded(args: observable.EventData) {

  let page = <pages.Page>args.object;

  console.log( "main-page::pageLoaded(): callback" );

  // avoid creating duplicates of the model onPause/onResume.

  if ( ! page.bindingContext ) {
    page.bindingContext = new HelloWorldModel();

    // propagate the ACCESS_TOKEN to the XML.

    page.bindingContext.set( 'ACCESS_TOKEN', SETTINGS.mapbox_access_token );
  }
}

// -----------------------------------------------------------

export function onLocationPermissionGranted(args) {

  console.log( "main-page::locationPermissionGranted(): callback" );

  let map: MapboxViewApi = args.map;
  console.log("onLocationPermissionGranted, map: " + map);
}

// -----------------------------------------------------------

export function onLocationPermissionDenied(args) {

  console.log( "main-page::locationPermissionDenied(): callback" );

  let map: MapboxViewApi = args.map;
  console.log( "main-page::onLocationPermissionDenied, map: " + map );

}

// -----------------------------------------------------------

/**
* callback when map is ready
*
* This is called once the map is ready to use.
*
* NOTE: if this function is not exported, the component-builder will
* not pick it up and it will never get called. Something changed
* as this used to work without the export. This took basically forever to figure
* out.
*/

export function onMapReady(args) {

  console.log( "main-page::mapReady(): callback" );

  let map: MapboxViewApi = args.map;

  // you can tap into the native MapView objects (MGLMapView for iOS and com.mapbox.mapboxsdk.maps.MapView for Android)

  const nativeMapView = args.ios ? args.ios : args.android;

  console.log( `main-page::Mapbox onMapReady for ${args.ios ? "iOS" : "Android"}, native object received: ${nativeMapView}` );

  map.setOnMapClickListener( (point: LatLng) => {
    console.log(`Map tapped: ${JSON.stringify(point)}`);
    return true;
  });

  map.setOnMapLongClickListener( (point: LatLng) => {
    console.log(`Map longpressed: ${JSON.stringify(point)}`);
    return true;
  });

  // this works perfectly fine, but generates a lot of noise
  // map.setOnScrollListener((point?: LatLng) => console.log(`Map scrolled: ${JSON.stringify(point)}`));

  // this allows json style loading for XYZ or TMS tiles source
  // map.setMapStyle("~/OSM-map-style.json");

  // .. or use the convenience methods exposed on args.map, for instance:

  console.log( "main-page: before adding marker" );

  map.addMarkers([
    {
      id: 2,
      lat: 52.3602160,
      lng: 4.8891680,
      title: 'One-line title here', // no popup unless set
      subtitle: 'Really really nice location',
      iconPath: 'res/markers/green_pin_marker.png',
      onTap: () => {
        console.log("main-page 'Nice location' marker tapped");
      },
      onCalloutTap: () => {
        console.log("main-page 'Nice location' marker callout tapped");
      }
    }]
  ).then(() => {
    console.log("main-page Markers added");
    setTimeout(() => {
      map.queryRenderedFeatures({
        point: {
          lat: 52.3602160,
          lng: 4.8891680
        }
      }).then(result => console.log(JSON.stringify(result)));
    }, 1000);
  }).catch( ( error ) => {
    console.error( "main-page: error adding markers:", error );
  });

  setTimeout(() => {
    map.setViewport(
        {
          bounds: {
            north: 52.4820,
            east: 5.1087,
            south: 52.2581,
            west: 4.6816
          },
          animated: true
        }
    );
  }, 3000);

  // note that this makes the app crash with/since Android SDK 6.1.2 and 6.1.3 (not sure about more recent versions)
  // setTimeout(() => {
  //   map.setMapStyle(MapStyle.DARK);
  // }, 6000);

  setTimeout(() => {
    map.addPolyline({
      id: 10,
      color: new Color("yellow"),
      points: [
        {
          lat: 52.4,
          lng: 5
        },
        {
          lat: 51.9,
          lng: 5.1
        },
        {
          lat: 51.8,
          lng: 4.95
        }
      ]
    });
  }, 10000);

  setTimeout(() => {
    map.setCenter({
      lat: 52.4820,
      lng: 5.1087,
      animated: true
    });
  }, 11000);

  setTimeout(() => {
    map.setZoomLevel({
      level: 7,
      animated: true
    });
  }, 16000);

  // setTimeout(() => {
  //   map.removeMarkers([2]);
  // }, 10000);

  setTimeout(() => {
    map.setTilt({
      tilt: 25,
      duration: 2500
    });
  }, 21000);

  // setTimeout(() => {
  //   map.animateCamera({
  //     target: {
  //       lat: 51.8,
  //       lng: 5
  //     },
  //     tilt: 20,
  //     zoomLevel: 8,
  //     duration: 6000
  //   });
  // }, 14000);

  setTimeout(() => {
    map.removePolylines([10]);
  }, 24000);

  // this works just fine, but it interferes with the programmatic map so not doing this in the demo
  // setTimeout(() => {
  //   map.trackUser({
  //     mode: "FOLLOW_WITH_HEADING",
  //     animated: true
  //   });
  // }, 25000);
}

// END
