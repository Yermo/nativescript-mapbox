/**
* Drawer Support
*
* The angular demo of the mapbox API is based on the side drawer sample app.
*/

import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { RouterExtensions } from "@nativescript/angular";
import { DrawerTransitionBase, RadSideDrawer, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";
import { filter } from "rxjs/operators";

import * as app from "@nativescript/core/application";

import { EventsService } from "./services/events.service";
import { DebugService } from "./services/debug.service";

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

        console.log("AppComponent::onNavItemTap(): '" + navItemRoute + "' ---- '" + this.debugService.incrementCounter(navItemRoute));

        this.routerExtensions.navigate([navItemRoute], {
          transition: {
            name: "fade"
          }
        });

        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.closeDrawer();
    }

} // END
