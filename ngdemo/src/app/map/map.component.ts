import { 
  Component, 
  OnInit, 
  AfterViewInit,
  AfterViewChecked
} from "@angular/core";

import { CreateViewEventData } from "tns-core-modules/ui/placeholder";

import * as application from "tns-core-modules/application";

// Mapbox GL Native API

import { Mapbox, MapStyle, LatLng } from "nativescript-mapbox";
import {NavigatedData, Page} from "tns-core-modules/ui/page";

import { registerElement } from "nativescript-angular/element-registry";
registerElement( "Mapbox", () => require("nativescript-mapbox").MapboxView);

import { MapFragment } from './mapfragment';

// registerElement("Placeholder", () => require("tns-core-modules/ui/placeholder").Placeholder);

const ACCESS_TOKEN = "ACCESS_TOKEN_HERE";

declare const android, com, java, org;

// -------------------------------------------------------------------------

@Component({
    selector: "ns-map",
    moduleId: module.id,
    templateUrl: "./map.component.html"
})
export class MapComponent implements OnInit, AfterViewInit, AfterViewChecked {

  private page: Page;
  private mapbox: Mapbox;
  private mapShown: boolean = false;

  // ------------------------------

  constructor(
    page: Page
  ) { 

    this.page = page;

    this.page.on( "navigatedTo", ( arg?: NavigatedData ) => {
      this.onNavigatedTo( arg );
    });

//    this.mapbox = new Mapbox();

    this.mapShown = false;
  }

  // -----------------------------------------------------------

  /**
  * Placeholder create view
  *
  * @link https://discourse.nativescript.org/t/ui-frame-view-fragments-for-android/438/6
  */

  creatingView( args : CreateViewEventData ) {

    console.log( "MapComponent::creatingView(): top with context:", args.context );

    let fragment = new MapFragment();

    console.log( "MapComponent::after MapFragment(): after MapFragment" );

    let fragmentManager = args.context.getSupportFragmentManager();

    console.log( "MapComponent::after FragmentManager()" );

    let fragmentTransaction = fragmentManager.beginTransaction();

    console.log( "MapComponent::after beginTransaction():", fragmentTransaction );

    let framelayout = new android.widget.FrameLayout( args.context );

    console.log( "MapComponent::after FrameLayout()" );

    framelayout.setId( android.view.View.generateViewId() ); 

    console.log( "MapComponent::after generateViewId()" );

    fragmentTransaction.add( framelayout.getId(), fragment );

    fragmentTransaction.commit();

    console.log( "MapComponent::creatingView(): after commit()" );
 
//    args.view = framelayout;
    args.view = fragment;

  }

  // ------------------------------

  ngOnInit(): void {

    console.log( "MapComponent::ngOnInit()" );

  }

  // ------------------------------

  ngAfterViewInit(): void {

    console.log( "MapComponent::ngAfterViewInit()" );

  }

  // ------------------------------

  ngAfterViewChecked(): void {

    console.log( "MapComponent::ngAfterViewChecked()" );

  }

  // -----------------------------------------------------

  onNavigatedTo( arg?: NavigatedData ) {

    console.log( "MapComponent:onNavigatedTo()" );

//    this.showMap();

  }

  // ------------------------------------------------------------------------------------------

  public showMap(): void {

    if ( this.mapShown ) {
      console.log( "MapComponent:showMap(): map already displayed" );
      return;
    }

    this.mapShown = true;

    console.log( "MapComponent::showMap(): before mapbox.show()" );

    this.mapbox.show({
      accessToken: ACCESS_TOKEN,
      style: MapStyle.LIGHT,
      margins: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      },
      center: {
        lat: 39.007846,
        lng: -76.947041
      },
      zoomLevel: 9, // 0 (most of the world) to 20, default 0
      showUserLocation: true, // default false
      hideAttribution: true, // default false
      hideLogo: true, // default false
      hideCompass: false, // default false
      disableRotation: false, // default false
      disableScroll: false, // default false
      disableZoom: false, // default false
      disableTilt: false, // default false
      markers: [
        {
          id: 1,
          lat: 52.3732160,
          lng: 4.8941680,
          title: 'Nice location',
          subtitle: 'Really really nice location',
          iconPath: 'res/markers/green_pin_marker.png',
          onTap: () => console.log("'Nice location' marker tapped"),
          onCalloutTap: () => console.log("'Nice location' marker callout tapped")
        }
      ]
    }).then(
        showResult => {

          console.log( "MapComponent::showMap(): Mapbox show done." );

          this.mapbox.setOnMapClickListener( point => {
            console.log(`>> Map clicked: ${JSON.stringify(point)}`);
            return true;
          });

          this.mapbox.setOnMapLongClickListener( point => {
            console.log(`>> Map longpressed: ${JSON.stringify(point)}`);
            return true;
          });

          this.mapbox.setOnScrollListener((point: LatLng) => {
            // console.log(`>> Map scrolled: ${JSON.stringify(point)}`);
          });

          this.mapbox.setOnFlingListener(() => {
            console.log(`>> Map flinged"}`);
          }).catch(err => console.log(err));
        },
        (error: string) => console.log("mapbox show error: " + error)
    );
  }

}

// END
