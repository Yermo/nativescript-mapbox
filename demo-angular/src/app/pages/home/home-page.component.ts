/**
* Mapbox NativeScript Angular Demo Home Page
*
* @author Yermo Lamers, Flying Brick Software, LLC
*/

import {
  Component,
  OnInit,
  OnDestroy
} from "@angular/core";

// for the side drawer

import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "@nativescript/core/application";

// for the alerts

import { RouterExtensions } from "@nativescript/angular";

import { openAppSettings } from "nativescript-advanced-permissions/core";

import {
  hasLocationPermissions,
  requestLocationPermissions,
  isLocationEnabled
} from "nativescript-advanced-permissions/location";

// the Mapbox access token and the Mapbox map style to use are set
// in the config.ts file.

import { SETTINGS } from "../../../../../mapbox_config";

// ------------------------------------------------------------------------------

/**
* Home Page - The Live Map
*
* This is the main page of the app that, when tracking, displays the current live ride.
*/

@Component({
    selector: "home-page",
    moduleId: module.id,
    templateUrl: "./home-page.component.html"
})
export class HomePageComponent implements OnInit, OnDestroy {

  settings: any = SETTINGS;

  locationPermission: boolean = false;

  eventHandlersRegistered: boolean = false;

  distanceSubscription: any;

  // -----------------------------------------------------

  constructor(
    private routerExtensions: RouterExtensions
  ) {
    console.log("HomePageComponent:constructor()");
  } // end of constructor

  // -----------------------------------------------------

  ngOnInit(): void {

    console.log("HomePageComponent:ngOnInit(): checking for location services.");

/** ----------------------------------------------------------------
* temporarily disabled

    if ( ! isLocationEnabled ) {

      dialogs.alert({
        title: "Location Error",
        message: "Location services are turned off on this device. Please go to settings and turn them on.",
        okButtonText: "OK",
      });

      return;
    }

    if ( hasLocationPermissions() ) {

      console.log( "HomePageComponent:ngOnInit(): we have location permissions." );

      this.locationPermission = true;

      return;

    }

    // it seems the hasPermission return value here is always true under Android.

    requestLocationPermissions( true, "We use this permission to show you your current location and to give you the ability to track your rides." ).then( ( hasPermission ) => {

      console.log( "HomePageComponent:ngOnInit(): hasPermission is:", hasPermission );

      if ( hasLocationPermissions() ) {

        console.log( "HomePageComponent:ngOnInit(): we have been granted location permissions." );

        this.locationPermission = true;

      } else {

        dialogs.alert({
          title: "Location Error",
          message: "This app will not be very useful without access to the current location",
          okButtonText: "OK",
        });

      }
    });

---------------------------------------------- */
  }

  // -------------------------------------------------

  /**
  * destroy
  *
  * @link https://docs.nativescript.org/angular/core-concepts/angular-navigation#custom-route-reuse-strategy
  */

  ngOnDestroy() {
  }

  // -----------------------------------------------------

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
  }
}

// END
