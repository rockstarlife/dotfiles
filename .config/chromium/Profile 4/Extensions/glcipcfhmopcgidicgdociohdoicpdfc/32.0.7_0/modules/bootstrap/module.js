(function () {

  run.$inject = ['$q', 'userService', 'trackService', '$timeout'];
  
  function run($q, userService, trackService, $timeout) {

    if (window.REGISTERED) {
      
      var minTimeout = $timeout(function () {}, 1200);

      $q.all([minTimeout, userService.fetch().then(function (user) {
        trackService.track({
          category: 'SignIn',
          action: 'Success ' + user.provider,
          label: {
            'favorite': 'Favorite',
            'sourceFeedPromo': 'Feed promo funnel',
            'sources': 'Add sources',
            'login': 'Login'
          }[window.REGISTERED] || 'Login',
        });
      })])
      .catch(function () {
      })
      .finally(function () {
        setTimeout(function () {
          $('body').removeClass('app-loading');
        }, 1400);
      });
    }
  }

  angular.module('bootstrap', [])
    .run(run);

})();
