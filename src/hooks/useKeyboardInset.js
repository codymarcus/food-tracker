import { useEffect, useState } from 'react'

// iOS Safari doesn't keep `position: fixed; bottom: 0` elements pinned above
// the on-screen keyboard — it shrinks/offsets the visual viewport instead,
// leaving fixed elements stranded underneath it. This tracks that gap via
// the VisualViewport API so a sheet can shift itself above the keyboard.
export function useKeyboardInset() {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    function update() {
      const gap = window.innerHeight - vv.height - vv.offsetTop
      setInset(Math.max(0, Math.round(gap)))
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}
