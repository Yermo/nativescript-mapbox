/**
* Angular Map Component Implementation
*
* Implements a map directive for NativeScript Angular
*
* @author Yermo Lamers, Flying Brick Software, LLC https://github.com/Yermo
*/

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  Input,
  NgZone,
  HostListener
} from "@angular/core";

import * as dialogs from "@nativescript/core/ui/dialogs";

// Mapbox GL Native API

import { Mapbox, MapboxViewApi } from "nativescript-mapbox";

import { PlatformService } from "../../services/platform.service";
import { EventsService } from "../../services/events.service";
import { SettingsService } from "../../services/settings.service";
import { DebugService } from "../../services/debug.service";

// This is the magic glue that tells NativeScript that when it encounters
// a Mapbox XML tag it should create a MapboxView.

import { registerElement } from "@nativescript/angular";
registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);

// -------------------------------------------------------------------------------------------------

/**
* Map Component
*
* This component demonstrates how to wrap the Mapbox API in a tag and support
* subtags:
*
*   location-map-button
*   track
*
* USAGE:
*
* <map id="<uniqid>"
*   access_token="mapbox access token"
*   style="mapbox style"
*   fallbackLatitude=""
*   fallbackLongitude="">
*   <location-map-button ></location-map-button>
*   <track></track>
* </map>
*
* where lat/lng are the default coordinates where to center the map if no location is available.
*
* @todo under iOS the <ContentView> tag is apparently required. If it is not present the map does not display.
*/

@Component({
  selector: "map",
  moduleId: module.id,
  template: `

    <StackLayout height="100%" width="100%">
      <ContentView height="100%" width="100%">
        <Mapbox
          accessToken="{{access_token}}"
          mapStyle="{{style}}"
          latitude="{{fallbackLatitude}}"
          longitude="{{fallbackLongitude}}"
          zoomLevel="10"
          delay="10"
          showUserLocation="false"
          hideCompass="false"
          hideAttribution="false"
          hideLogo="false"
          disableZoom="false"
          disableRotation="false"
          disableScroll="false"
          disableTilt="false"
         (mapReady)="onMapReady($event)"
         (moveBeginEvent)="onMoveBegin($event)"
         (locationPermissionGranted)="onLocationPermissionGranted()"
         (locationPermissionDenied)="onLocationPermissionDenied()">
        </Mapbox>
      </ContentView>
    </StackLayout>

  `,
  styleUrls: ["./map.component.css"]
})

export class MapComponent implements OnInit, OnDestroy {

  loading: any;

  /**
  * ready promise
  *
  * The map can take some time to be "ready" especially if it's slow to load the style
  * so this promise is used by child tags. Before attempting to access the map, they
  * wait for the promise to be resolved.
  */

  readyPromise: Promise<any>;
  readyPromiseResolver: any;
  isReady: boolean = false;

  @Input() id: string;

  @Input() style: string;
  @Input() access_token: string;

  // map location.

  @Input() location: any;

  /**
  * The map template
  */

  @ViewChild("mapTemplate", { static: false }) mapTemplate;

  /**
  * the reference to the element that contains the map.
  */

  @ViewChild("mapContainer", { read: ViewContainerRef, static: false }) mapContainer;

  mapboxView: MapboxViewApi = null;
  mapboxApi: Mapbox = null;

  // initial coordinates for the map if no location is available.

  @Input() fallbackLatitude: string;
  @Input() fallbackLongitude: string;

  // whether or not to show the map
  //
  // When navigating away from the page we destroy the map by
  // setting this to false (see the *ngIf on the StackLayout tag in the template above).

  shown: boolean = true;

  // After map is destroyed optional callback to call. (Provided by event)

  afterMapDestroyed: any = null;

  // ----------------------------------

  /**
  * map constructor
  *
  * @link https://github.com/EddyVerbruggen/nativescript-mapbox/issues/271
  */

  constructor(
    public ngZone: NgZone,
    public viewContainerRef: ViewContainerRef,

    public platform: PlatformService,
    public settingsService: SettingsService,
    public events: EventsService,
    public debugService: DebugService
  ) {

    console.log("MapComponent::constructor(): top");

    this.isReady = false;

    this.readyPromise = new Promise((resolve, reject) => {
      this.readyPromiseResolver = resolve;
    });

    this.registerEventHandlers();

  } // end of constructor()

  // -------------------------------------------------------------

  /**
  * register event handlers
  *
  * @link https://github.com/NativeScript/NativeScript/issues/7954
  * @link https://github.com/NativeScript/NativeScript/issues/7867
  */

  registerEventHandlers() {

    // android pause/resume workaround hack

    this.events.subscribe("platform:pause", () => {
      this.onPause();
    });

    this.events.subscribe("platform:exit", () => {
      this.onExit();
    });

    this.events.subscribe("platform:resume", () => {
      this.onResume();
    });

  }

  // -------------------------------------------------------------

  /**
  * unregister event handlers
  */

  unRegisterEventHandlers() {

    this.events.unsubscribe("platform:pause");
    this.events.unsubscribe("platform:exit");
    this.events.unsubscribe("platform:resume");
    this.events.unsubscribe("destroyMap");

    this.readyPromise = null;

  }

  // ------------------------------------------------------------

  ngOnInit() {
    console.log("MapComponent::ngOnInit(): with style '" + this.style + "' and access token '" + this.access_token + "'");
  }

  // -------------------------------------------------------------------------------

  /**
  * when the map is ready
  *
  * The onMapReady() callback is invoked when the MapboxView class instance is ready.
  */

  onMapReady(args): void {

    console.log("MapComponent:onMapReady(): top");

    if (! this.isReady) {

      console.log("MapComponent:onMapReady(): First call to onMapReady()");

      this.isReady = true;

    } else {

      console.error("MapComponent:onMapReady(): duplicate call to onMapReady()");

    }

    if (this.mapboxView) {
      console.error("MapComponent:onMapReady() callback called when we already have a valid mapboxView. isReady is:", this.isReady);

      return;
    }

    // this is an instance of class MapboxView

    this.mapboxView = args.map;

    this.declareReady();

    console.log("MapComponent:onMapReady(): after declareReady()");

  } // end of onMapReady()

  // --------------------------------------

  /**
  * when the app is paused
  *
  * Workaround for android pause/resume crash.
  */

  async onPause() {

    console.log("MapComponent::onPause()");
    this.shown = false;
  }

  // --------------------------------------

  /**
  * when the app exits
  */

  onExit() {
    console.log("MapComponent::onExit()");
    this.shown = false;
  }

  // --------------------------------------

  /**
  * when the app is resumed
  */

  onResume() {
    console.log("MapComponent::onResume()");
    this.shown = true;
  }

  // ---------------------------------------------------------------

  /**
  * returns the ready promise
  */

  ready() {
    return this.readyPromise;
  }

  // --------------------------------------------------------------

  /**
  * declare that we are ready
  *
  * Resolves our ready promise.
  */

  declareReady() {

    console.log("MapComponent:declareReady(): the map component is ready");

    this.isReady = true;

    this.readyPromiseResolver(true);

  }

  // -------------------------------------------------

  /**
  * on Destroy
  *
  * @link https://nativescripting.com/posts/force-component-destroy-by-using-page-life-cycle
  *
  * @todo when laterally navigating to a page the components are constructed, but when navigating away, ngOnDestroy is not automatically called. I do not understand why, hence the HostListener here.
  */

  @HostListener("unloaded")
  async ngOnDestroy() {

    console.log("MapComponent:ngOnDestroy()");

    // this prevents memory leaks.

    this.unRegisterEventHandlers();

    // Using the Rad Side Drawer, every time we navigate to this page new components
    // will be constructed .. which will generate a new map because of the way the plugin
    // is set up. To do it in the "correct NativeScript" way, I imagine we would somehow
    // cache the map object and on init pull it back out again to reuse it. But for the moment,
    // creating and destroying it each time works reliably.

    this.mapboxView.destroy();

  }

  // ---------------------------------------------------------------------------------------

  /**
  * Save map settings
  *
  * To support creating and destroying the map as necessary to work around issues with
  * the Mapbox Android SDK, we have to save the settings of the map so we can restore it
  * to the same state as it was when the app was paused.
  */

  async saveMapState() {

    const center = await this.mapboxView.getCenter();     // .catch( (error) => { console.error( "MapComponent:saveMapState(): unable to get map center" ); } );
    const zoom = await this.mapboxView.getZoomLevel();    // .catch( (error) => { console.error( "MapComponent:saveMapState(): unable to get map zoom" ); } );
    const viewport = await this.mapboxView.getViewport(); // .catch( (error) => { console.error( "MapComponent:saveMapState(): unable to get map viewport" ); } );

    const settings: any = {
      center,
      zoom,
      viewport
    };

    console.log("MapComponent:saveMapState(): got map settings:", settings);

    await this.settingsService.set("mapSettings", settings);

  }

  // ---------------------------------------------------------------------------------------

  /**
  * restore map settings
  *
  * When the map is recreated after a pause we return it to the settings it had when it was paused.
  */

  async restoreMapState() {

    const settings = await this.settingsService.get("mapSettings");

    console.log("MapComponent:restoreMapState(): got settings :", settings);

    if (settings) {

      console.log("MapComponent:restoreMapState(): animating camera");

      await this.mapboxView.animateCamera({
        target: {
          lat: settings.center.lat,
          lng: settings.center.lng
        },
        zoomLevel: settings.zoom, // Android
        altitude: 2000,  // iOS (meters from the ground)
        bearing: 0,    // Where the camera is pointing, 0-360 (degrees)
        tilt: 0,
        duration: 2000   // default 10000 (milliseconds)
      });

    }

    return settings;
  }

  // --------------------------------------
  // NOT USED
  // --------------------------------------

  /**
  * on scroll event
  */

  onMoveBegin(event): void {

    console.log("MapComponent::onMoveBegin()");

    this.events.publish("map:moveBegin");

  }

  // --------------------------------------

  /**
  * on location permission
  *
  * @todo FIXME: This callback apparently does not work when the location is first being granted.
  */

  onLocationPermissionGranted() {
    console.log("MapComponent:onLocationPermissionGranted(): callback");
  }

  // --------------------------------------

  onLocationPermissionDenied() {
    console.log("MapComponent:onLocationPermissionDenied(): callback");

    return dialogs.alert({
      title: "Location Denied",
      message: "Unable to get current location because the location permission has not been granted.",
      okButtonText: "OK"
    });

  }

  // ---------------------------------------------------------------

  /**
  * Center the map on a location
  *
  * Move the map to center on the given coordinates.
  */

  centerOn(location: any) {

    console.log("MapComponent::centerOn(): top");

    this.mapboxView.setCenter({
      lat: location.latitude,
      lng: location.longitude,
      animated: true
    });

  }

  // ---------------------------------------------------------------

  /**
  * Set the zoom to the specified value
  */

  zoom(zoomLevel: number) {
  }

  // ---------------------------------------------------------------

  /**
  * Attribution Control
  */

  addAttributionControl(position: string) {
  }

  // ---------------------------------------------------------------

  /**
  * Zoom control
  */

  addZoomControl(position: string) {
  }

  // ---------------------------------------------------------------------------------------

  addTestCircle() {

    console.log("MapComponent:addTestCircle(): Adding test circle");

    const metersToPixelsAtMaxZoom = (radius, latitude) => radius / 0.075 / Math.cos(latitude * Math.PI / 180);

    const pixels = metersToPixelsAtMaxZoom(500,  39.007846);

    const style = {
      id: "testCircle",
      type: "circle",
      "circle-radius": 250,
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [ -76.947041, 39.007846 ]
          }
        }
      },
      paint: {
        "circle-radius": {
          stops: [
            [0, 0],
            [20, pixels ]
          ],
          base: 2
        },
        "circle-opacity": 0.05,
        "circle-color": "#ed6498",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ed6498"
      }
    };

    this.mapboxView.addLayer(
      style
    ).catch((error) => {
      console.error("MapComponent:addTestCircle(): addTestCircle threw an error:", error);
    });

    this.mapboxView.onMapEvent("click", "testCircle", (point) => {

      console.log("MapComponent:addTestCircle(): circle clicked");

      // mandatory

      return true;

    });

  }

} // end of mapComponent

// END
