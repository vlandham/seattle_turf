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

function getCounts(points) {
  var counts = {'near':0,'far':0, 'parks':{}}
  points.features.forEach(function(building) {
    var dist = Math.round(building.properties.nearest_park_dist);
    if (dist  < 1.0) {
      if(!counts.parks[building.properties['nearest_park']]) {
        counts.parks[building.properties['nearest_park']] = 0
      }
      counts.parks[building.properties['nearest_park']] += 1
      counts['near'] += 1
    } else {
      counts['far'] += 1
    }

  });
  return counts;
}


getPoints("buildings_with_distances.json")
  .then(function(points) {
    var counts = getCounts(points)
    jf.writeFileSync("counts.json", counts)
  });
