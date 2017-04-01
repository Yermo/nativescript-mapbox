var mapbox = require("./mapbox-common");
var fs = require("file-system");
var imgSrc = require("image-source");
var utils = require("utils/utils");
var http = require("http");

mapbox._markers = [];
mapbox._markerIconDownloadCache = [];

(function() {
  // need to kick this off otherwise offline stuff won't work without first showing a map
  MGLOfflineStorage.sharedOfflineStorage();
})();


/*************** XML definition START ****************/
var Mapbox = (function (_super) {
	global.__extends(Mapbox, _super);

	function Mapbox() {
    _super.call(this);
    this.config = {};
	}

	Mapbox.prototype.onLoaded = function () {
    _super.prototype.onLoaded.call(this);
  };

	Object.defineProperty(Mapbox.prototype, "ios", {
    get: function () {
      if (!this._ios) {
        this._ios = UIView.new();
      }
      if (!this.mapView && this.config.accessToken) {
        var settings = mapbox.merge(this.config, mapbox.defaults);

        MGLAccountManager.setAccessToken(settings.accessToken);

        var that = this;

        var drawMap = function() {
          that.mapView = MGLMapView.alloc().initWithFrameStyleURL(CGRectMake(0, 0, that._ios.frame.size.width, that._ios.frame.size.height), mapbox._getMapStyle(settings.style));
          that.mapView.delegate = that._delegate = MGLMapViewDelegateImpl.new().initWithCallback(function() {});
          mapbox._setMapboxMapOptions(that.mapView, settings);
          that._ios.addSubview(that.mapView);
          that.notifyMapReady();
        };

        setTimeout(drawMap, settings.delay);
      }
      return this._ios;
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


mapbox._setMapboxMapOptions = function (mapView, settings) {
  mapView.logoView.hidden = settings.hideLogo;
  mapView.attributionButton.hidden = settings.hideAttribution;
  mapView.showsUserLocation = settings.showUserLocation;
  mapView.compassView.hidden = settings.hideCompass;
  mapView.rotateEnabled = !settings.disableRotation;
  mapView.scrollEnabled = !settings.disableScroll;
  mapView.zoomEnabled = !settings.disableZoom;
  mapView.allowsTilting = !settings.disableTilt;

  if (settings.center && settings.center.lat && settings.center.lng) {
    var centerCoordinate = CLLocationCoordinate2DMake(settings.center.lat, settings.center.lng);
    mapView.setCenterCoordinateZoomLevelAnimated(centerCoordinate, settings.zoomLevel, false);
  } else {
    mapView.setZoomLevelAnimated(settings.zoomLevel, false);
  }

  // TODO not sure this works as planned.. perhaps better to listen for rotate events ([..didrotate..] and fix the frame
  mapView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
};

mapbox._getMapStyle = function(input) {
  var version = 9;

  if (/^mapbox:\/\/styles/.test(input)) {
    // allow for a style URL to be passed
    return NSURL.URLWithString(input);
  } else if (input === mapbox.MapStyle.LIGHT) {
    return MGLStyle.lightStyleURLWithVersion(version);
  } else if (input === mapbox.MapStyle.DARK) {
    return MGLStyle.darkStyleURLWithVersion(version);
  } else if (input === mapbox.MapStyle.OUTDOORS) {
    return MGLStyle.outdoorsStyleURLWithVersion(version);
  } else if (input === mapbox.MapStyle.SATELLITE) {
    return MGLStyle.satelliteStyleURLWithVersion(version);
  } else if (input === mapbox.MapStyle.HYBRID || mapbox.MapStyle.SATELLITE_STREETS) {
    return MGLStyle.satelliteStreetsStyleURLWithVersion(version);
  } else {
    // default
    return MGLStyle.streetsStyleURLWithVersion(version);
  }
};

mapbox.show = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      var settings = mapbox.merge(arg, mapbox.defaults);

      // var directions = MBDirections.alloc().initWithAccessToken(arg.accessToken);
      // alert("directions: " + directions);

      // if no accessToken was set the app may crash
      if (settings.accessToken === undefined) {
        reject("Please set the 'accessToken' parameter");
        return;
      }

      // if already added, make sure it's removed first
      if (mapbox.mapView) {
        mapbox.mapView.removeFromSuperview();
      }

      var view = utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController.view,
          frameRect = view.frame,
          mapFrame = CGRectMake(
              settings.margins.left,
              settings.margins.top,
              frameRect.size.width - settings.margins.left - settings.margins.right,
              frameRect.size.height - settings.margins.top - settings.margins.bottom
          ),
          styleURL = mapbox._getMapStyle(settings.style);

      MGLAccountManager.setAccessToken(settings.accessToken);
      mapbox.mapView = MGLMapView.alloc().initWithFrameStyleURL(mapFrame, styleURL);
      mapbox._setMapboxMapOptions(mapbox.mapView, settings);

      mapbox.mapView.delegate = mapbox._delegate = MGLMapViewDelegateImpl.new().initWithCallback(
        function () {
          resolve();
        }
      );

      mapbox._markers = [];
      mapbox._addMarkers(settings.markers);

      // wrapping in a little timeout since the map area tends to flash black a bit initially
      setTimeout(function() {
        view.addSubview(mapbox.mapView);
      }, 500);

    } catch (ex) {
      console.log("Error in mapbox.show: " + ex);
      reject(ex);
    }
  });
};

mapbox.hide = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (mapbox.mapView) {
        mapbox.mapView.removeFromSuperview();
      }
      resolve("Done");
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
        var view = utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController.view;
        view.addSubview(mapbox.mapView);
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

mapbox.destroy = function(arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    var theMap = nativeMap || mapbox.mapView;
    if (theMap) {
      theMap.removeFromSuperview();
      theMap.delegate = null;
      theMap = null;
    }
  });
};

mapbox.setMapStyle = function (style, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox.mapView;
      theMap.styleURL = mapbox._getMapStyle(style);
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
      var theMap = nativeMap || mapbox.mapView;
      var markersToRemove = [];
      for (var m in mapbox._markers) {
        var marker = mapbox._markers[m];
        if (!ids || (marker.id && ids.indexOf(marker.id) > -1)) {
          markersToRemove.push(marker.ios);
        }
      }

      // remove markers from cache
      if (ids) {
        mapbox._markers = mapbox._markers.filter(function (marker) {
          return ids.indexOf(marker.id) < 0;
        });
      } else {
        mapbox._markers = [];
      }

      if (markersToRemove.length > 0) {
        theMap.removeAnnotations(markersToRemove);
      }
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.removeMarkers: " + ex);
      reject(ex);
    }
  });
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
        marker.iconDownloaded = output.ios;
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
  var theMap = nativeMap || mapbox.mapView;

  downloadMarkerImages(markers).then(function(updatedMarkers) {
    for (var m in updatedMarkers) {
      var marker = updatedMarkers[m];
      var lat = marker.lat;
      var lng = marker.lng;
      var point = MGLPointAnnotation.new();
      point.coordinate = CLLocationCoordinate2DMake(lat, lng);
      point.title = marker.title;
      point.subtitle = marker.subtitle;
      // needs to be done before adding to the map, otherwise the delegate method 'mapViewImageForAnnotation' can't use it
      mapbox._markers.push(marker);
      theMap.addAnnotation(point);
      marker.ios = point;
    }
  });
};

mapbox.setCenter = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox.mapView;
      var animated = arg.animated === undefined  || arg.animated;
      var lat = arg.lat;
      var lng = arg.lng;
      var coordinate = CLLocationCoordinate2DMake(lat, lng);
      theMap.setCenterCoordinateAnimated(coordinate, animated);
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
      var theMap = nativeMap || mapbox.mapView;
      var coordinate = theMap.centerCoordinate;
      resolve({
        lat: coordinate.latitude,
        lng: coordinate.longitude
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
      var theMap = nativeMap || mapbox.mapView;
      var animated = arg.animated === undefined  || arg.animated;
      var level = arg.level;
      if (level >=0 && level <= 20) {
        theMap.setZoomLevelAnimated(level, animated);
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
      var theMap = nativeMap || mapbox.mapView;
      var level = theMap.zoomLevel;
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
      reject("Not (yet) implemented for iOS");
    } catch (ex) {
      console.log("Error in mapbox.setTilt: " + ex);
      reject(ex);
    }
  });
};

mapbox.getTilt = function () {
  return new Promise(function (resolve, reject) {
    try {
      reject("Not implemented for iOS");
    } catch (ex) {
      console.log("Error in mapbox.getTilt: " + ex);
      reject(ex);
    }
  });
};

mapbox.animateCamera = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox.mapView;

      var target = arg.target;
      if (target === undefined) {
        reject("Please set the 'target' parameter");
        return;
      }

      var cam = MGLMapCamera.camera();

      cam.centerCoordinate = CLLocationCoordinate2DMake(target.lat, target.lng);

      if (arg.altitude) {
        cam.altitude = arg.altitude;
      }

      if (arg.bearing) {
        cam.heading = arg.bearing;
      }

      if (arg.tilt) {
        cam.pitch = arg.tilt;
      }

      var duration = arg.duration ? (arg.duration / 1000) : 10;

      theMap.setCameraWithDurationAnimationTimingFunction(
        cam,
        duration,
        CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut));

      resolve();
    } catch (ex) {
      console.log("Error in mapbox.animateCamera: " + ex);
      reject(ex);
    }
  });
};

mapbox.addPolyline = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      var theMap = nativeMap || mapbox.mapView;
      var points = arg.points;
      if (points === undefined) {
        reject("Please set the 'points' parameter");
        return;
      }

      // TODO

      reject("not implemented for iOS (yet)");
    } catch (ex) {
      console.log("Error in mapbox.addPolyline: " + ex);
      reject(ex);
    }
  });
};

mapbox.removePolylines = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      // TODO
      // var theMap = nativeMap || mapbox.mapView;

      reject("not implemented for iOS (yet)");
    } catch (ex) {
      console.log("Error in mapbox.removePolylines: " + ex);
      reject(ex);
    }
  });
};

mapbox.addPolygon = function (arg, nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      /*
      var theMap = nativeMap || mapbox.mapView;

      var points = arg.points;
      if (points === undefined) {
        reject("Please set the 'points' parameter");
        return;
      }

      // TODO see http://docs.nativescript.org/runtimes/ios/types/C-Pointers.html#interopsizeof
      var coordinates = []; // malloc(points.length * interop.sizeof(CLLocationCoordinate2D));
      console.log(1);
      for (var i=0; i<points.length; i++) {
      console.log(2);
        var point = points[i];
      console.log(3);
        coordinates.push(CLLocationCoordinate2DMake(point.lat, point.lng));
      }
      console.log(4);

      var numberOfCoordinates = points.length / interop.sizeof(CLLocationCoordinate2D);
      console.log(5);

      // TODO check doc.. bounds?
      var polygon = MGLPolygon.polygonWithCoordinatesCount(
        coordinates,
        numberOfCoordinates);

      console.log(6);

      console.log("-- polygon: " + polygon);

        // TODO optional
      // free(coordinates);

      theMap.addAnnotation(polygon);
      */

      // resolve();
      reject("not implemented for iOS (yet)");
    } catch (ex) {
      console.log("Error in mapbox.addPolygon: " + ex);
      reject(ex);
    }
  });
};


mapbox._reportOfflineRegionDownloadProgress = function() {
  if (firebase._receivedNotificationCallback !== null) {
    for (var p in firebase._pendingNotifications) {
      var userInfoJSON = firebase._pendingNotifications[p];
      console.log("Received a push notification with title: " + userInfoJSON.aps.alert.title);
      // move the most relevant properties so it's according to the TS definition and aligned with Android
      userInfoJSON.title = userInfoJSON.aps.alert.title;
      userInfoJSON.body = userInfoJSON.aps.alert.body;
      userInfoJSON.badge = userInfoJSON.aps.badge;
      firebase._receivedNotificationCallback(userInfoJSON);
    }
    firebase._pendingNotifications = [];
    firebase._addObserver(kFIRInstanceIDTokenRefreshNotification, firebase._onTokenRefreshNotification);
    utils.ios.getter(UIApplication, UIApplication.sharedApplication).applicationIconBadgeNumber = 0;
  }
};

mapbox.getViewport = function (nativeMap) {
  return new Promise(function (resolve, reject) {
    try {
      if (!mapbox.mapView) {
        reject("No map has been loaded");
        return;
      }

      var theMap = nativeMap || mapbox.mapView;
      var visibleBounds = theMap.visibleCoordinateBounds;
      var bounds = {
        north: visibleBounds.ne.latitude,
        east: visibleBounds.ne.longitude,
        south: visibleBounds.sw.latitude,
        west: visibleBounds.sw.longitude
      };
      resolve({
        bounds: bounds,
        zoomLevel: theMap.zoomLevel
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
      var theMap = nativeMap || mapbox.mapView;

      if (!theMap) {
        reject("No map has been loaded");
        return;
      }

      var swCoordinate = CLLocationCoordinate2DMake(arg.bounds.south, arg.bounds.west);
      var neCoordinate = CLLocationCoordinate2DMake(arg.bounds.north, arg.bounds.east);
      var bounds = MGLCoordinateBounds;
      bounds.sw = swCoordinate;
      bounds.ne = neCoordinate;

      var animated = arg.animated === undefined  || arg.animated;
      var padding = UIEdgeInsetsMake(25, 25, 25, 25);

      theMap.setVisibleCoordinateBoundsEdgePaddingAnimated(bounds, padding, animated);
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

      // TODO not implemented for iOS yet (it's rather tricky) -- https://github.com/EddyVerbruggen/nativescript-mapbox/issues/51

      resolve();
    } catch (ex) {
      console.log("Error in mapbox.setOnMapClickListener: " + ex);
      reject(ex);
    }
  });
};

mapbox.deleteOfflineRegion = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (!arg || !arg.name) {
        reject("Pass in the 'region' param");
        return;
      }

      var packs = MGLOfflineStorage.sharedOfflineStorage().packs;
      var regions = [];
      var found = false;
      for (var i = 0; i < packs.count; i++) {
        var pack = packs.objectAtIndex(i);
        var userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(pack.context);
        var name = userInfo.objectForKey("name");
        if (name === arg.name) {
          found = true;
          MGLOfflineStorage.sharedOfflineStorage().removePackWithCompletionHandler(pack, function(p, error) {
            if (error) {
              console.log("del error: " + error);
              console.log("del error: " + error.localizedFailureReason);
              // The pack couldn’t be deleted for some reason.
              reject(error.localizedFailureReason);
            } else {
              resolve();
              // don't return, see note below
            }
          });
          // don't break the loop as there may be multiple packs with the same name
        }
      }
      if (!found) {
        reject("Region not found");
      }
    } catch (ex) {
      console.log("Error in mapbox.deleteOfflineRegion: " + ex);
      reject(ex);
    }
  });
};

mapbox.listOfflineRegions = function () {
  return new Promise(function (resolve, reject) {
    try {
      var packs = MGLOfflineStorage.sharedOfflineStorage().packs;
      if (!packs) {
        reject("No packs found or Mapbox not ready yet");
        return;
      }

      var regions = [];
      for (var i = 0; i < packs.count; i++) {
        var pack = packs.objectAtIndex(i);
        var region = pack.region;
        var style = region.styleURL;
        var userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(pack.context);
        regions.push({
          name: userInfo.objectForKey("name"),
          style: "" + region.styleURL,
          minZoom: region.minimumZoomLevel,
          maxZoom: region.maximumZoomLevel,
          bounds: {
            north: region.bounds.ne.latitude,
            east: region.bounds.ne.longitude,
            south: region.bounds.sw.latitude,
            west: region.bounds.sw.longitude
          }
        });
      }
      resolve(regions);

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
      var swCoordinate = CLLocationCoordinate2DMake(arg.bounds.south, arg.bounds.west);
      var neCoordinate = CLLocationCoordinate2DMake(arg.bounds.north, arg.bounds.east);

      var bounds = MGLCoordinateBounds;
      bounds.sw = swCoordinate;
      bounds.ne = neCoordinate;

      var region = MGLTilePyramidOfflineRegion.alloc().initWithStyleURLBoundsFromZoomLevelToZoomLevel(
            styleURL,
            bounds,
            arg.minZoom,
            arg.maxZoom);

      // TODO there's more observers, see https://www.mapbox.com/ios-sdk/examples/offline-pack/
      if (arg.onProgress) {
        mapbox._addObserver(MGLOfflinePackProgressChangedNotification, function (notification) {
          var offlinePack = notification.object;
          var offlinePackProgress = offlinePack.progress;
          var userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(offlinePack.context);
          var complete = offlinePackProgress.countOfResourcesCompleted == offlinePackProgress.countOfResourcesExpected;

          arg.onProgress({
            name: userInfo.objectForKey("name"),
            completed: offlinePackProgress.countOfResourcesCompleted,
            expected: offlinePackProgress.countOfResourcesExpected,
            percentage: Math.round((offlinePackProgress.countOfResourcesCompleted / offlinePackProgress.countOfResourcesExpected) * 10000) / 100,
            complete: complete
          });

          if (complete) {
            resolve();
          }
        });
      }

      mapbox._addObserver(MGLOfflinePackErrorNotification, function (notification) {
        var offlinePack = notification.object;
        var userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(offlinePack.context);
        var error = notification.userInfo[MGLOfflinePackErrorUserInfoKey];
        reject({
          name: userInfo.objectForKey("name"),
          error: "Download error. " + error
        });
      });

      mapbox._addObserver(MGLOfflinePackMaximumMapboxTilesReachedNotification, function (notification) {
        var offlinePack = notification.object;
        var userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(offlinePack.context);
        var maximumCount = notification.userInfo[MGLOfflinePackMaximumCountUserInfoKey];
        console.log("Offline region " + userInfo.objectForKey("name") + " reached the tile limit of " + maximumCount);
      });

      // Store some data for identification purposes alongside the downloaded resources.
      var userInfo = {"name": arg.name };
      var context = NSKeyedArchiver.archivedDataWithRootObject(userInfo);

      // Create and register an offline pack with the shared offline storage object.
      MGLOfflineStorage.sharedOfflineStorage().addPackForRegionWithContextCompletionHandler(region, context, function(pack, error) {
        if (error) {
          console.log("addPackForRegionWithContextCompletionHandler error: " + error);
          console.log("addPackForRegionWithContextCompletionHandler error.localizedFailureReason: " + error.localizedFailureReason);
          // The pack couldn’t be created for some reason.
          reject(error);
        } else {
          // Start downloading.
          pack.resume();
        }
      });

    } catch (ex) {
      console.log("Error in mapbox.downloadOfflineRegion: " + ex);
      reject(ex);
    }
  });
};

mapbox._addObserver = function (eventName, callback) {
  return utils.ios.getter(NSNotificationCenter, NSNotificationCenter.defaultCenter).addObserverForNameObjectQueueUsingBlock(eventName, null, utils.ios.getter(NSOperationQueue, NSOperationQueue.mainQueue), callback);
};

var MGLMapViewDelegateImpl = (function (_super) {
  __extends(MGLMapViewDelegateImpl, _super);
  function MGLMapViewDelegateImpl() {
    _super.apply(this, arguments);
  }

  MGLMapViewDelegateImpl.new = function () {
    return _super.new.call(this);
  };
  MGLMapViewDelegateImpl.prototype.initWithCallback = function (mapLoadedCallback) {
    this._mapLoadedCallback = mapLoadedCallback;
    return this;
  };
  MGLMapViewDelegateImpl.prototype.mapViewDidFinishLoadingMap = function(mapView) {
    if (this._mapLoadedCallback !== undefined) {
      this._mapLoadedCallback();
    }
  };
  MGLMapViewDelegateImpl.prototype.mapViewAnnotationCanShowCallout = function(mapView, annotation) {
    return true;
  };

  // fired when the marker icon is about to be rendered - return null for the default icon
  MGLMapViewDelegateImpl.prototype.mapViewImageForAnnotation = function(mapView, annotation) {
    var cachedMarker = _getTappedMarkerDetails(annotation);
    if (cachedMarker) {
      if (cachedMarker.reuseIdentifier) {
        var reusedImage = mapView.dequeueReusableAnnotationImageWithIdentifier(cachedMarker.reuseIdentifier);
        if (reusedImage) {
          return reusedImage;
        }
      }

      if (cachedMarker.icon) {
        if (cachedMarker.icon.startsWith("res://")) {
          var resourcename = cachedMarker.icon.substring("res://".length);
          var imageSource = imgSrc.fromResource(resourcename);
          cachedMarker.reuseIdentifier = cachedMarker.icon;
          return MGLAnnotationImage.annotationImageWithImageReuseIdentifier(imageSource.ios, cachedMarker.reuseIdentifier);
        } else if (cachedMarker.icon.startsWith("http")) {
          if (cachedMarker.iconDownloaded !== null) {
            cachedMarker.reuseIdentifier = cachedMarker.icon;
            return MGLAnnotationImage.annotationImageWithImageReuseIdentifier(cachedMarker.iconDownloaded, cachedMarker.reuseIdentifier);
          }
        } else {
          console.log("Please use res://resourcename, http(s)://imageurl or iconPath to use a local path");
        }
      } else if (cachedMarker.iconPath) {
        var appPath = fs.knownFolders.currentApp().path;
        var iconFullPath = appPath + "/" + cachedMarker.iconPath;
        if (fs.File.exists(iconFullPath)) {
          var image = imgSrc.fromFile(iconFullPath).ios;
          // perhaps add resize options for nice retina rendering (although you can now use the 'icon' param instead)
          cachedMarker.reuseIdentifier = cachedMarker.iconPath;
          return MGLAnnotationImage.annotationImageWithImageReuseIdentifier(image, cachedMarker.reuseIdentifier);
        }
      }
    }
    return null;
  };

  // fired when on of the callout's accessoryviews is tapped (not currently used)
  MGLMapViewDelegateImpl.prototype.mapViewAnnotationCalloutAccessoryControlTapped = function(mapView, annotation, control) {
  };

  // fired when a marker is tapped
  MGLMapViewDelegateImpl.prototype.mapViewDidSelectAnnotation = function(mapView, annotation) {
    var cachedMarker = _getTappedMarkerDetails(annotation);
    if (cachedMarker && cachedMarker.onTap) {
      cachedMarker.onTap(cachedMarker);
    }
  };

  // fired when a callout is tapped
  MGLMapViewDelegateImpl.prototype.mapViewTapOnCalloutForAnnotation = function(mapView, annotation) {
    var cachedMarker = _getTappedMarkerDetails(annotation);
    if (cachedMarker && cachedMarker.onCalloutTap) {
      cachedMarker.onCalloutTap(cachedMarker);
    }
  };

  function _getTappedMarkerDetails(tapped) {
    for (var m in mapbox._markers) {
      var cached = mapbox._markers[m];
      if (cached.lat == tapped.coordinate.latitude &&
          cached.lng == tapped.coordinate.longitude &&
          cached.title == tapped.title &&
          cached.subtitle == tapped.subtitle) {
        return cached;
      }
    }
  }

  MGLMapViewDelegateImpl.ObjCProtocols = [MGLMapViewDelegate];
  return MGLMapViewDelegateImpl;
})(NSObject);

module.exports = mapbox;
