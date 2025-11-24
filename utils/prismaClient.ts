
/* Import Next.js prisma client module. */
import { prisma } from "@/lib/db";

/* Database types */
import { Prisma } from "@/prisma/generated/prisma/client";
import { DBArtist, DBAlbum, DBTrack, DBGenre, DBArtistImg, DBAlbumImg } from "@/prisma/generated/prisma/client";

/* Universal artist types. */
import { Album, Artist, Genre, Img, Track } from "@/types/artist";
import { TSorting } from "@/types/sorting";
import { TUser } from "@/types/user";

const trackInclude = {
    images: true, 
    artists: true, 
};
type DBTrackWithRelations = Prisma.DBTrackGetPayload<{
    include: typeof trackInclude;
}>;

const albumInclude = { 
    images: true, 
    artists: true, 
    tracks: {
        include: trackInclude,
    },
};
type DBAlbumWithRelations = Prisma.DBAlbumGetPayload<{
    include: typeof albumInclude;
}>;

const artistInclude = {
    images: true,
    genres: true,
    sortings: true,
    albums: {
        include: albumInclude,
    },
    tracks: {
        include: trackInclude,
    },
};
type DBArtistWithRelations = Prisma.DBArtistGetPayload<{
    include: typeof artistInclude;
}>;

const sortingInclude = {
    artist: {
        include: {
            images: true,
        }
    },
    entries: {
        include: {
            track: {
                include: trackInclude,
            },
        },
        orderBy: {
            position: 'asc' as const,
        },
    },
    user: {
        include: {
            profilePicture: true,
        }
    },
};

type DBSortingWithRelations = Prisma.DBSortingGetPayload<{
    include: typeof sortingInclude;
}>;

const userInclude = {
    followers: true,
    following: true,
    favoriteArtists: {
        include: {
            artist: true,
        }
    },
    sortings: {
        include: sortingInclude,
        orderBy: {
            createdAt: 'desc' as const,
        }
    },
    profilePicture: true,
};
type DBUserWithRelations = Prisma.UserGetPayload<{
    include: typeof userInclude;
}>;


/** 
 *  * Prisma wrapper to add, update, delete, and query data from the database.
    Functions:
    ~ getArtist(spotifyId: string): Promise<Artist | null>
    ~ createArtist(artist: Artist): Promise<void>
*/
class PrismaWrapper {
  
    private static instance: PrismaWrapper;

    /* 
        Prisma client instance. 
        This is a singleton, so only one instance of the client will be created.
    */
    public static getInstance(): PrismaWrapper {
        if (!PrismaWrapper.instance) {
        PrismaWrapper.instance = new PrismaWrapper();
        }
        return PrismaWrapper.instance;
    }

    /* 
        DATABASE FETCH
    */
    public async getArtist(spotifyId: string): Promise<Artist | null> {
        try {
            const dbArtist = await prisma.dBArtist.findUnique({
                where: { spotifyId },
                include: artistInclude,
            }) satisfies DBArtistWithRelations | null;
            
            if (!dbArtist) return null;
            return this.parseArtist(dbArtist);
            
        } catch (error) {
            console.error("Error in getArtist:", error);
            throw error;
        }
    }
    public async getAlbumsByArtist(spotifyArtistId: string): Promise<Album[] | null> {
        try {
            const albumsWithTracks = await prisma.dBAlbum.findMany({
                where: {
                    artists: {
                        some: {
                            spotifyId: spotifyArtistId
                        },
                    }
                },
                include: albumInclude,
                orderBy: {
                    release_date: 'desc'
                },
            }) satisfies DBAlbumWithRelations[];

            return albumsWithTracks.map((album: DBAlbumWithRelations) => this.parseAlbum(album));

        } catch (error) {
            console.error("Error in getAlbumsByArtist:", error);
            throw error;
        }
    }
    public async getAllTracksByArtist(spotifyArtistId: string): Promise<Track[] | null> {
        try {
            const dbArtist = await prisma.dBArtist.findUnique({
                where: { spotifyId: spotifyArtistId },
                select: {
                    tracks: {
                        include: trackInclude,
                    }
                }
            });

            /* If artist not found, return null. */
            if (!dbArtist) return null;

            /* Parse tracks */
            const tracks: Track[] = dbArtist.tracks.map((track: DBTrackWithRelations) => 
                this.parseTrack(track)
            );

            return tracks;
        } catch (error) {
            console.error("Error in getTracks:", error);
            throw error;
        }
    }
    public async getSinglesByArtist(spotifyArtistId: string): Promise<Track[] | null> {
        try {
            const dbArtist = await prisma.dBArtist.findUnique({
                where: { spotifyId: spotifyArtistId },
                select: {
                    tracks: {
                        where: {
                            albumTitle: "",
                        },
                        include: trackInclude,
                    }
                }
            });;

            /* If artist not found, return null. */
            if (!dbArtist) return null;

            /* Parse tracks */
            const tracks: Track[] = dbArtist.tracks.map((track: DBTrackWithRelations) => 
                this.parseTrack(track)
            );

            return tracks;
        } catch (error) {
            console.error("Error in getSinglesByArtist:", error);
            throw error;
        }
    }
    public async getSorting(sortingId: string): Promise<TSorting | null> {
        try {
            const sortingWithRelations = await prisma.dBSorting.findUnique({
                where: {
                    id: sortingId
                },
                include: sortingInclude,
            });

            if (!sortingWithRelations) {
                return null;
            }

            return this.parseSorting(sortingWithRelations);

        } catch (error) {
            console.error("Error in getSorting:", error);
            throw error;
        }
    }
    public async getUser(userId: string): Promise<TUser | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { 
                    id: userId
                },
                include: userInclude,
            });

            if (!user) return null;

            return this.parseUser(user);

        } catch (error) {
            console.error("Error in getUser:", error);
            throw error;
        }
    }
    public async getGlobalSortings(userId?: string): Promise<TSorting[]> {
        try {
            const sortings = await prisma.dBSorting.findMany({
                where: {
                    published: true,
                },
                include: sortingInclude,
                orderBy: {
                    createdAt: 'desc',
                },
                take: 100,
            });

            return sortings.map(sorting => this.parseSorting(sorting));

        } catch (error) {
            console.error("Error in getGlobalSortings:", error);
            throw error;
        }
    }             

    /* 
        DATABASE CREATE
    */
    public async createArtist(artist: Artist): Promise<void> {
        
        const artistImgs: Img[] = artist.images || [];
        const albums: Album[] = artist.albums || [];
        const tracks: Track[] = artist.tracks || [];
        const nonAlbumTracks: Track[] = tracks.filter(track => !track.album_title);

        /* Check if the artist already exists */
        const existingArtist = await this.getArtist(artist.spotifyId);
        if (existingArtist) {
            console.log(`Artist ${artist.name} already exists.`);
            return;
        }

        /* Upsert the artist to the database */
        const dbArtist = await prisma.dBArtist.upsert({
            where: { spotifyId: artist.spotifyId },
            update: {
                followers: artist.followers,
                images: {
                    create: artistImgs.map((img) => ({
                        width: img.width,
                        height: img.height,
                        url: img.url,
                    })),
                },
                external_urls: {},
                genres: {},
            },
            create: {
                spotifyId: artist.spotifyId,
                name: artist.name,
                followers: artist.followers,
                images: {
                    create: artistImgs.map((img) => ({
                        width: img.width,
                        height: img.height,
                        url: img.url,
                    })),
                },
                external_urls: {},
                genres: {},
            },
            include: artistInclude, // Include relations
        });

        /* Grab returned ID */
        const dbArtistId = dbArtist.id;

        /* Gather previous albums & tracks */
        const prevAlbumObjs = await prisma.dBArtist.findUnique({
            where: { id: dbArtistId },
            include: {
                albums: true,
                tracks: true,
            }
        })

        /* If there are no entries, create them and return. */
        if(!prevAlbumObjs) {
            return;
        }

        /* Create hashmaps of current and new records for easy indexing. */
        const prevAlbumMap = new Map(prevAlbumObjs.albums.map(album => [album.spotifyId, album]));
        const currAlbumMap = new Map(albums.map(album => [album.spotifyId, album]));

        /* Albums in new but not in old */
        const additions = new Set<Album>();

        /* Albums in old but not in new */
        const subtractions = new Set<DBAlbum>();

        /* Albums in both */
        const updates = new Set<Album>();

        /* Divide IDs into additions, subtractions, and updates. */
        for (const [currId, currAlbum] of currAlbumMap.entries()) {
            if (!prevAlbumMap.has(currId)) {
                additions.add(currAlbum);
            } else {
                updates.add(currAlbum);
            }
        }
        for (const [prevId, prevAlbum] of prevAlbumMap.entries()) {
            if (!currAlbumMap.has(prevId)) {
                subtractions.add(prevAlbum);
            }
        }

        /* Create any new albums */
        await prisma.dBAlbum.createMany({
            data: Array.from(additions).map((newAlbum) => 
                ({
                    spotifyId: newAlbum.spotifyId,
                    title: newAlbum.title,
                    release_date: newAlbum.release_date,
                    total_tracks: newAlbum.total_tracks,
                })
            ),
        });
        /* Add album tracks */
        for(const newAlbum of additions) {

            /* Album relational data. */
            const albumImages: Img[] = newAlbum.images;
            const albumTracks: Track[] = newAlbum.tracks;


            await prisma.dBAlbum.update({
                where: { spotifyId: newAlbum.spotifyId },
                data: {
                    artists: {
                        connectOrCreate: newAlbum.artists
                        .filter(artist => artist.spotifyId)
                        .map((artist) => 
                        ({
                            where: { spotifyId: artist.spotifyId },
                            create: {
                                spotifyId: artist.spotifyId,
                                name: artist.name,
                                followers: artist.followers,
                                external_urls: {
                                    
                                },
                            }
                        }))
                    },
                    images: {
                        connectOrCreate: newAlbum.images.map((img) => 
                            ({
                                where: { url: img.url },
                                create: {
                                    width: img.width,
                                    height: img.height,
                                    url: img.url,
                                }
                            })
                        ),
                    },
                    tracks: {
                        create: newAlbum.tracks.map((newTrack) => 
                        ({
                            spotifyId: newTrack.spotifyId,
                            title: newTrack.title,
                            albumTitle: newAlbum.title,
                        
                            /* Connect or create artists */
                            artists: {
                                connectOrCreate: newAlbum.artists
                                .filter(artist => artist.spotifyId)
                                .map((artist) => 
                                ({
                                    where: { spotifyId: artist.spotifyId },
                                    create: {
                                        spotifyId: artist.spotifyId,
                                        name: artist.name,
                                        followers: artist.followers,
                                        external_urls: {
                                            
                                        },
                                    }
                                }))
                            },
                        }))
                    },
                }
            });

            for (const albumImage of albumImages) {
                await prisma.dBAlbumImg.update({
                    where: { url: albumImage.url },
                    data: {
                        tracks: {
                            connectOrCreate: albumTracks.map((track) => ({
                                where: { spotifyId: track.spotifyId },
                                    create: {
                                        spotifyId: track.spotifyId,
                                        title: track.title,
                                    },
                            }))
                        }
                    }
                });
            }
        }
     
        /* Delete any albums that no longer exist. */
        for (const oldAlbum of subtractions) {
            await prisma.dBAlbum.delete({
                where: { id: oldAlbum.id },
            });
        }

        /* 
            !! NEED TO HANDLE UPDATING ALBUMS 
        */

        /* Now, handle non album tracks. */
        const prevTrackMap = new Map(prevAlbumObjs.tracks.filter(track => !track.albumTitle).map(track => [track.spotifyId, track]));
        const currTrackMap = new Map(nonAlbumTracks.map(track => [track.spotifyId, track]));

        /* Tracks in new but not in old */
        const trackAdditions = new Set<Track>();

        /* Tracks in old but not in new */
        const trackSubtractions = new Set<DBTrack>();

        /* Tracks in both */
        const trackUpdates = new Set<Track>();

        /* Divide IDs into additions, subtractions, and updates. */
        for (const [currId, currTrack] of currTrackMap.entries()) {
            if (!prevTrackMap.has(currId)) {
                trackAdditions.add(currTrack);
            } else {
                trackUpdates.add(currTrack);
            }
        }
        for (const [prevId, prevTrack] of prevTrackMap.entries()) {
            if (!currTrackMap.has(prevId)) {
                trackSubtractions.add(prevTrack);
            }
        }

        /* Create any new tracks */
        await prisma.dBTrack.createMany({
            data: Array.from(trackAdditions).map((newTrack) => 
                ({
                    spotifyId: newTrack.spotifyId,
                    title: newTrack.title,
                    albumTitle: "",
                })
            ),
        });
        /* Add track artists */
        for(const newTrack of trackAdditions) {
            await prisma.dBTrack.update({
                where: { spotifyId: newTrack.spotifyId },
                data: {
                    artists: {
                        connectOrCreate: newTrack.artists
                        .filter(artist => artist.spotifyId)
                        .map((artist) => 
                        ({
                            where: { spotifyId: artist.spotifyId },
                            create: {
                                spotifyId: artist.spotifyId,
                                name: artist.name,
                                followers: artist.followers,
                                external_urls: {
                                    
                                },
                            }
                        }))
                    },
                    images: {
                        connectOrCreate: newTrack.images
                        .map((image) => 
                        ({
                            where: { url: image.url },
                            create: {
                                url: image.url,
                                width: image.width,
                                height: image.height,
                            }
                        }))
                    }
                }
            });
        }
        /* Delete any tracks that no longer exist. */
        for (const oldTrack of trackSubtractions) {
            await prisma.dBTrack.delete({
                where: { id: oldTrack.id },
            });
        }
        console.log(`Artist ${artist.name} created successfully.`);
    }
    public async createSorting(
        userId: string,
        artistSpotifyId: string,
        sortingSpotifyIds: string[]
    ) {
        if (!sortingSpotifyIds || sortingSpotifyIds.length === 0) {
            throw new Error("At least one track ID must be provided.");
        }

        /* Resolve the artist's internal DB id (prisma relation expects artistId, not nested connect) */
        const dbArtist = await prisma.dBArtist.findUnique({
            where: { spotifyId: artistSpotifyId },
            select: { id: true },
        });
        if (!dbArtist) {
            throw new Error(`Artist with spotifyId ${artistSpotifyId} not found.`);
        }

        /* Create sorting with nested entries */
        const sorting = await prisma.dBSorting.create({
            data: {
                userId,
                artistId: dbArtist.id,
                entries: {
                    create: sortingSpotifyIds.map((trackSpotifyId, index) => ({
                        position: index + 1, // assign position 1..n
                        track: {
                            connect: { spotifyId: trackSpotifyId },
                        },
                    })),
                },
                tracks: {
                    connect: sortingSpotifyIds.map((spotifyId) => ({ 
                        spotifyId: spotifyId 
                    })),
                },
            },
            include: {
                entries: {
                    include: { track: true },
                },
                tracks: true,
                artist: true,
                user: true,
            },
        });

        return sorting;
    }

    /* 
        DATABASE UPDATE
    */
    public async followUser(currentUserId: string, targetUserId: string): Promise<void> {
        if (currentUserId === targetUserId) {
            throw new Error("Users cannot follow themselves");
        }

        await prisma.$transaction(async (tx) => {
            const alreadyFollowing = await tx.user.findFirst({
            where: {
                id: currentUserId,
                following: { some: { id: targetUserId } },
            },
            select: { id: true },
            });

            if (alreadyFollowing) {
                throw new Error("Already following this user");
            }

            await tx.user.update({
            where: { id: currentUserId },
            data: {
                following: { connect: { id: targetUserId } },
                followingCount: { increment: 1 },
            },
            });

            await tx.user.update({
            where: { id: targetUserId },
            data: {
                followers: { connect: { id: currentUserId } },
                followerCount: { increment: 1 },
            },
            });
        });
    }
    async unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
        if (currentUserId === targetUserId) {
            throw new Error("Users cannot unfollow themselves");
        }

        await prisma.$transaction(async (tx) => {
            const isFollowing = await tx.user.findFirst({
            where: {
                id: currentUserId,
                following: { some: { id: targetUserId } },
            },
            select: { id: true },
            });

            if (!isFollowing) {
                throw new Error("You are not following this user");
            }

            await tx.user.update({
            where: { id: currentUserId },
            data: {
                following: { disconnect: { id: targetUserId } },
                followingCount: { decrement: 1 },
            },
            });

            await tx.user.update({
            where: { id: targetUserId },
            data: {
                followers: { disconnect: { id: currentUserId } },
                followerCount: { decrement: 1 },
            },
            });
        });
    }

    /* 
        PRIVATE HELPERS - PARSING DATA 
    */
    private parseArtist(dbArtist: DBArtistWithRelations): Artist {

        /* Package Artist Albums */
        const albums: Album[] = (dbArtist.albums ?? []).map(album =>
            this.parseAlbum(album)
        );

        /* Package Artist Tracks */
        const tracks: Track[] = dbArtist.tracks.map((track) => 
            this.parseTrack(track)
        );

        /* Package Artist Imgs */
        const images: Img[] = dbArtist.images.map((img: DBArtistImg) => ({
            width: img.width,
            height: img.height,
            url: img.url,
        }));

        /* Package Artist Genres */
        const genres: Genre[] = dbArtist.genres.map((g: DBGenre) => ({
            id: g.id,
            name: g.name,
        }));
        /* Package external urls */
        const external_urls = {
        };

        return {
            /* Relational data */
            albums: albums,
            tracks: tracks,
            genres: genres,
            images: images,

            /* Non relational data */
            spotifyId: dbArtist.spotifyId,
            name: dbArtist.name,
            external_urls: external_urls,
            followers: dbArtist.followers,
        };
    }
    private parseAlbum(dbAlbum: DBAlbumWithRelations): Album {

        /* Package Album Artists */
        const artists: Artist[] = dbAlbum.artists.map((artist: DBArtist) => ({
            /* Artist Data */
            spotifyId: artist.spotifyId,
            name: artist.name,
            followers: artist.followers,
            external_urls: {
                /* !!! Add external urls later */
            }
        }));

        /* Package Album Imgs */
        const images: Img[] = dbAlbum.images.map((img: DBAlbumImg) => ({
            width: img.width,
            height: img.height,
            url: img.url,
        }));

        /* Package Album Tracks */
        const tracks: Track[] = dbAlbum.tracks.map((track: DBTrackWithRelations) => 
            this.parseTrack(track)
        );

        return ({
            /* Album Data */
            spotifyId: dbAlbum.spotifyId,
            total_tracks: dbAlbum.total_tracks,
            external_urls: {
            },
            title: dbAlbum.title,
            release_date: dbAlbum.release_date,
            album_type: "album",

            /* Relational Data */
            images: images,
            artists: artists,
            tracks: tracks,
        })

    }
    private parseTrack(dbTrack: DBTrackWithRelations): Track {

        /* Package artists. */
        const artists: Artist[] = dbTrack.artists.map((artist: DBArtist) => ({
            id: artist.id,
            spotifyId: artist.spotifyId,
            name: artist.name,
            followers: artist.followers,
            external_urls: {
                /* !!! Add external urls later */
            },
        }));

        const images: Img[] = dbTrack.images.map((img: DBAlbumImg) => ({
            width: img.width,
            height: img.height,
            url: img.url,
        }));

        const album_title: string = dbTrack.albumId || "";

        return (
            {
                spotifyId: dbTrack.spotifyId,
                title: dbTrack.title,
                artists: artists,
                album_title: album_title,
                images: images,
            }
        )
    }
    private parseSorting(dbSorting: DBSortingWithRelations): TSorting {
        
        const sortedEntries = dbSorting.entries.sort((a, b) => a.position - b.position);
        
        const tracks = sortedEntries.map(entry => this.parseTrack(entry.track));

        const artist: Artist = {
            id: dbSorting.artist.id,
            spotifyId: dbSorting.artist.spotifyId,
            name: dbSorting.artist.name,
            followers: dbSorting.artist.followers,
            external_urls: {
                /* !!! Add external urls later */
            },
            images: dbSorting.artist.images.map((img: DBArtistImg) => ({
                width: img.width,
                height: img.height,
                url: img.url,
            })),
        };

        const user = {
            id: dbSorting.user.id,
            createdAt: dbSorting.user.createdAt,
            updatedAt: dbSorting.user.updatedAt,
            email: dbSorting.user.email,
            emailVerified: dbSorting.user.emailVerified,
            name: dbSorting.user.name,
            username: dbSorting.user.username || "",
            followerCount: dbSorting.user.followerCount,
            followingCount: dbSorting.user.followingCount,
            image: dbSorting.user.image,
            followers: [],   // satisfy TUser shape
            following: [],   // satisfy TUser shape
            profilePicture: dbSorting.user.profilePicture ? {
                url: dbSorting.user.profilePicture.url,
                backgroundColor: dbSorting.user.profilePicture.backgroundColor,
            } : {
                url: "/profile_icons/default_profile_icon.png",
                backgroundColor: "accent",
            },
        };

        return {
            id: dbSorting.id,
            isPublic: dbSorting.isPublic,
            createdAt: dbSorting.createdAt,
            updatedAt: dbSorting.updatedAt,
            published: dbSorting.published,

            artist: artist,
            artistId: dbSorting.artist!.spotifyId,

            user: user,
            userId: dbSorting.userId,

            tracks,
        };
    }
    private parseUser(dBUserWithRelations: DBUserWithRelations): TUser {

        const favoriteArtists: Artist[] = dBUserWithRelations.favoriteArtists.map(fav => ({
            id: fav.artist.id,
            spotifyId: fav.artist.spotifyId,
            name: fav.artist.name,
            followers: fav.artist.followers,
            external_urls: {
                /* !!! Add external urls later */
            },
        }));

        const followers: TUser[] = dBUserWithRelations.followers.map(follower => ({
            id: follower.id,
            name: follower.name,
            username: follower.username || "",
            image: follower.image,
            profilePicture: {
                url: "/profile_icons/default_profile_icon.png",
                backgroundColor: "accent",
            },
            followerCount: follower.followerCount,
            followingCount: follower.followingCount,
            followers: [],   // satisfy TUser shape
            following: [],   // satisfy TUser shape
        }));
        const following: TUser[] = dBUserWithRelations.following.map(following => ({
            id: following.id,
            name: following.name,
            username: following.username || "",
            image: following.image,
            profilePicture: {
                url: "/profile_icons/default_profile_icon.png",
                backgroundColor: "accent",
            },
            followerCount: following.followerCount,
            followingCount: following.followingCount,
            followers: [],   // satisfy TUser shape
            following: [],   // satisfy TUser shape
        }));

        const profilePicture = dBUserWithRelations.profilePicture ? {
            url: dBUserWithRelations.profilePicture.url,
            backgroundColor: dBUserWithRelations.profilePicture.backgroundColor,
        } : {
            url: "/profile_icons/default_profile_icon.png",
            backgroundColor: "accent",
        };

        const sortings: TSorting[] = dBUserWithRelations.sortings.map(sorting => this.parseSorting(sorting));

        return {
            id: dBUserWithRelations.id,
            name: dBUserWithRelations.name,
            username: dBUserWithRelations.username || "",
            followerCount: dBUserWithRelations.followers.length,
            followingCount: dBUserWithRelations.following.length,
            followers: followers,
            following: following,
            image: dBUserWithRelations.image,
            profilePicture: profilePicture,
            favoriteArtists: favoriteArtists,
            sortings: sortings,
        };
   }
}
export default PrismaWrapper.getInstance();