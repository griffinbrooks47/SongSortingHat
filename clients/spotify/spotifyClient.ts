
/* Universal Types. */
import { Img, Genre, Artist, Album, Track } from "@/types/artist";

/* 
    Spotify Types
*/
interface SimpleAlbumResponse {
    total: number;
    items: SimpleAlbum[];
}
interface SimpleArtist {
    id: string;
    name: string;
    images: Img[];
    external_urls: {spotify: string};
    followers: {total: number};
    genres: string[];
    popularity: number;
    uri: string;
}
interface SimpleAlbum {
    album_type: string;
    total_tracks: number;
    id: string;
    images: Img[];
    name: string;
    release_date: string;
    type: string;
    artists: SimpleArtist[];
}
interface SimpleTrack {
    artists: Artist[];
    id: string;
    name: string;
    track_number: number;
    // images
    // album title
}
interface DetailedAlbumResponse {
    albums: DetailedAlbum[];
}
interface DetailedAlbum {
    total_tracks: number;
    external_urls: {
        spotify: "string"
    },
    id: string;
    images: Img[];
    name: string;
    release_date: string;
    artists: SimpleArtist[];
    tracks: {
        total: number;
        items: SimpleTrack[];
    }
}

/* 
    Wrapper for querying data from Spotify API, and converting to universal types. 
    Singleton pattern to ensure that only one instance of SpotifyClient is created.
*/
class SpotifyWrapper {

    private static instance: SpotifyWrapper;

    private id: string;
    private secret: string;
    private token: string | undefined;
    private tokenCreatedAt: Date;

    constructor(id: string, secret: string) {
        this.id = id;
        this.secret = secret;
        this.tokenCreatedAt = new Date();  // Sets to current time when instantiated
    }

    /* 
        Prisma client instance. 
        This is a singleton, so only one instance of the client will be created.
    */
    public static getInstance(): SpotifyWrapper {
        if (!SpotifyWrapper.instance) {

            /* Grab credentials from env variables. */
            const id: string | undefined = process.env.SPOTIFY_CLIENT_ID;
            const secret: string | undefined = process.env.SPOTIFY_CLIENT_SECRET;

            if (!id || !secret) {
                throw new Error("Spotify client ID and secret must be provided");
            }

            SpotifyWrapper.instance = new SpotifyWrapper(id, secret);
        }
        return SpotifyWrapper.instance;
    }

    /* 
        Given a Spotify artist id, query spotify API & return DB-safe artist object.
    */
    public async getArtist(artistId: string): Promise<Artist | null> {
        
        const token: string | null = await this.getToken();
    
        if(!token) return null;
    
        /* Get artist profile */
        const spotifyArtist: SimpleArtist = await this.queryArtist(token, artistId);
    
        /* Convert to universal artist. */
        const artist: Artist = this.parseArtist(spotifyArtist);

        /* Get artist albums & tracks. */
        const albums: Album[] | null = await this.getAlbums(artistId);
        const tracks: Track[] = [];

        /* Artist albums with singles filtered out. */
        const filteredAlbums: Album[] = [];

        /* Separate singles from albums (spotify mixes them) */
        for(const album of albums || []) {

            /* Get album artists. */
            const album_artists: Artist[] = album.artists;
            
            /* If album has one track, append as single. */
            if(album.tracks.length === 1) {
                const track: Track = {
                    artists: album_artists,
                    spotifyId: album.spotifyId,
                    title: album.title,
                    album_title: "",
                    images: album.images,

                }
                tracks.push(track);
            }

            /* If album has more than one track, append as album. */
            else {
                /* Add all album tracks. */
                tracks.push(...album.tracks);

                /* Add album to filtered albums. */
                filteredAlbums.push(album);
            }

        }

        /* Append artist discography. */
        artist.albums = filteredAlbums;
        artist.tracks = tracks;

        return artist;
    }

    /* 
        Given a Spotify artist id, query for albums by that artist. 
    */
    public async getAlbums(artistId: string): Promise<Album[] | null> {
    
        const token: string | null = await this.getToken();
    
        if(!token) return null;
    
        /* Query for simple albums by artist. */
        const simpleAlbums: SimpleAlbumResponse = await this.querySimpleAlbums(token, artistId);

        /* Parse for album IDs. */
        const albumIds: string[] = [];
        for(const simpleAlbum of simpleAlbums.items) {
            albumIds.push(simpleAlbum.id);
        }

        /* Query for detailed albums. */
        const detailedAlbums: DetailedAlbumResponse = await this.queryDetailedAlbums(token, albumIds);

        /* Convert simple tracks to database tracks. */
        const albums: Album[] = [];
        for(const detailedAlbum of detailedAlbums.albums) {

            /* Convert artist objects. */
            const artists: Artist[] = []
            for(const simpleArtist of detailedAlbum.artists) {
                artists.push(this.parseArtist(simpleArtist));
            }

            const imgs: Img[] = detailedAlbum.images;
            const album_title = detailedAlbum.name;

            const tracks: Track[] = [];
            for(const simpleTrack of detailedAlbum.tracks.items) {
                tracks.push(this.parseTrack(simpleTrack, album_title, imgs))
            }   

            /* Convert album. */
            const album: Album = {
                total_tracks: detailedAlbum.total_tracks,
                external_urls: detailedAlbum.external_urls,
                spotifyId: detailedAlbum.id,
                images: detailedAlbum.images,
                title: detailedAlbum.name,
                release_date: detailedAlbum.release_date,
                artists: artists,
                tracks: tracks,
            }

            albums.push(album);
            
        }
        return albums;
    }

    /* 
        Return API token, given developer ID & Secret
    */
    private async getToken(): Promise<string | null> {

        /* Use token if still valid. */
        if(this.token && (Date.now() - this.tokenCreatedAt.getTime()) / (1000 * 60) < 30) {
            return this.token;
        }
    
        /* Encode auth string into base 64. */
        const authString = `${this.id}:${this.secret}`;
        const authBase64 = btoa(authString); // Works in both Node.js (with global `btoa`) and browser
    
        const url = "https://accounts.spotify.com/api/token";
    
        /* Add the authString to the request headers. */
        const headers = {
            'Authorization': `Basic ${authBase64}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    
        /* Properly format the request body */
        const data = new URLSearchParams();
        data.append("grant_type", "client_credentials");
    
        /* Initiate token post request. */
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: data.toString(), // Corrected encoding
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const jsonResult = await response.json();
            const token: string = jsonResult["access_token"];

            this.token = token;

            return token;
        } catch (error) {
            console.error("Error fetching token:", error);
            throw error; // Ensure caller knows an error occurred
        }
    } 

    /* 
        Create auth headers given API token. 
    */
    private getAuthHeaders(token: string): HeadersInit {
        return {
            'Authorization': `Bearer ${token}`
        };
    }
       
    /* 
        Requests artist information from spotify API
        Input: Spotify API token (string), artist ID (string)
        Returns: Artist (Artist object)
    */
    private async queryArtist(token: string, artistId: string): Promise<SimpleArtist> {

        const url = "https://api.spotify.com/v1/artists/" + artistId;
        const headers = this.getAuthHeaders(token);

        const response = await fetch(`${url}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artist: ${response.statusText}`);
        }

        const jsonResult: SimpleArtist = await response.json();

        return jsonResult;
    }

    private async querySimpleAlbums(token: string, artistId: string): Promise<SimpleAlbumResponse>{

        const url = "https://api.spotify.com/v1/artists/" + artistId + "/albums";
        const headers = this.getAuthHeaders(token);
    
        const response = await fetch(`${url}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artist: ${response.statusText}`);
        }
    
        const jsonResult: SimpleAlbumResponse = await response.json();
    
        return jsonResult;
    }

    /* Includes tracks. */
    private async queryDetailedAlbums(token: string, albumIds: string[]): Promise<DetailedAlbumResponse> {
    
        let albumQuery = "";
        for (const albumId of albumIds.slice(0, 20)) {
            albumQuery += albumId + ",";
        }
        albumQuery = albumQuery.slice(0, -1);
    
        const url = `https://api.spotify.com/v1/albums?ids=${albumQuery}`;
    
        const headers = this.getAuthHeaders(token);
    
        const response = await fetch(`${url}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artist: ${response.statusText}`);
        }
        const jsonResult: DetailedAlbumResponse = await response.json();
    
        return jsonResult;
    }

    private parseArtist(simpleArtist: SimpleArtist): Artist {

        /* Package Imgs */
        const artistImgs: Img[] = [];
        if(simpleArtist.images){
            for(const img of simpleArtist.images) {
                const artistImg: Img = {
                    width: img.width,
                    height: img.height,
                    url: img.url,
                }
                artistImgs.push(artistImg)
            }
        }

        /* Package genres. */
        const artistGenres: Genre[] = [];
        if(simpleArtist.genres) {
            for(const genre of simpleArtist.genres) {
                const artistGenre: Genre = {
                    name: genre
                }
                artistGenres.push(artistGenre)
            }
        }

        /* Package Followers */
        const followers: number = simpleArtist.followers ? simpleArtist.followers.total : 0;

        /* Create DB artist. */
        const artist: Artist = {
            spotifyId: simpleArtist.id,
            name: simpleArtist.name,
            images: artistImgs,
            genres: artistGenres,
            external_urls: simpleArtist.external_urls,
            followers: followers, 
            albums: [],
            tracks: [],   
        }

        return artist;
    }

    private parseTrack(simpleTrack: SimpleTrack, album_title: string, imgs: Img[]): Track {

        const track: Track = {
            artists: simpleTrack.artists,
            spotifyId: simpleTrack.id,
            title: simpleTrack.name,
            album_title: album_title,
            images: imgs,
        }

        return track;
    }

}
export default SpotifyWrapper.getInstance();