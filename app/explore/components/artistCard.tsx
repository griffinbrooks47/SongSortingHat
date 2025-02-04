'use client'

import Image from "next/image"
import { useRouter } from 'next/navigation'

export const ArtistCard = (props: {name: string, img: string, width: number, height: number}) => {

    const router = useRouter();

    return (
        <div className="w-[15rem] h-[15rem] overflow-hidden cursor-pointer"
            onClick={() => {
                router.push(`/rank/${props.name}`)
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