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

mapbox.mapView = null;

module.exports = mapbox;