import * as utils from "tns-core-modules/utils/utils";
import * as application from "tns-core-modules/application";
import * as frame from "tns-core-modules/ui/frame";
import * as fs from "tns-core-modules/file-system";
import { Color } from "tns-core-modules/color";
import * as http from "tns-core-modules/http";

import {
  AddExtrusionOptions,
  AddGeoJsonClusteredOptions,
  AddPolygonOptions,
  AddPolylineOptions,
  AnimateCameraOptions,
  DeleteOfflineRegionOptions,
  DownloadOfflineRegionOptions,
  LatLng,
  ListOfflineRegionsOptions,
  MapboxApi,
  MapboxCommon,
  MapboxMarker,
  MapboxViewBase,
  MapStyle,
  OfflineRegion,
  QueryRenderedFeaturesOptions,
  SetCenterOptions,
  SetTiltOptions,
  SetViewportOptions,
  SetZoomLevelOptions,
  ShowOptions,
  TrackUserOptions,
  UserLocation,
  UserTrackingMode,
  Viewport
} from "./mapbox.common";

// Export the enums for devs not using TS
export { MapStyle };

declare const android, com, java, org: any;

let _mapbox: any = {};
let _accessToken: string;
let _markers = [];
let _polylines = [];
let _polygons = [];
let _markerIconDownloadCache = [];
let _locationLayerPlugin = null;

const ACCESS_FINE_LOCATION_PERMISSION_REQUEST_CODE = 111;


/*************** XML definition START ****************/
export class MapboxView extends MapboxViewBase {

  private mapView: any; // com.mapbox.mapboxsdk.maps.MapView

  getNativeMapView(): any {
    return this.mapView;
  }

  public createNativeView(): Object {
    let nativeView = new android.widget.FrameLayout(this._context);
    setTimeout(() => {
      this.initMap();
    }, 0);
    return nativeView;
  }

  disposeNativeView(): void {
    if (_locationLayerPlugin) {
      _locationLayerPlugin.onStop();
    }
  }

  initMap(): void {
    if (!this.mapView && this.config.accessToken) {
      this.mapbox = new Mapbox();
      let settings = Mapbox.merge(this.config, Mapbox.defaults);
      com.mapbox.mapboxsdk.Mapbox.getInstance(this._context, settings.accessToken);

      let drawMap = () => {
        this.mapView = new com.mapbox.mapboxsdk.maps.MapView(
            this._context,
            _getMapboxMapOptions(settings));

        this.mapView.onCreate(null);

        this.mapView.getMapAsync(
            new com.mapbox.mapboxsdk.maps.OnMapReadyCallback({
              onMapReady: mbMap => {
                this.mapView.mapboxMap = mbMap;

                // note that this is not multi-map friendly, but I don't think that's used in real apps anyway
                _polygons = [];
                _polylines = [];
                _markers = [];

                if (settings.showUserLocation) {
                  this.mapbox.requestFineLocationPermission()
                      .then(() => {
                        setTimeout(() => {
                          _showLocation(this.mapView, mbMap);
                        }, 1000);
                        this.notify({
                          eventName: MapboxViewBase.locationPermissionGrantedEvent,
                          object: this,
                          map: this,
                          android: this.mapView
                        });
                      })
                      .catch(err => {
                        this.notify({
                          eventName: MapboxViewBase.locationPermissionDeniedEvent,
                          object: this,
                          map: this,
                          android: this.mapView
                        });
                      });
                }

                this.notify({
                  eventName: MapboxViewBase.mapReadyEvent,
                  object: this,
                  map: this,
                  android: this.mapView
                });
              }
            })
        );
        this.nativeView.addView(this.mapView);
      };

      setTimeout(drawMap, settings.delay ? settings.delay : 0);
    }
  }
}

/*************** XML definition END ****************/

const _getMapStyle = (input: any): any => {
  const Style = com.mapbox.mapboxsdk.constants.Style;
  // allow for a style URL to be passed
  if (/^mapbox:\/\/styles/.test(input) || /^http:\/\//.test(input) || /^https:\/\//.test(input)) {
    return input;
  } else if (/^~\//.test(input)) {
    let assetsPath = 'asset://app/';
    input = input.replace(/^~\//, assetsPath);
    return input;
  } else if (input === MapStyle.LIGHT || input === MapStyle.LIGHT.toString()) {
    return Style.LIGHT;
  } else if (input === MapStyle.DARK || input === MapStyle.DARK.toString()) {
    return Style.DARK;
  } else if (input === MapStyle.OUTDOORS || input === MapStyle.OUTDOORS.toString()) {
    return Style.OUTDOORS;
  } else if (input === MapStyle.SATELLITE || input === MapStyle.SATELLITE.toString()) {
    return Style.SATELLITE;
  } else if (input === MapStyle.SATELLITE_STREETS || input === MapStyle.SATELLITE_STREETS.toString()) {
    return Style.SATELLITE_STREETS;
  } else if (input === MapStyle.TRAFFIC_DAY || input === MapStyle.TRAFFIC_DAY.toString()) {
    return Style.TRAFFIC_DAY;
  } else if (input === MapStyle.TRAFFIC_NIGHT || input === MapStyle.TRAFFIC_NIGHT.toString()) {
    return Style.TRAFFIC_NIGHT;
  } else {
    // default
    return Style.MAPBOX_STREETS;
  }
};

const _getUserLocationRenderMode = (input: UserTrackingMode): any => {
  // see https://github.com/mapbox/mapbox-plugins-android/blob/3a92bdf28b3bd76c9e83627f985baeff1b26d401/plugin-locationlayer/src/main/java/com/mapbox/mapboxsdk/plugins/locationlayer/modes/RenderMode.java#L28
  const RenderMode = com.mapbox.mapboxsdk.plugins.locationlayer.modes.RenderMode;
  if (input === "FOLLOW_WITH_HEADING") {
    return RenderMode.COMPASS;
  } else if (input === "FOLLOW_WITH_COURSE") {
    return RenderMode.GPS;
  } else {
    return RenderMode.NORMAL;
  }
};

const _getUserLocationCameraMode = (input: UserTrackingMode): any => {
  // see https://github.com/mapbox/mapbox-plugins-android/blob/3a92bdf28b3bd76c9e83627f985baeff1b26d401/plugin-locationlayer/src/main/java/com/mapbox/mapboxsdk/plugins/locationlayer/modes/CameraMode.java#L28
  const CameraMode = com.mapbox.mapboxsdk.plugins.locationlayer.modes.CameraMode;
  if (input === "FOLLOW") {
    return CameraMode.TRACKING;
  } else if (input === "FOLLOW_WITH_HEADING") {
    return CameraMode.TRACKING_COMPASS;
  } else if (input === "FOLLOW_WITH_COURSE") {
    return CameraMode.TRACKING_COMPASS;
  } else {
    return CameraMode.NONE;
  }
};

const _getMapboxMapOptions = (settings) => {
  const mapboxMapOptions = new com.mapbox.mapboxsdk.maps.MapboxMapOptions()
      .styleUrl(_getMapStyle(settings.style))
      .compassEnabled(!settings.hideCompass)
      .rotateGesturesEnabled(!settings.disableRotation)
      .scrollGesturesEnabled(!settings.disableScroll)
      .tiltGesturesEnabled(!settings.disableTilt)
      .zoomGesturesEnabled(!settings.disableZoom)
      .attributionEnabled(!settings.hideAttribution)
      .logoEnabled(!settings.hideLogo);

  // zoomlevel is not applied unless center is set
  if (settings.zoomLevel && !settings.center) {
    // Eiffel tower, Paris
    settings.center = {
      lat: 48.858093,
      lng: 2.294694
    };
  }

  if (settings.center && settings.center.lat && settings.center.lng) {
    const cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
        .zoom(settings.zoomLevel)
        .target(new com.mapbox.mapboxsdk.geometry.LatLng(settings.center.lat, settings.center.lng));
    mapboxMapOptions.camera(cameraPositionBuilder.build());
  }

  return mapboxMapOptions;
};

const _fineLocationPermissionGranted = () => {
  let hasPermission = android.os.Build.VERSION.SDK_INT < 23; // Android M. (6.0)
  if (!hasPermission) {
    hasPermission = android.content.pm.PackageManager.PERMISSION_GRANTED ===
        android.support.v4.content.ContextCompat.checkSelfPermission(application.android.foregroundActivity, android.Manifest.permission.ACCESS_FINE_LOCATION);
  }
  return hasPermission;
};

const _showLocation = (theMapView, mapboxMap) => {
  _locationLayerPlugin = new com.mapbox.mapboxsdk.plugins.locationlayer.LocationLayerPlugin(theMapView, mapboxMap);
};

const _getClickedMarkerDetails = (clicked) => {
  for (let m in _markers) {
    let cached = _markers[m];
    // tslint:disable-next-line:triple-equals
    if (cached.lat == clicked.getPosition().getLatitude() &&
        // tslint:disable-next-line:triple-equals
        cached.lng == clicked.getPosition().getLongitude() &&
        // tslint:disable-next-line:triple-equals
        cached.title == clicked.getTitle() && // == because of null vs undefined
        // tslint:disable-next-line:triple-equals
        cached.subtitle == clicked.getSnippet()) {
      return cached;
    }
  }
};

const _downloadImage = (marker) => {
  return new Promise((resolve, reject) => {
    // to cache..
    if (_markerIconDownloadCache[marker.icon]) {
      marker.iconDownloaded = _markerIconDownloadCache[marker.icon];
      resolve(marker);
      return;
    }
    // ..or not to cache
    http.getImage(marker.icon).then(
        (output) => {
          marker.iconDownloaded = output.android;
          _markerIconDownloadCache[marker.icon] = marker.iconDownloaded;
          resolve(marker);
        }, (e) => {
          console.log(`Download failed for ' ${marker.icon}' with error: ${e}`);
          resolve(marker);
        });
  });
};

const _downloadMarkerImages = (markers) => {
  let iterations = [];
  let result = [];
  for (let i = 0; i < markers.length; i++) {
    let marker = markers[i];
    if (marker.icon && marker.icon.startsWith("http")) {
      let p = _downloadImage(marker).then((mark) => {
        result.push(mark);
      });
      iterations.push(p);
    } else {
      result.push(marker);
    }
  }
  return Promise.all(iterations).then((output) => {
    return result;
  });
};

const _addMarkers = (markers: MapboxMarker[], nativeMap?) => {
  if (!markers) {
    console.log("No markers passed");
    return;
  }
  if (!Array.isArray(markers)) {
    console.log("markers must be passed as an Array: [{title:'foo'}]");
    return;
  }
  const theMap = nativeMap || _mapbox;
  if (!theMap || !theMap.mapboxMap) {
    return;
  }

  theMap.mapboxMap.setOnMarkerClickListener(
      new com.mapbox.mapboxsdk.maps.MapboxMap.OnMarkerClickListener({
        onMarkerClick: (marker) => {
          let cachedMarker = _getClickedMarkerDetails(marker);
          if (cachedMarker && cachedMarker.onTap) {
            cachedMarker.onTap(cachedMarker);
          }
          return false;
        }
      })
  );

  theMap.mapboxMap.setOnInfoWindowClickListener(
      new com.mapbox.mapboxsdk.maps.MapboxMap.OnInfoWindowClickListener({
        onInfoWindowClick: (marker) => {
          let cachedMarker = _getClickedMarkerDetails(marker);
          if (cachedMarker && cachedMarker.onCalloutTap) {
            cachedMarker.onCalloutTap(cachedMarker);
          }
          return true;
        }
      })
  );

  const iconFactory = com.mapbox.mapboxsdk.annotations.IconFactory.getInstance(application.android.context);

  // if any markers need to be downloaded from the web they need to be available synchronously, so fetch them first before looping
  _downloadMarkerImages(markers).then(updatedMarkers => {
    for (let m in updatedMarkers) {
      let marker: any = updatedMarkers[m];
      _markers.push(marker);
      let markerOptions = new com.mapbox.mapboxsdk.annotations.MarkerOptions();
      markerOptions.setTitle(marker.title);
      markerOptions.setSnippet(marker.subtitle);
      markerOptions.setPosition(new com.mapbox.mapboxsdk.geometry.LatLng(parseFloat(marker.lat), parseFloat(marker.lng)));

      if (marker.icon) {
        // for markers from url see UrlMarker in https://github.com/mapbox/mapbox-gl-native/issues/5370
        if (marker.icon.startsWith("res://")) {
          let resourcename = marker.icon.substring(6);
          let res = utils.ad.getApplicationContext().getResources();
          let identifier = res.getIdentifier(resourcename, "drawable", utils.ad.getApplication().getPackageName());
          if (identifier === 0) {
            console.log(`No icon found for this device density for icon ' ${marker.icon}'. Falling back to the default icon.`);
          } else {
            markerOptions.setIcon(iconFactory.fromResource(identifier));
          }
        } else if (marker.icon.startsWith("http")) {
          if (marker.iconDownloaded !== null) {
            markerOptions.setIcon(iconFactory.fromBitmap(marker.iconDownloaded));
          }
        } else {
          console.log("Please use res://resourcename, http(s)://imageurl or iconPath to use a local path");
        }

      } else if (marker.iconPath) {
        let iconFullPath = fs.knownFolders.currentApp().path + "/" + marker.iconPath;
        // if the file doesn't exist the app will crash, so checking it
        if (fs.File.exists(iconFullPath)) {
          // could set width, height, retina, see https://github.com/Telerik-Verified-Plugins/Mapbox/pull/42/files?diff=unified&short_path=1c65267, but that's what the marker.icon param is for..
          markerOptions.setIcon(iconFactory.fromPath(iconFullPath));
        } else {
          console.log(`Marker icon not found, using the default instead. Requested full path: '" + ${iconFullPath}'.`);
        }
      }
      marker.android = theMap.mapboxMap.addMarker(markerOptions);

      if (marker.selected) {
        theMap.mapboxMap.selectMarker(marker.android);
      }

      marker.update = (newSettings: MapboxMarker) => {
        for (let m in _markers) {
          let _marker: MapboxMarker = _markers[m];
          if (marker.id === _marker.id) {
            if (newSettings.onTap !== undefined) {
              _marker.onTap = newSettings.onTap;
            }
            if (newSettings.onCalloutTap !== undefined) {
              _marker.onCalloutTap = newSettings.onCalloutTap;
            }
            if (newSettings.title !== undefined) {
              _marker.title = newSettings.title;
              _marker.android.setTitle(newSettings.title);
            }
            if (newSettings.subtitle !== undefined) {
              _marker.subtitle = newSettings.title;
              _marker.android.setSnippet(newSettings.subtitle);
            }
            if (newSettings.lat && newSettings.lng) {
              _marker.lat = newSettings.lat;
              _marker.lng = newSettings.lng;
              _marker.android.setPosition(new com.mapbox.mapboxsdk.geometry.LatLng(parseFloat(<any>newSettings.lat), parseFloat(<any>newSettings.lng)));
            }
            if (newSettings.selected) {
              theMap.mapboxMap.selectMarker(_marker.android);
            }
          }
        }
      }
    }
  });
};

const _removeMarkers = (ids?, nativeMap?) => {
  const theMap = nativeMap || _mapbox;
  if (!theMap || !theMap.mapboxMap) {
    return;
  }
  for (let m in _markers) {
    let marker = _markers[m];
    if (!ids || (marker && marker.id && ids.indexOf(marker.id) > -1)) {
      if (marker && marker.android) {
        theMap.mapboxMap.removeAnnotation(marker.android);
      }
    }
  }
  // remove markers from cache
  if (ids) {
    _markers = _markers.filter(marker => ids.indexOf(marker.id) === -1);
  } else {
    _markers = [];
  }
};

const _getRegionName = (offlineRegion) => {
  const metadata = offlineRegion.getMetadata();
  const jsonStr = new java.lang.String(metadata, "UTF-8");
  const jsonObj = new org.json.JSONObject(jsonStr);
  return jsonObj.getString("name");
};

const _getOfflineManager = () => {
  if (!_mapbox.offlineManager) {
    _mapbox.offlineManager = com.mapbox.mapboxsdk.offline.OfflineManager.getInstance(application.android.context);
  }
  return _mapbox.offlineManager;
};


export class Mapbox extends MapboxCommon implements MapboxApi {
  hasFineLocationPermission(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        resolve(_fineLocationPermissionGranted());
      } catch (ex) {
        console.log("Error in mapbox.hasFineLocationPermission: " + ex);
        reject(ex);
      }
    });
  }

  requestFineLocationPermission(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (_fineLocationPermissionGranted()) {
        resolve();
        return;
      }

      // grab the permission dialog result
      const permissionCallback = (args: any) => {
        if (args.requestCode !== ACCESS_FINE_LOCATION_PERMISSION_REQUEST_CODE) {
          return;
        }
        for (let i = 0; i < args.permissions.length; i++) {
          if (args.grantResults[i] === android.content.pm.PackageManager.PERMISSION_DENIED) {
            reject("Permission denied");
            return;
          }
        }
        application.android.off(application.AndroidApplication.activityRequestPermissionsEvent, permissionCallback);
        resolve();
      };

      application.android.on(application.AndroidApplication.activityRequestPermissionsEvent, permissionCallback);

      // invoke the permission dialog
      android.support.v4.app.ActivityCompat.requestPermissions(
          application.android.foregroundActivity,
          [android.Manifest.permission.ACCESS_FINE_LOCATION],
          ACCESS_FINE_LOCATION_PERMISSION_REQUEST_CODE);
    });
  }

  show(options: ShowOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const showIt = () => {
          const settings = Mapbox.merge(options, Mapbox.defaults);

          // if no accessToken was set the app may crash
          if (settings.accessToken === undefined) {
            reject("Please set the 'accessToken' parameter");
            return;
          }

          // if already added, make sure it's removed first
          if (_mapbox.mapView) {
            let viewGroup = _mapbox.mapView.getParent();
            if (viewGroup !== null) {
              viewGroup.removeView(_mapbox.mapView);
            }
          }

          _accessToken = settings.accessToken;
          com.mapbox.mapboxsdk.Mapbox.getInstance(application.android.context, _accessToken);
          let mapboxMapOptions = _getMapboxMapOptions(settings);

          _mapbox.mapView = new com.mapbox.mapboxsdk.maps.MapView(
              application.android.context,
              mapboxMapOptions);

          _mapbox.mapView.onCreate(null);

          _mapbox.mapView.getMapAsync(
              new com.mapbox.mapboxsdk.maps.OnMapReadyCallback({
                onMapReady: mbMap => {
                  _mapbox.mapboxMap = mbMap;
                  _mapbox.mapView.mapboxMap = mbMap;

                  _polylines = [];
                  _polygons = [];
                  _markers = [];
                  _addMarkers(settings.markers, _mapbox.mapView);

                  if (settings.showUserLocation) {
                    this.requestFineLocationPermission().then(() => {
                      _showLocation(_mapbox.mapView, mbMap);
                    });
                  }
                  resolve({
                    android: _mapbox.mapView
                  });
                }
              })
          );

          // mapView.onResume();

          const topMostFrame = frame.topmost(),
              context = application.android.currentContext,
              mapViewLayout = new android.widget.FrameLayout(context),
              density = utils.layout.getDisplayDensity(),
              left = settings.margins.left * density,
              right = settings.margins.right * density,
              top = settings.margins.top * density,
              bottom = settings.margins.bottom * density,
              viewWidth = topMostFrame.currentPage.android.getWidth(),
              viewHeight = topMostFrame.currentPage.android.getHeight(),
              params = new android.widget.FrameLayout.LayoutParams(viewWidth - left - right, viewHeight - top - bottom);

          params.setMargins(left, top, right, bottom);
          _mapbox.mapView.setLayoutParams(params);

          mapViewLayout.addView(_mapbox.mapView);
          if (topMostFrame.currentPage.android.getParent()) {
            topMostFrame.currentPage.android.getParent().addView(mapViewLayout);
          } else {
            topMostFrame.currentPage.android.addView(mapViewLayout);
          }
        };

        // if the map is invoked immediately after launch this delay will prevent an error
        setTimeout(showIt, 200);

      } catch (ex) {
        console.log("Error in mapbox.show: " + ex);
        reject(ex);
      }
    });
  }

  hide(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (_mapbox.mapView) {
          const viewGroup = _mapbox.mapView.getParent();
          if (viewGroup !== null) {
            viewGroup.setVisibility(android.view.View.INVISIBLE);
          }
        }
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.hide: " + ex);
        reject(ex);
      }
    });
  }

  unhide(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (_mapbox.mapView) {
          _mapbox.mapView.getParent().setVisibility(android.view.View.VISIBLE);
          resolve();
        } else {
          reject("No map found");
        }
      } catch (ex) {
        console.log("Error in mapbox.unhide: " + ex);
        reject(ex);
      }
    });
  }

  destroy(nativeMap?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const theMap = nativeMap || _mapbox;
      if (theMap.mapView) {
        const viewGroup = theMap.mapView.getParent();
        if (viewGroup !== null) {
          viewGroup.removeView(theMap.mapView);
        }
        if (_locationLayerPlugin) {
          _locationLayerPlugin.onStop();
        }
        theMap.mapView = null;
        theMap.mapboxMap = null;
        _mapbox = {};
      }
      resolve();
    });
  }

  setMapStyle(style: string | MapStyle, nativeMap?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const mapStyle = _getMapStyle(style);
        theMap.mapboxMap.setStyleUrl(mapStyle);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setMapStyle: " + ex);
        reject(ex);
      }
    });
  }

  addMarkers(markers: MapboxMarker[], nativeMap?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        _addMarkers(markers, nativeMap);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.addMarkers: " + ex);
        reject(ex);
      }
    });
  }

  removeMarkers(ids?: any, nativeMap?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        _removeMarkers(ids, nativeMap);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.removeMarkers: " + ex);
        reject(ex);
      }
    });
  }

  setCenter(options: SetCenterOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const cameraPosition = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
            .target(new com.mapbox.mapboxsdk.geometry.LatLng(options.lat, options.lng))
            .build();

        if (options.animated === true) {
          theMap.mapboxMap.animateCamera(
              com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newCameraPosition(cameraPosition),
              1000,
              null);
        } else {
          theMap.mapboxMap.setCameraPosition(cameraPosition);
        }

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setCenter: " + ex);
        reject(ex);
      }
    });
  }

  getCenter(nativeMap?): Promise<LatLng> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const coordinate = theMap.mapboxMap.getCameraPosition().target;

        resolve({
          lat: coordinate.getLatitude(),
          lng: coordinate.getLongitude()
        });
      } catch (ex) {
        console.log("Error in mapbox.getCenter: " + ex);
        reject(ex);
      }
    });
  }

  setZoomLevel(options: SetZoomLevelOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const animated = options.animated === undefined || options.animated;
        const level = options.level;

        if (level >= 0 && level <= 20) {
          const cameraUpdate = com.mapbox.mapboxsdk.camera.CameraUpdateFactory.zoomTo(level);
          if (animated) {
            theMap.mapboxMap.easeCamera(cameraUpdate);
          } else {
            theMap.mapboxMap.moveCamera(cameraUpdate);
          }
          resolve();
        } else {
          reject("invalid zoomlevel, use any double value from 0 to 20 (like 8.3)");
        }
      } catch (ex) {
        console.log("Error in mapbox.setZoomLevel: " + ex);
        reject(ex);
      }
    });
  }

  getZoomLevel(nativeMap?): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const level = theMap.mapboxMap.getCameraPosition().zoom;
        resolve(level);
      } catch (ex) {
        console.log("Error in mapbox.getZoomLevel: " + ex);
        reject(ex);
      }
    });
  }

  setTilt(options: SetTiltOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const tilt = options.tilt ? options.tilt : 30;

        const cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
            .tilt(tilt);

        const cameraUpdate = com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newCameraPosition(cameraPositionBuilder.build());
        const durationMs = options.duration ? options.duration : 5000;

        theMap.mapboxMap.easeCamera(cameraUpdate, durationMs);

        setTimeout(() => {
          resolve();
        }, durationMs);
      } catch (ex) {
        console.log("Error in mapbox.setTilt: " + ex);
        reject(ex);
      }
    });
  }

  getTilt(nativeMap?): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const tilt = theMap.mapboxMap.getCameraPosition().tilt;
        resolve(tilt);
      } catch (ex) {
        console.log("Error in mapbox.getTilt: " + ex);
        reject(ex);
      }
    });
  }

  getUserLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      try {
        const loc = _locationLayerPlugin ? _locationLayerPlugin.getLocationEngine().getLastLocation() : null;
        if (loc === null) {
          reject("Location not available");
        } else {
          resolve({
            location: {
              lat: loc.getLatitude(),
              lng: loc.getLongitude()
            },
            speed: loc.getSpeed()
          });
        }
      } catch (ex) {
        console.log("Error in mapbox.getUserLocation: " + ex);
        reject(ex);
      }
    });
  }

  queryRenderedFeatures(options: QueryRenderedFeaturesOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const point = options.point;
        if (point === undefined) {
          reject("Please set the 'point' parameter");
          return;
        }
        const mapboxPoint = new com.mapbox.mapboxsdk.geometry.LatLng(options.point.lat, options.point.lng);
        const features = theMap.mapboxMap.queryRenderedFeatures(mapboxPoint);
        resolve(features);
      } catch (ex) {
        console.log("Error in mapbox.queryRenderedFeatures: " + ex);
        reject(ex);
      }
    });
  }

  addPolygon(options: AddPolygonOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const points = options.points;
        if (points === undefined) {
          reject("Please set the 'points' parameter");
          return;
        }

        const polygonOptions = new com.mapbox.mapboxsdk.annotations.PolygonOptions();
        for (let p in points) {
          let point = points[p];
          polygonOptions.add(new com.mapbox.mapboxsdk.geometry.LatLng(point.lat, point.lng));
        }

        polygonOptions.fillColor(Mapbox.getAndroidColor(options.fillColor));
        polygonOptions.alpha(options.fillOpacity === undefined ? 1 : options.fillOpacity);

        // Note that the stroke is barely visible, see https://github.com/mapbox/mapbox-gl-native/issues/5676
        if (options.strokeColor) {
          polygonOptions.strokeColor(Mapbox.getAndroidColor(options.strokeColor));
        }
        _polygons.push({
          id: options.id || new Date().getTime(),
          android: theMap.mapboxMap.addPolygon(polygonOptions)
        });
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.addPolygon: " + ex);
        reject(ex);
      }
    });
  }

  addPolyline(options: AddPolylineOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const points = options.points;
        if (points === undefined) {
          reject("Please set the 'points' parameter");
          return;
        }

        const polylineOptions = new com.mapbox.mapboxsdk.annotations.PolylineOptions();
        polylineOptions.width(options.width || 5); // default 5
        polylineOptions.color(Mapbox.getAndroidColor(options.color));
        polylineOptions.alpha(options.opacity === undefined ? 1 : options.opacity);
        for (let p in points) {
          let point = points[p];
          polylineOptions.add(new com.mapbox.mapboxsdk.geometry.LatLng(point.lat, point.lng));
        }
        _polylines.push({
          id: options.id || new Date().getTime(),
          android: theMap.mapboxMap.addPolyline(polylineOptions)
        });
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.addPolyline: " + ex);
        reject(ex);
      }
    });
  }

  removePolygons(ids?: Array<any>, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        for (let p in _polygons) {
          let polygon = _polygons[p];
          if (!ids || (polygon.id && ids.indexOf(polygon.id) > -1)) {
            theMap.mapboxMap.removePolygon(polygon.android);
          }
        }
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.removePolygons: " + ex);
        reject(ex);
      }
    });
  }

  removePolylines(ids?: Array<any>, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        for (let p in _polylines) {
          let polyline = _polylines[p];
          if (!ids || (polyline.id && ids.indexOf(polyline.id) > -1)) {
            theMap.mapboxMap.removePolyline(polyline.android);
          }
        }
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.removePolylines: " + ex);
        reject(ex);
      }
    });
  }

  animateCamera(options: AnimateCameraOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;
        const target = options.target;
        if (target === undefined) {
          reject("Please set the 'target' parameter");
          return;
        }

        const cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder(theMap.mapboxMap.getCameraPosition())
            .target(new com.mapbox.mapboxsdk.geometry.LatLng(target.lat, target.lng));

        if (options.bearing) {
          cameraPositionBuilder.bearing(options.bearing);
        }

        if (options.tilt) {
          cameraPositionBuilder.tilt(options.tilt);
        }

        if (options.zoomLevel) {
          cameraPositionBuilder.zoom(options.zoomLevel);
        }

        const durationMs = options.duration ? options.duration : 10000;

        theMap.mapboxMap.animateCamera(
            com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newCameraPosition(cameraPositionBuilder.build()),
            durationMs,
            null);

        setTimeout(() => {
          resolve();
        }, durationMs);
      } catch (ex) {
        console.log("Error in mapbox.animateCamera: " + ex);
        reject(ex);
      }
    });
  }

  setOnMapClickListener(listener: (data: LatLng) => void, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        theMap.mapboxMap.addOnMapClickListener(
            new com.mapbox.mapboxsdk.maps.MapboxMap.OnMapClickListener({
              onMapClick: point => {
                listener({
                  lat: point.getLatitude(),
                  lng: point.getLongitude()
                });
              }
            })
        );

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnMapClickListener: " + ex);
        reject(ex);
      }
    });
  }

  setOnMapLongClickListener(listener: (data: LatLng) => void, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        theMap.mapboxMap.addOnMapLongClickListener(
            new com.mapbox.mapboxsdk.maps.MapboxMap.OnMapLongClickListener({
              onMapLongClick: point => {
                listener({
                  lat: point.getLatitude(),
                  lng: point.getLongitude()
                });
              }
            })
        );

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnMapLongClickListener: " + ex);
        reject(ex);
      }
    });
  }

  setOnScrollListener(listener: (data?: LatLng) => void, nativeMap?): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        // the 'onMove' event seems like the one closest to the iOS implementation
        theMap.mapboxMap.addOnMoveListener(
            new com.mapbox.mapboxsdk.maps.MapboxMap.OnMoveListener({
              onMoveBegin: (detector: any /* MoveGestureDetector */) => {
              },
              onMove: (detector: any /* MoveGestureDetector */) => {
                const coordinate = theMap.mapboxMap.getCameraPosition().target;
                listener({
                  lat: coordinate.getLatitude(),
                  lng: coordinate.getLongitude()
                });
              },
              onMoveEnd: (detector: any /* MoveGestureDetector */) => {
              }
            })
        );

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnScrollListener: " + ex);
        reject(ex);
      }
    });
  }

  setOnFlingListener(listener: () => void, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        theMap.mapboxMap.addOnFlingListener(
            new com.mapbox.mapboxsdk.maps.MapboxMap.OnFlingListener({
              onFling: () => {
                listener();
              }
            })
        );

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnFlingListener: " + ex);
        reject(ex);
      }
    });
  }

  setOnCameraMoveListener(listener: () => void, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        theMap.mapboxMap.addOnCameraMoveListener(
            new com.mapbox.mapboxsdk.maps.MapboxMap.OnCameraMoveListener({
              onCameraMove: () => {
                listener();
              }
            })
        );

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnCameraMoveListener: " + ex);
        reject(ex);
      }
    });
  }

  setOnCameraMoveCancelListener(listener: () => void, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        theMap.mapboxMap.addOnCameraMoveCancelListener(
            new com.mapbox.mapboxsdk.maps.MapboxMap.OnCameraMoveCanceledListener({
              onCameraMoveCanceled: () => {
                listener();
              }
            })
        );

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnCameraMoveCancelListener: " + ex);
        reject(ex);
      }
    });
  }

  setOnCameraIdleListener(listener: () => void, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        theMap.mapboxMap.addOnCameraIdleListener(
            new com.mapbox.mapboxsdk.maps.MapboxMap.OnCameraIdleListener({
              onCameraIdle: () => {
                listener();
              }
            })
        );

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnCameraIdleListener: " + ex);
        reject(ex);
      }
    });
  }

  getViewport(nativeMap?): Promise<Viewport> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        const bounds = theMap.mapboxMap.getProjection().getVisibleRegion().latLngBounds;

        resolve({
          bounds: {
            north: bounds.getLatNorth(),
            east: bounds.getLonEast(),
            south: bounds.getLatSouth(),
            west: bounds.getLonWest()
          },
          zoomLevel: theMap.mapboxMap.getCameraPosition().zoom
        });
      } catch (ex) {
        console.log("Error in mapbox.getViewport: " + ex);
        reject(ex);
      }
    });
  }

  setViewport(options: SetViewportOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        const bounds = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder()
            .include(new com.mapbox.mapboxsdk.geometry.LatLng(options.bounds.north, options.bounds.east))
            .include(new com.mapbox.mapboxsdk.geometry.LatLng(options.bounds.south, options.bounds.west))
            .build();

        const padding = 25,
            animated = options.animated === undefined || options.animated,
            durationMs = animated ? 1000 : 0;

        theMap.mapboxMap.easeCamera(
            com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newLatLngBounds(bounds, padding),
            durationMs);

        setTimeout(() => {
          resolve();
        }, durationMs);
      } catch (ex) {
        console.log("Error in mapbox.setViewport: " + ex);
        reject(ex);
      }
    });
  }

  downloadOfflineRegion(options: DownloadOfflineRegionOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const styleURL = _getMapStyle(options.style);

        const bounds = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder()
            .include(new com.mapbox.mapboxsdk.geometry.LatLng(options.bounds.north, options.bounds.east))
            .include(new com.mapbox.mapboxsdk.geometry.LatLng(options.bounds.south, options.bounds.west))
            .build();

        const retinaFactor = utils.layout.getDisplayDensity();

        const offlineRegionDefinition = new com.mapbox.mapboxsdk.offline.OfflineTilePyramidRegionDefinition(
            styleURL,
            bounds,
            options.minZoom,
            options.maxZoom,
            retinaFactor);

        const info = '{name:"' + options.name + '"}';
        const infoStr = new java.lang.String(info);
        const encodedMetadata = infoStr.getBytes();

        if (!_accessToken && !options.accessToken) {
          reject("First show a map, or pass in an 'accessToken' param");
          return;
        }
        if (!_accessToken) {
          _accessToken = options.accessToken;
          com.mapbox.mapboxsdk.Mapbox.getInstance(application.android.context, _accessToken);
        }

        _getOfflineManager().createOfflineRegion(offlineRegionDefinition, encodedMetadata, new com.mapbox.mapboxsdk.offline.OfflineManager.CreateOfflineRegionCallback({
          onError: (error: string) => {
            reject(error);
          },

          onCreate: (offlineRegion) => {
            // if (options.onCreate) {
            //   options.onCreate(offlineRegion);
            // }

            offlineRegion.setDownloadState(com.mapbox.mapboxsdk.offline.OfflineRegion.STATE_ACTIVE);

            // Monitor the download progress using setObserver
            offlineRegion.setObserver(new com.mapbox.mapboxsdk.offline.OfflineRegion.OfflineRegionObserver({
              onStatusChanged: (status) => {
                // Calculate the download percentage and update the progress bar
                let percentage = status.getRequiredResourceCount() >= 0 ?
                    (100.0 * status.getCompletedResourceCount() / status.getRequiredResourceCount()) :
                    0.0;

                if (options.onProgress) {
                  options.onProgress({
                    name: options.name,
                    completedSize: status.getCompletedResourceSize(),
                    completed: status.getCompletedResourceCount(),
                    expected: status.getRequiredResourceCount(),
                    percentage: Math.round(percentage * 100) / 100,
                    // downloading: status.getDownloadState() == com.mapbox.mapboxsdk.offline.OfflineRegion.STATE_ACTIVE,
                    complete: status.isComplete()
                  });
                }

                if (status.isComplete()) {
                  resolve();
                } else if (status.isRequiredResourceCountPrecise()) {
                }
              },

              onError: (error) => {
                reject(`${error.getMessage()}, reason: ${error.getReason()}`);
              },

              mapboxTileCountLimitExceeded: (limit) => {
                console.log(`dl mapboxTileCountLimitExceeded: ${limit}`);
              }
            }));
          }
        }));
      } catch (ex) {
        console.log("Error in mapbox.downloadOfflineRegion: " + ex);
        reject(ex);
      }
    });
  }

  listOfflineRegions(options?: ListOfflineRegionsOptions): Promise<OfflineRegion[]> {
    return new Promise((resolve, reject) => {
      try {
        if (!_accessToken && !options.accessToken) {
          reject("First show a map, or pass in an 'accessToken' param");
          return;
        }
        if (!_accessToken) {
          _accessToken = options.accessToken;
          com.mapbox.mapboxsdk.Mapbox.getInstance(application.android.context, _accessToken);
        }

        _getOfflineManager().listOfflineRegions(new com.mapbox.mapboxsdk.offline.OfflineManager.ListOfflineRegionsCallback({
          onError: (error: string) => {
            reject(error);
          },
          onList: (offlineRegions) => {
            const regions = [];
            if (offlineRegions !== null) {
              for (let i = 0; i < offlineRegions.length; i++) {
                let offlineRegion = offlineRegions[i];
                let name = _getRegionName(offlineRegion);
                let offlineRegionDefinition = offlineRegion.getDefinition();
                let bounds = offlineRegionDefinition.getBounds();

                regions.push({
                  name: name,
                  style: offlineRegionDefinition.getStyleURL(),
                  minZoom: offlineRegionDefinition.getMinZoom(),
                  maxZoom: offlineRegionDefinition.getMaxZoom(),
                  bounds: {
                    north: bounds.getLatNorth(),
                    east: bounds.getLonEast(),
                    south: bounds.getLatSouth(),
                    west: bounds.getLonWest()
                  }
                });
              }
            }
            resolve(regions);
          }
        }));

      } catch (ex) {
        console.log("Error in mapbox.listOfflineRegions: " + ex);
        reject(ex);
      }
    });
  }

  deleteOfflineRegion(options: DeleteOfflineRegionOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (!options || !options.name) {
          reject("Pass in the 'name' param");
          return;
        }

        _getOfflineManager().listOfflineRegions(new com.mapbox.mapboxsdk.offline.OfflineManager.ListOfflineRegionsCallback({
          onError: (error: string) => {
            reject(error);
          },
          onList: (offlineRegions) => {
            const regions = [];
            let found = false;
            if (offlineRegions !== null) {
              for (let i = 0; i < offlineRegions.length; i++) {
                let offlineRegion = offlineRegions[i];
                let name = _getRegionName(offlineRegion);
                if (name === options.name) {
                  found = true;
                  offlineRegion.delete(new com.mapbox.mapboxsdk.offline.OfflineRegion.OfflineRegionDeleteCallback({
                    onError: (error: string) => {
                      reject(error);
                    },
                    onDelete: () => {
                      resolve();
                      // don't return, see note below
                    }
                  }));
                  // don't break the loop as there may be multiple packs with the same name
                }
              }
            }
            if (!found) {
              reject("Region not found");
            }
          }
        }));

      } catch (ex) {
        console.log("Error in mapbox.listOfflineRegions: " + ex);
        reject(ex);
      }
    });
  }

  addExtrusion(options: AddExtrusionOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        // Create fill extrusion layer
        const fillExtrusionLayer = new com.mapbox.mapboxsdk.style.layers.FillExtrusionLayer("3d-buildings", "composite");
        fillExtrusionLayer.setSourceLayer("building");
        fillExtrusionLayer.setFilter(com.mapbox.mapboxsdk.style.expressions.Expression.eq(com.mapbox.mapboxsdk.style.expressions.Expression.get("extrude"), "true"));
        fillExtrusionLayer.setMinZoom(15);

        // Set data-driven styling properties
        fillExtrusionLayer.setProperties(
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillExtrusionColor(android.graphics.Color.LTGRAY),
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillExtrusionHeight(com.mapbox.mapboxsdk.style.functions.Function.property("height", new com.mapbox.mapboxsdk.style.functions.stops.IdentityStops())),
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillExtrusionBase(com.mapbox.mapboxsdk.style.functions.Function.property("min_height", new com.mapbox.mapboxsdk.style.functions.stops.IdentityStops())),
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillExtrusionOpacity(new java.lang.Float(0.6))
        );

        theMap.mapboxMap.addLayer(fillExtrusionLayer);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.addExtrusion: " + ex);
        reject(ex);
      }
    });
  }

  addGeoJsonClustered(options: AddGeoJsonClusteredOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        theMap.mapboxMap.addSource(
            new com.mapbox.mapboxsdk.style.sources.GeoJsonSource(options.name,
                new java.net.URL(options.data),
                new com.mapbox.mapboxsdk.style.sources.GeoJsonOptions()
                    .withCluster(true)
                    .withClusterMaxZoom(options.clusterMaxZoom || 13)
                    .withClusterRadius(options.clusterRadius || 40)
            )
        );

        const layers = [];
        if (options.clusters) {
          for (let i = 0; i < options.clusters.length; i++) {
            // TODO also allow Color object
            layers.push([options.clusters[i].points, new Color(options.clusters[i].color).android]);
          }
        } else {
          layers.push([150, new Color("red").android]);
          layers.push([20, new Color("green").android]);
          layers.push([0, new Color("blue").android]);
        }

        const unclustered = new com.mapbox.mapboxsdk.style.layers.SymbolLayer("unclustered-points", options.name);
        unclustered.setProperties([
          com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleColor(new Color("red").android),
          com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleRadius(new java.lang.Float(16.0)),
          com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleBlur(new java.lang.Float(0.2))
        ]);
        console.log(com.mapbox.mapboxsdk.style.expressions.Expression.get("cluster"));
        unclustered.setFilter(com.mapbox.mapboxsdk.style.expressions.Expression.neq(com.mapbox.mapboxsdk.style.expressions.Expression.get("cluster"), true));
        theMap.mapboxMap.addLayer(unclustered); // , "building");

        for (let i = 0; i < layers.length; i++) {
          // Add some nice circles
          const circles = new com.mapbox.mapboxsdk.style.layers.CircleLayer("cluster-" + i, options.name);
          circles.setProperties([
                // com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconImage("icon")
                com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleColor(layers[i][1]),
                com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleRadius(new java.lang.Float(22.0)),
                com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleBlur(new java.lang.Float(0.2))
              ]
          );

          const pointCount = com.mapbox.mapboxsdk.style.expressions.Expression.toNumber(com.mapbox.mapboxsdk.style.expressions.Expression.get("point_count"));

          circles.setFilter(
              i === 0 ?
                  com.mapbox.mapboxsdk.style.expressions.Expression.gte(pointCount, com.mapbox.mapboxsdk.style.expressions.Expression.literal(java.lang.Integer.valueOf(layers[i][0]))) :
                  com.mapbox.mapboxsdk.style.expressions.Expression.all([
                    com.mapbox.mapboxsdk.style.expressions.Expression.gte(pointCount, com.mapbox.mapboxsdk.style.expressions.Expression.literal(java.lang.Integer.valueOf(layers[i][0]))),
                    com.mapbox.mapboxsdk.style.expressions.Expression.lt(pointCount, com.mapbox.mapboxsdk.style.expressions.Expression.literal(java.lang.Integer.valueOf(layers[i - 1][0])))
                  ])
          );

          theMap.mapboxMap.addLayer(circles); // , "building");
        }

        // Add the count labels (note that this doesn't show.. #sad)
        const count = new com.mapbox.mapboxsdk.style.layers.SymbolLayer("count", options.name);
        count.setProperties([
              com.mapbox.mapboxsdk.style.layers.PropertyFactory.textField(com.mapbox.mapboxsdk.style.expressions.Expression.get("point_count")),
              com.mapbox.mapboxsdk.style.layers.PropertyFactory.textSize(new java.lang.Float(12.0)),
              com.mapbox.mapboxsdk.style.layers.PropertyFactory.textColor(new Color("white").android)
            ]
        );
        theMap.mapboxMap.addLayer(count);

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.addGeoJsonClustered: " + ex);
        reject(ex);
      }
    });
  }

  trackUser(options: TrackUserOptions, nativeMap?): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        if (!_locationLayerPlugin) {
          reject("The map is not currently showing the user location");
          return;
        }

        _locationLayerPlugin.setRenderMode(_getUserLocationRenderMode(options.mode));
        _locationLayerPlugin.setCameraMode(_getUserLocationCameraMode(options.mode));

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.trackUser: " + ex);
        reject(ex);
      }
    });
  }

  private static getAndroidColor(color: string | Color): any {
    let androidColor;
    if (color && Color.isValid(color)) {
      androidColor = new Color("" + color).android;
    } else {
      androidColor = new Color('#000').android;
    }
    return androidColor;
  }
}
