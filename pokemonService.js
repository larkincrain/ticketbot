var q = require ('q');
var https = require('https');
var _ = require('lodash');

module.exports = {

  pokemonAPIcall : function (path, method, post_data) {

    var deferred = q.defer();

    var options = {
      host: 'http://pokeapi.co',
      path: "/api/v2/" + path,
      method: method,
      headers: {
        accept: "*/*",
        'Content-Type': 'application/json'
      }
    };

    var req = https.request(options, function(res) {

      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        deferred.resolve(body);
      });
    });

    // post the data
    if (method == 'POST') {
      req.write(post_data);
    }

    req.end();

    req.on('error', function(e) {
      deferred.reject(e);
    });

    return deferred.promise;
  },

  getPokemon : function (pokemon_number) {

    var deferred = q.defer();
    var path = "pokemon/" + pokemon_number;
    var method = "GET";

    this.pokemonAPIcall(path, method)
      .then(function (pokemon){
        deferred.resolve(JSON.parse(pokemon));
      })
      .catch(function (error) {
        console.log(error);
        deferred.reject(error);
      });

    return deferred.promise;
  }

};

return module.exports;
