
/* Page Components */
import { useState } from "react";
import { SongCarousel } from "./components/SongCarousel";

import { Track } from "@/types/artist";

const chunkArray = (arr: Track[], size: number) => {
    return arr.reduce((acc: Track[][], _, i) => {
      if (i % size === 0) acc.push(arr.slice(i, i + size));
      return acc;
    }, []);
};

export default function Assemble(
    { tracks, countPerSlide, onEnd } : {
    tracks: Track[];
    countPerSlide: number;
    onEnd: (removedIDs: string[]) => void;
}) {

    /* Set of spotify IDs */
    const [removedTracks, setRemovedTracks] = useState<Set<string>>(new Set());
    const toggleTrack = (spotifyID: string) => {
        setRemovedTracks(prev => {
            const newSet = new Set(prev); // copy the previous set
            if (newSet.has(spotifyID)) {
                newSet.delete(spotifyID); // remove if already exists
            } else {
                newSet.add(spotifyID); // add if not present
            }
            return newSet; // update state with new set
        });
    };

    

    

    return (
        <main className='h-full w-full relative flex flex-col justify-center items-center mt-[1rem]'>
            <SongCarousel 
                songChunks={chunkArray(tracks, countPerSlide)} 
                count={countPerSlide}
                toggleSong={(item: string) => toggleTrack(item)}
                onEnd={() => {
                    onEnd(Array.from(removedTracks))
                }}
            ></SongCarousel>
        </main>
    )
}

/* 
<main className='h-full w-full relative flex flex-col justify-center items-center mt-[1rem]'>
                    <SongCarousel 
                        songChunks={songChunks} 
                        count={countPerSlide}
                        toggleSong={toggleSong}
                        onEnd={() => {

                         
                            const selectedSongs: DetailedTrack[] = Object.values(idToSong);
                            compileSongs(selectedSongs);

                       
                            setStage(2);
                            setDashboardActive(true);
                        }}
                    ></SongCarousel>
                </main>
*/