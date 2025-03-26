
/* 
    Interfaces used to handle spotify artist data. 
*/

export interface Artist {
    id: string;
    name: string;
    images: Img[];
    external_urls: {spotify: string};
    followers: {total: number};
    genres: string[];
    popularity: number;
}
export interface Img {
    width: number;
    height: number;
    url: string;
}
export interface Album {
    album_type: string;
    total_tracks: number;
    id: string;
    images: Img[];
    name: string;
    release_date: string;
    type: string;
    artists: Artist[];
}
export interface DetailedAlbum {
    total_tracks: number;
    external_urls: {
        spotify: "string"
    },
    id: string;
    images: Img[];
    name: string;
    release_date: string;
    artists: Artist[];
    tracks: {
        total: number;
        items: Track[];
    }
}
export interface Track {
    artists: Artist[];
    id: string;
    name: string;
    track_number: number;
}
export interface DetailedTrack {
    track: Track;
    album_title: string;
    cover: Img;
}