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
        return ''
      })
      expect(bad).toBe('')

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
