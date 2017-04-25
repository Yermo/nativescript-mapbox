import * as observable from "data/observable";
import * as pages from "ui/page";
import { HelloWorldModel } from "./main-view-model";
import { MapboxViewApi, MapStyle, LatLng } from "nativescript-mapbox";
import { Color } from "color";

// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
  let page = <pages.Page>args.object;
  page.bindingContext = new HelloWorldModel();
}

function onMapReady(args) {
  let map: MapboxViewApi = args.map;
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
    map.setMapStyle(MapStyle.DARK);
  }, 5000);

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
  }, 6000);

  setTimeout(() => {
    map.setCenter({
      lat: 52.4820,
      lng: 5.1087,
      animated: true
    });
  }, 6100);

  setTimeout(() => {
    map.setZoomLevel({
      level: 7,
      animated: true
    });
  }, 8000);

  setTimeout(() => {
    map.removeMarkers([2]);
  }, 10000);

  setTimeout(() => {
    map.setTilt({
      tilt: 25,
      duration: 2500
    });
  }, 10000);

  setTimeout(() => {
    map.animateCamera({
      target: {
        lat: 51.8,
        lng: 5
      },
      tilt: 30,
      zoomLevel: 3,
      duration: 7000
    });
  }, 14000);

  // setTimeout(() => {
  //   map.removePolylines([10]);
  // }, 15000);
}

exports.onMapReady = onMapReady;