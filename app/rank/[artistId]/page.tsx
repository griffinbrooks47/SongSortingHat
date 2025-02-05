'use client'

import { useEffect, useState } from "react";

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

export default function Rank() {

    /* Current Artist Data */
    const [artist, setArtist] = useState<Artist | undefined>();
    const [albums, setAlbums] = useState<Album[] | undefined>();

    useEffect(() => {
        const storedArtist = localStorage.getItem("artist");
        const storedAlbums = localStorage.getItem("albums");
        if (storedArtist && storedAlbums) {
            try {
                const parsedArtist: Artist = JSON.parse(storedArtist); // Type assertion
                setArtist(parsedArtist);
                const parsedAlbums: Album[] = JSON.parse(storedAlbums); // Type assertion
                setAlbums(parsedAlbums);
            } catch (error) {
                console.error("Error parsing artist data:", error);
            }
        }
    }, []);

    return (
        <main>
            <p>Ranking: </p>
        </main>
    )
}