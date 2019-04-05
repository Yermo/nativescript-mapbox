import { AndroidFragmentCallbacks, setFragmentClass } from "tns-core-modules/ui/frame";

const ACCESS_TOKEN : any = 'ACCESS_TOKEN_HERE';

const mapStyle = com.mapbox.mapboxsdk.maps.Style.LIGHT;

import { getViewById } from "tns-core-modules/ui/core/view";
import { View } from "tns-core-modules/ui/core/view";
import { ContentView } from "tns-core-modules/ui/content-view";

import * as frame from "tns-core-modules/ui/frame";
import * as utils from "tns-core-modules/utils/utils";

import * as application from "tns-core-modules/application";

declare const android, com, java, org;

export class MapFragment extends android.support.v4.app.Fragment {

    // This field is updated in the frame module upon `new` (although hacky this eases the Fragment->callbacks association a lot)

    private _callbacks: AndroidFragmentCallbacks;

    private mapView: any;

    // ------------------------------------------------------------------------

    public onHiddenChanged(hidden: boolean): void {
        this._callbacks.onHiddenChanged(this, hidden, super.onHiddenChanged);

        console.log( "MapFragment::onHiddenChanged()" );

    }

    // ------------------------------------------------------------------------

    public onCreate( savedInstanceState: android.os.Bundle ) {

      console.log( "MapFragment::onCreate() super is", super.onCreate );

      super.onCreate( savedInstanceState );

    application.android.on( application.AndroidApplication.activityPausedEvent, ( args: application.AndroidActivityEventData ) => {

      console.log( "ONCREATE:: activityPausedEvent Event: " + args.eventName + ", Activity: " + args.activity);

      if ( this.mapView ) {

        console.log( "ONCREATE: calling onPause()" );

        this.mapView.onPause();
      }

    });

    application.android.on( application.AndroidApplication.activityResumedEvent, ( args: application.AndroidActivityEventData ) => {

      console.log( "ONCREATE: activityResumedEvent Event: " + args.eventName + ", Activity: " + args.activity);

      if ( this.mapView ) {

        console.log( "ONCREATE: calling onResume()" );

        this.mapView.onResume();
      }

    });


    }

    // ---------------------------------------------

    public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle) {

      console.log( "MapFragment::onCreateView()" );

      let result = super.onCreateView( inflater, container, savedInstanceState );

      console.log( "MapFragment::onCreateView() after super" );

      com.mapbox.mapboxsdk.Mapbox.getInstance( application.android.context, ACCESS_TOKEN );

      console.log( "MapFragment::onCreate(): after getInstance()" );

      // map options.

      const mapboxMapOptions = new com.mapbox.mapboxsdk.maps.MapboxMapOptions()
        .compassEnabled(false)
        .rotateGesturesEnabled(false)
        .scrollGesturesEnabled(true)
        .tiltGesturesEnabled(true)
        .zoomGesturesEnabled(true)
        .attributionEnabled(true)
        .logoEnabled(true);

      const cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
        .zoom( 12 )
        .target(new com.mapbox.mapboxsdk.geometry.LatLng( 39.007846, -76.947041 ));
  
      mapboxMapOptions.camera( cameraPositionBuilder.build() );

      console.log( "MapFragment::onCreate(): after mapboxMapOptions()" );

      this.mapView = new com.mapbox.mapboxsdk.maps.MapView(
//        application.android.context,
        this.getContext(),
        mapboxMapOptions 
      );

      console.log( "MapFragment::onCreate(): after MapView()" );

      this.mapView.onCreate( savedInstanceState ); 

      console.log( "MapFragment::onCreate(): after this.mapView.onCreate( savedInstanceState )" );

      // modelled after mapbox.android.ts in the Nativescript-Mapbox plugin.

      this.mapView.getMapAsync(
        new com.mapbox.mapboxsdk.maps.OnMapReadyCallback({
          onMapReady: mapboxMap => {

            console.log( "MapFragment::onMapReady()");

            this.mapView.addOnDidFinishLoadingStyleListener(
              new com.mapbox.mapboxsdk.maps.MapView.OnDidFinishLoadingStyleListener({
                onDidFinishLoadingStyle : style => {

                  console.log( "MapFragment::onMapReady(): style loaded" );

                }
              })
            );

            let builder = new com.mapbox.mapboxsdk.maps.Style.Builder();

            const Style = com.mapbox.mapboxsdk.constants.Style;

            mapboxMap.setStyle( 
              builder.fromUrl( mapStyle )
            );

          return( { android: this.mapView } );

          } 
        })
      );

      console.log( "MapFragment::onCreate(): after getMapAsync()" );

        const density = utils.layout.getDisplayDensity();

        console.log( "MapFragment::onCreate(): after getDisplayDensity()" );

        const left = 5 * density;
        const right = 5 * density;
        const top = 5 * density;
        const bottom = 5 * density;

        // FIXME: it's a full screen map overwriting the other content because I don't know
        // how to add the mapView to the contentView dynamically.

        const viewWidth = 700;
        const viewHeight = 1000;

        console.log( "MapFragment::onCreate(): contentView width '" + viewWidth + "' height '" + viewHeight + "'" );

        let params = new android.widget.FrameLayout.LayoutParams( viewWidth - left - right, viewHeight - top - bottom );

        console.log( "MapFragment::onCreate(): after LayoutParams()" );

        params.setMargins(left, top, right, bottom);
        this.mapView.setLayoutParams( params );

        this.mapView.setId( android.view.View.generateViewId() ); 

        console.log( "MapFragment::onCreate(): after setLayoutParams()" );

        let frameLayout = new android.widget.FrameLayout( this.getContext() );
        frameLayout.setId( android.view.View.generateViewId() ); 

        frameLayout.addView( this.mapView );

        container.addView( frameLayout );

        console.log( "MapFragment::onCreate(): after addView" );

//        return frameLayout;

    }

    // ----------------------------------------------

    public onSaveInstanceState( outState: android.os.Bundle ) {

        console.log( "MapFragment::onSaveInstanceState()" );

        super.onSaveInstanceState( outState );

        this.mapView.onSaveInstanceState( outState );

    }

    // -------------------------------------------------------

    public onPause(): void {

        console.log( "MapFragment::onStop()" );

        super.onPause();

        this.mapView.onPause();
    }

    // -------------------------------------------------------

    public onResume(): void {

        console.log( "MapFragment::onResume()" );

        super.onResume();

        this.mapView.onResume();
    }

    // -------------------------------------------------------

    public onStart(): void {

        console.log( "MapFragment::onStart()" );

        super.onStart();

        this.mapView.onStart();
    }

    // -------------------------------------------------------

    public onStop(): void {

        console.log( "MapFragment::onStop()" );

        super.onStop();

        this.mapView.onStop();
    }
  
    // ----------------------------------------------------

    public onDestroyView() {

        console.log( "MapFragment::onDestroyView()" );

        super.onDestroyView();
    }

    // -----------------------------------------------------

    public onDestroy() {

      console.log( "MapFragment::onDestroy()" );

      super.onDestroy();

      this.mapView.onDestroy();

    }

}

setFragmentClass(MapFragment);
