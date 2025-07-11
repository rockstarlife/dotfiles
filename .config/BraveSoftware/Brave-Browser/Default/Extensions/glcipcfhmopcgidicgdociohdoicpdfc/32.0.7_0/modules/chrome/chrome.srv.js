(function() {

    service.$inject = ['$q', 'userService', 'storage'];

    const browsers = [
        { name: 'samsung', test: /SamsungBrowser/i },
        { name: 'edge', test: /edg([ea]|ios|)\//i },
        { name: 'firefox', test: /firefox|iceweasel|fxios/i },
        { name: 'chrome', test: /chrome|crios|crmo/i },
        { name: 'safari', test: /safari|applewebkit/i },
    ];
      
    function getBrowserName(a) {
        for (const b of browsers) {
            if (b.test.test(a)) {
                return b.name
            }
        }
        return ''
    }

    function service($q, userService, storage) {

        return {
            browserName: getBrowserName(navigator.userAgent),
            isExtension: (window.chrome && !!chrome.extension) || localStorage.emulateExtension === 'true',
            sendMessage: function(message, callback) {

                if (!window.chrome || !chrome.runtime) {

                    if (callback) {
                        callback()
                    }

                    return;
                }

                chrome.runtime.sendMessage(message, callback);
            }
        }

    }

    angular.module('chrome')
        .factory('chrome', service);

})();