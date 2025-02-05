import Image from "next/image"

interface Image {
    width: number;
    height: number;
    url: string;
}

export const AlbumCard = (props: { image: Image, name: string }) => {
    return (
        <div className="w-[15rem] h-[15rem] overflow-hidden">
            <Image
                src={props.image.url}
                width={props.image.width}
                height={props.image.height}
                alt={props.name}
            >
            </Image>
        </div>
    )
}