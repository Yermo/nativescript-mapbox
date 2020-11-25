/**
* Debug Service
*
* This services is a placeholder for some debugging facilities to help track down crashes and other issues.
*/

import { Injectable } from "@angular/core";

// ---------------------------------------------------------------

/**
* Debug Service
*/

@Injectable()
export class DebugService {

  counters: any = {};

  /**
  * constructor
  */

  constructor(
  ) {
  }

  // --------------------------------------------

  getCounter(key) {
    return this.counters[ key ];
  }

  // --------------------------------------------

  incrementCounter(key) {

    if (typeof this.counters[ key ] == "undefined") {
      this.counters[ key ] = 1;
    } else {
      this.counters[ key ]++;
    }

    return this.counters[ key ];

  }

} // END
