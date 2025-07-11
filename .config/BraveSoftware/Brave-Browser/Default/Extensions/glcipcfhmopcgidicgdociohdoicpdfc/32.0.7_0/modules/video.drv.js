/* global YT */
angular.module('feed')
  .directive('muzliVideo', ['$http', '$rootScope', '$timeout', '$state', function ($http, $rootScope, $timeout, $state) {

    return {
      restrict: 'EA',
      templateUrl: 'modules/feed/video.drv.html',
      link: function ($scope, element) {

        $scope.item.playing = false;
                
        $scope.imageClicked = function ($event) {

          $event.preventDefault();
          $event.stopPropagation();
          
          $state.go($state.current.name + '.videos', {
            item: $scope.item,
          })

          //Log video click
          $http.put(window.MUZLI_APP + '/click', {
            id: $scope.item.id,
            link: $scope.item.link,
            source: $scope.item.source.name ? $scope.item.source.name : $scope.item.source,
            referer: 'Extension video'
          })

        };

        if ($scope.item.vimeo && !$scope.item.thumbnail) {

          if (!$scope.item.image) {
            $http.get('https://vimeo.com/api/v2/video/' + $scope.item.videoId + '.json', {
              skipAuth: true
            }).then(function (res) {
              $scope.item.thumbnail = res.data[0].thumbnail_large;
            }).catch(function(){
              element.parents('.postPhoto').addClass('image-error');
            })
          } else {
            $scope.item.thumbnail = $scope.item.image;
          }
        }

        if ($scope.item.htmlVideo) {
          $scope.item.thumbnail = $scope.item.image;
        }

      }
    }
  }]);
