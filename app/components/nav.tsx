'use client'

/* Components */
import { SearchBar } from "./search"

/* Icons */
import { IconSearch, IconSitemap, IconUserCircle, IconX, IconLogout2, IconUserFilled, IconUser } from "@tabler/icons-react"

/* Auth */
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"

/* Next */
import Link from "next/link"
import { useRouter, usePathname } from 'next/navigation'

/* React */
import { useEffect, useState } from "react"

export default function Navbar() {
  
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [searchToggled, setSearchToggled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const pathname = usePathname()

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  }

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setVisible(false)
    } else {
      setVisible(true)
    }
  }, [pathname])

  if(!visible) return null;

  const authenticated = !!session;
  const userId = session?.user?.id;

  return (
      <nav className="fixed top-0 px-6 h-16 w-full py-2 bg-base-100 flex justify-between items-center z-10 shadow-sm">
        <div className='flex justify-center items-center ml-6'>
          <Link href="/home" className="mr-6 pb-px cursor-pointer font-semibold">
            Song Sorting Hat
          </Link>
          <button 
            className="opacity-100 mx-3 cursor-pointer"
            onClick={() => setSearchToggled(true)}
            aria-label="Search"
          >
            <IconSearch className="h-6 w-6 pt-[2px]"/>
          </button>
        </div>

        {isPending ? (
          <div className="w-[200px]" /> // Placeholder to prevent layout shift
        ) : authenticated ? (
          <div className='flex justify-center items-center'>
            
            <Link href={`/user/${userId}`} className='mx-5 cursor-pointer font-semibold flex items-center'>
              <IconSitemap />
              <p className='mx-2'>My Sortings</p>
            </Link>
            
            
            {/* Profile Dropdown */}
            <button 
              className='ml-2 mr-2 h-9 w-9 opacity-90'
              popoverTarget="profile-popover"
              style={{ anchorName: "--profile-anchor" } as React.CSSProperties}
            >
              <div className="avatar h-full w-full">
                <div className="ring-black ring-offset-base-100 bg-secondary w-24 p-1 rounded-full ring-2 ring-offset-2">
                  <IconUser className="h-full w-full"/>
                </div>
              </div>
            </button>

            <ul 
              className="dropdown menu w-[18rem] mt-4 -mr-9 pt-4 bg-base-100 rounded-md shadow-sm border-black border-2 [&_li>*]:rounded-sm [&_li>*]:mx-0"
              popover="auto"
              id="profile-popover"
              style={{ 
                positionAnchor: "--profile-anchor",
                positionArea: "bottom left", // 👈 aligns right edge of dropdown with button
              } as React.CSSProperties}
            >
              {/* View Profile */}
              <Link 
                href={`/user/${userId}`}
                className="h-14 mx-3 flex flex-row items-center gap-4">
                <button 
                  className='h-full opacity-90'
                  popoverTarget="profile-popover"
                  style={{ anchorName: "--profile-anchor" } as React.CSSProperties}
                >
                  <div className="avatar h-10 w-10">
                    <div className="ring-black ring-offset-base-100 bg-secondary w-24 p-1 rounded-full ring-2 ring-offset-2">
                      <IconUser className="h-full w-full"/>
                    </div>
                  </div>
                </button>
                <div>
                  <h2 className="font-semibold">{session?.user?.name}</h2>
                  <h2 className="">{session?.user?.name}</h2>
                </div>
              </Link>

              <hr className="border-black opacity-10 w-full mx-auto my-2"></hr>

              <li className="h-10 w-ful">
                <a className="h-full w-full flex items-center"
                  onClick={signOut}
                >
                  <IconLogout2 className="h-[90%] mx-1" />
                  Sign out
                </a>
              </li>
            </ul>



          </div>
        ) : (
          <div className='flex justify-center items-center'>
            <Link href='/login' className="btn btn-default mx-2 rounded-lg">
              Sign up
            </Link>
            <Link href='/login' className="btn btn-outline rounded-lg mx-2">
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
              className="absolute right-4 h-full top-0 flex items-center cursor-pointer"
              onClick={() => setSearchToggled(false)}
              aria-label="Close search"
            >
              <IconX className="h-8 w-8 opacity-70" />
            </button>
          </nav>
        )}
      </nav>
  )
}