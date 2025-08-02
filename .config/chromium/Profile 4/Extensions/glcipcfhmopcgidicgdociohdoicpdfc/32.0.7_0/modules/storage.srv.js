(function () {
  storageService.$inject = ['$q', '$window', 'trackService'];
  function storageService($q, $window, trackService) {

    var storageType = {
      env: {
        local: {
          chrome: 'local'
        },
        sync: {
          chrome: 'sync'
        }
      },
      local: {
        name: 'localStorage'
      },
      session: {
        name: 'sessionStorage'
      }
    };

    var keys = {
      'experiments': {
        location: storageType.local
      },
      'useSpeedDial': {
        location: storageType.local
      },
      'readStaticNotifications': {
        location: storageType.local
      },
      'token': {
        location: storageType.local
      },
      'social_handler': {
        location: storageType.local
      },
      //Must be available for bootstrap-body.js to set body theme  on startup
      'theme': {
        location: storageType.local
      },//Must be available for bootstrap-body.js to set body theme  on startup
      'timeFormat': {
        location: storageType.local
      },
      //Must be available for bootstrap-body.js to set body theme  on startup
      'halfView': {
        location: storageType.local
      },
      'enableSharebleLinks': {
        location: storageType.local
      },
      'enableTrendingTile': {
        location: storageType.local
      },
      'enableShorts': {
        location: storageType.local
      },
      'enableGoogleApps': {
        location: storageType.local
      },
      'useV4': {
        location: storageType.local
      },
      'enablePalettes': {
        location: storageType.local
      },
      'defaultSearch': {
        location: storageType.local
      },
      'searchEngine': {
        location: storageType.local
      },
      'lite': {
        location: storageType.local
      },
      'liteOverride': {
        location: storageType.local
      },
      'topSitesDisabled': {
        location: storageType.local
      },
      'events': {
        location: storageType.local
      },
      'lastHomeScrolled': {
        location: storageType.local
      },
      'showSDLabels': {
        location: storageType.local
      },
      'openAfterInit': {
        location: storageType.env.local
      },
      'user': {
        location: storageType.env.local
      },
      'postClicks': {
        location: storageType.env.local
      },
      'installDate': {
        location: storageType.env.local
      },
      'updateDate': {
        location: storageType.env.local
      },
      'cachedFeed:muzli': {
        location: storageType.env.local
      },
      'cachedFeed:instagram:usemuzli': {
        location: storageType.env.local
      },
      'cachedFeed:all:viral': {
        location: storageType.env.local
      },
      'cachedFeed:all:trending': {
        location: storageType.env.local
      },
      'apiVersion': {
        location: storageType.env.local
      },
      'userCookieData': {
        location: storageType.env.sync
      },
      'installTime': {
        location: storageType.env.sync
      },
      'showedBundles': {
        location: storageType.env.sync
      },
      'showedV3Migration': {
        location: storageType.env.sync
      },
      'allowAnonymous': {
        location: storageType.local
      },
      'ftxLeft': {
        location: storageType.env.sync
      },
      'selectedBundle': {
        location: storageType.env.sync
      },
      'shortcuts': {
        location: storageType.env.sync
      },
      'demotedSources': {
        location: storageType.env.sync
      },
      'UUID': {
        location: storageType.env.sync
      },
      'muzli': {
        location: storageType.env.sync
      },
      'sources_send': {
        location: storageType.session
      },
      'sources': {
        location: storageType.env.sync
      },
      'lastLogin': {
        location: storageType.env.sync
      },
      'lastLoginProvider': {
        location: storageType.env.sync
      },
      'last_prompt_login': {
        location: storageType.env.sync
      },
      'slack_data': {
        location: storageType.env.sync
      },
      'slack_send': {
        location: storageType.session
      },
      'slack_channel': {
        location: storageType.env.sync
      },
      'customLinks': {
        location: storageType.env.sync
      },
      'areAdsDisabled': {
        location: storageType.env.sync
      },
      'wasReferralRewardShowed': {
        location: storageType.env.sync
      },
      'speedDialLinks': {
        location: storageType.env.local
      },
      'lastSDUpdate': {
        location: storageType.env.local
      },
      'syncSDLinks': {
        location: storageType.env.sync
      },
    };

    return {
      type: storageType,
      get: get,
      set: set,
      getSync: getSync,
      remove: remove,
      reset: removeAll,
    };

    function chromeStorageSyncSave(type, obj, resolve) {
      window.chrome.storage[type.chrome].set(obj, resolve);
    }

    function chromeStorageSyncFetch(type, _keys, resolve) {
      window.chrome.storage[type.chrome].get(_keys, resolve);
    }

    function get(_keys) {
      var types = generateKeyMapping(_keys);

      return $q.all([
        _getKeys(types.env.local, storageType.env.local),
        _getKeys(types.env.sync, storageType.env.sync),
        _getKeys(types.local, storageType.local),
        _getKeys(types.session, storageType.session)
      ])
        .then(function (resolves) {
          var res = {};
          resolves.forEach(function (resolve) {
            $.extend(res, resolve);
          });
          return res;
        });
    }

    function set(obj) {

      var reduce = {
        env: {
          local: {},
          sync: {}
        },
        local: {},
        session: {}
      };

      var hasReduceEnvLocal = false;
      var hasReduceEnvSync = false;
      var hasReduceLocal = false;
      var hasReduceSession = false;
      var promises = [];

      for (var key in obj) {

        if (obj.hasOwnProperty(key)) {
          
          var value = obj[key];

          if (!keys[key]) {
            trackService.trackError('error in storage set does not have the key "' + key + '"', true);
            continue;
          }

          if (value == null) {
            trackService.trackError('error in storage set missing value for  "' + key + '"', true);
            continue;
          }

          if (keys[key].transform) {
            value = keys[key].transform(key, obj);
          }

          if (keys[key].location === storageType.env.local) {
            hasReduceEnvLocal = true;
            reduce.env.local[key] = value;
          }
          else if (keys[key].location === storageType.env.sync) {
            hasReduceEnvSync = true;
            reduce.env.sync[key] = value;
          }
          else if (keys[key].location === storageType.local) {
            hasReduceLocal = true;
            reduce.local[key] = value;
          }
          else if (keys[key].location === storageType.session) {
            hasReduceSession = true;
            reduce.session[key] = value;
          }

          if (keys[key].onSet) {
            keys[key].onSet(value);
          }
        }
      }

      if (hasReduceEnvLocal) {
        promises.push(_setKeys(reduce.env.local, storageType.env.local));
      }
      if (hasReduceEnvSync) {
        promises.push(_setKeys(reduce.env.sync, storageType.env.sync));
      }
      if (hasReduceLocal) {
        promises.push(_setKeys(reduce.local, storageType.local));
      }
      if (hasReduceSession) {
        promises.push(_setKeys(reduce.session, storageType.session));
      }

      return $q.all(promises);
    }

    function getSync(key) {
      return $window.localStorage.getItem(key);
    }

    function removeAll() {
      remove(Object.keys(keys))
    }

    function remove(_keys) {
      var types = generateKeyMapping(_keys);
      var promises = [];

      if (types.env.local.length) {
        if (window.chrome && window.chrome.storage) {
          promises.push($q(function (resolve) {
            window.chrome.storage.local.remove(types.env.local, resolve);
          }));
        }
        else {
          _removeLocalStorage(types.env.local);
        }
      }
      if (types.env.sync.length) {

        if (window.chrome && window.chrome.storage) {
          promises.push($q(function (resolve) {
            window.chrome.storage.sync.remove(types.env.sync, resolve)
          }));
        }
        else {
          _removeLocalStorage(types.env.sync);
        }
      }

      if (types.local) {
        _removeLocalStorage(types.local);
      }

      if (types.session) {
        types.session.forEach(function (key) {
          $window.sessionStorage.removeItem(key);
        });
      }

      return $q.all(promises);
    }

    function generateKeyMapping(_keys) {
      if (!(_keys instanceof Array)) {
        _keys = [_keys];
      }

      return _keys.reduce(function (res, key) {
        if (!keys[key]) {
          trackService.trackError('error in storage generateKeyMapping does not have the key "' + key + '"', true);
          return res;
        }

        if (keys[key].location === storageType.server) {
          res.server.push(key)
        }
        else if (keys[key].location === storageType.env.local) {
          res.env.local.push(key)
        }
        else if (keys[key].location === storageType.env.sync) {
          res.env.sync.push(key)
        }
        else if (keys[key].location === storageType.local) {
          res.local.push(key)
        }
        else if (keys[key].location === storageType.session) {
          res.session.push(key)
        }

        return res;
      }, {
        server: [],
        env: {
          local: [],
          sync: []
        },
        local: [],
        session: []
      });
    }

    function _removeLocalStorage(arr) {
      arr.forEach(function (key) {
        $window.localStorage.removeItem(key);
      });
    }

    function _getKeys(_keys, type) {

      return $q(function (resolve, reject) {
        if (!_keys.length) {
          resolve({});
        }
        var isEnv = (type === storageType.env.local || type === storageType.env.sync) && window.chrome && window.chrome.storage;

        if (isEnv && _keys.length) {
          chromeStorageSyncFetch(type, _keys, resolve);
        }
        else {
          var res = {};
          _keys.forEach(function (key) {
            res[key] = $window[type.name || 'localStorage'].getItem(key);
            try {
              res[key] = JSON.parse(res[key]);
            }
            catch (e) {
            }
          });
          return resolve(res);
        }
      });
    }

    function _setKeys(obj, type) {
      return $q(function (resolve, reject) {
        var key;
        var isEnv = (type === storageType.env.local || type === storageType.env.sync) && window.chrome && window.chrome.storage;

        if (!isEnv) {
          for (key in obj) {
            if (obj.hasOwnProperty(key)) {
              var value = obj[key];
              if (typeof value === 'object') {
                obj[key] = JSON.stringify(value);
              }
            }
          }
        }

        if (isEnv) {
          chromeStorageSyncSave(type, obj, resolve);
        }
        else {
          for (key in obj) {
            if (obj.hasOwnProperty(key)) {
              $window[type.name || 'localStorage'].setItem(key, obj[key]);
            }
          }
          resolve();
        }
      });
    }
  }

  angular.module('muzli')
    .factory('storage', storageService);

})();
