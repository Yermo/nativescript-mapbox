
declare var MGLAbstractClassException: string;

declare class MGLAccountManager extends NSObject {

	static alloc(): MGLAccountManager; // inherited from NSObject

	static new(): MGLAccountManager; // inherited from NSObject

	static accessToken: string;
}

declare function MGLAltitudeForZoomLevel(zoomLevel: number, pitch: number, latitude: number, size: CGSize): number;

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

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MGLAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MGLAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MGLAnnotationView; // inherited from UIAppearance

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

declare class MGLAttributedExpression extends NSObject {

	static alloc(): MGLAttributedExpression; // inherited from NSObject

	static attributedExpressionAttributes(expression: NSExpression, attrs: NSDictionary<string, NSExpression>): MGLAttributedExpression;

	static attributedExpressionFontNamesFontScale(expression: NSExpression, fontNames: NSArray<string> | string[], fontScale: number): MGLAttributedExpression;

	static new(): MGLAttributedExpression; // inherited from NSObject

	readonly attributes: NSDictionary<string, NSExpression>;

	expression: NSExpression;

	constructor(o: { expression: NSExpression; });

	constructor(o: { expression: NSExpression; attributes: NSDictionary<string, NSExpression>; });

	initWithExpression(expression: NSExpression): this;

	initWithExpressionAttributes(expression: NSExpression, attrs: NSDictionary<string, NSExpression>): this;
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

	titleWithStyle(style: MGLAttributionInfoStyle): NSAttributedString;
}

declare const enum MGLAttributionInfoStyle {

	Short = 1,

	Medium = 2,

	Long = 3
}

declare class MGLBackgroundStyleLayer extends MGLStyleLayer {

	static alloc(): MGLBackgroundStyleLayer; // inherited from NSObject

	static new(): MGLBackgroundStyleLayer; // inherited from NSObject

	backgroundColor: NSExpression;

	backgroundColorTransition: MGLTransition;

	backgroundOpacity: NSExpression;

	backgroundOpacityTransition: MGLTransition;

	backgroundPattern: NSExpression;

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

	marginInsetsHintForPresentationFromRect?(rect: CGRect): UIEdgeInsets;

	presentCalloutFromRectInViewConstrainedToRectAnimated(rect: CGRect, view: UIView, constrainedRect: CGRect, animated: boolean): void;
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

declare const enum MGLCameraChangeReason {

	None = 0,

	Programmatic = 1,

	ResetNorth = 2,

	GesturePan = 4,

	GesturePinch = 8,

	GestureRotate = 16,

	GestureZoomIn = 32,

	GestureZoomOut = 64,

	GestureOneFingerZoom = 128,

	GestureTilt = 256,

	TransitionCancelled = 65536
}

declare const enum MGLCirclePitchAlignment {

	Map = 0,

	Viewport = 1
}

declare const enum MGLCircleScaleAlignment {

	Map = 0,

	Viewport = 1
}

declare class MGLCircleStyleLayer extends MGLVectorStyleLayer {

	static alloc(): MGLCircleStyleLayer; // inherited from NSObject

	static new(): MGLCircleStyleLayer; // inherited from NSObject

	circleBlur: NSExpression;

	circleBlurTransition: MGLTransition;

	circleColor: NSExpression;

	circleColorTransition: MGLTransition;

	circleOpacity: NSExpression;

	circleOpacityTransition: MGLTransition;

	circlePitchAlignment: NSExpression;

	circleRadius: NSExpression;

	circleRadiusTransition: MGLTransition;

	circleScaleAlignment: NSExpression;

	circleStrokeColor: NSExpression;

	circleStrokeColorTransition: MGLTransition;

	circleStrokeOpacity: NSExpression;

	circleStrokeOpacityTransition: MGLTransition;

	circleStrokeWidth: NSExpression;

	circleStrokeWidthTransition: MGLTransition;

	circleTranslation: NSExpression;

	circleTranslationAnchor: NSExpression;

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

interface MGLCluster extends MGLFeature {

	clusterIdentifier: number;

	clusterPointCount: number;
}
declare var MGLCluster: {

	prototype: MGLCluster;
};

declare var MGLClusterIdentifierInvalid: number;

declare class MGLCompassDirectionFormatter extends NSFormatter {

	static alloc(): MGLCompassDirectionFormatter; // inherited from NSObject

	static new(): MGLCompassDirectionFormatter; // inherited from NSObject

	unitStyle: NSFormattingUnitStyle;

	stringFromDirection(direction: number): string;
}

declare class MGLComputedShapeSource extends MGLSource {

	static alloc(): MGLComputedShapeSource; // inherited from NSObject

	static new(): MGLComputedShapeSource; // inherited from NSObject

	dataSource: MGLComputedShapeSourceDataSource;

	readonly requestQueue: NSOperationQueue;

	constructor(o: { identifier: string; dataSource: MGLComputedShapeSourceDataSource; options: NSDictionary<string, any>; });

	constructor(o: { identifier: string; options: NSDictionary<string, any>; });

	initWithIdentifierDataSourceOptions(identifier: string, dataSource: MGLComputedShapeSourceDataSource, options: NSDictionary<string, any>): this;

	initWithIdentifierOptions(identifier: string, options: NSDictionary<string, any>): this;

	invalidateBounds(bounds: MGLCoordinateBounds): void;

	invalidateTileAtXYZoomLevel(x: number, y: number, zoomLevel: number): void;

	setFeaturesInTileAtXYZoomLevel(features: NSArray<MGLShape> | MGLShape[], x: number, y: number, zoomLevel: number): void;
}

interface MGLComputedShapeSourceDataSource extends NSObjectProtocol {

	featuresInCoordinateBoundsZoomLevel?(bounds: MGLCoordinateBounds, zoomLevel: number): NSArray<MGLShape>;

	featuresInTileAtXYZoomLevel?(x: number, y: number, zoomLevel: number): NSArray<MGLShape>;
}
declare var MGLComputedShapeSourceDataSource: {

	prototype: MGLComputedShapeSourceDataSource;
};

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

interface MGLCoordinateQuad {
	topLeft: CLLocationCoordinate2D;
	bottomLeft: CLLocationCoordinate2D;
	bottomRight: CLLocationCoordinate2D;
	topRight: CLLocationCoordinate2D;
}
declare var MGLCoordinateQuad: interop.StructType<MGLCoordinateQuad>;

interface MGLCoordinateSpan {
	latitudeDelta: number;
	longitudeDelta: number;
}
declare var MGLCoordinateSpan: interop.StructType<MGLCoordinateSpan>;

declare var MGLCoordinateSpanZero: MGLCoordinateSpan;

declare const enum MGLDEMEncoding {

	Mapbox = 0,

	Terrarium = 1
}

declare class MGLDistanceFormatter extends NSLengthFormatter {

	static alloc(): MGLDistanceFormatter; // inherited from NSObject

	static new(): MGLDistanceFormatter; // inherited from NSObject

	stringFromDistance(distance: number): string;
}

declare class MGLEmptyFeature extends MGLShape implements MGLFeature {

	static alloc(): MGLEmptyFeature; // inherited from NSObject

	static new(): MGLEmptyFeature; // inherited from NSObject

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

	readonly;  // inherited from NSObjectProtocol

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

declare const enum MGLErrorCode {

	Unknown = -1,

	NotFound = 1,

	BadServerResponse = 2,

	ConnectionFailed = 3,

	ParseStyleFailed = 4,

	LoadStyleFailed = 5,

	SnapshotFailed = 6,

	SourceIsInUseCannotRemove = 7,

	SourceIdentifierMismatch = 8
}

declare var MGLErrorDomain: string;

declare var MGLExpressionInterpolationModeCubicBezier: string;

declare var MGLExpressionInterpolationModeExponential: string;

declare var MGLExpressionInterpolationModeLinear: string;

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

	fillExtrusionBase: NSExpression;

	fillExtrusionBaseTransition: MGLTransition;

	fillExtrusionColor: NSExpression;

	fillExtrusionColorTransition: MGLTransition;

	fillExtrusionHasVerticalGradient: NSExpression;

	fillExtrusionHeight: NSExpression;

	fillExtrusionHeightTransition: MGLTransition;

	fillExtrusionOpacity: NSExpression;

	fillExtrusionOpacityTransition: MGLTransition;

	fillExtrusionPattern: NSExpression;

	fillExtrusionPatternTransition: MGLTransition;

	fillExtrusionTranslation: NSExpression;

	fillExtrusionTranslationAnchor: NSExpression;

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

	fillAntialiased: NSExpression;

	fillColor: NSExpression;

	fillColorTransition: MGLTransition;

	fillOpacity: NSExpression;

	fillOpacityTransition: MGLTransition;

	fillOutlineColor: NSExpression;

	fillOutlineColorTransition: MGLTransition;

	fillPattern: NSExpression;

	fillPatternTransition: MGLTransition;

	fillTranslation: NSExpression;

	fillTranslationAnchor: NSExpression;

	fillTranslationTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLFillTranslationAnchor {

	Map = 0,

	Viewport = 1
}

declare var MGLFontColorAttribute: string;

declare var MGLFontNamesAttribute: string;

declare var MGLFontScaleAttribute: string;

declare class MGLForegroundStyleLayer extends MGLStyleLayer {

	static alloc(): MGLForegroundStyleLayer; // inherited from NSObject

	static new(): MGLForegroundStyleLayer; // inherited from NSObject

	readonly sourceIdentifier: string;
}

declare class MGLHeatmapStyleLayer extends MGLVectorStyleLayer {

	static alloc(): MGLHeatmapStyleLayer; // inherited from NSObject

	static new(): MGLHeatmapStyleLayer; // inherited from NSObject

	heatmapColor: NSExpression;

	heatmapIntensity: NSExpression;

	heatmapIntensityTransition: MGLTransition;

	heatmapOpacity: NSExpression;

	heatmapOpacityTransition: MGLTransition;

	heatmapRadius: NSExpression;

	heatmapRadiusTransition: MGLTransition;

	heatmapWeight: NSExpression;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLHillshadeIlluminationAnchor {

	Map = 0,

	Viewport = 1
}

declare class MGLHillshadeStyleLayer extends MGLForegroundStyleLayer {

	static alloc(): MGLHillshadeStyleLayer; // inherited from NSObject

	static new(): MGLHillshadeStyleLayer; // inherited from NSObject

	hillshadeAccentColor: NSExpression;

	hillshadeAccentColorTransition: MGLTransition;

	hillshadeExaggeration: NSExpression;

	hillshadeExaggerationTransition: MGLTransition;

	hillshadeHighlightColor: NSExpression;

	hillshadeHighlightColorTransition: MGLTransition;

	hillshadeIlluminationAnchor: NSExpression;

	hillshadeIlluminationDirection: NSExpression;

	hillshadeShadowColor: NSExpression;

	hillshadeShadowColorTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLIconAnchor {

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

declare const enum MGLIconPitchAlignment {

	Map = 0,

	Viewport = 1,

	Auto = 2
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

declare class MGLImageSource extends MGLSource {

	static alloc(): MGLImageSource; // inherited from NSObject

	static new(): MGLImageSource; // inherited from NSObject

	URL: NSURL;

	coordinates: MGLCoordinateQuad;

	image: UIImage;

	constructor(o: { identifier: string; coordinateQuad: MGLCoordinateQuad; image: UIImage; });

	constructor(o: { identifier: string; coordinateQuad: MGLCoordinateQuad; URL: NSURL; });

	initWithIdentifierCoordinateQuadImage(identifier: string, coordinateQuad: MGLCoordinateQuad, image: UIImage): this;

	initWithIdentifierCoordinateQuadURL(identifier: string, coordinateQuad: MGLCoordinateQuad, url: NSURL): this;
}

declare var MGLInvalidDatasourceException: string;

declare var MGLInvalidOfflinePackException: string;

declare var MGLInvalidStyleLayerException: string;

declare var MGLInvalidStyleURLException: string;

declare class MGLLight extends NSObject {

	static alloc(): MGLLight; // inherited from NSObject

	static new(): MGLLight; // inherited from NSObject

	anchor: NSExpression;

	color: NSExpression;

	colorTransition: MGLTransition;

	intensity: NSExpression;

	intensityTransition: MGLTransition;

	position: NSExpression;

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

	lineBlur: NSExpression;

	lineBlurTransition: MGLTransition;

	lineCap: NSExpression;

	lineColor: NSExpression;

	lineColorTransition: MGLTransition;

	lineDashPattern: NSExpression;

	lineDashPatternTransition: MGLTransition;

	lineGapWidth: NSExpression;

	lineGapWidthTransition: MGLTransition;

	lineGradient: NSExpression;

	lineJoin: NSExpression;

	lineMiterLimit: NSExpression;

	lineOffset: NSExpression;

	lineOffsetTransition: MGLTransition;

	lineOpacity: NSExpression;

	lineOpacityTransition: MGLTransition;

	linePattern: NSExpression;

	linePatternTransition: MGLTransition;

	lineRoundLimit: NSExpression;

	lineTranslation: NSExpression;

	lineTranslationAnchor: NSExpression;

	lineTranslationTransition: MGLTransition;

	lineWidth: NSExpression;

	lineWidthTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLLineTranslationAnchor {

	Map = 0,

	Viewport = 1
}

interface MGLLocationManager extends NSObjectProtocol {

	authorizationStatus: CLAuthorizationStatus;

	delegate: MGLLocationManagerDelegate;

	headingOrientation: CLDeviceOrientation;

	activityType?(): CLActivityType;

	desiredAccuracy?(): number;

	dismissHeadingCalibrationDisplay(): void;

	distanceFilter?(): number;

	requestAlwaysAuthorization(): void;

	requestWhenInUseAuthorization(): void;

	setActivityType?(activityType: CLActivityType): void;

	setDesiredAccuracy?(desiredAccuracy: number): void;

	setDistanceFilter?(distanceFilter: number): void;

	startUpdatingHeading(): void;

	startUpdatingLocation(): void;

	stopUpdatingHeading(): void;

	stopUpdatingLocation(): void;
}
declare var MGLLocationManager: {

	prototype: MGLLocationManager;
};

interface MGLLocationManagerDelegate extends NSObjectProtocol {

	locationManagerDidFailWithError(manager: MGLLocationManager, error: NSError): void;

	locationManagerDidUpdateHeading(manager: MGLLocationManager, newHeading: CLHeading): void;

	locationManagerDidUpdateLocations(manager: MGLLocationManager, locations: NSArray<CLLocation> | CLLocation[]): void;

	locationManagerShouldDisplayHeadingCalibration(manager: MGLLocationManager): boolean;
}
declare var MGLLocationManagerDelegate: {

	prototype: MGLLocationManagerDelegate;
};

declare class MGLLoggingConfiguration extends NSObject {

	static alloc(): MGLLoggingConfiguration; // inherited from NSObject

	static new(): MGLLoggingConfiguration; // inherited from NSObject

	loggingLevel: MGLLoggingLevel;

	static readonly sharedConfiguration: MGLLoggingConfiguration;
}

declare const enum MGLLoggingLevel {

	None = 0,

	Info = 1,

	Debug = 2,

	Error = 3,

	Fault = 4
}

declare class MGLMapCamera extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MGLMapCamera; // inherited from NSObject

	static camera(): MGLMapCamera;

	static cameraLookingAtCenterCoordinateAcrossDistancePitchHeading(centerCoordinate: CLLocationCoordinate2D, distance: number, pitch: number, heading: number): MGLMapCamera;

	static cameraLookingAtCenterCoordinateAltitudePitchHeading(centerCoordinate: CLLocationCoordinate2D, altitude: number, pitch: number, heading: number): MGLMapCamera;

	static cameraLookingAtCenterCoordinateFromDistancePitchHeading(centerCoordinate: CLLocationCoordinate2D, distance: number, pitch: number, heading: number): MGLMapCamera;

	static cameraLookingAtCenterCoordinateFromEyeCoordinateEyeAltitude(centerCoordinate: CLLocationCoordinate2D, eyeCoordinate: CLLocationCoordinate2D, eyeAltitude: number): MGLMapCamera;

	static new(): MGLMapCamera; // inherited from NSObject

	altitude: number;

	centerCoordinate: CLLocationCoordinate2D;

	heading: number;

	pitch: number;

	viewingDistance: number;

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

interface MGLMapPoint {
	x: number;
	y: number;
	zoomLevel: number;
}
declare var MGLMapPoint: interop.StructType<MGLMapPoint>;

declare function MGLMapPointForCoordinate(coordinate: CLLocationCoordinate2D, zoomLevel: number): MGLMapPoint;

declare class MGLMapSnapshot extends NSObject {

	static alloc(): MGLMapSnapshot; // inherited from NSObject

	static new(): MGLMapSnapshot; // inherited from NSObject

	readonly image: UIImage;

	coordinateForPoint(point: CGPoint): CLLocationCoordinate2D;

	pointForCoordinate(coordinate: CLLocationCoordinate2D): CGPoint;
}

declare class MGLMapSnapshotOptions extends NSObject {

	static alloc(): MGLMapSnapshotOptions; // inherited from NSObject

	static new(): MGLMapSnapshotOptions; // inherited from NSObject

	camera: MGLMapCamera;

	coordinateBounds: MGLCoordinateBounds;

	scale: number;

	readonly size: CGSize;

	readonly styleURL: NSURL;

	zoomLevel: number;

	constructor(o: { styleURL: NSURL; camera: MGLMapCamera; size: CGSize; });

	initWithStyleURLCameraSize(styleURL: NSURL, camera: MGLMapCamera, size: CGSize): this;
}

declare class MGLMapSnapshotter extends NSObject {

	static alloc(): MGLMapSnapshotter; // inherited from NSObject

	static new(): MGLMapSnapshotter; // inherited from NSObject

	readonly loading: boolean;

	options: MGLMapSnapshotOptions;

	constructor(o: { options: MGLMapSnapshotOptions; });

	cancel(): void;

	initWithOptions(options: MGLMapSnapshotOptions): this;

	startWithCompletionHandler(completionHandler: (p1: MGLMapSnapshot, p2: NSError) => void): void;

	startWithQueueCompletionHandler(queue: NSObject, completionHandler: (p1: MGLMapSnapshot, p2: NSError) => void): void;
}

declare class MGLMapView extends UIView {

	static alloc(): MGLMapView; // inherited from NSObject

	static appearance(): MGLMapView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MGLMapView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MGLMapView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MGLMapView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MGLMapView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MGLMapView; // inherited from UIAppearance

	static new(): MGLMapView; // inherited from NSObject

	allowsRotating: boolean;

	allowsScrolling: boolean;

	allowsTilting: boolean;

	allowsZooming: boolean;

	readonly annotations: NSArray<MGLAnnotation>;

	readonly attributionButton: UIButton;

	attributionButtonMargins: CGPoint;

	attributionButtonPosition: MGLOrnamentPosition;

	camera: MGLMapCamera;

	centerCoordinate: CLLocationCoordinate2D;

	readonly compassView: UIImageView;

	compassViewMargins: CGPoint;

	compassViewPosition: MGLOrnamentPosition;

	contentInset: UIEdgeInsets;

	debugMask: MGLMapDebugMaskOptions;

	decelerationRate: number;

	delegate: MGLMapViewDelegate;

	direction: number;

	displayHeadingCalibration: boolean;

	hapticFeedbackEnabled: boolean;

	latitude: number;

	locationManager: MGLLocationManager;

	readonly logoView: UIImageView;

	logoViewMargins: CGPoint;

	logoViewPosition: MGLOrnamentPosition;

	longitude: number;

	maximumZoomLevel: number;

	minimumZoomLevel: number;

	readonly overlays: NSArray<MGLOverlay>;

	pitchEnabled: boolean;

	preferredFramesPerSecond: number;

	prefetchesTiles: boolean;

	rotateEnabled: boolean;

	readonly scaleBar: UIView;

	scaleBarMargins: CGPoint;

	scaleBarPosition: MGLOrnamentPosition;

	scrollEnabled: boolean;

	selectedAnnotations: NSArray<MGLAnnotation>;

	showsHeading: boolean;

	showsScale: boolean;

	showsUserHeadingIndicator: boolean;

	showsUserLocation: boolean;

	readonly style: MGLStyle;

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

	addAnnotations(annotations: NSArray<MGLAnnotation> | MGLAnnotation[]): void;

	addOverlay(overlay: MGLOverlay): void;

	addOverlays(overlays: NSArray<MGLOverlay> | MGLOverlay[]): void;

	anchorPointForGesture(gesture: UIGestureRecognizer): CGPoint;

	cameraFittingCoordinateBoundsEdgePadding(camera: MGLMapCamera, bounds: MGLCoordinateBounds, insets: UIEdgeInsets): MGLMapCamera;

	cameraFittingShapeEdgePadding(camera: MGLMapCamera, shape: MGLShape, insets: UIEdgeInsets): MGLMapCamera;

	cameraThatFitsCoordinateBounds(bounds: MGLCoordinateBounds): MGLMapCamera;

	cameraThatFitsCoordinateBoundsEdgePadding(bounds: MGLCoordinateBounds, insets: UIEdgeInsets): MGLMapCamera;

	cameraThatFitsShapeDirectionEdgePadding(shape: MGLShape, direction: number, insets: UIEdgeInsets): MGLMapCamera;

	convertCoordinateBoundsToRectToView(bounds: MGLCoordinateBounds, view: UIView): CGRect;

	convertCoordinateToPointToView(coordinate: CLLocationCoordinate2D, view: UIView): CGPoint;

	convertPointToCoordinateFromView(point: CGPoint, view: UIView): CLLocationCoordinate2D;

	convertRectToCoordinateBoundsFromView(rect: CGRect, view: UIView): MGLCoordinateBounds;

	dequeueReusableAnnotationImageWithIdentifier(identifier: string): MGLAnnotationImage;

	dequeueReusableAnnotationViewWithIdentifier(identifier: string): MGLAnnotationView;

	deselectAnnotationAnimated(annotation: MGLAnnotation, animated: boolean): void;

	flyToCameraCompletionHandler(camera: MGLMapCamera, completion: () => void): void;

	flyToCameraWithDurationCompletionHandler(camera: MGLMapCamera, duration: number, completion: () => void): void;

	flyToCameraWithDurationPeakAltitudeCompletionHandler(camera: MGLMapCamera, duration: number, peakAltitude: number, completion: () => void): void;

	initWithFrameStyleURL(frame: CGRect, styleURL: NSURL): this;

	metersPerPointAtLatitude(latitude: number): number;

	reloadStyle(sender: any): void;

	removeAnnotation(annotation: MGLAnnotation): void;

	removeAnnotations(annotations: NSArray<MGLAnnotation> | MGLAnnotation[]): void;

	removeOverlay(overlay: MGLOverlay): void;

	removeOverlays(overlays: NSArray<MGLOverlay> | MGLOverlay[]): void;

	resetNorth(): void;

	resetPosition(): void;

	selectAnnotationAnimated(annotation: MGLAnnotation, animated: boolean): void;

	selectAnnotationMoveIntoViewAnimateSelection(annotation: MGLAnnotation, moveIntoView: boolean, animateSelection: boolean): void;

	setCameraAnimated(camera: MGLMapCamera, animated: boolean): void;

	setCameraWithDurationAnimationTimingFunction(camera: MGLMapCamera, duration: number, _function: CAMediaTimingFunction): void;

	setCameraWithDurationAnimationTimingFunctionCompletionHandler(camera: MGLMapCamera, duration: number, _function: CAMediaTimingFunction, completion: () => void): void;

	setCameraWithDurationAnimationTimingFunctionEdgePaddingCompletionHandler(camera: MGLMapCamera, duration: number, _function: CAMediaTimingFunction, edgePadding: UIEdgeInsets, completion: () => void): void;

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

	showAnnotationsAnimated(annotations: NSArray<MGLAnnotation> | MGLAnnotation[], animated: boolean): void;

	showAnnotationsEdgePaddingAnimated(annotations: NSArray<MGLAnnotation> | MGLAnnotation[], insets: UIEdgeInsets, animated: boolean): void;

	showAttribution(sender: any): void;

	updateUserLocationAnnotationView(): void;

	updateUserLocationAnnotationViewAnimatedWithDuration(duration: number): void;

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

	mapViewDidAddAnnotationViews?(mapView: MGLMapView, annotationViews: NSArray<MGLAnnotationView> | MGLAnnotationView[]): void;

	mapViewDidBecomeIdle?(mapView: MGLMapView): void;

	mapViewDidChangeUserTrackingModeAnimated?(mapView: MGLMapView, mode: MGLUserTrackingMode, animated: boolean): void;

	mapViewDidDeselectAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): void;

	mapViewDidDeselectAnnotationView?(mapView: MGLMapView, annotationView: MGLAnnotationView): void;

	mapViewDidFailLoadingMapWithError?(mapView: MGLMapView, error: NSError): void;

	mapViewDidFailToLoadImage?(mapView: MGLMapView, imageName: string): UIImage;

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

	mapViewRegionDidChangeWithReasonAnimated?(mapView: MGLMapView, reason: MGLCameraChangeReason, animated: boolean): void;

	mapViewRegionIsChanging?(mapView: MGLMapView): void;

	mapViewRegionIsChangingWithReason?(mapView: MGLMapView, reason: MGLCameraChangeReason): void;

	mapViewRegionWillChangeAnimated?(mapView: MGLMapView, animated: boolean): void;

	mapViewRegionWillChangeWithReasonAnimated?(mapView: MGLMapView, reason: MGLCameraChangeReason, animated: boolean): void;

	mapViewRightCalloutAccessoryViewForAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): UIView;

	mapViewShapeAnnotationIsEnabled?(mapView: MGLMapView, annotation: MGLShape): boolean;

	mapViewShouldChangeFromCameraToCamera?(mapView: MGLMapView, oldCamera: MGLMapCamera, newCamera: MGLMapCamera): boolean;

	mapViewShouldChangeFromCameraToCameraReason?(mapView: MGLMapView, oldCamera: MGLMapCamera, newCamera: MGLMapCamera, reason: MGLCameraChangeReason): boolean;

	mapViewStrokeColorForShapeAnnotation?(mapView: MGLMapView, annotation: MGLShape): UIColor;

	mapViewTapOnCalloutForAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): void;

	mapViewUserLocationAnchorPoint?(mapView: MGLMapView): CGPoint;

	mapViewViewForAnnotation?(mapView: MGLMapView, annotation: MGLAnnotation): MGLAnnotationView;

	mapViewWillStartLoadingMap?(mapView: MGLMapView): void;

	mapViewWillStartLocatingUser?(mapView: MGLMapView): void;

	mapViewWillStartRenderingFrame?(mapView: MGLMapView): void;

	mapViewWillStartRenderingMap?(mapView: MGLMapView): void;
}
declare var MGLMapViewDelegate: {

	prototype: MGLMapViewDelegate;
};

declare var MGLMapViewPreferredFramesPerSecondDefault: number;

declare var MGLMapViewPreferredFramesPerSecondLowPower: number;

declare var MGLMapViewPreferredFramesPerSecondMaximum: number;

interface MGLMatrix4 {
	m00: number;
	m01: number;
	m02: number;
	m03: number;
	m10: number;
	m11: number;
	m12: number;
	m13: number;
	m20: number;
	m21: number;
	m22: number;
	m23: number;
	m30: number;
	m31: number;
	m32: number;
	m33: number;
}
declare var MGLMatrix4: interop.StructType<MGLMatrix4>;

declare const enum MGLMetricType {

	Performance = 0
}

declare class MGLMetricsManager extends NSObject {

	static alloc(): MGLMetricsManager; // inherited from NSObject

	static new(): MGLMetricsManager; // inherited from NSObject

	delegate: MGLMetricsManagerDelegate;

	static readonly sharedManager: MGLMetricsManager;

	pushMetricWithAttributes(metricType: MGLMetricType, attributes: NSDictionary<any, any>): void;
}

interface MGLMetricsManagerDelegate extends NSObjectProtocol {

	metricsManagerDidCollectMetricWithAttributes(metricsManager: MGLMetricsManager, metricType: MGLMetricType, attributes: NSDictionary<any, any>): void;

	metricsManagerShouldHandleMetric(metricsManager: MGLMetricsManager, metricType: MGLMetricType): boolean;
}
declare var MGLMetricsManagerDelegate: {

	prototype: MGLMetricsManagerDelegate;
};

declare var MGLMissingLocationServicesUsageDescriptionException: string;

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

	static multiPolygonWithPolygons(polygons: NSArray<MGLPolygon> | MGLPolygon[]): MGLMultiPolygon;

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

	readonly;  // inherited from NSObjectProtocol

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

	static multiPolygonWithPolygons(polygons: NSArray<MGLPolygon> | MGLPolygon[]): MGLMultiPolygonFeature; // inherited from MGLMultiPolygon

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

	readonly;  // inherited from NSObjectProtocol

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

	static multiPolylineWithPolylines(polylines: NSArray<MGLPolyline> | MGLPolyline[]): MGLMultiPolyline;

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

	readonly;  // inherited from NSObjectProtocol

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

	static multiPolylineWithPolylines(polylines: NSArray<MGLPolyline> | MGLPolyline[]): MGLMultiPolylineFeature; // inherited from MGLMultiPolyline

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

	readonly;  // inherited from NSObjectProtocol

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

declare class MGLNetworkConfiguration extends NSObject {

	static alloc(): MGLNetworkConfiguration; // inherited from NSObject

	static new(): MGLNetworkConfiguration; // inherited from NSObject

	sessionConfiguration: NSURLSessionConfiguration;

	static readonly sharedManager: MGLNetworkConfiguration;
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

declare const enum MGLOfflinePackState {

	Unknown = 0,

	Inactive = 1,

	Active = 2,

	Complete = 3,

	Invalid = 4
}

declare var MGLOfflinePackUserInfoKeyError: string;

declare var MGLOfflinePackUserInfoKeyMaximumCount: string;

declare var MGLOfflinePackUserInfoKeyProgress: string;

declare var MGLOfflinePackUserInfoKeyState: string;

interface MGLOfflineRegion extends NSObjectProtocol {

	includesIdeographicGlyphs: boolean;

	styleURL: NSURL;
}
declare var MGLOfflineRegion: {

	prototype: MGLOfflineRegion;
};

declare class MGLOfflineStorage extends NSObject {

	static alloc(): MGLOfflineStorage; // inherited from NSObject

	static new(): MGLOfflineStorage; // inherited from NSObject

	readonly countOfBytesCompleted: number;

	delegate: MGLOfflineStorageDelegate;

	readonly packs: NSArray<MGLOfflinePack>;

	static readonly sharedOfflineStorage: MGLOfflineStorage;

	addContentsOfFileWithCompletionHandler(filePath: string, completion: (p1: NSURL, p2: NSArray<MGLOfflinePack>, p3: NSError) => void): void;

	addContentsOfURLWithCompletionHandler(fileURL: NSURL, completion: (p1: NSURL, p2: NSArray<MGLOfflinePack>, p3: NSError) => void): void;

	addPackForRegionWithContextCompletionHandler(region: MGLOfflineRegion, context: NSData, completion: (p1: MGLOfflinePack, p2: NSError) => void): void;

	preloadDataForURLModificationDateExpirationDateETagMustRevalidate(data: NSData, url: NSURL, modified: Date, expires: Date, eTag: string, mustRevalidate: boolean): void;

	putResourceWithUrlDataModifiedExpiresEtagMustRevalidate(url: NSURL, data: NSData, modified: Date, expires: Date, etag: string, mustRevalidate: boolean): void;

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

	readonly context: EAGLContext;

	readonly style: MGLStyle;

	constructor(o: { identifier: string; });

	didMoveToMapView(mapView: MGLMapView): void;

	drawInMapViewWithContext(mapView: MGLMapView, context: MGLStyleLayerDrawingContext): void;

	initWithIdentifier(identifier: string): this;

	setNeedsDisplay(): void;

	willMoveFromMapView(mapView: MGLMapView): void;
}

declare const enum MGLOrnamentPosition {

	TopLeft = 0,

	TopRight = 1,

	BottomLeft = 2,

	BottomRight = 3
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

	readonly;  // inherited from NSObjectProtocol

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

	readonly;  // inherited from NSObjectProtocol

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

	readonly;  // inherited from NSObjectProtocol

	attributeForKey(key: string): any;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	attributeForKey(key: string): any;

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

declare class MGLPointFeatureCluster extends MGLPointFeature implements MGLCluster {

	static alloc(): MGLPointFeatureCluster; // inherited from NSObject

	static new(): MGLPointFeatureCluster; // inherited from NSObject

	attributes: NSDictionary<string, any>; // inherited from MGLFeature

	readonly clusterIdentifier: number; // inherited from MGLCluster

	readonly clusterPointCount: number; // inherited from MGLCluster

	readonly coordinate: CLLocationCoordinate2D; // inherited from MGLAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	identifier: any; // inherited from MGLFeature

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MGLAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MGLAnnotation

	readonly;  // inherited from NSObjectProtocol

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

	static polygonWithCoordinatesCountInteriorPolygons(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number, interiorPolygons: NSArray<MGLPolygon> | MGLPolygon[]): MGLPolygon;

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

	readonly;  // inherited from NSObjectProtocol

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

	static polygonWithCoordinatesCountInteriorPolygons(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number, interiorPolygons: NSArray<MGLPolygon> | MGLPolygon[]): MGLPolygonFeature; // inherited from MGLPolygon

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

	readonly;  // inherited from NSObjectProtocol

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

	readonly;  // inherited from NSObjectProtocol

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

	readonly;  // inherited from NSObjectProtocol

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

declare class MGLRasterDEMSource extends MGLRasterTileSource {

	static alloc(): MGLRasterDEMSource; // inherited from NSObject

	static new(): MGLRasterDEMSource; // inherited from NSObject
}

declare const enum MGLRasterResamplingMode {

	Linear = 0,

	Nearest = 1
}

declare class MGLRasterStyleLayer extends MGLForegroundStyleLayer {

	static alloc(): MGLRasterStyleLayer; // inherited from NSObject

	static new(): MGLRasterStyleLayer; // inherited from NSObject

	maximumRasterBrightness: NSExpression;

	maximumRasterBrightnessTransition: MGLTransition;

	minimumRasterBrightness: NSExpression;

	minimumRasterBrightnessTransition: MGLTransition;

	rasterContrast: NSExpression;

	rasterContrastTransition: MGLTransition;

	rasterFadeDuration: NSExpression;

	rasterHueRotation: NSExpression;

	rasterHueRotationTransition: MGLTransition;

	rasterOpacity: NSExpression;

	rasterOpacityTransition: MGLTransition;

	rasterResamplingMode: NSExpression;

	rasterSaturation: NSExpression;

	rasterSaturationTransition: MGLTransition;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare class MGLRasterTileSource extends MGLTileSource {

	static alloc(): MGLRasterTileSource; // inherited from NSObject

	static new(): MGLRasterTileSource; // inherited from NSObject

	constructor(o: { identifier: string; configurationURL: NSURL; });

	constructor(o: { identifier: string; configurationURL: NSURL; tileSize: number; });

	constructor(o: { identifier: string; tileURLTemplates: NSArray<string> | string[]; options: NSDictionary<string, any>; });

	initWithIdentifierConfigurationURL(identifier: string, configurationURL: NSURL): this;

	initWithIdentifierConfigurationURLTileSize(identifier: string, configurationURL: NSURL, tileSize: number): this;

	initWithIdentifierTileURLTemplatesOptions(identifier: string, tileURLTemplates: NSArray<string> | string[], options: NSDictionary<string, any>): this;
}

declare var MGLRedundantLayerException: string;

declare var MGLRedundantLayerIdentifierException: string;

declare var MGLRedundantSourceException: string;

declare var MGLRedundantSourceIdentifierException: string;

declare const enum MGLResourceKind {

	Unknown = 0,

	Style = 1,

	Source = 2,

	Tile = 3,

	Glyphs = 4,

	SpriteImage = 5,

	SpriteJSON = 6,

	Image = 7
}

declare var MGLResourceNotFoundException: string;

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

	readonly;  // inherited from NSObjectProtocol

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

	static shapeCollectionWithShapes(shapes: NSArray<MGLShape> | MGLShape[]): MGLShapeCollection;

	readonly shapes: NSArray<MGLShape>;
}

declare class MGLShapeCollectionFeature extends MGLShapeCollection implements MGLFeature {

	static alloc(): MGLShapeCollectionFeature; // inherited from NSObject

	static new(): MGLShapeCollectionFeature; // inherited from NSObject

	static shapeCollectionWithShapes(shapes: NSArray<MGLShape> | MGLShape[]): MGLShapeCollectionFeature; // inherited from MGLShapeCollection

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

	readonly;  // inherited from NSObjectProtocol

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

declare class MGLShapeOfflineRegion extends NSObject implements MGLOfflineRegion, NSCopying, NSSecureCoding {

	static alloc(): MGLShapeOfflineRegion; // inherited from NSObject

	static new(): MGLShapeOfflineRegion; // inherited from NSObject

	readonly maximumZoomLevel: number;

	readonly minimumZoomLevel: number;

	readonly shape: MGLShape;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	includesIdeographicGlyphs: boolean; // inherited from MGLOfflineRegion

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly styleURL: NSURL; // inherited from MGLOfflineRegion

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly;  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { styleURL: NSURL; shape: MGLShape; fromZoomLevel: number; toZoomLevel: number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithStyleURLShapeFromZoomLevelToZoomLevel(styleURL: NSURL, shape: MGLShape, minimumZoomLevel: number, maximumZoomLevel: number): this;

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

	constructor(o: { identifier: string; features: NSArray<MGLShape> | MGLShape[]; options: NSDictionary<string, any>; });

	constructor(o: { identifier: string; shape: MGLShape; options: NSDictionary<string, any>; });

	constructor(o: { identifier: string; shapes: NSArray<MGLShape> | MGLShape[]; options: NSDictionary<string, any>; });

	constructor(o: { identifier: string; URL: NSURL; options: NSDictionary<string, any>; });

	childrenOfCluster(cluster: MGLPointFeatureCluster): NSArray<MGLFeature>;

	featuresMatchingPredicate(predicate: NSPredicate): NSArray<MGLFeature>;

	initWithIdentifierFeaturesOptions(identifier: string, features: NSArray<MGLShape> | MGLShape[], options: NSDictionary<string, any>): this;

	initWithIdentifierShapeOptions(identifier: string, shape: MGLShape, options: NSDictionary<string, any>): this;

	initWithIdentifierShapesOptions(identifier: string, shapes: NSArray<MGLShape> | MGLShape[], options: NSDictionary<string, any>): this;

	initWithIdentifierURLOptions(identifier: string, url: NSURL, options: NSDictionary<string, any>): this;

	leavesOfClusterOffsetLimit(cluster: MGLPointFeatureCluster, offset: number, limit: number): NSArray<MGLFeature>;

	zoomLevelForExpandingCluster(cluster: MGLPointFeatureCluster): number;
}

declare var MGLShapeSourceOptionBuffer: string;

declare var MGLShapeSourceOptionClipsCoordinates: string;

declare var MGLShapeSourceOptionClusterRadius: string;

declare var MGLShapeSourceOptionClustered: string;

declare var MGLShapeSourceOptionLineDistanceMetrics: string;

declare var MGLShapeSourceOptionMaximumZoomLevel: string;

declare var MGLShapeSourceOptionMaximumZoomLevelForClustering: string;

declare var MGLShapeSourceOptionMinimumZoomLevel: string;

declare var MGLShapeSourceOptionSimplificationTolerance: string;

declare var MGLShapeSourceOptionWrapsCoordinates: string;

declare class MGLSource extends NSObject {

	static alloc(): MGLSource; // inherited from NSObject

	static new(): MGLSource; // inherited from NSObject

	identifier: string;

	constructor(o: { identifier: string; });

	initWithIdentifier(identifier: string): this;
}

interface MGLSphericalPosition {
	radial: number;
	azimuthal: number;
	polar: number;
}
declare var MGLSphericalPosition: interop.StructType<MGLSphericalPosition>;

declare function MGLStringFromMetricType(metricType: MGLMetricType): string;

declare class MGLStyle extends NSObject {

	static alloc(): MGLStyle; // inherited from NSObject

	static darkStyleURLWithVersion(version: number): NSURL;

	static lightStyleURLWithVersion(version: number): NSURL;

	static new(): MGLStyle; // inherited from NSObject

	static outdoorsStyleURLWithVersion(version: number): NSURL;

	static satelliteStreetsStyleURLWithVersion(version: number): NSURL;

	static satelliteStyleURLWithVersion(version: number): NSURL;

	static streetsStyleURLWithVersion(version: number): NSURL;

	layers: NSArray<MGLStyleLayer>;

	light: MGLLight;

	readonly name: string;

	performsPlacementTransitions: boolean;

	sources: NSSet<MGLSource>;

	transition: MGLTransition;

	static readonly darkStyleURL: NSURL;

	static readonly lightStyleURL: NSURL;

	static readonly outdoorsStyleURL: NSURL;

	static readonly satelliteStreetsStyleURL: NSURL;

	static readonly satelliteStyleURL: NSURL;

	static readonly streetsStyleURL: NSURL;

	addLayer(layer: MGLStyleLayer): void;

	addSource(source: MGLSource): void;

	imageForName(name: string): UIImage;

	insertLayerAboveLayer(layer: MGLStyleLayer, sibling: MGLStyleLayer): void;

	insertLayerAtIndex(layer: MGLStyleLayer, index: number): void;

	insertLayerBelowLayer(layer: MGLStyleLayer, sibling: MGLStyleLayer): void;

	layerWithIdentifier(identifier: string): MGLStyleLayer;

	localizeLabelsIntoLocale(locale: NSLocale): void;

	removeImageForName(name: string): void;

	removeLayer(layer: MGLStyleLayer): void;

	removeSource(source: MGLSource): void;

	removeSourceError(source: MGLSource): boolean;

	setImageForName(image: UIImage, name: string): void;

	sourceWithIdentifier(identifier: string): MGLSource;
}

declare var MGLStyleDefaultVersion: number;

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
	projectionMatrix: MGLMatrix4;
}
declare var MGLStyleLayerDrawingContext: interop.StructType<MGLStyleLayerDrawingContext>;

declare const enum MGLSymbolPlacement {

	Point = 0,

	Line = 1,

	LineCenter = 2
}

declare class MGLSymbolStyleLayer extends MGLVectorStyleLayer {

	static alloc(): MGLSymbolStyleLayer; // inherited from NSObject

	static new(): MGLSymbolStyleLayer; // inherited from NSObject

	iconAllowsOverlap: NSExpression;

	iconAnchor: NSExpression;

	iconColor: NSExpression;

	iconColorTransition: MGLTransition;

	iconHaloBlur: NSExpression;

	iconHaloBlurTransition: MGLTransition;

	iconHaloColor: NSExpression;

	iconHaloColorTransition: MGLTransition;

	iconHaloWidth: NSExpression;

	iconHaloWidthTransition: MGLTransition;

	iconIgnoresPlacement: NSExpression;

	iconImageName: NSExpression;

	iconOffset: NSExpression;

	iconOpacity: NSExpression;

	iconOpacityTransition: MGLTransition;

	iconOptional: NSExpression;

	iconPadding: NSExpression;

	iconPitchAlignment: NSExpression;

	iconRotation: NSExpression;

	iconRotationAlignment: NSExpression;

	iconScale: NSExpression;

	iconTextFit: NSExpression;

	iconTextFitPadding: NSExpression;

	iconTranslation: NSExpression;

	iconTranslationAnchor: NSExpression;

	iconTranslationTransition: MGLTransition;

	keepsIconUpright: NSExpression;

	keepsTextUpright: NSExpression;

	maximumTextAngle: NSExpression;

	maximumTextWidth: NSExpression;

	symbolAvoidsEdges: NSExpression;

	symbolPlacement: NSExpression;

	symbolSortKey: NSExpression;

	symbolSpacing: NSExpression;

	symbolZOrder: NSExpression;

	text: NSExpression;

	textAllowsOverlap: NSExpression;

	textAnchor: NSExpression;

	textColor: NSExpression;

	textColorTransition: MGLTransition;

	textFontNames: NSExpression;

	textFontSize: NSExpression;

	textHaloBlur: NSExpression;

	textHaloBlurTransition: MGLTransition;

	textHaloColor: NSExpression;

	textHaloColorTransition: MGLTransition;

	textHaloWidth: NSExpression;

	textHaloWidthTransition: MGLTransition;

	textIgnoresPlacement: NSExpression;

	textJustification: NSExpression;

	textLetterSpacing: NSExpression;

	textLineHeight: NSExpression;

	textOffset: NSExpression;

	textOpacity: NSExpression;

	textOpacityTransition: MGLTransition;

	textOptional: NSExpression;

	textPadding: NSExpression;

	textPitchAlignment: NSExpression;

	textRadialOffset: NSExpression;

	textRotation: NSExpression;

	textRotationAlignment: NSExpression;

	textTransform: NSExpression;

	textTranslation: NSExpression;

	textTranslationAnchor: NSExpression;

	textTranslationTransition: MGLTransition;

	textVariableAnchor: NSExpression;

	constructor(o: { identifier: string; source: MGLSource; });

	initWithIdentifierSource(identifier: string, source: MGLSource): this;
}

declare const enum MGLSymbolZOrder {

	Auto = 0,

	ViewportY = 1,

	Source = 2
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

	Auto = 0,

	Left = 1,

	Center = 2,

	Right = 3
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

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	includesIdeographicGlyphs: boolean; // inherited from MGLOfflineRegion

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly styleURL: NSURL; // inherited from MGLOfflineRegion

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly;  // inherited from NSObjectProtocol

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

declare var MGLTileSourceOptionCoordinateBounds: string;

declare var MGLTileSourceOptionDEMEncoding: string;

declare var MGLTileSourceOptionMaximumZoomLevel: string;

declare var MGLTileSourceOptionMinimumZoomLevel: string;

declare var MGLTileSourceOptionTileCoordinateSystem: string;

declare var MGLTileSourceOptionTileSize: string;

interface MGLTransition {
	duration: number;
	delay: number;
}
declare var MGLTransition: interop.StructType<MGLTransition>;

declare var MGLUnsupportedRegionTypeException: string;

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

	readonly;  // inherited from NSObjectProtocol

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

declare var MGLUserLocationAnnotationTypeException: string;

declare class MGLUserLocationAnnotationView extends MGLAnnotationView {

	static alloc(): MGLUserLocationAnnotationView; // inherited from NSObject

	static appearance(): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MGLUserLocationAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MGLUserLocationAnnotationView; // inherited from UIAppearance

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

declare class MGLVectorStyleLayer extends MGLForegroundStyleLayer {

	static alloc(): MGLVectorStyleLayer; // inherited from NSObject

	static new(): MGLVectorStyleLayer; // inherited from NSObject

	predicate: NSPredicate;

	sourceLayerIdentifier: string;
}

declare class MGLVectorTileSource extends MGLTileSource {

	static alloc(): MGLVectorTileSource; // inherited from NSObject

	static new(): MGLVectorTileSource; // inherited from NSObject

	constructor(o: { identifier: string; configurationURL: NSURL; });

	constructor(o: { identifier: string; tileURLTemplates: NSArray<string> | string[]; options: NSDictionary<string, any>; });

	featuresInSourceLayersWithIdentifiersPredicate(sourceLayerIdentifiers: NSSet<string>, predicate: NSPredicate): NSArray<MGLFeature>;

	initWithIdentifierConfigurationURL(identifier: string, configurationURL: NSURL): this;

	initWithIdentifierTileURLTemplatesOptions(identifier: string, tileURLTemplates: NSArray<string> | string[], options: NSDictionary<string, any>): this;
}

declare function MGLZoomLevelForAltitude(altitude: number, pitch: number, latitude: number, size: CGSize): number;

declare var MapboxVersionNumber: number;

declare var MapboxVersionString: interop.Reference<number>;
