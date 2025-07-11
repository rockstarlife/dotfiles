describe('The storage service', function () {
  
  var storage, $rootScope, $window, $httpBackend, userService;

  angular.module('user', []);
  angular.module('muzli', ['user']);

  beforeEach(function () {
    module('muzli');
    module(function($provide) {
      $provide.value('R', window.R);
      $provide.value('trackService', {});
      $provide.value('server', '');
    });

  });

  beforeEach(inject(function (_storage_) {
    storage = _storage_;
    localStorage.setItem('token', 'a fake token');
  }));

  beforeEach(inject(function (_$httpBackend_, _storage_, _$rootScope_, _$window_, _userService_) {
    $httpBackend = _$httpBackend_;
    storage = _storage_;
    $window = _$window_;
    $rootScope = _$rootScope_;
    userService = _userService_;
  }));

  describe('The set api', function () {
    var spySet;

    beforeEach(function () {
      spySet = sinon.spy($window.chrome.storage.sync, 'set');
    });

    afterEach(function () {
      window.chrome.storage.sync.set.restore();
    });

    it('should save "last_login"', function () {
      var value = new Date().getTime();
      storage.set({'last_login': value});
      spySet.should.have.been.calledWith({last_login: value});
    });

    it('should set all keys', function () {
      var value = new Date().getTime();
      var setData = {
        'last_login': value,
        "last_prompt_login": value,
        "installTime": value
      };

      storage.set(setData);
      spySet.should.have.been.calledWith(setData);
    });

    it('should save homeSwitched to localstorage and send a request to save', function (cb) {
      $httpBackend.expectGET('/user?userId=%7B%7D').respond();
      $httpBackend.expectPOST('/user?userId=%7B%7D').respond();
      storage.set({ "homeSwitched": true }).then(function(){
        expect($window.localStorage.getItem('homeSwitched')).to.equal('true');

        setTimeout(cb, 100);
      });

      $rootScope.$digest();
    });
  });

  describe('The get api', function () {
    var spyGet;

    beforeEach(function () {
      spyGet = sinon.spy($window.chrome.storage.sync, 'get');
    });

    afterEach(function () {
      $window.chrome.storage.sync.get.restore();
    });

    it('should get "last_login" string value', function (cb) {
      storage.get("last_login").then(function(){
        spyGet.should.have.been.calledWith(["last_login"]);
        cb();
      });

      $rootScope.$digest();
    });

    it('should get "last_login" array value', function (cb) {
      storage.get(["last_login"]).then(function(){
        spyGet.should.have.been.calledWith(["last_login"]);
        cb();
      });

      $rootScope.$digest();
    });

    it('should get all value', function (cb) {
      storage.get(["last_login", "last_prompt_login"]).then(function(){
        spyGet.should.have.been.calledWith(["last_login", "last_prompt_login"]);
        cb();
      });

      $rootScope.$digest();
    });
  });
});