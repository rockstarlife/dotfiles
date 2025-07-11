(function () {

  socialService.$inject = [ '$http', '$q', 'server', 'storage', '$timeout', '$window' ];
  function socialService ($http, $q, server, storage, $timeout, $window) {
    var redirect_uri = window.muzli.slackLocation;

    return {
      fetch: fetch,
      authSlack: authSlack,
      logOutSlack: logOutSlack,
      sendSlack: sendSlack,
      getChannels: getChannels,
      share: share
    };

    function fetch () {
      return _fetchStats().then(function (res) {
        var facebook = res && res.facebook && res.facebook.like_count,
          twitter = res && res.twitter && res.twitter.followers_count;

        return {
          facebook: facebook,
          twitter: twitter
        }
      });
    }

    function authSlack (code, state) {
      return storage.get('slack_data').then(function (res) {
        var slackData = res.slack_data;

        if (!slackData) {
          if (code) {
            if (state !== 'muzli') {
              return $q.reject('returned_state_is_not_correct');
            }

            return _authSlack(code).then(function (slackData) {
              storage.set({
                'slack_data': slackData
              });
              return slackData;
            });
          }
          else {
            return _goToSlackOAuth();
          }
        }
        else if (slackData.access_token) {
          return _validateSlackAuth(slackData.access_token).then(function () {
            return slackData;
          }, function (err) {
            console.error('user has token but failed to authenticate against slack api: ' + err);
            return logOutSlack().then(_goToSlackOAuth);
          });
        }
        else {
          return logOutSlack().then(_goToSlackOAuth);
        }
      });
    }

    function logOutSlack () {
      return storage.remove('slack_data');
    }

    function getChannels (token) {
      return $http({
        method: 'POST',
        url: server() + '/slack/channels',
        skipAuth: true,
        data: {
          token: token
        }
      }).then(function (res) {
        if (!res.data || !res.data.ok || !res.data.channels) {
          return $q.reject(res.error || 'failed_to_fetch_channels');
        }
        return res.data.channels;
      });
    }

    function sendSlack (token, params) {
      return storage.set({
        slack_channel: params.channel
      }).then(function () {
        return $http({
          method: 'POST',
          url: server() + '/slack/msg',
          skipAuth: true,
          data: {
            params: params,
            token: token
          }
        });
      });
    }

    function share (type, url, title, via) {

      url = encodeURIComponent(url)

      var types = {
        'facebook': {
          url: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
          name: 'Share Facebook'
        },
        'twitter': {
          url: 'https://twitter.com/share?text=' + encodeURIComponent(title) + '&url=' + url + ( via ? '&via=' + via : ''),
          name: 'Share Twitter'
        },
        'linkedin': {
          url: 'https://www.linkedin.com/shareArticle?url=' + url,
          name: 'Share LinkedIn'
        }
      };

      type = types[ type ];

      if (type) {
        $window.muzliOpenWindow(type.url, type.name);
      }
    }

    function _goToSlackOAuth () {
      window.location = "https://slack.com/oauth/authorize?scope=channels:read,chat:write:user,chat:write:bot&client_id=4719387940.32780805302&state=muzli&redirect_uri=" + redirect_uri;
      return $timeout(function () {
      }, 2000);
    }

    function _validateSlackAuth (token) {
      return $http({
        method: 'POST',
        url: server() + '/slack/auth/test',
        skipAuth: true,
        data: {
          token: token
        }
      }).then(function (res) {
        if (!res.data || !res.data.ok) {
          return $q.reject((res.data && res.data.error) || 'missing_ok_from_slack_auth');
        }
        return res.data;
      })
    }

    function _authSlack (code) {
      return $http({
        method: 'POST',
        url: server() + '/slack/auth',
        skipAuth: true,
        data: {
          code: code,
          redirect_uri: redirect_uri
        }
      }).then(function (res) {
        if (!res.data || !res.data.ok) {
          return $q.reject((res.data && res.data.error) || 'missing_ok_from_slack_auth');
        }
        return res.data;
      })
    }

    function _fetchStats () {
      return $timeout(function () {
        return $http({
          method: 'GET',
          skipAuth: true,
          url: server() + '/stats'
        }).then(function (res) {
          return res.data;
        }).catch(function () {
          return null;
        })
      }, window.muzli.statsLoadDelay);
    }
  }

  angular.module('muzli')
    .factory('socialService', socialService);

})();
