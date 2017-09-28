var q = require ('q');
var https = require('https');
var http = require('http');
var http = require('follow-redirects').http;
var _ = require('lodash');

module.exports = {

  user_info : [],

  addUserInfo : function (user_name, pokemon_name) {

    // first see if there already exists a record for this user_name
    if (this.getUserInfo (user_name) == null) {
      // then we want to add a new record
      this.user_info[user_info.length] = {
        user_name : user_name,
        pokemon_name : pokemon_name
      };

    } else {
      // then we need to update the existing record
      this.getUserInfo(user_name).pokemon_name = pokemon_name;
    };

    return true;
  },

  getUserInfo : function (user_name) {
    // we need to find a record in the user_info array with the user's name

    var user = _.find(this.user_info, function (user) {
      return user.user_name == user_name;
    });

    return user;
  },

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
