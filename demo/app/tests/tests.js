var MapboxPlugin = require("nativescript-mapbox").Mapbox;
var mapbox = new MapboxPlugin();

describe("show", function () {
  it("exists", function () {
    expect(mapbox.show).toBeDefined();
  });

  it("returns a promise", function () {
    expect(mapbox.show()).toEqual(jasmine.any(Promise));
  });
});
