'use client'

/* React / Next */
import Image from "next/image";
import { useState } from "react";

/* Server Actions */
import { followUser, unfollowUser } from "../actions/follow";

/* Types */
import { UserWithRelations } from "../page";
import { TSessionUser } from "@/lib/auth";

/* Icons */
import { IconAt } from "@tabler/icons-react";

export function UserProfile(
    {
        sessionUser,
        profileUser,
        isFollowingInitial,
    } : {
        sessionUser: TSessionUser,
        profileUser: UserWithRelations,
        isFollowingInitial: boolean,
    }
) {
    const profileUsername = profileUser.username;
    const profileName = profileUser.name;
    const profilePicture = profileUser.profilePicture;

    const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
    
    const [followerCount, setFollowerCount] = useState<number>(profileUser.followersCount);
    const [followingCount, setFollowingCount] = useState<number>(profileUser.followingCount);

    const isCurrUser = sessionUser?.id === profileUser.id;
    const handleFollowClick = () => {
        if(isCurrUser) 
            return;
        try {
            if(isFollowing) {
                unfollowUser(sessionUser.id, profileUser.id);
                
            } else {
                followUser(sessionUser.id, profileUser.id);
            }
        } catch (error) {
            console.error("Please wait a few moments before clicking the button");
            return;
        }
        setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);
        setIsFollowing(!isFollowing);
    }

    return (
        <section className="flex flex-col mt-8 sm:mt-16 mb-8 px-4 sm:px-0">
            {/* Profile */}
            <main className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-0">
                {/* User Avatar */}
                <figure className="avatar w-24 h-24 sm:w-36 sm:h-36 flex flex-col justify-center items-center flex-shrink-0">
                    {profilePicture 
                    ? 
                    <div
                        className={`ring-2 ring-offset-0 ring-black ring-offset-base-100 h-full w-full p-1 rounded-full`}
                    >
                        {(profilePicture.type === "UPLOADED" && profilePicture.url)
                            ? 
                            <Image 
                                src={profilePicture.url}
                                alt={`${profileName}'s profile picture`}
                                width={144}
                                height={144}
                                className={`object-cover h-full w-full rounded-full`}
                            />
                            : 
                            <figure className={`bg-${profilePicture.backgroundColor} h-full w-full rounded-full flex items-center justify-center`}>
                                <span className="text-2xl sm:text-4xl text-white font-bold">{profilePicture.foregroundInitials}</span>
                            </figure>
                        }
                    </div>
                    : 
                    <div className="skeleton h-24 w-24 sm:h-36 sm:w-36 shrink-0 rounded-full"></div>
                    }
                </figure>
                
                {/* User Info */}
                <section className="sm:px-12 mb-2 flex flex-col justify-start items-center sm:items-start gap-1 w-full sm:w-auto">
                
                    <div className="text-center sm:text-left w-full">
                        {/* Name */}
                        <div className="text-xl sm:text-[1.80rem] m-0 font-bold leading-7 sm:leading-9 line-clamp-2">
                            {profileName}
                        </div>
                        {/* Username */}
                        <div className="text-sm sm:text-[1rem] mt-[-2px] pr-1 text-gray-700 leading-5 sm:leading-6 line-clamp-2 flex flex-row items-center justify-center sm:justify-start">
                            <IconAt className="h-[1rem] sm:h-[1.15rem] pt-[0.5px] my-auto w-[0.9rem] sm:w-[1rem]"/>{profileUsername}
                        </div>
                    </div>
                    
                    {/* Followers / Following */}
                    <div className="flex flex-row justify-center sm:justify-start w-full gap-4 mt-2">
                        <div className="flex flex-row items-center gap-1">
                            <span className="font-bold text-sm">{followerCount}</span>
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
            <nav className="flex flex-row justify-center my-4 sm:my-2">
                {isCurrUser 
                    ? 
                    <button className="btn btn-sm btn-outline btn-disabled bg-secondary rounded-md px-6 w-full sm:w-auto max-w-xs"
                        onClick={() => {}}
                    >
                        Edit Profile
                    </button>
                    : 
                    <>
                        {isFollowing 
                            ?
                            <button className="btn btn-sm btn-outline bg-white rounded-md px-6 w-full sm:w-auto max-w-xs"
                                onClick={handleFollowClick}
                            >
                                Unfollow
                            </button>
                            :
                            <button className="btn btn-sm btn-outline bg-secondary rounded-md px-6 w-full sm:w-auto max-w-xs"
                                onClick={handleFollowClick}
                            >
                                Follow
                            </button>
                        }
                    </>
                }
            </nav>
        </section>
    )
}

export function SkeletonUserProfile() {
    return (
        <>
            {/* User Section Skeleton */}
            <section className="relative mt-8 sm:mt-16 mb-8 animate-pulse px-4 sm:px-0">
                
                {/* Profile */}
                <main className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-0">
                    {/* User Avatar Skeleton */}
                    <figure className="flex flex-col justify-center items-center flex-shrink-0">
                        <div className="avatar h-24 w-24 sm:h-36 sm:w-36">
                            <div className="mask mask-squircle w-full shadow-lg bg-gray-300"></div>
                        </div>
                    </figure>
                    
                    {/* User Info Skeleton */}
                    <section className="sm:px-12 mb-2 flex flex-col justify-start items-center sm:items-start gap-1 w-full sm:w-auto">
                    
                        <div className="w-full flex flex-col items-center sm:items-start">
                            {/* Name Skeleton */}
                            <div className="h-7 sm:h-9 w-40 sm:w-48 bg-gray-300 rounded mb-1"></div>
                            {/* Username Skeleton */}
                            <div className="h-5 sm:h-6 w-28 sm:w-32 bg-gray-300 rounded flex flex-row items-center"></div>
                        </div>
                        
                        {/* Followers / Following Skeleton */}
                        <div className="flex flex-row justify-center sm:justify-start w-full gap-4 mt-2">
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
                <nav className="flex flex-row justify-center my-4 sm:my-2">
                    <div className="h-8 w-full sm:w-32 max-w-xs bg-gray-300 rounded-md"></div>
                </nav>
            </section>
        </>
    )
}