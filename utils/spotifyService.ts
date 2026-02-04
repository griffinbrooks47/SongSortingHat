
/* Spotify Types */

export type SpotifyArtist = {
    id: string;
    name: string;
    images: SpotifyImage[];
    external_urls: {
        spotify: string
    };
    followers: {
        total: number
    };
    genres: string[];
    popularity: number;
    uri: string;
}

type SimpleSpotifyAlbumResponse = {
    total: number;
    items: SimpleSpotifyAlbum[];
}
type SimpleSpotifyAlbum = {
    album_type: string;
    total_tracks: number;
    id: string;
    images: SpotifyImage[];
    name: string;
    release_date: string;
    type: string;
    artists: SpotifyArtist[];
}
type SpotifyAlbumResponse = {
    albums: SpotifyAlbum[];
}
type SpotifyAlbum = {
    total_tracks: number;
    external_urls: {
        spotify: string;
    },
    id: string;
    images: SpotifyImage[];
    name: string;
    release_date: string;
    artists: SpotifyArtist[];
    tracks: {
        total: number;
        items: SpotifyTrack[];
    }
}

/* Wrapper type for albums: splits full albums and singles*/
export type SpotifyAlbums = {
    albums: SpotifyAlbum[];
    singles: SpotifyAlbum[];
}

type SpotifyTrack = {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    track_number: number;
    duration: number;
}

export interface SpotifyImage {
    width: number;
    height: number;
    url: string;
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
        this.tokenCreatedAt = new Date();
    }
    public static getInstance(): SpotifyWrapper {
        
        if (!SpotifyWrapper.instance) {
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
        Given a Spotify artist id, query for artist information.
    */
    public async getArtist(artistId: string): Promise<SpotifyArtist | null> {
        const token: string | null = await this.getToken();
        if(!token) return null;
        
        const spotifyArtist: SpotifyArtist = await this.queryArtist(token, artistId);

        return this.parseArtist(spotifyArtist);
    }
    public async getArtists(artistIds: string[]): Promise<SpotifyArtist[] | null> {
        const token: string | null = await this.getToken();
        if(!token) return null;

        const artists: SpotifyArtist[] = await this.queryArtists(token, artistIds);

        return artists.map(artist => this.parseArtist(artist));
    }
    private parseArtist(spotifyArtist: SpotifyArtist): SpotifyArtist {

        /* Package Imgs */
        let artistImages: SpotifyImage[] = [];
        if (spotifyArtist.images && spotifyArtist.images.length > 0) {
            const largestImg = spotifyArtist.images.reduce((max, img) => 
                img.width > max.width ? img : max
            );
            artistImages = [{
                width: largestImg.width,
                height: largestImg.height,
                url: largestImg.url,
            }];
        }
        spotifyArtist.images = artistImages;

        /* Package Followers */
        const followers: number = spotifyArtist.followers ? spotifyArtist.followers.total : 0;
        spotifyArtist.followers = {
            total: followers
        };

        return spotifyArtist;
    }

    /* 
        Given a Spotify artist id, query for albums by that artist. 
    */
    public async getAlbums(artistId: string): Promise<SpotifyAlbums | null> {

        const token: string | null = await this.getToken();
        if(!token) return null;
    
        const albumIds: string[] = [];

        /* QUERY ALBUMS */
        
        const simpleAlbums: SimpleSpotifyAlbumResponse = await this.querySimpleAlbums(token, artistId);
        for(const simpleAlbum of simpleAlbums.items) {
            albumIds.push(simpleAlbum.id);
        }

        const detailedAlbums: SpotifyAlbumResponse = await this.queryDetailedAlbums(token, albumIds);

        /* Convert simple tracks to database tracks. */
        const albums: SpotifyAlbum[] = [];
        for(const detailedAlbum of detailedAlbums.albums) {

            /* Artists */
            const artists: SpotifyArtist[] = []
            for(const simpleArtist of detailedAlbum.artists) {
                artists.push(this.parseArtist(simpleArtist));
            }

            /* Images */
            let albumImages: SpotifyImage[] = [];
            if (detailedAlbum.images?.length) {
                const largestImg = detailedAlbum.images.reduce((max, img) =>
                    img.width > max.width ? img : max
                );
                albumImages = [{
                    width: largestImg.width,
                    height: largestImg.height,
                    url: largestImg.url,
                }];
            }

            /* Tracks */
            const tracks: SpotifyTrack[] = [];
            for(const simpleTrack of detailedAlbum.tracks.items) {
                const spotifyTrack: SpotifyTrack = {
                    id: simpleTrack.id,
                    name: simpleTrack.name,
                    artists: simpleTrack.artists.map(artist => this.parseArtist(artist)),
                    track_number: simpleTrack.track_number,
                    duration: simpleTrack.duration,
                } satisfies SpotifyTrack;
                tracks.push(spotifyTrack);
            }   

            const spotifyAlbum: SpotifyAlbum = {
                id: detailedAlbum.id,
                name: detailedAlbum.name,
                total_tracks: detailedAlbum.total_tracks,
                release_date: detailedAlbum.release_date,
                external_urls: {
                    spotify: detailedAlbum.external_urls.spotify
                },
                artists: detailedAlbum.artists,
                images: detailedAlbum.images,
                tracks: detailedAlbum.tracks,
            } satisfies SpotifyAlbum;

            albums.push(spotifyAlbum);
        }

        /* PROCESS ALBUMS & TRACKS */

        const fullAlbums: SpotifyAlbum[] = [];
        const singles: SpotifyAlbum[] = [];

        for(const album of albums || []) {
            
            /* If album has one track, append as single. */
            if(this.categorizeAlbum(album) === "single") {
                singles.push(album);
            }

            /* If album has more than one track, append as album. */
            else {
                fullAlbums.push(album);
            }

        }

        /* Append artist discography. */
        return {
            albums: fullAlbums,
            singles: singles
        };

    }

    private categorizeAlbum(detailedAlbum: SpotifyAlbum): "album" | "single" | "compilation" {
        const track_count = detailedAlbum.total_tracks;
        const tracks = detailedAlbum.tracks.items;

        // Very few tracks = single
        if (track_count < 3) {
            return "single";
        }

        // For 3-10 tracks, check if they're all versions of the same song
        if (track_count <= 6) {
            const cleanedNames = tracks.map(track => this.cleanTrackName(track.name));
            const uniqueSongs = this.countUniqueSongs(cleanedNames);

            // If most tracks are the same song, it's a single
            if (uniqueSongs <= 2) {
                return "single";
            }

            // If we have decent variety, it's an album
            return "album";
        }

        // More than 10 tracks = album
        return "album";
    }
    private cleanTrackName(name: string): string {
        let cleaned = name.toLowerCase().trim();

        cleaned = cleaned.replace(/\([^)]*\)/g, '');
        cleaned = cleaned.replace(/\[[^\]]*\]/g, '');

        const keywords = ['remix', 'mix', 'edit', 'acoustic', 'live', 'instrumental',
                        'radio', 'extended', 'remaster', 'feat', 'ft', 'featuring'];

        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            cleaned = cleaned.replace(regex, '');
        });

        cleaned = cleaned.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
        return cleaned;
    }
    private countUniqueSongs(cleanedNames: string[]): number {
        const groups: string[][] = [];
        const used = new Set<number>();

        for (let i = 0; i < cleanedNames.length; i++) {
            if (used.has(i) || !cleanedNames[i]) continue;

            const group = [cleanedNames[i]];
            used.add(i);

            for (let j = i + 1; j < cleanedNames.length; j++) {
                if (used.has(j) || !cleanedNames[j]) continue;

                // Check if tracks are very similar (75% threshold)
                if (this.areSimilar(cleanedNames[i], cleanedNames[j], 0.75)) {
                    group.push(cleanedNames[j]);
                    used.add(j);
                }
            }

            groups.push(group);
        }

        return groups.length;
    }
    private areSimilar(str1: string, str2: string, threshold: number): boolean {
        if (str1 === str2) return true;
        if (!str1 || !str2) return false;

        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return true;

        const editDistance = this.levenshteinDistance(longer, shorter);
        const similarity = (longer.length - editDistance) / longer.length;

        return similarity >= threshold;
    }
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2[i - 1] === str1[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
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
    private async queryArtist(token: string, artistId: string): Promise<SpotifyArtist> {

        const url = "https://api.spotify.com/v1/artists/" + artistId;
        const headers = this.getAuthHeaders(token);

        const response = await fetch(`${url}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artist: ${response.statusText}`);
        }

        const jsonResult: SpotifyArtist = await response.json();

        return jsonResult;
    }

    private async queryArtists(token: string, artistIds: string[]): Promise<SpotifyArtist[]> {

        let artistQuery = "";
        for (const artistId of artistIds.slice(0, 50)) {
            artistQuery += artistId + ",";
        }
        artistQuery = artistQuery.slice(0, -1);

        const url = `https://api.spotify.com/v1/artists?ids=${artistQuery}`;

        const headers = this.getAuthHeaders(token);

        const response = await fetch(`${url}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artists: ${response.statusText}`);
        }
        const jsonResult = await response.json();

        return jsonResult.artists as SpotifyArtist[];
    }

    private async querySimpleAlbums(token: string, artistId: string): Promise<SimpleSpotifyAlbumResponse>{

        const url = "https://api.spotify.com/v1/artists/" + artistId + "/albums?include_groups=album,single";
        const headers = this.getAuthHeaders(token);
    
        const response = await fetch(`${url}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artist: ${response.statusText}`);
        }
    
        const jsonResult: SimpleSpotifyAlbumResponse = await response.json();
    
        return jsonResult;
    }

    /* Includes tracks. */
    private async queryDetailedAlbums(token: string, albumIds: string[]): Promise<SpotifyAlbumResponse> {
    
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
        const jsonResult: SpotifyAlbumResponse = await response.json();
    
        return jsonResult;
    }

}
export default SpotifyWrapper.getInstance();