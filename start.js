// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require("babel-register")({
  //presets: [ 'e' ]
});
require("babel-polyfill");

module.exports = require("./bin/www");

//API KEY :-> md-K1J1RKNGNPxq249y8BwejQ
