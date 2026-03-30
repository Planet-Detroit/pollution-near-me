import { useState } from 'react'

export default function ShareButton({ url, address }) {
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const shareText = address
    ? `See air pollution sources near ${address}`
    : 'See air pollution sources near your Michigan address'

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
        </div>
      )}
    </div>
  )
}
