var _ = require('underscore');
_.mixin( require('underscore.deferred') );
var jf = require('jsonfile');

var turf = require('turf');
var fs = require('fs');


var filename = "parks.json";

function getCentroids(filename) {
  var dfd = new _.Deferred();
  fs.readFile(filename, 'utf8', function(error, data) {
    var centroids = [];
    var json = JSON.parse(data);
    json.features.forEach(function(park) {
      var centroid = turf.centroid(park);
      centroid.properties = park.properties;
      centroids.push(centroid);
    })

    dfd.resolve( turf.featurecollection(centroids));
  });
  return dfd.promise();
}

function findNearest(filename, centroids) {
  var dfd = new _.Deferred();
  fs.readFile(filename, 'utf8', function(error, data) {
    var buildings = []
    var json = JSON.parse(data);
    json.features.forEach(function(building) {
      var building_centroid = turf.centroid(building);
      var nearest_park = turf.nearest(building_centroid, centroids);
      var distance = turf.distance(building_centroid, nearest_park, 'miles');
      if (distance < 5.0) { //(distance > 1.0) {
        building.properties.nearest_park = nearest_park.properties['NAME'];
        building.properties.nearest_park_dist = distance;
        building_centroid.properties = building.properties;
        buildings.push(building_centroid);
      }
    });

    dfd.resolve(turf.featurecollection(buildings));
  });
  return dfd.promise();
}

getCentroids(filename)
  .then(function(centroids) {
    var buildings_file = "buildings.json";
    return findNearest(buildings_file, centroids);
  }).then(function(buildings) {
    jf.writeFileSync("buildings_with_distances.json", buildings)
  })
