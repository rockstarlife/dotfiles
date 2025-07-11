(function (){

  const isDark = window.localStorage.getItem('theme') === "dark";
  const isV4 = window.localStorage.getItem('useV4') === "true";

  if (isV4) {
    document.body.classList.add('v4');
  }

  if (window.REGISTERED) {
    document.body.className = document.body.className + ' app-loading';
  } else {
    if (isDark) {
      document.body.className = document.body.className + ' dark';
    }
  }
  
})();
