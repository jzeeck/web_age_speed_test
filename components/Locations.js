// Private

/*
1) Germany          - ec2-eu-central-1
2) Amsterdam, NL    - missing defaults to vancouver
3) Denver, USA      - missing
4) Oregon, USA      - ec2-us-west-2
5) Ireland, UK      - ec2-eu-west-1
6) Australia        - ec2-ap-southeast-2
*/

const locations = {
  'Germany':   'ec2-eu-central-1:Chrome',
  'Ireland':   'ec2-eu-west-1:Chrome',
  'Oregon':    'ec2-us-west-2:Chrome',
  'Australia': 'ec2-ap-southeast-2:Chrome'
  // etc.
};

// Public
module.exports = Locations;
function Locations() {}

Locations.prototype.getLocation = function(location) {
    return locations[location];
}

Locations.prototype.getKeys = function() {
    var keys = [];
    for (var key in locations) {
        if (locations.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}