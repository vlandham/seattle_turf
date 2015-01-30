var _ = require('underscore');
_.mixin( require('underscore.deferred') );
var jf = require('jsonfile');

var turf = require('turf');
var fs = require('fs');

function getPoints(filename) {
  var dfd = new _.Deferred();
  fs.readFile(filename, 'utf8', function(error, data) {
    var centroids = [];
    var json = JSON.parse(data);

    dfd.resolve( json);
  });
  return dfd.promise();
}

function makeGrid(points) {
  var extent = turf.extent(points);
  var hexgrid = turf.hex(extent, 0.004);
  hexgrid.features.forEach(function(hex) {
    var hex_points = turf.within(points, turf.featurecollection([hex]));
    hex.properties.count = hex_points.features.length;
    var sum = 0;
    hex_points.features.forEach(function(point) {
      sum += point.properties.nearest_park_dist;
    });
    hex.properties.sum = sum;
  });

  return hexgrid;
}

getPoints("buildings_with_distances.json")
  .then(function(points) {
    var grid = makeGrid(points);
    jf.writeFileSync("grid.json", grid)
  })
