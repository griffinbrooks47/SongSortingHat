

export default async function Rank({
    params,
  }: {
    params: Promise<{ artist: string }>
  }) {
    const artist = (await params).artist
    return <div>My Post: {artist}</div>
  }