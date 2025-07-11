document.body.style.display = '';

(function () {

  window.muzliOpenWindow = function (url, title) {
    var w = 600;
    var h = 450;
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    var win = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    if (window.focus) {
      win.focus()
    }
  };

  window.debounce = function (func, wait, immediate) {

    var timeout;

    return function () {

      var context = this;
      var args = arguments;

      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      var callNow = immediate && !timeout;

      clearTimeout(timeout);

      timeout = setTimeout(later, wait);

      if (callNow) func.apply(context, args);
    };
  }

  var contactLinks = [
    { href: 'https://muz.li/contact/#feedback', text: 'General feedback' },
    { href: 'https://muz.li/contact/#suggest', text: 'Suggest a link' },
    { href: 'https://muz.li/subscribe/', text: 'Subscribe to our weekly digest' },
    { href: 'https://muz.li/contact/#report', text: 'Report a bug' },
    { href: 'https://muz.li/privacy', text: 'Privacy Policy' },
    { href: 'https://muz.li/terms', text: 'Terms of Service' }
  ];

  async function fetchMuzli(fetchService, storageService) {

    const sort = 'created';
    const { lastHomeScrolled } = await storageService.get('lastHomeScrolled');

    //Show top week Muzli posts for FTX users (Until they scroll)
    if (!lastHomeScrolled) {

      let topWeek = await fetchService.fetch('top-week', sort, 15);

      addShareLinks(topWeek.data);

      return Promise.resolve(topWeek.data);

    }

    return fetchService
      .fetch('muzli', sort, 15)
      .then(async (res) => {

        let seenPinnedItems = JSON.parse(localStorage.getItem('seenPinnedItems') || '{}');

        //Remove pinned flag from items that were seen too many times
        res.data.forEach(item => {
          if (item.isPinned && seenPinnedItems[item.id] >= 7) {
            delete item.isPinned;
          }
        })

        //Move pinned items to front
        res.data.sort((a, b) => {
          return a.isPinned ? -1 : b.isPinned ? 1 : 0;
        })

        addShareLinks(res.data);

        return res.data;

      });
  }

  function fetchAll(fetchService, sort, filter) {

    let limit = window.muzli.paging.server

    return fetchService
      .fetch(null, sort, limit, filter)
      .then(function (res) {
        addShareLinks(res.data);
        return res.data;
      });
  }

  function fetchMuzliClicked(storage, $rootScope) {
    return storage.get("postClicks", true).then((res) => {
      return (res && res.postClicks) || [];
    });
  }

  function synchMuzliClicked(storage, clickedItems) {
    storage.set({
      postClicks: (clickedItems || []).slice(-500)
    })
  }

  function setAllFeed($timeout, $scope, data) {

    $timeout(function () {

      var visibleItems = $('#sticky li:visible .feedLink').map(function (i, link) {
        return $(link).parents('li').data('muzli-id');
      }).toArray();

      if (visibleItems && visibleItems.length) {
        $scope.allFeed = data.filter(function (item) {
          return visibleItems.indexOf(item.id) === -1
        });
      } else {
        $scope.allFeed = data;
      }

      //EXPERIMWNTAL
      if ($scope.$parent && $scope.$parent.currentFeedFilter === 'top') {

        $scope.allFeed.sort((a, b) => {

          var aTrajectory = a.clicks - (a.clicksPreviuos || 0);
          var bTrajectory = b.clicks - (b.clicksPreviuos || 0);

          return bTrajectory - aTrajectory;

        })

      }

      $timeout(() => {

        var pinnedItems = $scope.muzliFeed
          .filter(item => {
            return item.isPinned && visibleItems.indexOf(item.id) !== -1;
          }).map(item => item.id)

        let seenPinnedItems = JSON.parse(localStorage.getItem('seenPinnedItems') || '{}');

        pinnedItems.forEach(item => {
          seenPinnedItems[item] = (seenPinnedItems[item] || 0) + 1;
        });

        localStorage.setItem('seenPinnedItems', JSON.stringify(seenPinnedItems));

      });

    });
  }

  function sortByClicked(data, clickedItems) {

    //Filter our already clicked items
    return data.filter(function (item) {
      return clickedItems.indexOf(item.link) === -1;
    })

      //Add already clicked items to the end
      .concat(data.filter(function (item) {
        return clickedItems.indexOf(item.link) > -1;
      }));
  }

  function loadCompleteControl($scope, fetchService, clickedItems, muzliData, dynamicFeedData, storage) {

    $scope.muzliFeed = sortByClicked(muzliData, clickedItems);
    $scope.dynamicFeed = dynamicFeedData || [];

    //Deffer loading controls to improve rendering
    setTimeout(() => {

      $scope.postClick = function (item, event) {

        var target = $(event.target);

        if (item.video && target.hasClass('postPhoto')) {

          event.preventDefault();
          event.stopPropagation();

          setTimeout(function () {
            target.find('muzli-video > div').click();
          }, 50);

          return;
        }

        if (item.video && (target.hasClass('angular-youtube-wrapper') || target.hasClass('player-image'))) {

          event.preventDefault();
          event.stopPropagation();
          item.playing = true;

          fetchService.event.videoClick(item, "sticky");

        } else {
          fetchService.event.postClick(item, event, "sticky");
        }

        if (item.source && item.source.name === 'muzli') {
          clickedItems.push(item.link);
          synchMuzliClicked(storage, clickedItems);
        }
      };

      $scope.markHidden = function (item) {

        fetchService.event.markHidden(item).then(() => {

          var index = $scope.muzliFeed.indexOf(item);

          if (index > -1) {
            $scope.muzliFeed.splice(index, 1);
          }

        });
      }

      $scope.playerVars = fetchService.constants.playerVars;
      $scope.openSharer = fetchService.event.openSharer;
      $scope.sendSlack = fetchService.event.sendSlack;
      $scope.sourceClick = fetchService.event.sourceClick;
      $scope.toggleFavorite = fetchService.event.toggleFavorite;
      $scope.markNSFW = fetchService.event.markNSFW;
      $scope.unmarkNSFW = fetchService.event.unmarkNSFW;

    })
  }

  function addShareLinks(feedPage) {

    if (!window.MUZLI_SHARE_SERVER) {
      return;
    }

    if (!JSON.parse(localStorage.enableSharebleLinks || 'false')) {
      return;
    }

    if (window.innerWidth <= 1440) {
      return;
    }

    feedPage.forEach(function (item, index) {

      if (!item.isFrameAllowed) {
        return;
      }

      var listPosition = index;
      var shortUrl = btoa(item.id.slice(0, 9))
      var linkOut = window.MUZLI_SHARE_SERVER + shortUrl + '?referrer=muzli&source=muzli&skip=' + listPosition;

      item.link_out = linkOut;
    })
  }

  /*==================================
  =            CONTROLLER            =
  ==================================*/

  allController.$inject = ['$timeout', '$scope', '$q', '$rootScope', '$state', '$stateParams', 'sources', 'fetchService', 'storage', 'trackService', 'sources_list'];

  function allController($timeout, $scope, $q, $rootScope, $state, $stateParams, sources, fetchService, storage, trackService, sources_list) {

    console.log('All controller init')

    $rootScope.currentTitle = `Your Highlights`;

    $rootScope.setFeedFilter = function (filter, $event) {

      if ($event) {
        $event.preventDefault();
        $event.stopPropagation();
      }

      //If filter redirect to source, just track an event
      if (filter === 'store' || filter === 'jobs') {

        trackService.track({
          category: 'Feed',
          action: 'Select filter',
          label: filter
        });

        $rootScope.currentTitle = `Your Highlights`;

        return;
      }

      // Set section title
      switch (true) {
        case filter === 'all':
          $rootScope.currentTitle = `Your Highlights`;
          break;
        case filter === 'top':
          $rootScope.currentTitle = `Trending on Muzli right now!`;
          break;
        case filter === 'curated':
          $rootScope.currentTitle = `Curated content for iOS app and #shorts feed`;
          break;
        case $rootScope.focusedTab?.name === filter:
          $rootScope.currentTitle = `${$rootScope.focusedTab?.title} topics only`
          break;
        default:
          $rootScope.currentTitle = $rootScope.navTabs.find(tab => tab.name === filter)?.title + ' topics only';
          break;
      }

      if ($rootScope.currentFeedFilter === filter) {
        return;
      }

      $scope.allFeed = [];
      $rootScope.currentFeedFilter = filter;

      //Send scroll position to top of the tabs if sticky nav is showing
      if ($rootScope.showStickyNav || $rootScope.useV4) {

        window.scrollTo({
          top: parseInt($('.lock-height').offset().top - 85),
        });

        $('.tabs.inline').get(0).classList.remove('hidden');
        $('.tabs.sticky').get(0).classList.remove('active');

        $rootScope.showStickyNav = false;

      } else {

        let inlineTab = document.querySelector('.tabs.inline');

        if (window.innerHeight + window.pageYOffset - inlineTab.offsetTop < window.innerHeight / 1.5) {

          window.scrollTo({
            top: parseInt($('.lock-height').offset().top - 85),
          });

        }

      }

      fetchAll(fetchService, $stateParams.sort, filter)
        .then(function (allFeed) {
          setAllFeed($timeout, $scope, allFeed);
        })

      trackService.track({
        category: 'Feed',
        action: 'Select filter',
        label: filter
      });
    };

    $scope.switchTab = (state) => {

      if ($scope.currentTab === state) {

        $state.go('^')
        $scope.currentTab = 'picks';
        $scope.homeTitle = 'Editor Picks';

      } else {

        switch (state) {
          case 'profile':

            $state.go('all.profile', {
              name: 'user',
              user: $rootScope.user,
              skipSponsored: true,
              hideTitle: true,
            })

            $scope.currentTab = state;
            $scope.homeTitle = 'Your uploaded work';
            break;

          case 'favorites':

            $state.go('all.favorites', {
              skipSponsored: true,
              hideTitle: true,
            })

            $scope.currentTab = state;
            $scope.homeTitle = 'Your Saved Items';

            break;

          default:
            break;
        }


      }

    }

    var muzliFeedPromise = fetchMuzli(fetchService, storage);
    var dynamicFeedPromise = fetchService.fetchDynamicFeed();

    $scope.sponsored;
    $scope.muzliFeed = [];
    $scope.dynamicFeed = [];
    $scope.currentTab = 'picks';
    $scope.filter = $stateParams.filter;
    $rootScope.currentFeedFilter = $stateParams.filter || 'all';

    //RELOAD
    fetchService
      .fetchSponsoredPost()
      .then((sponsored) => {
        if (sponsored) {
          sponsored.beacon += '&source=home'
          $scope.sponsored = sponsored;
        }
      });

    var sec;
    setTimeout(function () {
      sec = true;
    }, 500);

    $q.all([
      muzliFeedPromise,
      dynamicFeedPromise,
      fetchMuzliClicked(storage, $rootScope),
    ])
      .then((res) => {

        var fetchedMuzliItems = res[0];
        var dynamicFeedItems = res[1];
        var clickedItems = res[2];

        $rootScope.initialLoading = 'loading-muzli-complete';

        loadCompleteControl($scope, fetchService, clickedItems, fetchedMuzliItems, dynamicFeedItems, storage);

        $timeout(() => {

          //Load all feed
          fetchAll(fetchService, $stateParams.sort, $scope.filter)
            .then(async (allFeed) => {

              $rootScope.unreadIndicators = {};

              //Set main feed
              setAllFeed($timeout, $scope, allFeed);

              //Figure out new unread items
              let storageResponse = await storage.get(['lastHomeScrolled']);

              let yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);

              let lastHomeScrolled = storageResponse?.lastHomeScrolled ? new Date(storageResponse.lastHomeScrolled) : yesterday;

              let unreadItemSources = allFeed
                .filter(item => {
                  return lastHomeScrolled <= new Date(item.created) && item.source;
                })
                .map(item => item.source)
                .filter((unreadSource, index, all) => {
                  //Remove duplicates
                  return !unreadSource.read && all.findIndex(_source => _source.name === unreadSource.name) === index;
                })

              //Update unread state on shortcuts and actual source list
              unreadItemSources.forEach(unreadItemSource => {

                const unreadSource = sources_list.find(source => unreadItemSource.name === source.name);

                if (unreadSource) {
                  unreadSource.unread = true;
                }

                switch (unreadItemSource.name) {
                  case 'muzli':
                    $rootScope.unreadIndicators.muzli = true;
                    break;
                  case 'community':
                    $rootScope.unreadIndicators.community = true;
                    break;
                  default:
                    $rootScope.unreadIndicators.all = true;
                    break;
                }

              })

              // Set unreadSources for unread indicator
              $rootScope.unreadSources = unreadItemSources
                .filter((unreadSource, index, all) => {
                  
                  // Never show muzli as unread
                  if (unreadSource.name === 'muzli' || unreadSource.name === 'colors') {
                    return false;
                  }

                  return true;

                })
                .slice(0, 3);

              $rootScope.updateShortcuts();

            })
            .catch(function (err) {

              console.error(err)

              if (err && err.status === -1 && sec) {
                return;
              }

              $rootScope.setError($scope, 'all-error');

            });

        });

      })
      .catch(function (err) {

        console.error(err);

        if (err && err.status === -1 && sec) {
          return;
        }

        $rootScope.setError($scope, 'muzli-error');

      });

    $q.all([muzliFeedPromise, $rootScope.scrolledPromise])
      .then(function () {
        $rootScope.initialLoading = 'loading-complete';
      });


    //Sticky navigation handling
    var inlineNavElement;
    var stickyNavElement;

    var navScrollListener = $rootScope.$on('view-scrolled', function (event) {

      if (!inlineNavElement) {
        inlineNavElement = $('.tabs.inline').get(0);
        stickyNavElement = $('.tabs.sticky').get(0);
      }

      // Return if no inline nav is present
      if (!inlineNavElement) {
        return;
      }

      if ((window.pageYOffset - 35 > inlineNavElement.offsetTop) && !$rootScope.showStickyNav) {
        stickyNavElement.classList.add('active');
        inlineNavElement.classList.add('hidden');
        $rootScope.showStickyNav = true;
      }

      if ((window.pageYOffset - 35 <= inlineNavElement.offsetTop) && $rootScope.showStickyNav) {
        stickyNavElement.classList.remove('active');
        inlineNavElement.classList.remove('hidden');
        $rootScope.showStickyNav = false;
      }

    });

    $scope.$on("$destroy", function () {
      $rootScope.showStickyNav = false;
      navScrollListener();
    })

  }


  /*==============================
  =            CONFIG            =
  ==============================*/


  config.$inject = ['$provide', '$stateProvider', '$urlRouterProvider', '$compileProvider', '$sceDelegateProvider', '$animateProvider'];

  function config($provide, $stateProvider, $urlRouterProvider, $compileProvider, $sceDelegateProvider, $animateProvider) {

    $compileProvider.debugInfoEnabled(false);

    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|safari-extension|opera):/);
    $sceDelegateProvider.resourceUrlWhitelist(['self', 'safari-extension://**', 'https://www.youtube.com/**', `${window.MUZLI_WEBSITE_URL}/**`]);

    $animateProvider.classNameFilter(/angular-animate/);

    $provide.decorator("$exceptionHandler", ["$delegate", "trackService", function ($delegate, trackService) {
      return function (exception, cause) {

        var shouldDelegate = trackService.trackError(exception);

        // (Optional) Pass the error through to the delegate formats it for the console
        if (shouldDelegate) {
          $delegate(exception, cause);
        }
      };
    }]);

    $urlRouterProvider.otherwise(function ($injector) {

      var $state = $injector.get('$state');

      if (window.LITE_CHECK) {
        $state.go('lite-check');
        return;
      }

      if (window.LITE_ENABLE) {
        $state.go('lite-enable');
        return;
      }

      $state.go('all');

    });

    /*==============================
    =            Routes            =
    ==============================*/

    $stateProvider.state('all', {
      params: {
        sort: 'created',
        filter: undefined,
      },
      views: {
        '': {
          templateUrl: function () {
            return 'modules/muzli/home.html';
          },
          controller: allController,
          reloadOnSearch: false,
        },
        'home@all': {
          templateUrl: 'templates/picks.html',
        }
      }
    });

    $stateProvider.state('all.profile', {
      parent: 'all',
      params: {
        name: 'all',
        sort: 'created',
        user: null,
        skipSponsored: true,
        hideTitle: true,
      },
      views: {
        'home': {
          templateUrl: 'modules/feed/feed.html',
          controller: 'feedController',
        }
      }
    });

    $stateProvider.state('all.favorites', {
      parent: 'all',
      params: {
        skipSponsored: true,
        hideTitle: true,
      },
      views: {
        'home': {
          templateUrl: 'modules/user/favorites.html',
          controller: 'favoritesController'
        }
      }
    });

    $stateProvider.state('settings', {
      views: {
        'blocker': {
          template: '<settings />',
        }
      }
    });

  }

  /*===========================
  =            RUN            =
  ===========================*/

  run.$inject = ['$timeout', '$rootScope', '$q', '$state', 'fetchService', 'userService', 'trackService', 'storage', 'sources', 'chrome'];

  function run($timeout, $rootScope, $q, $state, fetchService, userService, trackService, storage, sources, chromeService) {
    var scrollDefer;
    var nextState;

    trackService.onLoad(storage);

    $rootScope.muzliShareEndpoint = window.MUZLI_SHARE_SERVER;
    $rootScope.$state = $state;
    $rootScope.contactLinks = contactLinks;
    $rootScope.shortcutsActive = JSON.parse(localStorage.shortcutsActive || 'false');

    window.muzli.closeOnEsc.push(function () {
      $rootScope.settingsOpen = false;
    });

    $rootScope.updateShortcuts = function () {
      sources.getShortcuts().then((shortcuts) => {

        $rootScope.shortcuts = shortcuts;

        $timeout(() => {
          $rootScope.showShortcuts = true;
        })

      });
    }

    $rootScope.$watchCollection('user.shortcuts', $rootScope.updateShortcuts);

    function moveToFullView() {

      $rootScope.isSwitchedToHalfView = true;
      $rootScope.feedVisibleClass = 'full-view';

      // RESET SCROLL EVENTS AND LEAVE ONLY SIGNALS
      $('main, #overlay').off("wheel scroll");
      $('main, #overlay').on("wheel scroll", e => {
        $rootScope.$broadcast('user-scrolled');
      })

    }

    function setView() {

      storage.get(['lite', 'liteOverride', 'halfView', 'useSpeedDial', 'defaultSearch', 'useV4']).then(function (res) {

        const isSwitchedToHalfView = angular.isDefined(res.halfView) ? !!res.halfView : !!res.lite;
        const userUsingLite = !!res.lite && !res.liteOverride;

        if (window.muzli.getRuntime().id !== "non_chrome") {
          $rootScope.isLiteVersion = res.lite;
          $rootScope.isMuzliHomepage = res.liteOverride;
          $rootScope.useSpeedDial = res.useSpeedDial;
        }

        $rootScope.isSwitchedToHalfViewIndicator = isSwitchedToHalfView;
        $rootScope.isSwitchedToHalfView = isSwitchedToHalfView;
        $rootScope.feedVisibleClass = isSwitchedToHalfView ? 'full-view' : '';
        $rootScope.defaultSearch = res.defaultSearch || 'muzli';

        trackService.setDimension('is_lite', userUsingLite.toString());
        trackService.setDimension('is_full_view', isSwitchedToHalfView.toString());

        if (res?.useV4 != null) {
          trackService.setDimension('is_v4', res.useV4.toString() || 'false');
        }

        $rootScope.flags = {};

        // Wait for server flag and then set local storage to get coherent bucketing
        userService.getData().then(userData => {

          const updatedFlags = {};

          Object.keys(trackService.experimentFlags).forEach(key => {

            const flag = trackService.experimentFlags[key];

            // Check if flag is for the new user only and apply it if it's a first session
            if (!flag.newOnly || (flag.newOnly && window.FIRST_OPEN)) {

              if (userData[key] != null && localStorage[key] == null) {

                if (userData[key] > Math.random()) {
                  localStorage[key] = true;
                } else {
                  localStorage[key] = false;
                }

                $rootScope.flags[key] = (localStorage[key] === 'true');
                trackService.setDimension(flag.dimension || flag, localStorage[key]);

                updatedFlags[key] = $rootScope.flags[key];


              } else if (localStorage[key] == null) {
                console.log('[MISSING FLAG]', key)
              }

            }

          })

          // Notify service to flush all pending events after all flags were set
          trackService.signalAllFlagsSet();
          userService.setData(updatedFlags);
          
        });

        // Set dimensions and app properties, where they flags already set
        Object.keys(trackService.experimentFlags).forEach(key => {

          const flag = trackService.experimentFlags[key];

          if (localStorage[key] != null) {
            $rootScope.flags[key] = (localStorage[key] === 'true');
            trackService.setDimension(flag.dimension || flag, localStorage[key]);
          }

        })

        // Apply KEEP-IT experiment:
        // 1. DEFAULT_NTP means first normal open
        // 2. $rootScope.flags.useKeepIt - a proper variation of the test
        // 3. useKeepItVisited - open just once
        // 4. is Chrome

        let isChrome = chromeService.browserName === 'chrome';

        if (window.DEFAULT_NTP && $rootScope.flags.useKeepIt && !localStorage.useKeepItVisited && isChrome) {

          localStorage.useKeepItVisited = true;

          // Trigger dialog itself
          const isMac = navigator?.platform?.toLowerCase().indexOf('mac') !== -1;

          $rootScope.vm.showKeepItDialogWin = !isMac;
          $rootScope.vm.showKeepItDialog = true;

          // Remove dialog after 15s.
          setTimeout(() => {
            $rootScope.vm.showKeepItDialog = false;
            $rootScope.$digest();
          }, 15000)
        }

        // Manage upgrade ribbon
        if (!res.useV4) {
          const upgradeRibbonShown = parseInt(localStorage.upgradeRibbonShown || 0) + 1;
          localStorage.upgradeRibbonShown = upgradeRibbonShown;
          $rootScope.showUpgradeRibbon = upgradeRibbonShown < 20;
        }
    

      });
    }

    function init() {

      scrollDefer = $q.defer();

      $rootScope.initialLoading = 'loading-start';

      $rootScope.scrolledPromise = scrollDefer.promise;

      userService
        .getUserBundle()
        .then(function (bundleName) {

          $rootScope.activeBundle = bundleName || 'design';

          let tabs = [
            {
              name: 'design',
              title: 'Design',
            }, {
              name: 'tech',
              title: 'Tech',
            }, {
              name: 'culture',
              title: 'Culture',
            }, {
              name: 'news',
              title: 'News',
            },
          ]

          $rootScope.focusedTab = tabs.find(tab => tab.name === bundleName);
          $rootScope.navTabs = tabs.filter(tab => tab !== $rootScope.focusedTab);

          if ($rootScope.user && $rootScope.user.admin) {
            
            $rootScope.navTabs.push({
              name: 'curated',
              title: 'Curated (Admin)',
            })

            document.body.classList.add('admin');

          }

          $rootScope.navTabsLoaded = true;

        })

      //Track when user switches to full view
      $rootScope.scrolledPromise.then(function (label) {

        $timeout(function () {
          $('main img.wait-for-canvas').trigger('loadCanvas');
        });

        storage.set({
          lastHomeScrolled: new Date(),
        })

        trackService.track({
          category: 'Home',
          action: 'Scroll',
          label: label,
        });

      })

      setView();

      storage.get(['installDate', 'updateDate']).then(function (res) {

        //Sume ugly hack to parse installDate
        function sliceDate(dateString) {

          var slicedDate = dateString.slice(0, 2) + ' ';
          slicedDate += dateString.slice(2, 4) + ' ';
          slicedDate += dateString.slice(4, 8);

          return new Date(slicedDate);
        };

        $rootScope.bootstrapped = true;
        $rootScope.installDate = sliceDate(res.installDate || '01012020');
        $rootScope.updateDate = sliceDate(res.updateDate || '01012020');

        $(window).on('beforeunload', function () {
          window.muzli.pageChange();
        });

        //If home screen is not full feed - hook scroll events to reveal it
        if (!$rootScope.isSwitchedToHalfView) {

          //Since header overlays home screen, set different event listener for it 
          $timeout(() => {
            $('header').on("wheel scroll", e => {
              moveToFullView();
              $('header').off("wheel scroll");
            });
          }, 1000);

          $('main, #overlay').on("wheel scroll", e => {

            $rootScope.feedVisibleClass = 'full-view';
            $rootScope.initialLoading = 'loading-scrolled';
            $rootScope.$broadcast('user-scrolled');
            scrollDefer.resolve('User scrolled');

            //Bust FTX state
            if ($rootScope.vm.showFtx === 'scroll') {
              $rootScope.vm.showFtx = false;
            }

          });
        } else {
          $('main, #overlay').on("wheel scroll", e => {
            $rootScope.$broadcast('user-scrolled');
          })
        }

      });
    }

    init();

    $rootScope.$on('loadLanding', init);
    $rootScope.$on('muzliMoveToFullView', moveToFullView);

    $rootScope.$on('$stateChangeStart', function (event, state, params) {

      // Nasty little hack for store
      // Override default feed page with custom store page
      if (state.name === 'feed' && params.name === 'store') {
        event.preventDefault();
        $state.go('store');
        return;
      }

      $rootScope.errors = [];

      window.muzli.removeTooltips('#feed [title]');
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {

      $rootScope.currentFeedSort = toParams.sort || 'created';

      // Reset User sign-in callout
      $rootScope.userError = false;

      // Reset Last FTX step
      if ($rootScope.vm?.showFtx === 'scroll') {
        $rootScope.vm.showFtx = false;
      }

      // Reset search 
      if (toState.name !== 'search') {
        $rootScope.searchModel = {
          muzli: '',
          google: '',
        };
      }

      console.log('State changed to: ' + toState.name);

    });

    $rootScope.vm = {
      ftxLeft: [],
    };

    $rootScope.events = {
      sidebar: {
        show: function () {
          trackService.track({
            category: 'Sidebar',
            action: 'Show',
            label: 'sidebar'
          });
        },
        clickLink: function (name, event) {
          event.stopPropagation();

          trackService.track({
            category: 'Sidebar',
            action: 'Click',
            label: 'Site Link: ' + name
          });
        }
      },
      settingsMenu: {
        clickLink: function (text) {
          trackService.track({
            category: 'Settings menu',
            action: 'Click',
            label: text
          });
        }
      },
      quickAccess: {
        click: function (url) {
          trackService.track({
            category: 'Quick access',
            action: 'Click',
          });
        }
      },
      speedDial: {
        click: (url) => {
          trackService.track({
            category: 'Speed dial',
            action: 'Link click',
          });
        },
        customizationOpen: () => {
          trackService.track({
            category: 'Speed dial',
            action: 'Customize open',
          });
        },
        customizationClose: () => {
          trackService.track({
            category: 'Speed dial',
            action: 'Customize close',
          });
        }
      }
    };

    $state.goHome = function () {

      $state.go('all');

      if ($rootScope.feedVisibleClass) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      } else {
        window.scrollTo({
          top: parseInt(window.innerHeight - 90),
          behavior: 'smooth',
        });
      }

      $rootScope.jumpToRecent(true);

      let inlineTabs = $('.tabs.inline').get(0);
      let stickyTabs = $('.tabs.sticky').get(0);

      if (inlineTabs) {
        inlineTabs.classList.remove('hidden');
      }

      if (stickyTabs) {
        stickyTabs.classList.remove('active')
      }

      $rootScope.showStickyNav = false;

      let shortcutContainer = document.querySelector('.shortcuts ul');

      if (shortcutContainer) {
        shortcutContainer.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }

    };

    $rootScope.reloadPage = function () {
      window.location.reload();
    };

    $rootScope.shakeBlocker = function (event) {

      var shakeElement = $('.blocker .wrapper');

      $(shakeElement).addClass('shake');

      setTimeout(function () {
        $(shakeElement).removeClass('shake');
      }, 750);
    }

    $rootScope.toggleShortcuts = function () {

      $rootScope.shortcutsActive = !$rootScope.shortcutsActive;
      localStorage.shortcutsActive = $rootScope.shortcutsActive;

      // If shortcuts are triggered fom unopened hero, activate full version and oprn shortcuts
      if (!$rootScope.feedVisibleClass) {
        $rootScope.shortcutsActive = true;
        $rootScope.jumpToRecent(true);
      }

      trackService.track({
        category: 'Shortcuts',
        action: 'Toggle Shortcutd',
        label: $rootScope.shortcutsActive ? 'On' : 'Off',
      });

      //FTX state bust
      if ($rootScope.vm.ftxLeft.indexOf('shortcuts') !== -1) {
        $rootScope.showFtx('shortcuts')
      }

      if ($rootScope.vm.showFtx === 'shortcuts') {
        $rootScope.vm.showFtx = false;
      }
    }

    $rootScope.setTheme = function (name) {
      $rootScope.theme = name;
      userService.setData({
        theme: name
      });
    };

    $rootScope.selectBundle = function (bundleName, reload, trackFtx) {

      $rootScope.activeBundle = bundleName;

      // Switch initial short config according to selected bundle
      localStorage.enableShorts = bundleName === 'design';
      $rootScope.enableShorts = bundleName === 'design';

      userService.setData({
        selectedBundle: bundleName
      }).then(() => {

        if (trackFtx) {
          trackService.trackPageView('/ftx/v3/welcome/bundle/' + bundleName, 'Welcome Focus');
        }

        if (reload) {
          location.reload();
        }
      })
    }

    $rootScope.toggleSharebleLinks = function (value) {

      $rootScope.enableSharebleLinks = value;
      localStorage.enableSharebleLinks = value;

      userService.setData({
        enableSharebleLinks: value
      });

    };

    $rootScope.setDefaultSearch = (value) => {

      $rootScope.defaultSearch = value;
      localStorage.defaultSearch = value;

      userService.setData({
        defaultSearch: value
      });

    };

    $rootScope.setSearchEngine = (value) => {

      $rootScope.searchEngine = value;
      localStorage.searchEngine = value;

      userService.setData({
        searchEngine: value
      });

    };

    $rootScope.toggleTrendingTile = function (value) {

      $rootScope.enableTrendingTile = value;
      localStorage.enableTrendingTile = value;

      userService.setData({
        enableTrendingTile: value
      });

    };

    $rootScope.toggleShorts = function (value) {

      $rootScope.enableShorts = value;
      localStorage.enableShorts = value;

      userService.setData({
        enableShorts: value
      });

    };

    $rootScope.toggleGoogleApps = function (value) {

      $rootScope.enableGoogleApps = value;
      localStorage.enableGoogleApps = value;

      userService.setData({
        enableGoogleApps: value
      });

    };

    $rootScope.toggleV4 = function (value, switchSettings) {

      $rootScope.useV4 = value;
      localStorage.useV4 = value;

      trackService.setDimension('is_v4', value?.toString() || 'false');

      if ($rootScope.useV4) {

        document.body.classList.add('v4');

        if (switchSettings) {
          $state.go('settings');
          $rootScope.closeMenu();
        }

        $rootScope.showUpgradeRibbon = false;

      } else {

        document.body.classList.remove('v4');

        if (switchSettings) {
          $state.go('all');

          setTimeout(() => {
            $rootScope.openMenu();
          }, 500)
        }
      }

      if (!$rootScope.$$phase) {
        $rootScope.$digest();
      }

      userService.setData({
        useV4: value
      });

    };

    $rootScope.togglePalettes = function (value) {

      $rootScope.enablePalettes = value;
      localStorage.enablePalettes = value;

      userService.setData({
        enablePalettes: value
      });
    };

    $rootScope.closeAlert = function (alert) {
      userService.markReadAlert({
        id: alert.id
      }).then(function (response) {

        $rootScope.user.unread_alerts = response;

        var index = $rootScope.alerts.indexOf(alert);
        $rootScope.alerts.splice(index, 1);

        trackService.track({
          category: 'Bar notifications',
          action: 'Dismiss click',
          label: $('<span>' + alert.content + '</span>').text(),
        });

      });
    };

    $rootScope.logAlertCta = function (alert, $event) {

      if (!$($event.target).is('a')) {
        return;
      }

      trackService.track({
        category: 'Bar notifications',
        action: 'CTA click',
        label: $($event.target).text() + ' | ' + $('<span>' + alert.content + '</span>').text(),
      });
    };

    $rootScope.getBodyClass = function () {

      var name = 'feed-';
      var currentSource = $rootScope.currentSource;

      if (currentSource && currentSource.name) {
        name += currentSource.name;
      }
      else {
        name += currentSource
      }

      if ($rootScope.feedVisibleClass) {
        name += (' ' + $rootScope.feedVisibleClass);
      }

      if ($rootScope.initialLoading) {
        name += (' ' + $rootScope.initialLoading);
      }

      return name;
    };

    $rootScope.clickLogo = function () {

      trackService.track({
        category: 'Sidebar',
        action: 'Click',
        label: 'muzli logo'
      });

      $state.goHome();
    };

    $rootScope.onSearch = function (event, value) {
      if (event.which == 13) {
        document.location = "http://muz.li/search/?q=" + value;
      }
    };

    $rootScope.showFtx = function (name) {

      let transitionTimeout = $rootScope.flags?.useAnonymousSources ? 0 : 350;

      // Alternative FTX for users who can use costomization anonymously
      if ($rootScope.flags?.useAnonymousSources) {

        if (name === 'sidebar') {

          if (!$rootScope.showSidebar) {
            $rootScope.toggleSidebar();
          }

          if (!$rootScope.shortcutsActive) {
            $rootScope.toggleShortcuts();
          }

        }

        if (name === 'settings') {

          // Skip setting FTX for v4 entirely
          if ($rootScope.useV4) {
            $rootScope.showFtx('scroll');
            return;
          }

          if ($rootScope.showSidebar) {
            $rootScope.toggleSidebar();
          }

          $rootScope.vm.showOverlay = true;

        } else {
          $rootScope.vm.showOverlay = false;
        }

        // Clear all FTX states after scroll
        if (name === 'scroll') {

          if ($rootScope.showSidebar) {
            $rootScope.toggleSidebar();
          }

          $rootScope.vm.ftxLeft = [];
          storage.set({
            ftxLeft: [],
          })
        }

      }

      $timeout(function () {
        $rootScope.vm.showFtx = name;
      }, transitionTimeout);

      let index = $rootScope.vm.ftxLeft.indexOf(name);
      $rootScope.vm.ftxLeft.splice(index, 1);

      storage.set({
        ftxLeft: $rootScope.vm.ftxLeft,
      })
    }

    $rootScope.openMenu = function (searchSettings, $event) {

      $event?.stopPropagation();
      $event?.preventDefault();
      
      $rootScope.settingsOpen = !$rootScope.settingsOpen;

      $('.tooltipsy').remove();

      if (searchSettings) {

        if ($rootScope.useV4) {

          $state.go('settings');

          setTimeout(() => {
            
            const settingsElement = document.querySelector('.blocker.scroll');
            const sectionElement = document.getElementById('search-settings');

            if (!settingsElement || !sectionElement) {
              return;
            }

            // Get bounding rectangles for container and element
            const containerRect = settingsElement.getBoundingClientRect();
            const elementRect = sectionElement.getBoundingClientRect();

            // Calculate scroll offset so that element is approximately centered
            const offset = 
              (elementRect.top - containerRect.top) + container.scrollTop
              - (containerRect.height / 2)
              + (elementRect.height / 2);

            // Smoothly scroll the container to the computed offset
            settingsElement.scrollTo({
              top: offset,
              behavior: 'smooth',
            });  

            // Add the blink class, then remove it after a short delay
            setTimeout(() => {
              sectionElement.classList.add('notice');
  
              setTimeout(() => {
                sectionElement.classList.remove('notice');
              }, 2000);
            }, 1000)

          }, 100)

          return;
        }

        const settingsElement = document.querySelector('aside');
        settingsElement.scrollTo({
          top: settingsElement.scrollHeight,
          behavior: 'smooth',
        });
      }

      //FTX state bust
      if ($rootScope.vm.ftxLeft.indexOf('settings') !== -1) {
        $rootScope.showFtx('settings')
      }

      trackService.track({
        category: 'Settings toggle',
        action: 'Click',
        label: 'Open'
      });

      //???
      $(document).on("click.settingsOpen", function (e) {
        if ($(e.target).parents('.feedLink').length) {
          e.preventDefault();
        }
      });
    };

    $rootScope.closeMenu = function () {

      $rootScope.settingsOpen = false;

      $(document).off("click.settingsOpen");

      if ($rootScope.vm.showFtx === 'settings') {
        $rootScope.vm.showFtx = false;
        $rootScope.vm.showOverlay = false;
      }
    };

    $rootScope.bodyKeyUp = function (event) {

      // Escape 
      if (event.keyCode === 27) {
        window.muzli.closeOnEsc.forEach(function (item) {
          item();
        });
      }
    };

    $rootScope.bodyKeyDown = function (event) {

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      var c = String.fromCharCode(event.keyCode);
      var isWordCharacter = c.match(/\w/);
      var isBackspaceOrDelete = (event.keyCode == 8 || event.keyCode == 46);
      var noFocus = $("input[type=text],input[type=url],input[type=email]").is(':focus');

      //Open sidebar and start typing into search
      if (((isWordCharacter || isBackspaceOrDelete) && !noFocus)) {

        if ($rootScope.showSidebar) {
          document.querySelector('input[ng-model=searchSources]').focus();
        } else {
          document.querySelector('#searchForm input:not(.secondary)').focus();
        }

      }

      //Close sidebar on ESC
      if (event.keyCode == 27) {

        $("input[ng-model=searchSources]").blur();
        $rootScope.showSidebar = false;
        $rootScope.searchSources = '';

        if ($state.current.name === 'feed') {
          $state.go('all')
        }

        if ($state.current.name === 'speed-dial') {
          $state.go('all')
        }

      }


    };

    $rootScope.twitterFollow = function () {
      window.open('https://twitter.com/intent/follow?screen_name=usemuzli', 'follow', 'height=400,width=550');
    };

    $rootScope.reload = function () {
      if (!$rootScope.user) {
        window.location.reload();
        return;
      }
      $state.reload();
    };

    $rootScope.sortFeed = function (sort) {

      var current = $state.current.name;
      var params = { sort: sort };

      $state.go(current, params, { reload: true });

      var sortValue = (sort === 'virality') ? 'Popular' : 'Recent';

      trackService.track({
        category: 'Feed',
        action: 'Sort',
        label: sortValue
      });
    };

    $rootScope.setError = function ($scope, error) {
      $timeout(function () {
        if (!$scope.$$destroyed && !$rootScope.userNavigatingAway) {
          $rootScope.errors.push(error);
        }
      }, 100);
    };

    $rootScope.closeVideoPopup = function () {

      $rootScope.currentPlayingItem = false;

      $('.video-container iframe, .video-container video').remove();
      $('.video-container').removeClass('pop');
      $('.video-container').css({
        width: '',
        height: '',
      })
    }


    if (window.chrome || window.isMuzliSafari) {

      $rootScope.jumpToRecent = function (skipScroll) {

        //Bust FTX state
        if ($rootScope.vm.showFtx === 'scroll') {
          $rootScope.vm.showFtx = false;
        }

        moveToFullView();

        $rootScope.feedVisibleClass = 'full-view';
        $rootScope.initialLoading = 'loading-scrolled';
        $rootScope.$broadcast('user-scrolled');

        scrollDefer.resolve('User clicked scroll trigger');

        if (!skipScroll) {
          window.scrollTo({
            top: parseInt(window.innerHeight - 90),
            behavior: 'smooth',
          });
        }

        window.blockScrollEvents = true;

        setTimeout(() => {
          window.blockScrollEvents = false;
        }, 500)

      };

      $rootScope.toggleMinimalView = function (skipReload) {

        $rootScope.isSwitchedToHalfViewIndicator = !$rootScope.isSwitchedToHalfViewIndicator

        var setData = userService.setData({
          halfView: $rootScope.isSwitchedToHalfViewIndicator
        }, !$rootScope.isSwitchedToHalfViewIndicator);

        if ($rootScope.isSwitchedToHalfViewIndicator) {
          moveToFullView();
        } else {
          setData.then(function () {
            if (!skipReload) {
              location.reload();
            }
          });
        }
      };
    }

    //Set flag if user is navigating away from tab
    window.addEventListener("beforeunload", function (e) {
      $rootScope.userNavigatingAway = true;
    }, false);

  }

  try {
    var moduleTemplate = angular.module('muzli-template')
  }
  catch (e) {
    moduleTemplate = angular.module('muzli-template', [])
  }

  angular.module('muzli', [
    moduleTemplate.name,
    'ngAnimate',
    'ui.router',
    'angular-click-outside',
    'bootstrap',
    'user',
    'search',
    'sources',
    'feed',
    'chrome',
    'speed-dial',
    'videos',
    'referral',
  ])
    .constant('R', window.R)
    .value('server', function () {
      return window.MUZLI_SERVER
    })
    .config(config)
    .run(run);

})();
