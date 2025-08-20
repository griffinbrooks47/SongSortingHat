'use client'

import '@xyflow/react/dist/style.css';

/* Interface imports. */
import { Track } from "@/types/artist";

/* React imports. */
import { useState, useReducer } from "react";
import Image from "next/image";

/* Data structure imports. */
import Ranker from '../../[artistId]/objects/rank2';
import MatchupQueue from '../../[artistId]/objects/matchupQueue';
import TrackNode from '../../[artistId]/objects/TrackNode';

/* Return type for Ranker object during iterations. */
interface MatchupData {
    currMatchup: [string, string];
    trackIDs: Set<string>;
    matchups: MatchupQueue;
    nodeMap: Map<string, TrackNode>;
    scoreMap: Map<string, number>;
    reverseScoreMap: Map<number, Set<string>>;
    choiceCache: Map<string, Set<string>>;
    isComplete: boolean;
}

/* Ranker object used to sort user choices and run ranking algorithm. */
const ranker: Ranker = new Ranker();

/* State for managing ranker data. */
interface RankerState {
    nodeMap: Map<string, TrackNode>;
    scoreMap: Map<string, number>;
    reverseScoreMap: Map<number, Set<string>>;
    choiceCache: Map<string, Set<string>>;
}

/* Define reducer actions & types for reducer dispatch function. */
enum RankerActionKind {
    SET_NODEMAP = 'SET_NODEMAP',
    SET_SCOREMAP = 'SET_SCOREMAP',
    SET_REVERSESCOREMAP = 'SET_REVERSESCOREMAP',
    SET_CHOICECACHE = 'SET_CHOICECACHE'
}
interface SetNodeMapAction {
    type: RankerActionKind.SET_NODEMAP;
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
type RankerAction = SetNodeMapAction | SetScoreMapAction | SetReverseScoreMapAction | SetChoiceCacheAction;


/* Reducer function for updating ranker state between user choices. */
const rankerReducer = (state: RankerState, action: RankerAction) => {
    switch (action.type) {
        case RankerActionKind.SET_NODEMAP:
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

export default function Showdown(props: { 
    itemMap: Map<string, Track>, 
    onEnd: (finalRanking: Track[]) => void 
}) {

    console.log(props.itemMap);

    /* Throw an error if the ranking pool isn't properly defined. */
    if(props.itemMap.size < 2) {
        throw new Error("Ranking pool contains too few elements.")
    }

    /* Grab all item IDs. */
    const itemMapKeys: string[] = Array.from(props.itemMap.keys());
    const firstItem: string = itemMapKeys[0];
    const secondItem: string = itemMapKeys[1];

    /* Current choices displayed on screen. */
    const [leftChoice, setLeftChoice] = useState<Track | undefined>(() => {
        return props.itemMap.get(firstItem);
    });
    const [rightChoice, setRightChoice] = useState<Track | undefined>(() => {
        return props.itemMap.get(secondItem); 
    });
    const [currMatchup, setCurrMatchup] = useState<[string, string]>([firstItem, secondItem]);

    /* Ranker data ~ consts of:
        ~ trackMap (ids mapped to node objects)
        ~ scoreMap (ids mapped to current score)
        ~ reverseScoreMap (all recorded scores mapped to a set of nodes currently at that score)
        ~ choiceCache (all previous choices user has made to help resolve repeats)
    */
    /* Initial ranker state. */
    const nodeMap: Map<string, TrackNode> = new Map();
    props.itemMap.forEach((value, key) => {
        nodeMap.set(key, new TrackNode(key))
    });
    const initialRankerState: RankerState = {
        nodeMap: nodeMap,
        scoreMap: new Map(),
        reverseScoreMap: new Map(),
        choiceCache: new Map()
    };
    const [rankerState, dispatch] = useReducer(rankerReducer, initialRankerState);

    /* Queue of matchups to be presented to user. */
    const [matchups, setMatchups] = useState<MatchupQueue>(new MatchupQueue());

    /* Current song pool. */
    const [trackIDs, setTrackIDs] = useState<Set<string>>(() => {
        return new Set(itemMapKeys.slice(2));
    });

    const makeChoice = (winner: string, loser: string): void => {
        
        /* Pass current ranker state. */
        ranker.iterate(
            currMatchup, 
            matchups,
            trackIDs,
            rankerState.nodeMap,
            rankerState.scoreMap,
            rankerState.reverseScoreMap,
            rankerState.choiceCache
        )
        /* Pass user choice. */
        ranker.makeChoice(winner, loser)

        /* Get results for next iteration. */
        const newMatchupData: MatchupData = ranker.getNewMatchups();

        /* Set next iteration data. */
        setCurrMatchup(newMatchupData.currMatchup);
        setMatchups(newMatchupData.matchups);
        setTrackIDs(newMatchupData.trackIDs);
        dispatch({ type: RankerActionKind.SET_NODEMAP, payload: newMatchupData.nodeMap });
        dispatch({ type: RankerActionKind.SET_SCOREMAP, payload: newMatchupData.scoreMap });
        dispatch({ type: RankerActionKind.SET_REVERSESCOREMAP, payload: newMatchupData.reverseScoreMap });
        dispatch({ type: RankerActionKind.SET_CHOICECACHE, payload: newMatchupData.choiceCache });

        /* Update view. */
        setLeftChoice(props.itemMap.get(
            newMatchupData.currMatchup[0]
        ))
        setRightChoice(props.itemMap.get(
            newMatchupData.currMatchup[1]
        ))

        /* Trigger next stage if complete. */
        if(newMatchupData.isComplete) {
            /* Convert the map to an array and sort by score in descending order */
            const finalRanking: Track[] = Array.from(newMatchupData.reverseScoreMap.entries())
                .sort(([scoreA], [scoreB]) => scoreB - scoreA) // Sort scores in descending order
                .flatMap(([, names]) => Array.from(names).map(name => props.itemMap.get(name)!)); // Replace name with DetailedTrack from itemMap

            console.log(finalRanking.length, props.itemMap.size);

            /* Draw final order from reverse score map values. */
            props.onEnd(finalRanking);
        }

        /* DEBUGGING
        console.log("_________________________")
        newMatchupData.reverseScoreMap.forEach((value, key) => {
            const set = new Set();
            value.forEach((item) => {
                set.add(props.itemMap.get(item)?.track.name);
            });
            console.log(`Final Score: ${key} - ${Array.from(set)}`);
        });
        console.log("")
        console.log("")
        */
    }

    return (
        <section className='h-full w-full flex justify-center items-center'>
            {leftChoice && rightChoice &&
            <>
                <main className='flex justify-center items-center flex-row mb-[2rem]'>
                    <div className="flex flex-col items-center h-[21rem] w-[17rem] pt-[1rem] mx-[1rem] cursor-pointer bg-base-100 border-2 border-neutral rounded-sm shadow-md"
                        onClick={() => {
                            makeChoice(leftChoice.id, rightChoice.id)
                        }}
                    >
                        <Image
                            src={leftChoice.images[0].url}
                            alt={leftChoice.title}
                            width={leftChoice.images[0].width}
                            height={leftChoice.images[0].height}
                            className='h-[15rem] w-[15rem] border-2 border-neutral rounded-sm'
                        ></Image>
                        <div className='flex flex-col items-center pt-[0.75rem]'>
                            <div className='text-[1.05rem] font-semibold truncate max-w-[18ch]'>
                                {leftChoice?.title}
                            </div>
                            <div className='text-[0.9rem] uppercase font-semibold opacity-70 truncate max-w-[18ch]'>
                                {leftChoice?.album_title}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center h-[21rem] w-[17rem] pt-[1rem] mx-[1rem] cursor-pointer bg-base-100 border-2 border-neutral rounded-sm shadow-md"
                        onClick={() => {
                            makeChoice(rightChoice.id, leftChoice.id)
                        }}
                    >
                        <Image
                            src={rightChoice.images[0].url}
                            alt={rightChoice.title}
                            width={rightChoice.images[0].width}
                            height={rightChoice.images[0].height}
                            className='h-[15rem] w-[15rem] border-2 border-neutral rounded-sm'
                        ></Image>
                        <div className='flex flex-col items-center pt-[0.75rem]'>
                            <div className='text-[1.05rem] font-semibold truncate max-w-[18ch]'>
                                {rightChoice?.title}
                            </div>
                            <div className='text-[0.9rem] uppercase font-semibold opacity-70 truncate max-w-[18ch]'>
                                {rightChoice?.album_title}
                            </div>
                        </div>
                    </div>
                </main>
            </>
            }
        </section>
    )
}