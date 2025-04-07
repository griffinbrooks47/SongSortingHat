
/* Next Imports. */
import Link from "next/link";
import Image from "next/image"

/* Sample data. */
//import { sampleArtist, sampleDetailedAlbums } from "./objects/sampleArtist";

/* UI Components. */
import { IconBrandSpotify, IconHeart, IconSwitch } from "@tabler/icons-react";
//import { AlbumCard } from "./components/albumCard";

/* Custom Types */
import { Artist, Album } from "@/types/artist";

/* Music data types. */


/* Spotify API Wrapper. */
import spotify from "@/clients/spotify/spotify";

/* Database Wrapper. */


export default async function ArtistPage({
    params,
    }: {
    params: Promise<{ artist: string }>
  }) {

    /* Artist ID */
    const artistId = (await params).artist;

    /* Artist profile data. */
    let artist: Artist | null = null;
    let albums: Album[] | null = null;

    /* Query DB for artist. */
    


    /* If DB returns artist, query albums. */
    if(artist) {
        
    }
    /* If DB doesn't return an artist, request it from Spotify API. */
    else {
        /* Get artist data. */
        artist = await spotify.getArtist(artistId)
        albums = artist?.albums || null;
        if(!albums || !artist) {
            throw new Error("Artist or albums not found.");
        }
    }

    /* If artist & albums are undefined, return null. */
    if(!artist) {
        console.log("Artist & Albums not fetched from spotify.")
        return;
    }

    return (
        <main className="page flex justify-center items-center flex-col">
            
            <div className="mt-[5rem]">
                <div className="relative h-[17.5rem] mb-[2rem] flex flex-row justify-between items-start rounded-md">
                    <section className="pt-[0rem] mt-[0.5rem] mb-[2rem] flex flex-row min-w-[30rem]">
                        <div className="ml-[1.5rem] pr-[5rem] my-auto">
                            <p
                                className="text-[2.75rem] font-bold break-words overflow-hidden 
                                        line-clamp-2 text-ellipsis max-w-full leading-[3.65rem]"
                                style={{
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 2,
                                    whiteSpace: "normal",
                                }}
                            >
                                {artist.name.length > 40 ? artist.name.slice(0, 40) + "..." : artist.name}
                            </p>
                            <p className="text-[1.15rem] mt-[0rem] font-semibold opacity-80 truncate max-w-[40ch] leading-[1.25rem]">
                                {artist.followers + " followers"}
                            </p>
                            <p className="text-[0.95rem] my-[0.25rem] font-semibold uppercase opacity-60 truncate max-w-[40ch] leading-[1rem]">
                                {" projects"}
                            </p>
                            <div className="flex">
                                <button className="mr-[0.5rem] my-[0.5rem] w-[3.25rem] h-[3.25rem] border-2 border-neutral opacity-80 flex rounded-full justify-center items-center">
                                    <IconHeart className="w-8 h-8" />
                                </button>
                            </div>
                        </div>
                    </section>
                    <div className="h-full">
                        <figure className="h-full z-10 aspect-w-1 aspect-h-1">
                            <Image
                            src={artist.images[0].url}
                            width={280} 
                            height={280}
                            alt={artist.name}
                            className="h-full rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.8)] object-cover"
                            />
                        </figure>
                    </div>
                </div>
            </div>
            <section className="relative">
                
            </section>
            <section className="flex justify-center items-start flex-col mt-[0.5rem]">
                <hr className="border-black opacity-10 w-[95%] mr-auto my-[0.05rem]"></hr>
                <ul className="flex justify-center items-center w-full">
                    <li className="mx-[0.25rem]">
                        <Link href={`/rank/${artist.spotifyId}`} className="mt-auto px-[0.75rem] py-[0.5rem] border-2 bg-accent border-neutral shadow-sm opacity-80 flex rounded-md justify-center items-center">
                            <p className="font-semibold text-[1rem] color-accent">Start Sorting</p>
                            <IconSwitch className="w-8 h-8" />
                        </Link>
                    </li>
                    <li className="mx-[0.25rem]">
                        <button className="my-[0.5rem] w-[3.25rem] h-[3.25rem] border-2 border-neutral bg-success opacity-80 flex rounded-lg justify-center items-center">
                            <IconBrandSpotify className="w-8 h-8" />
                        </button>
                    </li>
                </ul>
                <hr className="border-black opacity-10 w-[95%] ml-auto my-[0.05rem]"></hr>
                <div className="flex ml-[1rem] flex justify between w-full">
                    <ul className="ml-auto my-[1rem] mr-[2rem] bg-base-100 shadow-sm rounded-md flex justify-center items-center py-[0.25rem]">
                        <li>
                            <a className="h-[2.5rem] rounded-sm flex justify-center items-center px-[1rem] ml-[0.25rem] mr-[0.25rem] bg-base-200">
                                Albums
                            </a>
                        </li>
                        <li>
                            <a className="h-[2.5rem] rounded-sm flex justify-center items-center px-[1rem] mr-[0.25rem] bg-base-100">
                                Songs
                            </a>
                        </li>
                        <li>
                            <a className="h-[2.5rem] rounded-sm flex justify-center items-center px-[1rem] mr-[0.25rem] bg-base-100">
                                Lists
                            </a>
                        </li>
                    </ul>
                </div>
                
            </section>
        </main>
    )
}

/* 

<div className="grid grid-cols-4 gap-3">
                    {albums?.map((album) => (
                        <AlbumCard
                            image={album.images[0]}
                            name={album.name}
                            key={album.spotifyId}
                        >
                        </AlbumCard>
                    ))}
                </div>

*/