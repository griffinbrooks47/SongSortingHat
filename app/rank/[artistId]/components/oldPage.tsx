'use client'

import * as _ from 'underscore';
import Image from "next/image";

import { useEffect, useState } from "react";

import { SongCarousel } from './components/SongCarousel';

import Showdown from '../stages/stage2/Showdown';

/* Interface imports. */
import { Artist, Album, Track } from "@/types/artist";
import Dashboard from '../stages/Dashboard';

/* Import sample data. */
//import sampleMap from './objects/sampleMap';

export default function Rank() {

    /* 
        From URL param, query DB for:
        ~ Artist
        ~ Detailed Albums
        ~ Tracks
        If artist undefined in DB or last updated over a day ago:
        ~ Redirect to artist page to trigger database updates. 
    */

    /* Loaded data cached initially in localStorage. */
    const [artist, setArtist] = useState<Artist | undefined>();
    const [, setAlbums] = useState<Album[] | undefined>();
    const [detailedAlbums, setDetailedAlbums] = useState<Album[] | undefined>();
    const [songs, setSongs] = useState<Track[]>([]);

    /* Abstraction used to update current song pool between stages. */
    const compileSongs = (tracks: Track[]) => {
        setSongs(tracks);
    }

    /* 
        Ranking stage state.
        ~ 1: Assemble the Lineup
        ~ 2: Song Showdown
        ~ 3: Crown the Best!
    */
    const [stage, setStage] = useState<number>(1);
    const [dashboardActive, setDashboardActive] = useState<boolean>(true);

    /* 
        Map of all selected songs.
        ~ Key: Spotify track ID
        ~ Value: DetailedTrack object
    */
    const [idToSong, setIdToSong] = useState<Map<string, Track>>(new Map());
    const toggleSong = (id: string, detailedTrack: Track) => {
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
    const [finalRanking, setFinalRanking] = useState<Track[]>([]);
    const compileFinalRanking = (ranking: Track[]) => {
        setFinalRanking(ranking);
    }

    /* 
        Functions used to compile each stage. 
    */
    const startStageOne = () => {

        if(!detailedAlbums) return;

        let songs: Track[] = [];
        const titles: Set<string> = new Set();

        /* Iterate over albums, create array of all artist's songs. */
        for(const detailedAlbum of detailedAlbums) {
            for(const track of detailedAlbum.tracks) {

                /* Don't add to pool if a duplicate title. */
                if(titles.has(track.title)) {
                    continue;
                }

                titles.add(track.title);
                const detailedTrack: Track = {
                    track: track,
                    album_title: detailedAlbum.title,
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
            {dashboardActive && artist && stage &&
                <Dashboard 
                    artist={artist} 
                    stage={stage} 

                    setStage={(newStage: number) => {
                        setStage(newStage)
                    }}
                    setDashboardActive={(state: boolean) => {
                        setDashboardActive(state);
                    }}
                    setType={(newType: string) => {
                        setRankingType(newType)
                    }}
                />
            }

            {/* Stage 1 */}
            {!dashboardActive && (stage == 1) && songs && songChunks && 
                <main className='h-full w-full relative flex flex-col justify-center items-center mt-[1rem]'>
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
                            setDashboardActive(true);
                        }}
                    ></SongCarousel>
                </main>
            }

            {/* Stage 2 */}
            {!dashboardActive && (stage == 2) && 
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
            {!dashboardActive && (stage == 3) && finalRanking && 
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