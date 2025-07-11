(function () {

  var $window = $(window);
  var scrollStart = false;
  var emptyImage = window.muzli.emptyImage;

  let options = {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  }

  let callback = function(entries, observer) {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0) {
          observer.unobserve(entry.target);
          entry.target.dispatchEvent(new Event('drawCanvas'));
        }
    })
  }
  
  let intersectionObserver = new IntersectionObserver(callback, options);

  function setImage ($self, src) {
    if ($self.is("img")) {
      $self.attr("src", src);
    } else {
      $self.css("background-image", "url('" + src + "')");
    }
  }

  function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.naturalWidth || img.width,
        ih = img.naturalHeight || img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
  }

  function loadImage (config) {

    config = config || {};

    var imageElement = this;
    var $imageElement = $(this);
    var src = config.image;
    var gif = config.gif;
    var isGif = config.isGif;
    var currentSrc = $imageElement.attr('src');
    var defer = $.Deferred();

    if (!src) {
      src = $imageElement.attr('muzli-lazy');
      gif = $imageElement.attr('muzli-gif');
      isGif = $imageElement.attr('muzli-is-gif');
    }

    if (currentSrc === src) {
      return $.when();
    }

    $('<img src="' + src + '"/>')
      .bind("error", function () {

        var parentTopLi = $imageElement.parents('li');

        $imageElement.parents('.tile, .instagram-tile').addClass("image-error");
        $imageElement.css({'opacity': '1'});

        if (config.fallbackImageSrc){
          $imageElement.attr('src', config.fallbackImageSrc);
        } else {
          $imageElement.attr('src', emptyImage);
        }

        parentTopLi.css({ 'background-image': 'none'});

        defer.resolve();

      })
      .bind("load", function () {

        // Do not show removed shorts
        setImage($imageElement, this.src);

        // GIF ALSO GAVE STATIC IMAGE AS SRC (.gif and .image are different)
        if (gif && src && gif !== src) {

          var parentTopLi = $imageElement.parents('li');
          var cacheImage = new Image();
          cacheImage.src = src;

          $(parentTopLi).mouseenter(function () {
            
            parentTopLi.addClass('loading-gif');
            setImage($imageElement, gif);

            $imageElement.one('load', function () {
              parentTopLi.removeClass('loading-gif');
            });
          });

          $(parentTopLi).mouseleave(function () {
            $imageElement.attr('src', src);
          });

        // GIF IS THE ONLY IMAGE
        } else if (isGif) {

          if (!imageElement.parentNode) {
            defer.resolve();
            return;
          }

          function drawCoverCanvas() {

            var parentTopLi = $imageElement.parents('li');
            var parent = $imageElement.parents('.tile .postPhoto');
            var canvas = document.createElement('canvas');

            var width = imageElement.parentNode.offsetWidth;
            var height = imageElement.parentNode.offsetHeight;

            canvas.width = width;
            canvas.height = height;

            //Use mapper function to draw cover image on canvas
            if (imageElement.complete) {
              drawImageProp(canvas.getContext('2d'), imageElement);
              parent.append(canvas);
              $imageElement.remove();
            } else {
              // Wait for the actual element fires load event, because it may take a while to render a gif
              $imageElement.one('load', function () {
                drawImageProp(canvas.getContext('2d'), imageElement);
                parent.append(canvas);
                $imageElement.remove();
              });
            }


            //Add additional listeners on Intersection to draw a canvas once it gets into viewport
            let drawCanvasListener = function() {
              drawImageProp(canvas.getContext('2d'), imageElement);
              parentTopLi.get(0).removeEventListener('drawCanvas', drawCanvasListener, false);
            }
            
            parentTopLi.get(0).addEventListener('drawCanvas', drawCanvasListener, false);
            
            intersectionObserver.observe(parentTopLi.get(0));

            $(parentTopLi).mouseenter(function () {

              $imageElement.attr('src', src);
              parent.append($imageElement);

              $imageElement.one('load', function () {
                $(canvas).hide();
              });
            });

            $(parentTopLi).mouseleave(function () {

              $imageElement.attr('src', emptyImage);
              $imageElement.remove();

              $(canvas).show();
            });
          }

          //If item has no dimensions, add a trigger to render canvas, when it gets visible
          if (!imageElement.parentNode.offsetWidth || !imageElement.parentNode.offsetHeight) {

            $imageElement.addClass('wait-for-canvas');

            $imageElement.one('loadCanvas', function() {
              $imageElement.removeClass('wait-for-canvas');
              drawCoverCanvas()
            })

          } else {

            const parentGrid = imageElement.closest('.grid');
            let gridTransparencyChecker;
            let transparencyTimeout;

            if (parentGrid) {
              gridTransparencyChecker = setInterval(() => {
  
                // Wait for grid to be visible and then draw the Canvas
                try {
                  
                  const gridOpacity = getComputedStyle(parentGrid).opacity;
                      
                  if (gridOpacity > 0) {
                    drawCoverCanvas()
                    clearInterval(gridTransparencyChecker);
                    clearTimeout(transparencyTimeout);
                  }
                  
                } catch (error) {
                  clearInterval(gridTransparencyChecker);
                }
  
              }, 10);

            }

            // If the item element is present but invisible, because of animation - the canvas will not be drawn
            // So we wait a bit, for it to become visible and then draw it.
            transparencyTimeout = setTimeout(() => {
              drawCoverCanvas()
              clearInterval(gridTransparencyChecker);
            }, 100)

          }
        }

        defer.resolve(this);

      });
    
    return defer.promise();
  }

  window.muzli.pageChange = function () {
    $('.tooltipsy').remove();
    $window.scrollTop(0);
    setTimeout(function () {
      scrollStart = false;
    }, 0);
  }

  lazyImage.$inject = ['$rootScope', '$timeout'];

  // For handling initial loading only the rest is handled by the $(window).on('resize scroll').
  function lazyImage ($rootScope, $timeout) {
    return {
      restrict: 'A',
      link: function (scope, elm, attr) {

        // scope.thumbnail - video post
        // scope.item - regular post
        // !scope.thumbnail && !scope.item - promoted post

        $rootScope.imageQueue = $rootScope.imageQueue || [];
        $rootScope.homeImageQueue = $rootScope.homeImageQueue || [];

        var itemElement = elm.closest('li');

        //Set element's offset from top, to track it's position
        if (!$rootScope.feedVisibleClass) {

          $rootScope.$watch('feedVisibleClass', function(value) {
            if (value) {
              $timeout(function() {

                var offset = itemElement.offset();

                if (offset) {
                  scope.item.offsetTop = offset.top;
                }
              });
            }
          });

        } else {

          var offset = itemElement.offset();

          if (offset) {
            scope.item.offsetTop = offset.top;
          }
        }

        //If window resizes, recalculate item position
        $(window).on('resize', function() {

          var offset = itemElement.offset();

          if (offset) {
            scope.item.offsetTop = offset.top;
          }
        });

        if (!scope.thumbnail && !scope.item) {
          
          setTimeout(function () {
            loadImage.call(elm[0])
          }, 0)

          return;
        }


        if (scope.item.vimeo && !scope.item.image && !scope.item.thumbnail) {
          return;
        }


        var imageLoader = function(params = {}) {

          loadImage.call(elm[0], {
            scope: scope,
            image: scope.item.thumbnail ? scope.item.thumbnail : scope.item.image,
            fallbackImageSrc: scope.item.fallbackImageSrc,
            gif: scope.item.thumbnail ? false : scope.item.gif,
            isGif: scope.item.thumbnail ? false : scope.item.isGif,
          })
          .done(function(imageElement) {

            // Check for broken shorts and hide them
            if (scope.item.isShort && imageElement) {
              if (imageElement.naturalHeight < 100) {
                scope.item.hidden = true;
              }
            }
            
            // Show element after ir was loaded
            if (itemElement.length) {
              itemElement[0].classList.add('show');
            }

            if (params.isInstagramImage) {
              elm.parents('.instagram')[0].classList.add('show');
              $rootScope.isInstagramLoaded = true;
            }

            // WARNING! This guard goes into a loop if it's not set
            if ($rootScope.areHomeImagesLoaded) {
              return;
            }
            
            //Remove just loaded image from initial image queue
            var index = $rootScope.homeImageQueue.indexOf(imageLoader);

            if (index !== -1) {
              $rootScope.homeImageQueue.splice(index, 1);
            }

            //Load other images if there are no more images in queue;
            if (!$rootScope.homeImageQueue.length) {

              $rootScope.$digest();
              
              //Set flag for all images to be loaded
              $timeout(() => {
                $rootScope.areHomeImagesLoaded = true;
              })

              //Flush Image queue amd Load all of the rest images 
              $timeout(() => {
                
                const imagesLeftToLoad = [...$rootScope.imageQueue];

                //Reset the queue
                $rootScope.imageQueue = [];
                
                imagesLeftToLoad.forEach((imageLoader) => {
                  imageLoader()
                })


              }, 250);
            }

          })
        }

        //If initial images are loaded, just skip queing
        if ($rootScope.areHomeImagesLoaded) {
          imageLoader();
          return;
        } 

        var isSticky = !!elm.parents('#sticky').length;
        var isInstagramImage = itemElement.is('.instagram-tile:first-child')

        if (!$rootScope.areHomeImagesLoaded) {

          //Load only visible items first
          if ((itemElement.is(':visible') && isSticky) || isInstagramImage) {

            $rootScope.homeImageQueue.push(imageLoader);

            imageLoader({
              isInstagramImage: isInstagramImage,
            });

          //Load other images into secondary to load quicker queue
          } else {
            $rootScope.imageQueue.push(imageLoader)
          }

          return;

        }


      }
    };
  }

  angular.module('feed').directive('muzliLazy', lazyImage);

})();
