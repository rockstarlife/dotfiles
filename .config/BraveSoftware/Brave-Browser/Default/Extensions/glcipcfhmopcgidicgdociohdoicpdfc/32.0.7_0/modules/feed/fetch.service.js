(function () {

  const shotsUrlFragment = [
    'dribbble.com/shots/',
    'behance.net/',
    'me.muz.li',
    'layers.to',
    'pinterest.com',
    'designspiration.com',
    'webdesignledger.com',
    'designmodo.com',
    'designshack.net',
    'uimovement.com',
    'collectui.com',
    'mobbin.com',
    'screenlane.com',
    'pttrns.com',
    'uxarchive.com',
    'uigarage.net',
    'uplabs.com',
    'designernews.co',
    'niice.co',
    'bestfolios.com',
    'coroflot.com',
    'carbonmade.com',
    'ello.co',
    'deviantart.com',
    'artstation.com',
    'figma.com/community',
    'webflow.com/discover',
    'framer.com/showcase',
    'arena.im',
    'savee.it',
  ]

  const learnUrlFragment = [
    'medium.com',
    'youtube.com',
    'vimeo.com',
    'udemy.com',
    'coursera.org',
    'skillshare.com',
    'pluralsight.com',
    'linkedin.com/learning',
    'domestika.org',
    'masterclass.com',
    'edx.org',
    'khanacademy.org',
    'codecademy.com',
    'freecodecamp.org',
    'frontendmasters.com',
    'egghead.io',
    'wesbos.com',
    'leveluptutorials.com',
    'designcode.io',
    'interaction-design.org',
    'smashingmagazine.com',
    'alistapart.com',
    'css-tricks.com',
    'tutsplus.com',
    'sitepoint.com',
    'webdesignerdepot.com',
    'creativebloq.com',
    'designshack.net/articles',
    'uxdesign.cc',
    'uxplanet.org',
    'nngroup.com',
    'uxmatters.com',
    'uxbooth.com',
    'podcast.adobe.com',
    'designbetter.co',
    'designsystem.com',
    'refactoringui.com',
    'learnui.design',
    'learnuxd.io',
  ]

  const resorcesUrlFragment = [
    'producthunt.com',
    'elements.envato.com',
    'themeforest.net',
    'graphicriver.net',
    'creativemarket.com',
    'designcuts.com',
    'ui8.net',
    'gumroad.com',
    'designmodo.com/shop',
    'mightydeals.com',
    'pixeden.com',
    'graphicburger.com',
    'freepik.com',
    'shutterstock.com',
    'adobe.com/stock',
    'iconfinder.com',
    'iconscout.com',
    'flaticon.com',
    'thenounproject.com',
    'fontawesome.com',
    'fonts.google.com',
    'myfonts.com',
    'fontspring.com',
    'fontsquirrel.com',
    'dafont.com',
    'creativefabrica.com',
    'designbundles.net',
    'pixelsurplus.com',
    'pixelbuddha.net',
    'graphicsfuel.com',
    '365psd.com',
    'brusheezy.com',
    'vecteezy.com',
    'sketchappsources.com',
    'figmaresources.com',
    'figmafinder.com',
    'uistore.design',
    'uikit.to',
    'uikitfree.com',
    'craftwork.design',
    'lottiefiles.com',
    'humaaans.com',
    'undraw.co',
    'blush.design',
    'icons8.com',
    'iconmonstr.com',
    'streamlinehq.com',
    'lordicon.com',
    'storyset.com',
    'drawkit.com',
    'shapefest.com',
    '3dicons.co',
    'uifaces.co',
    'unsplash.com',
    'pexels.com',
    'pixabay.com',
  ]

  const socialFragments = [
    'twitter.com',
    'facebook.com',
    'instagram.com',
    'linkedin.com',
    'tiktok.com',
    'reddit.com',
    'tumblr.com',
    'pinterest.com/pin',
    'snapchat.com',
    'threads.com',
    'mastodon.social',
    'bluesky.app',
    'discord.com',
    'slack.com',
    'telegram.org',
    'whatsapp.com',
    'messenger.com',
    'youtube.com/channel',
    'youtube.com/user',
    'vimeo.com/user',
    'twitch.tv',
    'patreon.com',
    'ko-fi.com',
    'buymeacoffee.com',
  ]

  fetchService.$inject = ['$rootScope', '$http', '$timeout', '$q', '$sce', 'sources', 'userService', 'trackService', 'server', 'storage', 'socialService'];
  
  function fetchService($rootScope, $http, $timeout, $q, $sce, sources, userService, trackService, server, storage, socialService) {

    var gifTest = /\.(gif)/i;
    var youtube = 'https://www.youtube.com/embed/{id}?rel=0&showinfo=0&autoplay=true';
    var vimeo = 'https://player.vimeo.com/video/{id}?title=0&byline=0&portrait=0&autoplay=true';
    var youtubeThumbnail = 'http://img.youtube.com/vi/{id}/mqdefault.jpg';
    var cancelers = {};
    var sub_sources = {
      '1st_web_designer': '1stWebDesigner',
      'alex_Ikonn': 'Alex Ikonn',
      'basti_hansen': 'Basti Hansen',
      'brent_galloway': 'Brent Galloway',
      'casey_neistat': 'Casey Neistat',
      'charli_marie_tv': 'CharliMarieTV',
      'citizine': 'Citizine',
      'dann_petty': 'Dann Petty',
      'dev_tips': 'DevTips',
      'flux': 'Flux',
      'joshua_pomeroy': 'Joshua Pomeroy',
      'mackenzie_child': 'Mackenzie Child',
      'roberto_blake': 'Roberto Blake',
      'sara_dietschy': 'Sara Dietschy',
      'the_skool_network': 'The Futur',
      'tim_kellner': 'Tim Kellner',
      'tobias_van_schneider': 'Tobias van Schneider',
      'will_paterson': 'Will Paterson',
      'design_inc': 'Design Inc',
      'gary_vaynerchuk': 'Gary Vaynerchuk',
      'matt_d_smith': 'Matt D. Smith',
      'timmy_ham': 'Timmy Ham',
      'high_resolution': 'High Resolution',
      'mike_locke': 'Mike Locke',
      'ux_hacker': 'UX Hacker',
      'designcourse': 'DesignCourse',
    };

    const cachedSources = [
      'muzli',
      'instagram:usemuzli',
      'all:trending',
      'all:viral',
    ]

    var transforms = {
      dribbble: function (post) {
        return {
          stats: {
            comments: post.comments_count,
            likes: post.likes_count,
            views: post.views_count
          }
        }
      },
      producthunt: function (post) {
        return {
          stats: {
            likes: post.likes_count
          }
        }
      },
      muzli: function (post) {
        const domainName = post?.link?.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
        return {
          domainName
        }
      },
      community: (item) => {
        
        const isShot = shotsUrlFragment.some(fragment => item.link?.indexOf(fragment) !== -1);
        const isSocial = socialFragments.some(fragment => item.link?.indexOf(fragment) !== -1);
        const isLearn = learnUrlFragment.some(fragment => item.link?.indexOf(fragment) !== -1);
        const isResource = resorcesUrlFragment.some(fragment => item.link?.indexOf(fragment) !== -1) || !!item['labels.resource'];

        item.labels = [
          ...(isShot ? ['Shot'] : []),
          ...(isSocial ? ['Social'] : []),
          ...(isLearn ? ['Learn'] : []),
          ...(isResource ? ['Resource'] : []),
          ...(!isShot && !isSocial && !isLearn && !isResource ? ['Web'] : []),
        ];

        delete item.palette;

      },
      art_station: function (post) {
        return {
          image: post.image.replace(/https:\/\/artstation.com\/assets\/emoji\/(.*)/, window.muzli.imageLocation + '/images/artstation_bg.png')
        }
      },
      colors: function (post) {

        var shortUrl = window.MUZLI_COLORS_SERVER + '/' + btoa(post.id.slice(0, 9))
        var downloadUrl = window.MUZLI_COLORS_SERVER + '/download/' + btoa(post.id.slice(0, 9))

        var hexTest = RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$');

        post.palette = post.palette.filter(function (color) {
          return hexTest.test(color)
        })

        return {
          shortUrl: shortUrl,
          downloadUrl: downloadUrl,
          link: window.MUZLI_SEARCH_URL + '/' + btoa(post.id.slice(0, 9)) + '?utm_source=extension&utm_medium=muzli',
        }


      },
      curated: function (post) {
        if ($rootScope.user && !$rootScope.user.admin) {
          delete post.isCurated;
        };
      },
      npr: generateImageFallbackFunction('facebook-default.jpg', 'npr_bg.png'),
      hacker_news: generateImageFallbackFunction('forbes_1200x1200.jpg', 'hn_bg.png'),
      forbes: generateImageFallbackFunction('forbes_1200x1200.jpg', 'forbes_bg.png'),
      smashing_mag: generateImageFallbackFunction('forbes_1200x1200.jpg', 'smashing_bg.png'),
      swiss_miss: generateImageFallbackFunction('blank.jpg', 'swiss-miss_bg.png'),
      fox_news: generateImageFallbackFunction('og-fn-foxnews.jpg', 'fox_news_bg.png'),
      kottke: generateImageFallbackFunction('apple-touch-icon.png', 'kottke_bg.png'),
      designer_news: generateImageFallbackFunction(null, 'dn_bg.png'),
      alistapart: generateImageFallbackFunction(null, 'alistapart_bg.png'),
      sidebar: generateImageFallbackFunction(null, 'sidebar_bg.png'),
      cnn: generateImageFallbackFunction('cnn_bg.jpg', 'cnn_bg.png'),
      abc_news: generateImageFallbackFunction(null, 'abc_bg.png'),
      nytimes: generateImageFallbackFunction(null, 'nytime_bg.png'),
      its_nice_that: generateImageFallbackFunction(null, 'itsnicethat_bg.png'),
      brandnew: generateImageFallbackFunction(null, 'brandnew_bg.png'),
      astcodesign: generateImageFallbackFunction(null, 'astcodesign_bg.png'),
      designspiration: generateImageFallbackFunction(null, 'designspiration_bg.png'),
      recode: generateImageFallbackFunction(null, 'recode_bg.png'),
      producthunt: generateImageFallbackFunction(null, 'product_hunt_bg.png'),
      fastcompany: generateImageFallbackFunction(null, 'fastcompany_bg.png'),
      adweek: generateImageFallbackFunction(null, 'adweek_bg.png'),
      entrepreneur: generateImageFallbackFunction(null, 'entrepreneur_bg.png'),
      madebyfolk: generateImageFallbackFunction(null, 'madebyfolk_bg.png'),
      designsnips: generateImageFallbackFunction(null, 'designsnips_bg.png'),
      uxmatters: generateImageFallbackFunction(null, 'uxmatters_bg.png'),
      sitepoint: generateImageFallbackFunction(null, 'sitepoint_bg.png'),
      dailyjs: generateImageFallbackFunction(null, 'dailyjs_bg.png'),
      mlb: generateImageFallbackFunction(null, 'mlb_bg.png'),
      skysports: generateImageFallbackFunction(null, 'skysports_bg.png'),
      medium: generateImageFallbackFunction(null, 'medium_bg.png'),
      'default': function () {
        return {}
      }
    };

    $rootScope.$on('muzli:update:favorite', function (event, params) {

      fetchFromCache('muzli')
        .then(function (muzli) {

          muzli.feed.forEach(function (item) {
            if (item.id === params.id) {
              item.favorite = params.favorite;
            }
          });

          return setCache('muzli', muzli);

        });

    });

    $rootScope.$on('muzli:clear:favorite', function () {

      fetchFromCache('muzli')
        .then(function (muzli) {

          muzli.feed.forEach(function (item) {
            item.favorite = false;
          });

          return setCache('muzli', muzli);

        });
    });

    function generateImageFallbackFunction(name, image) {

      return function (post) {

        var fallbackImage = !post.image || (name && post.image.indexOf(name) > 0);

        return {
          image: fallbackImage ? (window.muzli.imageLocation + '/images/' + image) : post.image,
          fallbackImage: fallbackImage,
          fallbackImageSrc: window.muzli.imageLocation + '/images/' + image,
        }
      }
    }

    function extractDomain(url) {

      var domain;

      //find & remove protocol (http, ftp, etc.) and get domain
      if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
      } else if (url.indexOf('/') === -1) {
        return null;
      } else {
        domain = url.split('/')[0];
      }

      //find & remove port number
      domain = domain.split(':')[0];

      if (domain.indexOf('.') === -1) {
        return null;
      }

      return domain;
    }

    function transformImage(item) {

      var image = item.image;

      if (!image || typeof image !== 'string') {
        return {
          image: ''
        }
      }

      if (image[0] === '/' && image[1] === '/') {
        image = 'http:' + image;
      }

      if (!extractDomain(image)) {

        var url = item.external_url || item.link;
        var domain = image[0] === '/' ? extractDomain(url) : url;

        if (domain[domain.length - 1] !== '/') {
          domain = domain + '/';
        }

        image = domain + image;
      }

      if (!/^https?:\/\//i.test(image)) {
        image = 'http://' + image;
      }

      return {
        image: image
      }
    }

    function transformVideo(item, sourceName) {

      if (item.youtube) {

        // Update shorts image to max
        if (sourceName === 'shorts') {
          // Mutate item directly. Not a good pattern but easiest ATM
          item.image = item.image?.replace('hqdefault.jpg', 'maxresdefault.jpg');
        }

        return {
          thumbnail: (item.image && item.image.indexOf('ytimg') > -1) ? item.image : youtubeThumbnail.replace('{id}', item.youtube),
          video: $sce.trustAsResourceUrl(youtube.replace('{id}', item.youtube)),
          videoId: item.youtube
        }
      }

      if (item.vimeo) {
        return {
          video: $sce.trustAsResourceUrl(vimeo.replace('{id}', item.vimeo)),
          videoId: item.vimeo
        }
      }

      if (item.video) {
        return {
          video: false,
          htmlVideo: $sce.trustAsResourceUrl(item.video),
        }
      }

      if (item.webm) {
        return {
          htmlVideo: $sce.trustAsResourceUrl(item.webm),
        }
      }

      if (['vlogs', 'shorts'].includes(item.source?.name)) {

        var videoId;

        if (item.link.indexOf(item.id) === -1) {
          videoId = new URL(item.link).searchParams.get('v');
        } else {
          videoId = item.id;
        }

        return {
          thumbnail: (item.image && item.image.indexOf('ytimg') > -1) ? item.image : youtubeThumbnail.replace('{id}', videoId),
          video: $sce.trustAsResourceUrl(youtube.replace('{id}', videoId)),
          videoId: videoId
        }
      }

      return {};
    }

    function transformSource(item) {

      if (item.source.startsWith('medium:')) {
        item.source = 'medium'
      }

      if (item.source === 'ui8') {
        item.tags = ['ui8', ...item.tags || []];
        item.source = 'store';
      }

      if (item.source === 'webflow') {
        item.tags = ['webflow', ...item.tags || []];
        item.source = 'store';
      }

      if (item.source === 'themeforest') {
        item.tags = ['themeforest', ...item.tags || []];
        item.source = 'store';
      }

      // Map source for JSON, by name
      const sourceJson = sources.findByName(item.source) || sources.findByName('curated');

      // We have to clone the source, because we modify it later, when displaying cards
      const res = {
        source: {...sourceJson}
      };

      //Transform items if they have a YT channel data provided
      if (item.channel) {
        res.source.title = item.channel.title;
        res.source.icon = item.channel.image;
      }

      if (item.sub_source) {
        res.sub_source = {
          title: sub_sources[item.sub_source] || item.sub_source,
          name: item.sub_source
        }
      }

      return res;
    }

    function transformAnimation(item) {

      if (item.source && ['colors'].indexOf(item.source.name) !== -1) {
        return {};
      }

      var res = {};
      var isGif = item.gif || gifTest.test(item.image);

      if (isGif) {
        res.isGif = true;
        res.animated = true;
      }

      return res;
    }

    function transformVirality(item, virality) {
      var isViral = item.virality > 1 && item.virality >= virality[item.source] * 1.7;
      return isViral ? {
        viralTimes: Math.ceil(item.virality / (virality[item.source] || 1))
      } : {};
    }

    function transformFetch(data, virality, proxy_server, sourceName, user) {

      data = _dedupeData(data);

      const extensionId = window.location.protocol.startsWith('chrome-extension') ? window.location.host : '';

      return data.filter(function (item) {
        return !!item.link;
      }).map(function (post) {

        let useProxy = !!proxy_server;
        let sourceTransform = transforms['default'];
        let url = post.link;
        let redirectToSharePage = post.isFrameAllowed;

        if ((post.source && transforms[post.source])) {
          sourceTransform = transforms[post.source];
        }

        //Explicit URL transfor for Designer news
        if (post.source && post.source.name === 'designer_news') {
          url = post.external_url || post.link
        }

        post = angular.extend(post, transformVirality(post, virality));
        post = angular.extend(post, transformImage(post));
        post = angular.extend(post, transformSource(post));
        post = angular.extend(post, transformVideo(post, sourceName));
        post = angular.extend(post, transformAnimation(post));
        post = angular.extend(post, sourceTransform(post));

        post.link_out = url;

        // Override end destination to me.muz.li on community feed and usr profile pages
        if (sourceName === 'community' || sourceName === 'user') {

          const username = post.user?.username || user?.username;

          if (username && post.slug) {

            const redirectURL = new URL(`${window.MUZLI_ME_URL}/${username}/${post.slug}`);

            if (extensionId) {
                redirectURL.searchParams.set('ref', extensionId);
            }

            if ($rootScope.user?._id) {
                redirectURL.searchParams.set('uid',$rootScope.user._id);
            }

            post.link = redirectURL;
            url = post.link;
            post.link_out = post.link;
            useProxy = false;
          }

        }
        
        if (post.slug && post.source?.name === 'muzli' && !(new URL(post.link)?.hostname?.endsWith('muz.li'))) {
          post.picksLink = window.MUZLI_WEBSITE_URL + `/picked/${post.slug}`;
        }

        if (localStorage.enableSharebleLinks !== 'true') {
          redirectToSharePage = false;
        }

        if (window.innerWidth <= 1440) {
          redirectToSharePage = false;
        }

        if (useProxy && !redirectToSharePage) {

          post.link_out = proxy_server + '/go?link=' + encodeURIComponent(url)

          if (post.source && post.source.name) {
            post.link_out += ('&source=' + post.source.name)
          }

          if (post.id) {
            post.link_out += ('&post=' + post.id)
          }

        }

        if (post.source && post.source.name === 'colors') {
          post.link_out = post.link;
        }

        if (post.source) {
          post.tooltip = 'More from ' + (post.source.name === 'muzli' ? 'Muzli picks' : post.source.title);
        }

        post.title = post.title || '';
        post.viralTimesText = !!post.viralTimes ? ('At least ' + post.viralTimes + ' times more shares than usual') : ((post.virality || 0).toLocaleString('en') + ' shares');
        
        if (user) {
          post.user = post.user || user;
        }

        return post;
      });
    }

    function setCache(name, data) {

      let storageKey = 'cachedFeed:' + name;

      if (data && data.feed && data.feed.length) {

        let payload = {};

        payload[storageKey] = data;

        return storage.set(payload)

      } else {
        return storage.remove(storageKey);
      }
    }

    function filterLocallyHiddenItems(feed) {

      if (feed.length) {

        let localHiddenItems = [];

        try {
          localHiddenItems = JSON.parse(localStorage.hiddenItems || '[]')
        } catch (e) {
          console.error('Failed to parse local hidden items')
          console.error(e);
        }

        feed.forEach((item) => {
          item.userHidden = item.userHidden || localHiddenItems.includes(item.id);
        })

      }

    }

    function fetchFromCache(name, limit) {

      let storageKey = 'cachedFeed:' + name;

      return storage
        .get(storageKey, true)
        .then(storageResponse => {

          if (storageResponse && storageResponse[storageKey] && storageResponse[storageKey].feed) {

            if (!storageResponse[storageKey].feed?.length) {
              return $q.reject(`[${name} Feed Cache Is Empty`);
            }

            if (limit && storageResponse[storageKey].feed?.length < limit) {
              return $q.reject(`Not enaugh items in [${name}] cache`);
            }

            if (limit) {
              storageResponse[storageKey].feed = storageResponse[storageKey].feed?.slice(0, limit);
            }

            return storageResponse[storageKey];

          } else {
            return $q.reject(`No [${name}] Feed Cache`);
          }

        })
        .then(cachedFeed => {
          filterLocallyHiddenItems(cachedFeed.feed);
          return angular.copy(cachedFeed);
        });
    }

    function fetchFromServer(name, sort, limit, skip, filter, userId) {
      
      name = name || 'all';

      //Remove dynamic prefix, because server don't understand it
      name = name.replace(':viral', '')
      name = name.replace(':trending', '')

      //Override Hot feed from filter value
      if (filter === 'top') {
        name = 'top';
        filter = false;
      }
      
      if (name === 'user' && userId) {
        name = `user/${userId}`;
      }

      //Add limit to the source to let finish loading feeds
      //Required for muzli 15 and muzli 60 feed home/feed combination
      var cancelerName = name + limit;

      if (cancelers[cancelerName]) {
        cancelers[cancelerName].resolve();
      }

      var params = {
        sort: sort
      };

      if (filter) {

        params.filter = filter;

        if (filter == 'curated') {
          name = 'curated-admin';
          params.skipCache = true;
        }
      }

      if (limit) {
        params.limit = limit;
      }

      if (skip) {
        params.skip = skip;
      }

      //Resolve query dependencies bundle
      const paramDependencies = [];

      if (['all', 'top-week'].includes(name)) {
        var selectedBundle = userService.getUserBundle()
        var shortcuts = sources.getShortcuts()
        var demotedSources = sources.getDemotedSources()

        paramDependencies.push(selectedBundle, shortcuts, demotedSources);
      }

      return $q.all(paramDependencies)
        .then((res) => {

          var selectedBundle = res[0];
          var shortcuts = res[1];
          var demotedSources = res[2];

          if (selectedBundle && shortcuts && demotedSources) {

            params.bundle_type = selectedBundle

            //Add shortcuts as weights
            params.upgrade = shortcuts
              .filter(function (shortcut) {
                return demotedSources.indexOf(shortcut.name) === -1;
              })
              .map(function (shortcut) {
                return shortcut.name + ':' + (shortcut.weight || 2)
              })
              .concat(demotedSources.map(function (source) {
                return source + ':-1'
              }))

          }

          var canceler = cancelers[cancelerName] = $q.defer();

          $timeout(function () {
            canceler.resolve();
          }, 1000 * 10);

          return $http({
            method: 'GET',
            url: server() + '/feed/' + name,
            params: params,
            timeout: canceler.promise
          })
          .then(function (res) {

            if (name === 'top') {
              res.data.feed.forEach(item => {
                item.domainName = extractDomain(item.link);
              })
            }

            //Transform source name for curated items, since they might be from multiple sources
            if (name === 'curated') {
              res.data.feed.forEach(item => {
                item.source = 'curated';
              })
            }

            if (name === 'all' && demotedSources?.length && !filter) {
              res.data.feed = res.data.feed.filter(item => {
                return demotedSources.indexOf(item.source) === -1;
              })
            }

            return res.data;
          })
          .catch(err => {
            console.error(err)
          })
        });
    }

    function fetchAndCachePromise(name, sort, limit, filter, userId) {

      function fetchAndCache() {

        var fetchPromise = fetchFromServer(name, sort, limit, 0, filter);

        fetchPromise.then(feed => {
          return setCache(name, feed)
        });

        return fetchPromise;
      }

      var renderedFeedObject = {};

      //Try to fetch from local cache
      if (cachedSources.includes(name)) {

        //Create a separate promise to fetch from server at the same time to update user-sensitive data
        const fetchFresh = fetchAndCache().then(freshFeedObject => {

          //Override time sensitive data from fetched response
          if (renderedFeedObject?.feed?.length) {

            let localHiddenItems = [];

            try {
              localHiddenItems = JSON.parse(localStorage.hiddenItems || '[]')
            } catch (e) {
              console.error('Failed to parse local hidden items')
              console.error(e);
            }
            
            renderedFeedObject?.feed?.forEach((renderedItem) => {

              var freshItem = freshFeedObject.feed.find((freshItem) => {
                return renderedItem.id === freshItem.id;
              })

              if (freshItem) {
                renderedItem.isLiked = freshItem.isLiked;
                renderedItem.favorite = freshItem.favorite;
                renderedItem.userNSFW = freshItem.userNSFW;
              }

            })

          }

          filterLocallyHiddenItems(freshFeedObject?.feed);

          return freshFeedObject;
        });

        return fetchFromCache(name, limit)
          .then(cachedFeed => {

            // Store feed reference to modify it after updated data from server arrives
            renderedFeedObject = cachedFeed;

            return cachedFeed;
          })
          .catch((err) => {
            // If no cache found, just fetch from server
            console.error(err);
            return fetchFresh;
          });

      } else if (name === 'favorites') {
        return userService.getFavorites();
      } else {
        return fetchFromServer(name, sort, limit, 0, filter, userId);
      }
    }

    function _dedupeData(data) {

      //Unique by Id & Link
      return data.filter((item, index) => {
        return index === data.findIndex(indexItem => {
          return item.id === indexItem.id;
        });
      });
    }

    function openSlack(url, item) {

      var channel = 'slack';

      window.muzliOpenWindow(url, 'Post To Slack');

      //Add promo flag to distinquish if share was triggered via promotion
      if (item.displaySharePromo) {
        channel += '-promo';
        item.displaySharePromo = false;
        $('.tooltipsy').remove();
      }

      trackService.track({
        category: 'Share',
        action: channel,
        label: item.link,
      });
    }

    function fetchCarbonSingleZone(zoneKey) {

      // E.g. https://srv.buysellads.com/ads/ZONEID.json?ignore=yes
      let carbonUrl = `${window.MUZLI_CARBON_URL_ROOT}/ads/${zoneKey}.json`;

      if (window.MUZLI_CARBON_IGNORE) {
        carbonUrl += '?ignore=yes';
      }

      return $http({
        method: 'GET',
        url: carbonUrl,
        timeout: new Promise(resolve => {
          setTimeout(resolve, 1000)
        })
      }).then((res) => {

        const response = res?.data?.ads;
        const ad = response.at(0);

        //Ad a pixel if required
        if (ad?.pixel) {
          ad.pixels = ad.pixel.split('||').map((pixel) => {

            if (pixel.startsWith('//')) {
              pixel = pixel.replace('//', 'https://')
            }

            return pixel.replace("[timestamp]", ad.timestamp || '');
          });
        }

        if (ad?.statlink) {

          if (ad.statlink.startsWith('//')) {
            ad.statlink = ad.statlink.replace('//', 'https://');
          }

          return {
            beacon: ad.beacon || ad.statimp,
            image: ad.image || ad.smallImage,
            link: $sce.trustAsUrl(ad.statlink),
            name: ad.title || ad.description,
            pixels: ad.pixels || [],
            channel: 'carbon-native',
          };
        }

      }).catch(err => {
        console.error(err)
        console.log('Failed to fetch carbon multi-zone')
      })


    }

    function fetchCarbonMultiZone(zoneKeys) {

      // E.g. https://srv.buysellads.com/ads/get/ids/CWYI4KJU;CEAIL53I.json?ignore=yes
      let carbonUrl = `${window.MUZLI_CARBON_URL_ROOT}/ads/get/ids/${zoneKeys}.json`;

      if (window.MUZLI_CARBON_IGNORE) {
        carbonUrl += '?ignore=yes';
      }

      return $http({
        method: 'GET',
        url: carbonUrl,
        timeout: new Promise(resolve => {
          setTimeout(resolve, 1000)
        })
      }).then((res) => {

        let response = res?.data?.ads;
        let ad;

        const zoneIds = zoneKeys.split(';');
        const ads = zoneIds.reduce((list, zoneKeys, index) => {

          const zone = response[zoneKeys];
          const ad = zone?.ads?.at(0);

          if (ad && ad.statlink) {

            // WARNING
            // Assume #1 key is always set to self-service, so set ad channel accordingly
            // The channel returned as self-service displayed as default muzli card
            ad.channel = index === 0 ? 'self-service' : 'carbon-native';
            ad.beacon = `${window.MUZLI_CARBON_URL_ROOT}/ads/long/x/${ad.longimp}`;

            list.push(ad);
          }
          
          return list;

        }, [])

        // Pick firs filled ad by priority
        if (ads.length) {
          ad = ads.at(0);
        }

        //Ad a pixel if required
        if (ad?.pixel) {
          ad.pixels = ad.pixel.split('||').map((pixel) => {

            if (pixel.startsWith('//')) {
              pixel = pixel.replace('//', 'https://')
            }

            return pixel.replace("[timestamp]", ad.timestamp || '');
          });
        }

        if (ad?.statlink) {

          if (ad.statlink.startsWith('//')) {
            ad.statlink = ad.statlink.replace('//', 'https://');
          }

          return {
            beacon: ad.beacon || ad.statimp,
            image: ad.image || ad.smallImage,
            link: $sce.trustAsUrl(ad.statlink),
            name: ad.title || ad.description,
            pixels: ad.pixels || [],
            channel: ad.channel,
            domainName: 'Sponsored',
          };
        }

      }).catch(err => {
        console.error(err)
        console.log('Failed to fetch carbon multi-zone')
      })


    }

    function fetchCarbonAd(channel) {

      switch (channel) {

        case 'hero':

          const zoneKey = $rootScope?.user?.carbonSelfServiceZone || window.MUZLI_CARBON_ZONE_MAIN;
          const isMultiZone = zoneKey?.includes(';');

          if (isMultiZone) {
            return fetchCarbonMultiZone(zoneKey);
          } else {
            return fetchCarbonSingleZone(zoneKey)
              .then(ad => {

                // Fetch carbon native ad if the initial one was not filled
                // Used when carbonSelfServiceZone is composed from a single zone and it fails
                if (!ad?.statlink && zoneKey !== window.MUZLI_CARBON_ZONE_MAIN) {
                  return fetchCarbonSingleZone(window.MUZLI_CARBON_ZONE_MAIN);
                }

                return ad;
              })
          }  

        case 'feed':
          return fetchCarbonSingleZone(window.MUZLI_CARBON_ZONE_FEED);
        
        case 'carbon-native':
        default:
          return fetchCarbonSingleZone(window.MUZLI_CARBON_ZONE_MAIN);
      }

    }

    function fetchTrendingFeed() {
      return storage.get(['enableTrendingTile']).then((storageData) => {

        if (storageData.enableTrendingTile) {

          //Trending feed from top clicked items
          if ($rootScope.feedVariation === 0) {

            localStorage['dynamicSlot'] = 1;

            return fetch('all:trending', 'clicks', 10, 'top')
              .then((res) => {
                return res?.data?.filter(item => item.source?.name !== 'muzli').sort((a, b) => {
                  return .5 - Math.random();
                });
              })
              
              .catch((err) => {
                console.error('Failed to fetch all:trending feed');
                console.error(err);
              })

          }

          //Personalized all feed sorted by virality
          if ($rootScope.feedVariation > 0) {

            localStorage['dynamicSlot'] = 0;

            return fetch('all:viral', 'virality', 5)
              .then((res) => {
                return res.data?.filter(item => {
                  return item.source?.name !== 'muzli' && !!item.image
                })
                .sort((a, b) => {
                  return .5 - Math.random();
                });
              })
              .catch((err) => {
                console.error('Failed to fetch all:viral feed');
                console.error(err);
              });
          }

        } else {
          return [];
        }

      })
    }

    function fetchDynamicFeed() {

      $rootScope.feedVariation = parseInt(localStorage.dynamicSlot) || 0;

      let promotedSlotDisplayPercentage = $rootScope.user ? ($rootScope.user.promotedSlotDisplayPercentage || 0) : 0;

      //Sponsored Feed variation
      if (promotedSlotDisplayPercentage) {

        // Fetch ads only for 3x grid and more
        let minimalWidthForAds = $rootScope.useSpeedDial ? 1150 : 1346;

        // Check if show promoted slot entirely
        let showPromotedSlot = promotedSlotDisplayPercentage ? parseInt(localStorage.promotedSlotSkipCount) >= 100 / promotedSlotDisplayPercentage : 0;

        // Decide which campaigns to show
        let doFetchCarbonAd = !!$rootScope.user?.showCarbon && window.innerWidth > minimalWidthForAds;
        let doFetchMuzliAd = !doFetchCarbonAd || $rootScope.user?.muzliAdsBackfill >= Math.random();

        //Show promoted slot
        if (showPromotedSlot) {

          //Reset promoted slot
          localStorage.promotedSlotSkipCount = 1;

          return Promise.all([
            doFetchCarbonAd ? fetchCarbonAd('hero') : Promise.resolve(),
            doFetchMuzliAd ? fetchSponsoredPost('dynamic') : Promise.resolve(),
          ])
            .then((sponsoredPosts) => {

              const filledPosts = sponsoredPosts?.filter(sponsored => !!sponsored);
              
              if (!filledPosts.length) {
                return fetchTrendingFeed();
              }

              $rootScope.feedVariation = 2;

              return filledPosts
                .map(sponsored => {
                  return {
                    title: sponsored.name,
                    image: sponsored.image,
                    link: sponsored.link,
                    link_out: sponsored.link,
                    beacon: sponsored.channel === 'self-service' ? sponsored.beacon : sponsored.beacon += '&source=dynamic',
                    source: sponsored.channel,
                    pixels: sponsored.pixels,
                    isGif: sponsored.image?.endsWith('.gif'),
                    domainName: sponsored.domainName,
                  }
                })
            })
            .catch(err => {
              console.error(err);
              console.error('Failed to fetch sponsored');
            })

          //Else increment counter how many times it was skipped
        } else {
          localStorage.promotedSlotSkipCount = parseInt(localStorage.promotedSlotSkipCount || '0') + 1 || 1;
        }

      }

      return fetchTrendingFeed();

    }

    function fetch(sourceName, sort, limit, filter, userId) {

      if (sourceName === 'empty') {
        return {
          data: [],
          latest: new Date(),
        }
      }

      return fetchAndCachePromise(sourceName, sort, limit, filter, userId)
        .then((res) => {

          if (res.proxy_server) {
            window.MUZLI_APP = res.proxy_server;
          }

          return {
            data: transformFetch(res.feed, res.viralityMedian, res.proxy_server, sourceName, res.user),
            user: res.user,
            latest: res.latest
          }
        });
    }

    function fetchSponsoredPost(channel) {

      // If user disabled ads, don't fetch any
      if ($rootScope.user?.areAdsDisabled) {
        return Promise.resolve();
      }

      var adUrl = window.MUZLI_AD_SERVER + '/get';

      if (channel) {
        adUrl += '?channel=' + channel
      }

      return $http({
        method: 'GET',
        url: adUrl,
      }).then((res) => {

        var ad = res.data

        if (ad.link && ad.link.endsWith('undefined')) {
          throw new Error('No campaign defined for sponsored slot');
        }

        return {
          beacon: ad.beacon,
          image: ad.image,
          link: ad.link,
          name: ad.name,
          channel: channel || 'sponsored',
        };
      });
    }

    function resolveObBackfill(obBackfillValue) {

      if (!obBackfillValue) {
        return false;
      }

      const [probability, idle] = obBackfillValue.split('-');

      if (parseFloat(probability) < Math.random()) {
        return false;
      }

      if (idle) {

        let idlePeriod = new Date();
        let lastHomeScrolled; 
        
        idlePeriod.setDate(idlePeriod.getDate() - parseInt(idle));

        try {
          lastHomeScrolled = new Date(JSON.parse(localStorage.lastHomeScrolled))
        } catch (error) {
          // Do nothing if used hasn't scrolled yet or date is invalid
        }

        if (lastHomeScrolled && lastHomeScrolled < idlePeriod) {
          return true;
        }

        return false;

      }

      return false;
    }

    return {
      fetch,
      fetchSponsoredPost,
      fetchDynamicFeed,
      fetchCarbonAd,
      transformFetch,

      fetchFromServer: function (source, serverPageSize, current, filter, userId) {

        var req = {
          sources: null,
          home: null,
          'all': null,
          'home-muzli': 'muzli',
        }[source];

        if (req === undefined) {
          req = source;
        }

        return fetchFromServer(req, 'date', serverPageSize, current, filter, userId)
          .then(function (res) {

            if (res.proxy_server) {
              window.MUZLI_APP = res.proxy_server;
            }

            return transformFetch(res.feed, res.viralityMedian, res.proxy_server);
          })
      },


      constants: {
        playerVars: {
          rel: 0,
          controls: 0,
          showinfo: 0
        }
      },

      event: {
        sendSlack: function (e, item) {

          e.preventDefault();
          e.stopImmediatePropagation();

          let linkOut;

          if (item.id) {

            linkOut = item.link;
  
            if (item.isFrameAllowed) {
              linkOut = window.MUZLI_SHARE_SERVER + btoa(item.id.slice(0, 9));
            }
  
            storage.set({
              slack_send: {
                link: linkOut,
                title: item.title,
                image: item.image
              }
            });
          }

          if (item.text) {

            linkOut = item.link;

            storage.set({
              slack_send: {
                link: linkOut,
              }
            });

          }
          

          var url = window.muzli.slackLocation;

          if (window.muzli.isSafari) {
            url += ('?slack_link=' + encodeURIComponent(link));
          }

          openSlack(url, item);
        },
        openSharer: function (e, channel, item) {

          e.preventDefault();
          e.stopImmediatePropagation();

          let linkOut;

          if (item.id) {

            linkOut = window.MUZLI_SHARE_SERVER + btoa(item?.id?.slice(0, 9));

            socialService.share(channel, linkOut, item.title, 'usemuzli design inspiration');
        
            //Add promo flag to distinquish if share was triggered via promotion
            if (item?.displaySharePromo) {
              channel += '-promo';
              item.displaySharePromo = false;
              $('.tooltipsy').remove();
            }
  
            trackService.track({
              category: 'Share',
              action: channel,
              label: item?.link,
            });
          }

          if (item.text) {

            linkOut = item.link;

            socialService.share(channel, linkOut, item.text, 'usemuzli');
            
            trackService.track({
              category: 'Referral Share',
              action: channel,
              label: item?.link,
            });

          }


        },
        postClick: function (post, event, type) {

          //Ignore all mouse buttons except primary and middle
          if (event.button !== 0 && event.button !== 1) {
            return;
          };

          //Ignore click if share promo is activated
          if (post.displaySharePromo) {
            event.preventDefault();
            return;
          }

          //Experimental feature to promote shares
          if ($rootScope.recentlyClickedPost) {
            $rootScope.recentlyClickedPost.displaySharePromo = false;
          }

          $rootScope.recentlyClickedPost = post;

          if (!post.video) {

            var postElement = $(event.target).parents('li')[0];

            $(window).one('focus', function () {
              $timeout(function () {

                if (post.source.name !== 'colors') {
                  post.displaySharePromo = true;
                }

                $(document).one('click', function (event) {
                  if (!postElement.contains(event.target)) {
                    post.displaySharePromo = false;
                    $('.tooltipsy').remove();
                  }
                })

              }, 1000);
            });
          }

          let context = $rootScope.currentSource;

          if (context.name) {
            context = context.name;
          }

          if (type === 'sticky') {

            context = 'sticky-muzli';

            //Dynamic slot
            if ($(event.target).parents('.dynamic').length) {

              switch ($rootScope.feedVariation) {
                case 0: context = 'sticky-trending';
                  break;
                case 1: context = 'sticky-hot';
                  break;
                case 2: context = 'sticky-instagram';
                  break;
              }

            }

          }

          if (context === 'all') {
            context = 'all-' + $rootScope.currentFeedFilter
          }

          return trackService.track({
            category: 'Feed',
            action: 'Click',
            label: post.link,
            isConversion: true,
            //Set customDimension5 (Context)
            customDimensions: [{
              name: 'cd5',
              value: context,
            }]
          });

        },
        videoClick: function (post, type) {
          return trackService.track({
            category: 'Feed',
            isConversion: true,
            action: 'Play Video',
            label: post.title,
          });
        },
        sourceClick: function (e, source) {

          e.stopImmediatePropagation();

          trackService.track({
            category: 'Feed',
            action: 'Filter',
            label: source
          });
        },
        promotionClick: function () {
          console.log('CLICK')
          trackService.track({
            category: 'Promoted',
            action: 'Click',
            isConversion: true,
          });
        },
        toggleFavorite: function (event, item) {

          event.preventDefault();
          event.stopPropagation();

          userService.setFavorite(item, !item.favorite);
        },
        markNSFW: function (item) {

          var params = {
            id: item.id
          };

          return $http.post(server() + '/feed/mark/nsfw', params).then(function (response) {
            item.userNSFW = true;
            item.showMenu = false;
          })
        },
        unmarkNSFW: function (item) {

          var params = {
            id: item.id
          };

          return $http.post(server() + '/feed/unmark/nsfw', params).then(function (response) {
            item.userNSFW = false;
            item.showMenu = false;
          })
        },
        markHidden: function (item) {

          var params = {
            id: item.id
          };

          try {
            let localHiddenItems = JSON.parse(localStorage.hiddenItems || '[]')
            localHiddenItems.push(item.id)
            localStorage.hiddenItems = JSON.stringify(localHiddenItems.slice(-30))
          } catch (e) {
            console.error('Failed to parse local hidden items')
            console.error(e);
          }

          return $http.post(server() + '/feed/mark/hidden', params);
        },
      }
    }
  }

  angular.module('feed')
    .factory('fetchService', fetchService);

})();
