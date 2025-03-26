
import { SongCard } from "./SongCard";

import { DetailedTrack } from "@/types/artist";

export default function SongGrid(props: { tracks: DetailedTrack[], count: number, toggleSong: (id: string, detailedTrack: DetailedTrack) => void }) {
    return (
        <section className="grid grid-cols-5 grid-rows-3 gap-4 mx-auto overflow-hidden relative">
            {props.tracks.map((song: DetailedTrack) => {
                return (
                    <SongCard key={song.track.id} track={song}
                        onClick={props.toggleSong}
                    />
                )
            })}
        </section>
    )
}