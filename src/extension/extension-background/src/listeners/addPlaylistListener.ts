import { createStore } from "@hls-downloader/core/lib/adapters/redux/configure-store";
import { playlistsSlice } from "@hls-downloader/core/lib/adapters/redux/slices";
import { browser } from "webextension-polyfill-ts";

export function addPlaylistListener( store: ReturnType<typeof createStore> ) {
    var makeName = function( program: string, ep: string ) {
        var result = '';
        var eps = ep.split( '-' );
        result = program.replace(
            '월화 드라마 ', '' ).replace(
            '수목 드라마 ', '' ).trim();
        for ( var i = 0; i < eps.length; i++ ) {
            if ( i == 0 && /\d/.test( result ) ) {
                result += "-S01E";
            } else {
                result += "-E";
            }
            result += eps[i].padStart( 2, '0' );
        }
        return result;
    }

    var callRemote = function( url: string, cb: ( json: any ) => void ) {
        var xhr = new XMLHttpRequest();
        xhr.open( "GET", url, true );
        xhr.onreadystatechange = function() {
            if ( xhr.readyState == 4 ) {
                cb( xhr.responseText );
            }
        }
        xhr.send();
    }

    let pooqUrl: { [k: string]: string } = {};
    browser.webRequest.onCompleted.addListener(
        async ( details ) => {
            if ( details.tabId < 0 ) {
                return;
            }
            pooqUrl[details.url.split( "/" )[6].split( "?" )[0]] = details.url;
        },
        {
            urls: ["https://apis.pooq.co.kr/vod/contents/*", "https://apis.wavve.com/*/vod/contents/*"]
        }
    );

    browser.webRequest.onResponseStarted.addListener(
        async ( details ) => {
            if ( details.tabId < 0 ) {
                return;
            }
            const tab = await browser.tabs.get( details.tabId );

            await browser.browserAction.setIcon( {
                tabId: tab.id,
                path: {
                    "16": "assets/icons/16-new.png",
                    "48": "assets/icons/48-new.png",
                    "128": "assets/icons/128-new.png",
                    "256": "assets/icons/256-new.png",
                },
            } );

            if ( details.url
                .indexOf( 'wavve.com' ) > -1 ) {
                var contentId;
                if ( details.url.indexOf( 'event.pca' ) > -1 ) {
                    contentId = details.url.split( "/" )[8];
                } else {
                    contentId = details.url.split( "/" )[5];
                }
                await callRemote( pooqUrl[contentId], function( resp ) {
                    let json = JSON.parse( resp );
                    store.dispatch(
                        playlistsSlice.actions.addPlaylist( {
                            id: details.url,
                            uri: details.url,
                            initiator: tab.url,
                            pageTitle: makeName( json.programtitle, json.episodenumber ),
                            createdAt: Date.now(),
                        } )
                    );
                } );
                return;
            } else if ( details.url.indexOf( 'tving.com' ) > -1 ) {
                browser.tabs.sendMessage( details.tabId, {
                    url: details.url
                } ).then( data => {
                    console.log( data );
                    store.dispatch(
                        playlistsSlice.actions.addPlaylist( {
                            id: details.url,
                            uri: details.url,
                            initiator: tab.url,
                            pageTitle: makeName( data.title, data.ep ),
                            createdAt: Date.now(),
                        } )
                    );
                } );
                return;
            }

            store.dispatch(
                playlistsSlice.actions.addPlaylist( {
                    id: details.url,
                    uri: details.url,
                    initiator: tab.url,
                    pageTitle: tab.title,
                    createdAt: Date.now(),
                } )
            );
        },
        {
            types: ["xmlhttprequest"],
            urls: [
                "http://*/*.m3u8",
                "https://*/*.m3u8",
                "http://*/*.m3u8?*",
                "https://*/*.m3u8?*",
            ],
        }
    );
}

