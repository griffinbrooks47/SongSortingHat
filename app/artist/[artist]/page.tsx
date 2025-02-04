
import Image from "next/image"

export default async function Rank({
    params,
    }: {
    params: Promise<{ artist: string }>
  }) {

    /* Artist ID */
    const artist = (await params).artist

    /* Spotify API Functions. */
    async function getToken(clientId: string, clientSecret: string): Promise<string> {
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
    const artistLookup = async () => {
        
        const token: string = await getToken(clientId, clientSecret);


    }

    return (
        <main className="flex">
            <div className="card lg:card-side bg-base-100 shadow-xl">
                <figure>
                    
                </figure>
                <div className="card-body">
                    <h2 className="card-title">New album is released!</h2>
                    <p>Click the button to listen on Spotiwhy app.</p>
                    <div className="card-actions justify-end">
                    <button className="btn btn-primary">Listen</button>
                    </div>
                </div>
            </div>
        </main>
    )
}