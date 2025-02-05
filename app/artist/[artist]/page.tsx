import Image from "next/image"

import { IconHeart, IconArrowBadgeRight, IconBrandSpotify,IconUser } from "@tabler/icons-react";

import { AlbumCard } from "./components/albumCard";

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


    const artistLookup = async (artistId: string): Promise<Artist | undefined> => {
        
        const token: string | null = await getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);

        if(!token) return;

        const artist: Artist = await getArtist(token, artistId);

        console.log(artist);

        return artist;
    }

    const albumsLookup = async (artistId: string): Promise<Album[] | undefined> => {

        const token: string | null = await getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);

        if(!token) return;

        const albums: AlbumResponse = await getAlbums(token, artistId);

        return albums.items;

    }

    const artist: Artist | undefined = await artistLookup(artistId);

    if(!artist) return;

    const albums: Album[] | undefined = await albumsLookup(artistId);

    if(!albums) return;

    return (
        <main className="flex justify-center items-center flex-col">
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
                <div className="flex flex-col justify-center items-center mx-[4rem]">
                    <p className="text-[2.5rem] font-bold">{artist.name}</p>
                    <div className="flex justify-center items-center flex-col mb-[0.5rem]">
                        <div className="badge badge-lg badge-secondary">
                            <IconUser className="h-[65%] w-[65%] font-bold mr-[0.15rem]" />
                            <p className="pl-[0.05rem] pr-[0.20rem]">{artist.followers.total.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex justify-center items-center mt-[0.5rem]">
                        <button className="btn btn-outline rounded-md mx-[0.25rem]">
                            <p className="pl-[0.5rem]">Rank this artist</p>
                            <IconArrowBadgeRight />
                        </button>
                        <button className="btn btn-outline btn-square mx-[0.25rem]">
                            <IconBrandSpotify />
                        </button>
                        <button className="btn btn-outline btn-square mx-[0.25rem]">
                            <IconHeart />
                        </button>
                    </div>
                </div>
            </div>
            <section className="flex justify-base items-base flex-col mt-[6rem]">
                <div className="grid grid-cols-4 gap-3">
                    {albums?.map((album) => (
                        <AlbumCard
                            image={album.images[0]}
                            name={artist.name}
                            key={album.id}
                        >
                        </AlbumCard>
                    ))}
                </div>
            </section>
        </main>
    )
}