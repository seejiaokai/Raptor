import type { Page } from '@playwright/test'

/* Login is a/a for full edit, user/user for view-only. The username is
   lowercased before matching but the PASSWORD is compared exactly. */
export async function login(page: Page, who: 'a' | 'user' = 'a') {
  await page.goto('/')
  await page.fill('#luser', who)
  await page.fill('#lpass', who)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
}

/* React commits a tick after the nav, so every reader has to wait for the page
   it asked for rather than for a fixed delay. */
export async function go(page: Page, to: 'viewsched' | 'editsched' | 'inputs' | 'quals' | 'logic') {
  await page.evaluate(p => (window as any).go(p), to)
  await page.waitForFunction(p => (window as any).CURPAGE === p, to)
  await page.waitForTimeout(350)
}

/* .week carries scroll-behavior:smooth and panDays() asks for 'smooth' on
   purpose, so a read taken a fixed delay later can land mid-animation and
   report a position nothing ever settled at. Poll until it stops moving. */
export async function settle(page: Page, sel: string, from?: number, axis: 'x' | 'y' = 'x') {
  return page.evaluate(async ([s, was, ax]) => {
    const el = document.querySelector(s as string) as HTMLElement
    const start = was as number | undefined
    let last = NaN, same = 0, moved = start === undefined
    /* a smooth scroll has not necessarily STARTED by the next frame, so
       "unchanged twice" is not settled. When the caller says where it was,
       wait for it to leave that position before believing any stillness. */
    for (let i = 0; i < 180; i++) {
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const now = Math.round(ax === 'y' ? el.scrollTop : el.scrollLeft)
      if (!moved && now !== start) moved = true
      same = now === last ? same + 1 : 0
      last = now
      if (moved && same >= 6) return now
    }
    return last
  }, [sel, from, axis] as const)
}

/* Warning navigation moves BOTH axes — the week is placed horizontally by hand
   onto the day's snap point, then scrollIntoView does the vertical. Neither
   settle() alone proves the motion is over, so wait for the pair to go quiet
   together before measuring anything. */
export async function settleBoth(page: Page, sel: string) {
  return page.evaluate(async (s) => {
    const el = document.querySelector(s as string) as HTMLElement
    let lx = NaN, ly = NaN, same = 0
    for (let i = 0; i < 240; i++) {
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const x = Math.round(el.scrollLeft), y = Math.round(el.scrollTop)
      same = (x === lx && y === ly) ? same + 1 : 0
      lx = x; ly = y
      if (same >= 8) break
    }
    return { left: lx, top: ly }
  }, sel)
}

/* The week surfaces (#vWeek/#eWeek) scroll horizontally on THEMSELVES but
   vertically on the PAGE — there is no vertical scroller on the week element
   at all, so settleBoth(page,'#eWeek') reports Y as "settled" from frame one
   (it never moves) while window.scrollY is still animating underneath. A
   measurement taken right after that false-settle lands mid-scroll about half
   the time. This pairs the element's real horizontal axis with the page's
   real vertical one. */
export async function settleWeek(page: Page, sel: string) {
  return page.evaluate(async (s) => {
    const el = document.querySelector(s as string) as HTMLElement
    let lx = NaN, ly = NaN, same = 0
    for (let i = 0; i < 240; i++) {
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const x = Math.round(el.scrollLeft), y = Math.round(window.scrollY)
      same = (x === lx && y === ly) ? same + 1 : 0
      lx = x; ly = y
      if (same >= 8) break
    }
    return { left: lx, top: ly }
  }, sel)
}

/* set a scroll position and wait for it to be real — 'instant' because 'auto'
   means "obey the element's CSS", and the week's CSS says smooth */
export async function scrollTo(page: Page, sel: string, px: number) {
  await page.evaluate(([s, x]) => {
    const el = document.querySelector(s as string) as HTMLElement
    try { el.scrollTo({ left: x as number, behavior: 'instant' as ScrollBehavior }) } catch { el.scrollLeft = x as number }
  }, [sel, px] as const)
  return settle(page, sel)
}

/* Click a week arrow and wait until the pan has really finished.
   The extra quiet period is not padding: `panDays()` reads the week's LIVE
   scrollLeft, so a second click that lands mid-animation reads a position
   short of the first target and re-aims at the same box — the click is
   swallowed. The reference does exactly the same (measured: it swallows a
   second click up to ~300ms, this build up to ~600ms), so it is inherited
   behaviour, not something to assert against. A user clicking twice slowly
   gets two boxes, and that is what this drives. */
export async function pan(page: Page, sel: string, dir: 1 | -1, from: number) {
  await page.click(dir > 0 ? '#weekNext' : '#weekPrev')
  const at = await settle(page, sel, from)
  await page.waitForTimeout(250)
  return at
}

/* A click that does NOT move the page first. page.click() is actionable —
   Playwright scrolls the target into view before pressing it — which is
   exactly wrong for the warning-navigation tests: they park the week somewhere
   deliberate and then measure what the APP does about it, and an auto-scroll
   quietly hands the app a position it never had to reach on its own. The app's
   own listeners are delegated on document, so a bubbling MouseEvent is the
   same event they would have seen. Returns false if the selector missed. */
export async function clickHere(page: Page, sel: string) {
  return page.evaluate((s) => {
    const el = document.querySelector(s as string) as HTMLElement | null
    if (!el) return false
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    return true
  }, sel)
}

/* the two numbers every grid on the dense surfaces is derived from */
export async function puckSize(page: Page) {
  return page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement)
    return { w: parseFloat(cs.getPropertyValue('--puck-w')), h: parseFloat(cs.getPropertyValue('--puck-h')) }
  })
}
