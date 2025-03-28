'use client'

import * as _ from 'underscore';
import Image from "next/image";

import { useEffect, useState } from "react";
import { IconArrowsShuffle } from "@tabler/icons-react";

import { SongCarousel } from './components/SongCarousel';

import Showdown from '../stages/Showdown';

/* Interface imports. */
import { Artist, Album, DetailedAlbum, DetailedTrack } from "@/types/artist";

/* Import sample data. */
//import sampleMap from './objects/sampleMap';

export default function Rank() {

    /* Loaded data cached initially in localStorage. */
    const [artist, setArtist] = useState<Artist | undefined>();
    const [, setAlbums] = useState<Album[] | undefined>();
    const [detailedAlbums, setDetailedAlbums] = useState<DetailedAlbum[] | undefined>();
    const [songs, setSongs] = useState<DetailedTrack[] | undefined>();

    /* Abstraction used to update current song pool between stages. */
    const compileSongs = (tracks: DetailedTrack[]) => {
        setSongs(tracks);
    }

    /* 
        Ranking stage state.
        ~ 1: Assemble the Lineup
        ~ 2: Song Showdown
        ~ 3: Crown the Best!
    */
    const [stage, setStage] = useState<number>(1);
    const [stageActive, setStageActive] = useState<boolean>(false);
    const text: string[] = [
        "First, select the songs you like!",
        "Now, choose the better songs!",
        "Compile the results!"
    ]

    /* Chunked array used to display songs in stage 1. */
    const [songChunks, setSongChunks] = useState<DetailedTrack[][] | undefined>();
    const countPerSlide = 15;
    const chunkArray = (arr: DetailedTrack[], size: number) => {
        return arr.reduce((acc: DetailedTrack[][], _, i) => {
          if (i % size === 0) acc.push(arr.slice(i, i + size));
          return acc;
        }, []);
    };

    /* 
        Map of all selected songs.
        ~ Key: Spotify track ID
        ~ Value: DetailedTrack object
    */
    const [idToSong, setIdToSong] = useState<Map<string, DetailedTrack>>(new Map());
    const toggleSong = (id: string, detailedTrack: DetailedTrack) => {
        if (idToSong.has(id)) {
            setIdToSong((prev) => {
                const newMap = new Map(prev); 
                newMap.delete(id);
                return newMap;
            });
        } else {
            setIdToSong((prev) => {
                const newMap = new Map(prev);
                newMap.set(id, detailedTrack);
                return newMap;
            });
        }
    };

    /* 
        Users final ranking of songs.
        ~ Array of DetailedTrack objects.
    */
    const [finalRanking, setFinalRanking] = useState<DetailedTrack[] | undefined>();
    const compileFinalRanking = (ranking: DetailedTrack[]) => {
        setFinalRanking(ranking);
    }

    /* 
        Functions used to compile each stage. 
    */
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
                    album_title: detailedAlbum.name,
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
    const startStageTwo = () => {
        // Set stage active. 
        setStageActive(true);
    }
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
        <main className="flex justify-center items-center flex-col h-[calc(100vh-4rem)] bg-base-200">
            {/* Interface between ranking stages. */}
            {!stageActive && 
                <section className="card bg-base-100 min-w-[50rem] flex justify-center items-center rounded-md shadow-sm mb-[1rem]">
                    <figure className="w-[12.5rem] h-[12.5rem] rounded-full mt-[3rem]">
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
                <main className='h-full w-full relative flex flex-col justify-center items-center mt-[1rem]'>
                    <SongCarousel 
                        songChunks={songChunks} 
                        count={countPerSlide}
                        toggleSong={toggleSong}
                        onEnd={() => {

                            /* Compile user selected songs. */
                            const selectedSongs: DetailedTrack[] = Object.values(idToSong);
                            compileSongs(selectedSongs);

                            console.log(selectedSongs);

                            /* Increment current stage. */
                            setStage(2);
                            setStageActive(false);
                        }}
                    ></SongCarousel>
                </main>
            }

            {/* Stage 2 */}
            {stageActive && (stage == 2) && 
                <Showdown 
                    itemMap={idToSong}
                    onEnd={(finalRanking: DetailedTrack[]) => {

                        let topTen: DetailedTrack[];
                        /* For now, just cut off songs past 10. */
                        if(finalRanking.length > 10) {
                            topTen = finalRanking.slice(0, 10);
                        } else {
                            topTen = finalRanking;
                        }

                        /* Set the final ranking. */
                        compileFinalRanking(topTen);

                        /* Increment current stage. */
                        setStage(3);
                        setStageActive(false);
                    }}
                />
            }

            {/* Stage 3 */}
            {stageActive && (stage == 3) && finalRanking && 
                <section className='w-full min-h-full flex justify-center mt-[2rem]'>
                    <ul className='list bg-base-100 shadow-sm w-[35rem] py-[0.25rem] px-[0rem] border-2 rounded-sm'>
                        <div className='flex flex-row justify-center items-center h-[4rem]'>
                            <div>
                                <p className='text-[1.25rem] leading-[1.2rem]'>{`${artist?.name}'s Top Ten`}</p>
                                <p className='opacity-70 text-center'>{`Curated by [username]`}</p>
                            </div>
                        </div>
                        {finalRanking.map((detailedTrack: DetailedTrack, index: number) => {
                            return (
                                    <li key={index} className='list-row'>
                                        <hr className='w-[95%] mx-auto'></hr>
                                        <div className='flex flex-row items-center h-[2.5rem] my-[0.5rem]'>
                                            <div className="text-md text-center font-medium opacity-90 tabular-nums mx-[1.25rem] min-w-[1.5rem]">{index+1}</div>
                                            <Image
                                                src={detailedTrack.cover.url}
                                                alt={detailedTrack.track.name}
                                                width={detailedTrack.cover.width}
                                                height={detailedTrack.cover.height}
                                                className='w-[2.35rem] h-[2.35rem] border'
                                            ></Image>
                                            <div className='pl-[1.75rem]'>
                                                <div className='text-[0.925rem] leading-[1.1rem] truncate max-w-[25ch]'>{detailedTrack.track.name}</div>
                                                <div className="text-[0.75rem] uppercase font-semibold opacity-50 truncate max-w-[25ch]">{detailedTrack.album_title}</div>
                                            </div>
                                        </div>
                                    </li>   
                            )
                        })}
                    </ul>
                </section>
            }
        </main>
    )
}