'use client'

import { Track } from "@/types/artist"

/* Import ranker stages */
import Assemble from "./Assemble";
import Rank from "./Rank";

/* React Imports */
import { useEffect, useState } from "react";

export default function RankerInterface(
    {tracks}: {tracks: Track[]}
) {

    /* Current Ranking Stage */
    const [stage, setStage] = useState(0);

    /* Maps SpotifyID to Track for quick indexing. */
    const [songMap, setSongMap] = useState<Map<string, Track>>(new Map());
    const [songList, setSongList] = useState<Track[]>([]);

    /* 
        Assemble
        - Remove the specified tracks from the ranking pool. 
    */
    const assemble = (selectedIds: string[]) : void => {
        setSongMap(prev => {
            const newMap = new Map(prev);
            for (const spotifyID of selectedIds) {
                newMap.set(spotifyID, prev.get(spotifyID)!);
            }
            setSongList(Array.from(newMap.values()));
            return newMap;
        });
        setStage(prev => {
            return prev + 1;
        })
    }

    /* 
        Rank
        - Algorithmically determine the final ranking. 
    */
    const rank = (finalList: string[]) : void => {
        
    }
    
    /* Only set the songMap on page refresh. */
    useEffect(() => {
        setSongList(tracks)
        const tempMap: Map<string, Track> = new Map(); 
        for(const track of tracks) {
            tempMap.set(track.spotifyId, track);
        }
        setSongMap(tempMap);
    }, [tracks])

    /* 
        Showdown
    */

    return (
        <main className="w-full h-full flex flex-col items-center justify-center">
            {(stage == 0) && 
                <Assemble
                    tracks={songList}
                    onEnd={assemble}
                ></Assemble>
            }
            {(stage == 1) &&
                <Rank 
                    tracks={songList}
                    onEnd={rank}
                ></Rank>
            }
        </main>
    )
}