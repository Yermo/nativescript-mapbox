import * as observable from "tns-core-modules/data/observable";
import * as pages from "tns-core-modules/ui/page";
import { isAndroid } from "tns-core-modules/platform";
import { Color } from "tns-core-modules/color";
import { HelloWorldModel } from "./main-view-model";
import { MapboxViewApi, MapStyle, LatLng } from "nativescript-mapbox";

// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
  let page = <pages.Page>args.object;
  page.bindingContext = new HelloWorldModel();
}

function onLocationPermissionGranted(args) {
  let map: MapboxViewApi = args.map;
  console.log("onLocationPermissionGranted, map: " + map);
}

function onMapReady(args) {
  let map: MapboxViewApi = args.map;

  // you can tap into the native MapView objects (MGLMapView for iOS and com.mapbox.mapboxsdk.maps.MapView for Android)
  const nativeMapView = args.ios ? args.ios : args.android;
  console.log(`Mapbox onMapReady for ${args.ios ? "iOS" : "Android"}, native object received: ${nativeMapView}`);

  map.setOnMapClickListener((latLng => {
    console.log(">> latLng clicked = " + JSON.stringify(latLng));
  }));

  if (isAndroid) {
    map.setOnPolygonClickListener((polygon => {
      console.log(">> polygon clicked = " + JSON.stringify(polygon));
    }));

    map.setOnPolylineClickListener((polyline => {
      console.log(">> polyline clicked = " + JSON.stringify(polyline));
    }));
  }  

  // .. or use the convenience methods exposed on args.map, for instance:
  map.addMarkers([
    {
      id: 2,
      lat: 52.3602160,
      lng: 4.8891680,
      title: 'One-line title here', // no popup unless set
      subtitle: 'Really really nice location',
      iconPath: 'res/markers/green_pin_marker.png',
      onTap: () => {
        console.log("'Nice location' marker tapped");
      },
      onCalloutTap: () => {
        console.log("'Nice location' marker callout tapped");
      }
    }]
  );

  setTimeout(() => {
    map.setOnMapClickListener((point: LatLng) => {
      console.log(`Map clicked: ${JSON.stringify(point)}`);
    });

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

  setTimeout(() => {
    map.setMapStyle(MapStyle.TRAFFIC_NIGHT);
  }, 6000);

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
}

exports.onMapReady = onMapReady;
exports.onLocationPermissionGranted = onLocationPermissionGranted;