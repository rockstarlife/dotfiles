//Polyfill for legacy windowed background
const window = {
    isServiceWorker: true,
};

// install / uninstall
(function() {

    importScripts('const.global.js');

    try {
        importScripts('const.dev.js');
    } catch (error) {
        importScripts('const.js');
    }

    var requestSize = 15;
    var newItems = (Math.floor(Math.random() * (requestSize - 5)) + 5).toString();
    var setUninstallURLDone = false;
    var cacheTime = 60;

    //uninstall
    function setUninstallURL() {

        if (setUninstallURLDone) {
            return;
        }

        chrome.storage.local.get("installDate", function(obj) {
            if (obj.installDate) {
                setUninstallURLDone = true;
                var date = new Date();
                var update = ("0" + (date.getMonth() + 1)).slice(-2).toString() + ("0" + (date.getDate())).slice(-2).toString() + date.getFullYear().toString();
                chrome.runtime.setUninstallURL(window.MUZLI_WEBSITE_URL + "/stay/?idate=" + obj.installDate + "&udate=" + update, function() {})
            }
        });
    }
    
    async function cacheFeed() {

        const storage = await chrome.storage.local.get('muzliCachedImages');
        const muzliCachedImages = storage.muzliCachedImages || [];

        let limit = 15;

        fetch(window.MUZLI_SERVER + '/cached/muzli?background=true&limit=' + limit)
        .then(response => response.json())
        .then(async (data) => {

            // Cache images in background
            await Promise.all(data.feed?.map(async item => {

                if (!muzliCachedImages.includes(item.image)) {
                    await fetch(item.image, { mode: 'no-cors', cache: 'reload' });
                    muzliCachedImages.unshift(item.image);
                } 

                return Promise.resolve();

            }))

            chrome.storage.local.set({ 'muzliCachedImages': muzliCachedImages.slice(0, limit)})            
            chrome.storage.local.set({ 'cachedFeed:muzli': data }, () => {
                console.log('Muzli feed cached')
            });

        }, (err) => {
            console.log(err);
        })

        //Random badge text ???
        chrome.action.setBadgeBackgroundColor({ "color": [255, 52, 102, 255] });
        chrome.action.getBadgeText({}, (r) => {
            if (r > 0) {
                r = parseInt(r);
                r = r + 1;
                chrome.action.setBadgeText({ "text": r.toString() });
            } else {
                chrome.action.setBadgeText({ "text": newItems });
            }
        })
    }

    //Clear user cookie
    function removeUserCookie(key) {
        var a = document.createElement('script');
        a.sync = 0;
        a.src = window.MUZLI_WEBSITE_URL + '/partners/remove.php?key=' + key;
        document.body.appendChild(a);
        document.body.removeChild(a);
    }

    chrome.action.onClicked.addListener(function() {
        chrome.tabs.create({ 'url': chrome.runtime.getURL('index.html?button') }, function(tab) {});
    });

    //install reason
    chrome.runtime.onInstalled.addListener(function(obj) {

        const muzliWebsiteHost = window.MUZLI_WEBSITE_URL || 'https://muz.li';

        if (obj.reason === 'install') {
            
            var date = new Date();
            chrome.storage.local.set({ 'installDate': ("0" + (date.getMonth() + 1)).slice(-2).toString() + ("0" + (date.getDate())).slice(-2).toString() + date.getFullYear().toString() });
            
            setUninstallURL();

            chrome.tabs.create({ 'url': muzliWebsiteHost + '/ftx?r=' + chrome.runtime.id }, function(tab) {});
        }

        if (obj.reason === 'update') {
            var date = new Date();
            chrome.storage.local.set({ 'updateDate': ("0" + (date.getMonth() + 1)).slice(-2).toString() + ("0" + (date.getDate())).slice(-2).toString() + date.getFullYear().toString() });
        }
    });

    //Cache Muzli feed every N mins 
    chrome.alarms.create("cacheFeed", { periodInMinutes: cacheTime });

    chrome.alarms.onAlarm.addListener(function(alarm) {
        if (alarm.name === "cacheFeed") {
            cacheFeed();
        }
    });

    //Open new tab instantly after service worker been initialized
    //Used for Forced Extension Updates
    chrome.storage.local.get('openAfterInit', function(storage) {

        if (storage.openAfterInit) {
            chrome.tabs.create({ 'url': chrome.runtime.getURL('index.html') }, (tab) => {});
        };

        chrome.storage.local.set({openAfterInit: false});

    })

    //Initial feed cache
    chrome.storage.local.get(['apiVersion'], (result) => {
        cacheFeed();
    });

    setUninstallURL();

})();

