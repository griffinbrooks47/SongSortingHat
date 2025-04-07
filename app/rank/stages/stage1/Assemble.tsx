import { DetailedTrack } from "@/types/artist";
import { SongCarousel } from "../../[artistId]/components/SongCarousel";

const chunkArray = (arr: DetailedTrack[], size: number) => {
    return arr.reduce((acc: DetailedTrack[][], _, i) => {
      if (i % size === 0) acc.push(arr.slice(i, i + size));
      return acc;
    }, []);
};

export default function Assemble(
    { songs, countPerSlide, toggleSong, onEnd } : {
    songs: DetailedTrack[];
    countPerSlide: number;
    toggleSong: () => void;
    onEnd: () => void;
}) {

    return (
        <main className='h-full w-full relative flex flex-col justify-center items-center mt-[1rem]'>
            <SongCarousel 
                songChunks={chunkArray(songs, countPerSlide)} 
                count={countPerSlide}
                toggleSong={toggleSong}
                onEnd={() => onEnd()}
            ></SongCarousel>
        </main>
    )
}

/* 
<main className='h-full w-full relative flex flex-col justify-center items-center mt-[1rem]'>
                    <SongCarousel 
                        songChunks={songChunks} 
                        count={countPerSlide}
                        toggleSong={toggleSong}
                        onEnd={() => {

                         
                            const selectedSongs: DetailedTrack[] = Object.values(idToSong);
                            compileSongs(selectedSongs);

                       
                            setStage(2);
                            setDashboardActive(true);
                        }}
                    ></SongCarousel>
                </main>
*/