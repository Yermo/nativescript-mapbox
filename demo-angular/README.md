# Angular Mapbox Demo

This is loosely based on the drawer-navigation-ng NativeScript Angular template.

To run this demo you must first build the plugin.

```
cd ../src
npm run build.dist
```

then you can run the demo on a connected device or emulator

```
tns run android
```
-or-
```
tns run ios
```

# Tests

```
npm run e2e -- --runType android28
```

where android28 is one of the images listed in the e2e config.

# The Long Standing Android Navigation Crash : TEMPORARY workaround for tns-core-modules 6.1.12

There is a nasty intermittent crash when navigating away from pages that house maps when using
markingMode:none.

https://github.com/NativeScript/NativeScript/issues/7954
https://github.com/NativeScript/NativeScript/issues/7867

This /seems/ to resolve the issue but probably with some serious downsides:

tns-core-modules/ui/styling/background.android.js

change line 76 from:

```
defaultDrawable = cachedDrawable.newDrawable(nativeView.getResources());
```
to 
```
defaultDrawable = null;
```

