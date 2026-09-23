import type { Page } from '@playwright/test'

/* A SLOW MACHINE, ON DEMAND (23 Sep 26, [LW-MONTHJUMP-PHONE]). GitHub's runner
   can be two to three times slower than a desktop, and a test that passes only
   because the machine is fast is a red run waiting to happen there.
   `E2E_CPU_THROTTLE=3 npx playwright test …` slows everything the PAGE does —
   script, layout, paint — that many times over, through Chromium's own CPU
   throttling (DevTools' "3x slowdown"), so a timing assumption fails on the
   desktop first. Unset, it does nothing. Every test logs in, so login() is the
   one place it needs to be.

   The rule it serves (owner, D87): a browser test that fails on a slow machine
   is fixed by making it WAIT ON WHAT IT NEEDS — the element, the state, the
   grid at rest — not on a fixed time, which is too short on a slow runner and
   dead time on a fast one. */
async function slowMachine(page: Page) {
  const rate = Number(process.env.E2E_CPU_THROTTLE)
  if (rate > 1) await (await page.context().newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate })
}

/* Login is ad/a for full edit, us/us for the member (owner, 24 Aug 26). The
   username is lowercased before matching but the PASSWORD is compared
   exactly. The parameter keeps its historical 'a' | 'user' shape so the 100+
   call sites stay untouched; the map below is the one place that knows the
   real credentials. */
export async function login(page: Page, who: 'a' | 'user' = 'a') {
  await page.goto('/')
  await slowMachine(page)
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
}

/* React commits a tick after the nav, so every reader has to wait for the page
   it asked for rather than for a fixed delay. */
export async function go(page: Page, to: 'viewsched' | 'editsched' | 'inputs' | 'quals' | 'logic' | 'leavewar' | 'tracker') {
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

/** Wait until a Leave War month jump has stopped moving ON SCREEN: the landed
 *  month's header holds its place for eight frames AND for longer than the
 *  grid's own 120ms "at rest" pause (Matrix SCROLL_REST_MS), since the
 *  corrections that follow a jump run after that pause. Its screen position is
 *  what a later click or drag lands on. The scroller itself is deliberately NOT
 *  watched: on a desktop the grid goes on drawing the earlier months to the LEFT
 *  for seconds after a jump, each draw re-anchored so nothing on screen moves —
 *  waiting for the scroller to go still waited for the whole year. (Moved here
 *  from step4-leavewar.spec.ts on 23 Sep 26 so the month-strip tests share it.)
 *
 *  A move of ≤1px counts as still (Fable TEST-001, 23 Sep 26): the anchor
 *  correction only acts on shifts over 1px, so the desktop's background fill
 *  can nudge a landed header by a pixel for as long as it is drawing the year —
 *  the likeliest reason this wait ran to the time limit on GitHub's slow
 *  machine. A real slide (the phone fault was 20px) is still motion. And it
 *  FAILS BY NAME — a header that is not drawn, or never holds still within 15s
 *  — instead of spinning silently into the test's own timeout. */
export async function gridAtRest(page: Page, date: string) {
  const res = await page.evaluate(async d => {
    const cell = () => document.querySelector(`[data-testid="head-${d}"]`)
    const t0 = performance.now()
    while (!cell()) {
      if (performance.now() - t0 > 5000) return `gridAtRest: head-${d} is not drawn`
      await new Promise(r => requestAnimationFrame(() => r(null)))
    }
    const x = () => cell()?.getBoundingClientRect().x ?? NaN
    let last = x(), same = 0, since = performance.now()
    while (same < 8 || performance.now() - since < 250) {
      if (performance.now() - t0 > 15000) return `gridAtRest: head-${d} never held still (last x ${last})`
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const now = x()
      if (Math.abs(now - last) <= 1) same++
      else { last = now; same = 0; since = performance.now() }
    }
    return null
  }, date)
  if (res) throw new Error(res)
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

/* Open the Leave War tab the way a user reaches it: log in, click the tab,
   wait for the matrix. The vendored suite was written against the standalone
   app, where the matrix WAS the page and there was no login — this helper is
   the whole difference. Default is the member account, which matches the
   standalone app's own default role; a test that needs admin from the start
   passes 'a', and mid-test switches go through w.lwSetRole (the toggle the
   standalone app drew was removed at the merge — the role rides the login). */
export async function openLeaveWar(page: Page, who: 'a' | 'user' = 'user', viewAs: string | null = null) {
  await login(page, who)
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-slipway"]')
  /* The generic 'us' member has NO fixed identity in this prototype (there are
     no per-person accounts yet — known-gaps.md), so the war is left UNSCOPED by
     default: `viewer` null means canEditRow imposes no row rule, and the member
     edits whatever row a mechanics test drives, exactly as before. The member
     row rule (canEditRow, 27 Aug 26 — "viewing as ranger, only my row") is a
     preview of the accounts-era behaviour; the tests that exercise it pass a
     `viewAs` so the war scopes to that person, the way Raptor's "View as" mirror
     will in production. */
  await page.evaluate(id => (window as any).lwSetViewer(id), viewAs)
}

/* The mid-test role switch, via the probe bridge (see probe-bridge.ts for
   why it exists). The wait lets React commit the re-render the switch causes
   before the test reads the controls it changed. */
export async function lwRole(page: Page, role: 'admin' | 'member') {
  await page.evaluate(r => (window as any).lwSetRole(r), role)
  await page.waitForTimeout(150)
}

/* [GLOBAL-UNDO] set the RAPTOR effective role — what a global undo's mayReverse gate
   reads (deriveActor). lwRole above sets only the Leave War store's role; a global
   undo of a cell owned by another person also needs the LOGIN actor to be an admin.
   Done WITHOUT a mid-test re-login (the reliable path — the grid is already up from
   the beforeEach). The bridge exposes raptorRole only on localhost (dev + this
   e2e's vite preview), never on the deployed site. */
export async function raptorRole(page: Page, role: 'admin' | 'member') {
  await page.evaluate(r => (window as any).raptorRole(r), role)
  await page.waitForTimeout(50)
}

/* Scope the war to a person — the "View as" identity a member is restricted to
   (canEditRow). Production mirrors Raptor's ME onto it; the e2e sets it directly
   so a member test can prove it edits its own row and no other. */
export async function lwView(page: Page, id: string | null) {
  await page.evaluate(i => (window as any).lwSetViewer(i), id)
  await page.waitForTimeout(150)
}

/* Open the Tracker tab the way a user reaches it: log in, click the tab, wait
   for the flow board's balls (7 Sep 26, the Tracker merge). The vendored
   smoke suite (scripts/tracker/smoke.mjs) has its own copy of this in plain
   Playwright — this one serves the e2e specs. Admin by default: the
   standalone app had no roles, so every one of its checks assumes it can
   edit; a member test passes 'user' and expects the read-only shape. */
export async function openTracker(page: Page, who: 'a' | 'user' = 'a') {
  await login(page, who)
  await go(page, 'tracker')
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
  await page.waitForTimeout(300)
}
