
class TrackNode {

    /* Stores immeadiate nodes ranked above and below this track. */
    private above: Set<TrackNode>
    private below: Set<TrackNode>

    private id: string;

    constructor(id: string) {
        this.id = id;
        this.above = new Set();
        this.below = new Set();
    }
    public create_below_edge(trackNode: TrackNode): void {
        if(trackNode == this) {
            
        } else {
            this.below.add(trackNode);
        }
    }
    public create_above_edge(trackNode: TrackNode): void {
        if(trackNode == this) {
           
        } else {
            this.above.add(trackNode);
        }
    }
    public removeEdge(trackNode: TrackNode): void {
        this.below.delete(trackNode);
    }
    public checkBelow(): boolean{
        return (this.below.size > 1);
    }
    public checkAbove(): boolean{
        return (this.above.size > 1);
    }
    public getID(): string {
        return this.id;
    }
    public getBelow(): Set<TrackNode>{
        return this.below;
    }
    public getAbove(): Set<TrackNode>{
        return this.above;
    }
}

export default TrackNode;

