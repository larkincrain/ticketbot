var q = require ('q');
var https = require('https');
var _ = require('lodash');

var credentials = require('./credentials.json');

module.exports = {

  assembla_info : {
    users : [],
    milestones : [],
    tickets : [],
    loaded : false
  },

  setLoaded : function (loaded) {
    this.assembla_info.loaded = loaded;
  },

  setAssemblaUsers : function (users) {
    this.assembla_info.users = users;
  },

  setAssemblaMilestones : function (milestones) {
    this.assembla_info.milestones = milestones;

    _.forEach(this.assembla_info.milestones, function (milestone) {
      if (!milestone.tickets)
        milestone.tickets = [];
    });
  },

  setAssemblaTicketsByMilestone : function (milestone, tickets) {
    var milestoneToSaveTickets = _.find(this.assembla_info.milestones, function (milestoneIteration) {
      return milestoneIteration.id == milestone.id;
    });

    milestoneToSaveTickets.tickets = [];
    milestoneToSaveTickets.tickets = tickets;
  },

  assemblaAPIcall : function (path, method) {

    var deferred = q.defer();

    var options = {
      host: 'api.assembla.com',
      path: path,
      method: method,
      headers: {
        accept: "*/*",
        "X-Api-Key" : credentials.assembla_key,
        "X-Api-Secret" : credentials.assembla_secret
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

    req.end();

    req.on('error', function(e) {
      deferred.reject(e);
    });

    return deferred.promise;
  },

  // we want to get all the users and have a list of them to reference
  getUsers : function () {

    var deferred = q.defer();
    var path = "/v1/spaces/oaftrac/users.json";
    var method = "GET";

    if (this.assembla_info.users && this.assembla_info.users.length > 0) {
      deferred.resolve(this.assembla_info.users);
    }

    this.assemblaAPIcall(path, method)
      .then(function (users) {
        deferred.resolve(JSON.parse(users));
      })
      .catch(function (error) {
        console.log(error);
        deferred.reject(error);
      });

    return deferred.promise;
  },

  // we want to get all the milestones so we have a reference
  getMilestones : function () {

    var deferred = q.defer();
    var path = "/v1/spaces/oaftrac/milestones.json";
    var method = "GET";

    this.assemblaAPIcall(path, method)
      .then(function (milestones){
        deferred.resolve(JSON.parse(milestones));
      })
      .catch(function (error) {
        console.log(error);
        deferred.reject(error);
      });;

    return deferred.promise;
  },

  getTicketsByMilestone : function (milestoneId) {

    var deferred = q.defer();
    var path = "/v1/spaces/oaftrac/tickets/milestone/" + milestoneId + '?per_page=100';
    var method = "GET";

    this.assemblaAPIcall(path, method)
      .then(function (tickets){
        deferred.resolve(JSON.parse(tickets));
      });

    return deferred.promise;
  }
};

return module.exports;
