'use client'

import Image from "next/image"
import { useRouter } from 'next/navigation'

interface Artist {
    id: string;
    name: string;
    images: Image[];
}
interface Image {
    width: number;
    height: number;
    url: string;
}

export const ArtistCard = (props: {artist: Artist, img: string, width: number, height: number}) => {

    const router = useRouter();

    return (
        <div className="w-[15rem] h-[15rem] overflow-hidden cursor-pointer"
            onClick={() => {
                /* Add selected artist to local storage cache. */                
                localStorage.setItem(`${props.artist.name}`, JSON.stringify(props.artist))
                router.push(`/artist/${props.artist.name}`)
            }}
        >
            <Image
                src={props.img}
                priority={true}
                alt="Artist Picture"
                width={props.width} height={props.height}
             />
        </div>
    )
}