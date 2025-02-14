
import { SongCard } from "./SongCard";

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