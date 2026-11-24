/* Takes the guide's pictures from the running app (the built bundle served locally, the demo data, nobody real).
   Run from raptor-port/, with the build served:  PORT=4180 node docs/squadron-guide/shots.mjs
   It borrows the IT flow guide's toolkit (scripts/itflow/lib.mjs): a fresh signed-in page, page switching, publishing a
   day. Every crop is read off the live page at the moment of the shot, never typed as a fixed place. */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { open, go, publishDay } from '../../scripts/itflow/lib.mjs'

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'pictures')
const k = await open(OUT)
const WIDE = { width: 1800, height: 1050 }, DESK = { width: 1440, height: 900 }
const full = v => ({ x: 0, y: 0, w: v.width, h: v.height })
const box = async (page, sel) => page.locator(sel).first().boundingBox()

/* 01 — the week on Edit Schedule as it opens: three days, their sign-off boxes, issues bars and first waves, the crew list */
{
  const page = await k.fresh('ad', { viewport: WIDE, scale: 1.5 })
  await go(page, 'editsched')
  await k.shot(page, '01-week', full(WIDE))

  /* 07 — the flags: Monday's own list opened */
  await page.click('#eWeek [data-daywarn="0"]')
  await page.waitForTimeout(500)
  const d = await box(page, '#eWeek .day[data-day="0"]'), w = await box(page, '#eWeek [data-daywarn="0"]')
  const y = Math.max(0, Math.round(w.y - 12))
  await k.shot(page, '07-flags', { x: Math.max(0, Math.round(d.x - 6)), y, w: Math.round(d.width + 12), h: Math.min(WIDE.height - y, 640) })
  await page.close()
}

/* 02 — the Scheduler Board, Monday, at its flying waves */
{
  const page = await k.fresh('ad', { viewport: DESK })
  await go(page, 'editsched')
  await page.click('.sb-open[data-sbday="0"]')
  await page.waitForTimeout(900)
  await page.locator('#schedBoard').getByText('FLYING WAVES').first().evaluate(e => {
    e.scrollIntoView({ block: 'start' })
    const w = document.querySelector('#schedBoard .sb-boardwrap')
    if (w) w.scrollTop -= 14
  })
  await page.waitForTimeout(500)
  await k.shot(page, '02-board', full(DESK))
  await page.close()
}

/* 09 — a standby wave on the Scheduler Board. The demo week has none, so an SC wave is added to Monday here, from
   "+ Wave", and the picture is framed on its MAIN and SPARE rows. */
{
  const page = await k.fresh('ad', { viewport: DESK })
  await go(page, 'editsched')
  await page.click('.sb-open[data-sbday="0"]')
  await page.waitForTimeout(900)
  const add = page.locator('#schedBoard button', { hasText: '+ Wave' }).first()
  await add.scrollIntoViewIfNeeded()
  await add.click()
  await page.waitForTimeout(400)
  await page.locator('button.wm.sa', { hasText: /^SC$/ }).first().click()
  await page.waitForTimeout(900)
  const spare = page.locator('#schedBoard').getByText('SPARE', { exact: true }).first()
  await spare.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(500)
  const b = await spare.boundingBox(), main = await box(page, '#schedBoard .sb-boardwrap')
  const h = 400, y = Math.round(Math.max(0, Math.min(b.y - 150, DESK.height - h)))
  await k.shot(page, '09-standby', { x: Math.round(main.x), y, w: Math.round(Math.min(main.width, 1110)), h })
  await page.close()
}

/* 03, 04, 05, 10 — Inputs, Quals, the Leave War and the Tracker, each as it opens */
{
  const page = await k.fresh('ad', { viewport: DESK })
  await go(page, 'tracker'); await page.waitForTimeout(3000); await k.shot(page, '10-tracker', full(DESK))
  /* the calendar opens on today's month; the demo week's inputs are in July 2026, so it is turned back to there */
  await go(page, 'inputs')
  /* one month back a press, each waited for before the next — a chain of steps, so written as one that calls itself */
  const atJuly = async () => /JULY 2026/i.test(await page.locator('#page-inputs').innerText())
  const back = async left => {
    if (left === 0 || await atJuly()) return
    await page.locator('#page-inputs button').filter({ hasText: '‹' }).first().click()
    await page.waitForTimeout(600)
    return back(left - 1)
  }
  await back(6)
  if (!await atJuly()) throw new Error('03-inputs: the calendar did not reach July 2026')
  await k.shot(page, '03-inputs', full(DESK))
  await go(page, 'quals'); await k.shot(page, '04-quals', full(DESK))
  await go(page, 'leavewar'); await page.waitForTimeout(3000); await k.shot(page, '05-leavewar', full(DESK))
  await page.close()
}

/* 06 — a published day, as everyone reads it on View-only Sched (the demo week has none, so Monday is signed and
   published here first, in the same page) */
{
  const page = await k.fresh('ad', { viewport: DESK })
  await publishDay(page, 0)
  await go(page, 'viewsched')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await k.shot(page, '06-published', { x: 0, y: 0, w: DESK.width, h: 620 })
  await page.close()
}

/* 08 — the Logic page on a phone, as a member reads it */
{
  const page = await k.fresh('us', { viewport: k.PHONE, phone: true })
  await go(page, 'logic')
  await k.shot(page, '08-logic', { x: 0, y: 0, w: k.PHONE.width, h: k.PHONE.height })
  await page.close()
}

console.log(Object.keys(k.manifest).join(' '), '| page errors:', k.errors.length, k.errors.slice(0, 3).join(' ; '))
await k.close()
