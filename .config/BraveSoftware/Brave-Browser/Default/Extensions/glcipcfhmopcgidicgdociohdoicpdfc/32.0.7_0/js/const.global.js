(function () {

  let isSafari = !!window.safari || /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  let isSafariExtension = isSafari && window.location.protocol.indexOf('safari-extension') > -1;

  let appLocation = (() => {

    //If current context is Chrome Extension, jut get URL from API 
    if (chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL('').slice(0, -1);
    }

    let location;

    if (window.chrome && window.location.protocol.indexOf('chrome-extension') > -1) {
      location = 'chrome-extension://' + window.location.hostname;
    } else if (isSafari && window.location.protocol.indexOf('file') > -1) {
      location = (window.location.origin + window.location.pathname).replace('/index.html', '').replace('/slack.html', '');
    } else if (isSafariExtension) {
      location = window.location.protocol + '//' + window.location.hostname + window.location.pathname.replace('/app.html', '').replace('/slack.html', '').replace('/safari_slack.html', '');
    } else {
      location = window.location.origin;
    }

    return location;

  })();

  let reloadLocation;

  if (window.location?.pathname?.indexOf('mz-app') > -1) {
    reloadLocation = appLocation + window.location.pathname;
  } else if (isSafariExtension) {
    reloadLocation = appLocation + '/app.html';
  } else {
    reloadLocation = appLocation + '/index.html';
  }

  let slackLocation = isSafariExtension ? 'https://app.muz.li/slack.html' : (appLocation + '/slack.html');
  let imageLocation = isSafariExtension ? 'https://app.muz.li' : appLocation;

  window.muzli = {
    closeOnEsc: [],
    statsLoadDelay: 3000,
    emptyImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFAAAAAAAApWe5zwAAAAF0Uk5TAEDm2GYAAAAMSURBVHjaYmAACDAAAAIAAU9tWeEAAAAASUVORK5CYII=',
    lazyLoading: {
      imageDebounce: 50,
      viewPortThreshold: 2500
    },
    paging: {
      scrollDistance: 4,
      throttle: 500,
      local: 30,
      server: 60 //Must be multiplier of local
    },
    removeTooltips: function (selector) {

      $(selector).each(function () {
        let tooltipsy = $(this).data('tooltipsy');
        if (tooltipsy) {
          tooltipsy.destroy();
        }
      });

    },
    getDetails: function () {
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.getManifest) {
        return chrome.runtime.getManifest();
      }

      return {
        version: 'non_chrome'
      }
    },
    getRuntime: function () {
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.id) {
        return window.chrome.runtime;
      }
      return {
        id: 'non_chrome'
      }
    },
    imageLocation: imageLocation,
    isSafari: isSafari,
    reloadLocation: reloadLocation,
    slackLocation: slackLocation
  };

})();
