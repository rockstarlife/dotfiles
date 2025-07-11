(function() {

    localStorage.setItem('lastUserUpdate', new Date());

    //CONFIG
    config.$inject = ['$httpProvider', '$stateProvider'];

    function config($httpProvider, $stateProvider) {

        $stateProvider.state('welcome', {
            views: {
                'blocker': {
                    templateUrl: 'modules/sources/welcome.html',
                    controller: ['$scope', '$rootScope', '$stateParams', 'trackService', 'userService',
                        function($scope, $rootScope, $stateParams, trackService, userService) {

                            trackService.trackPageView('/ftx/welcome', 'Welcome');

                            userService.setData({
                                'events': {
                                    ftxStarted: new Date()
                                }
                            });
                        }
                    ]
                }
            }
        });

        $stateProvider.state('lite-check', {
            views: {
                'blocker': {
                    templateUrl: 'templates/lite-check.html',
                    controller: ['$scope', '$rootScope', 'trackService', '$state',
                        function($scope, $rootScope, trackService, $state) {


                            trackService.trackPageView('/lite-check', 'Lite version update check');

                            $scope.toggleFullVersion = function() {
                                $rootScope.toggleIsLiteVersion();
                                $state.go('all');
                            }

                        }
                    ]
                }
            }
        });

        $stateProvider.state('lite-enable', {
            views: {
                'blocker': {
                    templateUrl: 'templates/lite-enable.html',
                    controller: ['$scope', '$rootScope', 'trackService', 'userService', '$state', 'storage',
                        function($scope, $rootScope, trackService, userService, $state, storage) {

                            trackService.trackPageView('/lite-enable', 'Lite version activation');

                            // Treat this as override automatically
                            storage.set({
                                lite: true,
                                liteOverride: true,
                            });

                            $scope.toggleLiteVersion = function() {
                                
                                $rootScope.isLiteVersion = true;
                                $rootScope.isMuzliHomepage = false;
                                $rootScope.useSpeedDial = false;
                                                                
                                storage.set({
                                    ftxLeft: [],
                                    showedBundles: true,
                                    liteOverride: false,
                                })

                                // Prepare full version
                                document.body.classList.add('initial-full-view');
                                $rootScope.$broadcast('muzliMoveToFullView');

                                userService.setData({
                                    halfView: true,
                                    useSpeedDial: false,
                                    topSitesDisabled: true,
                                }).then(() => {
                                    $state.go('all');
                                })
                            }

                            $scope.keepFullVersion = function($event) {

                                $event?.preventDefault()

                                $rootScope.vm.ftxLeft = ['scroll', 'speed-dial'];

                                storage.set({
                                    ftxLeft: $rootScope.vm.ftxLeft,
                                    showedBundles: true,
                                }).then(userService.setData({
                                    halfView: false,
                                    useSpeedDial: true,
                                    topSitesDisabled: true,
                                }))
                                .then(() => {
                                    $state.go('all');
                                })

                            }

                        }
                    ]
                }
            }
        });

        $stateProvider.state('sign-in', {
            params: {
                returnTo: '',
            },
            views: {
                'blocker': {
                    templateUrl: 'templates/auth.html',
                    controller: ['$rootScope', '$stateParams', 'trackService',
                        function($rootScope, $stateParams, trackService) {

                            $rootScope.vm.ftx = false;
                            $rootScope.vm.returnTo = $stateParams.returnTo;

                            trackService.trackPageView('/sign-in', 'SignIn');

                        }
                    ]
                }
            }
        });

        $stateProvider.state('safari', {
            views: {
                'blocker': {
                    templateUrl: 'modules/sources/welcome-safari.html',
                    controller: ['$scope', '$rootScope', '$stateParams', 'trackService', 'userService',
                        function($scope, $rootScope, $stateParams, trackService, userService) {

                            trackService.trackPageView('/ftx/welcome', 'Welcome');

                            userService.setData({
                                'events': {
                                    ftxStarted: new Date()
                                }
                            });
                        }
                    ]
                }
            }
        });

    }


    // RUN
    run.$inject = ['$q', '$rootScope', '$state', 'sources', 'trackService', 'userService', '$timeout', 'storage'];

    function run($q, $rootScope, $state, sourceService, trackService, userService, $timeout, storage) {

        $rootScope.vm = $rootScope.vm || {};
        $rootScope.isMuzliSafari = window.isMuzliSafari;
        $rootScope.searchSources = '';

        function loadSourcesData() {

            return sourceService.fetch()
            .then(function(_sources) {
                $rootScope.sources = _sources;
            });

        }

        function reLoadSources() {
            userService.reLoadUser()
            loadSourcesData();
        }

        loadSourcesData();

        window.addEventListener('storage', function(e) {
            if (e.key === 'lastUserUpdate') {
                reLoadSources();
            }
        });

        $rootScope.$on('reLoadSources', reLoadSources);

        $rootScope.toggleSidebar = function() {

            $timeout(async function() {
                
                $rootScope.showSidebar = !$rootScope.showSidebar;

                if ($rootScope.showSidebar) {
                    trackService.track({
                        category: 'Sidebar',
                        action: 'Edit',
                        label: 'Open source sidebar'
                    });
                }

                if (!$rootScope.showSidebar) {

                    $rootScope.searchSources = '';
                    $rootScope.clearedShortcuts = [];

                    document.body.classList.remove('lock-scroll')

                } else {

                    document.body.classList.add('lock-scroll')

                    let demotedSources = $rootScope.user.demotedSources || [];
                    let shortcuts = await sourceService.getShortcuts();

                    $rootScope.sources.forEach(source => {

                        if (source.isShortcut) {
                            source.initialOrder = shortcuts.findIndex(item => item.name === source.name)
                        } else {
                            source.initialOrder = shortcuts.length;
                        }

                        //Set demoted
                        if (demotedSources.indexOf(source.name) !== -1) {
                            source.isDemoted = true;
                            source.initialOrder = shortcuts.length + 1;
                        }

                        //Push down the static sources
                        if (source.static) {
                            source.initialOrder += shortcuts.length;
                        }

                    })

                    $rootScope.sources.sort((a, b) => {
                        return a.initialOrder - b.initialOrder;
                    })

                }

                //FTX state bust
                if ($rootScope.vm?.ftxLeft?.includes('sidebar')) {
                    $rootScope.showFtx('sidebar');
                }

            })
        }

        $rootScope.clickSource = function(source) {

            if (source) {

                $state.go('feed', { 
                    name: source.name, 
                    sort: 'created' 
                }, { 
                    reload: true 
                });

                $rootScope.unreadIndicators[source.name] = false;

                sourceService.findByName(source.name).unread = false; 
                $rootScope.updateShortcuts();

                storage.set({
                    lastHomeScrolled: new Date(),
                })

            } else {
                $state.go('sources', {}, { reload: true });
            }

            trackService.track({
                category: 'Sidebar',
                action: 'Click',
                label: 'Source: ' + (source ? source.name : 'all')
            });
        };

        $rootScope.clickSidebarSource = function(source, $event) {

            if ($event) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            $rootScope.clickSource(source);
            $rootScope.toggleSidebar();
            
        };

        $rootScope.onToggleSource = function(source) {
            
            if (source.isShortcut) {

                sourceService.addShortcut(source)

                trackService.track({
                    category: 'Sidebar',
                    action: 'Enable',
                    label: 'Source: ' + source.name
                });

            } else {

                sourceService.removeShortcut(source)

                trackService.track({
                    category: 'Sidebar',
                    action: 'Disable',
                    label: 'Source: ' + source.name
                });
            }
        }

        $rootScope.toggleSourceDemotion = function(source) {

            if ($rootScope.user?.anonymous && !$rootScope.flags?.useAnonymousSources) {
                $rootScope.checkAnonymousSources();
                return;
            }

            if (source.isDemoted) {
                sourceService.reactivateSource(source);
            } else {
                sourceService.demoteSource(source);
            }
        }

        $rootScope.checkAnonymousSources = function($event) {

            if ($rootScope.flags?.useAnonymousSources) {
                return;
            }

            if ($rootScope.user?.anonymous) {

                if ($event) {
                    $event.preventDefault();
                    $event.stopPropagation()
                }

                if ($rootScope.showSidebar) {
                    $('.sidebar .anonymous').addClass('shake');
    
                    setTimeout(() => {
                        $('.sidebar .anonymous').removeClass('shake');
                    }, 1000)

                } else {
                    $rootScope.$broadcast('userError', 'signed-out');
                }

            }

        }

        $rootScope.clearShortcuts = function($event) {

            if ($event) {
                $event.stopPropagation();
                $event.preventDefault();
            }

            trackService.track({
                category: 'Sidebar',
                action: 'Clear',
                label: 'Clear all sources'
            });

            $rootScope.sources.forEach(function(source) {
              source.isShortcut = false;
            })

            sourceService.clearShortcuts()
        }

        $rootScope.restoreShortcuts = function($event) {

            if ($event) {
                $event.stopPropagation();
                $event.preventDefault();
            }

            $rootScope.sources.forEach(function(source) {
                if ($rootScope.clearedShortcuts.indexOf(source.name) !== -1 ) {
                    source.isShortcut = true;
                }
            })

            sourceService.restoreShortcuts()
        }

        //Set currentSource globally if user goes to feed page
        $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {

            if (toState.name === 'profile') {
                $rootScope.currentSource = {
                    profile: 'true',
                    name: 'user',
                    user: $rootScope.user,
                }
                return;
            }

            if (toStateParams.name === 'user' && toStateParams.user) {
                $rootScope.currentSource = {
                    name: 'user',
                    user: toStateParams.user,
                }
                return;
            }

            if (toState.directSource) {
                $rootScope.currentSource = sourceService.findByName(toStateParams.name);
            } else {
                $rootScope.currentSource = toState.name;
            }

        });

        $rootScope.sideBarSortableOptions = {
            distance: 30,
            containment: '.sources',
            tolerance: 'pointer',
            handle: '> .icon-menu',
            stop: function(e, obj) {

                let updatedShortcuts = $rootScope.sources
                .filter(source => source.isShortcut)
                .map(item => item.name)

                userService.setData({
                  shortcuts: updatedShortcuts,
                });

            }
        };

    }

    function sourcesFilter() {
        return function(array, value) {
            
            if (!array) {
                return [];
            }

            if (!value) {
                return array;
            }

            return array.filter(function(source) {
                return source.title.toLowerCase().indexOf(value.toLowerCase()) !== -1;
            })
        };
    }

    angular.module('sources', ['ui.sortable', 'ui.router'])
        .config(config)
        .run(run)
        .filter('sourcesFilter', sourcesFilter)
        
})();