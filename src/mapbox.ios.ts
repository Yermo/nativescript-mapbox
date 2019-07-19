import * as fs from "tns-core-modules/file-system";
import * as imgSrc from "tns-core-modules/image-source";
import * as utils from "tns-core-modules/utils/utils";
import * as http from "tns-core-modules/http";

import {
  AddExtrusionOptions,
  AddGeoJsonClusteredOptions,
  AddPolygonOptions,
  AddPolylineOptions,
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

import { Color } from "tns-core-modules/color";

import { GeoUtils } from './geo.utils';

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

  private nativeMapView: MGLMapView;
  private delegate: MGLMapViewDelegate;

  getNativeMapView(): any {
    return this.nativeMapView;
  }

  public createNativeView(): Object {
    let v = super.createNativeView();
    setTimeout(() => {
      this.initMap();
    }, 0);
    return v;
  }

  // ---------------------------------------------------

  /**
  * returns a reference to the class Mapbox API shim instance
  *
  * @see Mapbox
  */

  getMapboxApi() : any {
    return this.mapbox;
  }

  // ----------------------------------------------------

  /**
  * initialize the map
  *
  * @see MGLMapViewDelegateImpl
  */

  initMap(): void {
    if (!this.nativeMapView && this.config.accessToken) {
      this.mapbox = new Mapbox();
      let settings = Mapbox.merge(this.config, Mapbox.defaults);
      let drawMap = () => {
        MGLAccountManager.accessToken = settings.accessToken;
        this.nativeMapView = MGLMapView.alloc().initWithFrameStyleURL(CGRectMake(0, 0, this.nativeView.frame.size.width, this.nativeView.frame.size.height), _getMapStyle(settings.style));

        this.nativeMapView.delegate = this.delegate = MGLMapViewDelegateImpl.new().initWithCallback( () => {

          console.log( "MapboxView:initMap(): MLMapViewDeleteImpl onMapReady callback" );

          this.notify({
            eventName: MapboxViewBase.mapReadyEvent,
            object: this,
            map: this,
            ios: this.nativeMapView
          });
          // no permission required, but to align with Android we fire the event anyway
          this.notify({
            eventName: MapboxViewBase.locationPermissionGrantedEvent,
            object: this,
            map: this,
            ios: this.nativeMapView
          });
        });
        _setMapboxMapOptions(this.nativeMapView, settings);
        _markers = [];
        this.nativeView.addSubview(this.nativeMapView);
      };
      setTimeout(drawMap, settings.delay ? settings.delay : 0);
    }
  }

  // ----------------------------------

  public onLayout(left: number, top: number, right: number, bottom: number): void {
    super.onLayout(left, top, right, bottom);
    if (this.nativeMapView) {
      this.nativeMapView.layer.frame = this.ios.layer.bounds;
    }
  }

}

/*************** XML definition END ****************/

export class Mapbox extends MapboxCommon implements MapboxApi {

  // list of circle layers

  private circles: any = [];

  // list of polylines
 
  private lines: any = [];

  // registered callbacks.

  private eventCallbacks : any[] = [];

  // --------------------------------------------------------------------

  /**
  * event handler shim
  *
  * Initialize our event handler shim so that we can intercept events here.
  *
  * @param { MapboxView } mapboxView
  */

  initEventHandlerShim( mapboxNativeViewInstance : any ) {

    console.log( "Mapbox:initEventHandlerShim(): top" );

    this.setOnMapClickListener( ( point: LatLng ) => {
      return this.checkForCircleClickEvent( point );
    }, mapboxNativeViewInstance );

  }

  // --------------------------------------------------------------------------------

  /**
  * register a map event handler
  *
  * The NativeScript ContentView base class as on() and off() methods.
  */

  onMapEvent( eventName, id, callback, nativeMapView? ) : void {

  }

  // -------------------------------------------------------------------------------

  offMapEvent( eventName, id, nativeMapView? ) : void {

  }

  // ------------------------------------------------------------------------

  /**
  * checks for a click event on a circle.
  *
  * For the moment we have to handle map click events long hand ourselves for circles.
  *
  * When we catch an event we'll check the eventHandlers map to see if the 
  * given layer is listed. If it is we invoke it's callback.
  *
  * If there are multiple overlapping circles only the first one in the list will be called.
  *
  * We also check the location of the click to see if it's inside any 
  * circles and raise the event accordingly.
  *
  * @todo detect the top circle in the overlapping circles case.
  */

  private checkForCircleClickEvent( point : LatLng ) {

    console.log( "Mapbox:checkForCircleClickEvent(): got click event with point:", point );

    // is this point within a circle?

    for ( let i = 0; i < this.circles.length; i++ ) {

      console.log( "Mapbox:checkForCircleClickEvent(): checking circle with radius:", this.circles[i].radius );

      if ( GeoUtils.isLocationInCircle( 
        point.lng,
        point.lat,
        this.circles[i].center[0],
        this.circles[i].center[1],
        this.circles[i].radius )) {

        console.log( "Mapbox:checkForCircleClickEvent() Point is in circle with id '" + this.circles[i].id + "' invoking callbacks, if any. Callback list is:", this.eventCallbacks );

        for ( let x = 0; x < this.eventCallbacks[ 'click' ].length; x++ ) {
          let entry = this.eventCallbacks[ 'click' ][ x ];

          if ( entry.id == this.circles[i].id ) {

            console.log( "Mapbox:checkForCircleClickEvent(): calling callback for '" + entry.id + "'" );

            return entry.callback( point );

          }

        } // end of for loop over events.

      }

    } // end of loop over circles.

    return false;

  } // end of checkForCircleClickEvent()

  // -------------------------------------------------------------------------------

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
  // Life Cycle Hooks - Required on Android
  // ----------------------------------------

  /**
  * on Start
  */

  onStart( nativeMap?: any ): Promise<any> {
    return Promise.resolve();
  }

  // ----------------------------------------------

  /**
  * on Resume
  */

  onResume( nativeMap?: any ): Promise<any> {
    return Promise.resolve();
  }

  // ----------------------------------------------

  /**
  * on Pause
  */

  onPause( nativeMap?: any ): Promise<any> {
    return Promise.resolve();
  }

  // ----------------------------------------------

  /**
  * on Stop
  */

  onStop( nativeMap?: any ): Promise<any> {
    return Promise.resolve();
  }

  // ----------------------------------------------

  /**
  * on Low Memory
  */

  onLowMemory( nativeMap?: any ): Promise<any> {
    return Promise.resolve();
  }

  // ----------------------------------------------

  /**
  * on Destroy
  */

  onDestroy( nativeMap?: any ): Promise<any> {
    return Promise.resolve();
  }

  // ---------------------------------------------

  // onSaveInstanceState( Bundle outState)  

  // ----------------------------------------

  /**
  * explicitly set a map style
  */

  setMapStyle(style: string | MapStyle, nativeMap?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const theMap: MGLMapView = nativeMap || _mapbox.mapView;

        // the style takes some time to load so we have to set a callback
        // to wait for the style to finish loading

        let delegate : MGLMapViewDelegateImpl = <MGLMapViewDelegateImpl>theMap.delegate;

        delegate.setStyleLoadedCallback( ( mapView ) => {

          console.log( "Mapbox:setMapStyle(): style loaded callback returned." );

          resolve();
        });

        theMap.styleURL = _getMapStyle(style);

      } catch (ex) {
        console.log("Error in mapbox.setMapStyle: " + ex);
        reject(ex);
      }
    });
  }

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
          reject("invalid zoomlevel, use any double value from 0 to 20 (like 8.3)");
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

  // --------------------------------------------------------------

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
      theMap.style.addLayer(layer);


      resolve();
    });
  }

  // --------------------------------------------------------------------

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

      theMap.style.addLayer(layer);
      resolve();
    });
  }

  // --------------------------------------------------------------------

  private removePolyById(theMap, id: string): void {
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

  removePolygons(ids?: Array<any>, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      let theMap: MGLMapView = nativeMap || _mapbox.mapView;
      ids.map(id => this.removePolyById(theMap, "polygon_" + id));
      resolve();
    });
  }

  removePolylines(ids?: Array<any>, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      let theMap: MGLMapView = nativeMap || _mapbox.mapView;
      ids.map(id => this.removePolyById(theMap, "polyline_" + id));
      resolve();
    });
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

  // ------------------------------------------------------------------------------

  /**
  * sets a map level click listener
  *
  */

  setOnMapClickListener(listener: (data: LatLng) => void, nativeMap?): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = nativeMap || _mapbox.mapView;

        if (!theMap) {
          reject("No map has been loaded");
          return;
        }

        // adding the tap handler to the map oject so it's not GC'd
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

        let padding: UIEdgeInsets = {
          top: 25,
          left: 25,
          bottom: 25,
          right: 25
        };

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

  // -------------------------------------------------------------------------------------

  /**
  * a rough analogue to the mapbox-gl-js addLayer() method
  *
  * It would be nice if this {N} API matched the mapbox-gl-js API which
  * would make it much easier to share mapping applications between the web 
  * and {N} apps.
  *
  * This method accepts a Mapbox-GL-JS style specification JSON object with some 
  * limitations:
  *
  * - the source: must be a GeoJSON object. 
  * - only a subset of paint properties are available. 
  *
  * @param {object} style - a style following the Mapbox style specification.
  * @param {any} nativeMapView - native map view (com.mapbox.mapboxsdk.maps.MapView)
  *
  * @link https://docs.mapbox.com/mapbox-gl-js/style-spec/#layers
  */

  public addLayer( style, nativeMapView? ) : Promise<any> {

    let retval;

    switch( style.type ) {

      case 'line':
        retval = this.addLineLayer( style, nativeMapView );
      break;

      case 'circle':
        retval = this.addCircleLayer( style, nativeMapView );
      break;

      default:

        retval = Promise.reject( "Mapbox:addLayer() Unsupported geometry type '" + style.type + "'" );

      break;

    }

    return retval;

  }

  // --------------------------------------------------------------

  /**
  * remove layer by ID
  *
  * Removes a layer given a layer id
  *
  * @param {string} id
  */

  public removeLayer( id : string, nativeMapViewInstance ) {

    return new Promise((resolve, reject) => {
      try {

        const theMap: MGLMapView = nativeMapViewInstance || _mapbox.mapView;

        console.log( "Mapbox::removeLayer(): attempting to remove layer '" + id + "'" );

        let layer = theMap.style.layerWithIdentifier( id );

        console.log( "Mapbox:removeLayer(): got layer object: ", layer );

        if ( ! layer ) {
          throw new Error( "Layer '" + id + "' not found when attempting to remove it." ); 
        }

        theMap.style.removeLayer(layer);

        console.log( "Mapbox:removeLayer(): after removing layer " + id );

        resolve();

      } catch (ex) {
        console.log( "Mapbox:removeLayer() Error : " + ex );
        reject(ex);
      }

    }); // end of Promise()

  } // end of removeLayer()

  // -------------------------------------------------------------------------------------

  /**
  * add a line layer
  *
  * Draws a line layer based on a mapbox-gl-js Mapbox Style. 
  *
  * What sucks about this is that there is apparently no facility to add an event listener to a layer. 
  *
  * The idea for this method is to make sharing code between mapbox-gl-js Typescript web applications
  * and {N} native applications easier. 
  *
  * For the moment this method only supports a source type of 'geojson'.
  *
  * Example style for a line:
  *
  * {
  * 'id': someid,
  * 'type': 'line',
  * 'source': {
  *   'type': 'geojson',
  *   'data': {
  *     "type": "Feature",
  *       "geometry": {
  *       "type": "LineString",
  *         "coordinates": [ [ lng, lat ], [ lng, lat ], ..... ]
  *       }
  *     }
  *   }
  * },
  * 'layout': {
  *   'line-cap': 'round',
  *   'line-join': 'round'
  * },    
  * 'paint': {
  *   'line-color': '#ed6498',
  *   'line-width': 5,
  *   'line-opacity': .8,
  *   'line-dash-array': [ 1, 1, 1, ..]
  * }
  *
  * Do not call this method directly. Use addLayer().
  *
  * To enable catching of click events on a line, when a click handler is added
  * to a line (using the onMapEvent() method above), the Annotations plugin is used to 
  * draw an invisible clickable line over the line layer. Sadly, the Annotations
  * plugin does not support all the nice styling options of the line Layer so we're 
  * pushed into this compromise of drawing two lines, one for it's styling and the
  * other for it's click handling. 
  *
  * @param {object} style - a style following the Mapbox style specification.
  * @param {any} nativeMapView - native map view (com.mapbox.mapboxsdk.maps.MapView)
  *
  * @return {Promise<any>}
  *
  * @see addLineAnnotation()
  * @see onMapEvent()
  *
  * @link https://docs.mapbox.com/mapbox-gl-js/style-spec/#layers
  * @link https://docs.mapbox.com/android/api/map-sdk/7.1.2/com/mapbox/mapboxsdk/maps/Style.html#addSource-com.mapbox.mapboxsdk.style.sources.Source-
  * @link https://docs.nativescript.org/core-concepts/android-runtime/marshalling/java-to-js#array-of-primitive-types
  */

  private addLineLayer( style, nativeMapViewInstance? ) : Promise<any> {

    return new Promise((resolve, reject) => {

      try {

        const theMap: MGLMapView = nativeMapViewInstance || _mapbox.mapView;

        if ( style.type != 'line' ) {
          reject( "Non line style passed to addLineLayer()" );
        }

        // we need a source of type geojson.

        if (( typeof style.source == 'undefined' ) || ( style.source.type != 'geojson' )) {
          reject( "Only GeoJSON sources are currently supported." );
        }

        // has a source with this id already been defined? If so, then it is an error (because attempting
        // to add another source with the same id will crash the app.

        if ( theMap.style.sourceWithIdentifier( style.id )) {
          reject( "Remove the layer with this id first with 'removeLayer': " + style.id );
          return;
        }

        // after hours and hours of trial and error, I finally stumbled upon how to set things
        // up so that MGLPolylineFeature.polylineWithCoordinatesCount works.
        //
        // Allocating an NSArray and passing it in would cause the app to crash.
        // Creating a javascript array of CLLocationCoodinate2D entries would cause random
        // lines to be drawn on the map.
        //
        // However, allocating a raw C buffer and accessing it through a reference cast to CLLocationCoordinate2D
        // works (to my shock and horror).

        let coordinates = style.source.data.geometry.coordinates;

        let buffer = malloc( coordinates.length * 2 * interop.sizeof(interop.types.double) );
        let clCoordsArray = new interop.Reference( CLLocationCoordinate2D, buffer );

        // We need to convert our coordinate array into an array of CLLocationCoodinate2D elements
        // which are in lat/lng order and not lng/lat

        for ( let i = 0; i < coordinates.length; i++ ) {

          let newCoord : CLLocationCoordinate2D = CLLocationCoordinate2DMake( coordinates[i][1], coordinates[i][0] );

          clCoordsArray[ i ] = newCoord;

        }

        console.log( "Mapbox:addLineLayer(): after CLLocationCoordinate2D array before creating polyline source from clCoordsArray" );

        let polyline = MGLPolylineFeature.polylineWithCoordinatesCount( new interop.Reference( CLLocationCoordinate2D, clCoordsArray ), coordinates.length );

        const source = MGLShapeSource.alloc().initWithIdentifierShapeOptions( style.id, polyline, null );

        theMap.style.addSource( source );

        console.log( "Mapbox:addLineLayer(): after adding source" );

        const layer = MGLLineStyleLayer.alloc().initWithIdentifierSource( style.id, source);

        // color

        let color = 'black';

        if ( style.paint && style.paint[ 'line-color' ] ) {
          color = style.paint[ 'line-color' ];
        }

        layer.lineColor = NSExpression.expressionForConstantValue( new Color( color ).ios );

        console.log( "Mapbox:addLineLayer(): after line color" );

        // line width

        let width = 5;

        if ( style.paint && style.paint[ 'line-width' ] ) {
          width = style.paint[ 'line-width' ]; 
        }

        layer.lineWidth = NSExpression.expressionForConstantValue( width );

        console.log( "Mapbox:addLineLayer(): after line width" );

        let opacity = 1;

        if ( style.paint && style.paint[ 'line-opacity' ] ) {
          opacity = style.paint[ 'line-opacity' ];
        }

        layer.lineOpacity = NSExpression.expressionForConstantValue( opacity );

        console.log( "Mapbox:addLineLayer(): after opacity" );

        // line dash array
 
        if ( style.paint && style.paint[ 'line-dash-array' ] ) {

          let dashArray = [];

          for ( let i = 0; i < style.paint[ 'line-dash-array' ].length; i++ ) {
            dashArray[i] = NSExpression.expressionForConstantValue( style.paint[ 'line-dash-array' ][i] );
          }

          layer.lineDashPattern = NSExpression.expressionForConstantValue( dashArray );

        }

        theMap.style.addLayer(layer);

        console.log( "Mapbox:addLineLayer(): after adding layer." );

        this.lines.push({
          type: 'line',
          id: style.id,
          layer: layer,
          clCoordsArray: clCoordsArray,
          numCoords: coordinates.length,
          source: source
        });

        console.log( "Mapbox:addLineLayer(): pushed line:", this.lines[ this.lines.length - 1 ] );

        resolve();

      } catch (ex) {
        console.log( "Mapbox:addLineLayer() Error : " + ex);
        reject(ex);
      }

    }); // end of Promise()

  } // end of addLineLayer

  // -------------------------------------------------------------------------------------

  /**
  * Add a point to a line
  *
  * This method appends a point to a line and is useful for drawing a users track.
  *
  * The process for adding a point to a line is different in the iOS sdk than in 
  * the Android java sdk.
  *
  * @param {id} id - id of line to add a point to.
  * @param {array} lnglat - [lng,lat] to append to the line.
  *
  * @link https://github.com/mapbox/mapbox-gl-native/issues/13983
  * @link https://docs.mapbox.com/ios/maps/examples/runtime-animate-line/
  *
  * @todo this does not update the invisible clickable overlay.
  */

  public addLinePoint( id : string, lnglat, nativeMapView? ) : Promise<any> {

    return new Promise((resolve, reject) => {
      try {

        // The original thought was to query the source to get the points that make up the line
        // and then add a point to it. Unfortunately, it seems that the points in the source
        // are modified and do not match the original set of points that make up the map. I kept
        // adding a LineString and after querying it it would be returned as a MultiLineString
        // with more points. 
        //
        // As a result of this, we keep the original feature in the lines list and use that
        // as the data source for the line. As each point is added, we append it to the 
        // feature and reset the json source for the displayed line. 

        let lineEntry = this.lines.find( ( entry ) => { return entry.id == id; });

        if ( ! lineEntry ) {

          reject( "No such line layer '" + id + "'" );
          return;
        }

        // we carry a pointer to the raw buffer of CLLocationCoordinate2D structures. 
        // since we are managing the buffer ourselves we need to allocate space for
        // the new location entry.
        //  
        // I originally tried realloc here but as soon as I try to add an entry an exception is thrown 
        // indicating it's a read only property; hence the alloc, copy, and free here.

        let bytes = lineEntry.numCoords * 2 * interop.sizeof(interop.types.double);

        let buffer = malloc( bytes + ( 2 * interop.sizeof(interop.types.double) ) );
        let newCoordsArray = new interop.Reference( CLLocationCoordinate2D, buffer );

        for ( let i = 0; i < lineEntry.numCoords; i++ ) {
          newCoordsArray[ i ] = lineEntry.clCoordsArray[ i ];
        }

        lineEntry.numCoords++;

        newCoordsArray[ lineEntry.numCoords - 1 ] = CLLocationCoordinate2DMake( lnglat[1], lnglat[0] );

        free( lineEntry.clCoordsArray );

        let polyline = MGLPolylineFeature.polylineWithCoordinatesCount( new interop.Reference( CLLocationCoordinate2D, newCoordsArray ), lineEntry.numCoords );

        lineEntry.clCoordsArray = newCoordsArray;

        // now update the source

        lineEntry.source.shape = polyline;

        resolve();
      } catch (ex) {

        console.log( "Mapbox:addLinePoint() Error : " + ex);
        reject(ex);

      }
    });

  } // end of addLinePoint()

  // -------------------------------------------------------------------------------------

  /**
  * add a circle Layer
  *
  * Draw a circle based on a Mapbox style.
  *
  * Mapbox Native Android layers do not support click handlers. Unfortunately, we cannot use
  * the same Annotations approach that we do for lines to get a click handler because 
  * circles drawn by the Annotations plugin do not support stops so there's no making them
  * smaller as we zoom out. Instead, we have our own click handler (see handleClickEvent() above)
  * to determine when a click has occured inside a circle. 
  *
  * In order to support the click handler an additional circle-radius property, in meters, must
  * be included.
  *
  * {
  *  "id": someid,
  *  "type": 'circle',
  *  "radius-meters": 500,   // FIXME: radius in meters used for in-circle click detection. 
  *  "source": {
  *    "type": 'geojson',
  *    "data": {
  *      "type": "Feature",
  *      "geometry": {
  *        "type": "Point",
  *        "coordinates": [ lng, lat ]
  *      }
  *    }
  *  }, 
  *  "paint": {
  *    "circle-radius": {
  *      "stops": [
  *        [0, 0],
  *        [20, 8000 ]
  *      ],
  *      "base": 2
  *    },
  *    'circle-opacity': 0.05,
  *    'circle-color': '#ed6498',
  *    'circle-stroke-width': 2,
  *    'circle-stroke-color': '#ed6498'
  *  } 
  *
  * @param {object} style a Mapbox style describing the circle draw. 
  * @param {object} nativeMap view.
  * 
  * @link https://github.com/NativeScript/NativeScript/issues/6971
  * @link https://stackoverflow.com/questions/54890753/how-to-call-objective-c-nsexpression-format-from-nativescript/54913932#54913932
  */

  private addCircleLayer( style, nativeMapViewInstance? ): Promise<any> {

    return new Promise((resolve, reject) => {

      try {

        const theMap: MGLMapView = nativeMapViewInstance || _mapbox.mapView;

        if ( style.type != 'circle' ) {
          reject( "Non circle style passed to addCircleLayer()" );
        }

        // we need a source of type geojson.

        if (( typeof style.source == 'undefined' ) || ( style.source.type != 'geojson' )) {
          reject( "Only GeoJSON sources are currently supported." );
        }

        console.log( "Mapbox:addCircleLayer(): before addSource with style:", style );

        const geoJSON = `{"type": "FeatureCollection", "features": [ ${JSON.stringify(style.source.data)}]}`;

        // this would otherwise crash the app

        if ( theMap.style.sourceWithIdentifier( style.id ) ) {
          reject( "Remove the layer with this id first with 'removeLayer': " + style.id );
          return;
        }

        console.log( "Mapbox:addCircleLayer(): after checking for existing style" );

        const geoDataStr = NSString.stringWithString( geoJSON );

        console.log( "Mapbox:addCircleLayer(): after string" );

        const geoData = geoDataStr.dataUsingEncoding( NSUTF8StringEncoding );

        console.log( "Mapbox:addCircleLayer(): after encoding" );

        const geoDataBase64Enc = geoData.base64EncodedStringWithOptions(0);

        console.log( "Mapbox:addCircleLayer(): before alloc" );

        const geo = NSData.alloc().initWithBase64EncodedStringOptions( geoDataBase64Enc, null );

        console.log( "Mapbox:addCircleLayer(): before shape with style.id '" + style.id + "'" );

        const shape = MGLShape.shapeWithDataEncodingError( geo, NSUTF8StringEncoding );

        console.log( "Mapbox:addCircleLayer(): after shape before second alloc with style id '" + style.id + "' and shape '" + shape + "'");
        
        const source = MGLShapeSource.alloc().initWithIdentifierShapeOptions( style.id, shape, null );

        console.log( "Mapbox:addCircleLayer(): before addSource" );

        theMap.style.addSource( source );

        console.log( "Mapbox:addCircleLayer(): after adding source" );

        const layer = MGLCircleStyleLayer.alloc().initWithIdentifierSource( style.id, source );

        // color

        let color = 'black';

        if ( style.paint && style.paint[ 'circle-color' ] ) {
          color = style.paint[ 'circle-color' ];
        }

        layer.circleColor = NSExpression.expressionForConstantValue( new Color( color ).ios );

        console.log( "Mapbox:addCircleLayer(): after circle color" );

        // stroke color

        let strokeColor = 'black';

        if ( style.paint && style.paint[ 'circle-stroke-color' ] ) {
          strokeColor = style.paint[ 'circle-stroke-color' ];
        }

        layer.circleStrokeColor = NSExpression.expressionForConstantValue( new Color( strokeColor ).ios );

        // stroke width

        let width = 5;

        if ( style.paint && style.paint[ 'circle-stroke-width' ] ) {
          width = style.paint[ 'circle-stroke-width' ]; 
        }

        layer.circleStrokeWidth = NSExpression.expressionForConstantValue( width );

        console.log( "Mapbox:addCircleLayer(): after stroke width" );

        let opacity = 1;

        if ( style.paint && style.paint[ 'circle-opacity' ] ) {
          opacity = style.paint[ 'circe-opacity' ];
        }

        layer.circleOpacity = NSExpression.expressionForConstantValue( opacity );

        console.log( "Mapbox:addCircleLayer(): after opacity" );

        // we have two options for a radius. We might have a fixed float or an expression 

        let radius = 15;

        if ( style.paint &&  typeof style.paint[ 'circle-radius' ] == 'number' ) {
          layer.circleRadius = NSExpression.expressionForConstantValue( style.paint[ 'circle-radius' ] );
        } else {

          if ( ! style.paint[ 'circle-radius' ].stops ) {
            reject( "No radius or stops provided to addCircleLayer." );
            return;
          }

          // for the moment we assume we have a set of stops and a base. 

          let stopKeys = [];
          let stopValues = [];

          console.log( "Mapbox:addCircleLayer(): adding '" + style.paint[ 'circle-radius' ].stops.length + "' stops" );

          // this took forever to figure out. There is some NativeScript bug and the type definition for
          // NSExpression is not clear. We have to create an NSDictionary with two arrays. The first array is the 
          // values and the second one is the keys. They have to be in ascending order. Once an NSDictionary is created
          // we have to create an NSArray with that. 

          for ( let i = 0; i < style.paint[ 'circle-radius' ].stops.length; i++ ) {
            stopKeys[i] = style.paint[ 'circle-radius' ].stops[ i ][0];
            stopValues[i] = style.paint[ 'circle-radius'].stops[ i ][1];
          }

          let base = 2;

          if ( style.paint[ 'circle-radius' ].stops.base ) {
            base = style.paint[ 'circle-radius' ].stops.base;
          }

          console.log( "Mapbox:addCircleLayer(): pushing circleRadius with base:", base );

          let nsDict = new (NSDictionary as any)( stopValues, stopKeys );

          let nsArray = NSArray.arrayWithArray( [ nsDict ]);

           layer.circleRadius = NSExpression.expressionWithFormatArgumentArray(
             "mgl_interpolate:withCurveType:parameters:stops:( $zoomLevel, 'exponential', 2, %@)",
             nsArray );

           console.log( "Mapbox:addCircleLayer(): after setting circle radius expression" );

        }

        theMap.style.addLayer(layer);

        this.circles.push({
          type: 'circle',
          id: style.id,
          center: style.source.data.geometry.coordinates,
          radius: style[ 'circle-radius' ],
          layer: layer
        });

        resolve();

      } catch (ex) {
        console.log( "Mapbox:addCircleLayer() Error : " + ex);
        reject(ex);
      }

    }); // end of Promise()

  } // end of addCircleLayer()

  // ---------------------------------------------------------------------

  addGeoJsonClustered(options: AddGeoJsonClusteredOptions, nativeMap?): Promise<any> {
    throw new Error('Method not implemented.');
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

// -------------------------------------------------------------------------------------------------

/**
* "Delegate" for catching mapview events
*
* @link https://docs.nativescript.org/core-concepts/ios-runtime/how-to/ObjC-Subclassing#typescript-delegate-example
*/

class MGLMapViewDelegateImpl extends NSObject implements MGLMapViewDelegate {
  public static ObjCProtocols = [MGLMapViewDelegate];

  static new(): MGLMapViewDelegateImpl {
    return <MGLMapViewDelegateImpl>super.new();
  }

  private mapLoadedCallback: (mapView: MGLMapView) => void;
  private styleLoadedCallback: (mapView: MGLMapView) => void;

  // -----------------------

  /**
  * initialize with the mapReady callback
  */

  public initWithCallback( mapLoadedCallback: (mapView: MGLMapView) => void): MGLMapViewDelegateImpl {
    this.mapLoadedCallback = mapLoadedCallback;
    return this;
  }

  // -----------------------

  /**
  * set style loaded callback.
  *
  * set an optional callback to be invoked when a style set with
  * setMapStyle() is finished loading
  *
  * Note, from testing, it seems this callback can be invoked multiple times 
  * for a single style setting. It is up to the caller to handle this.
  *
  * @param {function} callback function with loaded style as parameter.
  */

  setStyleLoadedCallback( callback ) {

    this.styleLoadedCallback = callback;

  }

  // -----------------------

  /**
  * map ready callback
  */

  mapViewDidFinishLoadingMap(mapView: MGLMapView): void {

    console.log( "MGLMapViewDelegateImpl:mapViewDidFinishLoadingMap(): top" );

    if (this.mapLoadedCallback !== undefined) {

      this.mapLoadedCallback( mapView );

      // this should be fired only once, but it's also fired when the style changes, so just remove the callback

      this.mapLoadedCallback = undefined;

    }
  }

  // ------------------------

  mapViewDidFinishRenderingMapFullyRendered( mapView: MGLMapView, fullyRendered: boolean ) : void {

    console.log( "MGLMapViewDelegateImpl:mapViewDidFinishRenderingMapFullyRendered(): rendered is:", fullyRendered );

  }

  // ------------------------

  /**
  * Callback when the style has been loaded.
  *
  * Based on my testing, it looks like this callback is invoked multiple times. 
  *
  * @see Mapbox:setMapStyle()
  *
  * @link https://mapbox.github.io/mapbox-gl-native/macos/0.3.0/Protocols/MGLMapViewDelegate.html#/c:objc(pl)MGLMapViewDelegate(im)mapView:didFinishLoadingStyle:
  */

  mapViewDidFinishLoadingStyle( mapView: MGLMapView ) : void {

    console.log( "MGLMapViewDelegateImpl:mapViewDidFinishLoadingStyle(): callback called." );

    if (this.styleLoadedCallback !== undefined) {

      this.styleLoadedCallback( mapView );

      // to avoid multiple calls. This is only invoked from setMapStyle().

      this.styleLoadedCallback = undefined;
    }

  }

  // ------------------------

  mapViewAnnotationCanShowCallout(mapView: MGLMapView, annotation: MGLAnnotation): boolean {
    return true;
  }

  // -------------------------

  mapViewDidFailLoadingMapWithError(mapView: MGLMapView, error: NSError): void {
    // console.log("mapViewDidFailLoadingMapWithError: " + error);
  }

  // ---------------------------------------

  mapViewDidChangeUserTrackingModeAnimated(mapView: MGLMapView, mode: MGLUserTrackingMode, animated: boolean): void {
    // console.log("mapViewDidChangeUserTrackingModeAnimated: " + mode);
  }

  // ----------------------------------------

  /**
  * fired when the marker icon is about to be rendered - return null for the default icon
  */

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
          let resourcename = cachedMarker.icon.substring("res://".length);
          let imageSource = imgSrc.fromResource(resourcename);
          if (imageSource === null) {
            console.log(`Unable to locate ${resourcename}`);
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
          console.log("Please use res://resourcename, http(s)://imageurl or iconPath to use a local path");
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

  // ---------------------------------------------

  /**
  * fired when one of the callout's accessoryviews is tapped (not currently used)
  */

  mapViewAnnotationCalloutAccessoryControlTapped(mapView: MGLMapView, annotation: MGLAnnotation, control: UIControl): void {
  }

  // --------------------------------------------

  /**
  * fired when a marker is tapped
  */

  mapViewDidSelectAnnotation(mapView: MGLMapView, annotation: MGLAnnotation): void {
    let cachedMarker = this.getTappedMarkerDetails(annotation);
    if (cachedMarker && cachedMarker.onTap) {
      cachedMarker.onTap(cachedMarker);
    }
  }

  // ----------------------------------------------------------------------------------

  /**
  * fired when a callout is tapped
  */

  mapViewTapOnCalloutForAnnotation(mapView: MGLMapView, annotation: MGLAnnotation): void {
    let cachedMarker = this.getTappedMarkerDetails(annotation);
    if (cachedMarker && cachedMarker.onCalloutTap) {
      cachedMarker.onCalloutTap(cachedMarker);
    }
  }

  // -----------------------------------------------------------------------------------

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

// --------------------------------------------------------------------------------------

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
