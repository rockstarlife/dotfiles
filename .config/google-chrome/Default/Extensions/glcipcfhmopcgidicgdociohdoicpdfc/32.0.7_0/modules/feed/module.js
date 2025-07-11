(function () {

    feedController.$inject = ['$scope', '$rootScope', '$stateParams', '$timeout', 'serverPageSize', 'fetchService'];

    function feedController($scope, $rootScope, $stateParams, $timeout, serverPageSize, fetchService) {

        window.muzli.pageChange();

        //Close autocomplete on navigation
        $('.ui-autocomplete-input').autocomplete('close');

        $rootScope.$broadcast('muzliMoveToFullView');
        $rootScope.areHomeImagesLoaded = true;

        let sourceName = $stateParams.name;
        let sort = $stateParams.sort;
        let user = $stateParams.user || $rootScope.currentSource?.user;
        let filter = $stateParams.filter;
        let adChannel = sourceName === 'dribbble' ? 'dribbble' : '';

        $scope.sponsored;
        $scope.hideGhost = false;
        $scope.filter = filter;
        $scope.user = user;
        $scope.isCurrentUser = user === $rootScope.user;
        $scope.hideTitle = $stateParams.hideTitle;

        //Fetch sponsored ad if not skipped
        if (!$stateParams.skipSponsored) {
            fetchService
                .fetchSponsoredPost(adChannel)
                .then((sponsored) => {
                    if (sponsored) {
                        let sourceParamIndex = sponsored.beacon.lastIndexOf('&source=');
    
                        sponsored.beacon = sponsored.beacon.slice(0, sourceParamIndex);
                        sponsored.beacon += '&source=' + sourceName;
    
                        $scope.sponsored = sponsored;
                    }
                });
        }

        // If user is not logged in and trying to fetch own profile, just skip the fetch
        if ($scope.isCurrentUser && $rootScope.user.anonymous) {
            $scope.hideTitle = true;
            sourceName = 'empty';
        }

        let feedPromises = [
            fetchService.fetch(sourceName, sort, serverPageSize, filter, user?.id)
        ]

        if (sourceName === 'store' && !filter) {
            feedPromises.unshift(fetchService.fetch(null, sort, serverPageSize, 'store'))
        }

        //Fetch feed content
        Promise
            .all(feedPromises)
            .then(feedResults => {

                // If fetch results contain user data, populate scope with it
                if (feedResults.at(0)?.user) {
                    $scope.displayUser = feedResults.at(0).user;
                }
                
                // If multiple fetch requests are made, process the data accordingly
                if (feedResults.length > 1) {
                    
                    let bundleData = feedResults[0].data;
                    let feedData = feedResults[1].data;

                    let data = [
                        ...bundleData,
                        ...feedData.filter(feedItem => {
                            return bundleData.findIndex(bundleItem => bundleItem.id === feedItem.id) === -1;
                        })
                    ]

                    return {
                        ...feedData,
                        data: data,
                    }
                }

                return feedResults[0];
            })
            .then((res) => {

                let posts = res.data;
                let latestFeedPost = res.latest;

                $scope.items = posts;

                let source = $rootScope.sources.find(function (_source) {
                    return sourceName == _source.name;
                });

                if (source) {
                    source.read = true;
                    source.latest = latestFeedPost;
                }

                $timeout(function () {
                    $scope.hideGhost = true;
                });

            }).catch(function (error) {
                console.error(error);
                $rootScope.setError($scope, 'error');
            });

    }

    sourcesController.$inject = ['$scope', '$stateParams', '$rootScope', 'serverPageSize', 'fetchService'];

    function sourcesController($scope, $stateParams, $rootScope, serverPageSize, fetchService) {

        window.muzli.pageChange();
        $rootScope.$broadcast('muzliMoveToFullView');
        $rootScope.areHomeImagesLoaded = true;

        let sort = $stateParams.sort;

        $scope.sponsored = {};

        fetchService.fetchSponsoredPost().then((sponsored) => {
            $scope.sponsored = sponsored;
        });

        fetchService.fetch(null, sort, serverPageSize).then(function (res) {
            $scope.items = res.data;
        }).catch(function (error) {
            console.error(error);
            $rootScope.setError($scope, 'error');
        });
    }

    config.$inject = ["$stateProvider"];

    function config($stateProvider) {

        $stateProvider.state('store', {
            directSource: true,
            params: {
                name: 'store',
                sort: 'created',
                filter: '',
                skipSponsored: true,
            },
            templateUrl: 'modules/feed/feed.store.html',
            controller: feedController
        });

        $stateProvider.state('jobs', {
            directSource: true,
            params: {
                name: 'jobs',
                sort: 'created',
                filter: '',
                skipSponsored: true,
            },
            templateUrl: 'modules/feed/feed.jobs.html',
            controller: feedController
        });

        $stateProvider.state('profile', {
            directSource: true,
            params: {
                name: 'user',
                sort: 'created',
                user: null,
                skipSponsored: true,
                hideTitle: false,
            },
            templateUrl: 'modules/feed/feed.html',
            controller: feedController,
        });

        $stateProvider.state('feed', {
            directSource: true,
            params: {
                name: 'muzli',
                sort: 'created',
                user: null,
                skipSponsored: false,
            },
            templateUrl: 'modules/feed/feed.html',
            controller: feedController
        });

        $stateProvider.state('sources', {
            templateUrl: 'modules/feed/user-sources.html',
            params: {
                sort: 'created'
            },
            controller: sourcesController
        });
    }

    angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', window.muzli.paging.throttle);
    angular.module('feed', ['ngAnimate', 'sources', 'infinite-scroll'])
    .constant('localPageSize', window.muzli.paging.local)
    .constant('serverPageSize', window.muzli.paging.server)
    .config(config);

    angular.module('feed').controller('feedController', ['$scope', '$rootScope', '$stateParams', '$timeout', 'sources', 'serverPageSize', 'fetchService', feedController]);

})();
