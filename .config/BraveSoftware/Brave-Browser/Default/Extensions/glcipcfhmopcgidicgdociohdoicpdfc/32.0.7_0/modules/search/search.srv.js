(function () {

  searchService.$inject = ['server', '$http', 'fetchService'];

  function searchService(server, $http, fetchService) {

    return {
      fetch: fetch,
    };

    function fetch(q, skip = 0, limit = 30, filter = 'all') {

      var url = server() + `/search?skip=${skip}&limit=${limit}&filter=${filter}&q=${encodeURIComponent(q)}`;

      return $http({
        method: 'GET',
        url: url 
      }).then(function (res) {
        return {
          data: fetchService.transformFetch(res.data.feed, [], res.data.proxy_server),
          total: res.data.total
        }
      });
    }
  }

  angular.module('user')
    .factory('searchService', searchService);
})();


