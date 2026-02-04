'use client';

/* Next / React */
import { useState, useEffect } from "react";

/* Server Actions */
import { getUserWithImage, TUserWithImage } from "@/utils/actions/getUser";

/* Types */
import { useSession } from "@/lib/auth-client";

/* 
    Given a session, validate and return user along with relational data for rendering.
*/
const useGetCurrentUser = () => {

    const { data: session, isPending } = useSession();

    const name = session?.user?.name;
    const userId = session?.user?.id;

    const [username, setUsername] = useState<string | null>(null);
    const [profilePicture, setProfilePicture] = useState<TUserWithImage['profilePicture'] | null>(null);

    const isAuthenticated = !!session;

    useEffect(() => {
        if (!userId) return;

        const fetchUserWithProfilePicture = async () => {
            const user = await getUserWithImage(userId);
            if (!user) return;
            if(user.username) {
                setUsername(user.username);
            }
            if(user.profilePicture) {
                setProfilePicture(user.profilePicture);
            }
        }
        fetchUserWithProfilePicture();

    }, [userId]);

    return { name, username, userId, profilePicture, isAuthenticated };
}
export default useGetCurrentUser;