'use client'

/* Next / React*/
import { useEffect, useState } from "react";
import Link from "next/link";

/* Server Actions */
import { checkArtistStatus } from "../actions/createArtistTracks"

export default function SortArtistButton(
  props: { artistSpotifyId: string }
) {

  const [status, setStatus] = useState<boolean>(false);

  const [isPolling, setIsPolling] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isPolling) return;

    let pollTimeoutId: NodeJS.Timeout;
    let maxTimeoutId: NodeJS.Timeout;

    maxTimeoutId = setTimeout(() => {
      setIsPolling(false);
      setTimedOut(true);
      clearTimeout(pollTimeoutId);
    }, 10000);

    const poll = async () => {
      try {
        const result = await checkArtistStatus(props.artistSpotifyId);
        setStatus(result);
        
        if (result) {
          setIsPolling(false);
          clearTimeout(maxTimeoutId);
        } else {
          pollTimeoutId = setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Polling error:', error);
        pollTimeoutId = setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      clearTimeout(pollTimeoutId);
      clearTimeout(maxTimeoutId);
    };
  }, [isPolling]);

  if (timedOut && !status) {
    return (
      <button className="btn btn-sm sm:btn-md btn-disabled">
        <span>Refresh Page</span>
      </button>
    )
  }
  return (
    <>
      {status ? (
        <Link 
          className="btn btn-sm sm:btn-md btn-outline border-black"
          href={`/rank/${props.artistSpotifyId}`}
        >
          <span>Create Sorting</span>
        </Link>
      ) : (
        <button className="btn btn-sm sm:btn-md btn-disabled">
          <span>Syncing tracks</span>
        </button>
      )}
    </>
  )
}