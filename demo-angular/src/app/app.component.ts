/**
* Drawer Support
*
* The angular demo of the mapbox API is based on the side drawer sample app.
*/

import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { DrawerTransitionBase, RadSideDrawer, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";
import { filter } from "rxjs/operators";

import * as app from "tns-core-modules/application";

import { isAndroid, isIOS } from "tns-core-modules/platform";

import { EventsService } from './services/events.service';
import { DebugService } from './services/debug.service';

// ---------------------------------------------------------------------------

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent implements OnInit {
    private _activatedUrl: string;
    private _sideDrawerTransition: DrawerTransitionBase;

    constructor(
      private router: Router, 
      private routerExtensions: RouterExtensions,
      private eventsService: EventsService,
      private debugService: DebugService
    ) {
    }

    // ---------------------------------------------------------------------------

    async ngOnInit() {

        this._activatedUrl = "/home";
        this._sideDrawerTransition = new SlideInOnTopTransition();

        this.router.events
        .pipe(filter((event: any) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => this._activatedUrl = event.urlAfterRedirects);

    }

    // ----------------------------------------------------------------------------------------

    get sideDrawerTransition(): DrawerTransitionBase {
        return this._sideDrawerTransition;
    }

    // ----------------------------------------------------------------------------------------

    isComponentSelected(url: string): boolean {
        return this._activatedUrl === url;
    }

    // ----------------------------------------------------------------------------------------

    /**
    * Navigate to the named route.
    *
    * @see MapComponent
    *
    * @link https://github.com/NativeScript/android-runtime/issues/1487
    * @link https://github.com/NativeScript/NativeScript/issues/7954
    * @link https://github.com/NativeScript/NativeScript/issues/7867
    *
    * @todo I could not get the Page events to work the way I expected in map.component so I'm using my own events here.
    */

    onNavItemTap(navItemRoute: string): void {

        console.log( "AppComponent:onNavItemTap(): routing to '" + navItemRoute + "'" );

	// I am leaving this here for posterity. It was a red herring trying to track down an intermittent
	// crash bug on Android. I originally thought it might be due to a race condition.
	//
	// While it's probably not necessary, I still like the idea of waiting until the map is completely destroyed before navigating.
	//
	// The intermittent crash on navigation under Android turns out to be a markingMode:"none" bug in
	// tns-core-modules (as of 6.1.1) and has been a long standing bug.
	//
	// Historical:
	// 
        // In an attempt to work around the intermittent NativeScript/Mapbox/Plugin/DunnoWhatsCausingit?? crash
        // the map.component listens to the destroyMap event. It hides the container
        // of the Mapbox tag which in turns causes the MapboxView.disposeNativeView() method to be called 
        // in the plugin which then calls destroy() that calls into the Native Android SDK onDestroy method.
        //
        // Once the Mapbox onDestroy method returns, the onMapDestroyed() callback specified here is called.
        // In this way we can be sure the map is completely dead before proceeding. 

        if ( navItemRoute == '/test-crash' ) {

          // The idea here is we want to wait until we've gotten confirmation that the map component
          // has been destroyed.

          console.log( "AppComponent::onNavItemTap() publishing destroyMap event." );

          this.eventsService.publish( 'destroyMap', { 
            mapId : 'mainMap', 

            // see components/map.component.ts. Once the map is destroyed it calls this method.

            onMapDestroyed: () => {

              console.log( "AppComponent::onNavItem() - onMapDestroyed callback" );

              setTimeout( () => {
                this.routerExtensions.navigate([navItemRoute], {
                  transition: {
                    name: "fade"
                  }
                });

                const sideDrawer = <RadSideDrawer>app.getRootView();
                sideDrawer.closeDrawer();

                console.log( "AppComponent::onNavItemTap(): after onMapDestroyed event '" + navItemRoute + "' ---- '" + this.debugService.incrementCounter( navItemRoute ) );

              }, 100 );

            }
          });

          return;

        }

        console.log( "AppComponent::onNavItemTap(): '" + navItemRoute + "' ---- '" + this.debugService.incrementCounter( navItemRoute ) );

        this.routerExtensions.navigate([navItemRoute], {
          transition: {
            name: "fade"
          }
        });

        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.closeDrawer();
    }

} // END


