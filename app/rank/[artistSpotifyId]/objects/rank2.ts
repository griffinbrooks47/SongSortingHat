
/* 
    Version 1.0.0 Ranking Algorithm
    Future Optimizations
    ~ Implement a more efficient method for selecting the next matchup, utilizing a win/loss ratio. 
*/

import MatchupQueue from "./matchupQueue";
import TrackNode from "./TrackNode";

/* Return type when sending next iteration to view. */
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

/* 
    At each iteration, store:
    ~ matchupQueue
    ~ trackIDs
    ~ trackMap
    ~ scoreMap
    ~ reverseScoreMap
    ~ choiceCache
*/
export default class Ranker {

    /* Current matchup */
    private currMatchup: [string, string] | undefined;

    /* Item pool. */
    private trackIDs: Set<string>;

    /* Matchup queue. */
    private matchups: MatchupQueue;

    /* Maps ids to track objects. */
    private nodeMap: Map<string, TrackNode>;

    /* Maps track id to score. */
    private scoreMap: Map<string, number>;

    /* Maps score to tracks with that score. */
    private reverseScoreMap: Map<number, Set<string>>;

    /* Maps track id to track ids it is ranked above directly. */
    private choiceCache: Map<string, Set<string>>;

    private isComplete: boolean;

    /* Initialize all data structures. */
    constructor() {
        this.matchups = new MatchupQueue();
        
        this.trackIDs = new Set();
        this.nodeMap = new Map();

        this.scoreMap = new Map();
        this.reverseScoreMap = new Map();
        this.choiceCache = new Map();
        
        this.isComplete = false;
    }

    public initRanker(trackIds: string[]) {
        trackIds.forEach(id => {
            this.nodeMap.set(id, new TrackNode(id));
        });
        this.genChoice();
        return this.currMatchup;
    }

    /* 
        Given the date from the previous choice:
        ~ 
    */
    public iterate(
        prevMatchup: [string, string],
        prevMatchups: MatchupQueue, 
        prevTrackIDs: Set<string>,
        prevNodeMap: Map<string, TrackNode>, 
        prevScoreMap: Map<string, number>, 
        prevReverseScoreMap: Map<number, Set<string>>, 
        prevChoiceCache: Map<string, Set<string>>,
    ) {
        /* Init data structures for previous iteration. */
        this.currMatchup = prevMatchup;
        this.matchups = prevMatchups;
        this.trackIDs = prevTrackIDs;

        this.nodeMap = prevNodeMap;

        this.scoreMap = prevScoreMap;
        this.reverseScoreMap = prevReverseScoreMap;
        this.choiceCache = prevChoiceCache;
    }

    /* Ranker Interface */

    /* 
        Updates the current rankings given the winner and loser of current matchup. 
    */
    public makeChoice(winnerID: string, loserID: string) {

        /* Throw error if no matchup has been set. */
        if(!this.currMatchup) {
            throw new Error("No matchup found.")
        }
        /* Throw error if choice isn't valid. */
        if(!this.currMatchup.includes(winnerID) || !this.currMatchup.includes(loserID)) {
            throw new Error("Choice not found in current matchup.")
        }

        const winnerNode: TrackNode | undefined = this.nodeMap.get(winnerID);
        const loserNode: TrackNode | undefined =  this.nodeMap.get(loserID);

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

    public getNewMatchups(): MatchupData {

        if(!this.currMatchup) {
            throw new Error("No current matchup, can't return from ranker. ")
        }

        /* Package all fields together. */
        const matchupData: MatchupData = {
            currMatchup: this.currMatchup,
            matchups: this.matchups,
            trackIDs: this.trackIDs,
            nodeMap: this.nodeMap,
            scoreMap: this.scoreMap,
            reverseScoreMap: this.reverseScoreMap,
            choiceCache: this.choiceCache,
            isComplete: this.isComplete,
        };

        return matchupData
    }

    /* PRIVATE METHODS */

    /* 
        Score the entire tree, first clearing maps then deferring to helper method. 
    */
    private scoreTree(): void {

        if(!this.trackIDs) {
            throw new Error("Tracks not initialized. ")
        }
        if(!this.nodeMap) {
            throw new Error("Node Map not defined. ")
        }

        /* Clear the score maps. */
        this.scoreMap.clear();
        this.reverseScoreMap.clear();

        /* Iterate over every track, */
        for (const [id, track] of this.nodeMap.entries()) {
            if(!this.trackIDs.has(id)) {
                this.scoreTreeBelow(track); // Call recursive helper 
            }
        }
    }

    /* 
        Recursively score a node by calculating scores of its child nodes. 
    */
    private scoreTreeBelow(track: TrackNode): number {

        /* Get the tracks ranked below track.  */
        const children: Set<TrackNode> = track.getBelow();
        const id: string = track.getID();

        /* Base Case: Score aleady calculated, return score. */
        if(this.scoreMap.has(id)) {
            return this.scoreMap.get(id)!;
        } 

        /* Base Case: No children, return 0. */
        else if(children.size <= 0) {
            this.scoreMap.set(id, 0);
            this.addToReverseScoreMap(0, id);
            return 0;
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

            return maxChildScore + 1;
        }
    }

    /* 
        Create the next matchup, introducing a new item. 
    */
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

    /* 
        Scans the entire graph:
        1. Fix Transitive connections (i.e. A > B && B > C -> if edge A > C exists, remove it. )
        2. Add matchups between songs of same rank (i.e. A > C && B > C, add A vs B matchup. )
    */
    private resolveBranches(): void {

        if(!this.nodeMap) {
            throw new Error("Track Map not defined. ")
        }

        /* Step 1: Fix edges that fall under transitive property ~ no matchups created here. */

        /* Remove edges between neighboring nodes with a difference in degree > 1. */
        for (const [id, parent] of this.nodeMap.entries()) {
            
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

    /* 
    Helper Methods. 
    */

    /* 
        Given a matchup, automatically resolve it if the choice has been made explicitly by user already. 
    */
    private tryToResolve(matchup: [string, string]): boolean {

        /* Grab the matchup IDs. */
        const left: string = matchup[0];
        const right: string = matchup[1];

        if(!this.choiceCache.has(left) && this.choiceCache.get(left)?.has(right)){
            this.makeChoice(left, right);
            return true;
        }
        else if(this.choiceCache.has(right) && this.choiceCache.get(right)?.has(left)) {
            this.makeChoice(right, left);
            return true;
        }

        return false;
    }

    /* 
        
    */
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

    /* 
        Maps a song title to its new score. 
    */
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

    /* FOR TESTING PURPOSES */
    public buildDevGraph(): void {

    }
}