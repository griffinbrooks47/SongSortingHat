'use client'

/* React */
import { useEffect, useState } from "react";

/* Next Server Actions */
import { saveSorting } from '../actions';

/* Ranker Stages */
import ChooseAlbums from "./ChooseAlbums";
import Assemble from "./Assemble";
import Rank from "./Rank";
import Sorting from "./Sorting";

/* Types */
import { Album, Track } from "@/types/artist"
import { useRouter } from "next/navigation";

export default function RankerInterface(
    { artistSpotifyId, albums, singles }: { artistSpotifyId: string, albums: Album[], singles: Track[] }
) {

    /* Current Ranking Stage */
    const [stage, setStage] = useState(0);

    const [albumMap, setAlbumMap] = useState<Map<string, Album>>(new Map());

    /* Maps SpotifyID to Track for quick indexing. */
    const [songMap, setSongMap] = useState<Map<string, Track>>(new Map());
    const [songList, setSongList] = useState<Track[]>([]);

    const router = useRouter();

    /* 
        Choose Albums
        - Select which albums to include in the ranking. 
    */  
    const chooseAlbums = (selectedAlbumIds: string[]) : void => {

        const newSongList: Track[] = [];
        const newSongMap: Map<string, Track> = songMap;
        
        const newAlbumMap: Map<string, Album> = new Map();
        for(const albumId of selectedAlbumIds) {
            const album = albumMap.get(albumId);
            if(!album) {
                continue;
            }
            newAlbumMap.set(albumId, album);

            for(const track of album.tracks) {
                newSongList.push(track);
                newSongMap.set(track.spotifyId, track);
            }

        }
        for(const single of singles) {
            newSongList.push(single);
        }

        setSongList(newSongList);
        setAlbumMap(newAlbumMap);
        setSongMap(newSongMap);

        setStage(prev => {
            return prev + 1;
        })
    }

    /* 
        Assemble
        - Remove the specified tracks from the ranking pool. 
    */
    const assemble = (selectedIds: string[]) : void => {

        const newSongList: Track[] = [];
        for(const newId of selectedIds) {
            const track = songMap.get(newId);
            if (track === undefined)
                continue;
            newSongList.push(track);
        }

        setSongList(newSongList);

        setStage(prev => {
            return prev + 1;
        })
    }

    /* 
        Rank
        - Algorithmically determine the final ranking. 
    */
    const rank = (finalList: string[]) : void => {

        const newSongList: Track[] = [];

        for(const newId of finalList) {
            const track = songMap.get(newId);
            if (track === undefined)
                continue;
            newSongList.push(track);
        }

        setSongList(newSongList);

        setStage(prev => {
            return prev + 1;
        })
    }

    /* Save Sorting*/
    const handleSaveSorting = async (finalRanking: string[]) => {
        try {
            const result = await saveSorting(artistSpotifyId, finalRanking);
            console.log(result)
            if(result)
                router.push(`/sorting/${result.id}`)
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };
    
    
    /* Only set the songMap on page refresh. */
    useEffect(() => {
        
        setSongList(singles)
        
        const tempSingleMap: Map<string, Track> = new Map(); 
        for(const track of singles) {
            tempSingleMap.set(track.spotifyId, track);
        }
        setSongMap(tempSingleMap);

        const tempAlbumMap: Map<string, Album> = new Map(); 
        for(const album of albums) {
            tempAlbumMap.set(album.spotifyId, album);
        }
        setAlbumMap(tempAlbumMap);

    }, [albums, singles])

    /* 
        Showdown
    */

    return (
        <main className="w-full h-full flex flex-col items-center justify-center">
            {(stage == 0) && 
                <ChooseAlbums
                    albums={albums}
                    singles={singles}
                    onEnd={chooseAlbums}
                ></ChooseAlbums>
            }
            {(stage == 1) && 
                <Assemble
                    tracks={songList}
                    onEnd={assemble}
                ></Assemble>
            }
            {(stage == 2) &&
                <Rank 
                    tracks={songList}
                    onEnd={rank}
                ></Rank>
            }
            {(stage == 3) && 
                <Sorting 
                    tracks={songList}
                    onEnd={handleSaveSorting}
                />
            }
        </main>
    )
}