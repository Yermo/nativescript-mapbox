import { 
  Component, 
  OnInit, 
  OnDestroy,
  ViewChild 
} from "@angular/core";

import { 
  RadSideDrawer 
} from "nativescript-ui-sidedrawer";

import { 
  RouterExtensions 
} from "nativescript-angular/router";

import * as app from "tns-core-modules/application";

import {
  MapComponent
} from '../../components/map/map.component';

// the Mapbox access token and the Mapbox map style to use are set
// in the config.ts file.

import { SETTINGS } from '../../../../../mapbox_config';

// ---------------------------------------------------------------------------------

@Component({
    selector: "test-source",
    templateUrl: "./test-source-page.component.html"
})
export class TestSourcePageComponent implements OnInit, OnDestroy {

  settings : any = SETTINGS;

  @ViewChild( 'map', { static : true } ) mapComponent : MapComponent;

  constructor(
    private routerExtensions: RouterExtensions,
  ) {
  }

  // ----------------------------------------------------------------------

  async ngOnInit() {
    console.log( "TestSourcePageComponent::ngOnInit()" );

    // wait for the map to be ready before attempting to draw on it.

    await this.mapComponent.ready();

    this.addTestCircle();

  }

  // --------------------------------------------------------------------

  ngOnDestroy(): void {
    console.log( "TestSourcePageComponent::ngOnDestroy()" );
  }

  onDrawerButtonTap(): void {
      const sideDrawer = <RadSideDrawer>app.getRootView();
      sideDrawer.showDrawer();
  }

  // ---------------------------------------------------------------------------------------

  addTestCircle() {

    console.log( "MapComponent:addTestCircle(): Adding test circle" );

    // if not already created, add a geojson source for the circle.

    if ( ! this.mapComponent.mapboxView.getSource( 'circle-source' ) ) {

      let sourceData = {
        "type": "geojson",
        "data": {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [ -76.947041, 39.007846 ]
          }
        }
      };

      this.mapComponent.mapboxView.addSource( 'circle-source', sourceData );

    }

    const metersToPixelsAtMaxZoom = ( radius, latitude ) => radius / 0.075 / Math.cos( latitude * Math.PI / 180);    
    const pixels = metersToPixelsAtMaxZoom( 500,  39.007846 ); 

    let style = {
      "id": 'testCircle',
      "type": 'circle',
      "circle-radius": 250,
      "source": "circle-source",
      "paint": {
        "circle-radius": {
          "stops": [
            [0, 0],
            [20, pixels ]
          ],
          "base": 2
        },
        'circle-opacity': 0.05,
        'circle-color': '#ed6498',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ed6498'
      } 
    };

    this.mapComponent.mapboxView.addLayer( 
      style
    ).catch( ( error ) => {
      console.error("TestSourcePageComponent:addTestCircle(): addTestCircle threw an error:", error );
    });

    this.mapComponent.mapboxView.onMapEvent( 'click', 'testCircle', ( point ) => {

      console.log( "MapComponent:addTestCircle(): circle clicked" );

      // mandatory

      return true;

    });

  }

  // -----------------------------------------------------

  public goBack() {
    this.routerExtensions.backToPreviousPage();
  }

}
