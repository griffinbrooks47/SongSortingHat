
/* 
    LEGACY CODE
    Not optimized for a react environment.
*/

import MatchupQueue from "./matchupQueue";
import TrackNode from "./TrackNode";

class Ranker {

    /* Current Matchup */
    private currMatchup: [string, string] | undefined;

    /* Songs user selects as ranking pool. */
    private matchups: MatchupQueue;

    /* Song Pool. */
    private trackIDs: Set<string> | undefined;

    /* Indicates if order is finalized. */
    private isComplete: boolean;

    /* Maps ids to track object. */
    private trackMap: Map<string, TrackNode> | undefined;

    /* Maps track id to score. */
    private scoreMap: Map<string, number>;

    /* Maps score to tracks with that score. */
    private reverseScoreMap: Map<number, Set<string>>;

    /* Maps track id to track ids it is ranked above directly. */
    private choiceCache: Map<string, Set<string>>;

    constructor() {

        /* Initialize all data structures. */
        this.matchups = new MatchupQueue();

        this.isComplete = false;

        this.scoreMap = new Map();
        this.reverseScoreMap = new Map();
        this.choiceCache = new Map();

    }

    public initSongs(trackSet: Set<string>): void {
        this.trackIDs = trackSet;
        /* Create track nodes.  */
        this.trackMap = new Map();
        for(const id of trackSet) {
            const trackNode = new TrackNode(id);
            this.trackMap.set(id, trackNode);
        }
    }


    /* 
        Initializes the ranking process. 
    */
    public runAlgorithm(): [string, string] {

        if(!this.trackIDs){
            throw new Error("Tracks not initialized.")
        }

        /* Start arbitrarily with first track. */
        const firstID: string = [...this.trackIDs][0];
        this.trackIDs.delete(firstID); // Delete from set

        /* Start arbitrarily with second track. */
        const secondID: string = [...this.trackIDs][0];
        this.trackIDs.delete(secondID); // Delete from set

        /* Create first matchup. */
        const firstMatchup: [string, string] = [firstID, secondID];

        return firstMatchup
    }
    /* 
        Handles user choice for current matchup, returns next matchup. 
        Returns empty array if ranking is complete. 
    */
    public makeChoice(winnerID: string): [string, string] | undefined {

        if(!this.trackMap) {
            throw new Error("Track Map not defined. ")
        }

        console.log(this.currMatchup, winnerID);

        /* Throw error if no matchup has been set. */
        if(!this.currMatchup) {
            throw new Error("No matchup found.")
        }
        /* Throw error if choice isn't valid. */
        if(!this.currMatchup.includes(winnerID)) {
            throw new Error("Choice not found in current matchup.")
        }

        const loserID: string = (winnerID == this.currMatchup[0]) 
            ? this.currMatchup[1] : this.currMatchup[0];

        const winnerNode: TrackNode | undefined = this.trackMap.get(winnerID);
        const loserNode: TrackNode | undefined =  this.trackMap.get(loserID);

        if(!winnerNode || !loserNode) {
            throw new Error("Nodes not found");
        }

        /* Create graph edges. */
        winnerNode.create_below_edge(loserNode);
        loserNode.create_above_edge(winnerNode);

        if(!this.choiceCache.has(winnerID)) {
            this.choiceCache.set(winnerID, new Set());
        }
        this.choiceCache.get(winnerID)?.add(loserID);

        /* Score entire tree, following the addition of winner/loser node edges. */
        this.scoreTree();

        /* Add new song to matchup pool and queue matchup. */
        this.genChoice();

        /* Scan the tree and add matchups that fix all first degree node branch splits. */
        this.resolveBranches();

        if(this.matchups.getLength() <= 0) {
            this.isComplete = true;
        } else {
            while(true) {

                /* Dequeue the next matchup in line. */
                this.currMatchup = this.matchups.dequeue();

                /* If no matchup can be dequeued, terminate. */
                if(!this.currMatchup) {
                    break;
                }

                /* Ensure answering the matchup does not create graph cycles. */
                if(this.checkSafeMatchup(this.currMatchup)) {
                    /* Automatically make choice for user if possible. */
                    if(this.tryToResolve(this.currMatchup)) {
                        continue; // Dequeue the next matchup.
                    } 
                    /* If not, defer to user choice. */
                    else {
                        break;
                    }
                }
            }
        }

        /* Return matchup to view. */
        return this.currMatchup;
    }

    private scoreTree(): void {

        if(!this.trackIDs) {
            throw new Error("Tracks not initialized. ")
        }
        if(!this.trackMap) {
            throw new Error("Track Map not defined. ")
        }

        /* Clear the score maps. */
        this.scoreMap.clear();
        this.reverseScoreMap.clear();

        /* Iterate over every track, */
        for (const [id, track] of this.trackMap.entries()) {
            if(!this.trackIDs.has(id)) {
                this.scoreTreeBelow(track); // Call recursive helper 
            }
        }
    }
    private scoreTreeBelow(track: TrackNode): number {

        /* Get the tracks ranked below track.  */
        const children: Set<TrackNode> = track.getBelow();
        const id: string = track.getID();

        /* Base Case: No children, return 0. */
        if(children.size <= 0) {
            this.scoreMap.set(id, 0);
            this.addToReverseScoreMap(0, id);
            
            return 0;
        } 

        /* Base Case: Score aleady calculated, return score. */
        else if(this.scoreMap.has(id)) {
            return this.scoreMap.get(id)!;
        } 

        /* Step Case: Recursively calculate child score to find current node score. */
        else {
            let maxChildScore: number = 0;

            /* Find the largest score of the current child nodes. */
            for(const child of children) {
                /* Recursively calculate score. */
                const currChildScore: number = this.scoreTreeBelow(child);
                /* Set is as new highest score if larger than current max. */
                maxChildScore = currChildScore > maxChildScore ? currChildScore : maxChildScore;
            }

            /* Update score maps. */
            this.scoreMap.set(id, maxChildScore + 1); // Largest child score + 1 = parent score
            this.addToReverseScoreMap(maxChildScore + 1, id);

            return maxChildScore;
        }
    }

    private genChoice(): void {

        if(!this.trackIDs) {
            throw new Error("Tracks not initialized. ")
        }

        if(this.trackIDs.size > 0) {

            /* Get arbitrary track for next matchup. */
            const left = this.trackIDs.values().next().value!;

            /* Find the best matchup to pair with left. */
            const right = this.findBestMatch();

            this.trackIDs.delete(left)

            /* Queue the next matchup. */
            if(this.trackIDs.size > 0) {
                const matchup: [string, string] = [left, right];
                this.matchups.enqueue(matchup);
            }
        }
    }

    private resolveBranches(): void {

        if(!this.trackMap) {
            throw new Error("Track Map not defined. ")
        }

        /* Step 1: Fix edges that fall under transitive property ~ no matchups created here. */

        /* Remove edges between neighboring nodes with a difference in degree > 1. */
        for (const [id, parent] of this.trackMap.entries()) {
            
            /* Skip iteration if a score hasn't been assigned to the current song. */
            if(!this.scoreMap.has(id)) {
                continue;
            }

            /* Get parent score. */
            const parentScore: number = this.scoreMap.get(id)!;

            /* Get the children of parent node. */
            const children: Set<TrackNode> = parent.getBelow();

            const edgesToRemove: Set<TrackNode> = new Set();

            /* If degree of rank difference is more than 1, remove edge. */
            for(const child of children) {
                const childScore: number = this.scoreMap.get(child.getID())!;

                if(Math.abs(parentScore - childScore) > 1) {
                    edgesToRemove.add(child)
                }
            }

            /* Remove edges. */
            for(const child of edgesToRemove) {
                parent.removeEdge(child);
            }
        }

        /* Step 2: Create necessary matchups ~ songs of same score are candidates. */
        for (const [, idSet] of this.reverseScoreMap.entries()) {

            const idSetLength: number = idSet.size;

            if(idSetLength >= 2) {

                const idList: string[] = Array.from(idSet);

                /* Add matchups for every two songs of same score. */
                for(let i = 0; i < idSetLength - idSetLength%2; i += 2) {
                    const left: string = idList[i];
                    const right: string = idList[i+1];

                    const newMatchup: [string, string] = [left, right];
                    this.matchups.enqueue(newMatchup);
                }
            }
        }
    }

    /* Helper Methods. */

    private tryToResolve(matchup: [string, string]): boolean {

        /* Grab the matchup IDs. */
        const left: string = matchup[0];
        const right: string = matchup[1];

        if(!this.choiceCache.has(left) && this.choiceCache.get(left)?.has(right)){
            this.makeChoice(left);
            return true;
        }
        else if(this.choiceCache.has(right) && this.choiceCache.get(right)?.has(left)) {
            this.makeChoice(right);
            return true;
        }

        return false;
        
    }
    private checkSafeMatchup(matchup: [string, string]): boolean {

        /* Grab the matchup IDs. */
        const left: string = matchup[0];
        const right: string = matchup[1];

        if(!this.scoreMap.has(left) || !this.scoreMap.has(right)) {
            return true;
        }

        const leftScore: number | undefined = this.scoreMap.get(left);
        const rightScore: number | undefined = this.scoreMap.get(right);

        return (leftScore == rightScore)

    }
    /* 
        Currently not optimized - picks middle song from score map. 
    */
    private findBestMatch(): string {

        /* WRITE BETTER METHOD IN FUTURE */
        return this.scoreMap.keys().next().value!;
    }
    private addToReverseScoreMap(score: number, title: string): void {

        /* If score bucket exists, put title inside. */
        if(this.reverseScoreMap.has(score)) {
            this.reverseScoreMap.get(score)?.add(title)
        }

        /* Otherwise, create bucket and add. */
        else {
            const idSet: Set<string>  = new Set();
            idSet.add(title);
            this.reverseScoreMap.set(score, idSet);
        }

    }



}

export default Ranker;