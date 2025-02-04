import { create } from 'zustand'

interface Artist {
    id: string;
    name: string;
    images: Image[];
}
interface Image {
    width: number;
    height: number;
    url: string;
}
interface ArtistState {
    artists: Artist[];
    pushArtist: (newArtist: Artist) => void;
    clearArtists: () => void;
}

const useArtistStore = create<ArtistState>((set) => ({
    artists: [],
    pushArtist: (newArtist) => {
        set((state) => ({
            artists: [...state.artists, newArtist], // Append newArtist to the artists array
        }));
    },
    clearArtists: () => {
        set({
            artists: [], // Reset the artists array to an empty array
        });
    },
}));

export default useArtistStore;