var q = require ('q');
var https = require('https');
var http = require('http');
var http = require('follow-redirects').http;
var _ = require('lodash');

module.exports = {

  pokemonAPIcall : function (path, method, post_data) {

    var deferred = q.defer();

    var options = {
      host: 'pokeapi.co',
      path: "/api/v2" + path,
      method: method,
      headers: {
        accept: "*/*",
        'Content-Type': 'application/json'
      }
    };

    var req = http.request(options, function(res) {
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
    var path = "/pokemon/" + pokemon_number;
    var method = "GET";

    this.pokemonAPIcall(path, method, null)
      .then(function (pokemon){
        console.log(JSON.parse(pokemon).sprites);
        deferred.resolve(JSON.parse(pokemon));
      })
      .catch(function (error) {
        console.log('error');
        console.log(error);
        deferred.reject(error);
      });

    return deferred.promise;
  }

};

return module.exports;
