angular.module('muzli').controller('headerController', ['$scope', '$state', '$rootScope', '$timeout', 'userService', 'storage', 'trackService',
    function ($scope, $state, $rootScope, $timeout, userService, storage, trackService) {

        $scope.dropdownActive = false;

        //Private functions
        var getFetchParams = function () {
            return {
                offset: $scope.page * $scope.pageSize,
                limit: $scope.pageSize
            };
        };

        $rootScope.markRead = function (notification) {

            let params = {
                id: notification.id,
            }

            if ($rootScope.user.anonymous) {
                params.userId = $rootScope.user.id;
            }

            userService.markReadNotifications(params).then(function(response) {
                notification.isUnread = false;
                $rootScope.user.unreadNotificationCount--;
            });
        };

        $scope.markAllRead = function () {

            let params = {
                markAllRead: true,
            }

            if ($rootScope.user.anonymous) {
                params.userId = $rootScope.user.id;
            }

            userService.markReadNotifications(params).then(function(response) {
                
                $scope.notifications.forEach(function(notification) {
                    notification.isUnread = false;
                });

                $rootScope.user.unreadNotificationCount = 0;
            });

            //Mark all static notifications as read in local storage
            storage.set({
                readStaticNotifications: $scope.notifications.filter(function(notification) {
                    return !!notification.static;
                }).map(function(notification) {
                    return notification.id;
                })
            });
        };

        $scope.toggleGoogleAppsDropdown = function() {
            
            $scope.areGoogleAppsOpen = !$scope.areGoogleAppsOpen;

            if ($scope.areGoogleAppsOpen) {
                trackService.track({
                    category: 'Google apps',
                    action: 'Toggle'
                });
            }
        };

        $scope.toggleNotifications = function() {
            
            $scope.areNotificationsOpen = !$scope.areNotificationsOpen;

            if ($scope.areNotificationsOpen) {
                trackService.track({
                    category: 'Notification center',
                    action: 'Open'
                });
            }

            if (!$scope.areNotificationsOpen) {
                $scope.markAllRead();
            }
        };

        $rootScope.openUploadPage = function(event) {

            event?.stopPropagation();
            event?.preventDefault();

            if (!$rootScope.user || $rootScope.user.anonymous) {

                $rootScope.$broadcast('userError', 'signed-out');

                trackService.track({
                    category: 'UGC',
                    action: 'Sign In',
                });

                return;
            }

            const extensionId = window.location.protocol.startsWith('chrome-extension') ? window.location.host : '';

            trackService.track({
                category: 'UGC',
                action: 'Open UGC Upload'
            });

            const redirectURL = new URL(window.MUZLI_ME_URL + `/upload`);

            if (extensionId) {
                redirectURL.searchParams.set('ref', extensionId);
            }

            if ($rootScope.user?._id) {
                redirectURL.searchParams.set('uid',$rootScope.user._id);
            }

            window.location.href = redirectURL;
            
        }

        $scope.showAllNotifications = function () {

            $scope.notificationDisplayLimit = $scope.notifications.length;
            $scope.$broadcast('initScrollEvents');

            const notificationsContainer = document.querySelector('header .dropdown .messages');

            $('.messages').animate({ scrollTop: notificationsContainer?.scrollHeight ||  170 }, 150, 'swing');
        };

        $scope.logNotificationCta = function(notification, $event) {

            if (!$($event.target).is('a')) {
                return;
            }

            trackService.track({
                category: 'Notification center',
                action: 'CTA click',
                label: $($event.target).text() + ' | ' + notification.content,
            });
        };

        /*==============================================
        =            GET user notifications            =
        ==============================================*/

        $scope.loadNotifications = function (fetchParams) {

            if ($scope.fetchingInProgress) {
                return;
            };

            if ($scope.lastItemLoaded) {
                return;
            }

            $scope.fetchingInProgress = true;

            return userService.fetchNotifications(fetchParams).then(function (notifications) {

                $scope.count = notifications.count;
                $scope.notifications.push.apply($scope.notifications, notifications);

                //Increase list render limit to show all notifications
                if ($scope.page > 1) {
                    $scope.notificationDisplayLimit = $scope.notifications.length;
                }

                //Set empty notifications flag if user doesn't have any notifications yet
                if (!$scope.notifications.length) {
                    $scope.notificationListEmpty = true;
                }

                //Set flag for last item loaded
                if (!notifications || !notifications.length || notifications.length < $scope.pageSize) {

                    let nextDay = new Date($rootScope.installDate);
                    let nextMonth = new Date($rootScope.installDate);

                    nextDay.setDate(nextDay.getDate() + 1);
                    nextMonth.setDate(nextMonth.getDate() + 30);

                    $scope.lastItemLoaded = true;

                    if (new Date() > nextDay) {

                        $scope.notifications.push({
                            id: 'share',
                            static: true,
                            isUnread: false,
                            content: 'If you like what we do, please tell your friends and share the love for Muzli.',
                            cta: '<a href="" ng-click="::shareAfterLogin(\'twitter\')" class="twitter">Twitter</a> <a href="" class="facebook" ng-click="::shareAfterLogin(\'facebook\')">Facebook</a>',
                            sender: 'Muzli Team',
                            pushedAt: nextDay,
                        })

                    }

                    if (new Date() > nextMonth) {

                        storage.get(['readStaticNotifications']).then(response => {
                            
                            let notificationTimestamp = nextMonth;

                            if (!response.readStaticNotifications?.includes('review')) {
                                notificationTimestamp = new Date();
                            }

                            $scope.notifications.push({
                                id: 'review',
                                static: true,
                                isUnread: false,
                                content:`
                                    Are you\'re enjoying the creative inspiration wonders with Muzli? 🎨✨ </br>
                                    Help us grow and inspire even more designers by leaving a review on the Chrome Store ⭐⭐⭐⭐⭐`,
                                cta: '<a href="https://chrome.google.com/webstore/detail/muzli-2-stay-inspired/glcipcfhmopcgidicgdociohdoicpdfc/reviews?utm_source=muzli&utm_medium=extension&utm_campaign=review_notification" class="cta cta-default">Leave a review</a>',
                                sender: 'Muzli Team',
                                pushedAt: notificationTimestamp,
                            })

                        })

                    }

                    $scope.notificationDisplayLimit++;
                }

                //Set flag indicating initial loading is complete
                $scope.loadingComplete = true;
                $scope.page++;

                $timeout(function () {
                    $scope.fetchingInProgress = false;
                    $scope.$broadcast('checkScrollPosition');
                });

                return notifications;

            }).then((notifications) => {

                storage.get(['readStaticNotifications']).then(function (res) {

                    $scope.notifications.forEach(function(notification) {

                        if (notification.static) {
                            if (!res.readStaticNotifications || res.readStaticNotifications.indexOf(notification.id) === -1 ) {
                                $rootScope.user.unreadNotificationCount++;
                                notification.isUnread = true;
                            }
                        }

                    })
                });
  
            });
        };

        $scope.initList = function () {
            $scope.lastItemLoaded = false;
            $scope.notificationListEmpty = false;
            $scope.enableInfiniteScroll = true;
            $scope.notificationDisplayLimit = 4; //Use for prealoading more data than it is rendered
            $scope.page = 0;
            $scope.notifications = [];
        };

        //Prevent search animation jumping on load
        $scope.killSearchAnimation = true;

        $scope.isSearchOpen = false;
        $scope.areNotificationsOpen = false;
        $scope.fetchingInProgress = false;
        $scope.loadingComplete = false;
        $scope.pageSize = 10;

        $scope.$on('scrollAtBottom', function () {
            if ($scope.enableInfiniteScroll) {
                $scope.loadNotifications(getFetchParams());
            }
        });

        $rootScope.resolveUser.promise.then(function(user) {
            
            $scope.initList();

            $timeout(() => {
                $scope.loadNotifications(getFetchParams());
            })
        })

    }]);