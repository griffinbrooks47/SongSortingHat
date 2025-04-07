
/* 
    Images
*/
export interface Img {
    width: number;
    height: number;
    url: string;
}

/* 
    Artist
*/
export interface Artist {
    spotifyId: string;
    name: string;
    images: Img[];
    external_urls: {
        spotify: string;
    };
    followers: number;
    genres: Genre[];
    albums: Album[];
    tracks: Track[];
};

/* 
    Genre
*/
export interface Genre {
    id?: string;
    name: string;
}
  

/* 
    Album
*/
export interface Album {
    spotifyId: string;
    total_tracks: number;
    external_urls: {
        spotify: "string"
    },
    name: string;
    release_date: string;

    images: Img[];
    artists: Artist[];
    tracks: {
        total: number;
        items: Track[];
    }
}

/* 
    Track
*/
export interface Track {
    artists: Artist[];
    spotifyId: string;
    name: string;
    track_number: number;
    album_title: string;
    images: Img[];
}

/* 
    Sorting
export interface Sorting {

}
*/