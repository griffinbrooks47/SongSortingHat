'use client'

import { IconArrowBadgeRight } from "@tabler/icons-react";
import Link from "next/link";

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
interface Album {
    album_type: string;
    total_tracks: number;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    type: string;
    artists: Artist[];
}

export default function RankButton(props: {artist: Artist, albums: Album[]}) {

    /* Dynamic url redirect to current artist. */
    const redirectUrl: string = "/rank/" + props.artist.id

    /* Add current artist and discography to local storage. */
    const onClick = () => {
        localStorage.setItem("artist", JSON.stringify(props.artist));
        localStorage.setItem("albums", JSON.stringify(props.albums));
    }

    return (
        <Link href={redirectUrl} onClick={() => {onClick()}} className="btn btn-outline rounded-md mr-[0.25rem]">
            <p className="pl-[0.75rem]">Rank this artist</p>
            <IconArrowBadgeRight className="ml-[-0.25rem]" />
        </Link>
    )
}