import { Artist } from "./artist";
import { TSorting } from "./sorting";

export type TUser = {
    id: string;
    name: string;
    username: string;
    followers: TUser[];
    following: TUser[];
    followerCount: number;
    followingCount: number;
    image: string;
    profilePicture: {
        url: string | null;
        backgroundColor: string;
    };
    favoriteArtists?: Artist[];
    sortings?: TSorting[];
}