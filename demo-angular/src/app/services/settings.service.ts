/**
* Ionic Style settings service shim
*
* This service emulates ionic's get/set storage settings service.
*/

import { Injectable } from "@angular/core";

import {
  getBoolean,
  setBoolean,
  getNumber,
  setNumber,
  getString,
  setString,
  hasKey,
  remove,
  clear
} from "@nativescript/core/application-settings";

/**
* get/set JSON objects in storage
*
* This saves and restores applications settings and state in a fashion
* compatible with Ionic's Storage service.
*
* This saves key/value pairs into application settings and should be reserved
* for small bits of data.
*/

@Injectable()
export class SettingsService {

  constructor() {}

  // -----------------------------------------------------------------

  /**
  * given a key, return an object from storage
  */

  async get(key) {

    let reply;

    // console.log( "SettingsService:get(): attempting to get key '" + key + "' from storage" );

    const stringResult = getString(key);

    console.log("SettingsService:get(): got string result: '" + stringResult + "'");

    // we may have a JSON document or a bare value or nothing

    if ((typeof stringResult === "string") && (stringResult.charAt(0) == "{")) {
      reply = JSON.parse(stringResult);
    } else if (typeof stringResult == "undefined") {
      reply = null;
    } else {
      reply = stringResult;
    }

    // console.log( "SettingsService:get(): returning reply:", reply );

    return reply;

  } // end of get()

  // -------------------------------------------------------------------

  /**
  * set an object into the store.
  *
  * Sets an object into the store.
  *
  * Supports setting simple types and objects. Objects are JSON encoded.
  */

  async set(key, value) {

    let valueToSave;

    // console.log( "SettingsService:set(): attempting to save key '" + key + "' with value :", value );

    switch (typeof value) {

      case "string":

        valueToSave = value;

        break;

      case "boolean":
      case "number":

        valueToSave = String(value);

        break;

      case "object":

        valueToSave = JSON.stringify(value);

        break;

      default:

        throw new Error("Don't know how to save type of '" + typeof value + "' for key '" + key + "'");

        break;

    }

    setString(key, valueToSave);

    return true;
  }

  // -------------------------------------------------------------------

  /**
  * clear an entry in the data store
  */

  async remove(key) {
    remove(key);

    return true;
  }

} // END
