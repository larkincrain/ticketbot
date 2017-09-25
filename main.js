//The ticket bot to help manage tickets!
var _ = require('lodash');
var https = require('https');
var q = require ('q');

var credentials = require('./credentials.json')
var assembla = require('./assemblaService.js');
var conversation = require('./conversationService.js');

var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RtmClient = require('@slack/client').RtmClient;

var token = credentials.slack_token;
var ticketbot = new RtmClient(token, {logLvel: 'debug'});

//Start the Real Time Messaging app!
ticketbot.start();

//Check to see if we're authenticated
ticketbot.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log('Logged in as ' + rtmStartData.self.name + ' of team ' + rtmStartData.team.name + ', but not yet connected');
  console.log('Start Data: ');
  //console.log(rtmStartData);

  teamConversationList = rtmStartData.channels;
  teamMembersLists = rtmStartData.users;
});

ticketbot.on(RTM_EVENTS.MESSAGE, function (message) {

  conversation.processMessage(message)
    .then(function (message_text) {
      ticketbot.sendMessage(
        message_text,
        message.channel,
        function (){
          console.log('Sassed em good, boss');
        }
      );
    })
    .catch (function (error) {
      ticketbot.sendMessage(
        JSON.stringify(error),
        message.channel,
        function (){
          console.log('Sassed em good, boss');
        }
      );
    });

});

// you need to wait for the client to fully connect before you can send messages
ticketbot.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {

  console.log('Connected to the server');

  assembla.getUsers()
    .then( function (users) {
      assembla.setAssemblaUsers (users);
    });

  // get all the tickets
  assembla.getMilestones()
    .then( function(milestones) {

      //save the milestones
      assembla.setAssemblaMilestones(milestones);

      _.forEach(milestones, function (milestone) {

        console.log('send request for: ' +  milestone.title);

        assembla.getTicketsByMilestone(milestone.id)
          .then(function (tickets) {

            console.log('got ticket for milestone: ' + milestone.title + ' tickets: ' + tickets.length);

            var milestones = assembla.assembla_info.milestones;

            var milestoneToEdit = _.find(milestones, function (milestoneIterator) {
              return milestoneIterator.title == milestone.title;
            });

            milestoneToEdit.tickets = [];
            milestoneToEdit.tickets = tickets;

            assembla.setAssemblaMilestones(milestones, tickets);
            assembla.setLoaded(true);
          });
      });
    });

});
