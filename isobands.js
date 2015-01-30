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

function getJenks(points) {
  return turf.jenks(points, 'nearest_park_dist', 8);
}


getPoints("buildings_with_distances.json")
  .then(function(points) {
    var resolution = 0.2
    var breaks = [0.001,0.5,1.0,1.5,2.0,2.5,3.0,3.5,4.0,4.5,5.0]
    // var isobands = turf.isobands(points, 'nearest_park_dist', resolution, breaks);
    var jenks = getJenks(points)
    jf.writeFileSync("iso.json", jenks)
  });
