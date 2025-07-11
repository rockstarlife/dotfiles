angular.module('search').directive('lookahead', ['$rootScope', 'sources_list', 
    function ($rootScope, sources_list) {
        return {
            restrict: 'A',
            link: function (scope, element) {

                const searchFrame = document.createElement('iframe');
                let isSearchFrameLoaded = false;

                searchFrame.src = window.MUZLI_WEBSITE_URL + '/searchsuggestions';
                searchFrame.id = 'search-frame';
                searchFrame.width = 1;
                searchFrame.height = 1;
                searchFrame.frameBorder = 0;
                searchFrame.allow = 'attribution-reporting';

                //Override close event to keep autocomplete open if user clicks on .preventBlur class
                $.widget('ui.autocomplete', $.ui.autocomplete, {
                    _close: function(event) {

                        let _this = this;

                        if (!event || event.closeNow) {
                            return _this._super( event );
                        }

                        return setTimeout(() => {
                            if (!$(document.activeElement).is('.preventBlur')) {
                                event.closeNow = true;
                                _this.close(event); 
                            }
                        })
                    }
                });
                
                element.autocomplete({
                    search: () => {
                        if (!document.getElementById('search-frame') && $rootScope.activeSearch === 'google') {
                            document.body.append(searchFrame);
                        }
                    },
                    classes: {
                        'ui-autocomplete': element.parents('header').length ? 'header-autocomplete' : '',
                    },
                    appendTo: '.search-container form',
                    position: {
                        of: '.search-container',
                    },
                    source: async function(request, response) {

                        $('.tabs.sticky').hide();

                        if ($rootScope.activeSearch === 'muzli') {

                            let sources = sources_list
                                .filter(source => {
                                    return source.title.toLowerCase().indexOf(request.term.toLowerCase()) !== -1
                                })
                                .sort((a, b) => {
                                    return a.title.toLowerCase().indexOf(request.term.toLowerCase()) - b.title.toLowerCase().indexOf(request.term.toLowerCase())
                                })
                                .splice(0, 3);

                                let suggestions = window.MUZLI_SUGGESTIONS.filter(suggestion => suggestion.startsWith(request.term.toLowerCase()))

                                response([...sources, ...suggestions.splice(0, 15), {settings: true}]);        

                            return;

                        }
                        
                        if ($rootScope.activeSearch === 'google') {

                            function listenIframeMessage(e) {
                                response([...e.data?.suggestions?.splice(0, 15), {settings: true}]);
                                window.removeEventListener('message', listenIframeMessage);
                            }
            
                            // Listen to message from child window
                            window.addEventListener('message', listenIframeMessage, false);

                            // If iframe is not loaded yet, wait for it to load, otherwise just send a message
                            if (isSearchFrameLoaded) {
                                searchFrame.contentWindow?.postMessage({
                                    q: request.term.toLowerCase()
                                }, window.MUZLI_WEBSITE_URL)
                            } else {
                                searchFrame.onload = () => {

                                    isSearchFrameLoaded = true;

                                    searchFrame.contentWindow?.postMessage({
                                        q: request.term.toLowerCase()
                                    }, window.MUZLI_WEBSITE_URL)
                                }
                            }

                            return;
                        }




                    },
                    minLength: 1,
                    select: function(event, ui) {

                        if (ui.item.name) {
                            $rootScope.clickSource(ui.item)
                            return;
                        }

                        if (ui.item.settings) {
                            $rootScope.openMenu('searchSettings');
                            return;
                        }

                        var value = ui.item.label;

                        $rootScope.focusedSearchInput = element;
                        $rootScope.search(value);
                    },
                    open: function(ui) {
                        ui.target.closest('.search-container')?.classList.add('ui-open');
                    },
                    close: function(ui) {
                        ui.target.closest('.search-container')?.classList.remove('ui-open');
                        $('.tabs.sticky').show();
                    }
                })
            }
        };
    }
]);
