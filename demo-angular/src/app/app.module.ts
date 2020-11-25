import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "@nativescript/angular";

// So the RadSideDrawer will work

import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MapComponent } from "./components/map/map.component";
import { HomePageComponent } from "./pages/home/home-page.component";
import { TestPageComponent } from "./pages/test/test-page.component";
import { PlainPageComponent } from "./pages/plain/plain-page.component";
import { TestNoDestroyPageComponent } from "./pages/test-no-destroy/test-no-destroy-page.component";
import { ToggleMapTestPageComponent } from "./pages/toggle-map-test/toggle-map-test-page.component";

import { EventsService } from "./services/events.service";
import { PlatformService } from "./services/platform.service";
import { SettingsService } from "./services/settings.service";
import { DebugService } from "./services/debug.service";

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "@nativescript/angular";

// Uncomment and add to NgModule imports if you need to use the HttpClient wrapper
// import { NativeScriptHttpClientModule } from "@nativescript/angular";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptUISideDrawerModule
    ],
    declarations: [
        AppComponent,
        MapComponent,
        HomePageComponent,
        TestPageComponent,
        PlainPageComponent,
        TestNoDestroyPageComponent,
        ToggleMapTestPageComponent
    ],
    providers: [
      EventsService,
      PlatformService,
      SettingsService,
      DebugService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }
