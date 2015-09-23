var view = require("ui/core/view");
var application = require("application");

var mapbox = require("./mapbox-common");
var context = application.android.context;

mapbox.show = function(arg) {
  return new Promise(function (resolve, reject) {
    try {
      console.log("************************************ In mapbox.show");
      var mapboxKey = "sk.eyJ1IjoiZWRkeXZlcmJydWdnZW4iLCJhIjoia1JpRW82NCJ9.OgnvpsKzB3GJhzyofQNUBw";
      var mapView = new com.mapbox.mapboxgl.views.MapView(context, mapboxKey);
      mapView.onCreate(null);

      //mapView.setStyleUrl("");

      // mapView.setMyLocationEnabled(false);



      // var ann = new com.mapbox.mapboxgl.annotations.MarkerOptions();

      resolve();
    } catch (ex) {
      console.log("Error in mapbox.show: " + ex);
      reject(ex);
    }
  });
};

module.exports = mapbox;