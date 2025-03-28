import Image from "next/image"

import { IconHeart, IconBrandSpotify } from "@tabler/icons-react";

import { AlbumCard } from "./components/albumCard";
import RankButton from "./components/RankButton";

/* 
    Spotify API artist endpoint return object
*/
interface Artist {
    id: string;
    name: string;
    images: Image[];
    external_urls: {spotify: string};
    followers: {total: number};
    genres: string[];
    popularity: number;
}
interface Image {
    width: number;
    height: number;
    url: string;
}
interface AlbumResponse {
    total: number;
    items: Album[];
}
interface Album {
    album_type: string;
    total_tracks: number;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    type: string;
    artists: Artist[];
}

/* 
    Spotify API Albums endpoint return objects
*/

interface DetailedAlbumResponse {
    albums: DetailedAlbum[];
}
interface DetailedAlbum {
    total_tracks: number;
    external_urls: {
        spotify: "string"
    },
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    artists: Artist[];
    tracks: {
        total: number;
        items: Track[];
    }
}
interface Track {
    artists: Artist[];
    id: string;
    name: string;
    track_number: number;
}

export default async function Artist({
    params,
    }: {
    params: Promise<{ artist: string }>
  }) {

    /* Artist ID */
    const artistId = (await params).artist

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
    /* 
        Requests artist information from spotify API
        Input: Spotify API token (string), artist ID (string)
        Returns: Artist (Artist object)
    */
    async function getArtist(token: string, artistId: string): Promise<Artist> {

        const url = "https://api.spotify.com/v1/artists/" + artistId;
        const headers = await getAuthHeaders(token);

        const response = await fetch(`${url}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artist: ${response.statusText}`);
        }

        const jsonResult: Artist = await response.json();

        return jsonResult;
    }

    async function getAlbums(token: string, artistId: string): Promise<AlbumResponse>{

        const url = "https://api.spotify.com/v1/artists/" + artistId + "/albums";
        const headers = await getAuthHeaders(token);

        const response = await fetch(`${url}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artist: ${response.statusText}`);
        }

        const jsonResult: AlbumResponse = await response.json();

        return jsonResult;
    }

    /* Includes tracks. */
    async function getDetailedAlbums(token: string, albumIds: string[]): Promise<DetailedAlbumResponse> {

        let albumQuery = "";
        for (const albumId of albumIds.slice(0, 20)) { // Limit to 20 iterations
            albumQuery += albumId + ",";
        }
        albumQuery = albumQuery.slice(0, -1);

        const url = `https://api.spotify.com/v1/albums?ids=${albumQuery}`;

        const headers = await getAuthHeaders(token);

        const response = await fetch(`${url}`, { headers });
        if (!response.ok) {
            throw new Error(`Error fetching artist: ${response.statusText}`);
        }
        const jsonResult: DetailedAlbumResponse = await response.json();

        return jsonResult;
    }


    const artistLookup = async (artistId: string): Promise<Artist | undefined> => {
        
        const token: string | null = await getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);

        if(!token) return;

        const artist: Artist = await getArtist(token, artistId);

        return artist;
    }

    const albumsLookup = async (artistId: string): Promise<Album[] | undefined> => {

        const token: string | null = await getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);

        if(!token) return;

        const albums: AlbumResponse = await getAlbums(token, artistId);

        return albums.items;
    }

    const detailedAlbumsLookup = async (albumIds: string[]): Promise<DetailedAlbum[] | undefined> => {

        const token: string | null = await getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);

        if(!token) return;

        const detailedAlbums: DetailedAlbumResponse = await getDetailedAlbums(token, albumIds);

        return detailedAlbums.albums;

    }

    const artist: Artist | undefined = await artistLookup(artistId);

    if(!artist) return;

    const albums: Album[] | undefined = await albumsLookup(artistId);

    if(!albums) return;

    const albumIds: string[] = [];
    for (const album of albums) {
        albumIds.push(album.id);
    }

    const detailedAlbums: DetailedAlbum[] | undefined = await detailedAlbumsLookup(albumIds);

    if(!detailedAlbums) return;

    return (
        <main className="page flex justify-center items-center flex-col bg-base-200">
            <div className="flex flex-row justify-center items-center rounded-md w-[80%] mt-[5rem] flex justify-center">
                <figure className="w-[15rem] h-[15rem] overflow-hidden rounded-full shadow-xl">
                    <Image
                        src={artist.images[0].url}
                        width={artist.images[0].width}
                        height={artist.images[0].height}
                        alt={artist.name}
                        className="w-full h-full"
                    >
                    </Image>
                </figure>
                <div className="flex flex-col justify-center items-center mx-[2rem] min-w-[27.5rem] max-w-[27.5rem]">
                    <p
                        className="text-[2.75rem] font-bold text-center break-words overflow-hidden 
                                line-clamp-2 text-ellipsis max-w-full mb-[0.25rem] px-2 leading-[3rem]"
                        style={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            whiteSpace: "normal",
                        }}
                    >
                        {artist.name.length > 40 ? artist.name.slice(0, 40) + "..." : artist.name}
                    </p>
                    <div className="flex justify-center items-center flex-col mb-[0.5rem]">
                        <p className="text-[0.9rem]">
                            Listeners:
                        </p>
                        <div className="badge badge-lg badge-primary">
                            <p className="px-[1.5rem] text-[0.9rem]">{artist.followers.total.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex justify-center items-center mt-[0.75rem]">
                        <RankButton artist={artist} albums={albums} detailedAlbums={detailedAlbums}/>
                        <button className="btn btn-outline btn-square mx-[0.25rem] rounded-lg border-2">
                            <IconBrandSpotify />
                        </button>
                        <button className="btn btn-outline btn-square mx-[0.25rem] border-2">
                            <IconHeart />
                        </button>
                    </div>
                </div>
            </div>
            <section className="flex justify-base items-base flex-col mt-[5rem]">
                <div className="grid grid-cols-4 gap-3">
                    {albums?.map((album) => (
                        <AlbumCard
                            image={album.images[0]}
                            name={album.name}
                            key={album.id}
                        >
                        </AlbumCard>
                    ))}
                </div>
            </section>
        </main>
    )
}