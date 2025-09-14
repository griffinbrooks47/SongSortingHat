
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';

/* React Imports */
import { useState } from "react";

/* Types */
import { Track } from "@/types/artist";

/* Function that divides a flat array of tracks into groups of N */
const chunkArray = (arr: Track[], size: number) => {
  return arr.reduce((acc: Track[][], _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);
};

export default function Assemble({
  tracks,
  countPerSlide,
  onEnd,
}: {
  tracks: Track[];
  countPerSlide: number;
  onEnd: (removedIDs: string[]) => void;
}) {
  /* Set of spotify IDs */
  const [removedTracks, setRemovedTracks] = useState<Set<string>>(new Set());
  const toggleTrack = (spotifyID: string) => {
    setRemovedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(spotifyID)) {
        newSet.delete(spotifyID);
      } else {
        newSet.add(spotifyID);
      }
      return newSet;
    });
  };


  return (
    <>
    </>
  );
}
