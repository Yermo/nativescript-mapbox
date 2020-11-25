import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "@nativescript/angular";
import { Routes } from "@angular/router";

import { HomePageComponent } from "./pages/home/home-page.component";
import { TestPageComponent } from "./pages/test/test-page.component";
import { PlainPageComponent } from "./pages/plain/plain-page.component";
import { TestNoDestroyPageComponent } from "./pages/test-no-destroy/test-no-destroy-page.component";
import { ToggleMapTestPageComponent } from "./pages/toggle-map-test/toggle-map-test-page.component";

const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: HomePageComponent },
    { path: "test-crash", component: TestPageComponent },
    { path: "plain", component: PlainPageComponent },
    { path: "test-no-destroy", component: TestNoDestroyPageComponent },
    { path: "toggle-map-test", component: ToggleMapTestPageComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
