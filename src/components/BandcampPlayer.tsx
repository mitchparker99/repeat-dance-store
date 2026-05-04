import React from 'react'

async function findBandcampEmbed(catno: string, artist: string, title: string): Promise<string | null> {
  const queries = [catno, `${artist} ${title}`].filter(Boolean)
  for (const query of queries) {
    try {
      const searchRes = await fetch(
        `https://bandcamp.com/search?q=${encodeURIComponent(query)}&item_type=a`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RepeatDanceStore/1.0)' },
          next: { revalidate: 86400 },
        }
      )
      if (!searchRes.ok) continue
      const html = await searchRes.text()
      const albumMatch = html.match(/href="(https?:\/\/[^"]+\.bandcamp\.com\/album\/[^"?#]+)"/i)
      if (!albumMatch) continue
      const albumUrl = albumMatch[1].split('?')[0]
      const albumRes = await fetch(albumUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RepeatDanceStore/1.0)' },
        next: { revalidate: 86400 },
      })
      if (!albumRes.ok) continue
      const albumHtml = await albumRes.text()
      for (const pattern of [/album=(\d+)/, /"item_id":(\d+)/, /tralbum_id\s*:\s*(\d+)/]) {
        const m = albumHtml.match(pattern)
        if (m) return `https://bandcamp.com/EmbeddedPlayer/album=${m[1]}/size=large/bgcol=ffffff/linkcol=000000/tracklist=true/artwork=small/transparent=true/`
      }
    } catch { /* silent */ }
  }
  return null
}

interface BandcampPlayerProps {
  catno?: string
  artist: string
  title: string
}

export async function BandcampPlayer({ catno, artist, title }: BandcampPlayerProps) {
  const embedUrl = await findBandcampEmbed(catno || '', artist, title)
  const searchQuery = catno || `${artist} ${title}`

  return (
    <div className="mt-6">
      <p className="text-xs font-bold uppercase tracking-widest mb-3">Listen</p>
      {embedUrl && (
        <iframe
          style={{ border: 0, width: '100%', height: '120px' }}
          src={embedUrl}
          seamless
          title={`${artist} – ${title} on Bandcamp`}
        />
      )}
      <a
        href={`https://bandcamp.com/search?q=${encodeURIComponent(searchQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:underline mt-2"
      >
        {embedUrl ? 'View on Bandcamp →' : 'Search on Bandcamp →'}
      </a>
    </div>
  )
}
