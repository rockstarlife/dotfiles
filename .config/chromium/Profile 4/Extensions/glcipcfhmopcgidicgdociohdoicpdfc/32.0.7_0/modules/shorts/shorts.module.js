(function() {



    //CONFIG
    config.$inject = ['$httpProvider', '$stateProvider'];

    function config($httpProvider, $stateProvider) {

        $stateProvider.state('all.shorts', {
            parent:'all',
            params: {
                type: 'shorts',
                item: null,
            },
            views: {
                'blocker@': {
                    templateUrl: 'modules/shorts/shorts.html',
                    controller: 'videoFeedController',
                }
            }
        });

        $stateProvider.state('all.videos', {
            params: {
                type: 'videos',
                item: null,
            },
            views: {
                'blocker@': {
                    templateUrl: 'modules/shorts/shorts.html',
                    controller: 'videoFeedController',
                }
            }
        });

        $stateProvider.state('feed.videos', {
            params: {
                type: 'videos',
                item: null,
            },
            views: {
                'blocker@': {
                    templateUrl: 'modules/shorts/shorts.html',
                    controller: 'videoFeedController',
                }
            }
        });

        $stateProvider.state('search.videos', {
            params: {
                type: 'videos',
                item: null,
            },
            views: {
                'blocker@': {
                    templateUrl: 'modules/shorts/shorts.html',
                    controller: 'videoFeedController',
                }
            }
        });

    }

    function logShortClick(item) {

        if (!item) {
            return;
        }

        fetch(window.MUZLI_APP + '/click', {
            "headers": {
                "content-type": "application/json",
            },
            'method': 'PUT',
            'body': JSON.stringify({
                id: item.id,
                link: encodeURIComponent(item.link),
                source: item.source?.name ? item.source?.name : item.source,
                referer: 'Extension shorts'
            }),
        }).catch(console.log)
    }

    // RUN
    run.$inject = ['$q', '$rootScope', '$state', 'sources', 'trackService', 'userService', '$timeout', 'storage'];

    function run($q, $rootScope, $state, sourceService, trackService, userService, $timeout, storage) {

        //A hacky polyfill to emulate YT embed API signals
        window.callPlayer = (frame_id, func, args) => {

            if (window.jQuery && frame_id instanceof jQuery) frame_id = frame_id.get(0).id;

            var iframe = document.getElementById(frame_id);

            if (iframe && iframe.tagName.toUpperCase() != 'IFRAME') {
                iframe = iframe.getElementsByTagName('iframe')[0];
            }

            // When the player is not ready yet, add the event to a queue
            // Each frame_id is associated with an own queue.
            // Each queue has three possible states:
            //  undefined = uninitialised / array = queue / 0 = ready
            if (!callPlayer.queue) callPlayer.queue = {};
            var queue = callPlayer.queue[frame_id],
                domReady = document.readyState == 'complete';

            if (domReady && !iframe) {
                // DOM is ready and iframe does not exist. Log a message
                window.console && console.log('callPlayer: Frame not found; id=' + frame_id);
                if (queue) clearInterval(queue.poller);
            } else if (func === 'listening') {
                // Sending the "listener" message to the frame, to request status updates
                if (iframe && iframe.contentWindow) {
                    func = '{"event":"listening","id":' + JSON.stringify('' + frame_id) + '}';
                    iframe.contentWindow.postMessage(func, '*');
                }
            } else if ((!queue || !queue.ready) && (
                !domReady ||
                iframe && !iframe.contentWindow ||
                typeof func === 'function')) {

                if (!queue) queue = callPlayer.queue[frame_id] = [];
                queue.push([func, args]);

                if (!('poller' in queue)) {
                    // keep polling until the document and frame is ready
                    queue.poller = setInterval(function () {
                        callPlayer(frame_id, 'listening');
                    }, 250);
                    
                    // Add a global "message" event listener, to catch status updates:
                    messageEvent(1, function runOnceReady(e) {
                        if (!iframe) {
                            iframe = document.getElementById(frame_id);
                            if (!iframe) return;
                            if (iframe.tagName.toUpperCase() != 'IFRAME') {
                                iframe = iframe.getElementsByTagName('iframe')[0];
                                if (!iframe) return;
                            }
                        }
                        if (e.source === iframe.contentWindow) {
                            // Assume that the player is ready if we receive a
                            // message from the iframe
                            clearInterval(queue.poller);
                            queue.ready = true;
                            messageEvent(0, runOnceReady);
                            // .. and release the queue:
                            while (tmp = queue.shift()) {
                                callPlayer(frame_id, tmp[0], tmp[1]);
                            }
                        }
                    }, false);
                }

            } else if (iframe && iframe.contentWindow) {

                // When a function is supplied, just call it (like "onYouTubePlayerReady")
                if (func.call) return func();

                // Frame exists, send message
                iframe.contentWindow.postMessage(JSON.stringify({
                    "event": "command",
                    "func": func,
                    "args": args || [],
                    "id": frame_id
                }), "*");
            }

            /* IE8 does not support addEventListener... */
            function messageEvent(add, listener) {
                var w3 = add ? window.addEventListener : window.removeEventListener;
                w3 ?
                    w3('message', listener, !1)
                    :
                    (add ? window.attachEvent : window.detachEvent)('onmessage', listener);
            }
        }
    }

    angular.module('videos', [])
        .config(config)
        .run(run);


    //CONTROLLERS
    angular.module('videos').controller('videoFeedController', ['$scope', '$state', '$timeout', 'trackService', 'fetchService', '$stateParams',
        function ($scope, $state, $timeout, trackService, fetchService, $stateParams) {

            $scope.currentPlayingId;
            $scope.currentPlayerState;
            $scope.skip = 0;
            $scope.limit = 0;
            $scope.videoType = $stateParams.type;
            $scope.isLoading = true;

            // Actively prevent body scroll
            document.body.style.overflowY = 'hidden';

            $scope.$on('$destroy', function() {
                document.body.style.overflowY = '';
            });

            // Bind Exit on escape
            window.muzli.closeOnEsc.push(() => {
                $scope.closeVideoPreview();
            });

            $scope.registerLoad = (index, item) => {

                window.callPlayer(item.youtube, 'listening');
                
                //Autoplay #1 video
                if (index === 0) {
                    window.callPlayer(item.youtube, 'playVideo');

                    $scope.currentPlayingId = item.youtube;
                    $scope.isLoading = false;

                    $scope.$digest();

                    $timeout(() => {
                        //Render next 2 items
                        $scope.shorts.slice(1, 3).forEach(item => {
                            item.renderIframe = true;
                        })
                    })

                    $scope.$digest();
                }

            }

            $scope.closeVideoPreview = ($event) => {

                if ($scope.videoType === 'shorts') {
                    trackService.track({
                        category: 'Shorts',
                        action: 'Closed',
                    });
                }

                $event?.preventDefault();
                $state.go($state.current.name.split('.').at(0));
            }

            const observerOptions = {
                rootMargin: '0px',
                threshold: 1,
            }

            const observer = new IntersectionObserver(observerCallback, observerOptions);

            //Listen for player events
            window.addEventListener('message', function (event) {

                if (event.origin !== 'https://www.youtube.com') {
                    return;
                }

                let eventData;

                try {
                    eventData = JSON.parse(event.data)
                } catch (error) {
                    console.error('Failed to parse YT message JSON')
                    console.log(event.data)
                }

                if (eventData.event === 'onError') {

                    $scope.shorts.splice($scope.shorts.findIndex((item) => {
                        return item.youtube === eventData.id;
                    }), 1);

                    $scope.$digest();

                    console.log('VIDEO NOT PLAYABLE', eventData.id);
                    
                    trackService.track({
                        category: 'Shorts',
                        action: 'Broken Video',
                        label: eventData.id,
                    });
                }

            }, false);

            //INIT
            if ($stateParams.type === 'videos') {

                const item = $stateParams.item;

                item.embedUrl = item.video;
                item.renderIframe = true;

                $scope.shorts = [item];

            } else {
                
                fetchService.fetch('shorts', 'created', $scope.limit).then(res => {
    
                    let { data: items } = res;
                    const firstItemIndex = items.findIndex(item => item.id === $stateParams.item?.id) || 0;
                    
                    if (firstItemIndex !== -1) {
                        items = items.slice(firstItemIndex, items.length);
                    } else {
                        items.unshift($stateParams.item);
                    }
    
                    items.forEach(item => {
                        item.youtube = item.youtube || item.videoId;
                        item.embedUrl = `https://www.youtube.com/embed/${item.youtube}?rel=0&showinfo=0&enablejsapi=1`
                    })
    
                    items[0].renderIframe = true;
    
                    $scope.shorts = items;
    
                    $timeout(() => {
                        document.querySelectorAll('.shorts .frame').forEach((i) => {
                            if (i) {
                                observer.observe(i);
                            }
                        });
                    })
                })
            }


            function observerCallback(entries, observer) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {

                        const visibleIframe = entry.target.querySelector('iframe');

                        //Pause currently playing video or stop if no playing video is present
                        $scope.shorts
                        .filter(short => short.renderIframe)
                        .forEach((item) => {{
                            window.callPlayer(item.youtube, 'pauseVideo');
                        }})

                        if (visibleIframe && !$scope.isLoading) {
                            
                            window.callPlayer(visibleIframe.id, 'listening');
                            window.callPlayer(visibleIframe.id, 'playVideo');

                            $scope.currentPlayingId = visibleIframe.id;

                            trackService.track({
                                category: 'Shorts',
                                action: 'Next Played',
                            });
    
                            //Render next/prev 2 adjacent items 
                            const currentItemIndex = $scope.shorts.findIndex(item => item.youtube === visibleIframe.id);
                            const currentItem = $scope.shorts[currentItemIndex]

                            logShortClick(currentItem);

                            if (currentItemIndex > 0) {
    
                                $scope.shorts.forEach((item, index) => {
                                    if (index >= currentItemIndex - 3 && index <= currentItemIndex + 3) {
                                        item.renderIframe = true;
                                    } else {
                                        item.renderIframe = false;
                                    }
                                })
    
                                $scope.$digest();
                            }

                        }
                        
                    }
                });
            };

        }
    ]
    );

    //DIRECTIVES
    angular.module('videos').directive('shortsFeed', ['$rootScope', '$timeout', 'fetchService', '$state', 'trackService',
        function ($rootScope, $timeout, fetchService, $state, trackService) {
            return {
                restrict: 'A',
                templateUrl: 'modules/feed/feed.shorts.html',
                scope: true,
                link: function ($scope, element) {

                    const observerOptions = {
                        rootMargin: '0px',
                        threshold: 0.5,
                    }
        
                    const observer = new IntersectionObserver(observerCallback, observerOptions);
                    observer.observe(element.get(0));

                    function observerCallback(entries, observer) {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {

                                trackService.track({
                                    category: 'Shorts',
                                    action: 'Rendered',
                                });

                                observer.unobserve(element.get(0));
                            }
                        });
                    };

                    $scope.removeShorts = () => {

                        $rootScope.toggleShorts(false);

                        trackService.track({
                            category: 'Shorts',
                            action: 'Removed',
                        });

                        element.remove();
                        $('.tooltipsy').remove();
                    }                    

                    $scope.shortsClick = (item, event) => {
                        
                        if (!event.metaKey && !event.ctrlKey) {
                            
                            event.preventDefault();
                            event.stopPropagation();

                            $state.go('all.shorts', {
                                item: item
                            })

                            logShortClick(item);
                        }

                        trackService.track({
                            category: 'Shorts',
                            action: 'Clicked',
                            label: item?.sub_source?.name,
                        });
                
                        fetchService.event.postClick(item, event, "shorts");
                        
                        return;

                    };

                    fetchService.fetch('shorts', 'created', 10).then(res => {

                        const { data: items } = res;

                        items.forEach(item => {
                            item.isShort = true;
                        })

                        $scope.shorts = items;

                    })

                }
            };
    }]);

})();