var observable = require("data/observable");
var mapbox = require("nativescript-mapbox");
var HelloWorldModel = (function (_super) {
    __extends(HelloWorldModel, _super);
    function HelloWorldModel() {
        _super.call(this);
    }

    HelloWorldModel.prototype.showMapTapAction = function () {
        mapbox.show({
          style: 'emerald',
          margins: {
            left: 0,
            right: 0,
            top: 320,
            bottom: 0
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

    HelloWorldModel.prototype.hideMapTapAction = function () {
        mapbox.hide().then(
            function(result) {
                console.log("Mapbox hide done");
            },
            function(error) {
                console.log("mapbox hide error: " + error);
            }
        )
    };

    HelloWorldModel.prototype.setCenterTapAction = function () {
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

    HelloWorldModel.prototype.getCenterTapAction = function () {
        mapbox.getCenter().then(
            function(result) {
                console.log("Mapbox getCenter done, result: " + JSON.stringify(result));
            },
            function(error) {
                console.log("mapbox getCenter error: " + error);
            }
        )
    };

    HelloWorldModel.prototype.getZoomLevelTapAction = function () {
        mapbox.getZoomLevel().then(
            function(result) {
                console.log("Mapbox getZoomLevel done, result: " + JSON.stringify(result));
            },
            function(error) {
                console.log("mapbox getZoomLevel error: " + error);
            }
        )
    };

    HelloWorldModel.prototype.setZoomLevelTapAction = function () {
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

    HelloWorldModel.prototype.addMarkersTapAction = function () {
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


    return HelloWorldModel;

})(observable.Observable);
exports.HelloWorldModel = HelloWorldModel;
exports.mainViewModel = new HelloWorldModel();
