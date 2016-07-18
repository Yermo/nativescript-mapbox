# NativeScript Mapbox

Awesome native OpenGL-powered maps - by Mapbox

<img src="screenshots/ios-demoapp-slice.png" width="375px" height="196px" />

### Use when
* you want full map styling capability to match the uses of your app (example: downplaying highways for a running app),
* you want a platform independent map implementation,
* you care about performance so you don't want a web based solution,
* you want an open source map implementation that you can tweak yourself,
* you want to leverage Mapbox's backend to visualize massive geo data sets,
* you want advanced analytics about your app's users,
* __NEW:__ You need offline maps and custom markers.

## Prerequisites
You need a Mapbox API access token (they have a free Starter plan!), so [sign up with Mapbox](https://www.mapbox.com/signup/).
Once you've registered go to your Account > Apps > New token. The 'Default Secret Token' is what you'll need.

## Installation
From the command prompt go to your app's root folder and execute:
```
tns plugin add nativescript-mapbox
```

If you get an error during iOS build related to Podspec versions, probably the easiest fix is:
`tns platform remove ios` and `tns platform add ios`.

On Android make sure you add this to the `<application>` node of `app/App_Resources/Android/AndroidManifest.xml` (the plugin already attempts to do so):

```xml
  <service android:name="com.mapbox.mapboxsdk.telemetry.TelemetryService" />
```

## Basic usage

If you want a quickstart, [clone our demo app](https://github.com/EddyVerbruggen/nativescript-mapbox-demo).
And here's the comprehensive list of supported functions:

### show
```js
  var mapbox = require("nativescript-mapbox");
  var platform = require("platform");
  var isIOS = platform.device.os === platform.platformNames.ios;

  mapbox.show({
    accessToken: 'YOUR_API_ACCESS_TOKEN', // see 'Prerequisites' above
    style: mapbox.MapStyle.DARK, // see the mapbox.MapStyle enum for other options, default mapbox.MapStyle.STREETS
    margins: {
      left: 40, // default 0
      right: 40, // default 0
      top: 450, // default 0
      bottom: isIOS ? 50: 0 // default 0, this shows how to override the style for iOS
    },
    center: { // optional without a default
      lat: 52.3702160,
      lng: 4.8951680
    },
    zoomLevel: 9.25, // 0-20, default 0
    showUserLocation: true, // default false - requires location permissions on Android which you can remove from AndroidManifest.xml if you don't need them
    hideAttribution: false, // default false, Mapbox requires this default if you're on a free plan
    hideLogo: false, // default false, Mapbox requires this default if you're on a free plan
    hideCompass: false, // default false
    disableRotation: false, // default false
    disableScroll: false, // default false
    disableZoom: false, // default false
    markers: [ // optional without a default
      {
        lat: 52.3732160, // mandatory
        lng: 4.8941680, // mandatory
        title: 'Nice location', // recommended to pass in
        subtitle: 'Really really nice location', // one line is available on iOS, multiple on Android
        iconPath: 'res/markers/green_pin_marker.png', // anywhere in your app folder
        onTap: function(marker) { console.log("This marker was tapped"); },
        onCalloutTap: function(marker) { console.log("The callout of this marker was tapped"); }
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
```

### hide
All further examples assume `mapbox` has been required.
Also, all functions support promises, but we're leaving out the `.then()` stuff for brevity where it doesn't add value.
```js
  mapbox.hide()
```

### addMarkers
```js
  var onTap = function(marker) {
    console.log("Marker tapped with title: '" + marker.title + "'");
  };
  var onCalloutTap = function(marker) {
    alert("Marker callout tapped with title: '" + marker.title + "'");
  };

  mapbox.addMarkers([
    {
      lat: 52.3602160, // mandatory
      lng: 4.8891680, // mandatory
      title: 'One-line title here', // no popup unless set
      subtitle: 'Infamous subtitle!',
      iconPath: 'res/markers/home_marker.png',
      onTap: onTap,
      onCalloutTap: onCalloutTap
    },
    {
      ..
    }
  ])
```

### setCenter
```js
  mapbox.setCenter(
      {
        lat: 52.3602160, // mandatory
        lng: 4.8891680, // mandatory
        animated: false // default true
      }
  )
```

### getCenter
Here the promise callback makes sense, so adding it to the example:
```js
  mapbox.getCenter().then(
      function(result) {
        console.log("Mapbox getCenter done, result: " + JSON.stringify(result));
      },
      function(error) {
        console.log("mapbox getCenter error: " + error);
      }
  )
```

### setZoomLevel
```js
  mapbox.setZoomLevel(
      {
        level: 6.5, // mandatory, 0-20
        animated: true // default true
      }
  )
```

### getZoomLevel
```js
  mapbox.getZoomLevel().then(
      function(result) {
        console.log("Mapbox getZoomLevel done, result: " + JSON.stringify(result));
      },
      function(error) {
        console.log("mapbox getZoomLevel error: " + error);
      }
  )
```

### animateCamera

```js
  // this is a boring triangle drawn near Amsterdam Central Station
  mapbox.animateCamera({
    // this is where we animate to
    target: {
        lat: 52.3732160,
        lng: 4.8941680,
    },
    zoomLevel: 17, // Android
    altitude: 2000, // iOS (meters from the ground)
    bearing: 270, // Where the camera is pointing, 0-360 (degrees)
    tilt: 50,
    duration: 10000 // in milliseconds
  })
```

### setTilt (Android)
```js
  mapbox.setTilt(
      {
        tilt: 40, // default 30 (degrees angle)
        duration: 4000 // default 5000 (milliseconds)
      }
  )
```

### getTilt (Android)
```js
  mapbox.getTilt().then(
      function(tilt) {
        console.log("Current map tilt: " +  tilt);
      }
  )
```

### addPolygon (Android)
Draw a shape (like a line/route, or star). Just connect the dots like we did as a child. The first person to tweet a snowman drawn with this function gets a T-shirt.
```js
  // this is a boring triangle drawn near Amsterdam Central Station
  mapbox.addPolygon({
    points: [
      {
        'lat': 52.3832160, // mandatory
        'lng': 4.8991680 // mandatory
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
  })
```

### addPolyline (Android)
Draw a polyline. Connect the points given as parameters.
```js
  // Draw a two segment line near Amsterdam Central Station
  mapbox.addPolyline({
      color: 0xff29a025, //Set the color of the line (default black)
      width: 7, //Set the width of the line (default 5)
      points: [
          {
              'lat': 52.3833160, // mandatory
              'lng': 4.8991780 // mandatory
          },
          {
              'lat': 52.3834160,
              'lng': 4.8991880
          },
          {
              'lat': 52.3835160,
              'lng': 4.8991980
          }
      ]
  });
```

## Offline maps
For situation where you want the user to pre-load certain regions you can use these methods to create and remove offline regions.

__Important read:__ [the offline maps documentation by Mapbox](https://www.mapbox.com/help/mobile-offline/).

### downloadOfflineRegion
This example downloads the region 'Amsterdam' on zoom levels 9, 10 and 11 for map style 'outdoors'.

```js
  mapbox.downloadOfflineRegion(
    {      
      accessToken: accessToken, // required for Android in case no map has been shown yet
      name: "Amsterdam", // this name can be used to delete the region later
      style: mapbox.MapStyle.OUTDOORS,
      minZoom: 9,
      maxZoom: 11,
      bounds: {
        north: 52.4820,
        east: 5.1087,
        south: 52.2581,
        west: 4.6816
      },
      // this function is called many times during a download, so
      // use it to show an awesome progress bar!
      onProgress: function (progress) {
        console.log("Download progress: " + JSON.stringify(progress));
      }
    }
  ).then(
    function() {
      console.log("Offline region downloaded");
    },
    function(error) {
      console.log("Download error: " + error);
    }
  );
```

#### Advanced example: download the current viewport
Grab the viewport with the `mapbox.getViewport()` function and download it at various zoom levels:

```js
  // I spare you the error handling on this one..
  mapbox.getViewport().then(function(viewport) {
    mapbox.downloadOfflineRegion(
      {
        name: "LastViewport", // anything you like really
        style: mapbox.MapStyle.OUTDOORS,
        minZoom: viewport.zoomLevel,
        maxZoom: viewport.zoomLevel + 2, // higher zoom level is lower to the ground
        bounds: viewport.bounds,
        onProgress: function (progress) {
          console.log("Download %: " + progress.percentage);
        }
      }
    );
  });
```

### listOfflineRegions
To help you manage offline regions there's a `listOfflineRegions` function you can use. You can then fi. call `deleteOfflineRegion` (see below) and pass in the `name` to remove any cached region(s) you like.

```js
  mapbox.listOfflineRegions({
    // required for Android in case no map has been shown yet
    accessToken: accessToken,
  }).then(
    function(regions) {
      console.log(JSON.stringify(JSON.stringify(regions));
    },
    function(error) {
      console.log("Error while listing offline regions: " + error);
    }
  );

```

### deleteOfflineRegion
You can remove regions you've previously downloaded. Any region(s) matching the `name` param will be removed locally.

```js
  mapbox.deleteOfflineRegion({
    name: "Amsterdam"
  }).then(
    function() {
      console.log("Offline region deleted");
    },
    function(error) {
      console.log("Error while deleting an offline region: " + error);
    }
  );
```


## Permissions

### hasFineLocationPermission / requestFineLocationPermission
On Android 6 you need to request permission to be able to show the user's position on the map at runtime when targeting API level 23+.
Even if the `uses-permission` tag for `ACCESS_FINE_LOCATION` is present in `AndroidManifest.xml`.

Note that `hasFineLocationPermission` will return true when:
* You're running this on iOS, or
* You're targeting an API level lower than 23, or
* You're using Android < 6, or
* You've already granted permission.

```js
  mapbox.hasFineLocationPermission().then(
      function(granted) {
        // if this is 'false' you probably want to call 'requestFineLocationPermission' now
        console.log("Has Location Permission? " + granted);
      }
  );

  // if no permission was granted previously this will open a user consent screen
  mapbox.requestFineLocationPermission().then(
      function() {
        console.log("Location permission requested");
      }
  );
```

Note that the `show` function will also check for permission if you passed in `showUserLocation : true`.
If you didn't request permission before showing the map, and permission was needed, then
the location is not drawn on the map and the plugin will log an error to the console.
