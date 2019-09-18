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

    onNavItemTap(navItemRoute: string): void {

        console.log( "AppComponent:onNavItemTap(): routing to '" + navItemRoute + "'" );

        this.routerExtensions.navigate([navItemRoute], {
          transition: {
            name: "fade"
          }
        });

        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.closeDrawer();
    }

} // END


