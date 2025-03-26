'use client'

import React, { useState } from "react"
import { useKeenSlider } from 'keen-slider/react' // import from 'keen-slider/react.es' for to get an ES module

import { SongCard } from "./SongCard";

import 'keen-slider/keen-slider.min.css'
import { IconCircleArrowLeft, IconCircleArrowRight } from "@tabler/icons-react";

import { DetailedTrack } from "@/types/artist";

export const SongCarousel = (
  props: { 
    songChunks: DetailedTrack[][], 
    count: number, 
    toggleSong: (id: string, detailedTrack: DetailedTrack) => void,  
    onEnd?: () => void,
  }) => {

  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [loaded, setLoaded] = useState(false)
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
  })

  return (
    <main className="relative w-full overflow-hidden flex flex-col justify-center">
      <div ref={sliderRef} className="keen-slider">
        {props.songChunks.map((songChunk: DetailedTrack[], slideIdx: number) => {
            return (
                <section key={slideIdx} className={`keen-slider__slide`}>
                    <main className='grid grid-cols-5 grid-rows-3 gap-4 w-[fit-content] mx-auto'>
                        {songChunk.map((song: DetailedTrack) => {
                          return (
                              <SongCard key={song.track.id} track={song}
                                  onClick={props.toggleSong}
                              />
                          )
                        })}
                    </main>
                </section>
              )
          })}
      </div>
      <nav className='flex justify-center items-center mt-[1.25rem] w-full'>
        <button className="btn btn-outline border-2 mx-[0.25rem]" 
            onClick={(e: any) =>
              e.stopPropagation() || instanceRef.current?.prev()
            }
          >
            <IconCircleArrowLeft />
            Prev
        </button>
        {props.songChunks.map((songChunk, index) => (
            <button 
                className={`
                  btn btn-sm btn-circle border-2 mx-[0.25rem]
                  ${(currentSlide == index) ? 'btn-base-300 border font-bold' : 'btn-outline'}
                
                  `}
                key={index} onClick={() =>
                  instanceRef.current?.moveToIdx(index)
                }>
                {index+1}
            </button>
        ))}
        <button 
          className={`btn border-2 mx-[0.25rem]
              ${(props.onEnd && (instanceRef.current?.slides.length) == (currentSlide + 1)) 
                ? 'btn-base-content' 
                : 'btn-outline'}
            `}
          onClick={(e: any) => {
            if(props.onEnd && (instanceRef.current?.slides.length) == (currentSlide + 1)) {
              /* Reset stage. */
              props.onEnd();
              instanceRef.current?.moveToIdx(0)
              setCurrentSlide(0);

            } else {
              e.stopPropagation()
              instanceRef.current?.next()
            }
          }}
        >
            {(props.onEnd && (instanceRef.current?.slides.length) == (currentSlide + 1))
              ? `Done`
              : `Next`
            }
            <IconCircleArrowRight />
        </button>
      </nav>
      
    </main>
  )
}