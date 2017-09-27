var _ = require('lodash');
var q = require ('q');
var rn = require('random-number');

var assembla = require('./assemblaService.js');
var pokemonService = require('./pokemonService.js');

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
    else if (message.text.indexOf('ticketbot' > -1) &&
      message.text.indexOf('update ticket #') > -1) {
        var ticketnumber = "";
        var status = "";

        ticketNumber = message.text.substring(
          message.text.indexOf('#') + 1,
          message.text.indexOf(' ', message.text.indexOf('#') + 2)
        );

        status = message.text.substring(
          message.text.indexOf('to ') + 3
        );

        // clean up the status
        status = status.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"")
        status = status.replace(" ", "");

        // check to make sure we have a valid status
        var statusObj = _.find(assembla.assembla_info.statuses, function (statusName) {
          console.log(status.name);
          return (statusName.name.toLowerCase().replace(/\s/g,'') == status.toLowerCase().replace(/\s/g,''));
        });

        console.log('statuses: ' + assembla.assembla_info.statuses.length)
        console.log('ticket #' + ticketNumber);
        console.log('ticket status: ' + status);

        // break out if we don't have a valid status
        if (statusObj != null) {
          assembla.updateTicketStatus(ticketNumber, status)
            .then(function (response) {
              deferred.resolve(":information_desk_person: :sparkles: ticket #" + ticketNumber + " has been updated to " + status + "! :sparkles: ");
            });
        } else {
          deferred.resolve(':no_good: No such status, silly!');
        }
      }
    else if (message.text.indexOf('ticketbot') > -1  &&
      message.text.indexOf('assign ticket #') > -1) {
        var ticketnumber = "";
        var milestone = "";

        ticketNumber = message.text.substring(
          message.text.indexOf('#') + 1,
          message.text.indexOf(' ', message.text.indexOf('#') + 2)
        );

        milestone = message.text.substring(
          message.text.indexOf('to ') + 3
        );

        // clean up the status
        milestone = milestone.replace(/[,\/#!?$%\^&\*;:{}=\-_`~()]/g,"")
        milestone = milestone.replace(" ", "");

        console.log('ticket #' + ticketNumber);
        console.log('ticket milestone: ' + milestone);

        // find the milestone
        var milestoneObj = _.find(assembla.assembla_info.milestones, function(item) {
          return item.title == milestone;
        });

        assembla.updateTicketMilestone(ticketNumber, milestoneObj.id)
          .then(function (response) {
            deferred.resolve(":information_desk_person: :sparkles: ticket #" + ticketNumber + " has been assigned to " + milestone + "! :sparkles: ");
          });
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

              var foundUser = _.find(assembla.assembla_info.users, function (user) {
                return user.id == ticket.assigned_to_id;
              });

              if (foundUser != null) {
                upesiTicket.author = foundUser.name;
              }

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
        message.text.indexOf('who has open tickets in milestone ') > -1) {

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

          if (milestone == null) {
            deferred.resolve(":no_good: No such milestone, silly.");
          } else {

              console.log(milestone);

              // let's get some new tickets
              assembla.getTicketsByMilestone(milestone.id)
                .then( function (data) {

                  assembla.setAssemblaTicketsByMilestone(milestone, data);

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
              });
          }
    }
    else if (message.text.indexOf('ticketbot') > -1  &&
      message.text.indexOf('milestones') > -1) {

        // check to make sure that data is loaded
        if (!this.isDataLoaded()) {
          deferred.resolve("I'm sorry captain, I can't do that now. You see, we don't have the data. So chill for a sec. :tea:");
        } else {

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
    }
    else if (message.text.indexOf('ticketbot') > -1  &&
      message.text.indexOf('users') > -1) {

      // check to make sure that data is loaded
      if (!this.isDataLoaded()) {
        deferred.resolve("I'm sorry captain, I can't do that now. You see, we don't have the data. So chill for a sec. :tea:");
      } else {

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
    }
    else if (message.text.indexOf('ticketbot') > -1  &&
      message.text.indexOf('love you') > -1) {
        deferred.resolve("Awww, thanks! :blush: \r\n But I already have bae :ring: :griff: :two_hearts:");
      }
    else if (message.text.indexOf('ticketbot') > -1 &&
      message.text.indexOf('merge') > -1) {
        // then we want to make a merge request
        var source_branch = "";
        var target_branch = "";
        var title = "";

        source_branch =
          message.text.substring(
            message.text.indexOf('merge ') + 6,
            message.text.indexOf(' ', message.text.indexOf('merge ') + 6));

        target_branch =
          message.text.substring(
            message.text.indexOf('into ') + 5,
            message.text.indexOf(' ', message.text.indexOf('into ') + 5));

        title =
          message.text.substring(
            message.text.indexOf(' ', message.text.indexOf('into ') + 5));

        console.log('source: ' + source_branch);
        console.log('target: ' + target_branch);
        console.log('title: ' + title);

        assembla.createMergeRequest(source_branch, target_branch, title)
          .then(function(response) {

            console.log(JSON.stringify(response));

            if (JSON.parse(response).errors != null) {
              deferred.resolve(":skull: Merge Request creation failed... please try again!");
            } else {
              deferred.resolve(":information_desk_person: :sparkles: Merge request created! :sparkles: \r\n:link: " + JSON.parse(response).url);
            }

            deferred.resolve(JSON.stringify(response));
          })
      }
    else if (message.text.indexOf('ticketbot') > -1 &&
      message.text.indexOf('pokemon companion') > -1) {

        var options = {
          min:  1
          ,max:  151
          ,integer: true
        };

        var random_number = rn(options);

        pokemonService.getPokemon(random_number)
          .then( function (pokemon) {
            if (pokemon) {
              deferred.resolve(":ok_woman: You've been granted a new pokemon companion! Take care of it and it'll help you on you journey! :sparkles: \r\n " + pokemon.sprites.front_default );
            } else {
              deferred.resolve(":no_good: Look's like there are no pokemon around today, maybe try back in an hour? :bow:");
            }
          });
      }
    return deferred.promise;
  }
};

return module.exports;
