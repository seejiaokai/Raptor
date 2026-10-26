/* ROUND 3's ⋯ FOR THE UNIT TESTS (his D1326): Grant OIL, Post out and Post in stand behind the ⋯ in the row under the
   leaves — `bid-more` on the one-day window, `sel-more` on the drag-selection window. A test that presses one opens the ⋯
   first, as he would, so the route it proves is the one on screen; `more('bid-oil')` returns the menu's button. */
import { fireEvent, screen } from '@testing-library/react'

export function more(id: string): HTMLElement {
  const pre = id.startsWith('sel-') ? 'sel' : 'bid'
  if (!screen.queryByTestId(id)) fireEvent.click(screen.getByTestId(`${pre}-more`))
  return screen.getByTestId(id)
}
