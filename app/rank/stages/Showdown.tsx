'use client'

/* Interface imports. */
import { Artist, Img, Album, DetailedAlbum, Track, DetailedTrack } from "@/types/artist";

/* React imports. */
import { useState, useReducer } from "react";
import Image from "next/image";

/* Data structure imports. */
import MatchupQueue from "../[artistId]/objects/matchupQueue";
import TrackNode from "../[artistId]/objects/TrackNode";

/* State for managing ranker data. */
interface RankerState {
    trackMap: Map<string, TrackNode>;
    scoreMap: Map<string, number>;
    reverseScoreMap: Map<number, Set<string>>;
    choiceCache: Map<string, Set<string>>;
}
/* Initial ranker state. */
const initialRankerState: RankerState = {
    trackMap: new Map(),
    scoreMap: new Map(),
    reverseScoreMap: new Map(),
    choiceCache: new Map()
};
/* Define reducer actions & types for reducer dispatch function. */
enum RankerActionKind {
    SET_TRACKMAP = 'SET_TRACKMAP',
    SET_SCOREMAP = 'SET_SCOREMAP',
    SET_REVERSESCOREMAP = 'SET_REVERSESCOREMAP',
    SET_CHOICECACHE = 'SET_CHOICECACHE'
}
interface SetTrackMapAction {
    type: RankerActionKind.SET_TRACKMAP;
    payload: Map<string, TrackNode>; // Only map that directly handles TrackNodes
}
interface SetScoreMapAction {
    type: RankerActionKind.SET_SCOREMAP;
    payload: Map<string, number>;
}
interface SetReverseScoreMapAction {
    type: RankerActionKind.SET_REVERSESCOREMAP;
    payload: Map<number, Set<string>>;
}
interface SetChoiceCacheAction {
    type: RankerActionKind.SET_CHOICECACHE;
    payload: Map<string, Set<string>>;
}
type RankerAction = SetTrackMapAction | SetScoreMapAction | SetReverseScoreMapAction | SetChoiceCacheAction;

/* Reducer function for updating ranker state between user choices. */
const rankerReducer = (state: RankerState, action: RankerAction) => {
    switch (action.type) {
        case RankerActionKind.SET_TRACKMAP:
            return {...state,
                trackmap: action.payload
            };
        case RankerActionKind.SET_SCOREMAP:
            return {...state,
                scoreMap: action.payload
            };
        case RankerActionKind.SET_REVERSESCOREMAP:
            return {...state,
                reverseScoreMap: action.payload
            };
        case RankerActionKind.SET_CHOICECACHE:
            return {...state,
                choiceCache: action.payload
            };
        default:
            return state;
    }
}

export default function Showdown(props: { itemMap: Map<string, DetailedTrack> }) {

    /* Throw an error if the ranking pool isn't properly defined. */
    if(props.itemMap.size < 2) {
        throw new Error("Ranking pool contains too few elements.")
    }

    /* Indicates when ranking process is complete. */
    const [isComplete, setIsComplete] = useState<boolean>(false);

    /* Grab all item IDs. */
    const itemMapKeys: string[] = Array.from(props.itemMap.keys());
    const firstItem: string = itemMapKeys[0];
    const secondItem: string = itemMapKeys[1];

    /* Current choices displayed on screen. */
    const [leftChoice, setLeftChoice] = useState<DetailedTrack | undefined>(() => {
        return props.itemMap.get(firstItem);
    });
    const [rightChoice, setRightChoice] = useState<DetailedTrack | undefined>(() => {
        return props.itemMap.get(secondItem); 
    });
    const [currMatchup, setCurrMatchup] = useState<[string, string]>([firstItem, secondItem]);

    /* Ranker data ~ consts of:
        ~ trackMap (ids mapped to node objects)
        ~ scoreMap (ids mapped to current score)
        ~ reverseScoreMap (all recorded scores mapped to a set of nodes currently at that score)
        ~ choiceCache (all previous choices user has made to help resolve repeats)
    */
    const [rankerState, dispatch] = useReducer(rankerReducer, initialRankerState);

    /* Queue of matchups to be presented to user. */
    const [matchups, setMatchups] = useState<MatchupQueue>(new MatchupQueue());

    /* Current song pool. */
    const [trackIDs, setTrackIDs] = useState<Set<string>>(() => {
        return new Set(itemMapKeys.slice(2));
    });

    const makeChoice = (winner: string, loser: string): void => {

    }

    return (
        <section className='h-full w-full flex justify-center items-center'>
            {leftChoice && rightChoice &&
                <>
                    <div className="h-[15rem] w-[15rem] mx-[1rem] cursor-pointer"
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
    )
}