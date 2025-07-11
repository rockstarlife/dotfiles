angular.module('sources').controller('welcomeController', ['$scope', '$state', 'storage', 'trackService', 'userService', '$rootScope',
    function ($scope, $state, storage, trackService, userService, $rootScope) {

        console.log('Welcome controller init');

        $scope.signInPrompt = 'Sign up'

        var isWindows = navigator.appVersion.indexOf('Win') !== -1;
        var areFacesLifted = false;
        var welcomeContainer = $('body .welcome');

        var face1Element = $('.face-1');
        var face2Element = $('.face-2');
        var face3Element = $('.face-3');

        document.body.classList.add('lock-scroll')

        //Workaround for Windows scroll-snap bug
        if (isWindows) {
            welcomeContainer[0].style['scroll-snap-type'] = 'initial'; 
        }

        //Fetch user to know initial parameters, that can vary by experiment
        userService.fetch().then(user => {

            $scope.user = user;

            storage.set({
                allowAnonymous: user.allowAnonymous,
            })

        })

        function moveFaces(scrollProgress) {

            let sidesVerticalOffset = 140 - scrollProgress * 2; // 2 = 140 - (-60) / 100
            let left = 360 + (240 / 100 * scrollProgress);
            let rotate = 11 + (10 / 100 * scrollProgress);

            face1Element.css({
                top: `calc(50dvh + ${sidesVerticalOffset}px)`,
                left: 'calc(50% - ' + left + 'px)',
                transform: 'rotate(-' + rotate + 'deg)',
            })

            face2Element.css({
                top: 'calc(50dvh + 110px + ' + scrollProgress * 1 + 'vh)',
            })

            face3Element.css({
                top: `calc(50dvh + ${sidesVerticalOffset}px`,
                right: 'calc(50% - ' + left + 'px)',
                transform: 'rotate(' + rotate + 'deg)',
            })

        }

        welcomeContainer.on("wheel scroll", function (event) {
            
            var scrollProgress = (welcomeContainer.scrollTop() / window.innerHeight) * 100;

            if (scrollProgress <= 100) {

                moveFaces(scrollProgress);

                areFacesLifted = true;

            }
        });

        $scope.nextFrame = function(type) {

            trackService.trackPageView('/ftx/v3/welcome/' + type, 'Welcome Step');

            welcomeContainer[0].scrollTo({
              top: welcomeContainer.scrollTop() + window.innerHeight,
              left: 0,
              behavior: 'smooth'
            });

            //Failsave is scroll event didn't fire
            setTimeout(() => {

                if (document.querySelector('.welcome')?.scrollTop >= window.innerHeight && !areFacesLifted) {
                    moveFaces(100);
                }

            }, 3000);
            
        }

        $scope.v3SignIn = async function(signInFunction) {
            storage.set({
                showedBundles: true,
            })
            .then(signInFunction)
        }

        $scope.skipSignIn = async function() {

            trackService.trackPageView('/ftx/v3/welcome/skip', 'Welcome Skip Sign in');

            // If user already clicked that they use Muzli already, skip FTX
            if ($rootScope.vm.skipBundleSelection) {
                $state.go('all');
                return;
            }

            $rootScope.vm.ftxLeft = ['settings', 'scroll', 'shortcuts', 'sidebar'];

            if (!window.isMuzliSafari) {
                
                $rootScope.useSpeedDial = true;

                userService.setData({
                    useSpeedDial: true,
                    topSitesDisabled: true,
                });

                $rootScope.vm.ftxLeft.push('speed-dial');
            } 

            storage.set({
                ftxLeft: $rootScope.vm.ftxLeft,
                showedBundles: true,
            })
            
            if ($rootScope.vm.ftxLeft.indexOf('speed-dial') !== -1) {
                trackService.track({
                    category: 'Speed dial',
                    action: 'FTX show',
                });
            } else {
                $rootScope.vm.showFtx = 'scroll';
            }

            $state.go('all');
        }

        $scope.skipBundleSelection = async function() {

            trackService.trackPageView('/ftx/v3/welcome/already-using', 'Welcome Already Using');

            $rootScope.vm.skipBundleSelection = true;
            $rootScope.vm.ftx = false;
            $rootScope.vm.ftxLeft = [];

            $rootScope.useSpeedDial = false;

            $scope.signInPrompt = 'Sign in'

            welcomeContainer[0].scrollTo({
                top: welcomeContainer[0].scrollHeight,
                left: 0,
                behavior: 'smooth'
            });

            storage.set({
                ftxLeft: [],
                showedBundles: true,
                useSpeedDial: false,
            })
            
        }

        $scope.$on("$destroy", function() {
            welcomeContainer.off("wheel scroll");
            document.body.classList.remove('lock-scroll');
        });

    }
]);
