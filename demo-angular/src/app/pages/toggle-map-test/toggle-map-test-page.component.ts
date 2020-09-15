/**
* Toggle Destroy/Recreate Map test
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

import { RouterExtensions } from "@nativescript/angular";

import { EventsService } from "../../services/events.service";
import { DebugService } from "../../services/debug.service";

// the Mapbox access token and the Mapbox map style to use are set
// in the mapbox_config.ts file.

import { SETTINGS } from "../../../../../mapbox_config";

// ------------------------------------------------------------------------------

/**
* Toggle Map test.
*
* This toggles creating/destroying the map.
*/

@Component({
    selector: "toggle-map-test-page",
    moduleId: module.id,
    templateUrl: "./toggle-map-test-page.component.html"
})
export class ToggleMapTestPageComponent implements OnInit, OnDestroy {

  settings: any = SETTINGS;

  shown: boolean = true;

  // -----------------------------------------------------

  constructor(
    private routerExtensions: RouterExtensions,
    private eventsService: EventsService,
    private debugService: DebugService
  ) {
    console.log("ToggleMapTestPageComponent:constructor()");
  } // end of constructor

  // -----------------------------------------------------

  ngOnInit(): void {
  }

  // -------------------------------------------------

  toggleMapDestroy() {

    if (! this.shown) {
      console.log("ToggleMapTestPageComponent::toggleMap(): ------ toggle map '" + this.debugService.incrementCounter("mapToggleDestroy"));

      this.eventsService.publish("destroyMap", { mapId : "toggleTest" });

    }

    this.shown = ! this.shown;

  }

  // -------------------------------------------------

  toggleMap() {

    if (! this.shown) {
      console.log("ToggleMapTestPageComponent::toggleMap(): ------ toggle map '" + this.debugService.incrementCounter("mapToggle"));
    }

    this.shown = ! this.shown;

  }

  // -------------------------------------------------

  /**
  * destroy
  *
  * @link https://docs.nativescript.org/angular/core-concepts/angular-navigation#custom-route-reuse-strategy
  */

  ngOnDestroy() {

    console.log("ToggleMapTestPageComponent::ngOnDestroy()");

  }

  // -----------------------------------------------------

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
  }
}

// END
