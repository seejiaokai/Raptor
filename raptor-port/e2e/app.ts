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
export async function settle(page: Page, sel: string, from?: number) {
  return page.evaluate(async ([s, was]) => {
    const el = document.querySelector(s as string) as HTMLElement
    const start = was as number | undefined
    let last = NaN, same = 0, moved = start === undefined
    /* a smooth scroll has not necessarily STARTED by the next frame, so
       "unchanged twice" is not settled. When the caller says where it was,
       wait for it to leave that position before believing any stillness. */
    for (let i = 0; i < 180; i++) {
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const now = Math.round(el.scrollLeft)
      if (!moved && now !== start) moved = true
      same = now === last ? same + 1 : 0
      last = now
      if (moved && same >= 6) return now
    }
    return last
  }, [sel, from] as const)
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

/* the two numbers every grid on the dense surfaces is derived from */
export async function puckSize(page: Page) {
  return page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement)
    return { w: parseFloat(cs.getPropertyValue('--puck-w')), h: parseFloat(cs.getPropertyValue('--puck-h')) }
  })
}
