import { ArtistCard } from "./components/artistCard";
import { SearchBar } from "./components/search";

import { Artist } from "@/types/artist";

/* Auth */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface SpotifySearchResponse {
    artists: {
        items: Artist[];
    };
}

export default async function Search(props: {
    searchParams?: Promise<{
        artist?: string;
    }>;
}){

    /* Check if user is logged in. */
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/login");
    }

    /* Spotify API Functions. */
    async function getToken(clientId: string | undefined, clientSecret: string | undefined): Promise<string | null> {

        if(clientId === undefined || clientSecret === undefined){
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
    
    /* 
        Main Search Function
    */
    const search = async (artistName: string): Promise<Artist[]>  => {
        
        const token: string | null = await getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);

        if(!token) return [];

        const artists: Artist[] | undefined = await searchForArtist(token, artistName);

        return artists ? artists : [];
    }

    const searchParams = await props.searchParams;
    const artistName: string | undefined = searchParams?.artist;

    let artists: Artist[] = [];
    if(artistName) {
        artists = await search(artistName);
    };
    
    return (
        <main className="bg-base-200 min-h-[calc(100vh)] pt-20 flex justify-center items-center flex-col">
            <section className={`w-180 mt-0 mb-4 ${!artistName ? "min-h-80" : ""}`}>
                {!artistName && 
                    <p className="text-[1.25rem] mt-0 mb-2">
                        Search for an artist to start ranking.
                    </p>
                }
                {artistName && 
                    <p className="text-[1.25rem] mt-8 mb-2">
                        Showing results for: <strong>{artistName}</strong>
                    </p>
                }
                <hr className="border-black opacity-10"></hr>
                <Suspense fallback={<div>Loading search...</div>}>
                    <SearchBar placeholder="Search for an artist..." />
                </Suspense>
            </section>
            <section className="grid grid-cols-3 grid-rows-3 gap-4 rounded-none">
                {artists.map((artist: Artist) => {
                    const image = artist.images?.[0];
                    if (!image) return null;

                    return (
                        <ArtistCard 
                            key={artist.id} 
                            artist={artist}
                            img={image.url} 
                            width={image.width} 
                            height={image.height}
                        />
                    );
                })}
            </section>
        </main>
    )
}