var mapbox = require("./mapbox-common");
var page = require("ui/page");

mapbox.mapView = null;

mapbox.addAnnotations = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      var point = MGLPointAnnotation.alloc().init();
      point.coordinate = CLLocationCoordinate2DMake(52.3712160, 4.8941680);
      point.title = "The title";
      point.subtitle = "The subtitle";
      this.mapView.addAnnotation(point);
      resolve("Anno done");
    } catch (ex) {
      console.log("Error in mapbox.addAnnotations: " + ex);
      reject(ex);
    }
  })
};

mapbox.hide = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      this.mapView.removeFromSuperview();
      resolve("Done");
    } catch (ex) {
      console.log("Error in mapbox.hide: " + ex);
      reject(ex);
    }
  });
};

mapbox.show = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      //   _mapView = [[MGLMapView alloc] initWithFrame:mapFrame styleURL:[NSURL URLWithString:@"asset://styles/mapbox-streets-v7.json"]];

      var bounds = UIScreen.mainScreen().bounds;

      // TODO pass in position in JS API
      var left = 0;
      var right = 0;
      var top = 320;
      var bottom = 0;

      var view = UIApplication.sharedApplication().keyWindow.rootViewController.view;
      var frameRect = view.frame;

      var mapFrame = CGRectMake(left, top, frameRect.size.width - left - right, frameRect.size.height - top - bottom);
//      var style = "asset://styles/mapbox-streets-v7.json";

      //var mapView = MGLMapView.alloc().initWithFrameStyleURL(mapFrame, style);
      this.mapView = MGLMapView.alloc().initWithFrame(mapFrame);

      // TODO not sure this works as planned.. better to listen for rotate events ([..didrotate..] and fix the frame
      this.mapView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

      //mapView.autoresizingMask = UIViewAutoresizingFlexibleWidth;

      // TODO pass in lat, lng, zoom
      var centerCoordinate = CLLocationCoordinate2DMake(52.3702160, 4.8951680);
      var zoomLevel = 13;
      this.mapView.setCenterCoordinateZoomLevelAnimated(centerCoordinate, zoomLevel, false);

      this.mapView.showsUserLocation = true;

      // TODO pass in, default false
      this.mapView.attributionButton.hidden = true;

      // TODO pass in, default YES - required for the 'starter' plan
      this.mapView.logoView.hidden = true;

      // TODO pass in, default false
      this.mapView.compassView.hidden = true;

      // TODO pass in, default true
      this.mapView.rotateEnabled = true;

      // TODO pass in, default true
      this.mapView.scrollEnabled = true;

      // TODO pass in, default true
      this.mapView.zoomEnabled = true;




      ////////////// TODO check dit: https://github.com/NativeScript/NativeScript/issues/432


      // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
      var delegate = MGLMapViewDelegateImpl.new().initWithCallback(function (loaded) {
        // TODO don't use resolve here as we already did.. can we use a custom callback handler? Or don't we need this neway?
        // Remove the local variable for the delegate.
//        delegate = undefined;
      });
      this.mapView.delegate = delegate;

      view.addSubview(mapView);

      resolve("Done");
    } catch (ex) {
      console.log("Error in mapbox.show: " + ex);
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