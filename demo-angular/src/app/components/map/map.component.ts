/**
* Angular Map Component Implementation
* 
* Implements a map directive for NativeScript Angular
*
* @author Yermo Lamers, Flying Brick Software, LLC
*/

import {
  Component, 
  OnInit,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  Input,
  NgZone
} from '@angular/core';

import * as dialogs from "tns-core-modules/ui/dialogs";
import * as app from "tns-core-modules/application";

import { Subject } from 'rxjs/Subject';

// Mapbox GL Native API

import { Mapbox, MapboxViewApi } from "nativescript-mapbox";

import { PlatformService } from '../../services/platform.service';
import { EventsService } from '../../services/events.service';
import { SettingsService } from '../../services/settings.service';
import { DebugService } from '../../services/debug.service';

// This is the magic glue that tells NativeScript that when it encounters
// a Mapbox tag it should create a MapboxView.

import { registerElement } from "nativescript-angular/element-registry";
registerElement( "Mapbox", () => require("nativescript-mapbox").MapboxView);

import { Page } from "tns-core-modules/ui/page";

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
* @todo FIXME:The implementation is complicated by the fact that on Android when the app is paused
* or one navigates away from the page it intermittently crashes. 
*/

@Component({
  selector: "map",
  moduleId: module.id,
  template: `

    <StackLayout height="100%" width="100%" *ngIf="shown">
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
         (mapDestroyed)="onMapDestroyed($event)"
         (moveBeginEvent)="onMoveBegin($event)"
         (locationPermissionGranted)="onLocationPermissionGranted($event)"
         (locationPermissionDenied)="onLocationPermissionDenied($event)">
        </Mapbox>
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
  * so this promise is used by subtags. Before attempting to access the map, they
  * wait for the promise to be resolved.
  */

  public readyPromise:Promise<any>;

  public readyPromiseResolver:any;

  public isReady : boolean = false;

  @Input() id : string;

  @Input() style : string;
  @Input() access_token : string;

  // map location.

  @Input() location: any;

  /**
  * The map template
  */

  @ViewChild( 'mapTemplate', { static: false }) mapTemplate;

  /**
  * the reference to the element that contains the map.
  */

  @ViewChild( 'mapContainer', { read: ViewContainerRef, static: false }) mapContainer;

  public mapboxView: MapboxViewApi;
  public mapboxApi: Mapbox;

  // initial coordinates for the map if no location is available.

  @Input() fallbackLatitude : string;
  @Input() fallbackLongitude: string;
  
  // FIXME: for some reason on startup we're getting a platform:resume event
  // so we guard against that on first launch

  private firstLaunch : boolean = true;

  // whether or not to show the map
  //
  // To work around the Android random crash bug we destroy the map using 
  // an ngIf. Before navigating away, this is set to false destroying the
  // map. 

  shown : boolean = true;

  // After map is destroyed optional callback to call. (Provided by event)

  afterMapDestroyed : any = null;

  // akin to shown but used by other components who might update the map. 
  //
  // FIXME: ugly.

  isVisible : boolean = false;
  
  // ----------------------------------

  /**
  * map constructor
  *
  * @link https://github.com/EddyVerbruggen/nativescript-mapbox/issues/271
  */

  constructor( 
    public ngZone: NgZone,
    public viewContainerRef: ViewContainerRef,
    public page: Page,

    public platform: PlatformService,
    public settingsService: SettingsService,
    public events: EventsService,
    public debugService: DebugService
  ) {

    console.log( "MapComponent::constructor(): top" );

    this.isReady = false;

    this.readyPromise = new Promise( ( resolve, reject ) => {
      this.readyPromiseResolver = resolve;
    });

    this.registerEventHandlers();

  } // end of constructor()

  // -------------------------------------------------------------

  /**
  * register event handlers
  */

  registerEventHandlers() {

    // android pause/resume workaround hack

    this.events.subscribe( 'platform:pause', () => {
      this.onPause();
    });

    this.events.subscribe( 'platform:exit', () => {
      this.onExit();
    });

    this.events.subscribe( 'platform:resume', () => {
      this.onResume();
    });

    // FIXME: This hack is an unsuccessful attempt to address the intermittent crash problem on navigating away
    // after removing the map.

    this.events.subscribe( 'destroyMap', async ( data ) => {

      console.log( "MapComponent::registerEventHandlers(): got destroyMap event for component '" + this.id + "' for map '" + data.mapId + "'" );

      if ( this.id == data.mapId ) {

        console.log( "MapComponent::registerEventHandlers(): got destroyMap event ------------------------ " + this.debugService.incrementCounter( 'mapView' ) );

        await this.saveMapState();

        this.shown = false;

        // FIXME: ugly hack. See onMapDestroyed()

        this.afterMapDestroyed = data.onMapDestroyed;

        this.events.unsubscribe( 'destroyMap' );

      }
      
    });

  }

  // -------------------------------------------------------------

  /**
  * unregister event handlers 
  *
  * @todo under Android events sometimes undefined here. Not yet sure why.
  */

  unRegisterEventHandlers() {

    if ( typeof this.events != 'undefined' ) {
      this.events.unsubscribe( 'platform:pause' );
      this.events.unsubscribe( 'platform:exit' );
      this.events.unsubscribe( 'platform:resume' );
      this.events.unsubscribe( 'destroyMap' );
    }

  }

  // ------------------------------------------------------------

  ngOnInit() {
    console.log( "MapComponent::ngOnInit(): with style '" + this.style + "' and access token '" + this.access_token + "'" );
  }

  // -------------------------------------------------------------------------------

  /**
  * when the map is ready
  *
  * The onMapReady() callback is invoked when the MapboxView class instance is ready. 
  */

  onMapReady(args): void {

    console.log( "MapComponent:onMapReady(): top" );

    if ( ! this.isReady ) {
 
      console.log( "MapComponent:onMapReady(): First call to onMapReady()" );

      this.isReady = true;

    } else {

      console.error( "MapComponent:onMapReady(): duplicate call to onMapReady()" );

    }

    if ( this.mapboxView ) {
      console.error( "MapComponent:onMapReady() callback called when we already have a valid mapboxView. isReady is:", this.isReady );
      return;
    }

    // this is an instance of class MapboxView

    this.mapboxView = args.map;

    this.firstLaunch = false;

    this.isVisible = true;

    this.declareReady();

    console.log( "MapComponent:onMapReady(): after declareReady()" );

  } // end of onMapReady()

  // -------------------------------------------------------------------------------

  /**
  * when the map is destroyed
  *
  * @see app.component.ts
  *
  * @todo this is an unsuccessful attempt at working around the intermittent crash problem under Android.
  */

  onMapDestroyed(): void {

    // If we are just toggling the map we may not have an afterMapDestoryed event. 

    if ( this.afterMapDestroyed ) {
      console.log( "MapComponent:onMapDestroyed(): top" );

      this.afterMapDestroyed();

      console.log( "MapComponent::onMapDestroyed(): bottom" );
    }

  }

  // --------------------------------------

  /**
  * on scroll event
  */

  onMoveBegin( event ) : void {

    console.log( "MapComponent::onMoveBegin()" );

    this.events.publish( "map:moveBegin" );

  }

  // --------------------------------------

  /**
  * on location permission
  *
  * @todo FIXME: This callback apparently does not work when the location is first being granted.
  */

  onLocationPermissionGranted() { 
    console.log( "MapComponent:onLocationPermissionGranted(): callback" );
  }

  // --------------------------------------

  onLocationPermissionDenied() { 
    console.log( "MapComponent:onLocationPermissionDenied(): callback" );

    return dialogs.alert({
      title: "Location Denied",
      message: "Unable to get current location because the location permission has not been granted.",
      okButtonText: "OK",
    });

  }

  // --------------------------------------

  /**
  * when the app is paused
  *
  * Workaround for android pause/resume crash.
  */

  async onPause() {

    this.isVisible = false;
    this.shown = false;

    console.log( "MapComponent:onPause(): finished" );
  }

  // --------------------------------------

  /**
  * when the app exits
  */

  onExit() {
    this.onPause();
  }

  // --------------------------------------

  /**
  * when the app is resumed
  */

  onResume() {

    this.isVisible = true;

    console.log( "MapComponent:onResume(): Resume event received with firstLaunch '" + this.firstLaunch + "' and mapboxView '" + this.mapboxView + "'" );
    
    if ( this.platform.is( "android" ) && ! this.firstLaunch && ! this.mapboxView ) {

      console.log( "MapComponent:onResume(): re-inserting map" );

      this.shown = true;

    }

  }

  // ---------------------------------------------------------------

  /**
  * returns the ready promise
  */

  ready() {
    return this.readyPromise;
  }

  // ---------------------------------------------------------------

  /**
  * declare that we are ready
  *
  * Resolves our ready promise.
  */

  declareReady() {

    console.log( "MapComponent:declareReady(): the map component is ready" );

    this.isReady = true;

    this.readyPromiseResolver( true );

  }

  // -------------------------------------------------

  /**
  * on Destroy
  */

  async ngOnDestroy() {

    console.log( "MapComponent:onDestroy(): onDestroy called." );

    this.unRegisterEventHandlers();

  }

  // ---------------------------------------------------------------

  /**
  * Center the map on a location
  *
  * Move the map to center on the given coordinates. 
  */

  centerOn( location: any ) {

    console.log( "MapComponent::centerOn(): top" );

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

  zoom( zoomLevel: number ) {
  }

  // ---------------------------------------------------------------

  /**
  * Attribution Control
  */

  addAttributionControl( position: string ) {
  }

  // ---------------------------------------------------------------

  /**
  * Zoom control
  */

  addZoomControl( position: string ) {
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

    let center = await this.mapboxView.getCenter();     // .catch( (error) => { console.error( "MapComponent:saveMapState(): unable to get map center" ); } );
    let zoom = await this.mapboxView.getZoomLevel();    // .catch( (error) => { console.error( "MapComponent:saveMapState(): unable to get map zoom" ); } );
    let viewport = await this.mapboxView.getViewport(); // .catch( (error) => { console.error( "MapComponent:saveMapState(): unable to get map viewport" ); } );

    let settings : any = {
      center: center,
      zoom: zoom,
      viewport: viewport
    };

    console.log( "MapComponent:saveMapState(): got map settings:", settings );

    await this.settingsService.set( 'mapSettings', settings );

  }

  // ---------------------------------------------------------------------------------------

  /**
  * restore map settings
  *
  * When the map is recreated after a pause we return it to the settings it had when it was paused.
  */

  async restoreMapState() {

    let settings = await this.settingsService.get( 'mapSettings' );

    console.log( "MapComponent:restoreMapState(): got settings :", settings );

    if ( settings ) {

      console.log( "MapComponent:restoreMapState(): animating camera" );

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

  // ---------------------------------------------------------------------------------------

  addTestCircle() {

    console.log( "MapComponent:addTestCircle(): Adding test circle" );

    const metersToPixelsAtMaxZoom = ( radius, latitude ) => radius / 0.075 / Math.cos( latitude * Math.PI / 180);    

    const pixels = metersToPixelsAtMaxZoom( 500,  39.007846 ); 

    let style = {
      "id": 'testCircle',
      "type": 'circle',
      "circle-radius": 250,
      "source": {
        "type": 'geojson',
        "data": {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [ -76.947041, 39.007846 ]
          }
        }
      }, 
      "paint": {
        "circle-radius": {
          "stops": [
            [0, 0],
            [20, pixels ]
          ],
          "base": 2
        },
        'circle-opacity': 0.05,
        'circle-color': '#ed6498',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ed6498'
      } 
    };

    this.mapboxView.addLayer( 
      style
    ).catch( ( error ) => {
      console.error("MapComponent:addTestCircle(): addTestCircle threw an error:", error );
    });

    this.mapboxView.onMapEvent( 'click', 'testCircle', ( point ) => {

      console.log( "MapComponent:addTestCircle(): circle clicked" );

      // mandatory

      return true;

    });

  }

} // end of mapComponent

// END
