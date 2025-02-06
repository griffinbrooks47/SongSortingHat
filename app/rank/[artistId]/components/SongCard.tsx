
interface Track {
    artists: Artist[];
    id: string;
    name: string;
    track_number: number;
}
interface Artist {
    id: string;
    name: string;
    images: Image[];
    external_urls: {spotify: string};
    followers: {total: number};
    genres: string[];
    popularity: number;
}
interface Image {
    width: number;
    height: number;
    url: string;
}

export const SongCard = (props: Track) => {
    return (
        <div className="bg-base-300 w-[15rem]">
            <p>
                {props.name}
            </p>
        </div>
    )
}