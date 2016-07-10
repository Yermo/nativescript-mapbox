var mapbox = require("./mapbox-common");
var fs = require("file-system");
var imgSrc = require("image-source");

mapbox._getMapStyle = function(input) {
  var version = 9;

  if (input === mapbox.MapStyle.LIGHT) {
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

      // if no accessToken was set the app may crash
      if (settings.accessToken === undefined) {
        reject("Please set the 'accessToken' parameter");
        return;
      }

      var view = UIApplication.sharedApplication().keyWindow.rootViewController.view,
          frameRect = view.frame,
          mapFrame = CGRectMake(
              settings.margins.left,
              settings.margins.top,
              frameRect.size.width - settings.margins.left - settings.margins.right,
              frameRect.size.height - settings.margins.top - settings.margins.bottom
          ),
          styleURL = mapbox._getMapStyle(settings.style);

      MGLAccountManager.setAccessToken(settings.accessToken);
      mapView = MGLMapView.alloc().initWithFrameStyleURL(mapFrame, styleURL);

      // TODO not sure this works as planned.. perhaps better to listen for rotate events ([..didrotate..] and fix the frame
      mapView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

      if (settings.center) {
        var centerCoordinate = CLLocationCoordinate2DMake(settings.center.lat, settings.center.lng);
        mapView.setCenterCoordinateZoomLevelAnimated(centerCoordinate, settings.zoomLevel, false);
      } else {
        mapView.setZoomLevelAnimated(settings.zoomLevel, false);
      }

      mapView.showsUserLocation = settings.showUserLocation;
      mapView.attributionButton.hidden = settings.hideAttribution;
      mapView.logoView.hidden = settings.hideLogo;
      mapView.compassView.hidden = settings.hideCompass;
      mapView.rotateEnabled = !settings.disableRotation;
      mapView.scrollEnabled = !settings.disableScroll;
      mapView.zoomEnabled = !settings.disableZoom;
      mapView.allowsTilting = !settings.disableTilt;

      mapView.delegate = mapbox._delegate = MGLMapViewDelegateImpl.new().initWithCallback(
        function () {
          resolve();
        }
      );

      mapbox._markers = [];
      mapbox._addMarkers(settings.markers);

      // wrapping in a little timeout since the map area tends to flash black a bit initially
      setTimeout(function() {
        view.addSubview(mapView);
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
      mapView.removeFromSuperview();
      resolve("Done");
    } catch (ex) {
      console.log("Error in mapbox.hide: " + ex);
      reject(ex);
    }
  });
};

mapbox.addMarkers = function (markers) {
  return new Promise(function (resolve, reject) {
    try {
      mapbox._addMarkers(markers);
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.addMarkers: " + ex);
      reject(ex);
    }
  });
};

mapbox._addMarkers = function(markers) {
  if (!markers) {
    return;
  }
  for (var m in markers) {
    var marker = markers[m];
    mapbox._markers.push(marker);
    var lat = marker.lat;
    var lng = marker.lng;
    var point = MGLPointAnnotation.alloc().init();
    point.coordinate = CLLocationCoordinate2DMake(lat, lng);
    point.title = marker.title;
    point.subtitle = marker.subtitle;
    mapView.addAnnotation(point);
  }
};

mapbox.setCenter = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      var animated = arg.animated || true;
      var lat = arg.lat;
      var lng = arg.lng;
      var coordinate = CLLocationCoordinate2DMake(lat, lng);
      mapView.setCenterCoordinateAnimated(coordinate, animated);
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
      var coordinate = mapView.centerCoordinate;
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

mapbox.setZoomLevel = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      var animated = arg.animated || true;
      var level = arg.level;
      if (level >=0 && level <= 20) {
        mapView.setZoomLevelAnimated(level, animated);
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
      var level = mapView.zoomLevel;
      resolve(level);
    } catch (ex) {
      console.log("Error in mapbox.getZoomLevel: " + ex);
      reject(ex);
    }
  });
};

mapbox.setTilt = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      reject("Not implemented for iOS");
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

mapbox.animateCamera = function (arg) {
  return new Promise(function (resolve, reject) {
    try {

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

      mapView.setCameraWithDurationAnimationTimingFunction(
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

mapbox.addPolygon = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      var points = arg.points;
      if (points === undefined) {
        reject("Please set the 'points' parameter");
        return;
      }

      /*
      TODO 'sizeof' is not valid in {N}, but we need it for this:
      var coordinates = malloc(points.length * sizeof(CLLocationCoordinate2D));
      for (var i=0; i<points.length; i++) {
        var point = points[i];
        coordinates[i] = CLLocationCoordinate2DMake(point.lat, point.lng);
      }

      var polygon = MGLPolygon.polygonWithCoordinatesCount(
        coordinates,
        points.length);

      mapView.addAnnotation(polygon);
      */

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
    UIApplication.sharedApplication().applicationIconBadgeNumber = 0;
  }
};

mapbox.getViewport = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      resolve({
        bounds: mapView.visibleCoordinateBounds,
        zoomLevel: mapView.zoomLevel
      });
    } catch (ex) {
      console.log("Error in mapbox.getViewport: " + ex);
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
          error: error.localizedFailureReason
        });
      });

      mapbox._addObserver(MGLOfflinePackMaximumMapboxTilesReachedNotification, function (notification) {
        console.log("--- error MGLOfflinePackMaximumMapboxTilesReachedNotification");
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
          // The pack couldn’t be created for some reason.
          reject(error.localizedFailureReason);
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
  return NSNotificationCenter.defaultCenter().addObserverForNameObjectQueueUsingBlock(eventName, null, NSOperationQueue.mainQueue(), callback);
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
    console.log("--- mapViewDidFinishLoadingMap");
    this._mapLoadedCallback();
  };
  MGLMapViewDelegateImpl.prototype.mapViewAnnotationCanShowCallout = function(mapView, annotation) {
    return true;
  };

  // fired when the marker icon is about to be rendered - return null for the default icon
  MGLMapViewDelegateImpl.prototype.mapViewImageForAnnotation = function(mapView, annotation) {
    var cachedMarker = _getTappedMarkerDetails(annotation);
    if (cachedMarker && cachedMarker.iconPath) {
      if (cachedMarker.reuseIdentifier) {
        return mapView.dequeueReusableAnnotationImageWithIdentifier(cachedMarker.reuseIdentifier);
      }
      var appPath = fs.knownFolders.currentApp().path;
      var iconFullPath = appPath + "/" + cachedMarker.iconPath;
      if (fs.File.exists(iconFullPath)) {
        var image = imgSrc.fromFile(iconFullPath).ios;
        // TODO (future) add resize options for nice retina rendering
        cachedMarker.reuseIdentifier = cachedMarker.iconPath;
        return MGLAnnotationImage.annotationImageWithImageReuseIdentifier(image, cachedMarker.reuseIdentifier);
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