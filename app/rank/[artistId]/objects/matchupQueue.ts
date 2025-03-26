

class MatchupQueue {

    /* Array of string pairs. */
    private matchups: [string, string][];

    /* Instantiate empty queue. */
    constructor() {
        this.matchups = [];
    }

    /* Enqueue a new matchup. */
    public enqueue(newMatchup: [string, string]): void {
        /* Ensure matchup hasn't already been queued. */
        if(this.checkIfDupe(newMatchup) == false) {
            this.matchups.push(newMatchup);
        }
    }
    /* Dequeue and return the matchup at the front of the queue. */
    public dequeue(): [string, string] | undefined {
        return this.matchups.shift();
    }
    /* Return the queue length. */
    public getLength(): number {
        return this.matchups.length;
    }

    public toStringArray(): string[] {

        const stringArray: string[] = [];

        for (const matchup of this.matchups) {
            stringArray.push(matchup[0] + " vs " + matchup[1]);
        }
        return stringArray;
    }

    /* Check if the matchup already exists in the queue. */
    private checkIfDupe(matchup: [string, string]): boolean {
        return this.matchups.some(existing => this.compareMatchups(existing, matchup));
    }

    /* Compare two matchups, treating [A, B] as the same as [B, A]. */
    private compareMatchups(first: [string, string], second: [string, string]): boolean {
        return (
            (first[0] === second[0] && first[1] === second[1]) ||
            (first[0] === second[1] && first[1] === second[0])
        );
    }
}

export default MatchupQueue;