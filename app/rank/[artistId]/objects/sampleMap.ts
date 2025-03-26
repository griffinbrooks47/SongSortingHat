
/* Interface imports. */
import { DetailedTrack } from "@/types/artist";

/* Sample data ~ Maps track id to detailed track data. */
const sampleMap: Map<string, DetailedTrack> = new Map([
    [
        "champagne",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    },
                    {
                        id: "3d5yBCe5SBKkJnWvl9GB7r",
                        name: "Nick Johnston",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/3d5yBCe5SBKkJnWvl9GB7r"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "champagne",
                name: "Champagne",
                track_number: 3
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b2735530a953e5c00afb3650b21e",
                height: 640,
                width: 640
            }
        }
    ],
    [
        "GOAT",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "GOAT",
                name: "G.O.A.T.",
                track_number: 10
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b2737a799cc62e624fd6432779e3",
                height: 640,
                width: 640
            }
        }
    ],
    [
        "Nasty",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    },
                    {
                        id: "4fsZkYcSEUEvZK2tEjzrVY",
                        name: "Jason Richardson",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4fsZkYcSEUEvZK2tEjzrVY"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "Nasty",
                name: "Nasty (feat. Jason Richardson)",
                track_number: 1
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b2737a799cc62e624fd6432779e3",
                height: 640,
                width: 640
            }
        }
    ],
    [
        "OD",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "OD",
                name: "O.D.",
                track_number: 2
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b2737a799cc62e624fd6432779e3",
                height: 640,
                width: 640
            }
        }
    ],
    [
        "death-note",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    },
                    {
                        id: "1v7B6ZWa7QRQS3knn3Jvf4",
                        name: "Ichika Nito",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/1v7B6ZWa7QRQS3knn3Jvf4"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "death-note",
                name: "Death Note (feat. Ichika)",
                track_number: 3
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b2737a799cc62e624fd6432779e3",
                height: 640,
                width: 640
            }
        }
    ],
    [
        "yas",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    },
                    {
                        id: "1C5b4zPDtIjrhOVVvBBtCZ",
                        name: "Mario Camarena",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/1C5b4zPDtIjrhOVVvBBtCZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    },
                    {
                        id: "4Oi8WFhH1lsM4EzTgT2NP0",
                        name: "Erick Hansel",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4Oi8WFhH1lsM4EzTgT2NP0"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "yas",
                name: "Yas (feat. Mario Camarena and Erick Hansel)",
                track_number: 7
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b2737a799cc62e624fd6432779e3",
                height: 640,
                width: 640
            }
        }
    ],
    [
        "nightmare",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "nightmare",
                name: "Nightmare",
                track_number: 4
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b2732a2d11880ce5489ccc1d1a37",
                height: 640,
                width: 640
            }
        }
    ],
    [
        "the-worst",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "the-worst",
                name: "The Worst",
                track_number: 6
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b273c87f0133365b6e731ce4fb6f",
                height: 640,
                width: 640
            }
        }
    ],
    [
        "Fuck around & find out",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    },
                    {
                        id: "5IbEL2xjRtKsunfmsahLuO",
                        name: "$NOT",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/5IbEL2xjRtKsunfmsahLuO"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "Fuck around & find out",
                name: "Fuck Around and Find Out (feat. $NOT)",
                track_number: 7
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b273a2d8391f5021568d253a4eef",
                height: 640,
                width: 640
            }
        }
    ],
    [
        "Ego Death",
        {
            track: {
                artists: [
                    {
                        id: "4vGrte8FDu062Ntj0RsPiZ",
                        name: "Polyphia",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/4vGrte8FDu062Ntj0RsPiZ"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    },
                    {
                        id: "32Jb1X3wSmmoHj2epZReZA",
                        name: "Steve Vai",
                        images: [],
                        external_urls: {
                            spotify: "https://open.spotify.com/artist/32Jb1X3wSmmoHj2epZReZA"
                        },
                        followers: { total: 0 },
                        genres: [],
                        popularity: 0
                    }
                ],
                id: "Ego Death",
                name: "Ego Death (feat. Steve Vai)",
                track_number: 12
            },
            cover: {
                url: "https://i.scdn.co/image/ab67616d0000b273a2d8391f5021568d253a4eef",
                height: 640,
                width: 640
            }
        }
    ]
]);
export default sampleMap;