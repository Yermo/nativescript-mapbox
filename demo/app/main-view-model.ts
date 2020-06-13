import { Observable } from "tns-core-modules/data/observable";
import { Color } from "tns-core-modules/color";
import { alert, AlertOptions } from "tns-core-modules/ui/dialogs";

import { Frame, topmost } from "tns-core-modules/ui/frame";

import { Button } from "tns-core-modules/ui/button";
import { Page } from "tns-core-modules/ui/page";
import { Label } from "tns-core-modules/ui/label";
import { ContentView } from "tns-core-modules/ui/content-view";

import * as platform from "tns-core-modules/platform";
import { MapboxView, Mapbox, MapStyle, OfflineRegion, LatLng, Viewport, DownloadProgress, MapboxMarker } from "nativescript-mapbox";

import { SETTINGS } from '../../mapbox_config';

const isIOS = platform.device.os === platform.platformNames.ios;

const ACCESS_TOKEN = SETTINGS.mapbox_access_token;

// -------------------------------------------------------------------------------

export class HelloWorldModel extends Observable {

  private mapboxView: MapboxView;
  private mapbox: Mapbox;

  constructor() {
    super();
    console.log( "HelloWorldModel::constructor()" );
  }

  // --------------------------------------------------------------------

  /**
  * show a map programmatically
  */

  public doShow( args ): void {

    console.log( "HelloWorldModel::doShow(): top" );

    // the idea is to get a reference to a container component,
    // in this case the StackLayout, and then to add a programmatically created
    // MapboxView as a child of that container. 
    //
    // A button click got us here. From that we can get the Button object and that then
    // gives us a reference to the current page from which we can look up components by id.

    const button : Button = args.object;
    const page : Page = button.page;

    const contentView : ContentView = <ContentView>page.getViewById( 'mapContainer' );

    const settings = {

      accessToken: ACCESS_TOKEN,

      // NOTE: passing in the container here.

      container: contentView,
      style: MapStyle.LIGHT,
      margins: {
        left: 18,
        right: 18,
        top: isIOS ? 390 : 454,
        bottom: isIOS ? 50 : 8
      },
      center: {
        lat: 52.3702160,
        lng: 4.8951680
      },
      zoomLevel: 9, // 0 (most of the world) to 20, default 0
      showUserLocation: true, // default false
      hideAttribution: true, // default false
      hideLogo: true, // default false
      hideCompass: false, // default false
      disableRotation: false, // default false
      disableScroll: false, // default false
      disableZoom: false, // default false
      disableTilt: false, // default false
      markers: [
        {
          id: 1,
          lat: 52.3732160,
          lng: 4.8941680,
          title: 'Nice location',
          subtitle: 'Really really nice location',
          iconPath: 'res/markers/green_pin_marker.png',
          onTap: () => console.log("'Nice location' marker tapped"),
          onCalloutTap: () => console.log("'Nice location' marker callout tapped")
        }
      ]
    };

    console.log( "main-view-model:: doShow(): creating new MapboxView." );

    const mapView = new MapboxView();

    mapView.setConfig( settings );

    // Bind some event handlers onto our newly created map view. 

    mapView.on( 'mapReady', ( args : any ) => {

      console.log( "main-view-model: onMapReady fired." );

      // this is an instance of class MapboxView

      this.mapboxView = args.map;

      // get a reference to the Mapbox API shim object so we can directly call its methods.

      this.mapbox = this.mapboxView.getMapboxApi();

      this.mapbox.setOnMapClickListener( point => {
        console.log(`>> Map clicked: ${JSON.stringify(point)}`);
        return true;
      });

      this.mapbox.setOnMapLongClickListener( point => {
        console.log(`>> Map longpressed: ${JSON.stringify(point)}`);
        return true;
      });

      this.mapbox.setOnScrollListener((point: LatLng) => {
        // console.log(`>> Map scrolled`);
      });

      this.mapbox.setOnFlingListener(() => {
        console.log(`>> Map flinged"`);
      }).catch( err => console.log(err) );

    });

    console.log( "main-view-model:: doShow(): adding MapboxView to container." );

    contentView.content = mapView;

  }

  // -------------------------------------------------------------------------------

  public doHide(): void {
    this.mapbox.hide().then(
        () => {
          console.log("HelloWorldModel::doHide(): Mapbox hide done");
        },
        (error: string) => {
          console.log("mapbox hide error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doDestroy(): void {
    this.mapbox.destroy().then(
        () => {
          console.log( "HelloWorldModel::doDestroy(): Mapbox destroyed" );
        },
        (error: string) => {
          console.log("mapbox destroy error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doUnhide(): void {
    this.mapbox.unhide().then(
        () => {
          console.log("HelloWorldModel::doUnHide(): Mapbox doUnhide done");
        },
        (error: string) => {
          console.log("mapbox doUnhide error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doRemoveAllMarkers(): void {
    this.mapbox.removeMarkers().then(
        () => console.log("Mapbox doRemoveAllMarkers done"),
        error => console.log("mapbox doRemoveAllMarkers error: " + error)
    );
  }

  // -------------------------------------------------------------------------------

  public doRemove2Markers(): void {
    this.mapbox.removeMarkers([2, 3]).then(
        () => console.log("Mapbox doRemove2Markers done"),
        error => console.log("mapbox doRemove2Markers error: " + error)
    );
  }

  // -------------------------------------------------------------------------------

  public doAddMarkers(): void {
    const onTap = (marker: MapboxMarker) => console.log(`Marker tapped with title: ${marker.title}`);

    const onCalloutTap = (marker: MapboxMarker) => alert(`Marker callout tapped with title: ${marker.title}`);

    const firstMarker = <MapboxMarker>{
      id: 2,
      lat: 52.3602160,
      lng: 4.8891680,
      title: 'One-line title here', // no popup unless set
      subtitle: 'With a res://icon-40 image',
      icon: isIOS ? 'res://icon-40' : 'res://icon',
      selected: false,
      onTap,
      onCalloutTap
    };

    setTimeout(() => {
      firstMarker.update({
        lat: 52.3622160,
        lng: 4.8911680,
        title: 'One-line title here (UPDATE)',
        subtitle: 'Updated subtitle',
        selected: true,
        onTap: (marker: MapboxMarker) => console.log(`UPDATED Marker tapped with title: ${marker.title}`),
        onCalloutTap: (marker: MapboxMarker) => alert(`UPDATED Marker callout tapped with title: ${marker.title}`)
      });
    }, 8000);

    this.mapbox.addMarkers([
      firstMarker,
      {
        id: 2,
        lat: 52.3602160,
        lng: 4.8891680,
        title: 'One-line title here', // no popup unless set
        subtitle: 'With a res://icon-40 image',
        icon: isIOS ? 'res://icon-40' : 'res://icon',
        selected: false,
        onTap,
        onCalloutTap
      },
      {
        // this is a marker without a popup (because no title/subtitle are set)
        id: 3,
        lat: 52.3602160,
        lng: 5,
        onTap: () => console.log("Titleless marker tapped!"),
        icon: 'http://www.bme.be/wp-content/uploads/2014/04/marker.png'
      },
      {
        id: 4,
        lat: 52.3602160,
        lng: 4.7891680,
        title: 'One-line title here 3', // no popup unless set
        subtitle: 'And a one-liner here as well.',
        iconPath: 'res/markers/home_marker.png',
        selected: true,
        onTap,
        onCalloutTap
      },
      {
        id: 5,
        lat: 52.4,
        lng: 5.1,
        title: 'This title is cut off on iOS, but multi-line on Android', // no popup unless set
        subtitle: 'Same for this subtitle. Same for this subtitle. Same for this subtitle. Same for this subtitle. Same for this subtitle.',
        icon: 'https://maryjanekirkland.com/wp-content/uploads/2016/01/map-marker.png',
        onTap: () => console.log("Marker tapped"),
        onCalloutTap: () => console.log("Marker callout tapped")
      }
    ]).then(
        () => console.log("Mapbox addMarkers done"),
        error => console.log("mapbox addMarkers error: " + error)
    );
  }

  // -------------------------------------------------------------------------------

  public doGetViewport(): void {
    this.mapbox.getViewport().then(
        (result: Viewport) => {
          let alertOptions: AlertOptions = {
            title: "Viewport determined",
            message: JSON.stringify(result),
            okButtonText: "OK"
          };
          alert(alertOptions);
        },
        (error: string) => console.log("mapbox doGetViewport error: " + error)
    );
  }

  // -------------------------------------------------------------------------------

  public doSetViewport(): void {
    this.mapbox.setViewport(
        {
          bounds: {
            north: 52.4820,
            east: 5.1087,
            south: 52.2581,
            west: 4.6816
          },
          animated: true // default true
        }
    ).then(
        () => console.log("Viewport set"),
        (error: string) => console.log("mapbox doSetViewport error: " + error)
    );
  }

  // -------------------------------------------------------------------------------

  // Add an option to download the current viewport: https://www.mapbox.com/ios-sdk/examples/offline-pack/ (look for visibleCoordinateBounds)

  public doDownloadAmsterdam(): void {
    this.mapbox.downloadOfflineRegion(
        {
          // required for Android in case no map has been shown yet
          accessToken: ACCESS_TOKEN,
          name: "Amsterdam",
          style: MapStyle.OUTDOORS,
          minZoom: 9,
          maxZoom: 11,
          bounds: {
            north: 52.4820,
            east: 5.1087,
            south: 52.2581,
            west: 4.6816
          },
          onProgress: (progress: DownloadProgress) => {
            console.log(`Download progress: ${JSON.stringify(progress)}`);
          }
        }
    ).then(
        () => {
          let alertOptions: AlertOptions = {
            title: "Offline region downloaded",
            message: "Done! Zoom levels 9-11 have been downloaded. The download progress was reported via console.log",
            okButtonText: "OK"
          };
          alert(alertOptions);
        },
        error => console.log("mapbox doDownloadAmsterdam error: " + error)
    );

    let alertOptions: AlertOptions = {
      title: "Be patient",
      message: "This takes a while, progress is logged via console.log",
      okButtonText: "Understood"
    };

    alert(alertOptions);
  }

  // -------------------------------------------------------------------------------

  public doDownloadCurrentViewportAsOfflineRegion(): void {
    this.mapbox.getViewport().then(
        (viewport: Viewport) => {
          this.mapbox.downloadOfflineRegion(
              {
                name: "LastViewport",
                style: MapStyle.OUTDOORS,
                minZoom: viewport.zoomLevel,
                maxZoom: viewport.zoomLevel + 2,
                bounds: viewport.bounds,
                onProgress: (progress: DownloadProgress) => console.log(`Download progress: ${JSON.stringify(progress)}`)
              }
          ).then(
              () => {
                let alertOptions: AlertOptions = {
                  title: "Viewport downloaded",
                  message: `Downloaded viewport with bounds ${JSON.stringify(viewport.bounds)} at zoom levels ${viewport.zoomLevel} - ${(viewport.zoomLevel + 2)}`,
                  okButtonText: "OK :)"
                };
                alert(alertOptions);
              },
              (error: string) => console.log("mapbox doDownloadCurrentViewportAsOfflineRegion error: " + error)
          );
        },
        (error: string) => {
          let alertOptions: AlertOptions = {
            title: "Download error",
            message: error,
            okButtonText: "Got it"
          };
          alert(alertOptions);
        });
  }

  // -------------------------------------------------------------------------------

  public doSetMinZoom(): void {
      let alertOptions: AlertOptions = {
          title: "Information",
          message: "Minimum zoom level will be set to 13.",
          okButtonText: "Got it"
      };

      alert(alertOptions).then(() => {
          this.mapbox.setMinZoom(13);
      });
  }

  // -------------------------------------------------------------------------------

  public doSetMaxZoom(): void {
      let alertOptions: AlertOptions = {
          title: "Information",
          message: "Maximum zoom level will be set to 15.",
          okButtonText: "Got it"
      };

      alert(alertOptions).then(() => {
          this.mapbox.setMaxZoom(15);
      });
  }


  // -------------------------------------------------------------------------------

  public doAddAndClusterGeoJSON(): void {
    this.mapbox.addGeoJsonClustered(
        {
          name: "earthquakes",
          data: "https://www.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
          clusterMaxZoom: 15,
          clusterRadius: 20
          // clusters: [
          //   {}
          // ]
        }
    ).then(
        () => {
          let alertOptions: AlertOptions = {
            title: "GeoJSON added",
            message: "Moving to the USA as that's where the GeoJson data is drawn",
            okButtonText: "OK"
          };
          alert(alertOptions).then(
              () => {
                this.mapbox.setViewport(
                    {
                      animated: true,
                      bounds: {
                        north: 52.9,
                        east: -62.2,
                        south: 22.1,
                        west: -128.2
                      }
                    }
                );
              });
        },
        (error: string) => {
          console.log("mapbox doAddAndClusterGeoJSON error: " + error);
        }
    );
  }

// ===================================================================================
/**
* 
* @todo INTEGRATE THIS 
*
  public doAddLayerAndSource(): void {
    this.mapbox.addSource(
        {
          id: "terrain-source",
          type: "vector",
          url: "mapbox://mapbox.mapbox-terrain-v2"
        }
    ).then(
      () => {
          this.mapbox.addLayer(
            {
              id: "terrain-data",
              source: "terrain-source",
              sourceLayer: "contour",
              type: "line",
              lineJoin: "round",
              lineCap: "round",
              lineColor: "#ff69b4",
              lineWidth: 1,
            }
          ).then(
            () => {
              console.log("Mapbox doAddLayerAndSource done");
            },
            (error: string) => {
              console.log("mapbox doAddLayerAndSource error: " + error);
            }
          );
        },
        (error: string) => {
          console.log("mapbox doAddLayerAndSource error: " + error);
        }
    );
  }

  public doRemoveLayerAndSource(): void {
    this.mapbox.removeLayer("terrain-data").then(
      () => {
          this.mapbox.removeSource("terrain-source").then(
            () => {
              console.log("Mapbox doRemoveLayerAndSource done");
            },
            (error: string) => {
              console.log("mapbox doAddSource error: " + error);
            }
          );
        },
        (error: string) => {
          console.log("mapbox doAddSource error: " + error);
        }
    );
  }

*/
// ===============================================================

  // -------------------------------------------------------------------------------

  public doListOfflineRegions(): void {
    this.mapbox.listOfflineRegions({
      accessToken: ACCESS_TOKEN
    }).then(
        (regions: Array<OfflineRegion>) => {
          let alertOptions: AlertOptions = {
            title: "Offline regions",
            message: JSON.stringify(regions),
            okButtonText: "Thanks"
          };
          alert(alertOptions);
        },
        (error: string) => {
          let alertOptions: AlertOptions = {
            title: "Offline regions list error",
            message: error,
            okButtonText: "Hmm"
          };
          alert(alertOptions);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doDeleteOfflineRegion(): void {
    this.mapbox.deleteOfflineRegion({
      name: "Amsterdam"
    }).then(
        () => {
          let alertOptions: AlertOptions = {
            title: "Offline region deleted",
            okButtonText: "Cool"
          };
          alert(alertOptions);
        },
        (error: string) => {
          let alertOptions: AlertOptions = {
            title: "Error deleting offline region",
            message: error,
            okButtonText: "Hmmz"
          };
          alert(alertOptions);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doGetTilt(): void {
    this.mapbox.getTilt().then(
        (result: number) => {
          let alertOptions: AlertOptions = {
            title: "Tilt / pitch",
            message: "" + result,
            okButtonText: "OK"
          };
          alert(alertOptions);
        },
        (error: string) => {
          console.log("mapbox getTilt error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doGetUserLocation(): void {
    this.mapbox.getUserLocation().then(
        location => {
          let alertOptions: AlertOptions = {
            title: "User location",
            message: JSON.stringify(location),
            okButtonText: "Thanks!"
          };
          alert(alertOptions);
        },
        (error: string) => {
          console.log("mapbox getUserLocation error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doTrackUser(): void {
    this.mapbox.trackUser({
      mode: "TRACKING_GPS",
      animated: true
    }).then(() => console.log("Following User"));
  }

  // -------------------------------------------------------------------------------

  public doSetTilt(): void {
    this.mapbox.setTilt(
        {
          tilt: 35,
          duration: 4000
        }
    ).then(
        () => {
          console.log("Mapbox doSetTilt done");
        },
        (error: string) => {
          console.log("mapbox doSetTilt error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doAnimateCamera(): void {
    this.mapbox.animateCamera(
        {
          target: {
            lat: 52.3732160,
            lng: 4.8941680,
          },
          zoomLevel: 17, // Android
          altitude: 500, // iOS
          bearing: 270,
          tilt: 50,
          duration: 7000
        }
    ).then(
        result => {
          console.log("Mapbox doAnimateCamera done");
        },
        (error: string) => {
          console.log("mapbox doAnimateCamera error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doSetCenter(): void {
    this.mapbox.setCenter(
        {
          lat: 52.3602160,
          lng: 4.8891680,
          animated: true
        }
    ).then(
        result => {
          console.log("Mapbox setCenter done");
        },
        (error: string) => {
          console.log("mapbox setCenter error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doGetCenter(): void {
    this.mapbox.getCenter().then(
        (result: LatLng) => {
          let alertOptions: AlertOptions = {
            title: "Center",
            message: `Lat: ${result.lat}, Lng: ${result.lng}`,
            okButtonText: "OK"
          };
          alert(alertOptions);
        },
        (error: string) => {
          console.log("mapbox getCenter error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doGetZoomLevel(): void {
    this.mapbox.getZoomLevel().then(
        (result: number) => {
          let alertOptions: AlertOptions = {
            title: "Zoom Level",
            message: "" + result,
            okButtonText: "OK"
          };
          alert(alertOptions);
        },
        (error: string) => {
          console.log("mapbox getCenter error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doSetZoomLevel(): void {
    this.mapbox.setZoomLevel(
        {
          level: 2, // shows most of the world
          animated: true
        }
    ).then(
        result => {
          console.log("Mapbox setZoomLevel done");
        },
        (error: string) => {
          console.log("mapbox setZoomLevel error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doAddPolygon(): void {
    this.mapbox.addPolygon(
        {
          id: 1,
          fillColor: new Color("red"),
          fillOpacity: 0.7,

          // 'stroke*' is only effective on iOS
          strokeColor: new Color("green"),
          strokeWidth: 8,
          strokeOpacity: 0.5,

          points: [
            {
              lat: 52.3923633970718,
              lng: 4.902648925781249
            },
            {
              lat: 52.35421556258807,
              lng: 4.9308013916015625
            },
            {
              lat: 52.353796172573944,
              lng: 4.8799896240234375
            },
            {
              lat: 52.3864966440161,
              lng: 4.8621368408203125
            },
            {
              lat: 52.3923633970718,
              lng: 4.902648925781249
            }
          ]
        })
        .then(result => console.log("Mapbox addPolygon done"))
        .catch((error: string) => console.log("mapbox addPolygon error: " + error));
  }

  // -------------------------------------------------------------------------------

  public doAddPolyline(): void {
    this.mapbox.addPolyline({
      id: 1,
      color: "#30BCFF",
      width: 5,
      opacity: 0.6,
      points: [
        {
          lat: 52.3923633,
          lng: 4.9026489
        },
        {
          lat: 52.3709879,
          lng: 4.9555206
        },
        {
          lat: 52.3542155,
          lng: 4.9308013
        },
        {
          lat: 52.3537961,
          lng: 4.8799896
        },
        {
          lat: 52.3701494,
          lng: 4.8360443
        },
        {
          lat: 52.3864966,
          lng: 4.8621368
        },
        {
          lat: 52.3848202,
          lng: 4.8868560
        }
      ]
    }).then(
        result => {
          console.log("Mapbox addPolyline done");
        },
        (error: string) => {
          console.log("mapbox addPolyline error: " + error);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doRemovePolyline(): void {
    this.mapbox.removePolylines([1]).then(
        result => console.log("Mapbox removePolylines done"),
        (error: string) => console.log("mapbox removePolylines error: " + error)
    );
  }

  // -------------------------------------------------------------------------------

  public doRemovePolygon(): void {
    this.mapbox.removePolygons([1]).then(
        result => console.log("Mapbox removePolygons done"),
        (error: string) => console.log("mapbox removePolygons error: " + error)
    );
  }

  // -------------------------------------------------------------------------------

  public doCheckHasFineLocationPermission(): void {
    this.mapbox.hasFineLocationPermission().then(
        (granted: boolean) => {
          let alertOptions: AlertOptions = {
            title: "Permission granted?",
            message: granted ? "YES" : "NO",
            okButtonText: "OK"
          };
          alert(alertOptions);
        }
    );
  }

  // -------------------------------------------------------------------------------

  public doRequestFineLocationPermission(): void {
    this.mapbox.requestFineLocationPermission().then(
        () => {
          console.log("Fine Location permission requested");
        }
    );
  }
}
