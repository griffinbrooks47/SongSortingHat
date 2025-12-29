'use client'

/* Next / React */
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"

/* Auth */
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"

/* Server Actions */
import { getUser } from "@/utils/serverFunctions/getUser"

/* Components */
import { SearchBar } from "./search"

/* Icons */
import { IconX, IconLogout2, IconSettings, IconUserCircle } from "@tabler/icons-react"
import { profile } from "console"


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

  const name = session?.user?.name;
  const userId = session?.user?.id;

  const [profilePicture, setProfilePicture] = useState<string | null>('');

  if(!visible) return null;

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      const user = await getUser(userId);
      setProfilePicture(user?.profilePicture || null);
    };
    fetchUserData();
  }, [userId])

  return (
    <nav className="h-16 w-full pl-5 pr-3 pt-2 pb-0 bg-base-200 fixed top-0 flex justify-between items-center z-10">

      <NavbarHeader />
      <MenuControls 
        name={name}  
        userId={userId} 
        profilePicture={profilePicture}
        authenticated={authenticated}
        signOut={signOut}
      />

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

/* 
  Responsive Navbar Header
*/
function NavbarHeader() {
  return (
    <div className="flex items-center lg:ml-2 ml-1">
      <Link
        href="/home"
        className="flex items-center cursor-pointer font-semibold"
      >
        {/* Logo */}
        <figure className="h-8 w-8 sm:h-8 sm:w-8 mr-4 sm:mr-3">
          <Image
            src="/ssh_logo_mini.png"
            alt="Song Sorting Hat Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </figure>

        {/* Title */}
        <div className="whitespace-nowrap text-base text-[0.9rem] mx-0 sm:text-md lg:mx-2 lg:text-[0.95rem] font-semibold">
          Song Sorting Hat
        </div>
      </Link>
    </div>
  );
}


/* 
  Responsive Navbar Menu Component
  Large Screens: (Sign In/Sign Up buttons or Profile Icon with dropdown)
  Small Screens: Hamburger Menu that toggles a side drawer with the same options
*/
function MenuControls(
  { name, profilePicture, authenticated, userId, signOut }: 
  { 
    name?: string;
    userId?: string; 
    profilePicture?: string | null;

    authenticated: boolean;

    signOut: () => Promise<void>; 
  }
) {

  return (
    <div className="drawer drawer-end flex justify-end">
      <input id="menu-drawer" type="checkbox" className="drawer-toggle" />

      {/* --- Desktop Buttons (shown on lg+) --- */}
      <div className="hidden lg:flex items-center gap-4">
        
        {authenticated ? (
          <>
            {/* Profile Button (opens popover) */}
            <button
              className="ml-2 mr-2 p-1 opacity-90 rounded-full flex items-center gap-4"
              popoverTarget="profile-popover"
              style={{ anchorName: "--profile-anchor" } as React.CSSProperties}
            >
              <div className="text-center flex items-center gap-1">
                {name?.split(" ")[0]}
              </div>
              <div className="avatar h-10 w-10">
                <div
                  className={`ring-offset-base-100 w-24 p-1 rounded-full ring-offset-0`}
                >
                  {profilePicture &&
                    <div className={`relative ring-black ring-offset-base-100 rounded-full ring-2 ring-offset-2 w-8 h-8 sm:w-8 sm:h-8 overflow-hidden`}>
                        {profilePicture.includes("/default_profile/") && name &&
                            <div className="absolute inset-0 flex items-center justify-center font-bold">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        }
                        <Image
                            src={profilePicture}
                            alt={name || 'Profile Picture'}
                            width={32}
                            height={32}
                            className={`object-cover w-full h-full`}
                        />
                    </div>
                  }
                </div>
              </div>
            </button>

            {/* Profile Dropdown Popover */}
            <ul
              id="profile-popover"
              popover="auto"
              className="dropdown menu w-[16rem] mt-2 -mr-26 pt-3 px-3 bg-base-100 rounded-md shadow-md border-black
                        [&_li>*]:rounded-sm [&_li>*]:mx-0"
              style={{
                positionAnchor: "--profile-anchor",
                positionArea: "bottom left",
              } as React.CSSProperties}
            >
              {/* View Profile */}
              <Link
                href={`/user/${userId}`}
                className="py-2 bg-base-200 rounded-sm
                  flex flex-row justify-start items-center gap-3 px-2"
              >
                <div className="avatar h-11 w-11 flex justify-center items-center">
                  {profilePicture &&
                    <div className={`relative ring-black ring-offset-base-100 rounded-full ring-2 ring-offset-2 w-8 h-8 sm:w-8 sm:h-8 overflow-hidden`}>
                        {profilePicture.includes("/default_profile/") && name &&
                            <div className="absolute inset-0 flex items-center justify-center font-bold">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        }
                        <Image
                            src={profilePicture}
                            alt={name || 'Profile Picture'}
                            width={32}
                            height={32}
                            className={`object-cover w-full h-full`}
                        />
                    </div>
                  }
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-[0.9rem]">{name}</p>
                </div>
              </Link>

              <hr className="border-black opacity-10 w-full mx-auto my-2" />

              {/* View Profile */}
              <li>
                <a className="flex items-center gap-2">
                  <IconUserCircle className="h-[90%]" />
                  Account
                </a>
              </li>
              {/* View Profile */}
              <li>
                <a className="flex items-center gap-2">
                  <IconSettings className="h-[90%]" />
                  Settings
                </a>
              </li>

              <hr className="border-black opacity-10 w-full mx-auto my-2" />

              {/* Sign Out */}
              <li>
                <a onClick={signOut} className="btn btn-outline bg-secondary flex items-center gap-2">
                  <IconLogout2 className="h-[90%]" />
                  Sign out
                </a>
              </li>
            </ul>
          </>
        ) : (
          /* Sign Up / Log In */
          <div className="flex items-center">
            <Link href="/signup" className="btn btn-neutral shadow-none mx-1 rounded-lg">
              Sign up
            </Link>
            <Link href="/login" className="btn btn-outline mx-1 rounded-lg">
              Log in
            </Link>
          </div>
        )}
      </div>

      {/* --- Mobile: Hamburger --- */}
      <div className="flex lg:hidden">
        <label
          htmlFor="menu-drawer"
          aria-label="open menu"
          className="btn btn-square btn-link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-6 w-6 stroke-current text-black"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>
      </div>

      {/* --- Drawer Sidebar (Mobile Menu) --- */}
      <div className="drawer-side">
        <label htmlFor="menu-drawer" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 min-h-full w-80 px-3 pt-3">
          {authenticated ? (
            <>
              {/* View Profile */}
              <Link
                href={`/user/${userId}`}
                className="bg-base-200 rounded-sm
                  flex flex-row justify-start items-center gap-3 px-2"
              >
                <div className="avatar h-11 w-11">
                  {profilePicture &&
                    <div className={`relative ring-black ring-offset-base-100 rounded-full ring-2 ring-offset-2 w-8 h-8 sm:w-8 sm:h-8 overflow-hidden`}>
                        {profilePicture.includes("/default_profile/") && name &&
                            <div className="absolute inset-0 flex items-center justify-center font-bold">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        }
                        <Image
                            src={profilePicture}
                            alt={name || 'Profile Picture'}
                            width={32}
                            height={32}
                            className={`object-cover w-full h-full`}
                        />
                    </div>
                  }
                </div>
    
                <div className="pt-1">
                  <p className="font-semibold text-[0.9rem]">{name}</p>
                </div>
              </Link>

              <hr className="border-black opacity-10 w-full mx-auto my-2" />
              {/* View Profile */}
              <li>
                <Link href={`/user/${userId}`} className="flex items-center gap-2 rounded-sm">
                  <IconUserCircle className="h-[90%]" />
                  Account
                </Link>
              </li>
              {/* View Profile */}
              <li>
                <a className="flex items-center gap-2 rounded-sm">
                  <IconSettings className="h-[90%]" />
                  Settings
                </a>
              </li>

              <hr className="border-black opacity-10 w-full mx-auto my-2" />

              {/* Sign Out */}
              <li>
                <a onClick={signOut} className="btn btn-outline bg-secondary rounded-md flex items-center gap-2">
                  <IconLogout2 className="h-[90%]" />
                  Sign out
                </a>
              </li>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold ml-auto mr-2">Log in / Sign up</h1>
              <hr className="border-black opacity-10 w-full mx-auto my-[5px]"></hr>
              <Link href="/login" className="btn btn-outline my-1 rounded-md">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-neutral my-1 rounded-md">
                Sign up
              </Link>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

