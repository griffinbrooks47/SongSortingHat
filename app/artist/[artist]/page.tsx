import Image from "next/image"

import { Artist, Album, DetailedAlbum } from "@/types/artist";

/* Sample data. */
import { sampleArtist, sampleDetailedAlbums } from "./objects/sampleArtist";
import { IconBrandSpotify, IconHeart } from "@tabler/icons-react";
import { AlbumCard } from "./components/albumCard";

/* 
    Spotify API artist endpoint return object
*/
interface AlbumResponse {
    total: number;
    items: Album[];
}
interface DetailedAlbumResponse {
    albums: DetailedAlbum[];
}

/* 
    Spotify API Functions. 
*/
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

export default async function ArtistPage({
    params,
    }: {
    params: Promise<{ artist: string }>
  }) {

    /* Artist ID */
    const artistId = (await params).artist

    /* */
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

    //const artist = sampleArtist;
    //const detailedAlbums = sampleDetailedAlbums;


    return (
        <main className="page flex justify-center items-center flex-col">
            <div className="mt-[7.5rem]">
                <div className="relative h-[17.5rem] mb-[2rem] flex flex-row justify-between items-start rounded-md">
                    <section className="pt-[0rem] mt-[0.5rem] mb-[2rem] flex flex-row min-w-[25rem]">
                        
                        <div className="ml-[1.5rem] pr-[5rem] my-auto">
                            <p
                                className="text-[2.75rem] font-bold break-words overflow-hidden 
                                        line-clamp-2 text-ellipsis max-w-full leading-[3.65rem]"
                                style={{
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 2,
                                    whiteSpace: "normal",
                                }}
                            >
                                {artist.name.length > 40 ? artist.name.slice(0, 40) + "..." : artist.name}
                            </p>
                            <p className="text-[1.25rem] mt-[-0.5rem] font-semibold opacity-80 truncate max-w-[40ch] leading-[1.5rem]">
                                {artist.followers.total.toLocaleString() + " followers"}
                            </p>
                            <p className="text-[0.95rem] my-[0.25rem] font-semibold uppercase opacity-60 truncate max-w-[40ch] leading-[1rem]">
                                {detailedAlbums.length + " projects"}
                            </p>
                            <div className="flex">
                                <button className="mr-[0.5rem] my-[0.5rem] w-[3.25rem] h-[3.25rem] border-2 border-neutral opacity-80 flex rounded-full justify-center items-center">
                                    <IconHeart className="w-8 h-8" />
                                </button>
                                <button className="my-[0.5rem] w-[3.25rem] h-[3.25rem] border-2 border-neutral opacity-80 flex rounded-lg justify-center items-center">
                                    <IconBrandSpotify className="w-8 h-8" />
                                </button>
                            </div>
                        </div>
                    </section>
                    <div className="h-full">
                        <figure className="h-full z-10 aspect-w-1 aspect-h-1">
                            <Image
                            src={artist.images[0].url}
                            width={280} 
                            height={280}
                            alt={artist.name}
                            className="h-full rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.8)] object-cover"
                            />
                        </figure>
                    </div>
                </div>
            </div>
            <section className="flex justify-center items-end flex-col mt-[1rem]">
                <div className="flex ml-[1rem]">
                    <ul className="mr-auto my-[1rem] bg-base-100 shadow-sm rounded-md flex justify-center items-center py-[0.25rem]">
                        <li>
                            <a className="h-[2.5rem] rounded-sm flex justify-center items-center px-[1rem] ml-[0.25rem] mr-[0.25rem] bg-base-200">
                                Albums
                            </a>
                        </li>
                        <li>
                            <a className="h-[2.5rem] rounded-sm flex justify-center items-center px-[1rem] mr-[0.25rem] bg-base-100">
                                Songs
                            </a>
                        </li>
                        <li>
                            <a className="h-[2.5rem] rounded-sm flex justify-center items-center px-[1rem] mr-[0.25rem] bg-base-100">
                                Lists
                            </a>
                        </li>
                    </ul>
                    
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {detailedAlbums?.map((album) => (
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