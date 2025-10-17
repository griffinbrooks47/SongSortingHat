'use client'

import { useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import Link from "next/link"
import { SearchBar } from "./search"
import { IconSearch, IconSitemap, IconUserCircle, IconX } from "@tabler/icons-react"
import { useSession } from "@/lib/auth-client"

export default function Navbar() {
  
  const { data: session, isPending } = useSession();
  
  const [searchToggled, setSearchToggled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setVisible(false)
    } else {
      setVisible(true)
    }
  }, [pathname])

  if(!visible) return null;

  const authenticated = !!session;

  return (
      <nav className="fixed top-0 px-[1.5rem] h-[4rem] w-full py-[0.5rem] bg-base-100 flex justify-between items-center z-10 shadow-sm">
        <div className='flex justify-center items-center ml-[1.5rem]'>
          <Link href="/home" className="mr-[1.5rem] pb-[1px] cursor-pointer font-semibold">
            Song Sorting Hat
          </Link>
          <button 
            className="opacity-100 mx-[0.75rem] cursor-pointer"
            onClick={() => setSearchToggled(true)}
            aria-label="Search"
          >
            <IconSearch className="h-[1.5rem] w-[1.5rem] pt-[2px]"/>
          </button>
        </div>

        {isPending ? (
          <div className="w-[200px]" /> // Placeholder to prevent layout shift
        ) : authenticated ? (
          <div className='flex justify-center items-center'>
            
            <Link href='/search' className='mx-[1.25rem] cursor-pointer font-semibold flex items-center'>
              <IconSitemap />
              <p className='mx-[0.5rem]'>My Sortings</p>
            </Link>
            
            
            {/* Profile Dropdown */}
            <button 
              className='ml-[0.5rem] mr-[0.5rem] h-[2.25rem] w-[2.25rem] opacity-90'
              popoverTarget="profile-popover"
              style={{ anchorName: "--profile-anchor" } as React.CSSProperties}
            >
              <div className="avatar h-full w-full">
                <div className="ring-black ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                  <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
                </div>
              </div>
            </button>

            <ul 
              className="dropdown menu w-[15rem] px-[0.1rem] py-[0.25rem] mt-[1rem] mr-[-2.25rem] bg-base-100 rounded-md shadow-sm border-black border-2"
              popover="auto"
              id="profile-popover"
              style={{ 
                positionAnchor: "--profile-anchor",
                positionArea: "bottom left", // 👈 aligns right edge of dropdown with button
              } as React.CSSProperties}
            >
              <li className="rounded-sm">
                <a>Item 1</a>
              </li>
            </ul>



          </div>
        ) : (
          <div className='flex justify-center items-center'>
            <Link href='/register' className="btn btn-default mx-[0.5rem] rounded-lg">
              Sign up
            </Link>
            <Link href='/login' className="btn btn-outline rounded-lg mx-[0.5rem]">
              Log in
            </Link>
          </div>
        )}

        {searchToggled && (
          <nav className="absolute w-full h-full left-0 top-0 shadow-md bg-base-100">
            <SearchBar 
              placeholder="Search for an artist..." 
              submit={() => setSearchToggled(false)} 
            />
            <button 
              className="absolute right-[1rem] h-full top-0 flex items-center cursor-pointer"
              onClick={() => setSearchToggled(false)}
              aria-label="Close search"
            >
              <IconX className="h-[2rem] w-[2rem] opacity-70" />
            </button>
          </nav>
        )}
      </nav>
  )
}