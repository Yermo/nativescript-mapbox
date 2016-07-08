# NativeScript Mapbox

Awesome native OpenGL-owered maps - by Mapbox

<img src="screenshots/ios-demoapp-slice.png" width="375px" height="196px" />

### Use when
* you want full map styling capability to match the uses of your app (example: downplaying highways for a running app),
* you want a platform independent map implementation,
* you care about performance so you don't want a web based solution,
* you want an open source map implementation that you can tweak yourself,
* you want to leverage Mapbox's backend to visualize massive geo data sets,
* you want advanced analytics about your app's users.

## Prerequisites
NativeScript 1.3.0 (`tns --version`) is required for smooth installation, so please upgrade if you need to.

You need a Mapbox API access token (they have a free Starter plan!), so [sign up with Mapbox](https://www.mapbox.com/signup/).
Once you've registered go to your Account > Apps > New token. The 'Default Secret Token' is what you'll need.

## Installation
From the command prompt go to your app's root folder and execute:
```
tns plugin add nativescript-mapbox
```

If you get an error during iOS build related to Podspec versions, probably the easiest fix is:
`tns platform remove ios` and `tns platform add ios`.

On Android make sure you add this to the `<application>` node of `app/App_Resources/Android/AndroidManifest.xml`:
```xml
  <service android:name="com.mapbox.mapboxsdk.telemetry.TelemetryService" />
```

## Usage

If you want a quickstart, [clone our demo app](https://github.com/EddyVerbruggen/nativescript-mapbox-demo).
And here's the comprehensive list of supported functions:

### show
```js
  var mapbox = require("nativescript-mapbox");

  mapbox.show({
    accessToken: 'YOUR_API_ACCESS_TOKEN', // see 'Prerequisites' above
    style: 'emerald', // light|dark|emerald|satellite|streets , default 'streets' (there is also 'hybrid' for Android)
    margins: {
      left: 40, // default 0
      right: 40, // default 0
      top: 450, // default 0
      bottom: 40 // default 0
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

### function: getCenter
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
