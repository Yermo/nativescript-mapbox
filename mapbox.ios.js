var mapbox = require("./mapbox-common");
var fs = require("file-system");
var imgSrc = require("image-source");

(function() {
  // need to kick this off otherwise offline stuff won't work without first showing a map
  MGLOfflineStorage.sharedOfflineStorage();
})();

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

      // if already added, make sure it's removed first
      if (mapbox.mapView) {
        mapbox.mapView.removeFromSuperview();
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
      mapbox.mapView = MGLMapView.alloc().initWithFrameStyleURL(mapFrame, styleURL);

      // TODO not sure this works as planned.. perhaps better to listen for rotate events ([..didrotate..] and fix the frame
      mapbox.mapView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

      if (settings.center) {
        var centerCoordinate = CLLocationCoordinate2DMake(settings.center.lat, settings.center.lng);
        mapbox.mapView.setCenterCoordinateZoomLevelAnimated(centerCoordinate, settings.zoomLevel, false);
      } else {
        mapbox.mapView.setZoomLevelAnimated(settings.zoomLevel, false);
      }

      mapbox.mapView.showsUserLocation = settings.showUserLocation;
      mapbox.mapView.attributionButton.hidden = settings.hideAttribution;
      mapbox.mapView.logoView.hidden = settings.hideLogo;
      mapbox.mapView.compassView.hidden = settings.hideCompass;
      mapbox.mapView.rotateEnabled = !settings.disableRotation;
      mapbox.mapView.scrollEnabled = !settings.disableScroll;
      mapbox.mapView.zoomEnabled = !settings.disableZoom;
      mapbox.mapView.allowsTilting = !settings.disableTilt;

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
      mapbox.mapView.removeFromSuperview();
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
        var view = UIApplication.sharedApplication().keyWindow.rootViewController.view;
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

mapbox.removeMarkers = function (ids) {
  return new Promise(function (resolve, reject) {
    try {
      var markersToRemove = [];
      for (var m in mapbox._markers) {
        var marker = mapbox._markers[m];
        if (!ids || (marker.id && ids.indexOf(marker.id) > -1)) {
          markersToRemove.push(marker.ios);
        }
      }
      if (markersToRemove.length > 0) {
        mapbox.mapView.removeAnnotations(markersToRemove);
      }
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.removeMarkers: " + ex);
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
    var lat = marker.lat;
    var lng = marker.lng;
    var point = MGLPointAnnotation.alloc().init();
    point.coordinate = CLLocationCoordinate2DMake(lat, lng);
    point.title = marker.title;
    point.subtitle = marker.subtitle;
    mapbox.mapView.addAnnotation(point);
    marker.ios = point;
    mapbox._markers.push(marker);
  }
};

mapbox.setCenter = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      var animated = arg.animated || true;
      var lat = arg.lat;
      var lng = arg.lng;
      var coordinate = CLLocationCoordinate2DMake(lat, lng);
      mapbox.mapView.setCenterCoordinateAnimated(coordinate, animated);
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
      var coordinate = mapbox.mapView.centerCoordinate;
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
        mapbox.mapView.setZoomLevelAnimated(level, animated);
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
      var level = mapbox.mapView.zoomLevel;
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

      mapbox.mapView.setCameraWithDurationAnimationTimingFunction(
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

      mapbox.mapView.addAnnotation(polygon);
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
      if (!mapbox.mapView) {
        reject("No map has been loaded");
        return;
      }

      var visibleBounds = mapbox.mapView.visibleCoordinateBounds;
      var bounds = {
        north: visibleBounds.ne.latitude,
        east: visibleBounds.ne.longitude,
        south: visibleBounds.sw.latitude,
        west: visibleBounds.sw.longitude
      };
      resolve({
        bounds: bounds,
        zoomLevel: mapbox.mapView.zoomLevel
      });
    } catch (ex) {
      console.log("Error in mapbox.getViewport: " + ex);
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

mapbox.listOfflineRegions = function (arg) {
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