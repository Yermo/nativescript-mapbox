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
