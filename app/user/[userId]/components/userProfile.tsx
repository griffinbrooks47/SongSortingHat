'use client'

/* Server Actions */
import { followUser, unfollowUser } from "@/utils/serverFunctions/followUser";

/* Types */
import { UserWithFollowersAndFollowing } from "../page";

/* React / Next */
import Image from "next/image";
import { useState } from "react";
import { IconAt } from "@tabler/icons-react";

export function UserProfile(
    {
        user,
        isFollowingInitial,
        isCurrUser
    } : {
        user: UserWithFollowersAndFollowing,
        isFollowingInitial: boolean,
        isCurrUser: boolean,
    }
) {

    const username = user.username;
    const followerCount = user.followerCount;
    const followingCount = user.followingCount;

    const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
    const [followers, setFollowers] = useState(followerCount);

    const handleFollowClick = () => {
        if(isCurrUser) 
            return;
        try {
            if(isFollowing) {
                unfollowUser(user.id);
                
            } else {
                followUser(user.id);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Please wait a few moments before clicking the button");
            return;
        }
        setFollowers(isFollowing ? followers - 1 : followers + 1);
        setIsFollowing(!isFollowing);
    }

    return (
        <>
            {/* User Section */}
            <section className="relative mt-16 mb-8">
                
                {/* Profile */}
                <main className="flex flex-row items-center">
                    {/* User Avatar */}
                    <figure className="flex flex-col justify-center items-center">
                        <div className="avatar h-36 w-36">
                            {user.profilePicture &&
                                <div className={`relative ring-black ring-offset-base-100 rounded-full ring-2 ring-offset-2 sm:w-full sm:h-full overflow-hidden`}>
                                    {user.profilePicture.includes("/default_profile/") && user.name &&
                                        <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    }
                                    <Image
                                        src={user.profilePicture}
                                        alt={user.name}
                                        width={32}
                                        height={32}
                                        className={`object-cover w-full h-full`}
                                    />
                                </div>
                            }
                        </div>
                    </figure>
                    
                    {/* User Info */}
                    <section className="px-12 mb-2 flex flex-col justify-start items-center gap-1">
                    
                        <div>
                            {/* Name */}
                            <div className="text-[1.80rem] m-0 font-bold leading-9 line-clamp-2">
                                {user.name}
                            </div>
                            {/* Username */}
                            <div className="text-[1rem] mt-[-2px] text-gray-700 leading-6 line-clamp-2 flex flex-row items-center">
                                <IconAt className="h-[1.15rem] pt-[0.5px] my-auto w-[1rem]"/>{user.username}
                            </div>
                        </div>
                        
                        {/* Followers / Following */}
                        <div className="flex flex-row justify-start w-full gap-4">
                            <div className="flex flex-row items-center gap-1">
                                <span className="font-bold text-sm">{followers}</span>
                                <span className="text-gray-600 text-sm">Followers</span>
                            </div>
                            <div className="flex flex-row items-center gap-1">
                                <span className="font-bold text-sm">{followingCount}</span>
                                <span className="text-gray-600 text-sm">Following</span>
                            </div>
                        </div>
                
                    </section>
                </main>

                {/* Profile Navigation */}
                <nav className="flex flex-row justify-center my-2">
                    {isCurrUser 
                        ? 
                        <button className="btn btn-sm btn-outline btn-disabled bg-secondary rounded-md px-6"
                            onClick={() => {}}
                        >
                            Edit Profile
                        </button>
                        : 
                        <>
                            {isFollowing 
                                ?
                                <button className="btn btn-sm btn-outline bg-white rounded-md px-6"
                                    onClick={handleFollowClick}
                                >
                                    Unfollow
                                </button>
                                :
                                <button className="btn btn-sm btn-outline bg-secondary rounded-md px-6"
                                    onClick={handleFollowClick}
                                >
                                    Follow
                                </button>
                            }
                        </>
                    }
                </nav>
            </section>
        </>
    )
}

export function SkeletonUserProfile() {
    return (
        <>
            {/* User Section Skeleton */}
            <section className="relative mt-16 mb-8 animate-pulse">
                
                {/* Profile */}
                <main className="flex flex-row items-center">
                    {/* User Avatar Skeleton */}
                    <figure className="flex flex-col justify-center items-center">
                        <div className="avatar h-36 w-36">
                            <div className="mask mask-squircle w-full shadow-lg bg-gray-300"></div>
                        </div>
                    </figure>
                    
                    {/* User Info Skeleton */}
                    <section className="px-12 mb-2 flex flex-col justify-start items-center gap-1">
                    
                        <div className="w-full">
                            {/* Name Skeleton */}
                            <div className="h-9 w-48 bg-gray-300 rounded mb-1"></div>
                            {/* Username Skeleton */}
                            <div className="h-6 w-32 bg-gray-300 rounded flex flex-row items-center"></div>
                        </div>
                        
                        {/* Followers / Following Skeleton */}
                        <div className="flex flex-row justify-start w-full gap-4 mt-2">
                            <div className="flex flex-row items-center gap-1">
                                <div className="h-4 w-8 bg-gray-300 rounded"></div>
                                <div className="h-4 w-16 bg-gray-300 rounded"></div>
                            </div>
                            <div className="flex flex-row items-center gap-1">
                                <div className="h-4 w-8 bg-gray-300 rounded"></div>
                                <div className="h-4 w-16 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                
                    </section>
                </main>

                {/* Profile Navigation Skeleton */}
                <nav className="flex flex-row justify-center my-2">
                    <div className="h-8 w-32 bg-gray-300 rounded-md"></div>
                </nav>
            </section>
        </>
    )
}