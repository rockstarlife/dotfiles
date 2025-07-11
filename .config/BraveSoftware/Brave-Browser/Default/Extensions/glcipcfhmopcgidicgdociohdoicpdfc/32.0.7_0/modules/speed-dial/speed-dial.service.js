angular.module('speed-dial').factory('speedDialService', ['$rootScope', '$http', 'server', 'storage', 'userService',
    function ($rootScope, $http, server, storage, userService) {

        const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

        const permissions = {
            topSites: false,
            bookmarks: false,
        };

        let customLinks = [];

        chrome?.permissions?.getAll().then(response => {
            permissions.topSites = response.permissions.includes('topSites');
            permissions.bookmarks = response.permissions.includes('bookmarks');
        })

        const pushSDLinks = (links) => {

            userService.getData().then(user => {  
                if (user.syncSDLinks) {
                    userService.setData({
                        sdLinks: links.map(({title, type, url}) => {
                            return {
                                title,
                                type,
                                url,
                            }
                        })
                    })
                    .then(() => {
                        storage.set({lastSDUpdate: (new Date()).toISOString()}, true)
                    })
                }
            })    

        }

        const updateLinks = (links) => {

            pushSDLinks(links);

            return storage.set({speedDialLinks: links}, true)
                .then(() => {

                    customLinks = links;
                    $rootScope.speedDialLinks = customLinks;

                    return customLinks;
                });
        }

        const syncServerLinks = () => {
            return $http.get(server() + '/user/sd_links').then(async (response) =>  {
                if (response?.data?.length) {

                    const links = await Promise.all(response.data.map(async link => {

                        const domain = link.url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];

                        return new Promise(async (resolve) => {
                            resolve({
                                ...link,
                                icon: await generateFavIconUrl(link.url),
                                domain: domain,
                            })
                        });

                    }))
                        
                    storage.set({
                        lastSDUpdate: (new Date()).toISOString(),
                        speedDialLinks: links,
                    }, true).then(() => {
                        customLinks = links;
                        $rootScope.speedDialLinks = customLinks;    
                    });
        
                }
            })
        }

        const generateFavIconUrl = async (linkUrl) => {

            const iconUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(linkUrl)}&size=128&drop_404_icon=true`

            return new Promise(function (resolve, reject) {

                let img = new Image();
                
                img.onerror = img.onabort = function () {
                    resolve(getLocalFaviconUrl(linkUrl));
                };
      
                img.onload = function () {
                    resolve(iconUrl);
                };
      
                img.src = iconUrl;
            });

        };

        const getLocalFaviconUrl = (u) => {
            
            if (isOpera || !chrome?.runtime?.getURL) {
                return false;
            }

            const url = new URL(chrome.runtime.getURL("/_favicon/"));
            url.searchParams.set("pageUrl", u);
            url.searchParams.set("size", "50");
            return url.toString();
            
        };

        // API METHODS
        return {
            generateFavIconUrl,
            getLocalFaviconUrl,
            pushSDLinks,

            getPermissions: async () => {
                return permissions;
            },

            requestPermissions: async (permissionName) => {

                const permissionList = [permissionName]

                if (isOpera) {
                    //No working permissions for Opera
                } else {
                    permissionList.push('favicon');
                }

                return new Promise((resolve, reject) => {
                    chrome.permissions.request({
                        permissions: permissionList,
                    }, (granted) => {
                        // The callback argument will be true if the user granted the permissions.
                        if (granted) {
                            permissions[permissionName] = true;
                        } else {
                            permissions[permissionName] = false;
                        }

                        resolve(permissions[permissionName])
                    });
                })
            },

            getCustomLinks: async () => {
                return storage.get(['customLinks', 'speedDialLinks', 'syncSDLinks', 'lastSDUpdate'], true).then(async (storageData) => {

                    // Check if links are obsolete, and update them from server
                    userService.getData().then(user => {     
                        
                        // Check if SD sync enabled                   
                        if (user?.events?.sdUpdated && user.syncSDLinks) {

                            // Check if SD links are our of sync and update them
                            if (!storageData.lastSDUpdate || new Date(user?.events?.sdUpdated) >= new Date(storageData.lastSDUpdate)) {
                                syncServerLinks();
                            }
                        }
                    })

                    customLinks = storageData.speedDialLinks || storageData.customLinks || [];

                    //Clean up deprecated storage parameter
                    if (storageData.customLinks && storageData.speedDialLinks) {
                        storage.remove('customLinks')
                    }

                    return customLinks;
                });
            },

            getBookMarks: async () => {
                return new Promise((resolve, reject) => {
                    if (chrome && chrome.bookmarks) {
                        chrome.bookmarks.getTree((tree) => {
                            resolve(tree[0]?.children[0]?.children)
                        });
                    } else {
                        resolve([]);
                    }
                })
            },

            getTopSites: async () => {
                return new Promise((resolve, reject) => {
                    if (chrome && chrome.topSites) {
                        chrome.topSites.get((data) => {
                            resolve(data);
                        });
                    } else {
                        resolve([]);
                    }
                });
            },

            addLink: async (link) => {

                const domain = link.url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
                const newLink = {
                    ...link,
                    icon: await generateFavIconUrl(link.url),
                    domain: domain,
                }

                return updateLinks([...customLinks, newLink]);
                
            },

            removeLink: async (linkIndex) => {
                customLinks.splice(linkIndex, 1); // 2nd parameter means remove one item only
                return updateLinks(customLinks);
            },

            updateLink: async (link) => {
                
                const linkToUpdate = customLinks.find(_link => _link === link);
                
                linkToUpdate.domain = linkToUpdate.url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
                linkToUpdate.icon = await generateFavIconUrl(linkToUpdate.url);

                return updateLinks(customLinks);
            },

            addMultipleLinks: async (links) => {

                await Promise.all(links.map(async (link) => {
                    link.icon = await generateFavIconUrl(link.url);
                }))

                return updateLinks([...customLinks, ...links]);
            },

            removeMultipleLinks: async (condition) => {   
                return updateLinks(customLinks.filter(link => {
                    return link.type !== condition.type;
                }))
            },

            updateStorageLinkOrder: async (links) => {
                return updateLinks(links);
            }


        }

    }
]);


