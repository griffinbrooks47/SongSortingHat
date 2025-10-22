/* 
    Artist
*/
export type Artist = {
    /* Identifiers */
    id?: string; // Query SSH Database
    spotifyId: string; // Query Spotify API
    
    /* Metadata */
    name: string;
    followers: number;
    external_urls: {
        spotify?: string;
    };

    /* Artist Music Data */
    albums?: Album[];
    tracks?: Track[];
    genres?: Genre[];

    /* Images */
    images?: Img[];
};

/* 
    Album
*/
export type Album = {
    /* Identifiers */
    id?: string; // Query SSH Database
    spotifyId: string; // Query Spotify API

    /* Metadata */
    title: string;
    total_tracks: number;
    album_type: string; // album, single, compilation
    release_date: string;
    external_urls: {
        spotify?: string;
    },

    /* Artists */
    artists: Artist[];

    /* Included Tracks */
    tracks: Track[];
    
    /* Images */
    images: Img[];
}

/* 
    Track
*/
export type Track = {
    /* Identifiers */
    id?: string; // Query SSH Database
    spotifyId: string; // Query Spotify API

    /* Metadata */
    title: string;
    album_title: string; // Empty if single

    /* Track Artists */
    artists: Artist[];

    /* Track Images */
    images: Img[];
}

/* 
    Genre
*/
export interface Genre {
    id?: string;
    name: string;
}

/* 
    Images
*/
export interface Img {
    width: number;
    height: number;
    url: string;
}