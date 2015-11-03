var observable = require("data/observable");
var mapbox = require("nativescript-mapbox");
var dialogs = require("ui/dialogs");
var DemoAppModel = (function (_super) {
  __extends(DemoAppModel, _super);
  function DemoAppModel() {
    _super.call(this);
  }

  DemoAppModel.prototype.doShow = function () {
    mapbox.show({
      accessToken: 'sk.eyJ1IjoiZWRkeXZlcmJydWdnZW4iLCJhIjoia1JpRW82NCJ9.OgnvpsKzB3GJhzyofQNUBw',
      style: 'emerald',
      margins: {
        left: 40,
        right: 40,
        top: 376,
        bottom: 50
      },
      center: {
        lat: 52.3702160,
        lng: 4.8951680
      },
      zoomLevel: 9, // 0 (most of the worlds) to 20, default 0
      showUserLocation: true, // default false
      hideAttribution: true, // default false
      hideLogo: true, // default false
      hideCompass: false, // default false
      disableRotation: false, // default false
      disableScroll: false, // default false
      disableZoom: false, // default false
      markers: [
        {
          'lat': 52.3732160,
          'lng': 4.8941680,
          'title': 'Nice location',
          'subtitle': 'Really really nice location',
          'image': 'www/img/markers/hi.jpg' // TODO support this on a rainy day
        }
      ]
    }).then(
        function(result) {
          console.log("Mapbox show done");
        },
        function(error) {
          console.log("mapbox show error: " + error);
        }
    )
  };

  DemoAppModel.prototype.doHide = function () {
    mapbox.hide().then(
        function(result) {
          console.log("Mapbox hide done");
        },
        function(error) {
          console.log("mapbox hide error: " + error);
        }
    )
  };

  DemoAppModel.prototype.doAddMarkers = function () {
    mapbox.addMarkers([
      {
        'lat': 52.3602160,
        'lng': 4.8891680,
        'title': 'One-line title here', // no popup unless set
        'subtitle': 'This line can\'t span multiple lines either',
        'image': 'www/img/markers/hi.jpg' // TODO support this on a rainy day
      },
      {
        'lat': 52.3702160,
        'lng': 4.8911680,
        'title': 'One-line title here 2', // no popup unless set
        'subtitle': 'This line can\'t span multiple lines either 2'
      }
    ]).then(
        function(result) {
          console.log("Mapbox addMarkers done");
        },
        function(error) {
          console.log("mapbox addMarkers error: " + error);
        }
    )
  };

  DemoAppModel.prototype.doSetCenter = function () {
    mapbox.setCenter(
        {
          lat: 52.3602160,
          lng: 4.8891680,
          animated: true
        }
    ).then(
        function(result) {
          console.log("Mapbox setCenter done");
        },
        function(error) {
          console.log("mapbox setCenter error: " + error);
        }
    )
  };

  DemoAppModel.prototype.doGetCenter = function () {
    mapbox.getCenter().then(
        function(result) {
          dialogs.alert({
            title: "Center",
            message: JSON.stringify(result),
            okButtonText: "OK"
          })
        },
        function(error) {
          console.log("mapbox getCenter error: " + error);
        }
    )
  };

  DemoAppModel.prototype.doGetZoomLevel = function () {
    mapbox.getZoomLevel().then(
        function(result) {
          dialogs.alert({
            title: "Zoom Level",
            message: JSON.stringify(result),
            okButtonText: "OK"
          })
        },
        function(error) {
          console.log("mapbox getCenter error: " + error);
        }
    )
  };

  DemoAppModel.prototype.doSetZoomLevel = function () {
    mapbox.setZoomLevel(
        {
          level: 6,
          animated: true
        }
    ).then(
        function(result) {
          console.log("Mapbox setZoomLevel done");
        },
        function(error) {
          console.log("mapbox setZoomLevel error: " + error);
        }
    )
  };

  DemoAppModel.prototype.doAddPolygon = function () {
    mapbox.addPolygon({
      points: [
        {
          'lat': 52.3832160,
          'lng': 4.8991680
        },
        {
          'lat': 52.3632160,
          'lng': 4.9011680
        },
        {
          'lat': 52.3932160,
          'lng': 4.8911680
        }
      ]
    }).then(
        function(result) {
          console.log("Mapbox addPolygon done");
        },
        function(error) {
          console.log("mapbox addPolygon error: " + error);
        }
    )
  };

  DemoAppModel.prototype.doCheckHasFineLocationPermission = function () {
    mapbox.hasFineLocationPermission().then(
        function(granted) {
          dialogs.alert({
            title: "Permission granted?",
            message: granted ? "YES" : "NO",
            okButtonText: "OK"
          })
        }
    )
  };

  DemoAppModel.prototype.doRequestFineLocationPermission = function () {
    mapbox.requestFineLocationPermission().then(
        function() {
          console.log("Fine Location permission requested");
        }
    )
  };

  return DemoAppModel;
})(observable.Observable);
exports.DemoAppModel = DemoAppModel;
exports.mainViewModel = new DemoAppModel();
