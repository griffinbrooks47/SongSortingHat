import { Artist, Track } from "@/types/artist"; // or wherever your Track type is defined
import { TUser } from "./user";

export type TSorting = {
  id: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;

  artist: Artist;
  artistId: string;

  user: TUser;
  userId: string;

  tracks: Track[];
};