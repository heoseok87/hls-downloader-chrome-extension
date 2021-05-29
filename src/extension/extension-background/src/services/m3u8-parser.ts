/// <reference path="m3u8-parser.d.ts" />

import { Fragment, Level } from "@hls-downloader/core/lib/entities";
import { IParser } from "@hls-downloader/core/lib/services";
import { Parser } from "m3u8-parser";
import { buildAbsoluteURL } from "url-toolkit";
import { v4 } from "uuid";

export const M3u8Parser: IParser = {
    parseLevelPlaylist( string: string, baseurl: string ): Fragment[] {
        const parser = new Parser();
        parser.push( string );
        parser.end();

        let ivTemp = new Uint8Array( 16 );
        ivTemp[15] = parser.manifest.mediaSequence;
        // https://stackoverflow.com/a/50684313/3610856
        // HLS 스펙에 따르면 IV가 없는 경우, EXT-X-MEDIA-SEQUENCE 값으로 대체할 수 있다.

        return parser.manifest.segments.map(( segment, index ) => ( {
            index,
            key: segment.key
                ? {
                    iv: segment.key.iv ? segment.key.iv : ivTemp,
                    uri: buildAbsoluteURL( baseurl, segment.key.uri ),
                }
                : {
                    iv: null,
                    uri: null,
                },
            uri: buildAbsoluteURL( baseurl, segment.uri ),
        } ) );
    },
    parseMasterPlaylist( string: string, baseurl: string ): Level[] {
        const parser = new Parser();

        parser.push( string );
        parser.end();

        const playlists = parser.manifest ?.playlists ?? [];
        return playlists.map(( playlist, index ) => ( {
            index,
            id: v4(),
            playlistID: baseurl,
            bitrate: playlist.attributes.BANDWIDTH,
            height: playlist.attributes.RESOLUTION ?.height,
            width: playlist.attributes.RESOLUTION ?.width,
            uri: buildAbsoluteURL( baseurl, playlist.uri ),
        } ) );
    },
};
