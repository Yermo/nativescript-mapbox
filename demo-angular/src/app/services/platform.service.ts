/**
* a convenience NativeScript shim to approximate the Ionic Platform Service
*/

import { Injectable } from "@angular/core";

import {
  ios,
  android,
  displayedEvent,
  exitEvent,
  launchEvent,
  lowMemoryEvent,
  orientationChangedEvent,
  resumeEvent,
  suspendEvent,
  uncaughtErrorEvent,
  ApplicationEventData,
  LaunchEventData,
  OrientationChangedEventData,
  UnhandledErrorEventData,
  on as applicationOn,
  run as applicationRun
} from "@nativescript/core/application";

import { EventsService } from "./events.service";

import { Subject } from "rxjs/Subject";

// ----------------------------------------------------------------------------------------------

/**
* Platform shim.
*
* This service is primarily used to avoid trying to update the UI when the app is paused.
*
* @event platform:pause
* @event platform:resume
*/

@Injectable()
export class PlatformService {

  paused: boolean;

  /**
  * platform service ready promise
  */

  readyPromise: Promise<any>;

  readyPromiseResolver: any;

  // ----------------------------------------------------------------------

  /**
  * constructor
  *
  * @link https://docs.nativescript.org/core-concepts/application-lifecycle
  */

  constructor(
    private events: EventsService
  ) {

    this.readyPromise = new Promise((resolve, reject) => {
      this.readyPromiseResolver = resolve;
    });

    // on application launch.

    applicationOn(launchEvent, (args: LaunchEventData) => {
      if (args.android) {

        // For Android applications, args.android is an android.content.Intent class.

        console.log("PlatformService:constructor(): Launched Android application with the following intent: " + args.android + ".");

      } else if (args.ios !== undefined) {

        // For iOS applications, args.ios is NSDictionary (launchOptions).

        console.log("PlatformService:constructor(): Launched iOS application with options: " + args.ios);

      }

      this.events.publish("platform:launched", {});

    });

    // on application suspend.

    applicationOn(suspendEvent, (args: ApplicationEventData) => {

      if (args.android) {

        // For Android applications, args.android is an android activity class.

        console.log("PlatformService:constructor(): Activity suspend: " + args.android);

      } else if (args.ios) {

        // For iOS applications, args.ios is UIApplication.
        console.log("PlatformService:constructor(): UIApplication suspend: " + args.ios);

      }

      this.paused = true;

      this.events.publish("platform:pause", {});

    });

    // on application resume

    applicationOn(resumeEvent, (args: ApplicationEventData) => {

      if (args.android) {

        // For Android applications, args.android is an android activity class.
        console.log("PlatformService:constructor(): Activity resume: " + args.android);

      } else if (args.ios) {

        // For iOS applications, args.ios is UIApplication.
        console.log("PlatformService:constructor(): UIApplication resume: " + args.ios);

      }

      this.paused = false;

      this.events.publish("platform:resume", {});

    });

    applicationOn(displayedEvent, (args: ApplicationEventData) => {
      console.log("PlatformService:constructor(): displayedEvent");
      this.events.publish("platform:displayed", {});
    });

    applicationOn(orientationChangedEvent, (args: OrientationChangedEventData) => {
      // "portrait", "landscape", "unknown"
      console.log(args.newValue);
    });

    applicationOn(exitEvent, (args: ApplicationEventData) => {
      if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("PlatformService:constructor(): Activity exit: " + args.android);
      } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("PlatformService:constructor(): UIApplication exit: " + args.ios);
      }

      this.events.publish("platform:exit", {});

    });

    applicationOn(lowMemoryEvent, (args: ApplicationEventData) => {
      if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("PlatformService:constructor(): Activity low memory: " + args.android);
      } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("PlatformService:constructor(): UIApplication low memory: " + args.ios);
      }

      this.events.publish("platform:lowmemory", {});

    });

    applicationOn(uncaughtErrorEvent, function(args: UnhandledErrorEventData) {
      console.log("PlatformService:constructor(): Error: " + args.error);
    });

  } // end of constructor

  // ------------------------------------------------------------------

  /**
  * declare the platform ready
  *
  * FIXME: We're simulating an Ionic style platform here. This method needs
  * to be called from the angular app component.
  */

  declareReady() {

    this.readyPromiseResolver(true);

    this.events.publish("platform:ready", {});

  }

  // ------------------------------------------------------------------

  /**
  * return the platform ready promise
  */

  ready() {
    return this.readyPromise;
  }

  // ------------------------------------------------------------------

  /**
  * whether we are android or ios
  */

  is(platformName: string) {

    switch (platformName) {

      case "ios" :
        return ios;
        break;

      case "android":
        return android;
        break;

      default:
        throw new Error("unsupported platform");
        break;
    }
  }
  // ------------------------------------------------------------------

  isPaused() {
    return this.paused;
  }

} // END
