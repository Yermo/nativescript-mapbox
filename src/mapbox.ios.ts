/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
/// <reference path="./platforms/ios/Mapbox.d.ts" />

import * as fs from "tns-core-modules/file-system";
import * as imgSrc from "tns-core-modules/image-source";
import * as utils from "tns-core-modules/utils/utils";
import * as http from "tns-core-modules/http";
import { Color } from "tns-core-modules/color";

import {
  AddExtrusionOptions,
  AddGeoJsonClusteredOptions,
  AddLayerOptions,
  AddPolygonOptions,
  AddPolylineOptions,
  AddSourceOptions,
  AnimateCameraOptions,
  DeleteOfflineRegionOptions,
  DownloadOfflineRegionOptions,
  Feature,
  LatLng,
  ListOfflineRegionsOptions,
  MapboxApi,
  MapboxCommon,
  MapboxMarker,
  MapboxViewBase,
  MapStyle,
  OfflineRegion,
  QueryRenderedFeaturesOptions,
  SetCenterOptions,
  SetTiltOptions,
  SetViewportOptions,
  SetZoomLevelOptions,
  ShowOptions,
  TrackUserOptions,
  UserLocation,
  UserTrackingMode,
  Viewport
} from "./mapbox.common";

// Export the enums for devs not using TS
export { MapStyle };

let _markers = [];
let _markerIconDownloadCache = [];
let _mapView: MGLMapView;
let _mapbox: any = {};
let _delegate: any;

const _setMapboxMapOptions = (mapView: MGLMapView, settings) => {
  mapView.logoView.hidden = settings.hideLogo;
  mapView.attributionButton.hidden = settings.hideAttribution;
  mapView.compassView.hidden = settings.hideCompass;
  mapView.rotateEnabled = !settings.disableRotation;
  mapView.scrollEnabled = !settings.disableScroll;
  mapView.zoomEnabled = !settings.disableZoom;
  mapView.allowsTilting = !settings.disableTilt;
  // mapView.showsScale = settings.showScale; // TODO, default false
  // mapView.showsHeading = true;
  // mapView.showsUserHeadingIndicator = true;

  if (settings.center && settings.center.lat && settings.center.lng) {
    let centerCoordinate = CLLocationCoordinate2DMake(settings.center.lat, settings.center.lng);
    mapView.setCenterCoordinateZoomLevelAnimated(centerCoordinate, settings.zoomLevel, false);
  } else {
    mapView.setZoomLevelAnimated(settings.zoomLevel, false);
  }

  mapView.showsUserLocation = settings.showUserLocation;

  mapView.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
};

const _getMapStyle = (input: any): NSURL => {
  if (/^mapbox:\/\/styles/.test(input) || /^http:\/\//.test(input) || /^https:\/\//.test(input)) {
    return NSURL.URLWithString(input);
  } else if (/^~\//.test(input)) {
    const assetPath = 'file://' + fs.knownFolders.currentApp().path + '/';
    input = input.replace(/^~\//, assetPath);
    return NSURL.URLWithString(input);
  } else if (input === MapStyle.LIGHT || input === MapStyle.LIGHT.toString()) {
    return MGLStyle.lightStyleURL;
  } else if (input === MapStyle.DARK || input === MapStyle.DARK.toString()) {
    return MGLStyle.darkStyleURL;
  } else if (input === MapStyle.OUTDOORS || input === MapStyle.OUTDOORS.toString()) {
    return MGLStyle.outdoorsStyleURL;
  } else if (input === MapStyle.SATELLITE || input === MapStyle.SATELLITE.toString()) {
    return MGLStyle.satelliteStyleURL;
  } else if (input === MapStyle.SATELLITE_STREETS || input === MapStyle.SATELLITE_STREETS.toString()) {
    return MGLStyle.satelliteStreetsStyleURL;
  } else if (input === MapStyle.TRAFFIC_DAY || input === MapStyle.TRAFFIC_DAY.toString()) {
    return NSURL.URLWithString("mapbox://styles/mapbox/traffic-day-v2");
  } else if (input === MapStyle.TRAFFIC_NIGHT || input === MapStyle.TRAFFIC_NIGHT.toString()) {
    return NSURL.URLWithString("mapbox://styles/mapbox/traffic-night-v2");
  } else {
    return MGLStyle.streetsStyleURL;
  }
};

const _getTrackingMode = (input: UserTrackingMode): MGLUserTrackingMode => {
  if (input === "FOLLOW") {
    return MGLUserTrackingMode.Follow;
  } else if (input === "FOLLOW_WITH_HEADING") {
    return MGLUserTrackingMode.FollowWithHeading;
  } else if (input === "FOLLOW_WITH_COURSE") {
    return MGLUserTrackingMode.FollowWithCourse;
  } else {
    return MGLUserTrackingMode.None;
  }
};

/*************** XML definition START ****************/
export class MapboxView extends MapboxViewBase {

  private mapView: MGLMapView;
  private delegate: MGLMapViewDelegate;

  getNativeMapView(): any {
    return this.mapView;
  }

  public createNativeView(): Object {
    let v = super.createNativeView();
    setTimeout(() => {
      this.initMap();
    }, 0);
    return v;
  }

  initMap(): void {
    if (!this.mapView && this.config.accessToken) {
      this.mapbox = new Mapbox();
      let settings = Mapbox.merge(this.config, Mapbox.defaults);
      let drawMap = () => {
        MGLAccountManager.accessToken = settings.accessToken;
        this.mapView = MGLMapView.alloc().initWithFrameStyleURL(CGRectMake(0, 0, this.nativeView.frame.size.width, this.nativeView.frame.size.height), _getMapStyle(settings.style));
        this.mapView.delegate = this.delegate = MGLMapViewDelegateImpl.new().initWithCallback(() => {
          this.notify({
            eventName: MapboxViewBase.mapReadyEvent,
            object: this,
            map: this,
            ios: this.mapView
          });
          // no permission required, but to align with Android we fire the event anyway
          this.notify({
            eventName: MapboxViewBase.locationPermissionGrantedEvent,
            object: this,
            map: this,
            ios: this.mapView
          });
        });
        _setMapboxMapOptions(this.mapView, settings);
        _markers = [];
        this.nativeView.addSubview(this.mapView);
      };
      setTimeout(drawMap, settings.delay ? settings.delay : 0);
    }
  }

  public onLayout(left: number, top: number, right: number, bottom: number): void {
    super.onLayout(left, top, right, bottom);
    if (this.mapView) {
      this.mapView.layer.frame = this.ios.layer.bounds;
    }
  }
}

/*************** XML definition END ****************/

export class Mapbox extends MapboxCommon implements MapboxApi {
  show(options: ShowOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const settings: ShowOptions = Mapbox.merge(options, Mapbox.defaults);

        // let directions = MBDirections.alloc().initWithAccessToken(arg.accessToken);
        // alert("directions: " + directions);

        // if no accessToken was set the app may crash
        if (settings.accessToken === undefined) {
          reject("Please set the 'accessToken' parameter");
          return;
        }

        // if already added, make sure it's removed first
        if (_mapView) {
          _mapView.removeFromSuperview();
        }

        const view = utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController.view,
            frameRect = view.frame,
            mapFrame = CGRectMake(
                settings.margins.left,
                settings.margins.top,
                frameRect.size.width - settings.margins.left - settings.margins.right,
                frameRect.size.height - settings.margins.top - settings.margins.bottom
            ),
            styleURL = _getMapStyle(settings.style);

        MGLAccountManager.accessToken = settings.accessToken;
        _mapbox.mapView = MGLMapView.alloc().initWithFrameStyleURL(mapFrame, styleURL);
        _setMapboxMapOptions(_mapbox.mapView, settings);

        _mapbox.mapView.delegate = _delegate = MGLMapViewDelegateImpl.new().initWithCallback(
            (mapView: MGLMapView) => {
              resolve({
                ios: mapView
              });
            }
        );

        _markers = [];
        _addMarkers(settings.markers);

        // wrapping in a little timeout since the map area tends to flash black a bit initially
        setTimeout(() => {
          view.addSubview(_mapbox.mapView);
        }, 500);

      } catch (ex) {
        console.log("Error in mapbox.show: " + ex);
        reject(ex);
      }
    });
  }

  hide(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (_mapbox.mapView) {
          _mapbox.mapView.removeFromSuperview();
        }
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.hide: " + ex);
        reject(ex);
      }
    });
  }

  unhide(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (_mapbox.mapView) {
          let view = utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController.view;
          view.addSubview(_mapbox.mapView);
          resolve();
        } else {
          reject("No map found");
        }
      } catch (ex) {
        console.log("Error in mapbox.unhide: " + ex);
        reject(ex);
      }
    });
  }

  destroy(nativeMap?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const theMap: MGLMapView = nativeMap || _mapbox.mapView;
      if (theMap) {
        theMap.removeFromSuperview();
        theMap.delegate = null;
        _mapbox = {};
      }
      resolve();
    });
  }

  // ----------------------------------------

  /**
  * explicitly set a map style
  */

  setMapStyle(style: string | MapStyle, nativeMap?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap: MGLMapView = nativeMap || _mapbox.mapView;

        // the style may take some time to load, so we have to set a callback to wait for the style to finish loading
        (<MGLMapViewDelegateImpl>theMap.delegate).setStyleLoadedCallback(() => {
          resolve();
        });

        theMap.styleURL = _getMapStyle(style);

      } catch (ex) {
        console.log("Error in mapbox.setMapStyle: " + ex);
        reject(ex);
      }
    });
  }

  // --------------------------------------------

  addMarkers(markers: MapboxMarker[], nativeMap?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap: MGLMapView = nativeMap || _mapbox.mapView;
        _addMarkers(markers, theMap);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.addMarkers: " + ex);
        reject(ex);
      }
    });
  }

  removeMarkers(ids?: any, nativeMap?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap = nativeMap || _mapbox.mapView;
        let markersToRemove: Array<MGLAnnotation> = [];
        _markers.forEach(marker => {
          if (!ids || (marker.id && ids.indexOf(marker.id) > -1)) {
            markersToRemove.push(marker.ios);
          }
        });

        // remove markers from cache
        if (ids) {
          _markers = _markers.filter(marker => ids.indexOf(marker.id) < 0);
        } else {
          _markers = [];
        }

        if (markersToRemove.length > 0) {
          theMap.removeAnnotations(markersToRemove);
        }
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.removeMarkers: " + ex);
        reject(ex);
      }
    });
  }

  setCenter(options: SetCenterOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;
        let animated = options.animated === undefined || options.animated;
        let coordinate = CLLocationCoordinate2DMake(options.lat, options.lng);
        theMap.setCenterCoordinateAnimated(coordinate, animated);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setCenter: " + ex);
        reject(ex);
      }
    });
  }

  getCenter(nativeMap?): Promise<LatLng> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;
        let coordinate = theMap.centerCoordinate;
        resolve({
          lat: coordinate.latitude,
          lng: coordinate.longitude
        });
      } catch (ex) {
        console.log("Error in mapbox.getCenter: " + ex);
        reject(ex);
      }
    });
  }

  setZoomLevel(options: SetZoomLevelOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;
        let animated = options.animated === undefined || options.animated;
        let level = options.level;
        if (level >= 0 && level <= 20) {
          theMap.setZoomLevelAnimated(level, animated);
          resolve();
        } else {
          reject("invalid ZoomLevel, use any double value from 0 to 20 (like 8.3)");
        }
      } catch (ex) {
        console.log("Error in mapbox.setZoomLevel: " + ex);
        reject(ex);
      }
    });
  }

  getZoomLevel(nativeMap?): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;
        resolve(theMap.zoomLevel);
      } catch (ex) {
        console.log("Error in mapbox.getZoomLevel: " + ex);
        reject(ex);
      }
    });
  }

  setTilt(options: SetTiltOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        let cam = theMap.camera;

        cam.pitch = options.tilt;

        const durationMs = options.duration ? options.duration : 5000;

        theMap.setCameraWithDurationAnimationTimingFunction(
            cam,
            durationMs / 1000,
            CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut));

        setTimeout(() => {
          resolve();
        }, durationMs);
      } catch (ex) {
        console.log("Error in mapbox.setTilt: " + ex);
        reject(ex);
      }
    });
  }

  getTilt(nativeMap?): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;
        resolve(theMap.camera.pitch);
      } catch (ex) {
        console.log("Error in mapbox.getTilt: " + ex);
        reject(ex);
      }
    });
  }

  getUserLocation(nativeMap?): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;
        const loc: MGLUserLocation = theMap.userLocation;
        if (loc === null) {
          reject("Location not available");
        } else {
          resolve({
            location: {
              lat: loc.coordinate.latitude,
              lng: loc.coordinate.longitude
            },
            speed: loc.location ? loc.location.speed : 0
          });
        }
      } catch (ex) {
        console.log("Error in mapbox.getUserLocation: " + ex);
        reject(ex);
      }
    });
  }

  queryRenderedFeatures(options: QueryRenderedFeaturesOptions, nativeMap?): Promise<Array<Feature>> {
    return new Promise((resolve, reject) => {
      try {
        const theMap: MGLMapView = nativeMap || _mapbox.mapView;
        const point = options.point;
        if (point === undefined) {
          reject("Please set the 'point' parameter");
          return;
        }

        const {x, y} = theMap.convertCoordinateToPointToView({latitude: point.lat, longitude: point.lng}, theMap);
        const features = theMap.visibleFeaturesAtPoint({x, y});

        const result = [];
        for (let i = 0; i < features.count; i++) {
          const feature: MGLFeature = features.objectAtIndex(i);
          const properties = [];

          if (feature.attributes && feature.attributes.count > 0) {
            const keys = utils.ios.collections.nsArrayToJSArray(
              feature.attributes.allKeys);

            for (let key of keys) {
              properties.push({
                key,
                value: feature.attributes.valueForKey(key),
              });
            }
          }

          result.push({
            id: feature.identifier,
            properties,
          });
        }

        resolve(result);
      } catch (ex) {
        console.log("Error in mapbox.queryRenderedFeatures: " + ex);
        reject(ex);
      }
    });
  }

  addPolygon(options: AddPolygonOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      const theMap = nativeMap || _mapbox.mapView;
      const points = options.points;

      if (points === undefined) {
        reject("Please set the 'points' parameter");
        return;
      }

      const coordinateArray = [];
      points.forEach(point => coordinateArray.push([point.lng, point.lat]));

      const polygonID = `polygon_${
        options.id || new Date().getTime()}`;

      if (theMap.style.sourceWithIdentifier(polygonID)) {
        reject("Remove the polygon with this id first with 'removePolygons': " + polygonID);
        return;
      }

      const geoJSON = `{
        "type": "FeatureCollection",
        "features": [
          {
            "id": ${JSON.stringify(polygonID)},
            "type": "Feature",
            "properties": {
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [${JSON.stringify(coordinateArray)}]
            }
          }
        ]
      }`;
      const geoDataStr = NSString.stringWithString(geoJSON);
      const geoData = geoDataStr.dataUsingEncoding(NSUTF8StringEncoding);
      const geoDataBase64Enc = geoData.base64EncodedStringWithOptions(0);
      const geo = NSData.alloc().initWithBase64EncodedStringOptions(geoDataBase64Enc, null);
      const shape = MGLShape.shapeWithDataEncodingError(geo, NSUTF8StringEncoding);
      const source = MGLShapeSource.alloc().initWithIdentifierShapeOptions(polygonID, shape, null);

      theMap.style.addSource(source);

      if (options.strokeColor || options.strokeWidth || options.strokeOpacity) {
        const strokeLayer = MGLLineStyleLayer.alloc().initWithIdentifierSource(polygonID + "_stroke", source);
        strokeLayer.lineColor = NSExpression.expressionForConstantValue(!options.strokeColor ? UIColor.blackColor : (options.strokeColor instanceof Color ? options.strokeColor.ios : new Color(options.strokeColor).ios));
        strokeLayer.lineWidth = NSExpression.expressionForConstantValue(options.strokeWidth || 5);
        strokeLayer.lineOpacity = NSExpression.expressionForConstantValue(options.strokeOpacity === undefined ? 1 : options.strokeOpacity);
        theMap.style.addLayer(strokeLayer);
      }

      const layer = MGLFillStyleLayer
        .alloc()
        .initWithIdentifierSource(polygonID, source);
      layer.fillColor = NSExpression.expressionForConstantValue(!options.fillColor ? UIColor.blackColor : (options.fillColor instanceof Color ? options.fillColor.ios : new Color(options.fillColor).ios));
      layer.fillOpacity = NSExpression.expressionForConstantValue(options.fillOpacity === undefined ? 1 : options.fillOpacity);

      if (options.above && theMap.style.layerWithIdentifier(options.above)) {
        theMap.style.insertLayerAboveLayer(layer, theMap.style.layerWithIdentifier(options.above));
      } else if (options.below && theMap.style.layerWithIdentifier(options.below)) {
        theMap.style.insertLayerBelowLayer(layer, theMap.style.layerWithIdentifier(options.below));
      } else {
        theMap.style.addLayer(layer);
      }

      resolve();
    });
  }

  addPolyline(options: AddPolylineOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      const theMap: MGLMapView = nativeMap || _mapbox.mapView;
      const points = options.points;
      if (points === undefined) {
        reject("Please set the 'points' parameter");
        return;
      }

      const coordinateArray = [];
      points.forEach(point => coordinateArray.push([point.lng, point.lat]));

      const polylineID = "polyline_" + (options.id || new Date().getTime());

      // this would otherwise crash the app
      if (theMap.style.sourceWithIdentifier(polylineID)) {
        reject("Remove the polyline with this id first with 'removePolylines': " + polylineID);
        return;
      }

      const geoJSON = `{"type": "FeatureCollection", "features": [{"type": "Feature","properties": {},"geometry": {"type": "LineString", "coordinates": ${JSON.stringify(coordinateArray)}}}]}`;
      const geoDataStr = NSString.stringWithString(geoJSON);
      const geoData = geoDataStr.dataUsingEncoding(NSUTF8StringEncoding);
      const geoDataBase64Enc = geoData.base64EncodedStringWithOptions(0);

      const geo = NSData.alloc().initWithBase64EncodedStringOptions(geoDataBase64Enc, null);
      const shape = MGLShape.shapeWithDataEncodingError(geo, NSUTF8StringEncoding);
      const source = MGLShapeSource.alloc().initWithIdentifierShapeOptions(polylineID, shape, null);
      theMap.style.addSource(source);

      const layer = MGLLineStyleLayer.alloc().initWithIdentifierSource(polylineID, source);
      layer.lineColor = NSExpression.expressionForConstantValue(!options.color ? UIColor.blackColor : (options.color instanceof Color ? options.color.ios : new Color(options.color).ios));
      layer.lineWidth = NSExpression.expressionForConstantValue(options.width || 5);
      layer.lineOpacity = NSExpression.expressionForConstantValue(options.opacity === undefined ? 1 : options.opacity);

      if (options.above && theMap.style.layerWithIdentifier(options.above)) {
        theMap.style.insertLayerAboveLayer(layer, theMap.style.layerWithIdentifier(options.above));
      } else if (options.below && theMap.style.layerWithIdentifier(options.below)) {
        theMap.style.insertLayerBelowLayer(layer, theMap.style.layerWithIdentifier(options.below));
      } else {
        theMap.style.addLayer(layer);
      }
      resolve();
    });
  }

  private removePolyById(theMap: MGLMapView, id: string): void {
    let layer = theMap.style.layerWithIdentifier(id);
    if (layer !== null) {
      theMap.style.removeLayer(layer);
    }
    // polygons may have a 'stroke' layer
    layer = theMap.style.layerWithIdentifier(id + "_stroke");
    if (layer !== null) {
      theMap.style.removeLayer(layer);
    }
    const source = theMap.style.sourceWithIdentifier(id);
    if (source !== null) {
      theMap.style.removeSource(source);
    }
  }

  private removePolys(polyType: string, ids?: Array<any>, nativeMap?: any): Promise<any> {
    return new Promise((resolve) => {
      let theMap: MGLMapView = nativeMap || _mapbox.mapView;
      ids.forEach(id => this.removePolyById(theMap, polyType + id));
      resolve();
    });
  }

  removePolygons(ids?: Array<any>, nativeMap?: any): Promise<any> {
    return this.removePolys("polygon_", ids, nativeMap);
  }

  removePolylines(ids?: Array<any>, nativeMap?: any): Promise<any> {
    return this.removePolys("polyline_", ids, nativeMap);
  }

  animateCamera(options: AnimateCameraOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        let target = options.target;
        if (target === undefined) {
          reject("Please set the 'target' parameter");
          return;
        }

        let cam = theMap.camera;

        cam.centerCoordinate = CLLocationCoordinate2DMake(target.lat, target.lng);

        if (options.altitude) {
          cam.altitude = options.altitude;
        }

        if (options.bearing) {
          cam.heading = options.bearing;
        }

        if (options.tilt) {
          cam.pitch = options.tilt;
        }

        let durationMs = options.duration ? options.duration : 10000;

        theMap.setCameraWithDurationAnimationTimingFunction(
            cam,
            durationMs / 1000,
            CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut));

        setTimeout(() => {
          resolve();
        }, durationMs);
      } catch (ex) {
        console.log("Error in mapbox.animateCamera: " + ex);
        reject(ex);
      }
    });
  }

  setOnMapClickListener(listener: (data: LatLng) => void, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        // adding the tap handler to the map object so it's not garbage collected.
        theMap['mapTapHandler'] = MapTapHandlerImpl.initWithOwnerAndListenerForMap(new WeakRef(this), listener, theMap);
        const tapGestureRecognizer = UITapGestureRecognizer.alloc().initWithTargetAction(theMap['mapTapHandler'], "tap");

        // cancel the default tap handler
        for (let i = 0; i < theMap.gestureRecognizers.count; i++) {
          let recognizer: UIGestureRecognizer = theMap.gestureRecognizers.objectAtIndex(i);
          if (recognizer instanceof UITapGestureRecognizer) {
            tapGestureRecognizer.requireGestureRecognizerToFail(recognizer);
          }
        }

        theMap.addGestureRecognizer(tapGestureRecognizer);

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnMapClickListener: " + ex);
        reject(ex);
      }
    });
  }

  setOnMapLongClickListener(listener: (data: LatLng) => void, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        // adding the longPress handler to the map oject so it's not GC'd
        theMap['mapLongPressHandler'] = MapLongPressHandlerImpl.initWithOwnerAndListenerForMap(new WeakRef(this), listener, theMap);
        const longPressGestureRecognizer = UILongPressGestureRecognizer.alloc().initWithTargetAction(theMap['mapLongPressHandler'], "longPress");

        // cancel the default longPress handler
        for (let i = 0; i < theMap.gestureRecognizers.count; i++) {
          let recognizer: UIGestureRecognizer = theMap.gestureRecognizers.objectAtIndex(i);
          if (recognizer instanceof UILongPressGestureRecognizer) {
            longPressGestureRecognizer.requireGestureRecognizerToFail(recognizer);
          }
        }

        theMap.addGestureRecognizer(longPressGestureRecognizer);

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnMapClickListener: " + ex);
        reject(ex);
      }
    });
  }

  setOnScrollListener(listener: (data?: LatLng) => void, nativeMap?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        // adding the pan handler to the map oject so it's not GC'd
        theMap['mapPanHandler'] = MapPanHandlerImpl.initWithOwnerAndListenerForMap(new WeakRef(this), listener, theMap);

        // there's already a pan recognizer, so find it and attach a target action
        for (let i = 0; i < theMap.gestureRecognizers.count; i++) {
          let recognizer: UIGestureRecognizer = theMap.gestureRecognizers.objectAtIndex(i);
          if (recognizer instanceof UIPanGestureRecognizer) {
            recognizer.addTargetAction(theMap['mapPanHandler'], "pan");
            break;
          }
        }

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setOnScrollListener: " + ex);
        reject(ex);
      }
    });
  }

  setOnFlingListener(listener: () => void, nativeMap?: any): Promise<any> {
    // there's no swipe event we can bind to
    return Promise.reject("'setOnFlingListener' is not supported on iOS");
  }

  setOnCameraMoveListener(listener: () => void, nativeMap?: any): Promise<any> {
    return Promise.reject("'setOnCameraMoveListener' not currently supported on iOS");
  }

  setOnCameraMoveCancelListener(listener: () => void, nativeMap?: any): Promise<any> {
    return Promise.reject("'setOnCameraMoveCancelListener' not currently supported on iOS");
  }

  setOnCameraIdleListener(listener: () => void, nativeMap?: any): Promise<any> {
    return Promise.reject("'setOnCameraIdleListener' not currently supported on iOS");
  }

  getViewport(nativeMap?): Promise<Viewport> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        let visibleBounds = theMap.visibleCoordinateBounds;
        let bounds = {
          north: visibleBounds.ne.latitude,
          east: visibleBounds.ne.longitude,
          south: visibleBounds.sw.latitude,
          west: visibleBounds.sw.longitude
        };
        resolve({
          bounds: bounds,
          zoomLevel: theMap.zoomLevel
        });
      } catch (ex) {
        console.log("Error in mapbox.getViewport: " + ex);
        reject(ex);
      }
    });
  }

  setViewport(options: SetViewportOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        let bounds: MGLCoordinateBounds = {
          sw: CLLocationCoordinate2DMake(options.bounds.south, options.bounds.west),
          ne: CLLocationCoordinate2DMake(options.bounds.north, options.bounds.east)
        };

        let animated = options.animated === undefined || options.animated;

        // support defined padding
        let padding: UIEdgeInsets = Mapbox.merge(options.padding === undefined ? {} : options.padding, {
          top: 25,
          left: 25,
          bottom: 25,
          right: 25
        });

        theMap.setVisibleCoordinateBoundsEdgePaddingAnimated(bounds, padding, animated);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.setViewport: " + ex);
        reject(ex);
      }
    });
  }

  downloadOfflineRegion(options: DownloadOfflineRegionOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let styleURL = _getMapStyle(options.style);
        let swCoordinate = CLLocationCoordinate2DMake(options.bounds.south, options.bounds.west);
        let neCoordinate = CLLocationCoordinate2DMake(options.bounds.north, options.bounds.east);

        let bounds: MGLCoordinateBounds = {
          sw: swCoordinate,
          ne: neCoordinate
        };

        let region = MGLTilePyramidOfflineRegion.alloc().initWithStyleURLBoundsFromZoomLevelToZoomLevel(
            styleURL,
            bounds,
            options.minZoom,
            options.maxZoom);

        if (options.accessToken) {
          MGLAccountManager.accessToken = options.accessToken;
        }

        // TODO there's more observers, see https://www.mapbox.com/ios-sdk/examples/offline-pack/
        if (options.onProgress) {
          _addObserver(MGLOfflinePackProgressChangedNotification, (notification: NSNotification) => {
            let offlinePack = notification.object;
            let offlinePackProgress = offlinePack.progress;
            let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(offlinePack.context);
            let complete = offlinePackProgress.countOfResourcesCompleted === offlinePackProgress.countOfResourcesExpected;

            options.onProgress({
              name: userInfo.objectForKey("name"),
              completed: offlinePackProgress.countOfResourcesCompleted,
              expected: offlinePackProgress.countOfResourcesExpected,
              percentage: Math.round((offlinePackProgress.countOfResourcesCompleted / offlinePackProgress.countOfResourcesExpected) * 10000) / 100,
              complete: complete
            });

            if (complete) {
              resolve();
            }
          });
        }

        _addObserver(MGLOfflinePackErrorNotification, (notification: NSNotification) => {
          let offlinePack = notification.object;
          let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(offlinePack.context);
          let error = notification.userInfo[MGLOfflinePackUserInfoKeyError];
          reject({
            name: userInfo.objectForKey("name"),
            error: "Download error. " + error
          });
        });

        _addObserver(MGLOfflinePackMaximumMapboxTilesReachedNotification, (notification: NSNotification) => {
          let offlinePack = notification.object;
          let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(offlinePack.context);
          let maximumCount = notification.userInfo[MGLOfflinePackUserInfoKeyMaximumCount];
          console.log(`Offline region '${userInfo.objectForKey("name")}' reached the tile limit of ${maximumCount}`);
        });

        // Store some data for identification purposes alongside the downloaded resources.
        let userInfo = {"name": options.name};
        let context = NSKeyedArchiver.archivedDataWithRootObject(userInfo);

        // Create and register an offline pack with the shared offline storage object.
        MGLOfflineStorage.sharedOfflineStorage.addPackForRegionWithContextCompletionHandler(region, context, (pack, error: NSError) => {
          if (error) {
            // The pack couldn’t be created for some reason.
            reject(error.localizedFailureReason);
          } else {
            // Start downloading.
            pack.resume();
          }
        });

      } catch (ex) {
        console.log("Error in mapbox.downloadOfflineRegion: " + ex);
        reject(ex);
      }
    });
  }

  listOfflineRegions(options?: ListOfflineRegionsOptions): Promise<OfflineRegion[]> {
    return new Promise((resolve, reject) => {
      try {
        let packs = MGLOfflineStorage.sharedOfflineStorage.packs;
        if (!packs) {
          reject("No packs found or Mapbox not ready yet");
          return;
        }

        let regions = [];
        for (let i = 0; i < packs.count; i++) {
          let pack: MGLOfflinePack = packs.objectAtIndex(i);
          let region: MGLTilePyramidOfflineRegion = <MGLTilePyramidOfflineRegion>pack.region;
          let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(pack.context);
          regions.push({
            name: userInfo.objectForKey("name"),
            style: "" + region.styleURL,
            minZoom: region.minimumZoomLevel,
            maxZoom: region.maximumZoomLevel,
            bounds: {
              north: region.bounds.ne.latitude,
              east: region.bounds.ne.longitude,
              south: region.bounds.sw.latitude,
              west: region.bounds.sw.longitude
            }
          });
        }
        resolve(regions);

      } catch (ex) {
        console.log("Error in mapbox.listOfflineRegions: " + ex);
        reject(ex);
      }
    });
  }

  deleteOfflineRegion(options: DeleteOfflineRegionOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (!options || !options.name) {
          reject("Pass in the 'name' param");
          return;
        }

        let packs = MGLOfflineStorage.sharedOfflineStorage.packs;
        let found = false;
        for (let i = 0; i < packs.count; i++) {
          let pack = packs.objectAtIndex(i);
          let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(pack.context);
          let name = userInfo.objectForKey("name");
          if (name === options.name) {
            found = true;
            MGLOfflineStorage.sharedOfflineStorage.removePackWithCompletionHandler(pack, (error: NSError) => {
              if (error) {
                // The pack couldn’t be deleted for some reason.
                reject(error.localizedFailureReason);
              } else {
                resolve();
                // don't return, see note below
              }
            });
            // don't break the loop as there may be multiple packs with the same name
          }
        }
        if (!found) {
          reject("Region not found");
        }
      } catch (ex) {
        console.log("Error in mapbox.deleteOfflineRegion: " + ex);
        reject(ex);
      }
    });
  }

  addExtrusion(options: AddExtrusionOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.deleteOfflineRegion: " + ex);
        reject(ex);
      }
    });
  }

  addGeoJsonClustered(options: AddGeoJsonClusteredOptions, nativeMap?): Promise<any> {
    throw new Error('Method not implemented.');
  }

  addSource(options: AddSourceOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { id, url, type } = options;
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;
        let source;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        if (theMap.style.sourceWithIdentifier(id)) {
          reject("Source exists: " + id);
          return;
        }

        switch (type) {
          case "vector":
            source = MGLVectorTileSource.alloc().initWithIdentifierConfigurationURL(id, NSURL.URLWithString(url));
            break;
          default:
            reject("Invalid source type: " + type);
            return;
        }

        if (!source) {
          const ex = "No source to add";
          console.log("Error in mapbox.addSource: " + ex);
          reject(ex);
          return;
        }

        theMap.style.addSource(source);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.addSource: " + ex);
        reject(ex);
      }
    });
  }

  removeSource(id: string, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        const source = theMap.style.sourceWithIdentifier(id);
        if (!source) {
          reject("Source does not exist");
          return;
        }

        theMap.style.removeSource(source);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.removeSource: " + ex);
        reject(ex);
      }
    });
  }

  addLayer(options: AddLayerOptions, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { id, source, sourceLayer, type } = options;
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;
        let layer;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        if (theMap.style.layerWithIdentifier(id)) {
          reject("Layer exists: " + id);
          return;
        }

        switch (type) {
          case "circle":
            const circleColor = !options.circleColor ? UIColor.blackColor : (options.circleColor instanceof Color ? options.circleColor.ios : new Color(options.circleColor).ios);
            const circleOpacity = options.circleOpacity === undefined ? 1 : options.circleOpacity;
            const circleRadius = options.circleRadius || 5;
            const circleStrokeColor = !options.circleStrokeColor ? UIColor.blackColor : (options.circleStrokeColor instanceof Color ? options.circleStrokeColor.ios : new Color(options.circleStrokeColor).ios);
            const circleStrokeWidth = options.circleStrokeWidth === undefined ? 2 : options.circleStrokeWidth;

            layer = MGLCircleStyleLayer.alloc().initWithIdentifierSource(id, theMap.style.sourceWithIdentifier(source));
            layer.sourceLayerIdentifier = sourceLayer;

            layer.circleColor = NSExpression.expressionForConstantValue(circleColor);
            layer.circleOpacity = NSExpression.expressionForConstantValue(circleOpacity);
            layer.circleRadius = NSExpression.expressionForConstantValue(circleRadius);
            layer.circleStrokeColor = NSExpression.expressionForConstantValue(circleStrokeColor);
            layer.circleStrokeWidth = NSExpression.expressionForConstantValue(circleStrokeWidth);
            break;
          case "fill":
            const fillColor = !options.fillColor ? UIColor.blackColor : (options.fillColor instanceof Color ? options.fillColor.ios : new Color(options.fillColor).ios);
            const fillOpacity = options.fillOpacity === undefined ? 1 : options.fillOpacity;

            layer = MGLFillStyleLayer.alloc().initWithIdentifierSource(id, theMap.style.sourceWithIdentifier(source));
            layer.sourceLayerIdentifier = sourceLayer;

            layer.fillColor = NSExpression.expressionForConstantValue(fillColor);
            layer.fillOpacity = NSExpression.expressionForConstantValue(fillOpacity);
            break;
          case "line":
            const lineCap = options.lineCap === undefined ? 'round' : options.lineCap;
            const lineJoin = options.lineJoin === undefined ? 'round' : options.lineJoin;

            const lineColor = options.lineColor === undefined ? UIColor.blackColor : (options.lineColor instanceof Color ? options.lineColor.ios : new Color(options.lineColor).ios);
            const lineOpacity = options.lineOpacity === undefined ? 1 : options.lineOpacity;
            const lineWidth = options.lineWidth === undefined ? 2 : options.lineWidth;

            layer = MGLLineStyleLayer.alloc().initWithIdentifierSource(id, theMap.style.sourceWithIdentifier(source));
            layer.sourceLayerIdentifier = sourceLayer;

            layer.lineCap = NSExpression.expressionForConstantValue(lineCap);
            layer.lineJoin = NSExpression.expressionForConstantValue(lineJoin);
            layer.lineColor = NSExpression.expressionForConstantValue(lineColor);
            layer.lineOpacity = NSExpression.expressionForConstantValue(lineOpacity);
            layer.lineWidth = NSExpression.expressionForConstantValue(lineWidth);
            break;
          default:
            reject("Invalid layer type: " + options.type);
            break;
        }

        if (!layer) {
          reject("Error in mapbox.addLayer: No layer to add");
        }

        if (options.above && theMap.style.layerWithIdentifier(options.above)) {
          theMap.style.insertLayerAboveLayer(layer, theMap.style.layerWithIdentifier(options.above));
        } else if (options.below && theMap.style.layerWithIdentifier(options.below)) {
          theMap.style.insertLayerBelowLayer(layer, theMap.style.layerWithIdentifier(options.below));
        } else {
          theMap.style.addLayer(layer);
        }
        
        theMap.style.addLayer(layer);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.addLayer: " + ex);
        reject(ex);
      }
    });
  }

  removeLayer(id: string, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        const layer = theMap.style.layerWithIdentifier(id);
        if (!layer) {
          reject("Error in mapbox.removeLayer: Layer does not exist");
          return;
        }

        theMap.style.removeLayer(layer);
        resolve();
      } catch (ex) {
        console.log("Error in mapbox.removeLayer: " + ex);
        reject(ex);
      }
    });
  }

  trackUser(options: TrackUserOptions, nativeMap?): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        if (!theMap.showsUserLocation) {
          reject("The map is not currently showing the user location");
          return;
        }

        theMap.setUserTrackingModeAnimated(_getTrackingMode(options.mode), options.animated !== false);

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.trackUser: " + ex);
        reject(ex);
      }
    });
  }
}

const _addObserver = (eventName, callback) => {
  return utils.ios.getter(NSNotificationCenter, NSNotificationCenter.defaultCenter).addObserverForNameObjectQueueUsingBlock(
      eventName, null, utils.ios.getter(NSOperationQueue, NSOperationQueue.mainQueue), callback);
};

const _downloadImage = marker => {
  return new Promise((resolve, reject) => {
    console.log(">> _downloadImage");
    // to cache..
    if (_markerIconDownloadCache[marker.icon]) {
      marker.iconDownloaded = _markerIconDownloadCache[marker.icon];
      console.log(">> marker.iconDownloaded: " + marker.iconDownloaded);
      resolve(marker);
      return;
    }
    // ..or not to cache
    http.getImage(marker.icon).then(
        (output) => {
          marker.iconDownloaded = output.ios;
          _markerIconDownloadCache[marker.icon] = marker.iconDownloaded;
          resolve(marker);
        }, (ignoredError) => {
          console.log(`Download failed for ${marker.icon} with error: ${ignoredError}`);
          resolve(marker);
        });
  });
};

const _downloadMarkerImages = (markers: Array<MapboxMarker>) => {
  let iterations = [];
  let result = [];
  markers.forEach(marker => {
    if (marker.icon && marker.icon.startsWith("http")) {
      let p = _downloadImage(marker).then(mark => result.push(mark));
      iterations.push(p);
    } else {
      result.push(marker);
    }
  });

  return Promise.all(iterations).then(() => result);
};

const _addMarkers = (markers: MapboxMarker[], nativeMap?) => {
  if (!markers) {
    console.log("No markers passed");
    return;
  }
  if (!Array.isArray(markers)) {
    console.log("markers must be passed as an Array: [{title: 'foo'}]");
    return;
  }
  let theMap: MGLMapView = nativeMap || _mapbox.mapView;

  _downloadMarkerImages(markers).then((updatedMarkers: Array<MapboxMarker>) => {
    updatedMarkers.forEach(marker => {
      let lat = marker.lat;
      let lng = marker.lng;
      let point = MGLPointAnnotation.new();
      point.coordinate = CLLocationCoordinate2DMake(lat, lng);
      point.title = marker.title;
      point.subtitle = marker.subtitle;
      // needs to be done before adding to the map, otherwise the delegate method 'mapViewImageForAnnotation' can't use it
      _markers.push(marker);
      theMap.addAnnotation(point);

      if (marker.selected) {
        theMap.selectAnnotationAnimated(point, false);
      }

      marker.ios = point;

      marker.update = (newSettings: MapboxMarker) => {
        _markers.forEach(_marker => {
          if (marker.id === _marker.id) {
            if (newSettings.onTap !== undefined) {
              _marker.onTap = newSettings.onTap;
            }
            if (newSettings.onCalloutTap !== undefined) {
              _marker.onCalloutTap = newSettings.onCalloutTap;
            }
            if (newSettings.title !== undefined) {
              _marker.ios.title = _marker.title = newSettings.title;
            }
            if (newSettings.subtitle !== undefined) {
              _marker.ios.subtitle = _marker.subtitle = newSettings.subtitle;
            }
            if (newSettings.lat && newSettings.lng) {
              _marker.lat = newSettings.lat;
              _marker.lng = newSettings.lng;
              _marker.ios.coordinate = CLLocationCoordinate2DMake(newSettings.lat, newSettings.lng);
            }
            if (newSettings.selected) {
              theMap.selectAnnotationAnimated(_marker.ios, false);
            }
          }
        });
      };
    });
  });
};

/**
* "Delegate" for catching MapView events
*
* @link https://docs.nativescript.org/core-concepts/ios-runtime/how-to/ObjC-Subclassing#typescript-delegate-example
*/

class MGLMapViewDelegateImpl extends NSObject implements MGLMapViewDelegate {
  public static ObjCProtocols = [MGLMapViewDelegate];

  static new(): MGLMapViewDelegateImpl {
    return <MGLMapViewDelegateImpl>super.new();
  }

  private mapLoadedCallback: (mapView: MGLMapView) => void;
  private styleLoadedCallback: () => void;

  public initWithCallback(mapLoadedCallback: (mapView: MGLMapView) => void): MGLMapViewDelegateImpl {
    this.mapLoadedCallback = mapLoadedCallback;
    return this;
  }

  /**
  * set style loaded callback.
  *
  * set an optional callback to be invoked when a style set with
  * setMapStyle() is finished loading
  *
  * @param {function} callback function with loaded style as parameter.
  *
  * @see Mapbox:setMapStyle()
  */
  setStyleLoadedCallback(callback) {
    this.styleLoadedCallback = callback;
  }

  /**
  * Callback when the style has been loaded.
  *
  * Based on testing, it looks like this callback is invoked multiple times. This is only called from setMapStyle().
  *
  * @see Mapbox:setMapStyle()
  *
  * @link https://mapbox.github.io/mapbox-gl-native/macos/0.3.0/Protocols/MGLMapViewDelegate.html#/c:objc(pl)MGLMapViewDelegate(im)mapView:didFinishLoadingStyle:
  */
  mapViewDidFinishLoadingStyle(mapView: MGLMapView): void {
    if (this.styleLoadedCallback !== undefined) {
      this.styleLoadedCallback();
      // to avoid multiple calls. This is only invoked from setMapStyle().
      this.styleLoadedCallback = undefined;
    }
  }

  mapViewDidFinishLoadingMap(mapView: MGLMapView): void {
    if (this.mapLoadedCallback !== undefined) {
      this.mapLoadedCallback(mapView);
      // this should be fired only once, but it's also fired when the style changes, so just remove the callback
      this.mapLoadedCallback = undefined;
    }
  }

  mapViewAnnotationCanShowCallout(mapView: MGLMapView, annotation: MGLAnnotation): boolean {
    return true;
  }

  mapViewDidFailLoadingMapWithError(mapView: MGLMapView, error: NSError): void {
    // console.log("mapViewDidFailLoadingMapWithError: " + error);
  }

  mapViewDidChangeUserTrackingModeAnimated(mapView: MGLMapView, mode: MGLUserTrackingMode, animated: boolean): void {
    // console.log("mapViewDidChangeUserTrackingModeAnimated: " + mode);
  }

  // fired when the marker icon is about to be rendered - return null for the default icon
  mapViewImageForAnnotation(mapView: MGLMapView, annotation: MGLAnnotation): MGLAnnotationImage {
    let cachedMarker = this.getTappedMarkerDetails(annotation);
    if (cachedMarker) {
      if (cachedMarker.reuseIdentifier) {
        let reusedImage = mapView.dequeueReusableAnnotationImageWithIdentifier(cachedMarker.reuseIdentifier);
        if (reusedImage) {
          return reusedImage;
        }
      }

      // TODO try adding .rotatesToMatchCamera = true;
      // .. for instance in the mapViewDidDeselectAnnotationView / mapViewDidSelectAnnotationView / mapViewViewForAnnotation delegate

      if (cachedMarker.icon) {
        if (cachedMarker.icon.startsWith("res://")) {
          let resourceName = cachedMarker.icon.substring("res://".length);
          let imageSource = imgSrc.fromResource(resourceName);
          if (imageSource === null) {
            console.log(`Unable to locate ${resourceName}`);
          } else {
            cachedMarker.reuseIdentifier = cachedMarker.icon;
            return MGLAnnotationImage.annotationImageWithImageReuseIdentifier(imageSource.ios, cachedMarker.reuseIdentifier);
          }
        } else if (cachedMarker.icon.startsWith("http")) {
          if (cachedMarker.iconDownloaded !== null) {
            cachedMarker.reuseIdentifier = cachedMarker.icon;
            return MGLAnnotationImage.annotationImageWithImageReuseIdentifier(cachedMarker.iconDownloaded, cachedMarker.reuseIdentifier);
          }
        } else {
          console.log("Please use res://resourceName, http(s)://imageUrl or iconPath to use a local path");
        }
      } else if (cachedMarker.iconPath) {
        let appPath = fs.knownFolders.currentApp().path;
        let iconFullPath = appPath + "/" + cachedMarker.iconPath;
        if (fs.File.exists(iconFullPath)) {
          let image = imgSrc.fromFile(iconFullPath).ios;
          // perhaps add resize options for nice retina rendering (although you can now use the 'icon' param instead)
          cachedMarker.reuseIdentifier = cachedMarker.iconPath;
          return MGLAnnotationImage.annotationImageWithImageReuseIdentifier(image, cachedMarker.reuseIdentifier);
        }
      }
    }
    return null;
  }

  // fired when one of the Callout's AccessoryViews is tapped (not currently used)
  mapViewAnnotationCalloutAccessoryControlTapped(mapView: MGLMapView, annotation: MGLAnnotation, control: UIControl): void {
  }

  // fired when a marker is tapped
  mapViewDidSelectAnnotation(mapView: MGLMapView, annotation: MGLAnnotation): void {
    let cachedMarker = this.getTappedMarkerDetails(annotation);
    if (cachedMarker && cachedMarker.onTap) {
      cachedMarker.onTap(cachedMarker);
    }
  }

  // fired when a callout is tapped
  mapViewTapOnCalloutForAnnotation(mapView: MGLMapView, annotation: MGLAnnotation): void {
    let cachedMarker = this.getTappedMarkerDetails(annotation);
    if (cachedMarker && cachedMarker.onCalloutTap) {
      cachedMarker.onCalloutTap(cachedMarker);
    }
  }

  private getTappedMarkerDetails(tapped): any {
    for (let m in _markers) {
      let cached = _markers[m];
      // don't compare lat/lng types as they're not the same (same for (sub)title, they may be null vs undefined)
      // tslint:disable-next-line:triple-equals
      if (cached.lat == tapped.coordinate.latitude &&
          // tslint:disable-next-line:triple-equals
          cached.lng == tapped.coordinate.longitude &&
          // tslint:disable-next-line:triple-equals
          cached.title == tapped.title &&
          // tslint:disable-next-line:triple-equals
          cached.subtitle == tapped.subtitle) {
        return cached;
      }
    }
  }
}

class MapTapHandlerImpl extends NSObject {
  private _owner: WeakRef<Mapbox>;
  private _listener: (data: LatLng) => void;
  private _mapView: MGLMapView;

  public static initWithOwnerAndListenerForMap(owner: WeakRef<Mapbox>, listener: (data: LatLng) => void, mapView: MGLMapView): MapTapHandlerImpl {
    let handler = <MapTapHandlerImpl>MapTapHandlerImpl.new();
    handler._owner = owner;
    handler._listener = listener;
    handler._mapView = mapView;
    return handler;
  }

  public tap(recognizer: UITapGestureRecognizer): void {
    const tapPoint = recognizer.locationInView(this._mapView);

    const tapCoordinate = this._mapView.convertPointToCoordinateFromView(tapPoint, this._mapView);
    this._listener({
      lat: tapCoordinate.latitude,
      lng: tapCoordinate.longitude
    });
  }

  public static ObjCExposedMethods = {
    "tap": {returns: interop.types.void, params: [interop.types.id]}
  };
}

class MapLongPressHandlerImpl extends NSObject {
  private _owner: WeakRef<Mapbox>;
  private _listener: (data?: LatLng) => void;
  private _mapView: MGLMapView;

  public static initWithOwnerAndListenerForMap(owner: WeakRef<Mapbox>, listener: (data?: LatLng) => void, mapView: MGLMapView): MapLongPressHandlerImpl {
    let handler = <MapLongPressHandlerImpl>MapLongPressHandlerImpl.new();
    handler._owner = owner;
    handler._listener = listener;
    handler._mapView = mapView;
    return handler;
  }

  public longPress(recognizer: UILongPressGestureRecognizer): void {
    const longPressPoint = recognizer.locationInView(this._mapView);
    const longPressCoordinate = this._mapView.convertPointToCoordinateFromView(longPressPoint, this._mapView);
    this._listener({
      lat: longPressCoordinate.latitude,
      lng: longPressCoordinate.longitude
    });
  }

  public static ObjCExposedMethods = {
    "longPress": {returns: interop.types.void, params: [interop.types.id]}
  };
}

class MapPanHandlerImpl extends NSObject {
  private _owner: WeakRef<Mapbox>;
  private _listener: (data?: LatLng) => void;
  private _mapView: MGLMapView;

  public static initWithOwnerAndListenerForMap(owner: WeakRef<Mapbox>, listener: (data?: LatLng) => void, mapView: MGLMapView): MapPanHandlerImpl {
    let handler = <MapPanHandlerImpl>MapPanHandlerImpl.new();
    handler._owner = owner;
    handler._listener = listener;
    handler._mapView = mapView;
    return handler;
  }

  public pan(recognizer: UIPanGestureRecognizer): void {
    const panPoint = recognizer.locationInView(this._mapView);
    const panCoordinate = this._mapView.convertPointToCoordinateFromView(panPoint, this._mapView);
    this._listener({
      lat: panCoordinate.latitude,
      lng: panCoordinate.longitude
    });
  }

  public static ObjCExposedMethods = {
    "pan": {returns: interop.types.void, params: [interop.types.id]}
  };
}

class MapSwipeHandlerImpl extends NSObject {
  private _owner: WeakRef<Mapbox>;
  private _listener: (data?: LatLng) => void;
  private _mapView: MGLMapView;

  public static initWithOwnerAndListenerForMap(owner: WeakRef<Mapbox>, listener: (data?: LatLng) => void, mapView: MGLMapView): MapSwipeHandlerImpl {
    let handler = <MapSwipeHandlerImpl>MapSwipeHandlerImpl.new();
    handler._owner = owner;
    handler._listener = listener;
    handler._mapView = mapView;
    return handler;
  }

  public swipe(recognizer: UISwipeGestureRecognizer): void {
    const swipePoint = recognizer.locationInView(this._mapView);
    const swipeCoordinate = this._mapView.convertPointToCoordinateFromView(swipePoint, this._mapView);
    this._listener({
      lat: swipeCoordinate.latitude,
      lng: swipeCoordinate.longitude
    });
  }

  public static ObjCExposedMethods = {
    "swipe": {returns: interop.types.void, params: [interop.types.id]}
  };
}
