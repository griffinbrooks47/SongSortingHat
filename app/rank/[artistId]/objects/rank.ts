
import MatchupQueue from "./matchupQueue";


/* Artist Data*/
interface Artist {
    id: string;
    name: string;
    images: Img[];
    external_urls: {spotify: string};
    followers: {total: number};
    genres: string[];
    popularity: number;
}
interface Img {
    width: number;
    height: number;
    url: string;
}
interface Track {
    artists: Artist[];
    id: string;
    name: string;
    track_number: number;
}
interface DetailedTrack {
    track: Track;
    cover: Img;
}

class Ranker {

    /* Songs user selects as ranking pool. */
    private matchups: MatchupQueue;

    /* Song Pool. */
    private trackIDs: Set<string>;

    /* Indicates if order is finalized. */
    private isComplete: boolean;

    /* Maps ids to track object. */
    private trackMap: Record<string, DetailedTrack>;

    /* Maps track id to score. */
    private scoreMap: Record<string, number>;

    /* Maps score to tracks with that score. */
    private reverseScoreMap: Record<number, Set<string>>;

    /* Maps track id to track ids it is ranked above directly. */
    private choiceCache: Record<string, Set<string>>;

    constructor(trackMap: Record<string, DetailedTrack>) {
        this.matchups = new MatchupQueue();
        this.trackIDs = new Set(Object.keys(trackMap));
        this.isComplete = false;
        this.trackMap = trackMap;
    }
    public runAlgorithm(): void {

    }
    public choose(trackID: string): [DetailedTrack, DetailedTrack] {
        

        
        
        
        return [

        ]
    }



}

export default Ranker;