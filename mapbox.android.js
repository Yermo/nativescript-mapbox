var utils = require("utils/utils");
var application = require("application");
var frame = require("ui/frame");
var mapbox = require("./mapbox-common");
var context = application.android.context;

mapbox.show = function(arg) {
  return new Promise(function (resolve, reject) {
    try {
      var settings = mapbox.merge(arg, mapbox.defaults);

      // if no accessToken was set the app may crash
      if (settings.accessToken === undefined) {
        reject("Please set the 'accessToken' parameter");
        return;
      }

      mapView = new com.mapbox.mapboxgl.views.MapView(context, settings.accessToken);
      mapView.onResume();
      mapView.onCreate(null);
      mapView.setStyleUrl("asset://styles/" + mapbox.getStyle(settings.style) + "-v8.json");

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
      mapView.setLayoutParams(params);

      if (settings.center) {
        mapView.setCenterCoordinate(new com.mapbox.mapboxgl.geometry.LatLngZoom(settings.center.lat, settings.center.lng, settings.zoomLevel));
      } else {
        mapView.setZoomLevel(settings.zoomLevel);
      }

      mapView.setCompassEnabled(!settings.hideCompass);
      mapView.setRotateEnabled(!settings.disableRotation);
      mapView.setScrollEnabled(!settings.disableScroll);
      mapView.setZoomEnabled(!settings.disableZoom);
      mapView.setMyLocationEnabled(settings.showUserLocation);

      // if we want to hide this, just render it outside the view
      if (settings.hideAttribution) {
        mapView.setAttributionMargins(-300,0,0,0);
      }
      // same can be done for the logo
      if (settings.hideLogo) {
        mapView.setLogoMargins(-300,0,0,0);
      }

      var activity = application.android.foregroundActivity;
      var mapViewLayout = new android.widget.FrameLayout(activity);
      mapViewLayout.addView(mapView);
      topMostFrame.currentPage.android.getParent().addView(mapViewLayout);

      if (settings.markers) {
        for (var m in settings.markers) {
          var marker = settings.markers[m];
          var markerOptions = new com.mapbox.mapboxgl.annotations.MarkerOptions();
          markerOptions.title(marker.title);
          markerOptions.snippet(marker.subtitle);
          markerOptions.position(new com.mapbox.mapboxgl.geometry.LatLng(marker.lat, marker.lng));
          mapView.addMarker(markerOptions);
        }
      }

      resolve();
    } catch (ex) {
      console.log("Error in mapbox.show: " + ex);
      reject(ex);
    }
  });
};

mapbox.hide = function(arg) {
  return new Promise(function (resolve, reject) {
    try {
      var viewGroup = mapView.getParent();
      if (viewGroup != null) {
        viewGroup.removeView(mapView);
      }
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.show: " + ex);
      reject(ex);
    }
  });
};

mapbox.addMarkers = function (markers) {
  return new Promise(function (resolve, reject) {
    try {
      for (var m in markers) {
        var marker = markers[m];
        var markerOptions = new com.mapbox.mapboxgl.annotations.MarkerOptions();
        markerOptions.title(marker.title);
        markerOptions.snippet(marker.subtitle);
        markerOptions.position(new com.mapbox.mapboxgl.geometry.LatLng(marker.lat, marker.lng));
        mapView.addMarker(markerOptions);
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
      mapView.setCenterCoordinate(new com.mapbox.mapboxgl.geometry.LatLng(lat, lng), animated);
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
      var coordinate = mapView.getCenterCoordinate();
      resolve({
        lat: coordinate.getLatitude(),
        lng: coordinate.getLongitude()
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
        mapView.setZoomLevel(level, animated);
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
      var level = mapView.getZoomLevel();
      resolve(level);
    } catch (ex) {
      console.log("Error in mapbox.getZoomLevel: " + ex);
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
      } else {
        var polygonOptions = new com.mapbox.mapboxgl.annotations.PolygonOptions();
        for (var p in points) {
          var point = points[p];
          polygonOptions.add(new com.mapbox.mapboxgl.geometry.LatLng(point.lat, point.lng));
        }
        mapView.addPolygon(polygonOptions);
        resolve();
      }
    } catch (ex) {
      console.log("Error in mapbox.addPolygon: " + ex);
      reject(ex);
    }
  });
};

module.exports = mapbox;