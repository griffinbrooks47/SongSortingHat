'use client'

/* Server Actions */
import { followUser, unfollowUser } from "@/utils/serverFunctions/followUser";

/* Types */
import { TUser } from "@/types/user";

/* React / Next */
import Image from "next/image";
import { useState } from "react";
import { IconAt } from "@tabler/icons-react";

export default function UserProfile(
    {
        user,
        currUserId
    } : {
        user: TUser,
        currUserId: string
    }
) {

    const username = user.username;
    const followerCount = user.followerCount;
    const followingCount = user.followingCount;

    const [followers, setFollowers] = useState(followerCount);

    const isCurrUser = currUserId === user.id;

    const [isFollowing, setIsFollowing] = useState(
        user.followers.map((follower) => follower.id).includes(currUserId)
    );

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
                            <div className="mask mask-squircle w-full shadow-lg">
                                <Image
                                    src={user.profilePicture?.url || "/profile_icons/default_profile_icon.png"}
                                    alt={username}
                                    width={144}
                                    height={144}
                                    className={`object-cover w-full h-full bg-${user.profilePicture?.backgroundColor || "accent"}`}
                                />
                            </div>
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