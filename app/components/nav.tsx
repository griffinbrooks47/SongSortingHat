'use client'

/* Components */
import { SearchBar } from "./search"

/* Icons */
import { IconSearch, IconSitemap, IconX, IconLogout2, IconUser } from "@tabler/icons-react"

/* Auth */
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"

/* Next */
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from 'next/navigation'

/* React */
import { useEffect, useState } from "react"
import { TUser } from "@/types/user"

/* Server Functions */
import { getUser } from "@/utils/serverFunctions/getUser"


export default function Navbar() {
  
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [searchToggled, setSearchToggled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  }

  const authenticated = !!session;
  const userId = session?.user?.id;

  const [user, setUser] = useState<TUser | null>(null);
  useEffect(() => {
    if (authenticated) {
      const user = getUser(userId as string);
      user.then((data) => {
        if (data) {
          setUser(data);
        } else {
          console.error("Failed to fetch user data");
        }
      }).catch((error) => {
        console.error("Error fetching user:", error);
      });
    } else {
      setUser(null);
    }
  }, [session, authenticated, userId]);

  if(!visible) return null;

  if (authenticated) {
    return (
      <nav className="bg-base-200 fixed top-0 pl-2 pr-4 h-15 w-full py-2 flex justify-between items-center z-10">
        <div className='flex justify-center items-center'>
          <Link href="/home" className="mr-4 pb-px cursor-pointer font-semibold flex items-center">
            <figure className="mx-6 h-8 w-8">
              <Image
                src="/ssh_logo_mini.png"
                alt="Song Sorting Hat Logo"
                width={100}
                height={100}
                className=""
                priority
              ></Image>
            </figure>
            Song Sorting Hat
          </Link>
        </div>

        {isPending ? (
          <div className="w-[200px]" /> // Placeholder to prevent layout shift
        ) : (
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
                <div className={`ring-black ring-offset-base-100 w-24 p-1 rounded-full ring-2 ring-offset-2 ${user?.profilePicture.backgroundColor ? `bg-${user.profilePicture.backgroundColor}` : 'bg-none'}`}>
                  <Image
                    src={"/profile_icons/default_profile_icon.png"}
                    alt={`${session?.user?.name}'s profile picture`}
                    width={40}
                    height={40}
                    className={`object-cover w-full h-full rounded-full`}
                    priority={false}
                  ></Image>
                </div>
              </div>
            </button>
            <ul 
              className="dropdown menu w-[18rem] mt-4 -mr-9 pt-4 bg-base-100 rounded-md shadow-sm border-black border-2 [&_li>*]:rounded-sm [&_li>*]:mx-0"
              popover="auto"
              id="profile-popover"
              style={{ 
                positionAnchor: "--profile-anchor",
                positionArea: "bottom left",
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
                    <div className={`ring-black ring-offset-base-100 w-24 p-1 rounded-full ring-2 ring-offset-2 ${user?.profilePicture.backgroundColor ? `bg-${user.profilePicture.backgroundColor}` : 'bg-none'}`}>
                      <Image
                        src={"/profile_icons/default_profile_icon.png"}
                        alt={`${session?.user?.name}'s profile picture`}
                        width={40}
                        height={40}
                        className={`object-cover w-full h-full rounded-full`}
                        priority={false}
                      ></Image>
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
  return (
    <nav className="bg-base-200 fixed top-0 pl-2 pr-4 h-15 w-full py-2 flex justify-between items-center z-10">
      <div className='flex justify-center items-center'>
        <Link href="/home" className="mr-4 pb-px cursor-pointer font-semibold flex items-center">
          <figure className="mx-6 h-8 w-8">
            <Image
              src="/ssh_logo_mini.png"
              alt="Song Sorting Hat Logo"
              width={100}
              height={100}
              className=""
              priority
            ></Image>
          </figure>
          Song Sorting Hat
        </Link>
      </div>

      <div className='flex justify-center items-center'>
        <Link href='/signup' className="btn btn-neutral mx-1 rounded-lg">
          Sign up
        </Link>
        <Link href='/login' className="btn btn-outline rounded-lg mx-1">
          Log in
        </Link>
      </div>

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