var mapbox = require("./mapbox-common");
var appModule = require("application");
var context = appModule.android.context;

mapbox.show = function(arg) {
  return new Promise(function (resolve, reject) {
    try {
      resolve();
    } catch (ex) {
      console.log("Error in mapbox.scan: " + ex);
      reject(ex);
    }
  });
};

module.exports = mapbox;