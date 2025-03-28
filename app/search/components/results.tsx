import { ArtistCard } from "@/app/search/components/artistCard";

import { Artist } from "@/types/artist";

export const Results = (props: {artists: Artist[]}) => {

    return (
        <section className="grid grid-cols-3 grid-rows-3 gap-4 rounded-none">
            {props.artists.map((artist) => {
                const image = artist.images?.[0] // Fallback to blank image

                if(!image) return;
                
                return (
                    <ArtistCard 
                        key={artist.id} 
                        artist={artist}
                        img={image.url} 
                        width={image.width} 
                        height={image.height}
                    />
                )}
            )}
        </section>
    )
}