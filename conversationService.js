var _ = require('lodash');
var q = require ('q');

var assembla = require('./assemblaService.js');

module.exports = {

  isDataLoaded : function () {
    return assembla.assembla_info.loaded;
  },

  processMessage : function (message) {

    var deferred = q.defer();

    // Listens to all `message` events from the team
    console.log('New message: ');
    console.log(message);

    if (message.text.indexOf('ticketbot') > -1  &&
      message.text.indexOf('thanks') > -1) {
        deferred.resolve(":sparkling_heart: You're quite welcome! :kissing_closed_eyes: ");
      }
    else if (message.text.indexOf('ticketbot') > -1  &&
      message.text.indexOf('which tickets are in milestone ') > -1) {

        var tickets = [];
        var messageToSend = '';
        var milestone = null;
        var milestoneTitle = message.text.substring(message.text.indexOf('milestone') + 10, message.text.length) || '';
        var tickets = [];

        // check to make sure that data is loaded
        if (!this.isDataLoaded()) {
          return deferred.promise;
          deferred.resolve("I'm sorry captain, I can't do that now. You see, we don't have the data. So chill for a sec. :tea:");
        }

        milestone = _.find(assembla.assembla_info.milestones, function (milestone) {
          return milestone.title == milestoneTitle;
        });

        console.log('got milestone ' + milestone.title);

        if (milestone != null) {

          _.forEach(milestone.tickets, function (ticket) {
            if (ticket.milestone_id == milestone.id) {
              var upesiTicket = {
                number: ticket.number,
                status: ticket.status,
                author: ""
              };

              upesiTicket.author = _.find(assembla.assembla_info.users, function (user) {
                return user.id == ticket.assigned_to_id;
              }).name;

              tickets[tickets.length] = upesiTicket;
            }
          });

          console.log(tickets.length);

          messageToSend = JSON.stringify(tickets);
          deferred.resolve(messageToSend);

        } else {
          console.log('somethings fucky');
          messageToSend = 'somethings fucky';
          deferred.resolve(messageToSend);
        }
      }
    else if (message.text.indexOf('ticketbot') > -1  &&
      message.text.indexOf('how many tickets are open in all milestones') > -1) {

        var messageToSend = '';

        // check to make sure that data is loaded
        if (!this.isDataLoaded()) {
          return deferred.promise;
          deferred.resolve("I'm sorry captain, I can't do that now. You see, we don't have the data. So chill for a sec. :tea:");
        }

        _.forEach( assembla.assembla_info.milestones, function (milestone) {

          var intro = "Milestone " + milestone.title + " has : ";
          var ending = " open tickets. \r\n";
          var numberOfTickets = 0;

          _.forEach(milestone.tickets, function (ticket) {
            if (ticket.status == "New" ||
                ticket.status == "InProgress" ||
                ticket.status == "Ready")
                numberOfTickets ++;
          });

          messageToSend += intro + numberOfTickets + ending;
        });

        deferred.resolve(messageToSend);
    }
    else if (message.text.indexOf('ticketbot') > -1  &&
        message.text.indexOf('who has open tickets in milestone ' > -1)) {

          console.log('here');

          var messageToSend = "";
          var milestoneTitle = message.text.substring(message.text.indexOf('milestone') + 10, message.text.length) || '';

          // check to make sure that data is loaded
          if (!this.isDataLoaded()) {
            return deferred.promise;
            deferred.resolve("I'm sorry captain, I can't do that now. You see, we don't have the data. So chill for a sec. :tea:");
          }

          var milestone = _.find(assembla.assembla_info.milestones, function (milestone) {
            return milestone.title == milestoneTitle;
          });

          console.log(milestone);

          if (milestone.tickets && milestone.tickets.length > 0) {
            _.forEach( assembla.assembla_info.users, function(user) {
              var intro = "" + user.name + " has ";
              var numberOfTickets = 0;
              var ending = " ticket(s) open.";

              numberOfTickets = _.filter( milestone.tickets, function (ticket) {
                if ( ticket.assigned_to_id == user.id &&
                    (ticket.status == "New" ||
                    ticket.status == "InProgress" ||
                    ticket.status == "Ready") ) {
                    return true;
                  } else {
                    return false;
                  }
              }).length;

              if (numberOfTickets > 0) {
                messageToSend += intro + numberOfTickets + ending + "\r\n";
              }
              numberOfTickets = 0;
            });
        }

        if (messageToSend.length == 0) {
          messageToSend = ":tada: No open tickets! :tada:";
        }

        deferred.resolve(messageToSend);
    }
    else if (message.text.indexOf('ticketbot') > -1  &&
      message.text.indexOf('milestones') > -1) {

        // check to make sure that data is loaded
        if (!this.isDataLoaded()) {
          return deferred.promise;
          deferred.resolve("I'm sorry captain, I can't do that now. You see, we don't have the data. So chill for a sec. :tea:");
        }

        assembla.getMilestones()
          .then(function(milestones) {
            var milestoneNames = [];

            for (var count = 0; count < milestones.length; count ++) {
              milestoneNames[milestoneNames.length] = milestones[count].title;
            }

            deferred.resolve(JSON.stringify(milestoneNames));

          })
          .catch(function(error) {
            console.log('whoops');
            deferred.reject(JSON.stringify(error));
          });
    }
    else if (message.text.indexOf('ticketbot') > -1  &&
      message.text.indexOf('users') > -1) {

      // check to make sure that data is loaded
      if (!this.isDataLoaded()) {
        return deferred.promise;
        deferred.resolve("I'm sorry captain, I can't do that now. You see, we don't have the data. So chill for a sec. :tea:");
      }

      assembla.getUsers()
        .then(function(users) {
          var userNames = [];

          assembla.setAssemblaUsers(users);

          for (var count = 0; count < users.length; count ++) {
            userNames[userNames.length] = users[count].name;
          }

          deferred.resolve(JSON.stringify(userNames));
        })
        .catch(function (error) {
          console.log('whoops');
          deferred.reject(JSON.stringify(error));
        });
    }

    return deferred.promise;
  }

};

return module.exports;
