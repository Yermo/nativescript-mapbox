import * as application from 'tns-core-modules/application';

import { BundleKludge } from "nativescript-mapbox";

application.android.on( application.AndroidApplication.activityCreatedEvent, function (args: application.AndroidActivityBundleEventData ) {
  console.log( "app.ts: activityCreatedEvent Event: " + args.eventName + ", Activity: " + args.activity + ", Bundle: " + args.bundle);

  BundleKludge.bundle = args.bundle;

}); 

application.start({ moduleName: "main-page" });
