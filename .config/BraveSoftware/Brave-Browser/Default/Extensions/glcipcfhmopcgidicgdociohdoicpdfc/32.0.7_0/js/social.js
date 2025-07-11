run.$inject = ['socialService', 'storage', '$rootScope', '$q'];

function run(socialService, storage, $rootScope, $q) {

  var code, state, slackData;
  var search = window.location.search.split('?')[1];
  var setStorage = {};

  if (search) {
    var params = search.split('&');

    for (var i = 0; i < params.length; i++) {
      if (params[i].indexOf('slack_link') === 0) {
        setStorage.slack_send = { link: params[i].split('=')[1] };
      }

      if (params[i].indexOf('code') === 0) {
        code = params[i].split('=')[1];
      }

      if (params[i].indexOf('state') === 0) {
        state = params[i].split('=')[1];
      }
    }
  }

  function logOut() {
    socialService.logOutSlack().then(function () {
      window.location = window.location.origin + window.location.pathname;
    });
  }

  function sendMessage() {
    socialService.sendSlack(slackData.access_token, {
      text: $rootScope.data.params.text,
      channel: $rootScope.data.selectedChannel.id
    }, function (err) {
      console.error('slack send: ' + err);
    }).then(function () {
      storage.remove('slack_send').then(function () {
        window.close();
      });
    })
  }

  return storage.set(setStorage).then(function () {

    return $q.all([storage.get('slack_send'), storage.get('slack_channel'), socialService.authSlack(code, state)]).then(function (resolves) {
      var slack_send = resolves[0].slack_send;
      var slack_channel = resolves[1].slack_channel;
      slackData = resolves[2];

      if (slack_send) {
        return socialService.getChannels(slackData.access_token).then(function (channels) {
          var selectedChannel = channels.filter(function (channel) {
            return channel.id === slack_channel;
          })[0] || channels[0];

          $rootScope.data = {
            team: slackData.team_name,
            params: {
              text: ' \n' + slack_send.link + '\nvia Muzli Design Inspiration (https://muz.li)'
            },
            channels: channels,
            selectedChannel: selectedChannel
          };

          $rootScope.sendMessage = sendMessage;
          $rootScope.logOut = logOut;

          setTimeout(function () {
            var input = $('textarea')[0];
            input.focus();
            input.setSelectionRange(0, 0);
          }, 200);

        });
      }
    }, function (err) {
      console.error('slack auth: ' + err);
    });
  })
}

angular.module('muzli', [])
  .constant('R', window.R)
  .value('server', function () {
    return window.MUZLI_SERVER
  })
  .run(run);
