(function() {

    var $window = $(window);

    scrollableFeed.$inject = ['$rootScope', '$timeout', '$stateParams', 'trackService', 'localPageSize', 'serverPageSize', 'userService', 'fetchService', 'sources', 'searchService'];

    function scrollableFeed($rootScope, $timeout, $stateParams, trackService, localPageSize, serverPageSize, userService, fetchService, sources, searchService) {

        return {
            restrict: 'E',
            scope: {
                items: '=',
                sponsored: '=',
                filter: '=',
                jobs: '=',
                displayUser: '=?',
            },
            transclude: {
                'no-data': '?scrollableFeedNoData'
            },
            templateUrl: function(elem, attrs) {

                if ($rootScope.currentSource === 'favorites') {
                    return 'modules/feed/feed.drv.favorites.html';
                }

                if ($rootScope.currentSource?.name === 'store') {
                    return 'modules/feed/feed.drv.store.html';
                }

                if ($rootScope.currentSource?.name === 'colors') {
                    return 'modules/feed/feed.drv.colors.html';
                }

                if ($rootScope.currentSource?.name === 'jobs') {
                    return 'modules/feed/feed.drv.jobs.html';

                }

                if ($rootScope.currentSource?.name === 'user') {
                    return 'modules/feed/feed.drv.user.html';
                }

                if ($rootScope.currentSource === 'all' && $rootScope.currentFeedFilter === 'top') {
                    return 'modules/feed/feed.drv.live.html';
                }

                return 'modules/feed/feed.drv.html';
            },
            link: function($scope, el, attrs) {

                var feedItems;
                var current;
                var feed = [];
                var checkDeleteLength = angular.isDefined(attrs.checkDeleteLength);
                var source = $rootScope.currentSource?.name || $rootScope.currentSource;
                var loadComplete = false;
                var loadingFromServer = false;
                var sourceCounter = {};

                $scope.loading = false;
                $scope.numberOfServerPageLoads = 0;
                $scope.infiniteScrollDistance = window.muzli.paging.scrollDistance;
                $scope.showFavorite = angular.isDefined(attrs.showFavorite);
                $scope.showVirality = angular.isDefined(attrs.showVirality);
                $scope.enablePalettes = $rootScope.enablePalettes;
                $scope.flags = $rootScope.flags;
                $scope.goHome = $rootScope.$state.goHome;
                $scope.useV4 = $rootScope.useV4;
                $scope.didnaRows = $rootScope.user?.didna?.split(',')?.slice(0, 1);
                $scope.skipSponsored = $stateParams.skipSponsored;
                $scope.openUploadPage = $rootScope.openUploadPage;
                $scope.vm = $rootScope.vm;

                function init() {

                    // If feed array already exist, reset it
                    if (feed.length) {
                        feed.length = 0;
                    }

                    //Initialy load feedItems from passed directive parameter
                    feedItems = $scope.items;
                    current = 0;

                    $scope.feed = feed;
                    $scope.hideGhost = false;

                    userService.getData().then((user) => {
                        $scope.user = user;
                    })

                }

                function insertItems() {

                    $scope.loadingItems = true;

                    //Slice feedItems array according to local pagination
                    var feedPage = feedItems.slice(current, Math.min(current + localPageSize, feedItems.length));

                    //Add links that redirect to Muzli share splash page
                    addShareLinks(feedPage, current);

                    current += localPageSize;

                    //Add page to feed
                    feed.push(...feedPage);

                    $timeout(() => {
                        $scope.loadingItems = false;
                        $scope.hideGhost = true;
                    })
                }

                function loadMore() {

                    var filter = $scope.filter;
                    var past = current > feedItems.length - 1;
                    let fetcher;

                    if (past && source && !loadingFromServer && !loadComplete) {

                        loadingFromServer = true;
                        
                        if (source === 'search') {

                            fetcher = searchService
                                .fetch($rootScope.searchModel[$rootScope.activeSearch], current, serverPageSize, $rootScope.currentSearchFilter)
                                .then(response => {
                                    return response.data
                                })


                        } else {
                            fetcher = fetchService.fetchFromServer(source, serverPageSize, current, filter, $scope.user?.id)
                        }

                        fetcher.then(function(res) {
                            
                            if (!res.length) {
                                loadComplete = true;
                                return;
                            }

                            // Remove duplicates
                            // To refactor
                            feedItems.push(...res.filter(function(item) {
                                return !feedItems.filter(function(_item) {
                                    return _item.id === item.id;
                                }).length
                            }));

                            insertItems();
                            $scope.numberOfServerPageLoads++
                            loadingFromServer = false;
                        });
                    }

                    if (past) {
                        return;
                    }

                    insertItems();
                }

                function addShareLinks(feedPage, current) {

                    if (source === 'favorites') {
                        return;
                    }

                    if (!window.MUZLI_SHARE_SERVER) {
                        return;
                    }

                    if (!JSON.parse(localStorage.enableSharebleLinks || 'false')) {
                        return;
                    }

                    if (window.innerWidth <= 1440) {
                        return;
                    }
                    
                    feedPage.forEach(function(item, index) {

                        var source = (item.source ? item.source.name : item.source) || 'muzli';
                        var listPosition = sourceCounter[source] - 1 || 0;
                        var shortUrl = btoa(item.id.slice(0,9))
                        var linkOut = window.MUZLI_SHARE_SERVER + shortUrl

                        if (!item.isFrameAllowed) {
                            return;
                        }

                        //Increment source counter
                        if (!sourceCounter[source]) {
                            sourceCounter[source] = 0;
                        }

                        sourceCounter[source] ++;

                        linkOut += '?referrer=muzli&source=' + source + '&skip=' + listPosition;
                        item.link_out = linkOut;

                    })
                }

                $scope.loadMore = loadMore;
                $scope.playerVars = fetchService.constants.playerVars;
                $scope.postClick = fetchService.event.postClick;
                $scope.openSharer = fetchService.event.openSharer;
                $scope.sendSlack = fetchService.event.sendSlack;
                $scope.sourceClick = fetchService.event.sourceClick;
                $scope.promotionClick = fetchService.event.promotionClick;
                $scope.toggleFavorite = fetchService.event.toggleFavorite;
                $scope.markNSFW = fetchService.event.markNSFW;
                $scope.unmarkNSFW = fetchService.event.unmarkNSFW;

                if ($rootScope.feedVisibleClass) {
                    $scope.showAdPixel = true;
                }

                $scope.showNomination = (item) => {

                    window.open(`${window.MUZLI_WEBSITE_URL}/nominees/${item.slug}`);

                    item.showMenu = false;
                    
                    trackService.track({
                        category: 'Feed',
                        action: 'Click',
                        label: item.link,
                        //Set customDimension5 (Context)
                        customDimensions: [{
                            name: 'cd5',
                            value: 'nomination',
                        }]
                    });

                }

                $scope.searchTag = (tag, event) => {

                    if (event) {
                        event.stopPropagation();
                        event.preventDefault();     
                    }

                    $rootScope.$state.go('store', { 
                        filter: tag
                    });
                }

                $scope.markHidden = function(item) {
                    fetchService.event.markHidden(item).then(function(response) {
                        var index = $scope.feed.indexOf(item);

                        if (index > -1) {
                            $scope.feed.splice(index, 1);
                        }
                    });
                }

                $scope.demoteSource = function(source) {

                    sources.demoteSource(source)

                    $scope.feed = $scope.feed.filter(function(item) {

                        if (!item.source) {
                            return true;
                        }

                        return (item.source.name || item.source) !== source.name;

                    })

                }

                $scope.downloadSVG = function(item, event) {

                    if (event) {
                        event.stopPropagation();
                        event.preventDefault();     
                    }

                    function pad(num) {
                        var s = num+"";
                        while (s.length < 2) s = "0" + s;
                        return s;
                    }

                    trackService.track({
                        category: 'Palettes',
                        action: 'Download'
                    });

                    var downloadUrl = window.MUZLI_SEARCH_URL + '/palette/' + item.palette.map(function(color) {
                        return color.slice(1)
                    }).join('/') + '?utm_source=extension&utm_medium=muzli'

                    window.open(downloadUrl);
                }

                $scope.videoClick = function(post, event) {
                    
                    event.stopPropagation();
                    event.preventDefault();

                    fetchService.event.videoClick(post);
                };

                $scope.removeFavorite = function(event, index, item) {
                    event.preventDefault();
                    event.stopPropagation();

                    userService.setFavorite(item, false);

                    feed.splice(index, 1);
                };

                $scope.deleteItem = function(event, index, item) {

                    event?.preventDefault();
                    event?.stopPropagation();

                    userService.deleteItem(item);

                    feed.splice(index, 1);
                };

                if (checkDeleteLength) {
                    $scope.$watch('feed.length', function(value, oldValue) {

                        if (value === 0 && oldValue) {
                            
                            $scope.blockEmpty = true;

                            $timeout(function() {
                                $scope.blockEmpty = false;
                            }, 600);
                        }
                    });
                }

                $scope.$watch('feed.length', function() {

                    const gridElement = document.querySelector('#feed ul');

                    $timeout(() => {
                        
                        const gridRows = window.getComputedStyle(gridElement)?.getPropertyValue("grid-template-rows")?.split(" ")?.length;
                        const didnaRows = $rootScope.user?.didna?.split(',')?.filter(row => {
                            return parseInt(row) < gridRows;
                        })

                        $scope.didnaRows = didnaRows;

                        if ($scope.didnaRows?.length && $scope.didnaRows?.at(0) === '1') {
                            $scope.hideSponsored = true;
                        }

                    })
                })

                $scope.$watch('items', function(items) {   

                    //Enable shorts section for Highlights
                    if ($scope.filter === 'all' && localStorage.enableShorts === 'true') {
                        $scope.enableShorts = true;
                    } else {
                        $scope.enableShorts = false;
                    }

                    if (items && items.length) {

                        init();

                        $scope.isRendering = true;

                        $timeout(function() {
                            loadMore();
                            $scope.isRendering = false;
                        });

                    } else if (items) {

                        init();

                        $timeout(() => {
                            $scope.loadingItems = false;
                            $scope.hideGhost = true;
                        })

                    }
                    
                });

                
                $scope.$on('user-scrolled', function() {
                    $scope.showAdPixel = true;
                });

                const v4Watcher = $rootScope.$watch('useV4', function(useV4) {   
                    $scope.useV4 = useV4;
                });

                $scope.$on("$destroy", () => {
                    v4Watcher();
                })
            }
        };
    }

    angular.module('feed')
        .directive('scrollableFeed', scrollableFeed)
        .directive('muzliPlaceholder', ['$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    placeholder: '=ngPlaceholder'
                },
                link: function(scope, elem) {
                    $rootScope.$watch('activeSearch', function(value) {
                        if (!value) {
                            return;
                        }
                        elem[0].placeholder = value === 'muzli' ? 'Inspiration search' : 'Search Google or type URL';
                    });
                }
            }
        }]);

})();
