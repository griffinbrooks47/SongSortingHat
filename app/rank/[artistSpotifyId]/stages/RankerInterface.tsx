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
import { TrackWithRelations, AlbumWithRelations } from "../page";
import { Album, Track } from "@/types/artist"
import { useRouter } from "next/navigation";
import { AlbumImage } from "@/prisma/generated/prisma/client";

export default function RankerInterface(
    { artistSpotifyId, albums }: { artistSpotifyId: string, albums: AlbumWithRelations[] }
) {

    /* Current Ranking Stage */
    const [stage, setStage] = useState(0);

    const [albumMap, setAlbumMap] = useState<Map<string, AlbumWithRelations>>(new Map());
    const [albumList, setAlbumList] = useState<AlbumWithRelations[]>([]);

    /* Maps SpotifyID to Track for quick indexing. */
    const [songMap, setSongMap] = useState<Map<string, TrackWithRelations>>(new Map());
    const [songList, setSongList] = useState<TrackWithRelations[]>([]);

    /* Track ID to Album Image */
    const [trackToImage, setTrackToImage] = useState<Map<string, AlbumImage>>(new Map());

    const router = useRouter();

    /* 
        Choose Albums
        - Select which albums to include in the ranking. 
    */  
    const chooseAlbums = (selectedAlbumIds: string[]) : void => {

        const newSongMap: Map<string, TrackWithRelations> = songMap;

        const newAlbumMap: Map<string, AlbumWithRelations> = new Map();
        const newAlbumList: AlbumWithRelations[] = [];

        const newTrackToImage: Map<string, AlbumImage> = new Map();

        for(const albumId of selectedAlbumIds) {
            const album = albumMap.get(albumId);
            if(!album || album.tracks.length == 0) {
                continue;
            }

            const albumImage: AlbumImage = album.images[0];

            newAlbumMap.set(albumId, album);
            newAlbumList.push(album);
            for(const track of album.tracks) {
                newSongMap.set(track.id, track);
                newTrackToImage.set(track.id, albumImage);
            }
        }

        setAlbumMap(newAlbumMap);
        setSongMap(newSongMap);
        setTrackToImage(newTrackToImage);

        setAlbumList(newAlbumList);

        setStage(prev => {
            return prev + 1;
        })
    }

    /* 
        Assemble
        - Remove the specified tracks from the ranking pool. 
    */
    const assemble = (selectedTrackIds: string[]) : void => {

        const newSongList: TrackWithRelations[] = [];
        for(const newId of selectedTrackIds) {
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
    const rank = (ranking: string[]) : void => {

        const newSongList: TrackWithRelations[] = [];

        for(const newId of ranking) {
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
        const tempAlbumMap: Map<string, AlbumWithRelations> = new Map(); 
        for(const album of albums) {
            tempAlbumMap.set(album.id, album);
        }
        setAlbumMap(tempAlbumMap);

    }, [albums, setAlbumMap]);

    /* 
        Showdown
    */

    return (
        <main className="w-full h-full flex flex-col items-center justify-center">
            {(stage == 0) && 
                <ChooseAlbums
                    albums={albums}
                    onEnd={chooseAlbums}
                ></ChooseAlbums>
            }
            {(stage == 1) && 
                <Assemble
                    albums={albumList}
                    trackToImage={trackToImage}
                    onEnd={assemble}
                ></Assemble>
            }
            {(stage == 2) &&
                <Rank 
                    tracks={songList}
                    trackToImage={trackToImage}
                    onEnd={rank}
                ></Rank>
            }
            {(stage == 3) && 
                <Sorting 
                    tracks={songList}
                    trackToImage={trackToImage}
                    onEnd={handleSaveSorting}
                />
            }
        </main>
    )
}