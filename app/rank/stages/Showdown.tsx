'use client'

/* Graph library for node visualization. */
import { applyNodeChanges, ReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';

/* Interface imports. */
import { DetailedTrack } from "@/types/artist";

/* React imports. */
import { useState, useReducer, useCallback } from "react";
import Image from "next/image";

/* Data structure imports. */
import Ranker from "../[artistId]/objects/rank2";
import MatchupQueue from "../[artistId]/objects/matchupQueue";
import TrackNode from "../[artistId]/objects/TrackNode";

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

/* Define node interface for ReactFlow */
interface Node {
    id: string;
    data: {
        label: string;
    };
    position: { x: number, y: number };
}

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

export default function Showdown(props: { itemMap: Map<string, DetailedTrack> }) {

    /* Throw an error if the ranking pool isn't properly defined. */
    if(props.itemMap.size < 2) {
        throw new Error("Ranking pool contains too few elements.")
    }

    /* ReactFlow Nodes */
    const [nodes, setNodes] = useState<Node[]>([]);
    /* 
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    )
    */

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

        if(newMatchupData.isComplete) {
            console.log("Ranking finished.")
        }

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

        /* Update graph visual. */
        const nodes: Node[] = [];
        const visitedItems: Set<string> = new Set();

        /* Step 1: Get node with highest score (top of tree). */
        const topScore: number = Math.max(...Array.from(newMatchupData.reverseScoreMap.keys()));
        const topNodes: Set<string> | undefined = newMatchupData.reverseScoreMap.get(topScore);

        /* Step 2: Traverse tree recursively.  */
        const recurseTree = (nodeID: string, prevY: number): void => {
            /* Ensure node exists or hasn't been visited yet. */
            if(visitedItems.has(nodeID) || !newMatchupData.nodeMap.has(nodeID)) {
                return;
            }
            visitedItems.add(nodeID);
            const node: TrackNode = newMatchupData.nodeMap.get(nodeID)!;
            const x: number = 0;
            const y: number = prevY + 100;
            nodes.push({
                id: nodeID,
                data: {
                    label: props.itemMap.get(nodeID)!.track.name
                },
                position: {
                    x: x,
                    y: y
                }
            });
            node.getBelow().forEach((childNode: TrackNode) => {
                recurseTree(childNode.getID(), y);
            });
        }
        if(topNodes){
            topNodes.forEach((nodeID: string) => {
                recurseTree(nodeID, -1);
            });
        }

        /* Update graph. */
        setNodes(nodes);
    }

    return (
        <section className='h-full w-full flex justify-center items-center'>
            {leftChoice && rightChoice &&
            <>
                <main>
                    <div className="h-[15rem] w-[15rem] my-[3rem] cursor-pointer"
                        onClick={() => {
                            makeChoice(leftChoice.track.id, rightChoice.track.id)
                        }}
                    >
                        <Image
                            src={leftChoice.cover.url}
                            alt={leftChoice.track.name}
                            width={leftChoice.cover.width}
                            height={leftChoice.cover.height}
                        ></Image>
                        {leftChoice?.track.name}
                    </div>
                    <div className="h-[15rem] w-[15rem] my-[3rem] cursor-pointer"
                        onClick={() => {
                            makeChoice(rightChoice.track.id, leftChoice.track.id)
                        }}
                    >
                        <Image
                            src={rightChoice.cover.url}
                            alt={rightChoice.track.name}
                            width={rightChoice.cover.width}
                            height={rightChoice.cover.height}
                        ></Image>
                        {rightChoice?.track.name}
                    </div>
                </main>
                <div className="h-full w-[30rem]">
                    <ReactFlow 
                        nodes={nodes}
                        fitView
                    />
                </div>
            </>
            }
        </section>
    )
}