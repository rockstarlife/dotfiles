(function () {
  var server = 'https://app.muz.li';

  function loadPage(token){
    var oReq = new XMLHttpRequest();

    function reqListener() {
      var html = this.responseText.replace(/js\//g, server + '/js/').replace(/stylesheets\//g, server + '/stylesheets/');

      document.write(html);
      document.close();
    }

    oReq.onload = reqListener;
    oReq.open('GET', server + '?auth=' + token, true);
    oReq.send();
  }


  var oReq = new XMLHttpRequest();

  function reqListener() {
    loadPage(JSON.parse(this.responseText).generated_keys[0]);
  }

  oReq.onload = reqListener;
  oReq.open('GET', server + '/token', true);
  oReq.send();
})();