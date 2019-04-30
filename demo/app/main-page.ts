import * as observable from "tns-core-modules/data/observable";
import * as pages from "tns-core-modules/ui/page";
import { Color } from "tns-core-modules/color";
import { HelloWorldModel } from "./main-view-model";
import { MapboxViewApi, LatLng } from "nativescript-mapbox";

// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
  let page = <pages.Page>args.object;
  page.bindingContext = new HelloWorldModel();
}

function onLocationPermissionGranted(args) {
  let map: MapboxViewApi = args.map;
  console.log("onLocationPermissionGranted, map: " + map);
}

function onLocationPermissionDenied(args) {
  let map: MapboxViewApi = args.map;
  console.log("onLocationPermissionDenied, map: " + map);
}

function onMapReady(args) {
  let map: MapboxViewApi = args.map;

  // you can tap into the native MapView objects (MGLMapView for iOS and com.mapbox.mapboxsdk.maps.MapView for Android)
  const nativeMapView = args.ios ? args.ios : args.android;
  console.log(`Mapbox onMapReady for ${args.ios ? "iOS" : "Android"}, native object received: ${nativeMapView}`);

  map.setOnMapClickListener((point: LatLng) => console.log(`Map tapped: ${JSON.stringify(point)}`));

  map.setOnMapLongClickListener((point: LatLng) => console.log(`Map longpressed: ${JSON.stringify(point)}`));

  // this works perfectly fine, but generates a lot of noise
  // map.setOnScrollListener((point?: LatLng) => console.log(`Map scrolled: ${JSON.stringify(point)}`));

  // this allows json style loading for XYZ or TMS tiles source
  map.setMapStyle("~/OSM-map-style.json")
      .then(() => {

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
        ).then(() => {
          console.log("Markers added");
          setTimeout(() => {
            map.queryRenderedFeatures({
              point: {
                lat: 52.3602160,
                lng: 4.8891680
              }
            }).then(result => console.log(JSON.stringify(result)));
          }, 1000);
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
      });

}

exports.onMapReady = onMapReady;
exports.onLocationPermissionGranted = onLocationPermissionGranted;
exports.onLocationPermissionDenied = onLocationPermissionDenied;
