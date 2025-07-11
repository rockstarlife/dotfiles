(function() {
    
    userService.$inject = ['$q', '$rootScope', '$http', 'trackService', 'storage', 'server', 'promoteLoginDays', 'promoteLoginRegisteredDays', 'promoteLoginDaysMax'];

    function userService($q, $rootScope, $http, trackService, storage, server, promoteLoginDays, promoteLoginRegisteredDays, promoteLoginDaysMax) {
        
        var _isUserLoggedIn = !!storage.getSync('token');
        var _userData;
        var _userPromise;

        // INIT
        initUser();

        $rootScope.$on('http:401', http401);
        $rootScope.$on('userError', userError);

        return {
            fetch: fetch,
            login: login,
            loginEmail: loginEmail,
            verifyEmail: verifyEmail,
            logOut: logOut,
            reLoadUser: initUser,
            setData: setData,
            getData: getData,
            getFavorites: getFavorites,
            getUserBundle: getUserBundle,
            setFavorite: setFavorite,
            rerequest: rerequest,
            checkPromoteLogin: checkPromoteLogin,
            clearFavorites: clearFavorites,
            fetchSocialHandler: fetchSocialHandler,
            fetchNotifications: fetchNotifications,
            markReadNotifications: markReadNotifications,
            markReadAlert: markReadAlert,
            fetchReferrals,
            generateReferralCode,
            deleteItem,
        };

        function initUser() {

            _userPromise = fetchUser();

            _userPromise.then(user => {

                if (user?.refreshToken) {

                    return $http({
                        method: 'POST',
                        url: server() + '/user/refresh-token',
                    })
                    .then(res => {

                        const {status, token} = res.data;

                        if (status === 'success' && token) {
                            console.log('User auth token refreshed');
                            window.localStorage.token = token;
                        }
                        
                    })

                }
            })
        }

        function setData(data, skipCacheFetch) {

            if (!Object.keys(data).length) {
                return Promise.resolve();
            }

            var forceAnonymousUserUpdate = false;

            //Store local user data
            var storageUserKeys = [
                'halfView',
                'theme',
                'topSitesDisabled',
                'selectedBundle',
                'enableShorts',
                'areAdsDisabled',
                'syncSDLinks',
                'showSDLabels',
                'useSpeedDial',
                'enableGoogleApps',
                'useV4',
            ]

            storageUserKeys.forEach((key) => {

                if (data.hasOwnProperty(key)) {

                    var setObj = {};

                    setObj[key] = data[key];
                    storage.set(setObj);

                    forceAnonymousUserUpdate = true;
                }

            })

            return _userPromise
            .then(async (user) => {

                var userId;

                // Overwrite new values on cached object
                _userData = angular.merge(user, data) 

                // Update user in local storage
                localStorage.setItem('user', JSON.stringify(_userData));

                // Enable anonymous users to update shortcuts on [useAnonymousSources] flag
                // If user is not signed in, skip DB update
                if (!forceAnonymousUserUpdate && user.anonymous && !$rootScope.flags?.useAnonymousSources) {
                    return user;
                } 

                // Get anonymous user ID (Required for v3 migration FTX)
                if (user.anonymous) {
                    userId = await trackService.getGuid(storage);
                }

                return $http({
                    method: 'POST',
                    url: server() + '/user/data',
                    data: {
                        userId: userId,
                        data: data
                    },
                })
                .then(function(res) {

                    localStorage.setItem('lastUserUpdate', new Date());

                    if (!skipCacheFetch) {
                        _userPromise = fetchUser();
                    }

                    return res;
                })

            })
        }

        function getData() {
            
            return _userPromise
            .catch(function() {
                _userPromise = fetchUser();
                return _userPromise;
            });
        }

        function getUserBundle() {
            
            return getData()
            .then(async (user) =>  {

                //Load and set bundle name from storage
                if (!user.selectedBundle) {

                    let storageBundle = await storage.get('selectedBundle');

                    if (storageBundle.selectedBundle) {

                        $rootScope.selectBundle(storageBundle.selectedBundle);

                        return storageBundle.selectedBundle;
                    }

                }

                if (user.selectedBundle && typeof user.selectedBundle === 'object') {
                    user.selectedBundle = user.selectedBundle[0];
                }

                return user.selectedBundle || 'design';

            })
        }

        function fetchUser() {

            var getUserId = $q.when({});

            //If user HAVE NEVER signed in get client UUID and try to fetch anonymous user
            if (!_isUserLoggedIn) {
                getUserId = trackService.getGuid(storage)
            }

            //If user is already resolved, return current instance
            if (_userData) {
                return $q.when(_userData);
            }

            return getUserId
            .then(function(UUID) {
                return { userId: UUID };
            })
            .then(function(params) {
                return $http({
                    method: 'GET',
                    url: server() + '/user',
                    params: params
                })
            })
            .then(function(res) {
                
                _userData = res.data;

                //Force event object
                _userData.events = _userData.events || {}

                if (_userData.apiVersion) {
                    storage.set({
                        apiVersion: _userData.apiVersion
                    })
                }

                if (_userData.requestReauthenticate) {
                    logOut();
                    return;
                }

                //Set default sendNewsletter only for initial signup dialog
                _userData.sendNewsletter = true;

                return _userData;
            })
        }

        function fetchReferrals() {
            return $http({
                method: 'GET',
                url: server() + '/user/referrals',
            }).then(res => {
                return res.data;
            })
        }

        function generateReferralCode() {
            return $http({
                method: 'GET',
                url: server() + '/user/referralCode',
            }).then(res => {
                return res.data;
            })
        }

        function fetchNotifications(params) {

            var installDate = Math.max($rootScope.installDate, $rootScope.updateDate);

            params.version = window.muzli.getDetails().version;

            return $http.get(server() + '/notifications', {
                params: params,
            }).then(function (response) {

                var notifications = response.data;
                var user = $rootScope.user;

                //Filter unwanted notifications
                notifications = notifications.filter((notification) => {

                    // Replace UGC CTA, that used to open local dialog
                    if (notification.type === 'ugc') {
                        notification.content = notification.content?.replace('<a href="" ng-click="toggleCreateModal($event)">', `<a href="${window.MUZLI_ME_URL}/upload" target="_blank">`);
                    }

                    //Filter the notifications that was pushed before user installed/updated the extension
                    if (new Date(notification.pushedAt) < installDate) {
                        return false;
                    };

                    //Pass notifications if they don't have specified version
                    if (!notification.versionFrom) {
                        return true;
                    }

                    return true;
                });

                //It there are at least one blocker, asign it instantly to be displayed globally 
                $rootScope.blocker = notifications.find(function(notification) {
                    return notification.type === 'blocker' && !!notification.versionFrom;
                })

                //Get all alerts to be displayed in the ribbon
                var lastAlertDate = new Date(user.events?.lastReadAlert || installDate);

                $rootScope.alerts = notifications.filter(function(notification) {

                    var isUnread = new Date(notification.pushedAt) >= lastAlertDate

                    //If notification is already read, skip alert
                    if (!isUnread) {
                        return false;
                    }

                    return notification.alert;
                })

                //Leave only default notifications
                notifications = notifications.filter(function(notification) {
                    return !notification.alert && notification.type !== 'blocker';
                });
                

                notifications.forEach((notification) => {
                    
                    //Convert notification dates to date format
                    notification.pushedAt = new Date(notification.pushedAt);
                    
                    //Set avatar image as main image if it's UGC notification
                    if (notification.type === 'ugc') {
                        notification.itemImage = notification.avatar;
                        delete notification.avatar;
                    }

                })

                //Count unread notifications
                var lastReadDate = new Date(user.events?.lastReadNotification || installDate);

                user.unreadNotificationCount = notifications.filter(function(notification) {
                    
                    var isUnread = new Date(notification.pushedAt) >= lastReadDate
                    
                    notification.isUnread = isUnread;

                    return isUnread;

                }).length;

                return notifications;

            })
        }

        function markReadNotifications(params) {
            
            return $http.post(server() + '/notifications/mark-read', params)
            .then(function (response) {
                return response.data;
            })
        }

        function markReadAlert(params) {

            return $http.post(server() + '/alerts/mark-read', params)
            .then(function (response) {
                return response.data;
            })
        }

        function fetch() {

            return _userPromise
            .then((user) => {

                // Try to keep same reference below
                // It always return the new object, so once shortcuts or anything is added, it automatically disappears on next call
                if (!user || user.anonymous) {
                    return user;
                }

                user.favoriteCount = user.favoriteCount || 0;

                return user;

            })
            .catch(function(response) {

                //If user fetch fails, resolve user a false, to hide controls
                if (response.status === -1) {
                    return $q.reject(false);
                }

                return $q.reject(response);
            });
        }

        function getFavorites() {

            return $http({
                method: 'GET',
                url: server() + '/user/favorites'
            }).then(function(res) {
                return res.data;
            });
        }

        function setFavorite(item, setFavorite) {

            return _userPromise.then(function(user) {
                

                if (user.anonymous) {

                    $rootScope.$broadcast('userError', 'signed-out');
                    
                    trackService.track({
                        category: 'SignIn',
                        action: 'Favorite Click'
                    });

                    return null;
                }

                if (user.provider && user.provider.toLowerCase() === 'facebook' && !user.email) {
                    rerequest(item.id);
                    return null;
                }

                item.favorite = !item.favorite;

                trackService.track({
                    category: 'Feed',
                    action: setFavorite ? 'Add to favorite' : 'Remove from favorite'
                });

                $("header .favorites").addClass("zboing");
                setTimeout(function() {
                    $("header .favorites").removeClass("zboing");
                }, 1800);

                if (!setFavorite) {
                    return $http({
                        method: 'DELETE',
                        url: server() + '/user/favorites/' + encodeURIComponent(item.id)
                    }).then(function() {
                        return user;
                    });
                } else {
                    return $http({
                        method: 'POST',
                        url: server() + '/user/favorites',
                        data: {
                            id: item.id,
                            link: item.link,
                            vimeo: item.vimeo,
                            youtube: item.youtube,
                            title: item.title,
                            gif: item.gif,
                            image: item.image,
                            source: item.source.name
                        }
                    }).then(function() {
                        return user;
                    });
                }

            }).then(function(user) {

                if (!user) {
                    return;
                }

                if (setFavorite) {
                    $rootScope.user.favoriteCount++;
                } else {
                    $rootScope.user.favoriteCount--;
                }

                if (item.source.name === 'muzli') {
                    $rootScope.$broadcast('muzli:update:favorite', { id: user.id, favorite: setFavorite });
                }
            }).catch(function(err) {
                item.favorite = !item.favorite;

                if (err.status !== 401) {
                    $rootScope.$broadcast('userError', 'general_error');
                }
            });
        }

        function clearFavorites() {
            trackService.track({
                category: 'Feed',
                action: 'Remove all favorites'
            });

            $rootScope.$broadcast('muzli:clear:favorite');

            $http({
                method: 'DELETE',
                url: server() + '/user/favorites'
            });
        }

        function deleteItem(item) {

            trackService.track({
                category: 'Feed',
                action: 'Delete item'
            });

            console.log(item)

            $http({
                method: 'DELETE',
                url: server() + '/community',
                params: {
                    id: item.id,
                },
            });
        }

        function clearUser() {

            _userPromise = $q.reject();
            
            _isUserLoggedIn = false;
            _userData = false;

            localStorage.removeItem('user');
            
            return storage.remove(['token']);
        }

        function login(type, isSocialShare) {

            clearUser(isSocialShare);

            trackService
            .getGuid(storage)
            .then(async (UUID) => {

                let location = server() + '/auth/' + type + '?clientId=' + UUID + '&redirect=' + window.muzli.reloadLocation;

                if ($rootScope.vm.ftx) {
                    location += '&ftx=true&sync=true';
                }

                if (type === 'twitter' && isSocialShare) {
                    location += '&twitter=true';
                }

                if (type === 'google' && isSocialShare) {
                    location += '&twitter=true';
                }

                if (_userData.sendNewsletter && !_userData.hasUserLogin) {
                    location += '&sendNewsletter=true';
                }

                if ($rootScope.vm.returnTo) {
                    location += `&returnTo=${$rootScope.vm.returnTo}`;
                }

                window.location = location;
            });
        }

        function loginEmail(loginModel) {

            return trackService
            .getGuid(storage)
            .then(async (UUID) => {
                
                let data = {
                    clientId: UUID,
                    redirect: window.muzli.reloadLocation,
                    email: loginModel.email,
                    name: loginModel.name,
                    action: loginModel.action,
                }

                if ($rootScope.vm.ftx) {
                    data.ftx = true;
                    data.sync = true;
                }

                if (loginModel.sendNewsletter && !$rootScope.user.hasUserLogin) {
                    data.sendNewsletter = true;
                }

                return $http({
                    method: 'POST',
                    url: server() + '/auth/email',
                    data: data,
                })
                .then((response) => {
                    return response.data;
                })

            });
        }

        function verifyEmail(loginModel) {

            let data = {
                email: loginModel.email,
                numKey: loginModel.verification.join(''),
            }

            return $http({
                method: 'POST',
                url: server() + '/auth/email/verify',
                data: data,
            })
            .then((response) => {
                return response.data;
            })

        }

        function logOut() {

            trackService.track({
                category: 'Settings menu',
                action: 'Logout'
            });

            $http({
                method: 'POST',
                url: server() + '/logout'
            }).then(function() {

                clearUser().then(function() {
                    
                    //clear local storage
                    storage
                    .remove(['social_handler', 'theme', 'halfView', 'syncSDLinks', 'lastSDUpdate', 'speedDialLinks', 'useSpeedDial'])
                    .then(function() {
                        window.location = server() + '/logout' + '?redirect=' + window.muzli.reloadLocation;
                    })

                });

                
            });
        }

        function http401() {
            clearUser();
            $rootScope.$broadcast('userError', '401');
        }

        function rerequest(favorite) {
            storage.remove('user').then(function() {
                window.location = server() + '/auth/facebook/rerequest?extension=' + window.muzli.getRuntime().id + '&favorite=' + (favorite || 'rerequest');
            });
        }

        function userError(event, value) {
            $rootScope.userError = value;
            $rootScope.hideUserError = false;
        }

        function checkPromoteLogin() {

            return storage.get(['last_prompt_login', 'installTime']).then(function(res) {

                var timeStamp = new Date().getTime();
                var installTime = res.installTime;
                var lastOpenTimeStamp = res.last_prompt_login;

                var day = 1000 * 60 * 60 * 24;
                var pastLoginDays = timeStamp > (Number(lastOpenTimeStamp) + day * promoteLoginDays);
                var pastMaxLoginDays = timeStamp > (Number(lastOpenTimeStamp) + day * promoteLoginDays * promoteLoginDaysMax);
                var pastInstallTime = timeStamp > (Number(installTime) + day * promoteLoginRegisteredDays);

                if ((lastOpenTimeStamp && pastLoginDays && !pastMaxLoginDays) || (!lastOpenTimeStamp && installTime && pastInstallTime)) {
                    return timeStamp;
                }

                return $q.reject("Last Login " + lastOpenTimeStamp);

            });
        }

        function fetchSocialHandler() {
            return _userPromise.then(function(user) {
                if (user && user.provider === 'twitter') {
                    return user.socialHandler;
                } else {
                    return $q.reject();
                }
            }).catch(function() {
                return storage.get('social_handler').then(function(res) {
                    return res.social_handler;
                });
            });
        }
    }

    angular.module('user')
        .constant('promoteLoginDays', 7)
        .constant('promoteLoginDaysMax', 4)
        .constant('promoteLoginRegisteredDays', 0.2)
        .factory('userService', userService);

})();
