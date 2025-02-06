'use client'

import { useEffect, useState } from "react";

import Image from "next/image";

import { IconArrowsShuffle } from "@tabler/icons-react";
import { SongCard } from "./components/SongCard";

interface Artist {
    id: string;
    name: string;
    images: Img[];
    external_urls: {spotify: string};
    followers: {total: number};
    genres: string[];
    popularity: number;
}
interface Img {
    width: number;
    height: number;
    url: string;
}
interface Album {
    album_type: string;
    total_tracks: number;
    id: string;
    images: Img[];
    name: string;
    release_date: string;
    type: string;
    artists: Artist[];
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
interface DetailedTrack {
    track: Track;
    cover: Img;
}

export default function Rank() {

    /* Current Artist Data */
    const [artist, setArtist] = useState<Artist | undefined>();
    const [albums, setAlbums] = useState<Album[] | undefined>();
    const [detailedAlbums, setDetailedAlbums] = useState<DetailedAlbum[] | undefined>();

    const [songs, setSongs] = useState<DetailedTrack[] | undefined>();


    /* 
        Stage One Hashmap 
        Includes songs that should be adding to the ranking pool. 
    */
    const [idToSong, setIdToSong] = useState<Record<string, DetailedTrack>>({});
    const toggleSong = (id: string, detailedTrack: DetailedTrack) => {

        if (idToSong[id]) {
            console.log("Removing: " + detailedTrack.track.name)
            setIdToSong((prev) => {
                const newMap = { ...prev }; // Create a shallow copy
                delete newMap[id]; // Remove the key
                return newMap; // Update state
            })
        } else {
            console.log("Adding: " + detailedTrack.track.name)
            setIdToSong((prev) => ({
                ...prev, // Copy previous state
                [id]: detailedTrack, // Add new key-value pair
            }));
        }
    }


    const [stage, setStage] = useState<number>(1);
    const [stageActive, setStageActive] = useState<boolean>(false);

    const text: string[] = [
        "First, select the songs you like!",
        "Now, choose the better songs!",
        "Compile the results!"
    ]

    /* 
        Exectutes the first ranking stage.
        Parses all albums & singles and makes a comprehensive list of songs. 
    */
    const startStageOne = () => {

        if(!detailedAlbums) return;

        const songs: DetailedTrack[] = [];

        /* Iterate over albums, create array of all artist's songs. */
        for(const detailedAlbum of detailedAlbums) {
            for(const track of detailedAlbum.tracks.items) {
                const detailedTrack: DetailedTrack = {
                    track: track,
                    cover: detailedAlbum.images[0]
                }
                songs.push(detailedTrack);
            }
        }

        setSongs(songs);
        // Set stage active. 
        setStageActive(true);
    }
    const startStageTwo = () => {
        // Set stage active. 
        setStageActive(true);
    }
    const startStageThree = () => {
        // Set stage active. 
        setStageActive(true);
    }


    useEffect(() => {
        const storedArtist = localStorage.getItem("artist");
        const storedAlbums = localStorage.getItem("albums");
        const storedDetailedAlbums = localStorage.getItem("detailedAlbums");
        if (storedArtist && storedAlbums && storedDetailedAlbums) {
            try {
                const parsedArtist: Artist = JSON.parse(storedArtist);
                setArtist(parsedArtist);
                const parsedAlbums: Album[] = JSON.parse(storedAlbums);
                setAlbums(parsedAlbums);
                const parsedDetailedAlbums: DetailedAlbum[] = JSON.parse(storedDetailedAlbums);
                setDetailedAlbums(parsedDetailedAlbums);
            } catch (error) {
                console.error("Error parsing artist data:", error);
            }
        }
    }, []);

    return (
        <main className="flex justify-center items-center flex-col h-[calc(100vh-5.5rem)]">
            {/* Render info card between stages. */}
            {!stageActive && 
                <section className="card bg-base-100 min-w-[50rem] flex justify-center items-center border-neutral mt-[4rem]">
                    <figure className="w-[12.5rem] h-[12.5rem] rounded-full">
                        {artist &&
                            <Image 
                                src={artist.images[0].url}
                                width={artist.images[0].width}
                                height={artist.images[0].height}
                                alt={artist.name}
                                className=""
                            />
                        }
                    </figure>
                    <p className="text-[2rem] font-bold mt-[2rem]">
                        Current Progress
                    </p>
                    <div className="card-body w-[100%] mt-[-1rem]">
                        <ul className="steps w-[90%] mx-auto text-[0.9rem]">
                            <li className={(stage > 1 ? "step step-primary" : (stage == 1 ? "step step-primary" : "step step"))}
                                data-content={(stage > 1 ? "✓" : 1)}>
                                <p className={(stage == 1 ? "font-semibold" : "")}>Assemble the Lineup</p></li>
                            <li className={(stage > 2 ? "step step-primary" : (stage == 2 ? "step step-primary" : "step step"))}
                                data-content={(stage > 2 ? "✓" : 2)}>
                                <p className={(stage == 2 ? "font-semibold" : "")}>Songs Showdown</p></li>
                            <li className={(stage > 3 ? "step step-primary" : (stage == 3 ? "step step-primary" : "step step"))}
                                data-content={(stage > 3 ? "✓" : 3)}>
                                <p className={(stage == 3 ? "font-semibold" : "")}>Crown the Best!</p></li>
                        </ul>
                        <div className="divider my-[0.25rem]"></div>
                        <p className="text-center text-[1.25rem] font-semibold">{`Step ${stage}:`}</p>
                        <div className="flex justify-center flex-col text-center mb-[0.5rem]">
                            <p>{text[stage-1]}</p>
                        </div>
                        <button className="btn btn-outline btn-primary max-w-[30rem] mx-auto"
                            onClick={() => {
                                if(stage == 1){
                                    startStageOne();
                                } else if(stage == 2){
                                    startStageTwo();
                                } else {
                                    startStageThree();
                                }
                            }}
                        >
                            Start Ranking
                            <IconArrowsShuffle />
                        </button>
                    </div>
                </section>
            }
            {/* Stage 1 */}
            {stageActive && (stage == 1) && songs && 
                <section className="grid grid-cols-4 gap-3 mt-[3rem] overflow-hidden">
                    {songs.map((song: DetailedTrack) => {
                        return (
                            <SongCard key={song.track.id} track={song}
                                onClick={toggleSong}
                            />
                        )
                    })}
                </section>
            }
            {/* Stage 2 */}
            {stageActive && (stage == 2) && 
                <section>

                </section>
            }
            {/* Stage 3 */}
            {stageActive && (stage == 3) && 
                <section>

                </section>
            }
        </main>
    )
}