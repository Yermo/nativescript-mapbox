import { Component, OnInit, OnDestroy } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { RouterExtensions } from "@nativescript/angular";

import * as app from "@nativescript/core/application";

@Component({
    selector: "test-page",
    templateUrl: "./test-page.component.html"
})
export class TestPageComponent implements OnInit, OnDestroy {

  constructor(
    private routerExtensions: RouterExtensions
  ) {
        // Use the component constructor to inject providers.
  }

  ngOnInit(): void {
    console.log("TestPageComponent::ngOnInit()");
  }

  ngOnDestroy(): void {
    console.log("TestPageComponent::ngOnDestroy()");
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
