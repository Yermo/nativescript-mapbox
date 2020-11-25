require("@nativescript/core/application");
if (!global["__snapshot"]) {

  // In case snapshot generation is enabled these modules will get into the bundle
  // but will not be required/evaluated.
  // The snapshot webpack plugin will add them to the tns-java-classes.js bundle file.
  // This way, they will be evaluated on app start as early as possible.

  require("@nativescript/core/ui/frame");
  require("@nativescript/core/ui/frame/activity");
}
