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



const rankerReducer = (state, action) => {
    switch (action.type) {
        
    }
}

export default function Showdown(props: {itemMap: Map<string, DetailedTrack>}) {

    /* Current choices displayed on screen. */
    const [leftChoice, setLeftChoice] = useState<DetailedTrack | undefined>();
    const [rightChoice, setRightChoice] = useState<DetailedTrack | undefined>();





    



    return (
        <section className='h-full w-full flex justify-center items-center'>
            {leftChoice && rightChoice &&
                <>
                    <div className="h-[15rem] w-[15rem] mx-[1rem] cursor-pointer"
                        onClick={() => handleChoice(leftChoice.track.id)}
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
                        onClick={() => handleChoice(rightChoice.track.id)}
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