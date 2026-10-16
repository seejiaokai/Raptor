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
          /* (row 2 since D965: the kind, the period and any document drawings — its LAST child ends the ink) */
          const top = c.querySelector('.medcard-top'), row2 = c.querySelector('.medcard-row2')
          const inkRight = Math.max(
            top ? top.lastElementChild!.getBoundingClientRect().right : -1e9,
            row2 && row2.lastElementChild ? row2.lastElementChild.getBoundingClientRect().right : -1e9,
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
    await expect(page.locator('.medsec.med-down')).toContainText('6–9 Jul')   // the period (owner D960)
    await page.click('#medToday')
    /* the kind and the period, "was down" gone (owner D965) */
    await expect(page.locator('.medsec.med-pend')).toContainText('6–9 Jul')
    await expect(page.locator('.medsec.med-pend')).not.toContainText('was down')
  })

  /* THREE A ROW ON A PHONE (owner D961, D965 — 17 Oct 26, built as drawn): a card is its puck, then the kind and the
     period on one row, so it is about as wide as its puck and three stand in a row at his iPhone's 390 and at 375. A
     third man is filed down in this browser only (the drawing's own way — scripts/handpass/medical-cards.mjs), so the
     row is the app's own three cards. */
  for (const width of [390, 375]) test(`D965 three medical cards stand in one row at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await login(page)
    const who = await page.evaluate(() => {
      const w = window as any
      const taken = new Set(w.INPUTS.filter((r: any) => /^(ATT [BC]|OML|HL|Upchit)$/i.test(String(r.type))).map((r: any) => String(r.person)))
      const pid = Object.keys(w.PEOPLE).find(k => w.PEOPLE[k].cs && !taken.has(k) && !w.PEOPLE[k].archived && !w.PEOPLE[k].special)
      w.fileInput({ person: pid, type: 'HL', date: 'Jul 12', endDate: 'Jul 15', yr: 2026, allday: true }); if (w.notify) w.notify()
      return w.PEOPLE[pid!].cs
    })
    await go(page, 'inputs')
    await page.click('#inMedBtn')
    await expect(page.locator('.medsec.med-down')).toContainText(who)
    const rows = await page.evaluate(() => {
      const tops = [...document.querySelectorAll('.medsec.med-down .medcard')].map(c => Math.round(c.getBoundingClientRect().top))
      return { n: tops.length, rows: new Set(tops).size, widths: [...document.querySelectorAll('.medcard')].map(c => Math.round(c.getBoundingClientRect().width)) }
    })
    expect(rows.n, 'three men down').toBe(3)
    expect(rows.rows, 'all three in one row').toBe(1)
    for (const w of rows.widths) expect(w, 'a card about its puck wide').toBeLessThanOrEqual(104)
    /* each card two rows: the puck, then the kind and the period on one line */
    const lines = await page.evaluate(() => [...document.querySelectorAll('.medcard')].map(c => {
      const r2 = c.querySelector('.medcard-row2')!.getBoundingClientRect()
      return Math.round(r2.height)
    }))
    for (const h of lines) expect(h, 'row 2 is one line').toBeLessThanOrEqual(16)
  })

  /* A LONG PERIOD GOES UNDER ITS KIND (owner D967 — "Both as recommended", after the code read): "ATT C 29 Jun – 14 Jul"
     is wider than a third of a phone's row; on a phone a card is at most a third, its period on the line under its kind,
     so three still stand in a row — and a card of two documents keeps its "▯ 2" inside its own box. */
  for (const width of [390, 375]) test(`D967 a long period goes under its kind and three still stand in a row at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await login(page)
    const iid = await page.evaluate(() => {
      const w = window as any
      const ids = [...new Set(w.INPUTS.flatMap((r: any) => [r.docId, ...(Array.isArray(r.docIds) ? r.docIds : [])]).filter(Boolean))]
      const taken = new Set(w.INPUTS.filter((r: any) => /^(ATT [BC]|OML|HL|Upchit)$/i.test(String(r.type))).map((r: any) => String(r.person)))
      const pid = Object.keys(w.PEOPLE).find(k => w.PEOPLE[k].cs && !taken.has(k) && !w.PEOPLE[k].archived && !w.PEOPLE[k].special)
      w.fileInput({ person: pid, type: 'ATT C', date: 'Jun 29', endDate: 'Jul 14', yr: 2026, allday: true, docId: ids[0], docIds: ids.slice(0, 2) })
      if (w.notify) w.notify()
      return String(w.INPUTS[0].iid || w.INPUTS[0].id || '')
    })
    await go(page, 'inputs')
    await page.click('#inMedBtn')
    const g = await page.evaluate(() => {
      const cs = [...document.querySelectorAll('.medsec.med-down .medcard')] as HTMLElement[]
      const long = cs.find(c => /29 Jun/.test(c.textContent || ''))
      if (!long) return null
      const kind = long.querySelector('.medcard-type')!.getBoundingClientRect(), when = long.querySelector('.medcard-t')!.getBoundingClientRect()
      const box = long.getBoundingClientRect(), docs = long.querySelector('.medcard-docs')
      return {
        n: cs.length, rows: new Set(cs.map(c => Math.round(c.getBoundingClientRect().top))).size,
        under: when.top >= kind.bottom - 1, docsN: docs ? docs.textContent : null,
        inside: [...long.querySelectorAll('.medcard-row2 > *')].every(e => e.getBoundingClientRect().right <= box.right - 1),
        widths: cs.map(c => Math.round(c.getBoundingClientRect().width)), row: (long.parentElement as HTMLElement).clientWidth,
      }
    })
    expect(g, `the long card is drawn (${iid})`).not.toBeNull()
    expect(g!.n, 'three men down').toBe(3)
    expect(g!.rows, `all three in one row: widths ${g!.widths} in ${g!.row}`).toBe(1)
    expect(g!.under, 'the long period is on the line under its kind').toBe(true)
    expect(g!.docsN, 'two documents: the drawing and "2"').toBe('2')
    expect(g!.inside, 'nothing of row 2 runs past the card').toBe(true)
  })

  /* "+ MEDICAL" (owner D963, D965 — 17 Oct 26): a filled button at the right end of the "as of" row, the row's 36 tall, a
     finger's 44 on a phone; it opens the Inputs tab's own window set to a medical kind — by mouse and by keyboard (Tab to
     it, Enter opens, Escape closes and the keyboard is back on the button) — for an admin and for a member. */
  for (const [name, viewport, who] of [['phone admin', PHONE, 'a'], ['phone member', PHONE, 'user'], ['desktop admin', DESK, 'a'], ['desktop member', DESK, 'user']] as const)
    test(`D965 "+ Medical" opens the input window on a medical kind — ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await login(page, who)
      await go(page, 'inputs')
      await page.click('#inMedBtn')
      const btn = page.locator('#medNew')
      await expect(btn).toHaveText('+ Medical')
      const geo = await page.evaluate(() => {
        const b = document.querySelector('#medNew')!.getBoundingClientRect(), c = document.querySelector('#medCalBtn')!.getBoundingClientRect()
        const head = document.querySelector('#medView .ic-head') as HTMLElement, hr = head.getBoundingClientRect()
        const pad = parseFloat(getComputedStyle(head).paddingRight)
        return { h: Math.round(b.height), mid: Math.abs((b.top + b.height / 2) - (c.top + c.height / 2)), rightGap: Math.round(hr.right - pad - b.right), inRow: b.right <= hr.right + 0.5 }
      })
      expect(geo.h, 'the row height').toBe(36)
      expect(geo.mid, 'one row with "as of"').toBeLessThanOrEqual(1)
      expect(geo.rightGap, 'at the right end of the row').toBeLessThanOrEqual(1)
      expect(geo.inRow, 'inside the row').toBe(true)
      /* by mouse */
      await btn.click()
      const win = page.locator('[data-testid="win-inputedit"]')
      await expect(win).toBeVisible()
      await expect(win.locator('#inpEditType')).toHaveValue('HL')
      await page.keyboard.press('Escape')
      await expect(win).toHaveCount(0)
      await expect(page.locator('#medView'), 'still on the Medical tab').toBeVisible()
      /* by keyboard: from "as of", Tab reaches it; Enter opens; Escape closes and gives the keyboard back to it */
      await page.locator('#medCalBtn').focus()
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement && document.activeElement.id)).toBe('medNew')
      await page.keyboard.press('Enter')
      await expect(win).toBeVisible()
      await expect(win.locator('#inpEditType')).toHaveValue('HL')
      await page.keyboard.press('Escape')
      await expect(win).toHaveCount(0)
      await expect.poll(() => page.evaluate(() => document.activeElement && document.activeElement.id)).toBe('medNew')
    })

  /* A FILING FROM THE MEDICAL TAB LEAVES THE CALENDARS' MONTH ALONE (the code read of 17 Oct 26, finding 4): saved through
     "+ Medical", an input used to turn the Inputs calendar to its own month — unseen, since the calendar is not on the
     Medical tab. Filed for July through the real window, the calendar he left on its month is on that month when he
     goes back; the new card is on the Medical tab. */
  test('D965 a filing through "+ Medical" leaves the Inputs calendar on its month', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'inputs')
    const month = page.locator('#inpCal .ic-mon').first()
    await expect(month).toBeVisible()
    const before = (await month.textContent())!.trim()
    expect(before, 'the calendar is not already on July').not.toMatch(/Jul/)
    await page.click('#inMedBtn')
    const had = await page.evaluate(() => (window as any).INPUTS.map((r: any) => String(r.iid)))
    await page.click('#medNew')
    const win = page.locator('[data-testid="win-inputedit"]')
    await expect(win).toBeVisible()
    for (let i = 0; i < 24 && !(await page.locator('#inpEdCal [data-iso="2026-07-12"]').count()); i++) {
      const t = (await page.locator('#inpEdCal .dcal-title').first().textContent()) || ''
      await page.locator(`#inpEdCal button[aria-label="${/2027|Aug|Sep|Oct|Nov|Dec/.test(t) ? 'Previous' : 'Next'} month"]`).click()
    }
    await page.locator('#inpEdCal [data-iso="2026-07-12"]').click()
    await page.locator('#inpEdCal [data-iso="2026-07-15"]').click()
    await win.locator('.docfield input[type=file]').first().setInputFiles([{ name: 'cert.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.1 %%EOF') }])
    await page.locator('#inpEditSave').click()
    await expect(win).toHaveCount(0)
    const made = await page.evaluate(had => (window as any).INPUTS.map((r: any) => String(r.iid)).filter((i: string) => !had.includes(i)), had)
    expect(made.length, 'one input filed').toBe(1)
    await expect(page.locator(`.medcard[data-medcard="${made[0]}"]`), 'its card on the Medical tab').toBeVisible()
    await page.click('#inMemberMode')
    await expect(month).toBeVisible()
    expect((await month.textContent())!.trim(), 'the calendar kept its month').toBe(before)
  })
})
