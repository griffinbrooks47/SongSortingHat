'use client'

/* React imports */
import { useEffect, useState } from "react"

/* Next imports */
import { usePathname } from 'next/navigation'
import Link from "next/link";

/* Components */
import { SearchBar } from "./search";

/* Icons */
import { IconSearch, IconSitemap, IconUserCircle, IconX } from "@tabler/icons-react";

export default function Navbar() {

    const [authenticated, ] = useState<boolean>(false);

    const [searchToggled, setSearchToggled] = useState<boolean>(false);

    const [visible, setVisible] = useState<boolean>(true);

    /* Current URL pathname */
    const pathname = usePathname()

    /* Update visibility when pathname changes. */
    useEffect(() => {
      if (pathname === '/login' || pathname === '/register') {
        setVisible(false)
      } else {
        setVisible(true)
      }
    }, [pathname])

    if(!visible) return <></>;

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
              <Link href='/register' className="btn btn-default mx-[0.5rem] rounded-lg">
                Sign up
              </Link>
              <Link href='/login' className="btn btn-outline rounded-lg mx-[0.5rem]">
                Log in
              </Link>
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