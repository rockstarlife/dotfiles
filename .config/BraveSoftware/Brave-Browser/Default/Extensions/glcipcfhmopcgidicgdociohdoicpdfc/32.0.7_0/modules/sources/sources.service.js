(function () {

  service.$inject = ['$rootScope', 'sources_list', 'userService'];

  function service($rootScope, sourcesList, userService) {

    function findByName(sources, name) {
      return sources.filter(function (item) {
        return item.name === name;
      })[0];
    }

    return {

      //Source demotion
      getDemotedSources() {

        return userService
          .fetch()
          .then(function (user) {
            return user.demotedSources || [];
          })
      },

      //Shortcuts
      demoteSource(source) {

        var demotedSources = $rootScope.user.demotedSources || [];
        var index = demotedSources.indexOf(source.name);

        if (index === -1) {
          demotedSources.push(source.name)
        }

        userService.setData({
          demotedSources: demotedSources,
        });

        source.isDemoted = true;
      },

      reactivateSource(source) {

        var demotedSources = $rootScope.user.demotedSources || [];
        var index = demotedSources.indexOf(source.name);

        if (index !== -1) {

          demotedSources.splice(index, 1);

          userService.setData({
            demotedSources: demotedSources,
          });
        }

        source.isDemoted = false;
      },

      getShortcuts() {

        //Add singleton 
        return userService
          .fetch()
          .then(async (user) => {

            let _shortcuts = user.shortcuts;

            //If no shortcuts array is defined, treat is as FTX
            if (!_shortcuts) {

              //Resolve get right bundle
              const bundleName = await userService.getUserBundle();

              const initialShortcuts = {
                'design': [
                  'muzli_blog',
                  'store',
                  'behance',
                  'dribbble',
                  'awwwards',
                  'vlogs',
                  'medium',
                  'producthunt',
                  'css_winner',
                  'abduzeedo',
                  'css_design_awards',
                  'land_book',
                  'theinspirationgrid',
                  'maxibestof',
                  'the_fwa',
                  'designspiration',
                  'siteinspire',
                ],
                'tech': [
                  'producthunt',
                  'techcrunch',
                  'the_verge',
                  'smashing_mag',
                  'engadget',
                  'codepen',
                  'hacker_news',
                  'mashable',
                ],
                'culture': [
                  'mashable',
                  'ted',
                  'colossal',
                  'vox',
                  'vice',
                  'my_modern_met',
                  'daily_dot',
                  'buzzfeed',
                ],
                'news': [
                  'cnn',
                  'forbes',
                  'vb',
                  'nytimes',
                  'npr',
                  'vice',
                  'futurism',
                ],
              }

              _shortcuts = [];

              //If no sources were disabled, 
              if (!_shortcuts.length) {
                _shortcuts = initialShortcuts[bundleName] || initialShortcuts['design'];
              }

              user.shortcuts = _shortcuts;
              $rootScope.user.shortcuts = _shortcuts;


            }

            return _shortcuts
              .filter(shortcut => {

                // Filter out muzli & comunity, since we have added them to fixed positions
                if (shortcut === 'muzli' || shortcut === 'community') {
                  return false;
                }

                return true;
              })
              .map(sourceName => {

                let source = findByName(sourcesList, sourceName);

                if (!source) {
                  return false;
                }

                return {
                  name: sourceName,
                  title: source.title,
                  unread: source.unread,
                  icon: source.icon,
                }

              })
              .filter(source => !!source)

          })
      },

      clearShortcuts() {

        $rootScope.clearedShortcuts = $rootScope.user.shortcuts;
        $rootScope.user.shortcuts = [];

        userService.setData({
          shortcuts: [],
        });
      },

      restoreShortcuts() {

        $rootScope.user.shortcuts = $rootScope.clearedShortcuts;
        $rootScope.clearedShortcuts = [];

        userService.setData({
          shortcuts: $rootScope.user.shortcuts,
        });
      },

      addShortcut(source) {

        var _shortcuts = $rootScope.user.shortcuts || [];
        var index = _shortcuts.indexOf(source.name);

        if (index === -1) {
          _shortcuts.push(source.name)
        }

        userService.setData({
          shortcuts: _shortcuts,
        });

        var staticSource = sourcesList.find(staticSource => {
          return staticSource.name === source.name
        })

        if (staticSource) {
          staticSource.isShortcut = true;
        }

      },

      removeShortcut(source) {

        var _shortcuts = $rootScope.user.shortcuts || [];
        var index = _shortcuts.indexOf(source.name);

        if (index !== -1) {
          _shortcuts.splice(index, 1);
        }

        userService.setData({
          shortcuts: _shortcuts,
        });

        var staticSource = sourcesList.find(staticSource => {
          return staticSource.name === source.name
        })

        if (staticSource) {
          staticSource.isShortcut = false;
        }

      },

      //Legacy source functionality
      findByName: findByName.bind(this, sourcesList),

      fetch: function () {

        return this
          .getShortcuts()
          .then(shortcuts => {

            shortcuts.forEach(shortcut => {

              var source = sourcesList.find(source => {
                return shortcut.name === source.name
              })

              if (source) {
                source.isShortcut = true;
              }

            })
            
            return sourcesList;

          })

      },

    }
  }

  angular.module('sources')
    .factory('sources', service);

})();
