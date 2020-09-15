
export class GeoUtils {

  /**
  * Is the current location within the given circle?
  *
  * @param {number} longitude to check
  * @param {number} latitude to check
  * @param {number} longitude center of circle
  * @param {number} latitude center of circle
  * @param {number} radius of circle in meters
  *
  * @return {boolean} true if the point is within the given geofence.
  *
  * @link https://stackoverflow.com/questions/24680247/check-if-a-latitude-and-longitude-is-within-a-circle-google-maps
  */

  static isLocationInCircle( lng, lat, circleLng, circleLat, circleRadius ) {

    let ky = 40000 / 360;
    let kx = Math.cos( Math.PI * circleLat / 180.0 ) * ky;
    let dx = Math.abs( circleLng - lng ) * kx;
    let dy = Math.abs( circleLat - lat ) * ky;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if ( distance < circleRadius / 1000 ) {
      return true;
    }

    return false;

  }

} // END
