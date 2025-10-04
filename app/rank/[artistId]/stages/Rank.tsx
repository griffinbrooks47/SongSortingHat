'use client'

import { Track } from "@/types/artist"

import { useRanker } from "../hooks/useRanker"
import { useEffect, useState } from "react";

export default function Rank(
    { tracks, onEnd }: { tracks: Track[] , onEnd: (finalList: string[]) => void }) {

    const [trackMap, setTrackMap] = useState(new Map());
    const { currentMatchup, makeChoice, reset, complete } = useRanker([]);

    useEffect(() => {
        const newMap: Map<string, Track> = new Map();
        for(const track of tracks) {
            newMap.set(track.spotifyId, track);
        }
        setTrackMap(newMap);
        reset(Array.from(newMap.keys()));
    }, [tracks, reset])

    useEffect(() => {
        if(complete) {
            onEnd(Array.from(trackMap.keys()));
        }
    }, [complete, onEnd, trackMap])

    if(!currentMatchup) {
        return (
            <main>
                Loading
            </main>
        )
    }

    return (
    <main>
        <button
            onClick={() => {
                makeChoice(currentMatchup[0], currentMatchup[1])
            }}
        >{currentMatchup[0]}</button>
        <button
            onClick={() => {
                makeChoice(currentMatchup[1], currentMatchup[0])
            }}
        >{currentMatchup[1]}</button>
    </main>
)}