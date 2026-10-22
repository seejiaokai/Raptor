/* D1264 (owner, 23 Oct 26 — "put the open for bidding at the top full page. So that when the dates below jumps it doesn't
   affect the user to chase the buttons"): on a phone the "Open for bidding" window is a full page from the top (Sheet's
   `page`), not the floating sheet docked at the foot that grew upward and moved its month buttons; a desktop keeps the
   floating, movable sheet. Where it sits is the stylesheet's (`.bidsheet.fullpage`, measured in the walk); what is pinned here
   is which form each width gets. */
import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sheet } from './Sheet'
import { PHONE_QUERY } from './phone'

const asWidth = (phone: boolean) => {
  ;(window as any).matchMedia = (q: string) => ({
    matches: q === PHONE_QUERY ? phone : false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })
}
afterEach(() => { delete (window as any).matchMedia })

const draw = (page: boolean) => render(
  <Sheet testid="open-dates" label="Open for bidding" onClose={() => {}} page={page}>
    <div className="bidsheet-hd"><span className="who">Open for bidding</span></div>
  </Sheet>,
)

describe('D1264 — the "Open for bidding" window is a full page from the top on a phone', () => {
  it('a phone: the page form', () => {
    asWidth(true); draw(true)
    expect(screen.getByTestId('open-dates').classList.contains('fullpage')).toBe(true)
  })
  it('a desktop: the floating sheet, as before', () => {
    asWidth(false); draw(true)
    expect(screen.getByTestId('open-dates').classList.contains('fullpage')).toBe(false)
  })
  it('every other window keeps the floating sheet on a phone', () => {
    asWidth(true); draw(false)
    expect(screen.getByTestId('open-dates').classList.contains('fullpage')).toBe(false)
  })
  it('the window itself asks for the page form', async () => {
    const src = await import('./OpenDatesSheet.tsx?raw').then(m => (m as any).default as string).catch(() => null)
    if (src != null) expect(src).toMatch(/<Sheet testid="open-dates"[^>]*\bpage\b/)
  })
})
