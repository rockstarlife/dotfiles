(function() {

    sites.$inject = ['$q', 'userService', 'storage'];

    function sites($q, userService, storage) {

        return {
            fetchRecent: fetchRecent,
            reqAuthRecent: reqAuthRecent,
            rejectAuthRecent: rejectAuthRecent,
            authRecent: authRecent
        };

        function fetchRecent() {
            return $q(function(resolve, reject) {
                if (!window.chrome || !window.chrome.topSites || !window.chrome.topSites.get) {
                    return reject('not_chrome');
                }
                window.chrome.topSites.get(function(data) {
                    if (!data) {
                        return reject();
                    }
                    resolve(data);
                });
            });
        }

        function reqAuthRecent() {
            return $q(function(resolve, reject) {

                if (window.chrome.permissions) {

                    window.chrome.permissions.request({
                        permissions: ["topSites"]
                    }, function(granted) {

                        // The callback argument will be true if the user granted the permissions.
                        if (granted) {
                            userService.setData({
                                'topSitesDisabled': false
                            });
                            
                            resolve();
                            
                        } else {
                          reject();
                        }

                    });

                } else {
                    reject();
                }
            });
        }

        function rejectAuthRecent() {
            userService.setData({
                'topSitesDisabled': true
            });
        }

        function authRecent() {

            return storage.get('topSitesDisabled').then(function(res) {

                if (!window.chrome || !window.chrome.permissions) {
                    return $q.reject("not_chrome");
                }
                
                if (res.topSitesDisabled) {
                    return $q.reject("disabled");
                }

                return $q(function(resolve, reject) {
                    window.chrome.permissions.contains({ permissions: ['topSites'] }, function(result) {
                        return result ? resolve() : reject();
                    });
                });
            });
        }
    }

    angular.module('sites')
        .factory('sites', sites);

})();