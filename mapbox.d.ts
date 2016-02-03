declare module "nativescript-mapbox" {

    /**
     * The allowed values for show.style
     */
    enum MapStyle {
      DARK,
      EMERALD,
      HYBRID,
      LIGHT,
      SATELLITE,
      STREETS
    }

    export interface LatLng {
      lat: number;
      lng: number;
    }

    export interface AddPolygonOptions {
      points: LatLng[];
    }

    export interface AddMarkersOption extends LatLng {
      title?: string;
      subtitle?: string;
    }

    export interface SetZoomLevelOptions {
      level: number;
      animated: boolean;
    }

    export interface SetTiltOptions {
      /**
       * default 30 (degrees)
       */
      pitch: number;
      /**
       * default 5000 (milliseconds)
       */
      duration: number;
    }

    export interface ShowOptionsMargins {
      left?: number;
      right?: number;
      top?: number;
      bottom?: number;
    }

    /**
     * The options object passed into the show function.
     */
    export interface ShowOptions {
      accessToken: string;
      /**
       * default 'streets'
       */
      style?: MapStyle;
      margins?: ShowOptionsMargins;
      center?: LatLng;
      /**
       * default 0 (which is almost the entire planet)
       */
      zoomLevel?: number;
      /**
       * default false (true requires adding `NSLocationWhenInUseUsageDescription` or `NSLocationAlwaysUsageDescription` to the .plist)
       */
      showUserLocation?: boolean;
      /**
       * default false (required for the 'starter' plan)
       */
      hideLogo?: boolean;
      /**
       * default true
       */
      hideAttribution?: boolean;
      /**
       * default false
       */
      hideCompass?: boolean;
      /**
       * default false
       */
      disableRotation?: boolean;
      /**
       * default false
       */
      disableScroll?: boolean;
      /**
       * default false
       */
      disableZoom?: boolean;
      /**
       * default false
       */
      disableTilt?: boolean;
    }

    export interface AnimateCameraOptions {
      target: LatLng;
      /**
       * For Android, 0.0 - 20.0
       */
      zoomLevel?: number;
      /**
       * For iOS, in meters from the ground
       */
      altitude?: number;
      bearing?: number;
      tilt?: number;
      duration?: number;
    }

    export function show(options: ShowOptions): Promise<any>;
    export function hide(): Promise<any>;
    export function addMarkers(markers: AddMarkersOption[]): Promise<any>;
    export function setCenter(arg: LatLng): Promise<any>;
    export function getCenter(): Promise<LatLng>;
    export function setZoomLevel(arg: SetZoomLevelOptions): Promise<any>;
    export function getZoomLevel(): Promise<number>;
    export function setTilt(arg: SetTiltOptions): Promise<any>;
    export function getTilt(): Promise<number>;
    export function addPolygon(arg: AddPolygonOptions): Promise<any>;
    export function animateCamera(arg: AnimateCameraOptions): Promise<any>;
    export function requestFineLocationPermission(): Promise<any>;
    export function hasFineLocationPermission(): Promise<boolean>;
}