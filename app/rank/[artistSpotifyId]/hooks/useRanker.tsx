
import { useRef, useState, useCallback, useEffect } from "react";

import Ranker from "../objects/rank3";
import { MatchupData } from "../objects/rank3";

export function useRanker() {
 
    const rankerRef = useRef<Ranker | null>(null);
    const [currentMatchup, setCurrentMatchup] = useState<[string, string] | null>(null);

    const [reverseScoreMap, setReverseScoreMap] = useState<Map<number, Set<string>>>(new Map());

    const [isComplete, setIsComplete] = useState(false);
    const [finalSorting, setFinalSorting] = useState<string[]>([]);

    /* 
        View API
    */
    const initilize = useCallback((trackIds: string[]) => {
        if(trackIds.length <= 0) {
            throw new Error("Can't initilize ranker with no tracks")
        }

        const ranker = new Ranker(trackIds);
        ranker.initialize();
        setCurrentMatchup(ranker.getCurrMatchup());

        rankerRef.current = ranker;

    }, [])

    const makeChoice = useCallback((winner: string, loser: string) => {
        
        if (!rankerRef.current) return;

        rankerRef.current.makeChoice(winner, loser);    

        if(rankerRef.current.checkComplete()) {
            setFinalSorting(rankerRef.current.getSorting());
            setIsComplete(true);
        }
        else {
            const nextMatchup = rankerRef.current.getCurrMatchup();
            setCurrentMatchup(nextMatchup);
        }

        /* DEV */
        setReverseScoreMap(rankerRef.current.getReverseScoreMap());

    }, []);

    return {
        currentMatchup,
        initilize,
        makeChoice,
        reverseScoreMap,
        isComplete,
        finalSorting
    };
}
