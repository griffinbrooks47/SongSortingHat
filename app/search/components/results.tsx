import { ArtistCard } from "@/app/explore/components/artistCard";

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

export const Results = (props: {artists: Artist[]}) => {

    return (
        <section className="grid grid-cols-3 grid-rows-3 gap-4 rounded-none">
            {props.artists.map((artist) => {
                const image = artist.images?.[0] // Fallback to blank image

                if(!image) return;
                
                return (
                    <ArtistCard 
                        key={artist.id} 
                        name={artist.name} 
                        img={image.url} 
                        width={image.width} 
                        height={image.height}
                    />
                )}
            )}
        </section>
    )
}