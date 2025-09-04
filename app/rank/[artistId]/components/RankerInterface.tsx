'use client'

import { Track } from "@/types/artist"

/* Import ranker stages */
import Assemble from "./Stages/Assemble/Assemble"

/* React Imports */
import { useEffect, useState } from "react";

export default function RankerInterface(
    {tracks}: {tracks: Track[]}
) {

    /* Current Ranking Stage */
    const [stage, setStage] = useState(0);

    /* Maps SpotifyID to Track for quick indexing. */
    const [songMap, setSongMap] = useState<Map<string, Track>>(new Map());

    /* 
        Assemble
        - Remove the specified tracks from the ranking pool. 
    */
    const assemble = (removedIDs: string[]) => {
        setSongMap(prev => {
            const newMap = new Map(prev);
            for (const spotifyID of removedIDs) {
                newMap.delete(spotifyID);
            }
            return newMap;
        });
        setStage(prev => {
            return prev + 1;
        })
    }
    /* Only set the songMap on page refresh. */
    useEffect(() => {
        const tempMap: Map<string, Track> = new Map(); 
        for(const track of tracks) {
            tempMap.set(track.spotifyId, track);
        }
        setSongMap(tempMap);
    }, [])


    /* 
        Showdown
    */

    return (
        <main>
            <Assemble 
                tracks={tracks} 
                countPerSlide={15} 
                onEnd={(removedIDs: string[]) => {
                    assemble(removedIDs)
                }}
            ></Assemble>
        </main>
    )
}