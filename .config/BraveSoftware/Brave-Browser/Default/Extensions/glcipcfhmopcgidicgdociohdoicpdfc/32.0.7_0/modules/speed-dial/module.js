(function () {

    function isValidURL(str) {

        var regexp = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.?[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=,]*)$/;

        if (regexp.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    //CONFIG
    config.$inject = ['$stateProvider'];

    function config($stateProvider) {

        $stateProvider.state('speed-dial', {
            views: {
                'blocker': {
                    templateUrl: 'modules/speed-dial/speed-dial.html',
                    controller: 'speedDialController',
                }
            }
        });

    }

    //RUN
    run.$inject = ['$rootScope', '$state', '$timeout', 'speedDialService', 'trackService', 'userService', 'storage'];

    function run($rootScope, $state, $timeout, speedDialService, trackService, userService, storage) {

        speedDialService.getCustomLinks().then(links => {
            $rootScope.speedDialLinks = links;
        })

        $rootScope.$watch('speedDialLinks', (speedDialLinks) => {

            if (speedDialLinks?.length > 16) {
                $rootScope.speedDialItemsPerRow = 8;
            } else if (speedDialLinks?.length > 8) {
                $rootScope.speedDialItemsPerRow = Math.ceil(speedDialLinks?.length / 2);
            } else {
                $rootScope.speedDialItemsPerRow = 8;
            }

            if (!$rootScope.$$phase) {
                $rootScope.$digest();
            }
        }, true);

        $rootScope.toggleSpeedDial = (enable, redirectParams = {}, skipReload = false) => {

            var eventAction = enable ? 'Toggle ON' : 'Toggle OFF';

            $('.tooltipsy').remove();

            if (enable) {

                $rootScope.useSpeedDial = true;
                
                userService.setData({
                    useSpeedDial: true,
                    topSitesDisabled: true,
                });

                // For some reason calling toggle function directly does not update settings scope
                // so we have to invoke click manually.
                if ($rootScope.showRecentSites) {
                    document.getElementById('showRecentSites')?.click()
                }

                if (!skipReload) {
                    if (!$rootScope.speedDialLinks.length) {
                        $rootScope.settingsOpen = false;
                        $state.go('speed-dial', {}, {
                            reload: true
                        })
                    } else {
                        $state.go('all', {}, {
                            reload: true
                        })
                    }
                }

            } else {

                $rootScope.useSpeedDial = false;
                userService.setData({
                    useSpeedDial: false,
                    topSitesDisabled: true,
                });

                if (!skipReload) {
                    $state.go('all', redirectParams, {
                        reload: true
                    })
                }
            }

            trackService.track({
                category: 'Speed dial',
                action: eventAction,
            });
        };

        $rootScope.dismissSpeedDialPrompt = () => {

            trackService.track({
                category: 'Speed dial',
                action: 'FTX skip',
            });

            //FTX state bust
            storage.set({
                ftxLeft: $rootScope.vm.ftxLeft.filter(ftx => ftx !== 'speed-dial'),
            })
            
            $rootScope.toggleSpeedDial(false);

            if (!$rootScope.vm?.ftxLeft?.length) {
                return;
            }

            if ($rootScope.user?.anonymous && $rootScope.flags?.useAnonymousSources) {
                $rootScope.showFtx('sidebar');
            } else if ($rootScope.vm?.ftxLeft?.includes('scroll')) {
                $rootScope.showFtx('scroll');
            }

        }

        $rootScope.acceptSpeedDialPrompt = () => {

            trackService.track({
                category: 'Speed dial',
                action: 'FTX use',
            });

            $rootScope.vm.showFtx = 'speed-dial';

            // Turn on sync by default if user is signed in
            if (!$rootScope.user?.anonymous) {
                $rootScope.syncSDLinks = true;
                userService.setData({
                    syncSDLinks: true
                })
            }

            $state.go('speed-dial');
        }

    }

    angular.module('speed-dial', [])
        .config(config)
        .run(run)


    angular.module('speed-dial').controller('speedDialController', ['$scope', '$rootScope', '$state', 'speedDialService', 'trackService', 'userService', 'storage',
        function ($scope, $rootScope, $state, speedDialService, trackService, userService, storage) {

            if ($rootScope.vm.showFtx !== 'speed-dial') {
                $rootScope.vm.showFtx = false;
            } 

            $scope.isLoading = false;
            $scope.newLink = {
                link: ''
            };

            $scope.currentEditLink;

            // Load initial state from general user settings
            $scope.syncSDLinks = $rootScope.syncSDLinks;

            // Watch SD changes on global scope (required, because syncSDLinks can be resolved after the initial load of this module)
            $rootScope.$watch('syncSDLinks', (syncSDLinks) => {
                $scope.syncSDLinks = syncSDLinks;
            }, true);

            $scope.speedDial = {
                showMostVisitedList: false,
                showBookmarksList: false,
                hasPermissions: false,
            }

            $rootScope.speedDialSortableOptions = {
                distance: 5,
                helper: 'clone',
                containment: '.speed-dial ul',
                tolerance: 'pointer',
                handle: '.icon',
                cursor: 'move',
                forceHelperSize: true,
                stop: function (e, obj) {
                    speedDialService.updateStorageLinkOrder($rootScope.speedDialLinks);
                },
            };

            const loadBrowserLinks = async () => {

                await speedDialService.getBookMarks().then(bookmarks => {

                    $scope.bookmarks = bookmarks
                        .filter((bookmark, index) => bookmarks.findIndex(_bookmark => _bookmark.url === bookmark.url) === index) // Remove duplicates
                        .filter(bookmark => bookmark.url?.startsWith('http')) // Eliminate bookmarklets
                        .map(bookmark => {
                            return {
                                ...bookmark,
                                type: 'bookmark',
                                imgUrl: speedDialService.getLocalFaviconUrl(bookmark.url),
                            }
                        });

                    $scope.$digest();
                });

                await speedDialService.getTopSites().then(topSites => {

                    $scope.topSites = topSites.map(topSites => {
                        return {
                            ...topSites,
                            type: 'most-visited',
                            imgUrl: speedDialService.getLocalFaviconUrl(topSites.url),
                        }
                    });

                    $scope.$digest();
                });
            }

            // INIT
            speedDialService.getCustomLinks().then(customLinks => {

                $rootScope.speedDialLinks = customLinks;

                if (customLinks.some(link => link.type === 'most-visited')) {
                    $scope.speedDial.showMostVisitedList = true;
                    $scope.speedDial.hasMostVisitedAdded = true;
                }

                if (customLinks.some(link => link.type === 'bookmark')) {
                    $scope.speedDial.showBookmarksList = true;
                    $scope.speedDial.hasBookmarksAdded = true;
                }

                //FTX state bust
                storage.set({
                    ftxLeft: $rootScope.vm.ftxLeft.filter(ftx => ftx !== 'speed-dial'),
                })

                $scope.$digest();
            })

            trackService.track({
                category: 'Speed dial',
                action: 'Customize open',
            });

            $('.tooltipsy').remove();

            // LOAD BROWSER LINKS
            speedDialService.getPermissions().then(permissions => {

                $scope.speedDial.hasPermissions = permissions;

                if (permissions.topSites || permissions.bookmarks) {
                    loadBrowserLinks();
                }
            })

            //SCOPE methods
            $scope.requestPermissions = (type) => {
                
                trackService.track({
                    category: 'Speed dial',
                    action: 'Customize permissions request ' + type,
                });

                speedDialService.requestPermissions(type).then(granted => {

                    $scope.speedDial.hasPermissions[type] = granted;

                    if (granted) {

                        loadBrowserLinks().then(() => {
                            if (type === 'topSites') {
                                $scope.toggleMostVisited(true);
                            }

                            if (type === 'bookmarks') {
                                $scope.toggleBookmarks(true);
                            }
                        })

                        trackService.track({
                            category: 'Speed dial',
                            action: 'Customize permissions granted',
                        });

                    } else {
                        trackService.track({
                            category: 'Speed dial',
                            action: 'Customize permissions denied',
                        });
                    }
                });
            }

            $scope.toggleMostVisited = (isOn) => {

                if (isOn) {

                    trackService.track({
                        category: 'Speed dial',
                        action: 'Customize most visited ON',
                    });

                    speedDialService
                        .addMultipleLinks($scope.topSites.map(site => ({
                            ...site,
                            title: site.title?.replace(/\s*\(.*?\)\s*/g, ' ')?.trim(),
                            type: 'most-visited',
                        })))
                        .then(customLinks => {
                            $rootScope.speedDialLinks = customLinks;
                            $scope.speedDial.hasMostVisitedAdded = true;
                            $scope.speedDial.showMostVisitedList = true;
                            $rootScope.$digest();
                        });

                } else {

                    trackService.track({
                        category: 'Speed dial',
                        action: 'Customize most visited OFF',
                    });

                    speedDialService
                        .removeMultipleLinks({
                            type: 'most-visited',
                        })
                        .then(customLinks => {
                            $rootScope.speedDialLinks = customLinks;
                            $scope.speedDial.showMostVisitedList = false;
                            $rootScope.$digest();
                        });
                }

            }

            $scope.toggleBookmarks = (isOn) => {

                if (isOn) {

                    trackService.track({
                        category: 'Speed dial',
                        action: 'Customize bookmarks ON',
                    });

                    $scope.speedDial.showBookmarksList = true;
                    $scope.speedDial.hasBookmarksAdded = true;

                    
                    if (!$rootScope.$$phase) {
                        $rootScope.$digest();
                    }

                } else {

                    trackService.track({
                        category: 'Speed dial',
                        action: 'Customize bookmarks OFF',
                    });

                    $scope.speedDial.showBookmarksList = false;
                    
                    if (!$rootScope.$$phase) {
                        $rootScope.$digest();
                    }
                }


            }

            $scope.addCustomLink = (linkUrl, $event) => {

                $event?.preventDefault();
                $event?.stopPropagation();

                if (isValidURL($scope.newLink.link)) {

                    $scope.badUrl = false;

                    speedDialService
                        .addLink({
                            url: $scope.newLink.link,
                            type: 'custom',
                        })
                        .then(customLinks => {
                            $scope.newLink.link = '';
                            $rootScope.speedDialLinks = customLinks;
                            $rootScope.$digest();
                        });

                    trackService.track({
                        category: 'Speed dial',
                        action: 'Customize add link',
                        label: 'custom',
                    });

                } else {
                    $scope.badUrl = true;
                }

            }

            $scope.removeLink = (link) => {

                trackService.track({
                    category: 'Speed dial',
                    action: 'Customize remove link',
                    label: link?.type || 'custom',
                });

                const linkIndex = $rootScope.speedDialLinks.findIndex(_link => {
                    return link.url === _link.url && _link.type === link.type;
                })

                speedDialService
                    .removeLink(linkIndex)
                    .then(customLinks => {
                        $('.tooltipsy').remove();
                        $rootScope.speedDialLinks = customLinks;
                        $rootScope.$digest();
                    });

            }

            $scope.editLink = (link) => {

                trackService.track({
                    category: 'Speed dial',
                    action: 'Customize edit link',
                    label: link?.type || 'custom',
                });

                $scope.currentEditLink = link;

            }

            $scope.saveLink = () => {

                trackService.track({
                    category: 'Speed dial',
                    action: 'Customize save link',
                    label: $scope.currentEditLink?.type || 'custom',
                });

                speedDialService.updateLink($scope.currentEditLink);

                $scope.currentEditLink = null;

            }

            $scope.closeLinkModal = () => {
                $scope.currentEditLink = null;
            }

            $scope.toggleLink = (link, $event) => {

                $event?.preventDefault();
                $event?.stopPropagation();

                const linkIndex = $rootScope.speedDialLinks.findIndex(_link => {
                    return link.url === _link.url && _link.type === link.type;
                })

                if (linkIndex !== -1) {

                    speedDialService
                        .removeLink(linkIndex)
                        .then(customLinks => {
                            $rootScope.speedDialLinks = customLinks;
                            $rootScope.$digest();
                        });

                    trackService.track({
                        category: 'Speed dial',
                        action: 'Customize remove link',
                        label: link.type,
                    });

                } else {

                    speedDialService
                        .addLink({
                            ...link,
                            title: link.title?.replace(/\s*\(.*?\)\s*/g, ' ')?.trim(),
                        })
                        .then(customLinks => {
                            $rootScope.speedDialLinks = customLinks;
                            $rootScope.$digest();
                        });

                    trackService.track({
                        category: 'Speed dial',
                        action: 'Customize add link',
                        label: link.type,
                    });
                }

            }

            $scope.isLinkActive = (link) => {
                return !!$rootScope.speedDialLinks.find(_link => {
                    return link.url === _link.url && _link.type === link.type;
                })
            }

            $scope.saveSpeedDial = () => {

                if (!$rootScope.speedDialLinks.length) {

                    $rootScope.toggleSpeedDial(false);
                    $rootScope.useSpeedDial = false;

                    if (!$rootScope.$$phase) {
                        $rootScope.$digest();
                    }

                    return;
                }

                trackService.track({
                    category: 'Speed dial',
                    action: 'Customize save',
                    value: $rootScope.speedDialLinks.length,
                });

                if ($rootScope.vm.ftxLeft.indexOf('scroll') !== -1) {
                    $rootScope.vm.showFtx = 'scroll';
                }

                $state.go('all');
            }

            $scope.checkAnonymous = () => {

                if ($rootScope.user.anonymous) {

                    $scope.showSignInPrompt = true;

                    $('.speed-dial-page .options .info').addClass('shake');

                    setTimeout(function () {
                        $('.speed-dial-page .options .info').removeClass('shake');
                    }, 750);

                    return;
                }

            }

            $scope.onsyncSDLinksChange = () => {

                userService.setData({
                    syncSDLinks: $scope.syncSDLinks
                }).then(() => {
                    if ($scope.syncSDLinks) {
                        speedDialService.pushSDLinks($rootScope.speedDialLinks);
                    }
                })

            };

            $scope.onShowSDLabelsChange = () => {
                
                $rootScope.showSDLabels = !$rootScope.showSDLabels;

                userService.setData({
                    showSDLabels: $rootScope.showSDLabels,
                })

            };

            $scope.$on("$destroy", function() {
                if ($rootScope.vm?.ftxLeft?.includes('sidebar') 
                    && $rootScope.flags?.useAnonymousSources
                    && $state.current?.name === 'all'
                ) {
                    $rootScope.showFtx('sidebar');
                }
            })

        }]);

    angular.module('speed-dial').directive('sdImageFallback', () => {
        return {
            restrict: 'A',
            link: ($scope, element) => {
                element.bind('error abort', function (e) {
                    $scope.link.iconFallback = 'monogram'
                });
            }
        };
    });

})();
