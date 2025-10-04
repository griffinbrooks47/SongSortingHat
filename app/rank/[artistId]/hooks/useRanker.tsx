
import { useRef, useState, useCallback, useEffect } from "react";

import Ranker from "../objects/rank3";
import { MatchupData } from "../objects/rank3";

export function useRanker(initialTrackIds: string[]) {
 
    const rankerRef = useRef<Ranker | null>(null);
    const [currentMatchup, setCurrentMatchup] = useState<[string, string] | null>(null);
    const [snapshot, setSnapshot] = useState<MatchupData | null>(null);

    const [complete, setComplete] = useState(false);

    /* Initialize Ranker once on mount or when track IDs change */
    useEffect(() => {
        const ranker = new Ranker(initialTrackIds);
        rankerRef.current = ranker;

        const snap = ranker.getSnapshot();
        setSnapshot(snap);
        setCurrentMatchup(snap.currMatchup);
    }, [initialTrackIds]);

    /* 
        View API
    */

    const makeChoice = useCallback((winner: string, loser: string) => {
        if (!rankerRef.current) return;

        rankerRef.current.makeChoice(winner, loser);

        const snap = rankerRef.current.getSnapshot();
        setSnapshot(snap);
        setCurrentMatchup(snap.currMatchup);
    }, []);
    const undo = useCallback(() => {

    }, []);
    const reset = useCallback((trackIds: string[]) => {
        // Create a new Ranker instance with the provided tracks
        const ranker = new Ranker(trackIds);

        // Replace the ref with the new Ranker
        rankerRef.current = ranker;

        // Get the snapshot from the new Ranker
        const snap = ranker.getSnapshot();

        // Update the hook state
        setSnapshot(snap);
        setCurrentMatchup(snap.currMatchup);
    }, []);

    return {
        snapshot,
        currentMatchup,
        makeChoice,
        reset,
        complete
    };
}
