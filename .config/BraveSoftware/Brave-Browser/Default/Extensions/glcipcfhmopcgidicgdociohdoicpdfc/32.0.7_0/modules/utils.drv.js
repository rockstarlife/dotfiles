(function () {

    function muzliTooltip($timeout) {

        function hideToolTip(jEl) {
            var tooltip = jEl.data('tooltipsy');

            if (jEl.not(':visible')) {
                jEl.pauseTooltip = true;

                if (tooltip) {
                    tooltip.hide();
                }
            }

            $timeout(function () {
                jEl.pauseTooltip = false;
                if (tooltip) {
                    tooltip.hide();
                }
            }, 400);
        }

        return {
            restrict: 'A',
            link: function (scope, el, attributes) {

                var offset = [0, 10];

                if (attributes.titleTop) {
                    offset = [0, -10];
                }

                if (attributes.titleRight) {
                    offset = [10, 0];
                }

                setTimeout(function () {

                    var jEl = $(el);

                    if (jEl.length) {

                        var tClass = "tooltipsy";

                        if (attributes.titleTop) {
                            tClass += ' top';
                        }

                        if (attributes.titleRight) {
                            tClass += ' right';
                        }

                        if (attributes.titleDark) {
                            tClass += ' dark';
                        }

                        jEl.tooltipsy({
                            offset: offset,
                            className: tClass,
                            show: function (e, $el) {
                                if (!jEl.pauseTooltip) {
                                    $el.show();
                                }
                            }
                        })
                            .on('click', hideToolTip.bind(this, jEl));

                    }

                }, 0);
            }
        };
    }

    angular.module('muzli').directive('title', ['$timeout', muzliTooltip]);

    angular.module('muzli').directive('autofocus', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attributes) {
                if ($attributes.autofocus) {
                    $timeout(function () {
                        $element[0].focus();
                    }, $attributes.autofocus);
                }
            }
        }
    }]);

    angular.module('muzli').directive('clickCopy', [function () {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attributes) {

                $element.click(function () {

                    document.oncopy = function (event) {
                        event.clipboardData.setData('text/plain', $attributes.clickCopy);
                        event.preventDefault();

                        $scope.copySuccess = true;

                        setTimeout(function () {
                            $scope.copySuccess = false;
                        }, 1000);
                    };

                    document.execCommand("Copy", false, null);
                })
            }
        }
    }]);

    angular.module('muzli').directive('clickCopyColor', [function () {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attributes) {

                $element.click(function () {

                    document.oncopy = function (event) {

                        event.clipboardData.setData('text/plain', $attributes.clickCopyColor);
                        event.preventDefault();

                        setTimeout(function () {

                            var jEl = $($element);

                            if (jEl.length) {

                                var copySuccessTooltip = jEl.tooltipsy({
                                    content: 'Copied',
                                    offset: [0, -10],
                                    className: 'tooltipsy top',
                                    show: function (e, $el) {
                                        $el.show();
                                    }
                                })
                                    .trigger('mouseenter')

                                setTimeout(function () {

                                    jEl.tooltipsy({
                                        content: $attributes.clickCopyColor,
                                        offset: [0, -10],
                                        className: 'tooltipsy top',
                                        show: function (e, $el) {
                                            $el.show();
                                        }
                                    })

                                }, 1000);
                            }

                        }, 0);
                    };

                    document.execCommand("Copy", false, null);
                })
            }
        }
    }]);

    angular.module('muzli').directive('scrollEvents', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attributes) {

                var preloadOffsetRatio = 2;
                var customScrollbar = false;
                var scrollTimeout;
                var wheelTimeout;
                var wrapper;
                var container;
                var customScrollbarContainer;

                var _initScrollEvents = function () {

                    $(wrapper).scroll(function (event) {

                        if (!!scrollTimeout) {
                            clearTimeout(scrollTimeout);
                        }

                        scrollTimeout = setTimeout(function () {
                            $scope.checkScrollPosition();
                        }, 200);
                    });

                    $(wrapper).bind('mousewheel', function (event) {

                        if (!!scrollTimeout) {
                            clearTimeout(scrollTimeout);
                        }

                        if (event.originalEvent.wheelDelta / 120 < 0) {

                            if (!wheelTimeout) {

                                $scope.checkScrollPosition();

                                wheelTimeout = setTimeout(function () {
                                    clearTimeout(wheelTimeout);
                                    wheelTimeout = false;
                                }, 500);
                            }
                        }
                    });
                };

                $scope.checkScrollPosition = function () {

                    var scrolledOffset = (wrapper === window) ? window.scrollY : container.scrollTop
                    var offsetBottom = container.scrollHeight - container.clientHeight;

                    //Compensate for scrolled distance
                    offsetBottom -= scrolledOffset;

                    //Compensate for custom scrollbar working with absolute positioning
                    offsetBottom += customScrollbarContainer ? customScrollbarContainer.position().top : 0;

                    if (offsetBottom < preloadOffsetRatio * container.clientHeight) {
                        $scope.$emit('scrollAtBottom');
                    }
                };

                $scope.initScrollEvents = function () {
                    _initScrollEvents();
                };


                /*============================
                =            Init            =
                ============================*/

                //Manual init
                if ($attributes.scrollEventsInit === 'manual') {

                    $scope.$on('initScrollEvents', function () {

                        container = $element.parent().get(0);
                        wrapper = container;

                        _initScrollEvents();
                    });

                    $scope.$on('checkScrollPosition', function () {

                        if (!container) {
                            return;
                        }

                        $scope.checkScrollPosition();
                    });

                    return;
                };

                //Window level scroll
                if ($attributes.scrollEventsInit === 'window') {

                    wrapper = window;
                    container = $('body').get(0);

                    _initScrollEvents();

                    return;
                };

                //Auto init
                container = $element.parent().get(0);

                if ($(container).is('body')) {
                    wrapper = window;
                } else {
                    wrapper = container;
                }

                _initScrollEvents();

            }
        }
    }]);

    angular.module('muzli').directive('bindHtmlCompile', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(function () {
                    return scope.$eval(attrs.bindHtmlCompile);
                }, function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                });
            }
        };
    }]);

    angular.module('muzli').filter('thousandSuffix', [function () {
        return function (input, decimals) {

            var suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];
            var rounded;
            var exp;

            if (window.isNaN(input)) {
                return null;
            }

            if (input < 1000) {
                return input;
            }

            exp = Math.floor(Math.log(input) / Math.log(1000));

            return (input / Math.pow(1000, exp)).toFixed(decimals) + suffixes[exp - 1];
        };
    }]);

    angular.module('muzli').filter('price', [function () {
        return function (input) {

            if (!input) {
                return 'free';
            }

            return '$' + input / 100;
        };
    }]);

    angular.module('muzli').directive('selectOnClick', [function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function () {
                    this.select();
                });
            }
        };
    }]);

    angular.module('muzli').directive('preventClick', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function (e) {
                    e.preventDefault();
                });
            }
        };
    });

    angular.module('muzli').directive('stopPropagation', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function (e) {
                    e.stopPropagation();
                });
            }
        };
    });

    angular.module('muzli').filter('timeAgo', [function () {

        return function (date) {

            if (!date) {
                return 'No date specified';
            };

            var templates = {
                prefix: "",
                suffix: " ago",
                seconds: "less than a minute",
                minute: "a minute",
                minutes: "%d minutes",
                hour: "an hour",
                hours: "%d hours",
                day: "a day",
                days: "%d days",
                month: "about a month",
                months: "%d months",
                year: "about a year",
                years: "%d years"
            };

            var template = function (t, n) {
                return templates[t] && templates[t].replace(/%d/i, Math.abs(Math.round(n)));
            };

            var timer = function (time) {

                var now = new Date();
                var seconds = ((now.getTime() - time) * .001) >> 0;
                var minutes = seconds / 60;
                var hours = minutes / 60;
                var days = hours / 24;
                var years = days / 365;

                if (time > now) {
                    return "Live at " + time.toLocaleString('lt');
                }

                return templates.prefix + (
                    seconds < 45 && template('seconds', seconds) ||
                    seconds < 90 && template('minute', 1) ||
                    minutes < 45 && template('minutes', minutes) ||
                    minutes < 90 && template('hour', 1) ||
                    hours < 24 && template('hours', hours) ||
                    hours < 42 && template('day', 1) ||
                    days < 30 && template('days', days) ||
                    days < 45 && template('month', 1) ||
                    days < 365 && template('months', days / 30) ||
                    years < 1.5 && template('year', 1) ||
                    template('years', years)
                ) + templates.suffix;
            };

            return timer(new Date(date))

        };
    }]);

    angular.module('muzli').directive('brightness', ['server', function (server) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attributes) {

                function brightnessByColor(color) {

                    var m = color.substr(1).match(color.length == 7 ? /(\S{2})/g : /(\S{1})/g);
                    if (m) var r = parseInt(m[0], 16), g = parseInt(m[1], 16), b = parseInt(m[2], 16);

                    if (typeof r != "undefined") return ((r * 299) + (g * 587) + (b * 114)) / 1000;
                }

                if (brightnessByColor($attributes.brightness) < 60) {
                    $element.addClass('dark')
                }
            }
        };
    }]);

    angular.module('muzli').directive('videoLoader', [function () {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attributes) {

                var parent = $element.parents('li');

                if (!$scope.item?.image) {
                    $element.removeAttr('autoplay');
                    $element.show();
                }

                parent.addClass('loading-video')

                $element.one('canplay', function (event) {
                    parent.removeClass('loading-video')
                })

            }
        };
    }]);

    angular.module('muzli').directive('verifyInput', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attributes) {

                let inputs = $element.find('input');

                inputs.on('keypress', function (event) {

                    if (event.target.value.length > 0) {
                        event.preventDefault();
                        return;
                    }

                    $(event.target).next().focus();

                })

                inputs.on('keydown', function (event) {

                    if (event.keyCode === 8) {

                        event.target.value = '';

                        $(event.target).prev().focus();

                    }
                })

                inputs.on('paste', function (event) {

                    setTimeout(() => {

                        let pasteValue = event.target.value;
                        let currentInput = $(event.target);

                        for (var i = 0; i < Math.min(pasteValue.length, 6); i++) {

                            currentInput.val(pasteValue.charAt(i));
                            currentInput.change();

                            if (i !== 5) {
                                currentInput = currentInput.next();
                            }


                        }

                        currentInput.focus();

                        console.log($scope);

                    })

                })

            }
        };
    }]);

    angular.module('muzli').directive('avatarError', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                $element.on('error', function (event) {
                    delete $rootScope.user.photo;
                    $rootScope.$apply();
                })
            }
        };
    }]);

    angular.module('muzli').directive('carbonAd', ['$rootScope', '$timeout', 'fetchService',
        function ($rootScope, $timeout, fetchService) {
            return {
                restrict: 'A',
                templateUrl: 'modules/feed/feed.drv.carbon.html',
                scope: false,
                link: function ($scope, element) {
                    
                    $scope.vm = $rootScope.vm;
                    
                    let fetchCarbonAd =  $rootScope.user && $rootScope.user.showCarbon;

                    function loadBackfill() {
                        
                        fetchService
                            .fetchSponsoredPost()
                            .then((backfill) => {

                                if (backfill) {
                                    let sourceParamIndex = backfill.beacon.lastIndexOf('&source=');
                                    backfill.beacon = backfill.beacon.slice(0, sourceParamIndex);

                                    $scope.showBackfill = true;
                                    $scope.carbonAd = backfill
                                }
                            });

                    }

                    // Hide element if user does not see ads
                    if (!fetchCarbonAd) {
                        element.remove();
                        return;
                    }

                    let checkScrollPosition = () => {

                        const distanceUntillVisible = element.get(0).getBoundingClientRect().top - window.innerHeight;
                        const renderTreshhold = Math.min(window.innerHeight, 800);

                        if (distanceUntillVisible < renderTreshhold) {

                            // Unregister scroll listener
                            if (scrollListener) {
                                scrollListener();
                            }

                            fetchService
                                .fetchCarbonAd('feed')
                                .then(sponsored => {

                                    if (!sponsored) {
                                        loadBackfill();
                                    }

                                    $scope.carbonAd = sponsored;
                                })
                                .catch(() => {
                                    loadBackfill();
                                })  
                        }
                    }

                    const scrollListener = $rootScope.$on('user-scrolled', debounce(checkScrollPosition), 300);

                    $timeout(() => {
                        checkScrollPosition();
                    })

                    $scope.$on("$destroy", function () {
                        // Unregister scroll listener
                        if (scrollListener) {
                            scrollListener();
                        }
                    })

                }
            };
    }]);

    angular.module('muzli').directive('jobsObserver', ['trackService', function (trackService) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attributes) {

                const element = $element.get(0);

                if (element) {
                    const observer = new IntersectionObserver(entries => {
                        if (entries?.at(0)?.isIntersecting) {

                            observer.unobserve(element);

                            trackService.track({
                                category: 'Jobs',
                                action: 'Jobs loaded',
                            });
                        }
                    }, {
                        threshold: 0.5,
                    });
                    
                    observer.observe(element);
                }

            }
        };
    }]);

    angular.module('muzli').directive('iframeOnload', [function () {
        return {
            scope: {
                callBack: '&iframeOnload'
            },
            link: function (scope, element, attrs) {
                element.on('load', function () {
                    return scope.callBack();
                })
            }
        }
    }])

    angular.module('muzli').directive('hideOnError', [function () {
        return {
            link: function (scope, element, attrs) {
                element.on('error', function () {
                    element.hide();
                })
            }
        }
    }])

    angular.module('muzli').directive('useMonogram', ['$timeout', function ($timeout) {
        return {
            scope: {
                'useMonogram': '=',
            },
            link: function ($scope, element, attrs) {

                const scopeObject = $scope.useMonogram;
                
                function toggleMonogram() {
                    scopeObject.monogram = (scopeObject?.displayName)
                        ?.split(' ')
                        .map(word => word.charAt(0))
                        .slice(0, 2)
                        .join('');

                    $timeout(() => {
                        $scope.$digest();
                    })    
                } 

                if (!scopeObject?.photo) {
                    toggleMonogram();
                    return;
                }

                element.on('error', function () {
                    toggleMonogram();
                })
            }
        }
    }])

    angular.module('muzli').directive('triggerSearch', ['$rootScope', function ($rootScope) {
        return {
            link: function ($scope, element, attrs) {

                const activeSearch = attrs.triggerSearch || 'muzli';
                
                element.on('keypress', function (event) {
                    
                    event?.preventDefault();
                    
                    // Since we are using this directive only in v4, take the first pupulated search feild value
                    const searchText = $rootScope.searchModel?.muzli || $rootScope.searchModel?.google;
                    const keyCode = event.which || event.keyCode || event.charCode;

                    if (keyCode === 13) {
                        $rootScope.search(searchText, event, activeSearch);
                    }

                })

            }
        }
    }])

    angular.module('muzli').directive('didnaIframe', ['$rootScope', '$timeout', 'trackService', 'fetchService',
        function ($rootScope, $timeout, trackService, fetchService) {
            return {
                link: function ($scope, element, attrs) {

                    let options = {
                        root: null,
                        rootMargin: '0px',
                        threshold: 0.5,
                    }

                    let checkScrollPosition = () => {


                        const distanceUntillVisible = element.get(0).getBoundingClientRect().top - window.innerHeight;
                        const renderTreshhold = Math.min(window.innerHeight, 800);
                        const zoneId = `rectangle_${$scope.row}`;

                        if (distanceUntillVisible < renderTreshhold && !$scope.didnaUrl) {

                            // Prevent #first feed item to render if it's not visible
                            if (zoneId === 'rectangle_1' && !$rootScope.feedVisibleClass) {
                                return;
                            }

                            $scope.didnaUrl = `${window.MUZLI_WEBSITE_URL}/didna/portal_wrapper/${zoneId}?id=${$scope.row}`;

                            // Unregister scroll listener
                            if (scrollListener) {
                                scrollListener();
                            }
                        }
                    }

                    let intersectionCallback = function (entries, observer) {
                        entries.forEach(entry => {
                            if (entry.intersectionRatio > 0 && $rootScope.feedVisibleClass) {
                                observer.unobserve(entry.target);
                                $scope.showPixel = true;
                                $scope.$digest();
                            }
                        })
                    }

                    let intersectionObserver = new IntersectionObserver(intersectionCallback, options);

                    $scope.showBackfill = false;
                    $scope.showPixel = false;
                    $scope.vm = $rootScope.vm;
                    $scope.beacon = window.MUZLI_AD_SERVER + `/tick/pixel.gif?campaignId=didna:${$scope.row}`;
                    $scope.didnaUrl = '';

                    const debounceInterval = $scope.row === '1' ? 0 : 100;
                    const scrollListener = $rootScope.$on('user-scrolled', debounce(checkScrollPosition, debounceInterval));

                    $timeout(() => {
                        checkScrollPosition();
                    })

                    const iframe = element.get(0).querySelector('iframe');
                    const linkElement = element.get(0).querySelector('.feedLink');

                    intersectionObserver.observe(iframe);

                    function loadBackfill() {

                        if (iframe) {
                            intersectionObserver.unobserve(iframe);
                            iframe.remove();
                        }

                        fetchService
                            .fetchSponsoredPost()
                            .then((backfill) => {
                                if (backfill) {

                                    let sourceParamIndex = backfill.beacon.lastIndexOf('&source=');
                                    backfill.beacon = backfill.beacon.slice(0, sourceParamIndex);

                                    linkElement.setAttribute('href', backfill.link);

                                    $scope.backfill = backfill;
                                    $scope.showBackfill = true;
                                }
                            });

                    }

                    function resizeIframe() {

                        let iframeScale = (linkElement.offsetWidth / 300).toFixed(4);

                        if (iframe && iframeScale > 0) {
                            iframe.style.scale = iframeScale;
                        }
                    }

                    function listenIframeMessage(e) {

                        // Keep only messages that came from the current iframe
                        if (e.data.id !== iframe.id) {
                            return;
                        }

                        if (e.data?.message === 'bUnfill') {
                            loadBackfill();
                        }

                        if (e.data?.message === 'bDetected') {
                            loadBackfill();
                            trackService.setDimension('blocker_enabled', 'true');
                        }

                    }

                    // Listen to message from child window
                    window.addEventListener('message', listenIframeMessage, false);

                    resizeIframe();

                    $(window).on('resize', resizeIframe);

                    $scope.$on("$destroy", function () {
                        $(window).off('resize', resizeIframe);
                        window.removeEventListener('message', listenIframeMessage);

                        // Unregister scroll listener
                        if (scrollListener) {
                            scrollListener();
                        }
                    })

                }
            }
        }])


})();
