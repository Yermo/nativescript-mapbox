# NativeScript Maps - by Mapbox

Wait until {N} 1.3.0 is released because now we need to:
- After installation copy ios/Podfile to platforms/ios and from the command prompt run `pod install`
- Then always use the xcworkspace file
- Manually add MGLMapboxAccessToken to .plist (1.3 merges correctly and is likely also to support passing in preferences dynamically)
- Same for NSLocationWhenInUseUsageDescription (=YES)
- Copy in Settings.bundle

Until then we can develop in XCode, but the {N} CLI can't run the project.



TODO all below




## Prerequisites
NativeScript 1.2.3 (`tns --version`) has solved many build issues, so please upgrade if you need to.

## Prerequisites for Android
Check if you have Android-19 installed (required for building the ZXing library), run this from the command prompt:
```
android list targets
```

If it's not listed, run:
```
android
```

.. and install Android 4.2.2 > SDK Platform


## Installation
From the command prompt go to your app's root folder and execute:
```
tns plugin add nativescript-barcodescanner
```

## Usage

### function: scan
```js
  var barcodescanner = require("nativescript-barcodescanner");

  barcodescanner.scan({
    cancelLabel: "Stop scanning", // iOS only, default 'Close'
    message: "Go scan something", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
    preferFrontCamera: false,     // Android only, default false
    showFlipCameraButton: true    // Android only, default false (on iOS it's always available)
  }).then(
      function(result) {
        console.log("Scan format: " + result.format);
        console.log("Scan text:   " + result.text);
      },
      function(error) {
        console.log("No scan: " + error);
      }
  )
```

### function: available
Note that the Android implementation will always return `true` at the moment.
```js
  var barcodescanner = require("nativescript-barcodescanner");

  barcodescanner.available().then(
      function(avail) {
        console.log("Available? " + avail);
      }
  );
```