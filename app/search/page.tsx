import { SearchBar } from "./components/search";
import { Results } from "./components/results";

import useArtistStore from "@/stores/artist";

interface Image {
    url: string;
    height: number;
    width: number;
}
interface Artist {
    id: string;
    name: string;
    images: Image[];
}
interface Image {
    width: number;
    height: number;
    url: string;
}
interface TrackJSON {
    id: string;
    name: string;
    artists: Artist[];
}
interface AlbumJSON {
    id: string;
    name: string;
    album_type: "album" | "single" | "compilation";
    images: Image[];
    artists: Artist[];
    tracks: { items: TrackJSON[] };
}
interface SpotifySearchResponse {
    artists: {
        items: Artist[];
    };
}
interface SpotifyAlbumsResponse {
    items: AlbumJSON[];
}
interface SpotifyAlbumsTracksResponse {
    albums: AlbumJSON[];
}
interface Album {
    id: string;
    name: string;
    album_type: "album" | "compilation" | "single";
    cover: string;
    artists: Artist[];
    tracks: Track[];
}
interface Track {
    id: string;
    name: string;
    cover: string;
    artists: Artist[];
}
interface ArtistData {
    artist: Artist;
    albums: Album[];
    singles: Track[];
}

export default async function Search(props: {
    searchParams?: Promise<{
        artist?: string;
    }>;
}){

    /* Spotify API Functions. */
    async function getToken(clientId: string | undefined, clientSecret: string | undefined): Promise<string | null> {

        if(clientId === undefined || clientId === undefined){
            return null;
        }

        /* Encode auth string into base 64. */
        const authString = `${clientId}:${clientSecret}`;
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
            return token;
        } catch (error) {
            console.error("Error fetching token:", error);
            throw error; // Ensure caller knows an error occurred
        }
    }    
    async function getAuthHeaders(token: string): Promise<HeadersInit> {
        return {
            'Authorization': `Bearer ${token}`
        };
    }
    
    async function searchForArtist(token: string, artistName: string): Promise<Artist[] | undefined> {
        const url = "https://api.spotify.com/v1/search";
        const headers = await getAuthHeaders(token);
    
        const params = new URLSearchParams({
            q: artistName,
            type: "artist",
            limit: "12"
        });
    
        const response = await fetch(`${url}?${params.toString()}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artist: ${response.statusText}`);
        }
    
        const jsonResult: SpotifySearchResponse = await response.json();
        return jsonResult.artists?.items;
    }
    
    async function getAlbumsByArtistName(token: string, artistId: string): Promise<SpotifyAlbumsTracksResponse> {
        const headers = await getAuthHeaders(token);
        
        // Fetch artist albums
        const albumsResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums`, { headers });
        if (!albumsResponse.ok) {
            throw new Error(`Error fetching albums: ${albumsResponse.statusText}`);
        }
    
        const albumsJson: SpotifyAlbumsResponse = await albumsResponse.json();


        const albumIds = albumsJson.items.map(album => album.id).join(",");
    
        if (!albumIds) {
            throw new Error(`No albums found for artist ID: ${artistId}`);
        }
    
        // Fetch tracks in the albums
        const tracksResponse = await fetch(`https://api.spotify.com/v1/albums?ids=${albumIds}`, { headers });
        if (!tracksResponse.ok) {
            throw new Error(`Error fetching tracks: ${tracksResponse.statusText}`);
        }
    
        return await tracksResponse.json() as SpotifyAlbumsTracksResponse;
    }

    function parseJson(data: SpotifyAlbumsTracksResponse) {
        const albums: Album[] = [];
        const singles: Track[] = [];
      
        for (const album of data.albums) {
            const id = album.id;
            const name = album.name;
            const albumType = album.album_type;
            const cover = album.images[0]?.url ?? "";
            const artists = album.artists;

            const trackJSONs: TrackJSON[] = album.tracks.items;
            
            // Assuming you want to keep track of artists for the album and tracks
            const albumArtists: Artist[] = album.artists;
        
            if (albumType === "album" || albumType === "compilation") {

                const tracks: Track[] = [];
                for(const trackJSON of trackJSONs) {
                    const track: Track = {
                        id: trackJSON.id,
                        name: trackJSON.name,
                        cover: cover, 
                        artists: trackJSON.artists,
                    }
                    tracks.push(track)
                }

                // Parse tracks for albums
                const albumData: Album = {
                    id,
                    name,
                    album_type: albumType,
                    cover: cover,
                    artists: albumArtists,  // Properly assign artists as an array of Artist objects
                    tracks: tracks
                };
                albums.push(albumData);
            } else {
                // Parse singles
                const track: Track = {
                    id,
                    name,
                    cover: cover,
                    artists: artists,
                };
                singles.push(track);
            }
        }
        
        return { albums, singles}; // Return the parsed albums and singles
        
    }
    

    const search = async (): Promise<Artist[] | undefined>  => {

        const searchParams = await props.searchParams;
    
        let searchString: string;
        if(searchParams && searchParams.artist) {
            searchString = searchParams.artist;
        } else {
            return;
        }
        
        const token: string | null = await getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);

        if(!token) return;

        const artists: Artist[] | undefined = await searchForArtist(token, searchString);

        return artists;
    }

    /* After user specifies the artist, process the selection. */
    const selectArtist = async (artist: Artist) => {

        const artistId: string = artist.id;

        const token: string | null = await getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);

        if(!token) return;

        if(artistId && artist) {
            const albums: SpotifyAlbumsTracksResponse = await getAlbumsByArtistName(token, artistId);
            const dataParse: {
                albums: Album[]; 
                singles: Track[] } 
            = parseJson(albums)

            const artistData: ArtistData = {
                albums: dataParse.albums,
                singles: dataParse.singles,
                artist: artist
            };

            console.log(artistData)

            return artistData;
        }
    }

    const artist: string | undefined = (await props.searchParams)?.artist;
    const results: Artist[] | undefined = await search();
    const artists: Artist[] = results ?? [];

    console.log(artists);
    
    return (
        <main className="flex justify-center items-center flex-col">
            {artist && 
                <p className="my-[1.25rem]">
                    Showing results for: <strong>{artist}</strong>
                </p>
            }
            <Results artists={artists}></Results>
        </main>
    )
}