var utils = require("utils/utils");
var application = require("application");
var frame = require("ui/frame");
var fs = require("file-system");
var Color = require("color").Color;
var mapbox = require("./mapbox-common");
mapbox._markers = [];
mapbox._polylines = [];
var ACCESS_FINE_LOCATION_PERMISSION_REQUEST_CODE = 111;

mapbox.locationServices = null;

/*************** XML definition START ****************/
var Mapbox = (function (_super) {
  __extends(Mapbox, _super);
  function Mapbox() {
    _super.call(this);
    this.config = {};
  }

  Mapbox.prototype._createUI = function () {
    var settings = mapbox.merge(this.config, mapbox.defaults);
    if (settings.accessToken === undefined) {
      setTimeout(function() {
        var dialogs = require("ui/dialogs");
        dialogs.alert("Please set the 'accessToken' property because now there will be no map :)");
      }, 0);
      return;
    }

    com.mapbox.mapboxsdk.MapboxAccountManager.start(application.android.context, settings.accessToken);

    this._android = new com.mapbox.mapboxsdk.maps.MapView(
        application.android.context,
        mapbox._getMapboxMapOptions(settings));

    var that = this;
    this._android.getMapAsync(
        new com.mapbox.mapboxsdk.maps.OnMapReadyCallback({
          onMapReady: function (mbMap) {
            that._android.mapboxMap = mbMap;
            that.notifyMapReady();
          }
        })
    );

    this._android.onCreate(null);
  };

  Object.defineProperty(Mapbox.prototype, "android", {
    get: function () {
      return this._android;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Mapbox.prototype, "native", {
    get: function () {
      return this._android;
    },
    enumerable: true,
    configurable: true
  });
  return Mapbox;
}(mapbox.Mapbox));
mapbox.Mapbox = Mapbox;
/*************** XML definition END ****************/


mapbox._getMapboxMapOptions = function (settings) {
  var cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
      .zoom(settings.zoomLevel);

  if (settings.center && settings.center.lat && settings.center.lng) {
    cameraPositionBuilder.target(new com.mapbox.mapboxsdk.geometry.LatLng(settings.center.lat, settings.center.lng));
  }

  var mapboxMapOptions = new com.mapbox.mapboxsdk.maps.MapboxMapOptions()
      .styleUrl(mapbox._getMapStyle(settings.style))
      .compassEnabled(!settings.hideCompass)
      .rotateGesturesEnabled(!settings.disableRotation)
      .scrollGesturesEnabled(!settings.disableScroll)
      .tiltGesturesEnabled(!settings.disableTilt)
      .zoomGesturesEnabled(!settings.disableZoom)
      .attributionEnabled(!settings.hideAttribution)
      .logoEnabled(!settings.hideLogo)
      .camera(cameraPositionBuilder.build());

  return mapboxMapOptions;
};

mapbox._fineLocationPermissionGranted = function () {
  var hasPermission = android.os.Build.VERSION.SDK_INT < 23; // Android M. (6.0)
  if (!hasPermission) {
    hasPermission = android.content.pm.PackageManager.PERMISSION_GRANTED ==
        android.support.v4.content.ContextCompat.checkSelfPermission(application.android.foregroundActivity, android.Manifest.permission.ACCESS_FINE_LOCATION);
  }
  return hasPermission;
};

mapbox.hasFineLocationPermission = function () {
  return new Promise(function (resolve) {
    resolve(mapbox._fineLocationPermissionGranted());
  });
};

mapbox.requestFineLocationPermission = function () {
  return new Promise(function (resolve) {
    if (!mapbox._fineLocationPermissionGranted()) {
      // in a future version we could hook up the callback and change this flow a bit
      android.support.v4.app.ActivityCompat.requestPermissions(
          application.android.foregroundActivity,
          [android.Manifest.permission.ACCESS_FINE_LOCATION],
          ACCESS_FINE_LOCATION_PERMISSION_REQUEST_CODE);
      // this is not the nicest solution as the user needs to initiate scanning again after granting permission,
      // so enhance this in a future version, but it's ok for now
      resolve();
    }
  });
};

mapbox._getMapStyle = function(input) {
  var Style = com.mapbox.mapboxsdk.constants.Style;
  // allow for a style URL to be passed
  if (/^mapbox:\/\/styles/.test(input)) {
    return input;
  }
  if (input === mapbox.MapStyle.LIGHT) {
    return Style.LIGHT;
  } else if (input === mapbox.MapStyle.DARK) {
    return Style.DARK;
  } else if (input === mapbox.MapStyle.OUTDOORS) {
    return Style.OUTDOORS;
  } else if (input === mapbox.MapStyle.SATELLITE) {
    return Style.SATELLITE;
  } else if (input === mapbox.MapStyle.HYBRID || mapbox.MapStyle.SATELLITE_STREETS) {
    return Style.SATELLITE_STREETS;
  } else {
    // default
    return Style.MAPBOX_STREETS;
  }
};

mapbox.show = function(arg) {
  return new Promise(function (resolve, reject) {
    try {
      var showIt = function() {
        var settings = mapbox.merge(arg, mapbox.defaults);

        // if no accessToken was set the app may crash
        if (settings.accessToken === undefined) {
          reject("Please set the 'accessToken' parameter");
          return;
        }

        // if already added, make sure it's removed first
        if (mapbox.mapView) {
          var viewGroup = mapbox.mapView.getParent();
          if (viewGroup !== null) {
            viewGroup.removeView(mapbox.mapView);
          }
        }

        mapbox._accessToken = settings.accessToken;
        com.mapbox.mapboxsdk.MapboxAccountManager.start(application.android.context, settings.accessToken);
        var mapboxMapOptions = mapbox._getMapboxMapOptions(settings);

        mapbox.mapView = new com.mapbox.mapboxsdk.maps.MapView(
            application.android.context,
            mapboxMapOptions);

        mapbox.mapView.getMapAsync(
            new com.mapbox.mapboxsdk.maps.OnMapReadyCallback({
              onMapReady: function (mbMap) {
                mapbox.mapboxMap = mbMap;
                // mapbox.mapboxMap.setStyleUrl(mapbox._getMapStyle(settings.style));
                // mapbox.mapboxMap.setStyleUrl(com.mapbox.mapboxsdk.constants.Style.DARK);

                mapbox._polylines = [];
                mapbox._markers = [];
                mapbox._addMarkers(settings.markers);

                if (settings.showUserLocation) {
                  if (mapbox._fineLocationPermissionGranted()) {
                    mapbox.locationServices = com.mapbox.mapboxsdk.location.LocationServices.getLocationServices(application.android.context);

                    mapbox.locationServices.addLocationListener(new com.mapbox.mapboxsdk.location.LocationListener({
                          onLocationChanged: function (location) {
                            if (location !== null) {
                              if (mapbox._locationMarkerAdded) {
                                mapbox._removeMarkers([999997, 999998]);
                              } else {
                                mapbox._locationMarkerAdded = true;
                              }
                              mapbox._addMarkers([
                                {
                                  id: 999997,
                                  icon: "res://ic_mylocationview_normal",
                                  lat: location.getLatitude(),
                                  lng: location.getLongitude()
                                },
                                {
                                  id: 999998,
                                  icon: "res://ic_mylocationview_background",
                                  lat: location.getLatitude(),
                                  lng: location.getLongitude()
                                }
                              ]);
                            }
                          }
                        })
                    );
                    mapbox.mapboxMap.setMyLocationEnabled(true);

                  } else {
                    // devs should ask permission upfront, otherwise enabling location will crash the app on Android 6
                    console.log("Mapbox plugin: not showing the user location on this device because persmission was not requested/granted");
                  }
                }
                resolve();
              }
            })
        );

        mapbox.mapView.onResume();
        mapbox.mapView.onCreate(null);

        var topMostFrame = frame.topmost(),
            density = utils.layout.getDisplayDensity(),
            left = settings.margins.left * density,
            right = settings.margins.right * density,
            top = settings.margins.top * density,
            bottom = settings.margins.bottom * density,
            viewWidth = topMostFrame.currentPage.android.getWidth(),
            viewHeight = topMostFrame.currentPage.android.getHeight();

        var params = new android.widget.FrameLayout.LayoutParams(viewWidth - left - right, viewHeight - top - bottom);
        params.setMargins(left, top, right, bottom);
        mapbox.mapView.setLayoutParams(params);

        if (settings.center) {
          // TODO use jumpTo?
          // mapbox.mapView.setCenterCoordinate(new com.mapbox.mapboxsdk.geometry.LatLng(settings.center.lat, settings.center.lng));
        }
        // TODO see https://github.com/mapbox/mapbox-gl-native/issues/4216
        // mapbox.mapView.setZoomLevel(settings.zoomLevel);

        var context = application.android.currentContext;
        var mapViewLayout = new android.widget.FrameLayout(context);
        mapViewLayout.addView(mapbox.mapView);
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
};

mapbox._getClickedMarkerDetails = function (clicked) {
  for (var m in mapbox._markers) {
    var cached = mapbox._markers[m];
    if (cached.lat == clicked.getPosition().getLatitude() &&
        cached.lng == clicked.getPosition().getLongitude() &&
        cached.title == clicked.getTitle() &&
        cached.subtitle == clicked.getSnippet()) {
      return cached;
    }
  }
};

mapbox.hide = function(arg) {
  return new Promise(function (resolve, reject) {
    try {
      var viewGroup = mapbox.mapView.getParent();
      if (viewGroup !== null) {
        viewGroup.setVisibility(android.view.View.INVISIBLE);
      }
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.show: " + ex);
      reject(ex);
    }
  });
};

mapbox.unhide = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (mapbox.mapView) {
        var viewGroup = mapbox.mapView.getParent();
        viewGroup.setVisibility(android.view.View.VISIBLE);
        resolve();
      } else {
        reject("No map found");
      }
    } catch (ex) {
      console.log("Error in mapbox.unhide: " + ex);
      reject(ex);
    }
  });
};

mapbox.removeMarkers = function (ids, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      mapbox._removeMarkers(ids, nativeMap);
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.removeMarkers: " + ex);
      reject(ex);
    }
  });
};

mapbox._removeMarkers = function (ids, nativeMap) {
  var theMap = nativeMap || mapbox;
  for (var m in mapbox._markers) {
    var marker = mapbox._markers[m];
    if (!ids || (marker.id && ids.indexOf(marker.id) > -1)) {
      // don't remove the location markers in case 'removeAll' was invoked
      if (ids || (marker.id != 999997 && marker.id != 999998)) {
        theMap.mapboxMap.removeAnnotation(marker.android);
      }
    }
  }
};

mapbox.addMarkers = function (markers, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      mapbox._addMarkers(markers, nativeMap);
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.addMarkers: " + ex);
      reject(ex);
    }
  });
};

mapbox._addMarkers = function(markers, nativeMap) {
  if (!markers) {
    console.log("No markers passed");
    return;
  }
  if (!Array.isArray(markers)) {
    console.log("markers must be passed as an Array: [{title:'foo'}]");
    return;
  }
  var theMap = nativeMap || mapbox;

  theMap.mapboxMap.setOnMarkerClickListener(
      new com.mapbox.mapboxsdk.maps.MapboxMap.OnMarkerClickListener ({
        onMarkerClick: function (marker) {
          console.log("-- marker click");
          var cachedMarker = mapbox._getClickedMarkerDetails(marker);
          if (cachedMarker && cachedMarker.onTap) {
            cachedMarker.onTap(cachedMarker);
          }
          return false;
        }
      })
  );

  theMap.mapboxMap.setOnInfoWindowClickListener(
      new com.mapbox.mapboxsdk.maps.MapboxMap.OnInfoWindowClickListener ({
        onInfoWindowClick: function (marker) {
          console.log("-- info click");
          var cachedMarker = mapbox._getClickedMarkerDetails(marker);
          if (cachedMarker && cachedMarker.onCalloutTap) {
            cachedMarker.onCalloutTap(cachedMarker);
          }
          return true;
        }
      })
  );

  var iconFactory = com.mapbox.mapboxsdk.annotations.IconFactory.getInstance(application.android.context);
  for (var m in markers) {
    var marker = markers[m];
    mapbox._markers.push(marker);
    var markerOptions = new com.mapbox.mapboxsdk.annotations.MarkerOptions();
    markerOptions.setTitle(marker.title);
    markerOptions.setSnippet(marker.subtitle);
    markerOptions.setPosition(new com.mapbox.mapboxsdk.geometry.LatLng(marker.lat, marker.lng));
    if (marker.icon) {
      if (marker.icon.startsWith("res://")) {
        var resourcename = marker.icon.substring(6);
        var res = utils.ad.getApplicationContext().getResources();
        var identifier = res.getIdentifier(resourcename, "drawable", utils.ad.getApplication().getPackageName());

        if (identifier === 0) {
          console.log("No icon found for this device desity for icon " + marker.icon + ", using default");
        } else {
          var iconDrawable = android.support.v4.content.ContextCompat.getDrawable(application.android.context, identifier);
          markerOptions.setIcon(iconFactory.fromDrawable(iconDrawable));
        }
      } else {
        console.log("Please use res://resourcename, or iconPath to use a local path");
      }
    } else if (marker.iconPath) {
      var iconFullPath = fs.knownFolders.currentApp().path + "/" + marker.iconPath;
      // if the file doesn't exist the app will crash, so checking it
      if (fs.File.exists(iconFullPath)) {
        // could set width, height, retina, see https://github.com/Telerik-Verified-Plugins/Mapbox/pull/42/files?diff=unified&short_path=1c65267, but that's what the marker.icon param is for..
        markerOptions.setIcon(iconFactory.fromPath(iconFullPath));
      } else {
        console.log("Marker icon not found, using the default instead. Requested full path: " + iconFullPath);
      }
    }
    marker.android = theMap.mapboxMap.addMarker(markerOptions);
  }
};

mapbox.setCenter = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      var cameraPosition = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder().target(
          new com.mapbox.mapboxsdk.geometry.LatLng(arg.lat, arg.lng)).build();

      if (arg.animated === true) {
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
};

mapbox.getCenter = function () {
  return new Promise(function (resolve, reject) {
    try {
      var coordinate = mapbox.mapboxMap.getCameraPosition().target;
      resolve({
        lat: coordinate.getLatitude(),
        lng: coordinate.getLongitude()
      });
    } catch (ex) {
      console.log("Error in mapbox.getCenter: " + ex);
      reject(ex);
    }
  });
};

mapbox.setZoomLevel = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      var animated = arg.animated === undefined  || arg.animated;
      var level = arg.level;
      if (level >=0 && level <= 20) {
        var cameraUpdate = com.mapbox.mapboxsdk.camera.CameraUpdateFactory.zoomTo(level);
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
};

mapbox.getZoomLevel = function () {
  return new Promise(function (resolve, reject) {
    try {
      var level = mapbox.mapboxMap.getCameraPosition().zoom;
      resolve(level);
    } catch (ex) {
      console.log("Error in mapbox.getZoomLevel: " + ex);
      reject(ex);
    }
  });
};

mapbox.setTilt = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      var tilt = 30;

      if (arg.tilt) {
        tilt = arg.tilt;
      } else if (arg.pitch) {
        tilt = arg.pitch;
      }

      var cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
          .tilt(tilt);

      var cameraUpdate = com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newCameraPosition(cameraPositionBuilder.build());

      theMap.mapboxMap.easeCamera(cameraUpdate, arg.duration || 5000);
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.setTilt: " + ex);
      reject(ex);
    }
  });
};

mapbox.getTilt = function () {
  return new Promise(function (resolve, reject) {
    try {
      var tilt = mapbox.mapboxMap.getCameraPosition().tilt;
      resolve(tilt);
    } catch (ex) {
      console.log("Error in mapbox.getTilt: " + ex);
      reject(ex);
    }
  });
};

mapbox.animateCamera = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      var target = arg.target;
      if (target === undefined) {
        reject("Please set the 'target' parameter");
        return;
      }

      var cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
          .target(new com.mapbox.mapboxsdk.geometry.LatLng(target.lat, target.lng));

      if (arg.bearing) {
        cameraPositionBuilder.bearing(arg.bearing);
      }

      if (arg.tilt) {
        cameraPositionBuilder.tilt(arg.tilt);
      }

      if (arg.zoomLevel) {
        cameraPositionBuilder.zoom(arg.zoomLevel);
      }

      theMap.mapboxMap.animateCamera(
          com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newCameraPosition(cameraPositionBuilder.build()),
          arg.duration ? arg.duration : 10000, // default 10 seconds
          null);

      resolve();
    } catch (ex) {
      console.log("Error in mapbox.animateCamera: " + ex);
      reject(ex);
    }
  });
};

mapbox.addPolygon = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      var points = arg.points;
      if (points === undefined) {
        reject("Please set the 'points' parameter");
        return;
      }

      var polygonOptions = new com.mapbox.mapboxsdk.annotations.PolygonOptions();
      for (var p in points) {
        var point = points[p];
        polygonOptions.add(new com.mapbox.mapboxsdk.geometry.LatLng(point.lat, point.lng));
      }
      theMap.mapboxMap.addPolygon(polygonOptions);
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.addPolygon: " + ex);
      reject(ex);
    }
  });
};

mapbox.addPolyline = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      var points = arg.points;
      if (points === undefined) {
        reject("Please set the 'points' parameter");
        return;
      }

      var polylineOptions = new com.mapbox.mapboxsdk.annotations.PolylineOptions();
      polylineOptions.width(arg.width || 5); // default 5
      
      // Create android color && default black
      var androidColor;
      if (arg.color && Color.isValid(arg.color)) {
          androidColor = arg.color ? new Color(arg.color).android : new Color('#000').android;
      } else {
        androidColor = new Color('#000').android;
      }
      
      polylineOptions.color(androidColor);
      for (var p in points) {
        var point = points[p];
        polylineOptions.add(new com.mapbox.mapboxsdk.geometry.LatLng(point.lat, point.lng));
      }
      arg.android = theMap.mapboxMap.addPolyline(polylineOptions);
      mapbox._polylines.push(arg);
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.addPolyline: " + ex);
      reject(ex);
    }
  });
};

mapbox.removePolylines = function (ids, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      for (var p in mapbox._polylines) {
        var polyline = mapbox._polylines[p];
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
};

mapbox.getViewport = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (!mapbox.mapboxMap) {
        reject("No map has been loaded");
        return;
      }

      var bounds = mapbox.mapboxMap.getProjection().getVisibleRegion().latLngBounds;

      resolve({
        bounds: {
          north: bounds.getLatNorth(),
          east: bounds.getLonEast(),
          south: bounds.getLatSouth(),
          west: bounds.getLonWest()
        },
        zoomLevel: mapbox.mapboxMap.getCameraPosition().zoom
      });
    } catch (ex) {
      console.log("Error in mapbox.getViewport: " + ex);
      reject(ex);
    }
  });
};

mapbox.setViewport = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;

      if (!theMap) {
        reject("No map has been loaded");
        return;
      }

      var bounds = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder()
          .include(new com.mapbox.mapboxsdk.geometry.LatLng(arg.bounds.north, arg.bounds.east))
          .include(new com.mapbox.mapboxsdk.geometry.LatLng(arg.bounds.south, arg.bounds.west))
          .build();

      var animated = arg.animated === undefined  || arg.animated;
      var padding = 25;

      theMap.mapboxMap.easeCamera(
          com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newLatLngBounds(bounds, padding),
          animated ? 1000 : 0);

      resolve();
    } catch (ex) {
      console.log("Error in mapbox.setViewport: " + ex);
      reject(ex);
    }
  });
};

mapbox._getRegionName = function (offlineRegion) {
  var metadata = offlineRegion.getMetadata();
  var jsonStr = new java.lang.String(metadata, "UTF-8");
  var jsonObj = new org.json.JSONObject(jsonStr);
  return jsonObj.getString("name");
};

mapbox.deleteOfflineRegion = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (!arg || !arg.name) {
        reject("Pass in the 'region' param");
        return;
      }

      var pack = arg.name;
      var offlineManager = mapbox._getOfflineManager(arg);

      offlineManager.listOfflineRegions(new com.mapbox.mapboxsdk.offline.OfflineManager.ListOfflineRegionsCallback({
        onError: function (errorString) {
          reject(errorString);
        },
        onList: function (offlineRegions) {
          var regions = [];
          var found = false;
          if (offlineRegions !== null) {
            for (var i=0; i< offlineRegions.length; i++) {
              var offlineRegion = offlineRegions[i];
              var name = mapbox._getRegionName(offlineRegion);
              if (name === pack) {
                found = true;
                offlineRegion.delete(new com.mapbox.mapboxsdk.offline.OfflineRegion.OfflineRegionDeleteCallback({
                  onError: function (errorString) {
                    reject(errorString);
                  },
                  onDelete: function () {
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
};

mapbox.listOfflineRegions = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (!mapbox._accessToken && !arg.accessToken) {
        reject("First show a map, or pass in an 'accessToken' param");
        return;
      }

      var offlineManager = mapbox._getOfflineManager(arg);

      offlineManager.listOfflineRegions(new com.mapbox.mapboxsdk.offline.OfflineManager.ListOfflineRegionsCallback({
        onError: function (errorString) {
          reject(errorString);
        },
        onList: function (offlineRegions) {
          var regions = [];
          if (offlineRegions !== null) {
            for (var i=0; i < offlineRegions.length; i++) {
              var offlineRegion = offlineRegions[i];
              var name = mapbox._getRegionName(offlineRegion);
              var offlineRegionDefinition = offlineRegion.getDefinition();
              var bounds = offlineRegionDefinition.getBounds();

              regions.push({
                name: name,
                style: offlineRegionDefinition.getStyleURL(),
                minZoom: offlineRegionDefinition.getMinZoom() ,
                maxZoom: offlineRegionDefinition.getMaxZoom() ,
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
};

mapbox.downloadOfflineRegion = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      // TODO verify input of all params, and mark them mandatory in TS d.

      var styleURL = mapbox._getMapStyle(arg.style);

      var bounds = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder()
          .include(new com.mapbox.mapboxsdk.geometry.LatLng(arg.bounds.north, arg.bounds.east))
          .include(new com.mapbox.mapboxsdk.geometry.LatLng(arg.bounds.south, arg.bounds.west))
          .build();

      var retinaFactor = utils.layout.getDisplayDensity();

      var offlineRegionDefinition = new com.mapbox.mapboxsdk.offline.OfflineTilePyramidRegionDefinition(
          styleURL,
          bounds,
          arg.minZoom,
          arg.maxZoom,
          retinaFactor);

      var info = '{name:"' + arg.name + '"}';
      var infoStr = new java.lang.String(info);
      var encodedMetadata = infoStr.getBytes();

      if (!mapbox._accessToken && !arg.accessToken) {
        reject("First show a map, or pass in an 'accessToken' param");
        return;
      }
      var offlineManager = mapbox._getOfflineManager(arg);

      offlineManager.createOfflineRegion(offlineRegionDefinition, encodedMetadata, new com.mapbox.mapboxsdk.offline.OfflineManager.CreateOfflineRegionCallback({
        onError: function (errorString) {
          reject(errorString);
        },

        onCreate: function (offlineRegion) {
          if (arg.onCreate) {
            arg.onCreate(offlineRegion);
          }

          offlineRegion.setDownloadState(com.mapbox.mapboxsdk.offline.OfflineRegion.STATE_ACTIVE);

          // Monitor the download progress using setObserver
          offlineRegion.setObserver(new com.mapbox.mapboxsdk.offline.OfflineRegion.OfflineRegionObserver({
            onStatusChanged: function (status) {
              // Calculate the download percentage and update the progress bar
              var percentage = status.getRequiredResourceCount() >= 0 ?
                  (100.0 * status.getCompletedResourceCount() / status.getRequiredResourceCount()) :
                  0.0;

              if (arg.onProgress) {
                arg.onProgress({
                  name: arg.name,
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

            onError: function (error) {
              reject(error.getMessage() + ", reason: " + error.getReason());
            },

            mapboxTileCountLimitExceeded: function (limit) {
              console.log("dl mapboxTileCountLimitExceeded: " + limit);
            }
          }));
        }
      }));

    } catch (ex) {
      console.log("Error in mapbox.downloadOfflineRegion: " + ex);
      reject(ex);
    }
  });
};

mapbox._getOfflineManager = function (arg) {
  if (!mapbox._offlineManager) {
    mapbox._offlineManager = com.mapbox.mapboxsdk.offline.OfflineManager.getInstance(application.android.context);
    if (arg.accessToken) {
      mapbox._offlineManager.setAccessToken(arg.accessToken);
    } else if (mapbox._accessToken) {
      mapbox._offlineManager.setAccessToken(mapbox._accessToken);
    }
  }
  return mapbox._offlineManager;
};

module.exports = mapbox;
