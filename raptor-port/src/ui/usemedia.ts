/* IS THE SCREEN THIS SHAPE? — asked of the browser, as the stylesheet asks it, and followed live (a phone turned, a
   window narrowed). For the few places where what is WRITTEN changes with the room, not only how it is laid out: the
   stylesheet cannot shorten a word. Where there is no browser to ask (a test with no layout) the answer is no. */
import { useEffect, useState } from 'react'

export function useMedia(query: string): boolean {
  const read = () => typeof window !== 'undefined' && !!window.matchMedia && !!window.matchMedia(query).matches
  const [hit, setHit] = useState(read)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(query)
    const on = () => setHit(!!mq.matches)
    on()
    if (mq.addEventListener) mq.addEventListener('change', on); else if (mq.addListener) mq.addListener(on)
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', on); else if (mq.removeListener) mq.removeListener(on) }
  }, [query])
  return hit
}
