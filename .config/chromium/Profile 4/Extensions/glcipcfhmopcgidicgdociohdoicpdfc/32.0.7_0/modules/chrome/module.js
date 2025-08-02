(function() {

    run.$inject = ['$q', '$rootScope', '$state', 'trackService', 'userService', 'chrome', 'storage'];

    function run($q, $rootScope, $state, trackService, userService, chromeService, storage) {

        if (chromeService.isExtension) {
            window.chrome?.action?.setBadgeText({"text": ""})
            $rootScope.isExtension = true;
        }

        if (!chromeService.isExtension) {
            $rootScope.hideEnableAuthRecentSitesSetting = true;
        }

        /*=================================================
        =            Chrome Extension features            =
        =================================================*/

        $rootScope.updateExtension = function(event) {

          $rootScope.blocker.loading = true;

          chrome.runtime.onUpdateAvailable.addListener(function(details) {
            window.chrome.storage.local.set({openAfterInit: true}, function() {
              chrome.runtime.reload();
              window.close();
            })
          });

          chrome.runtime.requestUpdateCheck(function(status) {

            console.log('Extension update status:', status);

            if (status === 'throttled') {
              chrome.runtime.reload();
              delete $rootScope.blocker;
            }

            if (status === 'no_update') {
              delete $rootScope.blocker;
            }

          })
        }

        $rootScope.goToChromeApps = function () {
            window.chrome.tabs.getCurrent(function (tab) {
                window.chrome.tabs.update(tab.id, {
                    "url": "chrome://apps/"
                });
            });
        };

        $rootScope.switchToLite = function () {

            trackService.track({
                category: 'Settings menu',
                action: 'Click',
                label: 'Switch to lite version'
            });

            $q.all([userService.setData({
                halfView: true
            }), storage.set({
                lite: true,
                liteOverride: false,
            })])
            .then(function () {
                setTimeout(function () {
                    chrome.tabs.getCurrent(function (tab) {
                        chrome.tabs.update(tab.id, {
                            "url": "chrome-search://local-ntp/local-ntp.html"
                        });
                    });
                }, 500);
            });
        };

        $rootScope.toggleIsLiteVersion = function () {
            
            $rootScope.isMuzliHomepage = !$rootScope.isMuzliHomepage;

            storage.set({
                liteOverride: $rootScope.isMuzliHomepage,
            });
        };

        $rootScope.toggleDisableAds = function () {
            
            $rootScope.areAdsDisabled = !$rootScope.areAdsDisabled;

            userService.setData({
                areAdsDisabled: $rootScope.areAdsDisabled,
            });
        };

        $rootScope.checkDisableAds = function () {

            if ($rootScope.isAdsToggleEnabled) {
                return;
            }
            
            if ($rootScope.user?.anonymous) {
                $state.go('sign-in');
            } else {
                $state.go('all.referral');
            }
            
        };

    }

    var chromeNgModules = []

    if (window.chrome && window.chrome.runtime || localStorage.emulateExtension === 'true') {
        chromeNgModules.push('sites')
    }

    angular.module('chrome', chromeNgModules).run(run);

})();