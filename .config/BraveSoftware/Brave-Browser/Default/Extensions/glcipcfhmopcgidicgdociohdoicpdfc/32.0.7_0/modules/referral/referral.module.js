(function() {

    //CONFIG
    config.$inject = ['$stateProvider'];

    function config($stateProvider) {

        $stateProvider.state('all.referral', {
            parent:'all',
            views: {
                'blocker@': {
                    templateUrl: 'modules/referral/referral.modal.html',
                    controller: 'referralController',
                }
            }
        });

        $stateProvider.state('all.referral-reward', {
            parent:'all',
            views: {
                'blocker@': {
                    templateUrl: 'modules/referral/referral-reward.modal.html',
                    controller: 'referralController',
                }
            }
        });

    }

    //RUN
    angular.module('referral', [])
        .config(config)

    angular.module('referral').controller('referralController', ['$scope', '$rootScope', '$state', 'userService', 'trackService', 'fetchService',
        function ($scope, $rootScope, $state, userService, trackService, fetchService) {

            $rootScope.vm.showOverlay = true;

            $scope.targetUserCount = window.MUZLI_MIN_REFERRALS;
            $scope.currentUserCount = 0;
            $scope.referralCode = $rootScope.user?.referralCode;
            $scope.referralUrl = `${window.MUZLI_WEBSITE_URL}/r/${$scope.referralCode}`;
            $scope.referredUsers = new Array($scope.targetUserCount).fill({});

            // Social share function bridge
            $scope.openSharer = fetchService.event.openSharer;
            $scope.sendSlack = fetchService.event.sendSlack;

            $scope.shareOptions = {
                text: "Hey creative people! I invite you to join Muzli design community for free. Just follow this link:",
                link: $scope.referralUrl,
            }

            $scope.$on('$destroy', () => {
                $rootScope.vm.showOverlay = false;
            });

            // INIT
            userService.fetchReferrals().then(referredUsers => {

                referredUsers.forEach(user => {
                    if (!user.photo) {
                        user.monogram = user.displayName?.substr(0, 2)?.toUpperCase() || 'MZ';
                    }
                });

                $scope.currentUserCount = referredUsers.length;
                $scope.referredUsers.splice(0, referredUsers.length, ...referredUsers);
            })
            

            trackService.track({
                category: 'Referral',
                action: 'Referral modal open',
            });

            $('.tooltipsy').remove();

            $scope.generateReferralCode = () => {
                userService.generateReferralCode().then(code => {
                    $scope.referralCode = code;
                    $scope.referralUrl = `${window.MUZLI_WEBSITE_URL}/r/${$scope.referralCode}`;
                })
            }

            $scope.removeAds = () => {
                userService.setData({
                    areAdsDisabled: true,
                })
                .then(() => {
                    $rootScope.areAdsDisabled = true;
                    $state.go('all', {}, { reload: true });
                })
            }
            

    }]);

    angular.module('referral').directive('adFree', ['$rootScope', '$state', 'storage', ($rootScope, $state, storage) => {
        return {
            restrict: 'E',
            templateUrl: 'modules/referral/referral.indicator.html',
            scope: true,
            link: ($scope, element) => {
                $scope.ticks = new Array(window.MUZLI_MIN_REFERRALS).fill({});
                $scope.referredUserCount = $rootScope.user?.referralsActivated || 0;
                
                if ($rootScope.user?.referralsActivated >= window.MUZLI_MIN_REFERRALS) {

                    storage.get(['wasReferralRewardShowed']).then((res) => {
                        if (!res.wasReferralRewardShowed) {

                            storage.set({
                                wasReferralRewardShowed: true,
                            })

                            $state.go('all.referral-reward');
                        }
                    })
                }
            }
        };
    }]);

})();
