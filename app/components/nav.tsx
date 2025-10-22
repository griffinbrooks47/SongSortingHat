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
            
            <Link href={`/user/${userId}`} className='mx-[1.25rem] cursor-pointer font-semibold flex items-center'>
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
                <div className="ring-black ring-offset-base-100 bg-secondary w-24 p-1 rounded-full ring-2 ring-offset-2">
                  <IconUser className="h-full w-full"/>
                </div>
              </div>
            </button>

            <ul 
              className="dropdown menu w-[18rem] mt-[1rem] mr-[-2.25rem] pt-[1rem] bg-base-100 rounded-md shadow-sm border-black border-2 [&_li>*]:rounded-sm [&_li>*]:mx-0"
              popover="auto"
              id="profile-popover"
              style={{ 
                positionAnchor: "--profile-anchor",
                positionArea: "bottom left", // 👈 aligns right edge of dropdown with button
              } as React.CSSProperties}
            >
              {/* View Profile */}
              <section className="h-[3.5rem] mx-[0.75rem] flex flex-row items-center gap-4">
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
              </section>

              <hr className="border-black opacity-10 w-[100%] mx-auto my-[0.5rem]"></hr>

              <li className="h-[2.5rem] w-ful">
                <a className="h-full w-full flex items-center"
                  onClick={signOut}
                >
                  <IconLogout2 className="h-[90%] mx-[0.25rem]" />
                  Sign out
                </a>
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