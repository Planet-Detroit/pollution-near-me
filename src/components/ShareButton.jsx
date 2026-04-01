import { useState, useEffect } from 'react'

// Generate a static map image URL via OpenStreetMap's static map service
function getStaticMapUrl(lat, lon) {
  // Use osm-static-maps via a free tile-based approach
  // This generates a URL that social platforms can scrape
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=12&size=1200x630&markers=${lat},${lon},red-pushpin`
}

export default function ShareButton({ url, address, lat, lon, stats }) {
  const [copied, setCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Update OG meta tags when address changes (for social crawlers on shared links)
  useEffect(() => {
    if (!address) return

    const title = `Air pollution sources near ${address}`
    const description = stats
      ? `${stats.total} regulated facilities within 3 miles. ${stats.hpv} with high priority violations, ${stats.recentViolation} with violations.`
      : `See air pollution sources near this Michigan address.`

    document.title = `${title} | Air Pollution Near Me`

    setMetaTag('og:title', title)
    setMetaTag('og:description', description)
    setMetaTag('twitter:title', title)
    setMetaTag('twitter:description', description)

    if (lat && lon) {
      const mapImg = getStaticMapUrl(lat, lon)
      setMetaTag('og:image', mapImg)
      setMetaTag('twitter:image', mapImg)
    }
  }, [address, lat, lon, stats])

  function setMetaTag(property, content) {
    let tag = document.querySelector(`meta[property="${property}"]`)
      || document.querySelector(`meta[name="${property}"]`)
    if (tag) {
      tag.setAttribute('content', content)
    }
  }

  const shareText = stats
    ? `${stats.total} air pollution sources within 3 miles of ${address}. ${stats.hpv + stats.recentViolation} with violations.`
    : `See air pollution sources near ${address || 'your Michigan address'}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setShowMenu(false)
  }

  function getEmbedCode() {
    const embedUrl = url.includes('?') ? `${url}&embed=true` : `${url}?embed=true`
    return `<iframe src="${embedUrl}" width="100%" height="800" frameborder="0" title="Air Pollution Near Me"></iframe>`
  }

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(getEmbedCode())
    } catch {
      const input = document.createElement('textarea')
      input.value = getEmbedCode()
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
    setShowMenu(false)
  }

  function shareToX() {
    const text = encodeURIComponent(shareText)
    const link = encodeURIComponent(url)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}`, '_blank', 'width=550,height=420')
    setShowMenu(false)
  }

  function shareToFacebook() {
    const link = encodeURIComponent(url)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, '_blank', 'width=550,height=420')
    setShowMenu(false)
  }

  function shareToBluesky() {
    const text = encodeURIComponent(`${shareText}\n\n${url}`)
    window.open(`https://bsky.app/intent/compose?text=${text}`, '_blank', 'width=550,height=420')
    setShowMenu(false)
  }

  return (
    <div className="share-wrapper">
      <button
        className="share-toggle"
        onClick={() => setShowMenu(!showMenu)}
        aria-expanded={showMenu}
      >
        Share
      </button>

      {showMenu && (
        <div className="share-menu">
          <button className="share-option" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button className="share-option" onClick={shareToX}>
            Share on X
          </button>
          <button className="share-option" onClick={shareToFacebook}>
            Share on Facebook
          </button>
          <button className="share-option" onClick={shareToBluesky}>
            Share on Bluesky
          </button>
          <button className="share-option share-option-embed" onClick={copyEmbed}>
            {embedCopied ? 'Embed code copied!' : 'Copy embed code'}
          </button>
        </div>
      )}
    </div>
  )
}
