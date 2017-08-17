
declare class MGLAccountManager extends NSObject {

	static accessToken(): string;

	static alloc(): MGLAccountManager; // inherited from NSObject

	static mapboxMetricsEnabledSettingShownInApp(): boolean;

	static new(): MGLAccountManager; // inherited from NSObject

	static setAccessToken(accessToken: string): void;
}

interface MGLAnnotation extends NSObjectProtocol {

	coordinate: CLLocationCoordinate2D;

	subtitle?: string;

	title?: string;
}
declare var MGLAnnotation: {

	prototype: MGLAnnotation;
};

declare class MGLAnnotationImage extends NSObject implements NSSecureCoding {

	static alloc(): MGLAnnotationImage; // inherited from NSObject

	static annotationImageWithImageReuseIdentifier(image: UIImage, reuseIdentifier: string): MGLAnnotationImage;

	static new(): MGLAnnotationImage; // inherited from NSObject

	enabled: boolean;

	image: UIImage;

	readonly reuseIdentifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare const enum MGLAnnotationVerticalAlignment {

	Center = 0,

	Top = 1,

	Bottom = 2
}

declare class MGLAnnotationView extends UIView implements NSSecureCoding {

	static alloc(): MGLAnnotationView; // inherited from NSObject

	static appearance(): MGLAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MGLAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MGLAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): MGLAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MGLAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): MGLAnnotationView; // inherited from UIAppearance

	static new(): MGLAnnotationView; // inherited from NSObject

	annotation: MGLAnnotation;

	centerOffset: CGVector;

	readonly dragState: MGLAnnotationViewDragState;

	draggable: boolean;

	enabled: boolean;

	readonly reuseIdentifier: string;

	rotatesToMatchCamera: boolean;

	scalesWithViewingDistance: boolean;

	selected: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { annotation: MGLAnnotation; reuseIdentifier: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { reuseIdentifier: string; });

	encodeWithCoder(aCoder: NSCoder): void;

	initWithAnnotationReuseIdentifier(annotation: MGLAnnotation, reuseIdentifier: string): this;

	initWithCoder(aDecoder: NSCoder): this;

	initWithReuseIdentifier(reuseIdentifier: string): this;

	prepareForReuse(): void;

	setDragStateAnimated(dragState: MGLAnnotationViewDragState, animated: boolean): void;

	setSelectedAnimated(selected: boolean, animated: boolean): void;
}

declare const enum MGLAnnotationViewDragState {

	None = 0,

	Starting = 1,

	Dragging = 2,

	Canceling = 3,

	Ending = 4
}

declare class MGLAttributionInfo extends NSObject {

	static alloc(): MGLAttributionInfo; // inherited from NSObject

	static new(): MGLAttributionInfo; // inherited from NSObject

	URL: NSURL;

	feedbackLink: boolean;

	title: NSAttributedString;

	constructor(o: { title: NSAttributedString; URL: NSURL; });

	feedbackURLAtCenterCoordinateZoomLevel(centerCoordinate: CLLocationCoordinate2D, zoomLevel: number): NSURL;

	initWithTitleURL(title: NSAttributedString, URL: NSURL): this;
}

declare class MGLBackgroundStyleLayer extends MGLStyleLayer {

	static alloc(): MGLBackgroundStyleLayer; // inherited from NSObject

	static new(): MGLBackgroundStyleLayer; // inherited from NSObject

	backgroundColor: MGLStyleValue<UIColor>;

	backgroundColorTransition: MGLTransition;

	backgroundOpacity: MGLStyleValue<number>;

	backgroundOpacityTransition: MGLTransition;

	backgroundPattern: MGLStyleValue<string>;

	backgroundPatternTransition: MGLTransition;

	constructor(o: { identifier: string; });

	initWithIdentifier(identifier: string): this;
}

interface MGLCalloutView extends NSObjectProtocol {

	anchoredToAnnotation?: boolean;

	delegate: MGLCalloutViewDelegate;

	dismissesAutomatically?: boolean;

	leftAccessoryView: UIView;

	representedObject: MGLAnnotation;

	rightAccessoryView: UIView;

	dismissCalloutAnimated(animated: boolean): void;

	presentCalloutFromRectInViewConstrainedToViewAnimated(rect: CGRect, view: UIView, constrainedView: UIView, animated: boolean): void;
}
declare var MGLCalloutView: {

	prototype: MGLCalloutView;
};

interface MGLCalloutViewDelegate extends NSObjectProtocol {

	calloutViewDidAppear?(calloutView: UIView): void;

	calloutViewShouldHighlight?(calloutView: UIView): boolean;

	calloutViewTapped?(calloutView: UIView): void;

	calloutViewWillAppear?(calloutView: UIView): void;
}
declare var MGLCalloutViewDelegate: {

	prototype: MGLCalloutViewDelegate;
};

declare class MGLCameraStyleFunction<T> extends MGLStyleFunction<T> {

	static alloc<T>(): MGLCameraStyleFunction<T>; // inherited from NSObject

	static functionWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLCameraStyleFunction<T>; // inherited from MGLStyleFunction

	static functionWithInterpolationModeStopsOptions<T>(interpolationMode: MGLInterpolationMode, stops: NSDictionary<any, MGLStyleValue<T>>, options: NSDictionary<string, any>): MGLCameraStyleFunction<T>;

	static functionWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLCameraStyleFunction<T>; // inherited from MGLStyleFunction

	static new<T>(): MGLCameraStyleFunction<T>; // inherited from NSObject

	static valueWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLCameraStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCameraStopsOptions<T>(interpolationMode: MGLInterpolationMode, cameraStops: NSDictionary<any, MGLStyleValue<T>>, options: NSDictionary<string, any>): MGLCameraStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCompositeStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, compositeStops: NSDictionary<any, NSDictionary<any, MGLStyleValue<T>>>, attributeName: string, options: NSDictionary<string, any>): MGLCameraStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeSourceStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, sourceStops: NSDictionary<any, MGLStyleValue<T>>, attributeName: string, options: NSDictionary<string, any>): MGLCameraStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithRawValue<T>(rawValue: T): MGLCameraStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLCameraStyleFunction<T>; // inherited from MGLStyleValue
}

declare const enum MGLCircleScaleAlignment {

	Map = 0,

	Viewport = 1
}

declare class MGLCircleStyleLayer extends MGLVectorStyleLayer {

	static alloc(): MGLCircleStyleLayer; // inherited from NSObject

	static new(): MGLCircleStyleLayer; // inherited from NSObject

	circleBlur: MGLStyleValue<number>;

	circleBlurTransition: MGLTransition;

	circleColor: MGLStyleValue<UIColor>;

	circleColorTransition: MGLTransition;

	circleOpacity: MGLStyleValue<number>;

	circleOpacityTransition: MGLTransition;

	circleRadius: MGLStyleValue<number>;

	circleRadiusTransition: MGLTransition;

	circleScaleAlignment: MGLStyleValue<NSValue>;

	circleStrokeColor: MGLStyleValue<UIColor>;

	circleStrokeColorTransition: MGLTransition;

	circleStrokeOpacity: MGLStyleValue<number>;

	circleStrokeOpacityTransition: MGLTransition;

	circleStrokeWidth: MGLStyleValue<number>;

	circleStrokeWidthTransition: MGLTransition;

	circleTranslation: MGLStyleValue<NSValue>;

	circleTranslationAnchor: MGLStyleValue<NSValue>;

	circleTranslationTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLCircleTranslationAnchor {

	Map = 0,

	Viewport = 1
}

declare class MGLClockDirectionFormatter extends NSFormatter {

	static alloc(): MGLClockDirectionFormatter; // inherited from NSObject

	static new(): MGLClockDirectionFormatter; // inherited from NSObject

	unitStyle: NSFormattingUnitStyle;

	stringFromDirection(direction: number): string;
}

declare class MGLCompassDirectionFormatter extends NSFormatter {

	static alloc(): MGLCompassDirectionFormatter; // inherited from NSObject

	static new(): MGLCompassDirectionFormatter; // inherited from NSObject

	unitStyle: NSFormattingUnitStyle;

	stringFromDirection(direction: number): string;
}

declare class MGLCompositeStyleFunction<T> extends MGLStyleFunction<T> {

	static alloc<T>(): MGLCompositeStyleFunction<T>; // inherited from NSObject

	static functionWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLCompositeStyleFunction<T>; // inherited from MGLStyleFunction

	static functionWithInterpolationModeStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, stops: NSDictionary<any, NSDictionary<any, MGLStyleValue<T>>>, attributeName: string, options: NSDictionary<string, any>): MGLCompositeStyleFunction<T>;

	static functionWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLCompositeStyleFunction<T>; // inherited from MGLStyleFunction

	static new<T>(): MGLCompositeStyleFunction<T>; // inherited from NSObject

	static valueWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLCompositeStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCameraStopsOptions<T>(interpolationMode: MGLInterpolationMode, cameraStops: NSDictionary<any, MGLStyleValue<T>>, options: NSDictionary<string, any>): MGLCompositeStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCompositeStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, compositeStops: NSDictionary<any, NSDictionary<any, MGLStyleValue<T>>>, attributeName: string, options: NSDictionary<string, any>): MGLCompositeStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeSourceStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, sourceStops: NSDictionary<any, MGLStyleValue<T>>, attributeName: string, options: NSDictionary<string, any>): MGLCompositeStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithRawValue<T>(rawValue: T): MGLCompositeStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLCompositeStyleFunction<T>; // inherited from MGLStyleValue

	attributeName: string;

	defaultValue: MGLStyleValue<T>;
}

declare class MGLConstantStyleValue<T> extends MGLStyleValue<T> {

	static alloc<T>(): MGLConstantStyleValue<T>; // inherited from NSObject

	static new<T>(): MGLConstantStyleValue<T>; // inherited from NSObject

	static valueWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLConstantStyleValue<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCameraStopsOptions<T>(interpolationMode: MGLInterpolationMode, cameraStops: NSDictionary<any, MGLStyleValue<T>>, options: NSDictionary<string, any>): MGLConstantStyleValue<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCompositeStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, compositeStops: NSDictionary<any, NSDictionary<any, MGLStyleValue<T>>>, attributeName: string, options: NSDictionary<string, any>): MGLConstantStyleValue<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeSourceStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, sourceStops: NSDictionary<any, MGLStyleValue<T>>, attributeName: string, options: NSDictionary<string, any>): MGLConstantStyleValue<T>; // inherited from MGLStyleValue

	static valueWithRawValue<T>(rawValue: T): MGLConstantStyleValue<T>; // inherited from MGLStyleValue

	static valueWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLConstantStyleValue<T>; // inherited from MGLStyleValue

	rawValue: T;

	constructor(o: { rawValue: T; });

	initWithRawValue(rawValue: T): this;
}

interface MGLCoordinateBounds {
	sw: CLLocationCoordinate2D;
	ne: CLLocationCoordinate2D;
}
declare var MGLCoordinateBounds: interop.StructType<MGLCoordinateBounds>;

declare class MGLCoordinateFormatter extends NSFormatter {

	static alloc(): MGLCoordinateFormatter; // inherited from NSObject

	static new(): MGLCoordinateFormatter; // inherited from NSObject

	allowsMinutes: boolean;

	allowsSeconds: boolean;

	unitStyle: NSFormattingUnitStyle;

	stringFromCoordinate(coordinate: CLLocationCoordinate2D): string;
}

interface MGLCoordinateSpan {
	latitudeDelta: number;
	longitudeDelta: number;
}
declare var MGLCoordinateSpan: interop.StructType<MGLCoordinateSpan>;

declare var MGLCoordinateSpanZero: MGLCoordinateSpan;

declare class MGLDistanceFormatter extends NSLengthFormatter {

	static alloc(): MGLDistanceFormatter; // inherited from NSObject

	static new(): MGLDistanceFormatter; // inherited from NSObject

	stringFromDistance(distance: number): string;
}

declare const enum MGLErrorCode {

	Unknown = -1,

	NotFound = 1,

	BadServerResponse = 2,

	ConnectionFailed = 3,

	ParseStyleFailed = 4,

	LoadStyleFailed = 5
}

declare var MGLErrorDomain: string;

interface MGLFeature extends MGLAnnotation {

	attributes: NSDictionary<string, any>;

	identifier: any;

	attributeForKey(key: string): any;

	geoJSONDictionary(): NSDictionary<string, any>;
}
declare var MGLFeature: {

	prototype: MGLFeature;
};

declare class MGLFillExtrusionStyleLayer extends MGLVectorStyleLayer {

	static alloc(): MGLFillExtrusionStyleLayer; // inherited from NSObject

	static new(): MGLFillExtrusionStyleLayer; // inherited from NSObject

	fillExtrusionBase: MGLStyleValue<number>;

	fillExtrusionBaseTransition: MGLTransition;

	fillExtrusionColor: MGLStyleValue<UIColor>;

	fillExtrusionColorTransition: MGLTransition;

	fillExtrusionHeight: MGLStyleValue<number>;

	fillExtrusionHeightTransition: MGLTransition;

	fillExtrusionOpacity: MGLStyleValue<number>;

	fillExtrusionOpacityTransition: MGLTransition;

	fillExtrusionPattern: MGLStyleValue<string>;

	fillExtrusionPatternTransition: MGLTransition;

	fillExtrusionTranslation: MGLStyleValue<NSValue>;

	fillExtrusionTranslationAnchor: MGLStyleValue<NSValue>;

	fillExtrusionTranslationTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLFillExtrusionTranslationAnchor {

	Map = 0,

	Viewport = 1
}

declare class MGLFillStyleLayer extends MGLVectorStyleLayer {

	static alloc(): MGLFillStyleLayer; // inherited from NSObject

	static new(): MGLFillStyleLayer; // inherited from NSObject

	fillAntialiased: MGLStyleValue<number>;

	fillColor: MGLStyleValue<UIColor>;

	fillColorTransition: MGLTransition;

	fillOpacity: MGLStyleValue<number>;

	fillOpacityTransition: MGLTransition;

	fillOutlineColor: MGLStyleValue<UIColor>;

	fillOutlineColorTransition: MGLTransition;

	fillPattern: MGLStyleValue<string>;

	fillPatternTransition: MGLTransition;

	fillTranslation: MGLStyleValue<NSValue>;

	fillTranslationAnchor: MGLStyleValue<NSValue>;

	fillTranslationTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLFillTranslationAnchor {

	Map = 0,

	Viewport = 1
}

declare class MGLForegroundStyleLayer extends MGLStyleLayer {

	static alloc(): MGLForegroundStyleLayer; // inherited from NSObject

	static new(): MGLForegroundStyleLayer; // inherited from NSObject

	readonly sourceIdentifier: string;
}

declare const enum MGLIconRotationAlignment {

	Map = 0,

	Viewport = 1,

	Auto = 2
}

declare const enum MGLIconTextFit {

	None = 0,

	Width = 1,

	Height = 2,

	Both = 3
}

declare const enum MGLIconTranslationAnchor {

	Map = 0,

	Viewport = 1
}

declare const enum MGLInterpolationMode {

	Exponential = 0,

	Interval = 1,

	Categorical = 2,

	Identity = 3
}

declare class MGLLight extends NSObject {

	static alloc(): MGLLight; // inherited from NSObject

	static new(): MGLLight; // inherited from NSObject

	anchor: MGLStyleValue<NSValue>;

	color: MGLStyleValue<UIColor>;

	colorTransition: MGLTransition;

	intensity: MGLStyleValue<number>;

	intensityTransition: MGLTransition;

	position: MGLStyleValue<NSValue>;

	positionTransition: MGLTransition;
}

declare const enum MGLLightAnchor {

	Map = 0,

	Viewport = 1
}

declare const enum MGLLineCap {

	Butt = 0,

	Round = 1,

	Square = 2
}

declare const enum MGLLineJoin {

	Bevel = 0,

	Round = 1,

	Miter = 2
}

declare class MGLLineStyleLayer extends MGLVectorStyleLayer {

	static alloc(): MGLLineStyleLayer; // inherited from NSObject

	static new(): MGLLineStyleLayer; // inherited from NSObject

	lineBlur: MGLStyleValue<number>;

	lineBlurTransition: MGLTransition;

	lineCap: MGLStyleValue<NSValue>;

	lineColor: MGLStyleValue<UIColor>;

	lineColorTransition: MGLTransition;

	lineDashPattern: MGLStyleValue<NSArray<number>>;

	lineDashPatternTransition: MGLTransition;

	lineGapWidth: MGLStyleValue<number>;

	lineGapWidthTransition: MGLTransition;

	lineJoin: MGLStyleValue<NSValue>;

	lineMiterLimit: MGLStyleValue<number>;

	lineOffset: MGLStyleValue<number>;

	lineOffsetTransition: MGLTransition;

	lineOpacity: MGLStyleValue<number>;

	lineOpacityTransition: MGLTransition;

	linePattern: MGLStyleValue<string>;

	linePatternTransition: MGLTransition;

	lineRoundLimit: MGLStyleValue<number>;

	lineTranslation: MGLStyleValue<NSValue>;

	lineTranslationAnchor: MGLStyleValue<NSValue>;

	lineTranslationTransition: MGLTransition;

	lineWidth: MGLStyleValue<number>;

	lineWidthTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLLineTranslationAnchor {

	Map = 0,

	Viewport = 1
}

declare class MGLMapCamera extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MGLMapCamera; // inherited from NSObject

	static camera(): MGLMapCamera;

	static cameraLookingAtCenterCoordinateFromDistancePitchHeading(centerCoordinate: CLLocationCoordinate2D, distance: number, pitch: number, heading: number): MGLMapCamera;

	static cameraLookingAtCenterCoordinateFromEyeCoordinateEyeAltitude(centerCoordinate: CLLocationCoordinate2D, eyeCoordinate: CLLocationCoordinate2D, eyeAltitude: number): MGLMapCamera;

	static new(): MGLMapCamera; // inherited from NSObject

	altitude: number;

	centerCoordinate: CLLocationCoordinate2D;

	heading: number;

	pitch: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	isEqualToMapCamera(otherCamera: MGLMapCamera): boolean;
}

declare const enum MGLMapDebugMaskOptions {

	TileBoundariesMask = 2,

	TileInfoMask = 4,

	TimestampsMask = 8,

	CollisionBoxesMask = 16,

	OverdrawVisualizationMask = 32
}

declare class MGLMapView extends UIView {

	static alloc(): MGLMapView; // inherited from NSObject

	static appearance(): MGLMapView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MGLMapView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MGLMapView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): MGLMapView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MGLMapView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): MGLMapView; // inherited from UIAppearance

	static new(): MGLMapView; // inherited from NSObject

	allowsRotating: boolean;

	allowsScrolling: boolean;

	allowsTilting: boolean;

	allowsZooming: boolean;

	readonly annotations: NSArray<MGLAnnotation>;

	readonly attributionButton: UIButton;

	readonly bundledStyleURLs: NSArray<NSURL>;

	camera: MGLMapCamera;

	centerCoordinate: CLLocationCoordinate2D;

	readonly compassView: UIImageView;

	contentInset: UIEdgeInsets;

	debugActive: boolean;

	debugMask: MGLMapDebugMaskOptions;

	decelerationRate: number;

	delegate: MGLMapViewDelegate;

	direction: number;

	displayHeadingCalibration: boolean;

	latitude: number;

	readonly logoView: UIImageView;

	longitude: number;

	maximumZoomLevel: number;

	minimumZoomLevel: number;

	pitchEnabled: boolean;

	rotateEnabled: boolean;

	readonly scaleBar: UIView;

	scrollEnabled: boolean;

	selectedAnnotations: NSArray<MGLAnnotation>;

	showsUserLocation: boolean;

	readonly style: MGLStyle;

	styleClasses: NSArray<string>;

	styleURL: NSURL;

	targetCoordinate: CLLocationCoordinate2D;

	readonly userLocation: MGLUserLocation;

	userLocationVerticalAlignment: MGLAnnotationVerticalAlignment;

	readonly userLocationVisible: boolean;

	userTrackingMode: MGLUserTrackingMode;

	readonly visibleAnnotations: NSArray<MGLAnnotation>;

	visibleCoordinateBounds: MGLCoordinateBounds;

	zoomEnabled: boolean;

	zoomLevel: number;

	constructor(o: { frame: CGRect; styleURL: NSURL; });

	addAnnotation(annotation: MGLAnnotation): void;

	addAnnotations(annotations: NSArray<MGLAnnotation>): void;

	addOverlay(overlay: MGLOverlay): void;

	addOverlays(overlays: NSArray<MGLOverlay>): void;

	addStyleClass(styleClass: string): void;

	anchorPointForGesture(gesture: UIGestureRecognizer): CGPoint;

	cameraThatFitsCoordinateBounds(bounds: MGLCoordinateBounds): MGLMapCamera;

	cameraThatFitsCoordinateBoundsEdgePadding(bounds: MGLCoordinateBounds, insets: UIEdgeInsets): MGLMapCamera;

	convertCoordinateBoundsToRectToView(bounds: MGLCoordinateBounds, view: UIView): CGRect;

	convertCoordinateToPointToView(coordinate: CLLocationCoordinate2D, view: UIView): CGPoint;

	convertPointToCoordinateFromView(point: CGPoint, view: UIView): CLLocationCoordinate2D;

	convertRectToCoordinateBoundsFromView(rect: CGRect, view: UIView): MGLCoordinateBounds;

	dequeueReusableAnnotationImageWithIdentifier(identifier: string): MGLAnnotationImage;

	dequeueReusableAnnotationViewWithIdentifier(identifier: string): MGLAnnotationView;

	deselectAnnotationAnimated(annotation: MGLAnnotation, animated: boolean): void;

	emptyMemoryCache(): void;

	flyToCameraCompletionHandler(camera: MGLMapCamera, completion: () => void): void;

	flyToCameraWithDurationCompletionHandler(camera: MGLMapCamera, duration: number, completion: () => void): void;

	flyToCameraWithDurationPeakAltitudeCompletionHandler(camera: MGLMapCamera, duration: number, peakAltitude: number, completion: () => void): void;

	hasStyleClass(styleClass: string): boolean;

	initWithFrameStyleURL(frame: CGRect, styleURL: NSURL): this;

	metersPerPixelAtLatitude(latitude: number): number;

	metersPerPointAtLatitude(latitude: number): number;

	reloadStyle(sender: any): void;

	removeAnnotation(annotation: MGLAnnotation): void;

	removeAnnotations(annotations: NSArray<MGLAnnotation>): void;

	removeOverlay(overlay: MGLOverlay): void;

	removeOverlays(overlays: NSArray<MGLOverlay>): void;

	removeStyleClass(styleClass: string): void;

	resetNorth(): void;

	resetPosition(): void;

	selectAnnotationAnimated(annotation: MGLAnnotation, animated: boolean): void;

	setCameraAnimated(camera: MGLMapCamera, animated: boolean): void;

	setCameraWithDurationAnimationTimingFunction(camera: MGLMapCamera, duration: number, _function: CAMediaTimingFunction): void;

	setCameraWithDurationAnimationTimingFunctionCompletionHandler(camera: MGLMapCamera, duration: number, _function: CAMediaTimingFunction, completion: () => void): void;

	setCenterCoordinateAnimated(coordinate: CLLocationCoordinate2D, animated: boolean): void;

	setCenterCoordinateZoomLevelAnimated(centerCoordinate: CLLocationCoordinate2D, zoomLevel: number, animated: boolean): void;

	setCenterCoordinateZoomLevelDirectionAnimated(centerCoordinate: CLLocationCoordinate2D, zoomLevel: number, direction: number, animated: boolean): void;

	setCenterCoordinateZoomLevelDirectionAnimatedCompletionHandler(centerCoordinate: CLLocationCoordinate2D, zoomLevel: number, direction: number, animated: boolean, completion: () => void): void;

	setContentInsetAnimated(contentInset: UIEdgeInsets, animated: boolean): void;

	setDirectionAnimated(direction: number, animated: boolean): void;

	setTargetCoordinateAnimated(targetCoordinate: CLLocationCoordinate2D, animated: boolean): void;

	setUserLocationVerticalAlignmentAnimated(alignment: MGLAnnotationVerticalAlignment, animated: boolean): void;

	setUserTrackingModeAnimated(mode: MGLUserTrackingMode, animated: boolean): void;

	setVisibleCoordinateBoundsAnimated(bounds: MGLCoordinateBounds, animated: boolean): void;

	setVisibleCoordinateBoundsEdgePaddingAnimated(bounds: MGLCoordinateBounds, insets: UIEdgeInsets, animated: boolean): void;

	setVisibleCoordinatesCountEdgePaddingAnimated(coordinates: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number, insets: UIEdgeInsets, animated: boolean): void;

	setVisibleCoordinatesCountEdgePaddingDirectionDurationAnimationTimingFunctionCompletionHandler(coordinates: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number, insets: UIEdgeInsets, direction: number, duration: number, _function: CAMediaTimingFunction, completion: () => void): void;

	setZoomLevelAnimated(zoomLevel: number, animated: boolean): void;

	showAnnotationsAnimated(annotations: NSArray<MGLAnnotation>, animated: boolean): void;

	showAnnotationsEdgePaddingAnimated(annotations: NSArray<MGLAnnotation>, insets: UIEdgeInsets, animated: boolean): void;

	toggleDebug(): void;

	viewForAnnotation(annotation: MGLAnnotation): MGLAnnotationView;

	visibleAnnotationsInRect(rect: CGRect): NSArray<MGLAnnotation>;

	visibleFeaturesAtPoint(point: CGPoint): NSArray<MGLFeature>;

	visibleFeaturesAtPointInStyleLayersWithIdentifiers(point: CGPoint, styleLayerIdentifiers: NSSet<string>): NSArray<MGLFeature>;

	visibleFeaturesAtPointInStyleLayersWithIdentifiersPredicate(point: CGPoint, styleLayerIdentifiers: NSSet<string>, predicate: NSPredicate): NSArray<MGLFeature>;

	visibleFeaturesInRect(rect: CGRect): NSArray<MGLFeature>;

	visibleFeaturesInRectInStyleLayersWithIdentifiers(rect: CGRect, styleLayerIdentifiers: NSSet<string>): NSArray<MGLFeature>;

	visibleFeaturesInRectInStyleLayersWithIdentifiersPredicate(rect: CGRect, styleLayerIdentifiers: NSSet<string>, predicate: NSPredicate): NSArray<MGLFeature>;
}

declare var MGLMapViewDecelerationRateFast: number;

declare var MGLMapViewDecelerationRateImmediate: number;

declare var MGLMapViewDecelerationRateNormal: number;

interface MGLMapViewDelegate extends NSObjectProtocol {

	mapViewAlphaForShapeAnnotation?(mapView: MGLMapView, annotation: MGLShape): number;

	mapViewAnnotationCalloutAccessoryControlTapped?(mapView: MGLMapView, annotation: MGLAnnotation, control: UIControl): void;

	mapViewAnnotationCanShowCallout?(mapView: MGLMapView, annotation: MGLAnnotation): boolean;

	mapViewCalloutViewForAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): MGLCalloutView;

	mapViewDidAddAnnotationViews?(mapView: MGLMapView, annotationViews: NSArray<MGLAnnotationView>): void;

	mapViewDidChangeUserTrackingModeAnimated?(mapView: MGLMapView, mode: MGLUserTrackingMode, animated: boolean): void;

	mapViewDidDeselectAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): void;

	mapViewDidDeselectAnnotationView?(mapView: MGLMapView, annotationView: MGLAnnotationView): void;

	mapViewDidFailLoadingMapWithError?(mapView: MGLMapView, error: NSError): void;

	mapViewDidFailToLocateUserWithError?(mapView: MGLMapView, error: NSError): void;

	mapViewDidFinishLoadingMap?(mapView: MGLMapView): void;

	mapViewDidFinishLoadingStyle?(mapView: MGLMapView, style: MGLStyle): void;

	mapViewDidFinishRenderingFrameFullyRendered?(mapView: MGLMapView, fullyRendered: boolean): void;

	mapViewDidFinishRenderingMapFullyRendered?(mapView: MGLMapView, fullyRendered: boolean): void;

	mapViewDidSelectAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): void;

	mapViewDidSelectAnnotationView?(mapView: MGLMapView, annotationView: MGLAnnotationView): void;

	mapViewDidStopLocatingUser?(mapView: MGLMapView): void;

	mapViewDidUpdateUserLocation?(mapView: MGLMapView, userLocation: MGLUserLocation): void;

	mapViewFillColorForPolygonAnnotation?(mapView: MGLMapView, annotation: MGLPolygon): UIColor;

	mapViewImageForAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): MGLAnnotationImage;

	mapViewLeftCalloutAccessoryViewForAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): UIView;

	mapViewLineWidthForPolylineAnnotation?(mapView: MGLMapView, annotation: MGLPolyline): number;

	mapViewRegionDidChangeAnimated?(mapView: MGLMapView, animated: boolean): void;

	mapViewRegionIsChanging?(mapView: MGLMapView): void;

	mapViewRegionWillChangeAnimated?(mapView: MGLMapView, animated: boolean): void;

	mapViewRightCalloutAccessoryViewForAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): UIView;

	mapViewShouldChangeFromCameraToCamera?(mapView: MGLMapView, oldCamera: MGLMapCamera, newCamera: MGLMapCamera): boolean;

	mapViewStrokeColorForShapeAnnotation?(mapView: MGLMapView, annotation: MGLShape): UIColor;

	mapViewTapOnCalloutForAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): void;

	mapViewViewForAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): MGLAnnotationView;

	mapViewWillStartLoadingMap?(mapView: MGLMapView): void;

	mapViewWillStartLocatingUser?(mapView: MGLMapView): void;

	mapViewWillStartRenderingFrame?(mapView: MGLMapView): void;

	mapViewWillStartRenderingMap?(mapView: MGLMapView): void;
}
declare var MGLMapViewDelegate: {

	prototype: MGLMapViewDelegate;
};

declare class MGLMultiPoint extends MGLShape {

	static alloc(): MGLMultiPoint; // inherited from NSObject

	static new(): MGLMultiPoint; // inherited from NSObject

	readonly coordinates: interop.Pointer | interop.Reference<CLLocationCoordinate2D>;

	readonly pointCount: number;

	appendCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): void;

	getCoordinatesRange(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, range: NSRange): void;

	insertCoordinatesCountAtIndex(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number, index: number): void;

	removeCoordinatesInRange(range: NSRange): void;

	replaceCoordinatesInRangeWithCoordinates(range: NSRange, coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>): void;

	replaceCoordinatesInRangeWithCoordinatesCount(range: NSRange, coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): void;

	setCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): void;
}

declare class MGLMultiPolygon extends MGLShape implements MGLOverlay {

	static alloc(): MGLMultiPolygon; // inherited from NSObject

	static multiPolygonWithPolygons(polygons: NSArray<MGLPolygon>): MGLMultiPolygon;

	static new(): MGLMultiPolygon; // inherited from NSObject

	readonly polygons: NSArray<MGLPolygon>;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly overlayBounds: MGLCoordinateBounds; // inherited from MGLOverlay

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	intersectsOverlayBounds(overlayBounds: MGLCoordinateBounds): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLMultiPolygonFeature extends MGLMultiPolygon implements MGLFeature {

	static alloc(): MGLMultiPolygonFeature; // inherited from NSObject

	static multiPolygonWithPolygons(polygons: NSArray<MGLPolygon>): MGLMultiPolygonFeature; // inherited from MGLMultiPolygon

	static new(): MGLMultiPolygonFeature; // inherited from NSObject

	attributes: NSDictionary<string, any>; // inherited from MGLFeature

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	identifier: any; // inherited from MGLFeature

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	attributeForKey(key: string): any;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	geoJSONDictionary(): NSDictionary<string, any>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLMultiPolyline extends MGLShape implements MGLOverlay {

	static alloc(): MGLMultiPolyline; // inherited from NSObject

	static multiPolylineWithPolylines(polylines: NSArray<MGLPolyline>): MGLMultiPolyline;

	static new(): MGLMultiPolyline; // inherited from NSObject

	readonly polylines: NSArray<MGLPolyline>;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly overlayBounds: MGLCoordinateBounds; // inherited from MGLOverlay

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	intersectsOverlayBounds(overlayBounds: MGLCoordinateBounds): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLMultiPolylineFeature extends MGLMultiPolyline implements MGLFeature {

	static alloc(): MGLMultiPolylineFeature; // inherited from NSObject

	static multiPolylineWithPolylines(polylines: NSArray<MGLPolyline>): MGLMultiPolylineFeature; // inherited from MGLMultiPolyline

	static new(): MGLMultiPolylineFeature; // inherited from NSObject

	attributes: NSDictionary<string, any>; // inherited from MGLFeature

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	identifier: any; // inherited from MGLFeature

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	attributeForKey(key: string): any;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	geoJSONDictionary(): NSDictionary<string, any>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLOfflinePack extends NSObject {

	static alloc(): MGLOfflinePack; // inherited from NSObject

	static new(): MGLOfflinePack; // inherited from NSObject

	readonly context: NSData;

	readonly progress: MGLOfflinePackProgress;

	readonly region: MGLOfflineRegion;

	readonly state: MGLOfflinePackState;

	requestProgress(): void;

	resume(): void;

	suspend(): void;
}

declare var MGLOfflinePackErrorNotification: string;

declare var MGLOfflinePackErrorUserInfoKey: string;

declare var MGLOfflinePackMaximumCountUserInfoKey: string;

declare var MGLOfflinePackMaximumMapboxTilesReachedNotification: string;

interface MGLOfflinePackProgress {
	countOfResourcesCompleted: number;
	countOfBytesCompleted: number;
	countOfTilesCompleted: number;
	countOfTileBytesCompleted: number;
	countOfResourcesExpected: number;
	maximumResourcesExpected: number;
}
declare var MGLOfflinePackProgress: interop.StructType<MGLOfflinePackProgress>;

declare var MGLOfflinePackProgressChangedNotification: string;

declare var MGLOfflinePackProgressUserInfoKey: string;

declare const enum MGLOfflinePackState {

	Unknown = 0,

	Inactive = 1,

	Active = 2,

	Complete = 3,

	Invalid = 4
}

declare var MGLOfflinePackStateUserInfoKey: string;

declare var MGLOfflinePackUserInfoKeyError: string;

declare var MGLOfflinePackUserInfoKeyMaximumCount: string;

declare var MGLOfflinePackUserInfoKeyProgress: string;

declare var MGLOfflinePackUserInfoKeyState: string;

interface MGLOfflineRegion extends NSObjectProtocol {
}
declare var MGLOfflineRegion: {

	prototype: MGLOfflineRegion;
};

declare class MGLOfflineStorage extends NSObject {

	static alloc(): MGLOfflineStorage; // inherited from NSObject

	static new(): MGLOfflineStorage; // inherited from NSObject

	static sharedOfflineStorage(): MGLOfflineStorage;

	readonly countOfBytesCompleted: number;

	delegate: MGLOfflineStorageDelegate;

	readonly packs: NSArray<MGLOfflinePack>;

	addPackForRegionWithContextCompletionHandler(region: MGLOfflineRegion, context: NSData, completion: (p1: MGLOfflinePack, p2: NSError) => void): void;

	reloadPacks(): void;

	removePackWithCompletionHandler(pack: MGLOfflinePack, completion: (p1: NSError) => void): void;

	setMaximumAllowedMapboxTiles(maximumCount: number): void;
}

interface MGLOfflineStorageDelegate extends NSObjectProtocol {

	offlineStorageURLForResourceOfKindWithURL(storage: MGLOfflineStorage, kind: MGLResourceKind, url: NSURL): NSURL;
}
declare var MGLOfflineStorageDelegate: {

	prototype: MGLOfflineStorageDelegate;
};

declare class MGLOpenGLStyleLayer extends MGLStyleLayer {

	static alloc(): MGLOpenGLStyleLayer; // inherited from NSObject

	static new(): MGLOpenGLStyleLayer; // inherited from NSObject

	readonly mapView: MGLMapView;

	constructor(o: { identifier: string; });

	didMoveToMapView(mapView: MGLMapView): void;

	drawInMapViewWithContext(mapView: MGLMapView, context: MGLStyleLayerDrawingContext): void;

	initWithIdentifier(identifier: string): this;

	setNeedsDisplay(): void;

	willMoveFromMapView(mapView: MGLMapView): void;
}

interface MGLOverlay extends MGLAnnotation {

	overlayBounds: MGLCoordinateBounds;

	intersectsOverlayBounds(overlayBounds: MGLCoordinateBounds): boolean;
}
declare var MGLOverlay: {

	prototype: MGLOverlay;
};

declare class MGLPointAnnotation extends MGLShape {

	static alloc(): MGLPointAnnotation; // inherited from NSObject

	static new(): MGLPointAnnotation; // inherited from NSObject

	coordinate: CLLocationCoordinate2D;
}

declare class MGLPointCollection extends MGLShape implements MGLOverlay {

	static alloc(): MGLPointCollection; // inherited from NSObject

	static new(): MGLPointCollection; // inherited from NSObject

	static pointCollectionWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MGLPointCollection;

	readonly coordinates: interop.Pointer | interop.Reference<CLLocationCoordinate2D>;

	readonly pointCount: number;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly overlayBounds: MGLCoordinateBounds; // inherited from MGLOverlay

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	getCoordinatesRange(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, range: NSRange): void;

	intersectsOverlayBounds(overlayBounds: MGLCoordinateBounds): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLPointCollectionFeature extends MGLPointCollection implements MGLFeature {

	static alloc(): MGLPointCollectionFeature; // inherited from NSObject

	static new(): MGLPointCollectionFeature; // inherited from NSObject

	static pointCollectionWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MGLPointCollectionFeature; // inherited from MGLPointCollection

	attributes: NSDictionary<string, any>; // inherited from MGLFeature

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	identifier: any; // inherited from MGLFeature

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	attributeForKey(key: string): any;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	geoJSONDictionary(): NSDictionary<string, any>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLPointFeature extends MGLPointAnnotation implements MGLFeature {

	static alloc(): MGLPointFeature; // inherited from NSObject

	static new(): MGLPointFeature; // inherited from NSObject

	attributes: NSDictionary<string, any>; // inherited from MGLFeature

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	identifier: any; // inherited from MGLFeature

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	attributeForKey(key: string): any;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	geoJSONDictionary(): NSDictionary<string, any>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLPolygon extends MGLMultiPoint implements MGLOverlay {

	static alloc(): MGLPolygon; // inherited from NSObject

	static new(): MGLPolygon; // inherited from NSObject

	static polygonWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MGLPolygon;

	static polygonWithCoordinatesCountInteriorPolygons(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number, interiorPolygons: NSArray<MGLPolygon>): MGLPolygon;

	readonly interiorPolygons: NSArray<MGLPolygon>;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly overlayBounds: MGLCoordinateBounds; // inherited from MGLOverlay

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	intersectsOverlayBounds(overlayBounds: MGLCoordinateBounds): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLPolygonFeature extends MGLPolygon implements MGLFeature {

	static alloc(): MGLPolygonFeature; // inherited from NSObject

	static new(): MGLPolygonFeature; // inherited from NSObject

	static polygonWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MGLPolygonFeature; // inherited from MGLPolygon

	static polygonWithCoordinatesCountInteriorPolygons(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number, interiorPolygons: NSArray<MGLPolygon>): MGLPolygonFeature; // inherited from MGLPolygon

	attributes: NSDictionary<string, any>; // inherited from MGLFeature

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	identifier: any; // inherited from MGLFeature

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	attributeForKey(key: string): any;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	geoJSONDictionary(): NSDictionary<string, any>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLPolyline extends MGLMultiPoint implements MGLOverlay {

	static alloc(): MGLPolyline; // inherited from NSObject

	static new(): MGLPolyline; // inherited from NSObject

	static polylineWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MGLPolyline;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly overlayBounds: MGLCoordinateBounds; // inherited from MGLOverlay

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	intersectsOverlayBounds(overlayBounds: MGLCoordinateBounds): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLPolylineFeature extends MGLPolyline implements MGLFeature {

	static alloc(): MGLPolylineFeature; // inherited from NSObject

	static new(): MGLPolylineFeature; // inherited from NSObject

	static polylineWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MGLPolylineFeature; // inherited from MGLPolyline

	attributes: NSDictionary<string, any>; // inherited from MGLFeature

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	identifier: any; // inherited from MGLFeature

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	attributeForKey(key: string): any;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	geoJSONDictionary(): NSDictionary<string, any>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLRasterSource extends MGLTileSource {

	static alloc(): MGLRasterSource; // inherited from NSObject

	static new(): MGLRasterSource; // inherited from NSObject

	constructor(o: { identifier: string; configurationURL: NSURL; });

	constructor(o: { identifier: string; configurationURL: NSURL; tileSize: number; });

	constructor(o: { identifier: string; tileURLTemplates: NSArray<string>; options: NSDictionary<string, any>; });

	initWithIdentifierConfigurationURL(identifier: string, configurationURL: NSURL): this;

	initWithIdentifierConfigurationURLTileSize(identifier: string, configurationURL: NSURL, tileSize: number): this;

	initWithIdentifierTileURLTemplatesOptions(identifier: string, tileURLTemplates: NSArray<string>, options: NSDictionary<string, any>): this;
}

declare class MGLRasterStyleLayer extends MGLForegroundStyleLayer {

	static alloc(): MGLRasterStyleLayer; // inherited from NSObject

	static new(): MGLRasterStyleLayer; // inherited from NSObject

	maximumRasterBrightness: MGLStyleValue<number>;

	maximumRasterBrightnessTransition: MGLTransition;

	minimumRasterBrightness: MGLStyleValue<number>;

	minimumRasterBrightnessTransition: MGLTransition;

	rasterContrast: MGLStyleValue<number>;

	rasterContrastTransition: MGLTransition;

	rasterFadeDuration: MGLStyleValue<number>;

	rasterFadeDurationTransition: MGLTransition;

	rasterHueRotation: MGLStyleValue<number>;

	rasterHueRotationTransition: MGLTransition;

	rasterOpacity: MGLStyleValue<number>;

	rasterOpacityTransition: MGLTransition;

	rasterSaturation: MGLStyleValue<number>;

	rasterSaturationTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLResourceKind {

	Unknown = 0,

	Style = 1,

	Source = 2,

	Tile = 3,

	Glyphs = 4,

	SpriteImage = 5,

	SpriteJSON = 6
}

declare class MGLShape extends NSObject implements MGLAnnotation, NSSecureCoding {

	static alloc(): MGLShape; // inherited from NSObject

	static new(): MGLShape; // inherited from NSObject

	static shapeWithDataEncodingError(data: NSData, encoding: number): MGLShape;

	subtitle: string;

	title: string;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(aCoder: NSCoder): void;

	geoJSONDataUsingEncoding(encoding: number): NSData;

	initWithCoder(aDecoder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLShapeCollection extends MGLShape {

	static alloc(): MGLShapeCollection; // inherited from NSObject

	static new(): MGLShapeCollection; // inherited from NSObject

	static shapeCollectionWithShapes(shapes: NSArray<MGLShape>): MGLShapeCollection;

	readonly shapes: NSArray<MGLShape>;
}

declare class MGLShapeCollectionFeature extends MGLShapeCollection implements MGLFeature {

	static alloc(): MGLShapeCollectionFeature; // inherited from NSObject

	static new(): MGLShapeCollectionFeature; // inherited from NSObject

	static shapeCollectionWithShapes(shapes: NSArray<MGLShape>): MGLShapeCollectionFeature; // inherited from MGLShapeCollection

	attributes: NSDictionary<string, any>; // inherited from MGLFeature

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	identifier: any; // inherited from MGLFeature

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly  // inherited from NSObjectProtocol

	attributeForKey(key: string): any;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	geoJSONDictionary(): NSDictionary<string, any>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLShapeSource extends MGLSource {

	static alloc(): MGLShapeSource; // inherited from NSObject

	static new(): MGLShapeSource; // inherited from NSObject

	URL: NSURL;

	shape: MGLShape;

	constructor(o: { identifier: string; features: NSArray<MGLShape>; options: NSDictionary<string, any>; });

	constructor(o: { identifier: string; shape: MGLShape; options: NSDictionary<string, any>; });

	constructor(o: { identifier: string; shapes: NSArray<MGLShape>; options: NSDictionary<string, any>; });

	constructor(o: { identifier: string; URL: NSURL; options: NSDictionary<string, any>; });

	featuresMatchingPredicate(predicate: NSPredicate): NSArray<MGLFeature>;

	initWithIdentifierFeaturesOptions(identifier: string, features: NSArray<MGLShape>, options: NSDictionary<string, any>): this;

	initWithIdentifierShapeOptions(identifier: string, shape: MGLShape, options: NSDictionary<string, any>): this;

	initWithIdentifierShapesOptions(identifier: string, shapes: NSArray<MGLShape>, options: NSDictionary<string, any>): this;

	initWithIdentifierURLOptions(identifier: string, url: NSURL, options: NSDictionary<string, any>): this;
}

declare var MGLShapeSourceOptionBuffer: string;

declare var MGLShapeSourceOptionClusterRadius: string;

declare var MGLShapeSourceOptionClustered: string;

declare var MGLShapeSourceOptionMaximumZoomLevel: string;

declare var MGLShapeSourceOptionMaximumZoomLevelForClustering: string;

declare var MGLShapeSourceOptionSimplificationTolerance: string;

declare class MGLSource extends NSObject {

	static alloc(): MGLSource; // inherited from NSObject

	static new(): MGLSource; // inherited from NSObject

	identifier: string;

	constructor(o: { identifier: string; });

	initWithIdentifier(identifier: string): this;
}

declare class MGLSourceStyleFunction<T> extends MGLStyleFunction<T> {

	static alloc<T>(): MGLSourceStyleFunction<T>; // inherited from NSObject

	static functionWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLSourceStyleFunction<T>; // inherited from MGLStyleFunction

	static functionWithInterpolationModeStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, stops: NSDictionary<any, MGLStyleValue<T>>, attributeName: string, options: NSDictionary<string, any>): MGLSourceStyleFunction<T>;

	static functionWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLSourceStyleFunction<T>; // inherited from MGLStyleFunction

	static new<T>(): MGLSourceStyleFunction<T>; // inherited from NSObject

	static valueWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLSourceStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCameraStopsOptions<T>(interpolationMode: MGLInterpolationMode, cameraStops: NSDictionary<any, MGLStyleValue<T>>, options: NSDictionary<string, any>): MGLSourceStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCompositeStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, compositeStops: NSDictionary<any, NSDictionary<any, MGLStyleValue<T>>>, attributeName: string, options: NSDictionary<string, any>): MGLSourceStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeSourceStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, sourceStops: NSDictionary<any, MGLStyleValue<T>>, attributeName: string, options: NSDictionary<string, any>): MGLSourceStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithRawValue<T>(rawValue: T): MGLSourceStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLSourceStyleFunction<T>; // inherited from MGLStyleValue

	attributeName: string;

	defaultValue: MGLStyleValue<T>;
}

interface MGLSphericalPosition {
	radial: number;
	azimuthal: number;
	polar: number;
}
declare var MGLSphericalPosition: interop.StructType<MGLSphericalPosition>;

declare class MGLStyle extends NSObject {

	static alloc(): MGLStyle; // inherited from NSObject

	static darkStyleURL(): NSURL;

	static darkStyleURLWithVersion(version: number): NSURL;

	static emeraldStyleURL(): NSURL;

	static hybridStyleURL(): NSURL;

	static lightStyleURL(): NSURL;

	static lightStyleURLWithVersion(version: number): NSURL;

	static new(): MGLStyle; // inherited from NSObject

	static outdoorsStyleURL(): NSURL;

	static outdoorsStyleURLWithVersion(version: number): NSURL;

	static satelliteStreetsStyleURL(): NSURL;

	static satelliteStreetsStyleURLWithVersion(version: number): NSURL;

	static satelliteStyleURL(): NSURL;

	static satelliteStyleURLWithVersion(version: number): NSURL;

	static streetsStyleURL(): NSURL;

	static streetsStyleURLWithVersion(version: number): NSURL;

	static trafficDayStyleURL(): NSURL;

	static trafficDayStyleURLWithVersion(version: number): NSURL;

	static trafficNightStyleURL(): NSURL;

	static trafficNightStyleURLWithVersion(version: number): NSURL;

	layers: NSArray<MGLStyleLayer>;

	light: MGLLight;

	readonly name: string;

	sources: NSSet<MGLSource>;

	styleClasses: NSArray<string>;

	transition: MGLTransition;

	addLayer(layer: MGLStyleLayer): void;

	addSource(source: MGLSource): void;

	addStyleClass(styleClass: string): void;

	hasStyleClass(styleClass: string): boolean;

	imageForName(name: string): UIImage;

	insertLayerAboveLayer(layer: MGLStyleLayer, sibling: MGLStyleLayer): void;

	insertLayerAtIndex(layer: MGLStyleLayer, index: number): void;

	insertLayerBelowLayer(layer: MGLStyleLayer, sibling: MGLStyleLayer): void;

	layerWithIdentifier(identifier: string): MGLStyleLayer;

	removeImageForName(name: string): void;

	removeLayer(layer: MGLStyleLayer): void;

	removeSource(source: MGLSource): void;

	removeStyleClass(styleClass: string): void;

	setImageForName(image: UIImage, name: string): void;

	sourceWithIdentifier(identifier: string): MGLSource;
}

declare var MGLStyleDefaultVersion: number;

declare class MGLStyleFunction<T> extends MGLStyleValue<T> {

	static alloc<T>(): MGLStyleFunction<T>; // inherited from NSObject

	static functionWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLStyleFunction<T>;

	static functionWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLStyleFunction<T>;

	static new<T>(): MGLStyleFunction<T>; // inherited from NSObject

	static valueWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCameraStopsOptions<T>(interpolationMode: MGLInterpolationMode, cameraStops: NSDictionary<any, MGLStyleValue<T>>, options: NSDictionary<string, any>): MGLStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeCompositeStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, compositeStops: NSDictionary<any, NSDictionary<any, MGLStyleValue<T>>>, attributeName: string, options: NSDictionary<string, any>): MGLStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithInterpolationModeSourceStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, sourceStops: NSDictionary<any, MGLStyleValue<T>>, attributeName: string, options: NSDictionary<string, any>): MGLStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithRawValue<T>(rawValue: T): MGLStyleFunction<T>; // inherited from MGLStyleValue

	static valueWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLStyleFunction<T>; // inherited from MGLStyleValue

	interpolationBase: number;

	interpolationMode: MGLInterpolationMode;

	stops: NSDictionary<any, any>;

	constructor(o: { interpolationBase: number; stops: NSDictionary<number, MGLStyleValue<T>>; });

	initWithInterpolationBaseStops(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): this;
}

declare var MGLStyleFunctionOptionDefaultValue: string;

declare var MGLStyleFunctionOptionInterpolationBase: string;

declare class MGLStyleLayer extends NSObject {

	static alloc(): MGLStyleLayer; // inherited from NSObject

	static new(): MGLStyleLayer; // inherited from NSObject

	readonly identifier: string;

	maximumZoomLevel: number;

	minimumZoomLevel: number;

	visible: boolean;
}

interface MGLStyleLayerDrawingContext {
	size: CGSize;
	centerCoordinate: CLLocationCoordinate2D;
	zoomLevel: number;
	direction: number;
	pitch: number;
	fieldOfView: number;
}
declare var MGLStyleLayerDrawingContext: interop.StructType<MGLStyleLayerDrawingContext>;

declare class MGLStyleValue<T> extends NSObject {

	static alloc<T>(): MGLStyleValue<T>; // inherited from NSObject

	static new<T>(): MGLStyleValue<T>; // inherited from NSObject

	static valueWithInterpolationBaseStops<T>(interpolationBase: number, stops: NSDictionary<number, MGLStyleValue<T>>): MGLStyleValue<T>;

	static valueWithInterpolationModeCameraStopsOptions<T>(interpolationMode: MGLInterpolationMode, cameraStops: NSDictionary<any, MGLStyleValue<T>>, options: NSDictionary<string, any>): MGLStyleValue<T>;

	static valueWithInterpolationModeCompositeStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, compositeStops: NSDictionary<any, NSDictionary<any, MGLStyleValue<T>>>, attributeName: string, options: NSDictionary<string, any>): MGLStyleValue<T>;

	static valueWithInterpolationModeSourceStopsAttributeNameOptions<T>(interpolationMode: MGLInterpolationMode, sourceStops: NSDictionary<any, MGLStyleValue<T>>, attributeName: string, options: NSDictionary<string, any>): MGLStyleValue<T>;

	static valueWithRawValue<T>(rawValue: T): MGLStyleValue<T>;

	static valueWithStops<T>(stops: NSDictionary<number, MGLStyleValue<T>>): MGLStyleValue<T>;
}

declare const enum MGLSymbolPlacement {

	Point = 0,

	Line = 1
}

declare class MGLSymbolStyleLayer extends MGLVectorStyleLayer {

	static alloc(): MGLSymbolStyleLayer; // inherited from NSObject

	static new(): MGLSymbolStyleLayer; // inherited from NSObject

	iconAllowsOverlap: MGLStyleValue<number>;

	iconColor: MGLStyleValue<UIColor>;

	iconColorTransition: MGLTransition;

	iconHaloBlur: MGLStyleValue<number>;

	iconHaloBlurTransition: MGLTransition;

	iconHaloColor: MGLStyleValue<UIColor>;

	iconHaloColorTransition: MGLTransition;

	iconHaloWidth: MGLStyleValue<number>;

	iconHaloWidthTransition: MGLTransition;

	iconIgnoresPlacement: MGLStyleValue<number>;

	iconImageName: MGLStyleValue<string>;

	iconOffset: MGLStyleValue<NSValue>;

	iconOpacity: MGLStyleValue<number>;

	iconOpacityTransition: MGLTransition;

	iconOptional: MGLStyleValue<number>;

	iconPadding: MGLStyleValue<number>;

	iconRotation: MGLStyleValue<number>;

	iconRotationAlignment: MGLStyleValue<NSValue>;

	iconScale: MGLStyleValue<number>;

	iconTextFit: MGLStyleValue<NSValue>;

	iconTextFitPadding: MGLStyleValue<NSValue>;

	iconTranslation: MGLStyleValue<NSValue>;

	iconTranslationAnchor: MGLStyleValue<NSValue>;

	iconTranslationTransition: MGLTransition;

	keepsIconUpright: MGLStyleValue<number>;

	keepsTextUpright: MGLStyleValue<number>;

	maximumTextAngle: MGLStyleValue<number>;

	maximumTextWidth: MGLStyleValue<number>;

	symbolAvoidsEdges: MGLStyleValue<number>;

	symbolPlacement: MGLStyleValue<NSValue>;

	symbolSpacing: MGLStyleValue<number>;

	text: MGLStyleValue<string>;

	textAllowsOverlap: MGLStyleValue<number>;

	textAnchor: MGLStyleValue<NSValue>;

	textColor: MGLStyleValue<UIColor>;

	textColorTransition: MGLTransition;

	textFontNames: MGLStyleValue<NSArray<string>>;

	textFontSize: MGLStyleValue<number>;

	textHaloBlur: MGLStyleValue<number>;

	textHaloBlurTransition: MGLTransition;

	textHaloColor: MGLStyleValue<UIColor>;

	textHaloColorTransition: MGLTransition;

	textHaloWidth: MGLStyleValue<number>;

	textHaloWidthTransition: MGLTransition;

	textIgnoresPlacement: MGLStyleValue<number>;

	textJustification: MGLStyleValue<NSValue>;

	textLetterSpacing: MGLStyleValue<number>;

	textLineHeight: MGLStyleValue<number>;

	textOffset: MGLStyleValue<NSValue>;

	textOpacity: MGLStyleValue<number>;

	textOpacityTransition: MGLTransition;

	textOptional: MGLStyleValue<number>;

	textPadding: MGLStyleValue<number>;

	textPitchAlignment: MGLStyleValue<NSValue>;

	textRotation: MGLStyleValue<number>;

	textRotationAlignment: MGLStyleValue<NSValue>;

	textTransform: MGLStyleValue<NSValue>;

	textTranslation: MGLStyleValue<NSValue>;

	textTranslationAnchor: MGLStyleValue<NSValue>;

	textTranslationTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLTextAnchor {

	Center = 0,

	Left = 1,

	Right = 2,

	Top = 3,

	Bottom = 4,

	TopLeft = 5,

	TopRight = 6,

	BottomLeft = 7,

	BottomRight = 8
}

declare const enum MGLTextJustification {

	Left = 0,

	Center = 1,

	Right = 2
}

declare const enum MGLTextPitchAlignment {

	Map = 0,

	Viewport = 1,

	Auto = 2
}

declare const enum MGLTextRotationAlignment {

	Map = 0,

	Viewport = 1,

	Auto = 2
}

declare const enum MGLTextTransform {

	None = 0,

	Uppercase = 1,

	Lowercase = 2
}

declare const enum MGLTextTranslationAnchor {

	Map = 0,

	Viewport = 1
}

declare const enum MGLTileCoordinateSystem {

	XYZ = 0,

	TMS = 1
}

declare class MGLTilePyramidOfflineRegion extends NSObject implements MGLOfflineRegion, NSCopying, NSSecureCoding {

	static alloc(): MGLTilePyramidOfflineRegion; // inherited from NSObject

	static new(): MGLTilePyramidOfflineRegion; // inherited from NSObject

	readonly bounds: MGLCoordinateBounds;

	readonly maximumZoomLevel: number;

	readonly minimumZoomLevel: number;

	readonly styleURL: NSURL;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { styleURL: NSURL; bounds: MGLCoordinateBounds; fromZoomLevel: number; toZoomLevel: number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithStyleURLBoundsFromZoomLevelToZoomLevel(styleURL: NSURL, bounds: MGLCoordinateBounds, minimumZoomLevel: number, maximumZoomLevel: number): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLTileSource extends MGLSource {

	static alloc(): MGLTileSource; // inherited from NSObject

	static new(): MGLTileSource; // inherited from NSObject

	readonly attributionInfos: NSArray<MGLAttributionInfo>;

	readonly configurationURL: NSURL;
}

declare var MGLTileSourceOptionAttributionHTMLString: string;

declare var MGLTileSourceOptionAttributionInfos: string;

declare var MGLTileSourceOptionMaximumZoomLevel: string;

declare var MGLTileSourceOptionMinimumZoomLevel: string;

declare var MGLTileSourceOptionTileCoordinateSystem: string;

declare var MGLTileSourceOptionTileSize: string;

interface MGLTransition {
	duration: number;
	delay: number;
}
declare var MGLTransition: interop.StructType<MGLTransition>;

declare class MGLUserLocation extends NSObject implements MGLAnnotation, NSSecureCoding {

	static alloc(): MGLUserLocation; // inherited from NSObject

	static new(): MGLUserLocation; // inherited from NSObject

	readonly heading: CLHeading;

	readonly location: CLLocation;

	subtitle: string;

	title: string;

	readonly updating: boolean;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MGLUserLocationAnnotationView extends MGLAnnotationView {

	static alloc(): MGLUserLocationAnnotationView; // inherited from NSObject

	static appearance(): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static new(): MGLUserLocationAnnotationView; // inherited from NSObject

	readonly hitTestLayer: CALayer;

	readonly mapView: MGLMapView;

	readonly userLocation: MGLUserLocation;

	update(): void;
}

declare const enum MGLUserTrackingMode {

	None = 0,

	Follow = 1,

	FollowWithHeading = 2,

	FollowWithCourse = 3
}

declare class MGLVectorSource extends MGLTileSource {

	static alloc(): MGLVectorSource; // inherited from NSObject

	static new(): MGLVectorSource; // inherited from NSObject

	constructor(o: { identifier: string; configurationURL: NSURL; });

	constructor(o: { identifier: string; tileURLTemplates: NSArray<string>; options: NSDictionary<string, any>; });

	featuresInSourceLayersWithIdentifiersPredicate(sourceLayerIdentifiers: NSSet<string>, predicate: NSPredicate): NSArray<MGLFeature>;

	initWithIdentifierConfigurationURL(identifier: string, configurationURL: NSURL): this;

	initWithIdentifierTileURLTemplatesOptions(identifier: string, tileURLTemplates: NSArray<string>, options: NSDictionary<string, any>): this;
}

declare class MGLVectorStyleLayer extends MGLForegroundStyleLayer {

	static alloc(): MGLVectorStyleLayer; // inherited from NSObject

	static new(): MGLVectorStyleLayer; // inherited from NSObject

	predicate: NSPredicate;

	sourceLayerIdentifier: string;
}

declare var MapboxVersionNumber: number;

declare var MapboxVersionString: interop.Reference<number>;
