'use client'

import { useState } from "react"

import Link from "next/link";
import { IconSearch, IconSitemap, IconUserCircle, IconX } from "@tabler/icons-react";
import { SearchBar } from "./search";

export default function Navbar() {

    const [authenticated, ] = useState<boolean>(true);

    const [searchToggled, setSearchToggled] = useState<boolean>(false);

    return (
        <nav className="fixed top-0 px-[1.5rem] h-[4rem] w-full py-[0.5rem] bg-base-100 flex justify-between items-center z-1 shadow-sm">
          <div className='flex justify-center items-center ml-[1.5rem]'>
            <Link href="/home" className="mr-[1.5rem] pb-[1px] cursor-pointer font-semibold">
              Song Sorting Hat
            </Link>
            <a className="opacity-100 mx-[0.75rem] cursor-pointer"
                onClick={() => {
                    setSearchToggled(true)
                }}
            >
              <IconSearch className="h-[1.5rem] w-[1.5rem] pt-[2px]"/>
            </a>
          </div>

          {authenticated && 
            <div className='flex justify-center items-center'>
              <Link href='/search' className='mx-[1.25rem] cursor-pointer font-semibold flex'>
                <IconSitemap />
                <p className='mx-[0.5rem]'>My Sortings</p>
              </Link>
              <button className='ml-[0.5rem] mr-[0.5rem] h-full opacity-90'>
                <IconUserCircle className="pt-[0px]" height="2.5rem" width="2.5rem" />
              </button>
            </div>
          }
          {!authenticated && 
            <div className='flex justify-center items-center'>
              <button className="btn btn-ghost mx-[0.5rem] rounded-md">
                Sign Up
              </button>
              <button className="btn btn-neutral rounded-md">
                Sign In
              </button>
            </div>
          }

          <nav className={`${searchToggled ? "" : 'hidden'} absolute w-full h-full left-0 shadow-md`}>
            <SearchBar placeholder={"Search for an artist..."} submit={() => {
                setSearchToggled(false)
            }} />
            <a className="absolute right-[1rem] h-full top-0 flex items-center cursor-pointer"
                onClick={() => {
                    setSearchToggled(false);
                }}
            >
                <IconX className="h-[2rem] w-[2rem] opacity-70" />
            </a>
          </nav>

        </nav>
    )
}