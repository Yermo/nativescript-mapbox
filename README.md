# NativeScript Mapbox

Awesome native OpenGL powered maps - by Mapbox

## Prerequisites
NativeScript 1.3.0 (`tns --version`) is required for smooth installation, so please upgrade if you need to.

## Installation
From the command prompt go to your app's root folder and execute:
```
tns plugin add nativescript-mapbox
```

## Usage

For a quick demo simply copy-paste the contents of the demo folder to your app, but here's the comprehensive list of supported functions:

### function: show
```js
  var mapbox = require("nativescript-mapbox");

  mapbox.show({
    accessToken: 'YOUR_ACCESSTOKEN_HERE',
    style: 'emerald', // light|dark|emerald|satellite|streets , default 'streets'
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
    hideAttribution: true, // a clickable info icon - default true (as it may crash Android when tapped)
    hideLogo: true, // default false - required for the Mapbox 'starter' plan
    hideCompass: false, // default false
    disableRotation: false, // default false
    disableScroll: false, // default false
    disableZoom: false, // default false
    markers: [ // optional without a default
      {
        'lat': 52.3732160, // mandatory
        'lng': 4.8941680, // mandatory
        'title': 'Nice location', // recommended to pass in
        'subtitle': 'Really really nice location' // one line is available on iOS, multiple on Android
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

### function: hide
All further examples assume `mapbox` has been required.
Also, all functions support promises, but we're leaving out the `.then()` stuff for brevity where it doesn't add value.
```js
  mapbox.hide()
```

### function: addMarkers
```js
  mapbox.addMarkers([
    {
      'lat': 52.3602160, // mandatory
      'lng': 4.8891680, // mandatory
      'title': 'One-line title here', // no popup unless set
      'subtitle': 'Infamous subtitle!'
    },
    {
      ..
    }
  ])
```

### function: setCenter
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

### function: setZoomLevel
Here the promise callback makes sense, so adding it to the example:
```js
  mapbox.setZoomLevel(
      {
        level: 6.5, // mandatory, 0-20
        animated: true // default true
      }
  )
```

### function: getZoomLevel
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

### function: addPolygon
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
