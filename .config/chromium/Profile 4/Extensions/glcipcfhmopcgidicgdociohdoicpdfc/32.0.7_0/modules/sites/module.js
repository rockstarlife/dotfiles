(function() {

    run.$inject = ['$q', '$rootScope', 'sites', 'trackService', 'userService'];

    function run($q, $rootScope, sites, trackService, userService) {

        var defer;
        var eventCategory = 'Settings menu';

        $rootScope.authRecentSitesAction = function(enable, skipReload) {

            var eventLabel = enable ? 'enable' : 'disable';

            $('.tooltipsy').remove();

            if (enable) {

                sites
                    .reqAuthRecent()
                    .then(defer.resolve);

                // For some reason calling toggle function directly does not update settings scope
                // so we have to invoke click manually.
                if ($rootScope.useSpeedDial) {
                    document.getElementById('useSpeedDial')?.click()
                }

            } else {

                sites.rejectAuthRecent();

                $rootScope.showEnableAuthRecentSites = false;
                $rootScope.recentSites = null;
                $rootScope.showRecentSites = false;
                
                setUpDefer();

            }

            trackService.track({
                category: eventCategory,
                action: 'Click',
                label: eventLabel
            });
        };

        function setUpDefer() {

            defer = $q.defer();

            defer.promise.then(sites.fetchRecent)
            .then(function(data) {

                var hasError = false;
                var count = data.length;

                function completeImageLoad() {
                    if (hasError && count === 0) {
                        $rootScope.$digest();
                    }
                }

                $rootScope.recentSites = data.map(function(item) {

                    var cleanUrl = item.url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
                    var imgUrl;

                    var url = item.url;
                    var isLocalHost = cleanUrl.indexOf("localhost") === 0 || cleanUrl.indexOf("127.0.0.1") === 0;
                    var isFile = cleanUrl.indexOf("file:") === 0;

                    if (isLocalHost) {
                        imgUrl = "images/icon_localhost.png";
                    } else if (isFile) {
                        imgUrl = "images/local_icon.png";
                    } else {
                        imgUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(item.url)}&size=128&drop_404_icon=true`
                    }

                    var res = {
                        cleanUrl: cleanUrl,
                        url: url,
                        imgUrl: imgUrl
                    };

                    if (!isLocalHost && !isFile) {
                        var img = new Image();

                        img.src = imgUrl;

                        $(img).on("load", function() {
                            count--;
                            completeImageLoad();
                        });

                        $(img).on("error", function() {
                            count--;
                            hasError = true;
                            var split = cleanUrl.split(':');
                            res.error = true;
                            res.imgUrl = "http://www.google.com/s2/favicons?domain=" + (split.length > 1 ? split.slice(0, split.length - 1).join('') : split[0]);
                            completeImageLoad();
                        });
                    }
                    return res;
                });

                $rootScope.showRecentSites = true;

            }).finally(function() {
                $rootScope.showEnableAuthRecentSites = false;
            });
        }

        function loadSites() {

            setUpDefer();

            sites
                .authRecent()
                .then(defer.resolve)
                .catch(function(error) {

                    var user = $rootScope.user || {};
                    var notChrome = error === 'not_chrome';
                    var isDisabled = error === 'disabled';

                    var topSitesReminderShowed = user && user.events ? user.events.topSitesReminderShowed : false;
                    var topSitesReminderTimeDiff = 0;
                    var topSitesReminderSwowedDaysBefore = 0;

                    var now = new Date();
                    var userRegistered = new Date(user.created);
                    var userCreationTimeDiff = Math.abs(now.getTime() - userRegistered.getTime());
                    var userCreatedDaysBefore = Math.ceil(userCreationTimeDiff / (1000 * 3600 * 24)); 

                    if (topSitesReminderShowed) {
                      topSitesReminderShowed = new Date(topSitesReminderShowed);
                      topSitesReminderTimeDiff = Math.abs(now.getTime() - topSitesReminderShowed.getTime());
                      topSitesReminderSwowedDaysBefore = Math.ceil(topSitesReminderTimeDiff / (1000 * 3600 * 24)); 
                    }

                    if (error && error.status) {
                      $rootScope.hideEnableAuthRecentSitesSetting = true;
                      $rootScope.showEnableAuthRecentSites = false;
                      return;
                    }

                    if (notChrome) {
                      return;
                    }

                    if (!$rootScope.showEnableAuthRecentSites) {
                        $rootScope.recentSites = null;
                        $rootScope.showRecentSites = false;
                    }
                });
        }

        loadSites();

        $rootScope.$on('muzliLoadSites', loadSites);

    }

    angular.module('sites', [])
        .run(run);
})();