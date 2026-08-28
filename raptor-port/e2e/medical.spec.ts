/* The Medical view (owner, 27 Aug 26) in a real browser: the three sections
   render populated from the demo seed, the cards keep the fixed puck and
   never overflow their grid column, and the whole view fits without a
   horizontal scroll on the phone — the class of fault jsdom (every rect 0x0)
   cannot see. */
import { expect, test } from '@playwright/test'
import { go, login } from './app'

const PHONE = { width: 390, height: 844 }
const DESK = { width: 1500, height: 950 }

test.describe('the medical view renders and fits', () => {
  for (const [name, viewport] of [['phone', PHONE], ['desktop', DESK]] as const) {
    test(`three populated sections, no overflow, on ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await login(page)
      await go(page, 'inputs')
      await page.click('#inMedBtn')
      await page.waitForSelector('#medView .medsec', { state: 'attached' })

      /* the demo seed populates all three sections at the notional today */
      for (const sec of ['med-down', 'med-pend', 'med-done'])
        expect(await page.locator(`.medsec.${sec} .medcard`).count(), sec).toBeGreaterThan(0)

      /* cards stay inside their section — no card wider than its grid box,
         no horizontal scroll on the view body */
      const bad = await page.evaluate(() => {
        const body = document.querySelector('.med-body') as HTMLElement
        if (body.scrollWidth > body.clientWidth + 1) return 'the view scrolls sideways'
        for (const c of document.querySelectorAll('.medcard')) {
          const card = c.getBoundingClientRect()
          const grid = (c.parentElement as HTMLElement).getBoundingClientRect()
          if (card.right > grid.right + 1 || card.left < grid.left - 1) return 'a card left its grid'
        }
        /* the puck keeps the app-wide fixed size inside the card */
        const pk = document.querySelector('.medcard .puck') as HTMLElement
        if (!pk) return 'no puck rendered'
        const r = pk.getBoundingClientRect()
        if (Math.round(r.width) !== 74 || Math.round(r.height) !== 15) return `puck ${r.width}x${r.height}`

        /* EVERY CARD HUGS ITS OWN CONTENT (owner, 28 Aug 26 — "the box around
           the puck doesn't look compact enough"). The cards used to sit in a
           fixed 200px grid track, so a short chit was drawn in a box with
           65–83px of dead air to the right of its last word. A card is now a
           wrapping flex item, so its box should exceed its painted content by
           the padding and borders and nothing more. Measured off the text run
           with a Range: a span inside a column flex is stretched to the card's
           full width, so its own box proves nothing. The Range is read LINE BY
           LINE (getClientRects), not as one box — a wrapped remark on a card
           at the 200px cap has a widest line that reaches the edge, so it
           needs no exemption, and an exemption is what would have let this
           very regression through. */
        for (const c of document.querySelectorAll('.medcard')) {
          const box = c.getBoundingClientRect()
          const runRight = (el: Element | null) => {
            if (!el) return -1e9
            const rg = document.createRange(); rg.selectNodeContents(el)
            let right = -1e9
            for (const b of rg.getClientRects()) if (b.width) right = Math.max(right, b.right)
            return right
          }
          const top = c.querySelector('.medcard-top')
          const inkRight = Math.max(
            top ? top.lastElementChild!.getBoundingClientRect().right : -1e9,
            runRight(c.querySelector('.medcard-t')), runRight(c.querySelector('.medcard-r')))
          const slack = box.right - inkRight
          /* 9px padding + 1px border = 10; anything past ~16 is a box that
             stopped following its content */
          if (slack > 16) return `a card wastes ${Math.round(slack)}px past its last word`
        }
        return ''
      })
      expect(bad).toBe('')

      /* THE AS-OF BUTTON'S ICON DOES NOT TOUCH ITS LABEL (owner, 28 Aug 26 —
         "there's no spacing between the calendar and the word 'as'"). The
         button is a flex box, which drops the whitespace around an anonymous
         text item, so the space written in the JSX is not the one on screen —
         only a real gap keeps them apart, and only a laid-out browser can see
         it. Measured off the text run itself (a Range), not the button box. */
      const cal = await page.evaluate(() => {
        const btn = document.querySelector('#medCalBtn') as HTMLElement
        const svg = btn.querySelector('svg') as SVGElement
        const txt = [...btn.childNodes].find(n => n.nodeType === 3 && n.textContent!.trim())
        const rng = document.createRange(); rng.selectNodeContents(txt!)
        return {
          gap: rng.getBoundingClientRect().left - svg.getBoundingClientRect().right,
          /* and the glyph reads at the label's own brightness, not the dimmer
             bare-icon-button grey — the same rule .filters/.sb-actions follow */
          sameInk: getComputedStyle(svg).color === getComputedStyle(btn).color,
        }
      })
      expect(cal.gap, 'calendar icon to "as of" label').toBeGreaterThanOrEqual(4)
      expect(cal.sameInk, 'glyph takes the label colour').toBe(true)

      /* a card opens the document viewer; the demo seed put real paperwork
         behind it, so an image (not the no-document state) shows */
      await page.click('.medsec.med-down .medcard')
      await page.waitForSelector('#docViewPop:not([hidden])')
      expect(await page.locator('#docViewPop .docview-img').count()).toBe(1)
      await page.click('#docViewDone')
    })
  }

  test('the as-of picker replays history', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'inputs')
    await page.click('#inMedBtn')
    await page.click('#medCalBtn')
    await page.click('[data-medday="2026-07-08"]')
    /* on 8 Jul nasty was still down (6–9 Jul), so he reads in Medically
       Down, not Pending */
    await expect(page.locator('.medsec.med-down')).toContainText('till 9 Jul')
    await page.click('#medToday')
    await expect(page.locator('.medsec.med-pend')).toContainText('was down till 9 Jul')
  })
})
