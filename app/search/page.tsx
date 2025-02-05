import { Results } from "./components/results";

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

    const artist: string | undefined = (await props.searchParams)?.artist;
    const results: Artist[] | undefined = await search();
    const artists: Artist[] = results ?? [];
    
    return (
        <main className="flex justify-center items-center flex-col">
            {artist && 
                <p className="mt-[2.5rem] mb-[1.25rem]">
                    Showing results for: <strong>{artist}</strong>
                </p>
            }
            <Results artists={artists}></Results>
        </main>
    )
}