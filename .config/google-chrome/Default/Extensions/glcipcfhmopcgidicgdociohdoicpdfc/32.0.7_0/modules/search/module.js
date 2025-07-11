(function () {

    searchController.$inject = ['$scope', '$rootScope', '$stateParams', '$state', 'searchService'];

    function searchController($scope, $rootScope, $stateParams, $state, searchService) {

        window.muzli.pageChange();

        $("#searchBox").focus();

        var data;
        var q = $stateParams.q;
        var sources = [];

        $rootScope.feedVisibleClass = 'full-view';
        $rootScope.initialLoading = 'loading-complete';
        $rootScope.areHomeImagesLoaded = true;
        $rootScope.currentSearchFilter = $stateParams.filter || 'all';
        $scope.query = q;

        var initialLoad = searchService
            .fetch(q, 0, 30, $rootScope.currentSearchFilter)
            .then(function (response) {

                data = response;
                $scope.items = response.data;
                $scope.total = response.total;

            });

        initialLoad.catch(function () {
            $rootScope.setError($scope, 'error');
        });

        $scope.$on('muzli:search:filter', function () {

            var newSources = [];

            if (newSources.length > sources.length) {
                $state.go('search', {
                    q: q
                }, {
                    reload: true
                });
            }

            initialLoad.then(function () {
                $scope.items = data.filter(function (item) {
                    return $rootScope.searchFilters.sources[item.source.name];
                });
            });
        });
    }

    config.$inject = ['$stateProvider'];

    function config($stateProvider) {

        $stateProvider.state('search', {
            params: {
                q: '',
                filter: 'all',
            },
            templateUrl: 'modules/search/search.html',
            controller: searchController
        });
    }

    run.$inject = ['$rootScope', '$state', '$compile', 'trackService'];

    function run($rootScope, $state, $compile, trackService) {

        let useExternalSearch = false;

        $rootScope.search = search;

        $rootScope.searchModel = {
            muzli: '',
            google: '',
        };

        $rootScope.searchFilters = {
            sources: {
                dribbble: true,
                muzli: true
            }
        };

        $rootScope.toggleSearchSource = function (name) {
            $rootScope.searchFilters.sources[name] = !$rootScope.searchFilters.sources[name];
            $rootScope.$broadcast('muzli:search:filter');
        };

        $rootScope.setSearch = function (searchType, $event) {

            //Prevent scrolling a search container on element focus
            //due to default Chrome behavior
            if ($event) {
                $('#searchForm .input')[0].scrollTo(0, 0);
            }

            $rootScope.activeSearch = searchType;

        }

        function search(text, event, searchType) {
            
            var element;

            if (event) {
                element = $(event.target).find('input');
            } else {
                element = $rootScope.focusedSearchInput;
            };


            if (!text) {
                $(element).focus();
                return;
            }

            $(element).blur();

            searchType = searchType || $rootScope.activeSearch;

            if (searchType === 'muzli') {
                $rootScope.activeSearch = searchType;
            }

            trackService.track({
                category: 'Search',
                action: 'Submit ' + (searchType || 'muzli'),
                label: text
            });

            if (text.indexOf("http://") > -1 || text.indexOf("https://") > -1) {
                document.location = text;
            } else if (searchType === 'muzli') {

                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                if (useExternalSearch) {

                    trackService.trackPageView('/search?q=' + text, 'Muzli search', function () {
                        document.location = window.MUZLI_SEARCH_URL + '/search/' + text + '?utm_source=extension&utm_medium=muzli';
                    })


                } else {

                    trackService.trackPageView('/search?q=' + text, 'Muzli search')

                    $state.go('search', {
                        q: text,
                        filter: $rootScope.currentSearchFilter,
                    }, {
                        reload: true
                    });
                }


            } else if (searchType === 'google') {

                // Use default browser's search engine
                if (window.chrome?.permissions?.request) {
                    window.chrome.permissions.request({
                        permissions: ["search"]
                    }, (granted) =>  {
                        if (granted) {
                            chrome.search.query({
                                text,
                            });
                        }
                    })

                // If Muzli is served in web app, use the one from the settings
                } else {

                    if ($rootScope.searchEngine === 'bing') {
                        document.location = `${window.MUZLI_SEARCH_URL}/dynamiclander/?q=` + encodeURIComponent(text);
                        return;
                    }
    
                    document.location = "http://google.com/search?q=" + encodeURIComponent(text);
                }


            }
        }

        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
        }

        $.ui.autocomplete.prototype._renderItem = function (ul, item) {

            var itemTemplate = `<li></li>`;

            var text = String(item.value).replace(
                new RegExp(escapeRegExp(this.term), "gi"),
                "<span class='ui-state-highlight'>$&</span>");

            if (text.indexOf("http://") != -1 || text.indexOf("https://") != -1) {
                itemTemplate = `<li class="url"></li>`
            }

            //Item is a source if it has name property
            if (item.name) {

                itemTemplate = `<li class="ui-source">

                    <div stop-propagation>

                        <i ng-click="clickSource(source)"
                            class="source"
                            ng-style="::{'background-image': 'url({{source.icon}})'}"></i>

                        <span class="title" ng-click="clickSource(source)">{{source.title}}</span>

                        <label class="switch elevated" title="Pin to Sidebar" ng-click="checkAnonymousSources()">
                            <input class="preventBlur" type="checkbox" ng-model="source.isShortcut" ng-change="onToggleSource(source)" ng-disabled="user.anonymous && !flags.useAnonymousSources" ${item.isShortcut ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>

                    </div>

                </li>`

                let $scope = $rootScope.$new();
                $scope.source = item;

                itemTemplate = $compile(itemTemplate)($scope);

                return $(itemTemplate)
                    .data("item.autocomplete", item)
                    .appendTo(ul);

            }

            if (item.settings) {
                itemTemplate = `<li class="ui-settings">
                    <div stop-propagation>
                        <a title="Customize search" ng-click="openMenu('searchSettings')">Search settings <i class="icon-cog"></i></a>
                    </div>
                </li>`

                let $scope = $rootScope.$new();

                itemTemplate = $compile(itemTemplate)($scope);

                return $(itemTemplate)
                    .data("item.autocomplete", item)
                    .appendTo(ul);
            }

            return $(itemTemplate)
                .data("item.autocomplete", item)
                .append("<a>" + text + "</a>")
                .appendTo(ul);
        };
    }

    angular.module('search', [])
        .config(config)
        .run(run);

})();
