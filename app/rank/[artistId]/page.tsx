'use client'

import * as _ from 'underscore';
import Image from "next/image";

import { useEffect, useState } from "react";
import { IconArrowsShuffle } from "@tabler/icons-react";

import { SongCarousel } from './components/SongCarousel';
import Ranker from './objects/rank';

/* Interface imports. */
import { Artist, Album, DetailedAlbum, DetailedTrack } from "../types/artist";

export default function Rank() {

    /* init */
    const [artist, setArtist] = useState<Artist | undefined>();
    const [, setAlbums] = useState<Album[] | undefined>();
    const [detailedAlbums, setDetailedAlbums] = useState<DetailedAlbum[] | undefined>();
    const [songs, setSongs] = useState<DetailedTrack[] | undefined>();

    const [stage, setStage] = useState<number>(1);
    const [stageActive, setStageActive] = useState<boolean>(false);
    const text: string[] = [
        "First, select the songs you like!",
        "Now, choose the better songs!",
        "Compile the results!"
    ]
    const [ranker, setRanker] = useState<Ranker>(new Ranker());

    /* Abstraction function to pass to child components for updating state. */
    const compileSongs = (tracks: DetailedTrack[]) => {
        setSongs(tracks);
    }


    /* Stage One */
    const [songChunks, setSongChunks] = useState<DetailedTrack[][] | undefined>();
    const countPerSlide = 15;
    const chunkArray = (arr: DetailedTrack[], size: number) => {
        return arr.reduce((acc: DetailedTrack[][], _, i) => {
          if (i % size === 0) acc.push(arr.slice(i, i + size));
          return acc;
        }, []);
    };
    const [idToSong, setIdToSong] = useState<Map<string, DetailedTrack>>(new Map());
    const toggleSong = (id: string, detailedTrack: DetailedTrack) => {
        if (idToSong.has(id)) {
            console.log("Removing: " + detailedTrack.track.name);
            setIdToSong((prev) => {
                const newMap = new Map(prev); // Create a new Map from the previous state
                newMap.delete(id); // Remove the key
                return newMap; // Update state
            });
        } else {
            console.log("Adding: " + detailedTrack.track.name);
            setIdToSong((prev) => {
                const newMap = new Map(prev); // Create a new Map from the previous state
                newMap.set(id, detailedTrack); // Add new key-value pair
                return newMap; // Update state
            });
        }
    };
    const startStageOne = () => {

        if(!detailedAlbums) return;

        let songs: DetailedTrack[] = [];
        const titles: Set<string> = new Set();

        /* Iterate over albums, create array of all artist's songs. */
        for(const detailedAlbum of detailedAlbums) {
            for(const track of detailedAlbum.tracks.items) {

                /* Don't add to pool if a duplicate title. */
                if(titles.has(track.name)) {
                    continue;
                }

                titles.add(track.name);
                const detailedTrack: DetailedTrack = {
                    track: track,
                    cover: detailedAlbum.images[0]
                }
                songs.push(detailedTrack);
            }
        }
        songs = _.shuffle(songs)
        setSongs(songs);

        setSongChunks(songs ? chunkArray(songs, countPerSlide) : [])
        // Set stage active. 
        setStageActive(true);
    }

    
    /* Stage Two */
    const [leftChoice, setLeftChoice] = useState<DetailedTrack>()
    const [rightChoice, setRightChoice] = useState<DetailedTrack>()
    const handleChoice = (id: string) : void => {

        console.log("Choice: " + id);

        if(!ranker) {
            console.log("ranker not defined");
            return;
        }
        const newMatchup: [string, string] | undefined = ranker.makeChoice(id);
        if(!newMatchup) {
            // End
            return;
        }
        setLeftChoice(idToSong.get(newMatchup[0]));
        setRightChoice(idToSong.get(newMatchup[1]));
    }
    const startStageTwo = () => {

        /* Initialize ranker songs. */
        ranker.initSongs(new Set(idToSong.keys()))
        setRanker(ranker);

        /* Display first matchup. */
        const firstMatchup: [string, string] | undefined = ranker.runAlgorithm();

        console.log(firstMatchup);

        setLeftChoice(idToSong.get(firstMatchup[0]));
        setRightChoice(idToSong.get(firstMatchup[1]));

        // Set stage active. 
        setStageActive(true);
    }


    /* Stage Three */
    const startStageThree = () => {
        // Set stage active. 
        setStageActive(true);
    }


    /* Update state with localstorage if reloaded. */
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
                <section className="card bg-base-100 min-w-[50rem] flex justify-center items-center border-neutral mt-[0rem]">
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
                    <p className="text-[2rem] font-bold mt-[1rem]">
                        {artist?.name}
                    </p>
                    <div className="card-body w-[100%] mt-[-1rem]">
                        <ul className="steps w-[90%] mx-auto text-[0.9rem]">
                            <li className={(stage > 1 ? "step step-primary" : (stage == 1 ? "step step-primary" : "step step"))}
                                data-content={(stage > 1 ? "✓" : 1)}>
                                <p className={(stage == 1 ? "font-semibold" : "")}>Assemble the Lineup</p></li>
                            <li className={(stage > 2 ? "step step-primary" : (stage == 2 ? "step step-primary" : "step step"))}
                                data-content={(stage > 2 ? "✓" : 2)}>
                                <p className={(stage == 2 ? "font-semibold" : "")}>Song Showdown</p></li>
                            <li className={(stage > 3 ? "step step-primary" : (stage == 3 ? "step step-primary" : "step step"))}
                                data-content={(stage > 3 ? "✓" : 3)}>
                                <p className={(stage == 3 ? "font-semibold" : "")}>Crown the Best!</p></li>
                        </ul>
                        <div className="divider my-[0.25rem]"></div>
                        <p className="text-center text-[1.25rem] font-semibold">{`Step ${stage}:`}</p>
                        <div className="flex justify-center flex-col text-center mb-[0.5rem]">
                            <p>{text[stage-1]}</p>
                        </div>
                        <button className="btn btn-outline border-2 btn-primary max-w-[30rem] mx-auto"
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
            {stageActive && (stage == 1) && songs && songChunks && 
                <main className='h-full w-full relative flex flex-col justify-center items-center mt-[2rem]'>
                    <SongCarousel 
                        songChunks={songChunks} 
                        count={countPerSlide}
                        toggleSong={toggleSong}
                        onEnd={() => {
                            /* Compile user selected songs. */
                            const selectedSongs: DetailedTrack[] = Object.values(idToSong);
                            compileSongs(selectedSongs);
                            /* Increment current stage. */
                            setStage(2);
                            setStageActive(false);
                        }}
                    ></SongCarousel>
                </main>
            }
            {/* Stage 2 */}
            {stageActive && (stage == 2) && 
                <section className='h-full w-full flex justify-center items-center'>
                    {leftChoice && rightChoice &&
                        <>
                            <div className="h-[15rem] w-[15rem] mx-[1rem] cursor-pointer"
                                onClick={() => handleChoice(leftChoice.track.id)}
                            >
                                <Image
                                    src={leftChoice.cover.url}
                                    alt={leftChoice.track.name}
                                    width={leftChoice.cover.width}
                                    height={leftChoice.cover.height}
                                ></Image>
                                {leftChoice?.track.name}
                            </div>
                            <div className="h-[15rem] w-[15rem] mx-[1rem] cursor-pointer"
                                onClick={() => handleChoice(rightChoice.track.id)}
                            >
                                <Image
                                    src={rightChoice.cover.url}
                                    alt={rightChoice.track.name}
                                    width={rightChoice.cover.width}
                                    height={rightChoice.cover.height}
                                ></Image>
                                {rightChoice?.track.name}
                            </div>
                        </>
                        
                    }
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