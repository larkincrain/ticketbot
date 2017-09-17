//The ticket bot to help manage tickets!
var _ = require('lodash');
var https = require('https');
var q = require ('q');
var Bot = require('slackbots');
var credentials = require('./credentials.json');

// create a bot
var settings = {
    token: credentials.slack_token,
    name: credentials.name
};
var bot = new Bot(settings);

bot.on('start', function() {
    bot.postMessageToChannel('some-channel-name', 'Hello channel!');
    bot.postMessageToUser('some-username', 'hello bro!');
    bot.postMessageToGroup('some-private-group', 'hello group chat!');
});

var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RtmClient = require('@slack/client').RtmClient;

var token = credentials.slack_token;
var ticketbot = new RtmClient(token, {logLvel: 'debug'});

var teamConversationList = {};
var teamMembersLists = {};

var assembleInfo = {
  users : [],
  milestones : []
};

var mobileEnrollmentConversation;

//Start the Real Time Messaging app!
ticketbot.start();

//Check to see if we're authenticated
ticketbot.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log('Logged in as ' + rtmStartData.self.name + ' of team ' + rtmStartData.team.name + ', but not yet connected');
  console.log('Start Data: ');
  //console.log(rtmStartData);

  teamConversationList = rtmStartData.channels;
  teamMembersLists = rtmStartData.users;
  //
  console.log('All the conversations: ');
  console.log(teamConversationList);
  //
  // console.log('All the team members: ');
  // console.log(teamMembersLists);

});


ticketbot.on(RTM_EVENTS.MESSAGE, function (message) {
  // Listens to all `message` events from the team
  console.log('New message: ');
  console.log(message);

  if (message.text.indexOf('hey ticketbot') > -1 ) {
    //then we shoudl respond with sarcasm!
    ticketbot.sendMessage(
      'https://app.assembla.com/spaces/oaftrac/tickets/6764-unlock-code-for-a-particular-serial-number-is-returning-0-length-code',
      message.channel,
      function (){
        console.log('Sassed em good, boss');
      }
    );
  }
  else if (message.text.indexOf('ticketbot') > -1 && message.text.indexOf('status') > -1) {
    console.log('we got a question boss!');

    ticketbot.sendMessage(
      ':thinking_face: Interesting...Interesting.',
      message.channel,
      function (){
        console.log('Sassed em good, boss');
      }
    );
  }
});

// you need to wait for the client to fully connect before you can send messages
ticketbot.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {

  console.log('Connected to the server');

  //Ok, let's print the mobile enrollment conversation
  mobileEnrollmentConversation =  _.filter(teamConversationList,
      {name: 'mobile-enrollment'}
  )[0];

  getUsers();
});

// we want to get all the users and have a list of them to reference
function getUsers () {
  var path = "/v1/spaces/oaftrac/users.json"
  assembleAPIcall(path)
    .then(function (users) {
      assembleInfo.users = users;

      for (var count = 0; count < assembleInfo.users.length; count ++) {
        console.log(assembleInfo.users[count]);
      }
    });
}

// we want to get all the milestones so we have a reference
function getMilestones() {

  var path = "/v1/spaces/oaftrac/tickets/milestones.json"; assembleAPIcall(path)
    .then(function (milestones){
      assembleInfo.milestones = milestones;
    });
}


function assembleAPIcall (path) {

  var deferred = q.defer();

  var options = {
    host: 'api.assembla.com',
    path: path,
    method: 'GET',
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
}
