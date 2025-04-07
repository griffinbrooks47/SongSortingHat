'use client'

import { Artist } from "@/types/artist"

import Image from "next/image"

import { IconMusic, IconAlbum } from "@tabler/icons-react"

export default function Dashboard(
    {artist, stage, setStage, setDashboardActive, setType}: {
        artist: Artist, 
        stage: number, setStage: (newStage: number) => void, setDashboardActive: (state: boolean) => void; 
        setType: (newType: string) => void,
    }) 
{
    return (
        <main className="w-full flex flex-col items-center mt-[4rem]">
            <section className="flex flex-row justify-between pt-[6rem] pb-[2rem]">
                <figure className="h-[10rem] w-[10rem] aspect-w-1 aspect-h-1">
                    <Image
                    src={artist.images[0].url}
                    width={artist.images[0].width} 
                    height={artist.images[0].height}
                    alt={artist.name}
                    className="h-full rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.6)] object-cover"
                    />
                </figure>
                <div className="ml-auto min-w-[30rem]">
                    <div className="flex flex-col items-end mt-[0.5rem]">
                        <p className="uppercase text-left font-semibold opacity-70 leading-[0.5rem]">now ranking:</p>
                        <p
                            className="text-[2.5rem] font-bold break-words overflow-hidden 
                                    line-clamp-2 text-ellipsis max-w-full leading-[3rem]"
                            style={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 2,
                                whiteSpace: "normal",
                            }}
                        >
                            {artist.name.length > 40 ? artist.name.slice(0, 40) + "..." : artist.name}
                        </p>
                    </div>
                </div>
            </section>
            <section className="flex flex-col items-center mt-[1rem]">
                <ul className="steps w-[100%] mx-auto text-[0.85rem] py-[0.75rem] opacity-90">
                    <li className={(stage > 1 ? "step step-accent" : (stage == 1 ? "step step-accent" : "step step"))}
                        data-content={(stage > 1 ? "✓" : 1)}>
                        <p className={(stage == 1 ? "font-semibold" : "")}>Assemble the Lineup</p></li>
                    <li className={(stage > 2 ? "step step-accent" : (stage == 2 ? "step step-accent" : "step step"))}
                        data-content={(stage > 2 ? "✓" : 2)}>
                        <p className={(stage == 2 ? "font-semibold" : "")}>Song Showdown</p></li>
                    <li className={(stage > 3 ? "step step-accent" : (stage == 3 ? "step step-accent" : "step step"))}
                        data-content={(stage > 3 ? "✓" : 3)}>
                        <p className={(stage == 3 ? "font-semibold" : "")}>Crown the Best!</p></li>
                </ul>
                <hr className="border-black opacity-10 w-[95%] ml-auto my-[0.05rem]"></hr>
                <nav className="">
                    <ul className="flex justify-center items-center w-full py-[0.75rem]">
                        <li className="mx-[0.25rem]">
                            <a className="mt-auto px-[0.75rem] py-[0.25rem] border-2 bg-primary border-neutral shadow-sm opacity-80 flex rounded-md justify-center items-center cursor-pointer"
                                onClick={() => {
                                    setStage(2);
                                    setType("Songs");
                                    setDashboardActive(false);
                                }}
                            >
                                <IconMusic className="w-6 h-6 mr-[0.5rem]" />
                                <p className="font-semibold text-[1rem] color-accent">Rank by Songs</p>
                            </a>
                        </li>
                        <li className="mx-[0.25rem]">
                            <a className="mt-auto px-[0.75rem] py-[0.25rem] border-2 bg-secondary border-neutral shadow-sm opacity-80 flex rounded-md justify-center items-center cursor-pointer"
                                onClick={() => {
                                    setStage(2);
                                    setType("Album");
                                    setDashboardActive(false);
                                }}
                            >
                                <IconAlbum className="w-6 h-6 mr-[0.5rem]" />
                                <p className="font-semibold text-[1rem] color-accent">Rank by Album</p>
                            </a>
                        </li>
                    </ul>
                </nav>
                <hr className="border-black opacity-10 w-[95%] mr-auto my-[0.05rem]"></hr>
                <main className="min-w-[60rem] min-h-[20rem] bg-base-300 mt-[1rem] rounded-md shadow-sm">
                    <div className="font-semibold opacity-80 px-[1rem] py-[0.5rem]">
                        Current Sorting Pool
                    </div>
                </main>
            </section>
        </main>
    )
}

/* 
<section className="card bg-base-100 min-w-[50rem] flex justify-center items-center rounded-md shadow-sm mb-[1rem]">
                    <figure className="w-[12.5rem] h-[12.5rem] rounded-full mt-[3rem]">
                        {artist &&
                            <Image 
                                src={artist.images[0].url}
                                width={artist.images[0].width}
                                height={artist.images[0].height}
                                alt={artist.name}
                                className=""
                            />
                        }
                    </figure>
                    <p className="text-[2rem] font-bold mt-[1rem]">
                        {artist?.name}
                    </p>
                    <div className="card-body w-[100%] mt-[-1rem]">
                        <ul className="steps w-[90%] mx-auto text-[0.9rem]">
                            <li className={(stage > 1 ? "step step-primary" : (stage == 1 ? "step step-primary" : "step step"))}
                                data-content={(stage > 1 ? "✓" : 1)}>
                                <p className={(stage == 1 ? "font-semibold" : "")}>Assemble the Lineup</p></li>
                            <li className={(stage > 2 ? "step step-primary" : (stage == 2 ? "step step-primary" : "step step"))}
                                data-content={(stage > 2 ? "✓" : 2)}>
                                <p className={(stage == 2 ? "font-semibold" : "")}>Song Showdown</p></li>
                            <li className={(stage > 3 ? "step step-primary" : (stage == 3 ? "step step-primary" : "step step"))}
                                data-content={(stage > 3 ? "✓" : 3)}>
                                <p className={(stage == 3 ? "font-semibold" : "")}>Crown the Best!</p></li>
                        </ul>
                        <div className="divider my-[0.25rem]"></div>
                        <p className="text-center text-[1.25rem] font-semibold">{`Step ${stage}:`}</p>
                        <div className="flex justify-center flex-col text-center mb-[0.5rem]">
                            <p>{text[stage-1]}</p>
                        </div>
                        <button className="btn btn-outline border-2 btn-primary max-w-[30rem] mx-auto"
                            onClick={() => {
                                if(stage == 1){
                                    startStageOne();
                                } else if(stage == 2){
                                    startStageTwo();
                                } else {
                                    startStageThree();
                                }
                            }}
                        >
                            Start Ranking
                            <IconArrowsShuffle />
                        </button>
                    </div>
                </section>
*/