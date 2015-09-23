var mapbox = require("./mapbox-common");

mapbox.mapView = null;

mapbox.show = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      var settings = mapbox.merge(arg, mapbox.defaults);

      var view = UIApplication.sharedApplication().keyWindow.rootViewController.view;
      var frameRect = view.frame;

      var mapFrame = CGRectMake(
          settings.margins.left,
          settings.margins.top,
          frameRect.size.width - settings.margins.left - settings.margins.right,
          frameRect.size.height - settings.margins.top - settings.margins.bottom);

      // TODO this in not working yet
      var style = settings.style;
      style = "asset://styles/"+style+"-v8.json";

      mapView = MGLMapView.alloc().initWithFrame(mapFrame);

      // TODO not sure this works as planned.. better to listen for rotate events ([..didrotate..] and fix the frame
      mapView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

      //mapView.autoresizingMask = UIViewAutoresizingFlexibleWidth;

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


      if (settings.markers) {
        for (var m in settings.markers) {
          var marker = settings.markers[m];
          var lat = marker.lat;
          var lng = marker.lng;
          var point = MGLPointAnnotation.alloc().init();
          point.coordinate = CLLocationCoordinate2DMake(lat, lng);
          point.title = marker.title;
          point.subtitle = marker.subtitle;
          mapView.addAnnotation(point);
        }
      }

      ////////////// TODO check dit: https://github.com/NativeScript/NativeScript/issues/432


      // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
      var delegate = MGLMapViewDelegateImpl.new().initWithCallback(function (loaded) {
        // TODO don't use resolve here as we already did.. can we use a custom callback handler? Or don't we need this neway?
        // Remove the local variable for the delegate.
//        delegate = undefined;
      });
      mapView.delegate = delegate;

      view.addSubview(mapView);

      resolve("Done");
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
      for (m in markers) {
        var marker = markers[m];
        var lat = marker.lat;
        var lng = marker.lng;
        var point = MGLPointAnnotation.alloc().init();
        point.coordinate = CLLocationCoordinate2DMake(lat, lng);
        point.title = marker.title;
        point.subtitle = marker.subtitle;
        mapView.addAnnotation(point);
      }
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.addMarkers: " + ex);
      reject(ex);
    }
  });
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
      })
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
      console.log("Error in mapbox.addMarkers: " + ex);
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

var MGLMapViewDelegateImpl = (function (_super) {
  __extends(MGLMapViewDelegateImpl, _super);
  function MGLMapViewDelegateImpl() {
    _super.apply(this, arguments);
  }

  MGLMapViewDelegateImpl.new = function () {
    return _super.new.call(this);
  };
  MGLMapViewDelegateImpl.prototype.initWithCallback = function (callback) {
    this._callback = callback;
    return this;
  };
  MGLMapViewDelegateImpl.prototype.mapViewDidFinishLoadingMap = function(mapView) {
    console.log("mapViewDidFinishLoadingMap");
    this._callback(true);
  };
  MGLMapViewDelegateImpl.prototype.mapViewAnnotationCanShowCallout = function(mapView, annotation) {
    console.log("mapViewAnnotationCanShowCallout");
    this._callback(true);
    //return true;
  };
  MGLMapViewDelegateImpl.prototype.mapViewDidSelectAnnotation = function(mapView, annotation) {
    var title = annotation.title;
    var subtitle = annotation.subtitle;
    var coord = annotation.coordinate;
    console.log("Annotation selected: " + title);
    this._callback(true);
  };
  MGLMapViewDelegateImpl.ObjCProtocols = [MGLMapViewDelegate];
  return MGLMapViewDelegateImpl;
})(NSObject);

module.exports = mapbox;