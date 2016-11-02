var view = require("ui/core/view");

var mapbox = {};

mapbox.MapStyle = {
  DARK: "dark",
  EMERALD: "emerald",
  HYBRID: "hybrid",
  LIGHT: "light",
  SATELLITE: "satellite",
  STREETS: "streets"
};

mapbox.defaults = {
  style: 'streets',
  margins: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  zoomLevel: 0, // 0 (a big part of the world) to 20 (streetlevel)
  showUserLocation: false, // true requires adding `NSLocationWhenInUseUsageDescription` or `NSLocationAlwaysUsageDescription` in the .plist
  hideLogo: false, // required for the 'starter' plan
  hideAttribution: true,
  hideCompass: false,
  disableRotation: false,
  disableScroll: false,
  disableZoom: false,
  disableTilt: false
};

mapbox.merge = function merge(obj1, obj2){ // Our merge function
  var result = {}; // return result
  for(var i in obj1){      // for every property in obj1
    if((i in obj2) && (typeof obj1[i] === "object") && (i !== null)){
      result[i] = merge(obj1[i],obj2[i]); // if it's an object, merge
    }else{
      result[i] = obj1[i]; // add it to result
    }
  }
  for(i in obj2){ // add the remaining properties from object 2
    if(i in result){ //conflict
      continue;
    }
    result[i] = obj2[i];
  }
  return result;
};

mapbox.requestFineLocationPermission = function () {
  return new Promise(function (resolve) {
    resolve(true);
  });
};

mapbox.hasFineLocationPermission = function () {
  return new Promise(function (resolve) {
    resolve(true);
  });
};

/*************** XML definition START ****************/
var Mapbox = (function (_super) {
  __extends(Mapbox, _super);

  function Mapbox() {
      _super.apply(this, arguments);
  }

  Mapbox.mapReadyEvent = "mapReady";

  Mapbox.prototype.notifyMapReady = function () {
    this.notify({
      eventName: Mapbox.mapReadyEvent,
      map: this,
      native: this.native
    });
  };

  // functions that can be called from the XML map's "mapReady" event
	Mapbox.prototype.addMarkers = function (args) {
    mapbox.addMarkers(args, this.native);
	};

	Mapbox.prototype.removeMarkers = function (args) {
    mapbox.removeMarkers(args, this.native);
	};

	Mapbox.prototype.setCenter = function (args) {
    mapbox.setCenter(args, this.native);
	};

	Mapbox.prototype.setZoomLevel = function (args) {
    mapbox.setZoomLevel(args, this.native);
	};

	Mapbox.prototype.setViewport = function (args) {
    mapbox.setViewport(args, this.native);
	};

	Mapbox.prototype.setTilt = function (args) {
    mapbox.setTilt(args, this.native);
	};

	Mapbox.prototype.animateCamera = function (args) {
    mapbox.animateCamera(args, this.native);
	};

	Mapbox.prototype.addPolygon = function (args) {
    mapbox.addPolygon(args, this.native);
	};

	Mapbox.prototype.addPolyline = function (args) {
    mapbox.addPolyline(args, this.native);
	};

	Mapbox.prototype.removePolylines = function (args) {
    mapbox.removePolylines(args, this.native);
	};

  // properties that can be set from XML
	Object.defineProperty(Mapbox.prototype, "accessToken", {
			set: function (value) {
        this.config.accessToken = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "delay", {
			set: function (value) {
        this.config.delay = parseInt(value) || 0;
			}
	});
	Object.defineProperty(Mapbox.prototype, "mapStyle", {
			set: function (value) {
        this.config.style = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "zoomLevel", {
			set: function (value) {
        this.config.zoomLevel = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "disableZoom", {
			set: function (value) {
        this.config.disableZoom = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "hideAttribution", {
			set: function (value) {
        this.config.hideAttribution = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "latitude", {
			set: function (value) {
        this.config.center = this.config.center || {};
        this.config.center.lat = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "longitude", {
			set: function (value) {
        this.config.center = this.config.center || {};
        this.config.center.lng = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "hideLogo", {
			set: function (value) {
        this.config.hideLogo = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "showUserLocation", {
			set: function (value) {
        this.config.showUserLocation = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "hideCompass", {
			set: function (value) {
        this.config.hideCompass = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "disableRotation", {
			set: function (value) {
        this.config.disableRotation = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "disableScroll", {
			set: function (value) {
        this.config.disableScroll = value;
			}
	});
	Object.defineProperty(Mapbox.prototype, "disableTilt", {
			set: function (value) {
        this.config.disableTilt = value;
			}
	});

  return Mapbox;
}(view.View));
mapbox.Mapbox = Mapbox;
/*************** XML definition END ****************/


module.exports = mapbox;