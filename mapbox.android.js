var utils = require("utils/utils");
var application = require("application");
var frame = require("ui/frame");
var fs = require("file-system");
var Color = require("color").Color;
var http = require("http");
var mapbox = require("./mapbox-common");
mapbox._markers = [];
mapbox._polylines = [];
mapbox._markerIconDownloadCache = [];
var ACCESS_FINE_LOCATION_PERMISSION_REQUEST_CODE = 111; // irrelevant really, since we simply invoke onPermissionGranted

mapbox.locationServices = null;

/*************** XML definition START ****************/
var Mapbox = (function (_super) {
  global.__extends(Mapbox, _super);

  function Mapbox() {
    _super.call(this);
    this.config = {};
  }

  Mapbox.prototype._createUI = function () {
    var context = application.android.currentContext;
    this._android = new android.widget.FrameLayout(context);

    var that = this;

    var createUI = function() {

      var settings = mapbox.merge(that.config, mapbox.defaults);
      if (settings.accessToken === undefined) {
        setTimeout(function() {
          var dialogs = require("ui/dialogs");
          dialogs.alert("Please set the 'accessToken' property because now there will be no map :)");
        }, 0);
        return;
      }

      com.mapbox.mapboxsdk.Mapbox.getInstance(application.android.context, settings.accessToken);

      var drawMap = function() {
        that.mapView = new com.mapbox.mapboxsdk.maps.MapView(
            application.android.context,
            mapbox._getMapboxMapOptions(settings));

        that.mapView.onCreate(null);

        that.mapView.getMapAsync(
            new com.mapbox.mapboxsdk.maps.OnMapReadyCallback({
              onMapReady: function (mbMap) {
                that.mapView.mapboxMap = mbMap;

                if (settings.showUserLocation) {
                  mapbox.requestFineLocationPermission().then(function() {
                    mapbox._showLocation(that.mapView, that);
                  });
                }

                that.notifyMapReady();
              }
            })
        );
        that._android.addView(that.mapView);
      };

      setTimeout(drawMap, settings.delay);
    };

    // postpone drawing the map for cases where this plugin is used in an Angular-powered app
    setTimeout(createUI, 0);
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
      return this.mapView;
    },
    enumerable: true,
    configurable: true
  });
  return Mapbox;
}(mapbox.Mapbox));
mapbox.Mapbox = Mapbox;
/*************** XML definition END ****************/


mapbox._getMapboxMapOptions = function (settings) {
  var resourcename = "mapbox_mylocation_icon_default";
  var res = utils.ad.getApplicationContext().getResources();
  var identifier = res.getIdentifier(resourcename, "drawable", utils.ad.getApplication().getPackageName());
  var iconDrawable = android.support.v4.content.ContextCompat.getDrawable(application.android.context, identifier);

  var mapboxMapOptions = new com.mapbox.mapboxsdk.maps.MapboxMapOptions()
      .styleUrl(mapbox._getMapStyle(settings.style))
      .compassEnabled(!settings.hideCompass)
      .rotateGesturesEnabled(!settings.disableRotation)
      .scrollGesturesEnabled(!settings.disableScroll)
      .tiltGesturesEnabled(!settings.disableTilt)
      .zoomGesturesEnabled(!settings.disableZoom)
      .attributionEnabled(!settings.hideAttribution)
      .myLocationForegroundDrawable(iconDrawable)
      // .myLocationBackgroundDrawable(iconDrawable)
      .myLocationForegroundTintColor(android.graphics.Color.rgb(135, 206, 250)) // "lightskyblue"
      // .myLocationBackgroundTintColor(android.graphics.Color.YELLOW)
      .myLocationAccuracyTint(android.graphics.Color.rgb(135, 206, 250)) // "lightskyblue"
      .myLocationAccuracyAlpha(80)
      .logoEnabled(!settings.hideLogo);

  // zoomlevel is not applied unless center is set
  if (settings.zoomLevel && !settings.center) {
    // Eiffel tower, Paris
    settings.center = {
      lat: 48.858093,
      lng: 2.294694
    }
  }

  if (settings.center && settings.center.lat && settings.center.lng) {
    var cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
        .zoom(settings.zoomLevel)
        .target(new com.mapbox.mapboxsdk.geometry.LatLng(settings.center.lat, settings.center.lng));
    mapboxMapOptions.camera(cameraPositionBuilder.build());
  }

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
  return new Promise(function (resolve, reject) {
    if (!mapbox._fineLocationPermissionGranted()) {

      // grab the permission dialog result
      application.android.on(application.AndroidApplication.activityRequestPermissionsEvent, function (args) {
        for (var i = 0; i < args.permissions.length; i++) {
          if (args.grantResults[i] === android.content.pm.PackageManager.PERMISSION_DENIED) {
            reject("Permission denied");
            return;
          }
        }
        resolve();
      });

      // invoke the permission dialog
      android.support.v4.app.ActivityCompat.requestPermissions(
          application.android.foregroundActivity,
          [android.Manifest.permission.ACCESS_FINE_LOCATION],
          ACCESS_FINE_LOCATION_PERMISSION_REQUEST_CODE);
    } else {
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

mapbox._showLocation = function(theMapView, ownerObject) {
  mapbox.locationServices = com.mapbox.mapboxsdk.location.LocationSource.getLocationEngine(application.android.context);
  /*
   var locationEngineListener = new com.mapbox.services.android.telemetry.location.LocationEngineListener({
       onConnected: function () {
     },
     onLocationChanged: function (location) {
     }
   });
   mapbox.locationServices.addLocationEngineListener(locationEngineListener);
   */
  theMapView.mapboxMap.setMyLocationEnabled(true);
  mapbox.locationServices.activate();
  mapbox.locationServices.requestLocationUpdates();
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
        com.mapbox.mapboxsdk.Mapbox.getInstance(application.android.context, settings.accessToken);
        var mapboxMapOptions = mapbox._getMapboxMapOptions(settings);

        mapbox.mapView = new com.mapbox.mapboxsdk.maps.MapView(
            application.android.context,
            mapboxMapOptions);

        mapbox.mapView.onCreate(null);

        mapbox.mapView.getMapAsync(
            new com.mapbox.mapboxsdk.maps.OnMapReadyCallback({
              onMapReady: function (mbMap) {
                mapbox.mapboxMap = mbMap;
                mapbox.mapView.mapboxMap = mapbox.mapboxMap;
                // mapbox.mapboxMap.setStyleUrl(mapbox._getMapStyle(settings.style));
                // mapbox.mapboxMap.setStyleUrl(com.mapbox.mapboxsdk.constants.Style.DARK);

                mapbox._polylines = [];
                mapbox._markers = [];
                mapbox._addMarkers(settings.markers, mapbox.mapView);

                if (settings.showUserLocation) {
                  mapbox.requestFineLocationPermission().then(function() {
                    mapbox._showLocation(mapbox.mapView, mapbox);
                  });
                }
                resolve();
              }
            })
        );

        // mapbox.mapView.onResume();

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
      if (mapbox.mapView) {
        var viewGroup = mapbox.mapView.getParent();
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

mapbox.destroy = function(arg) {
  return new Promise(function (resolve, reject) {
    if (mapbox.mapView) {
      var viewGroup = mapbox.mapView.getParent();
      if (viewGroup !== null) {
        viewGroup.removeView(mapbox.mapView);
      }
      mapbox.mapView = null;
      mapbox.mapboxMap = null;
    }
  });
};

mapbox.setMapStyle = function (style, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      theMap.mapboxMap.setStyleUrl(mapbox._getMapStyle(style));
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.setMapStyle: " + ex);
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
  if (!theMap || !theMap.mapboxMap) {
    return;
  }
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

function downloadImage(marker) {
  return new Promise(function (resolve, reject) {
    // to cache..
    if (mapbox._markerIconDownloadCache[marker.icon]) {
      marker.iconDownloaded = mapbox._markerIconDownloadCache[marker.icon];
      resolve(marker);
      return;
    }
    // ..or not to cache
    http.getImage(marker.icon).then(
        function (output) {
          marker.iconDownloaded = output.android;
          mapbox._markerIconDownloadCache[marker.icon] = marker.iconDownloaded;
          resolve(marker);
        }, function (e) {
          console.log("Download failed from " + marker.icon + " with error: " + e);
          resolve(marker);
        });
  });
}

function downloadMarkerImages(markers) {
  var iterations = [];
  var result = [];
  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i];
    if (marker.icon && marker.icon.startsWith("http")) {
      var p = downloadImage(marker).then(function(mark) {
        result.push(mark);
      });
      iterations.push(p);
    } else {
      result.push(marker);
    }
  }
  return Promise.all(iterations).then(function(output) {
    return result;
  });
}

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
  if (!theMap || !theMap.mapboxMap) {
    return;
  }

  theMap.mapboxMap.setOnMarkerClickListener(
      new com.mapbox.mapboxsdk.maps.MapboxMap.OnMarkerClickListener ({
        onMarkerClick: function (marker) {
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
          var cachedMarker = mapbox._getClickedMarkerDetails(marker);
          if (cachedMarker && cachedMarker.onCalloutTap) {
            cachedMarker.onCalloutTap(cachedMarker);
          }
          return true;
        }
      })
  );

  var iconFactory = com.mapbox.mapboxsdk.annotations.IconFactory.getInstance(application.android.context);

  // if any markers need to be downloaded from the web they need to be available synchronously, so fetch them first before looping
  downloadMarkerImages(markers).then(function(updatedMarkers) {
    for (var m in updatedMarkers) {
      var marker = updatedMarkers[m];
      mapbox._markers.push(marker);
      var markerOptions = new com.mapbox.mapboxsdk.annotations.MarkerOptions();
      markerOptions.setTitle(marker.title);
      markerOptions.setSnippet(marker.subtitle);
      markerOptions.setPosition(new com.mapbox.mapboxsdk.geometry.LatLng(parseFloat(marker.lat), parseFloat(marker.lng)));
      if (marker.icon) {
        // for markers from url see UrlMarker in https://github.com/mapbox/mapbox-gl-native/issues/5370
        if (marker.icon.startsWith("res://")) {
          var resourcename = marker.icon.substring(6);
          var res = utils.ad.getApplicationContext().getResources();
          var identifier = res.getIdentifier(resourcename, "drawable", utils.ad.getApplication().getPackageName());
          if (identifier === 0) {
            console.log("No icon found for this device desity for icon " + marker.icon + ", using default");
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
  });
};

mapbox.setCenter = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      var cameraPosition = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
          .target(new com.mapbox.mapboxsdk.geometry.LatLng(arg.lat, arg.lng))
          .build();

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

mapbox.getCenter = function (nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      var coordinate = theMap.mapboxMap.getCameraPosition().target;
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

mapbox.getZoomLevel = function (nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;
      var level = theMap.mapboxMap.getCameraPosition().zoom;
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

mapbox.getViewport = function (nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      if (!mapbox.mapboxMap) {
        reject("No map has been loaded");
        return;
      }

      var theMap = nativeMap || mapbox;
      var bounds = theMap.mapboxMap.getProjection().getVisibleRegion().latLngBounds;

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

mapbox.setOnMapClickListener = function (listener, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;

      if (!theMap) {
        reject("No map has been loaded");
        return;
      }

      theMap.mapboxMap.setOnMapClickListener(
          new com.mapbox.mapboxsdk.maps.MapboxMap.OnMapClickListener ({
            onMapClick: function (point) {
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
      var offlineManager = mapbox._getOfflineManager();

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

mapbox.listOfflineRegions = function () {
  return new Promise(function (resolve, reject) {
    try {
      var offlineManager = mapbox._getOfflineManager();

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

mapbox.addGeoJsonClustered = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox;

      theMap.mapboxMap.addSource(
          new com.mapbox.mapboxsdk.style.sources.GeoJsonSource(arg.name,
              new java.net.URL(arg.data),
              new com.mapbox.mapboxsdk.style.sources.GeoJsonOptions()
                  .withCluster(true)
                  .withClusterMaxZoom(arg.clusterMaxZoom || 13)
                  .withClusterRadius(arg.clusterRadius || 40)
          )
      );

      var layers = [];
      if (arg.clusters) {
        for (var i = 0; i < arg.clusters.length; i++) {
          layers.push([arg.clusters.points, new Color(arg.clusters.color).android]);
        }
      } else {
        layers.push([150, new Color("red").android]);
        layers.push([20, new Color("green").android]);
        layers.push([0, new Color("blue").android]);
      };

      // for some reason unclustered doesn't show up :(
      var unclustered = new com.mapbox.mapboxsdk.style.layers.SymbolLayer("unclustered-points", "earthquakes");
      unclustered.setProperties([
        com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleColor(new Color("red").android),
        com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleRadius(new java.lang.Float(18.0)),
        com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleBlur(new java.lang.Float(0.2))
      ]);
      unclustered.setFilter(com.mapbox.mapboxsdk.style.layers.Filter.neq("cluster", new java.lang.Boolean(true)));
      theMap.mapboxMap.addLayer(unclustered); //, "building");

      for (var i = 0; i < layers.length; i++) {
        // Add some nice circles
        var circles = new com.mapbox.mapboxsdk.style.layers.CircleLayer("cluster-" + i, "earthquakes");
        circles.setProperties([
              // com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconImage("icon")
              com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleColor(layers[i][1]),
              com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleRadius(new java.lang.Float(22.0)),
              com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleBlur(new java.lang.Float(0.2))
            ]
        );

        circles.setFilter(
            i == 0
                ? com.mapbox.mapboxsdk.style.layers.Filter.gte("point_count", new java.lang.Integer(layers[i][0]))
                : com.mapbox.mapboxsdk.style.layers.Filter.all([
                  com.mapbox.mapboxsdk.style.layers.Filter.gte("point_count", new java.lang.Integer(layers[i][0])),
                  com.mapbox.mapboxsdk.style.layers.Filter.lt("point_count", new java.lang.Integer(layers[i - 1][0]))
                ])
        );

        theMap.mapboxMap.addLayer(circles); //, "building");
      }

      // Add the count labels
      var count = new com.mapbox.mapboxsdk.style.layers.SymbolLayer("count", "earthquakes");
      count.setProperties([
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.textField("{point_count}"),
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.textSize(new java.lang.Float(12.0)),
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.textColor(new Color("white").android)
          ]
      );
      theMap.mapboxMap.addLayer(count);

      resolve();
    } catch (ex) {
      console.log("Error in mapbox.addSource: " + ex);
      reject(ex);
    }
  });
};


mapbox._getOfflineManager = function () {
  if (!mapbox._offlineManager) {
    mapbox._offlineManager = com.mapbox.mapboxsdk.offline.OfflineManager.getInstance(application.android.context);
  }
  return mapbox._offlineManager;
};

module.exports = mapbox;
