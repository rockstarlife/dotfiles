(function () {

    const details = window.muzli.getDetails();
    const isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; 

    const measurement_id = window.GA_MP_ID;
    const measurement_gtm = window.GA_MP_GTM;
    const mixpanel_token = window.MIXPANEL_TOKEN;
    const session_id = new Date() * 1;

    const experimentFlags = {
        'useKeepIt': {newOnly: true, dimension: 'use_keep_it'},
        'useDefaultV4': {newOnly: true, dimension: 'use_default_v4'},
        'useDefaultWebSearch': {newOnly: true, dimension: 'use_default_web_search'},
        'useAnonymousSources': 'use_anonymous_sources',
    }

    let isMixpanelRegistered = false;

    if (mixpanel_token && mixpanel) {
        mixpanel.init(mixpanel_token, { 
            persistence: 'localStorage',
            ignore_dnt: true,
        });
    }
        
    function trackService() {
        
        let guidPromise;
        let clientID;
        let isFirstVisit;
        let userCustomDimensions = {};
        let pageLoadedAt = new Date();
        let hitCounter = 1;
        let areAllFlagsSet = false;
        const scheduledEvents = []
        
        //Count sessions on refresh
        localStorage.sessionCounter = parseInt(localStorage.sessionCounter || 0) + 1;

        return {
            track: trackEvent,
            trackPageView,
            trackError,
            setDimension,
            getGuid,
            onLoad,
            experimentFlags,
            signalAllFlagsSet,
        };

        function getGuid(storage) {

            guidPromise = guidPromise || storage.get("UUID").then(function (obj) {

                var uuid = obj.UUID;

                if (!uuid) {
                    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0,
                            v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });

                    storage.set({
                        'UUID': uuid
                    });

                    isFirstVisit = true;
                }

                clientID = uuid;

                return uuid;
            });

            return guidPromise;
        }

        // Get and set UUID on initial load
        function onLoad(storage) {

            getGuid(storage).then((uuid) => {

                //INITIAL PAGE HIT
                if (window.REGISTERED === 'ftx') {
                    trackPageView('/ftx/login-success', 'Login successful')
                } else {
                    trackPageView('/', 'Home')
                }

                trackEvent({
                    category: 'App',
                    action: 'Load',
                    label: 'User ID',
                    value: uuid
                });

            });
        }

        function trackPageView(url, title) {

            //Reset counter to keep track engagement time
            pageLoadedAt = new Date();

            trackEvent({
                name: 'page_view',
                url,
                title,
            })

        };

        function setDimension(dimension, value) {

            if (dimension === 'dimension1') {
                console.error('Error: dimension1 is reserved for version tracking only');
                return;
            }

            try {

                let cd = dimension.replace('dimension', 'cd');
                userCustomDimensions[cd] = value;

            } catch (err) {
                console.error("Google analytics error", err);
            }
        }

        function trackError(exception, log) {

            if (log) {
                console.error(exception);
            }

            return true;
        }

        function signalAllFlagsSet() {

            areAllFlagsSet = true;

            if (scheduledEvents.length) {
                while (scheduledEvents.length > 0) {
                    trackEvent(scheduledEvents.shift());
                }
            }
        }

        function trackEvent(event) {

            // If not all flags are set, schedule the event queue
            if (window.FIRST_OPEN && !areAllFlagsSet) {
                scheduledEvents.push(event);
                return;
            } 
            
            var category = event.category || '';
            var action = event.action || '';
            var label = event.label || '';
            var value = event.value || '';
            var customEventDimensions = event.customDimensions;
            
            const formattedEventName = event.name || (category + '_' + action).replaceAll(' ', '_').toLowerCase();
                        
            guidPromise.then((uuid) => {

                if (mixpanel && !isMixpanelRegistered) {

                    //Set global user properties
                    mixpanel.register({
                        extensionVersion: details.version,
                        colorScheme: isDarkTheme ? 'dark' : 'light',
                        ...userCustomDimensions,
                    });

                    mixpanel.identify(uuid);
    
                    isMixpanelRegistered = true;
                }

                // APP+WEB Endpoint
                const endPoint = 'https://www.google-analytics.com/g/collect';    

                //User level Custom dimensions
                const MP4customDimensionMap = {};
                const MP4customEventParams = {};

                Object.keys(userCustomDimensions).forEach(key => {
                    MP4customDimensionMap['up.' + key] = userCustomDimensions[key];
                })

                //Custom event params
                if (customEventDimensions?.length) {
                    customEventDimensions.forEach(param => {
                        MP4customEventParams['ep.' + param.name] = param.value;
                    })
                }

                // Base Event Model for Web Hit
                var eventModel = {
                    v: 2,
                    tid: measurement_id,
                    gtm: measurement_gtm, //Google Tag manager ID
                    _p: Math.round(2147483647 * Math.random()),
                    sr: screen.width + 'x' + screen.height,
                    vp: window.innerWidth + 'x' + window.innerHeight,
                    ul: (navigator.language || "").toLowerCase(),
                    cid: uuid, // Client ID
                    _s: hitCounter, //Hit counter
                    _et: (new Date().getTime() - pageLoadedAt.getTime()) + 1, //Engagement time
                    sid: session_id,
                    sct: localStorage.sessionCounter, //Session counter,
                    seg: hitCounter === 1 ? 0 : 1, //Session engagement,
                    ngs: 1, //???

                    //User properties
                    'up.extension_version': details.version,
                    'up.color_scheme': isDarkTheme ? 'dark' : 'light',
                    ...MP4customDimensionMap,

                    //Event properties
                    en: formattedEventName,
                    'ep.event_category': category,
                    'ep.event_label': label,
                    'ep.event_value': value,
                    ...MP4customEventParams,
                
                };

                //Mark conversion
                if (event.isConversion) {
                    eventModel['_c'] = 1;
                }

                if (hitCounter === 1 && formattedEventName === 'page_view') {
                    eventModel['_ss'] = 1;
                }

                if (formattedEventName === 'page_view') {

                    eventModel = {
                        ...eventModel,
                        dl: event.url, //Document location
                        dt: event.title, //Document title
                    }

                    //First visit (only for new users)
                    if (isFirstVisit) {
                        eventModel['_fv'] = 1;
                        isFirstVisit = false;
                    }
                }


                // A GA4 our events
                const requestQueryString = Object.keys(eventModel).map(key => key + '=' + encodeURIComponent(eventModel[key])).join('&');
                navigator.sendBeacon(endPoint + '?' + requestQueryString);

                hitCounter += 1;

                // MixPanel
                if (mixpanel) {
                    
                    if (formattedEventName === 'page_view') {

                        // Do not track / pageview, since it duplicaeds with app_load event
                        if (event.url === '/') {

                            if (localStorage.sessionCounter === '1') {
                                mixpanel.track('First Open',
                                    {...customEventDimensions}
                                );  
                            }

                            return;
                        }

                        mixpanel.track_pageview({
                            "url": event.url,
                            "page": event.title,
                        });


                    } else {

                        mixpanel.track(
                            event.name || (category + ' ' + action),
                            {...customEventDimensions},
                        );
                        
                    }
                }

            })


        }

    }

    angular.module('muzli').factory('trackService', trackService);

})();