/**
* Ionic Event API Implementation
*
* This is an implementation of the Ionic Angular Event publish/subscribe API.
*
* @link https://github.com/ionic-team/ionic/blob/master/angular/src/providers/events.ts
*/

import { Injectable } from "@angular/core";

export type EventHandler = (...args: Array<any>) => any;

@Injectable({
  providedIn: "root"
})
export class EventsService {

  private c = new Map<string, Array<EventHandler>>();

  // -----------------------------------------------------------------------------------

  /**
   * Subscribe to an event topic. Events that get posted to that topic will trigger the provided handler.
   *
   * @param topic the topic to subscribe to
   * @param handler the event handler
   */

  subscribe(topic: string, ...handlers: Array<EventHandler>) {

    console.log("EventsService:subscribe(): subscribing to topic '" + topic + "'");

    let topics = this.c.get(topic);
    if (!topics) {
      this.c.set(topic, topics = []);
    }
    topics.push(...handlers);

    console.log("EventsService:subscribe(): there are now '" + topics.length + "' subscriptions to '" + topic + "'");

  }

  // ---------------------------------------------------------------------------------------

  /**
   * Unsubscribe from the given topic. Your handler will no longer receive events published to this topic.
   *
   * @param topic the topic to unsubscribe from
   * @param handler the event handler
   *
   * @return true if a handler was removed
   */

  unsubscribe(topic: string, handler?: EventHandler): boolean {
    if (!handler) {
      return this.c.delete(topic);
    }

    const topics = this.c.get(topic);
    if (!topics) {
      return false;
    }

    // We need to find and remove a specific handler
    const index = topics.indexOf(handler);

    if (index < 0) {
      // Wasn't found, wasn't removed
      return false;
    }
    topics.splice(index, 1);
    if (topics.length === 0) {
      this.c.delete(topic);
    }
    return true;
  }

  // -------------------------------------------------------------------------
  /**
   * Publish an event to the given topic.
   *
   * @param topic the topic to publish to
   * @param eventData the data to send as the event
   */

  publish(topic: string, ...args: Array<any>): Array<any> | null {

    const topics = this.c.get(topic);
    if (!topics) {

      console.log("EventsService:publish(): no subscribers for topic '" + topic + "'");

      return null;
    }

    console.log("EventsService:publish(): publishing topic '" + topic + "' to '" + topics.length + "' subscribers.");

    return topics.map((handler) => {
      try {
        return handler(...args);
      } catch (e) {
        console.error(e);
        return null;
      }
    });
  }

}

// END
