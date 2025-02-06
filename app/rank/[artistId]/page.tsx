'use client'

import { useEffect, useState } from "react";

import { IconArrowsShuffle } from "@tabler/icons-react";
import { SongCard } from "./components/SongCard";

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

export default function Rank() {

    /* Current Artist Data */
    const [artist, setArtist] = useState<Artist | undefined>();
    const [albums, setAlbums] = useState<Album[] | undefined>();
    const [detailedAlbums, setDetailedAlbums] = useState<DetailedAlbum[] | undefined>();

    const [songs, setSongs] = useState<Track[] | undefined>();

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

        const songs: Track[] = [];

        /* Iterate over albums, create array of all artist's songs. */
        for(const detailedAlbum of detailedAlbums) {
            songs.push(...detailedAlbum.tracks.items)
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
        <main className="flex justify-center items-center flex-col">
            {/* Render info card between stages. */}
            {!stageActive && 
                <section className="card bg-base-100 min-w-[50rem] flex justify-center items-center border-neutral mt-[5rem]">
                    <p className="text-[2rem] font-bold mt-[3rem]">
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
                <section className="grid grid-cols-4">
                    {songs.map((song: Track) => {
                        return (
                            <SongCard {...song} key={song.id}/>
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