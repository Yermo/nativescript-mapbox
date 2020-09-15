import { Component, OnInit, OnChanges, OnDestroy } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { RouterExtensions } from "@nativescript/angular";

import * as app from "@nativescript/core/application";

@Component({
    selector: "plain-page",
    templateUrl: "./plain-page.component.html"
})
export class PlainPageComponent implements OnInit, OnChanges, OnDestroy {

  constructor(
    private routerExtensions: RouterExtensions
  ) {
        // Use the component constructor to inject providers.
  }

  ngOnInit(): void {
    console.log("PlainPageComponent::ngOnInit()");
  }

  ngOnChanges(): void {
    console.log("PlainPageComponent::ngOnChanges()");
  }

  ngOnDestroy(): void {
    console.log("PlainPageComponent::ngOnDestroy()");
  }

  onDrawerButtonTap(): void {
      const sideDrawer = <RadSideDrawer>app.getRootView();
      sideDrawer.showDrawer();
  }

  // -----------------------------------------------------

  goBack() {
    this.routerExtensions.backToPreviousPage();
  }

}
