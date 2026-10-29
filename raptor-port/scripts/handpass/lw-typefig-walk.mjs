// "Type a figure" that stayed after 0 was typed (his iPhone picture, 29 Oct 26): every figure box the Leave War draws — the
// Balances page, the person window, the Grades window — walked through the real controls. A box showing 0 (or its own
// figure) is emptied and Entered (the words come up), tapped again, the SAME figure typed over it — the words must go; then
// Enter, and a tap away: no words, the figure as it was, nothing saved. Then a different figure typed after the words: they
// go too, and it saves. WebKit at his iPhone's 402 by touch; Chromium at his PC's 1536 at 1.25 by mouse. Pictures each step.
//   node scripts/handpass/lw-typefig-walk.mjs <dist> <out-dir>
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { webkit, chromium } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/dcm5bdraw/typefig'] = process.argv
mkdirSync(OUT, { recursive: true })
const ORIGIN = 'http://localhost:4194'
const res = []
const ok = (cond, what) => { res.push(`${cond ? 'PASS' : 'FAIL'} ${what}`); return cond }
for (const [tag, eng, ctxOpts, touch] of [
  ['phone', webkit, { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true }, true],
  ['desk', chromium, { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 }, false],
]) {
  const b = await eng.launch(eng === chromium ? LAUNCH : {})
  const ctx = await b.newContext({ ...ctxOpts, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(e.message))
  await p.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
  await p.goto(ORIGIN + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="lw-tab-balances"]', { timeout: 20000 })
  const press = async loc => { if (touch) await loc.tap(); else await loc.click() }
  await press(p.locator('[data-testid="lw-tab-balances"]')); await p.waitForSelector('.bp-cols, .bp-table'); await p.waitForTimeout(400)
  const step = async (where, id, away) => {
    const box = p.getByTestId(id)
    await box.scrollIntoViewIfNeeded()
    const was = await box.inputValue()
    await press(box); await p.keyboard.press('Control+A'); await p.keyboard.press('Backspace'); await p.keyboard.press('Enter')
    await p.waitForTimeout(150)
    ok(await p.getByTestId(`${id}-err`).isVisible().catch(() => false), `${tag} ${where}: an emptied box + Enter says "Type a figure"`)
    await p.screenshot({ path: join(OUT, `${tag}-${where}-1-words.png`) })
    /* HIS PATH: a tap away first — the words stay at the box until it is next typed in, by design — then a FRESH tap on the box,
       which arms it (one tap then typing replaces — D1080: the app rewrites the box to what was typed), and the same figure
       typed. Tapped again while it still had the keys, the box is not armed and the typing is added on (the first walk's own
       mistake: "3" became "33") */
    await press(p.locator(away)); await p.waitForTimeout(150)
    ok(await p.getByTestId(`${id}-err`).isVisible().catch(() => false), `${tag} ${where}: after a tap away the words still stand at the box (as built)`)
    await press(box); await p.waitForTimeout(60)
    await p.keyboard.type(was)
    await p.waitForTimeout(80)
    await p.screenshot({ path: join(OUT, `${tag}-${where}-2-same-typed.png`) })
    ok(!(await p.getByTestId(`${id}-err`).isVisible().catch(() => false)), `${tag} ${where}: the same figure typed over it ("${was}") clears the words`)
    await p.keyboard.press('Enter'); await press(p.locator(away)); await p.waitForTimeout(150)
    ok(!(await p.getByTestId(`${id}-err`).isVisible().catch(() => false)) && (await box.inputValue()) === was, `${tag} ${where}: Enter and a tap away — no words, "${was}" as it was`)
    await p.screenshot({ path: join(OUT, `${tag}-${where}-3-settled.png`) })
  }
  // 1. the Balances page — Ranger's CCL (a box showing 0)
  await step('balances', 'bal-CCL-bane', '[data-testid="bal-view-bal"]')
  // 2. the person window — Saber's FCL
  await press(p.getByTestId('bal-name-stiff')); await p.waitForSelector('[data-testid="pw-tile-LVE"]'); await p.waitForTimeout(300)
  /* (a tap away on a window's title bar is a press on its drag handle, which keeps the box's keys: the second walk's own
     mistake — the box then took the next tap as a second press, D1047, and the typing went in before the figure) */
  await step('person', 'pw-PL', '[data-testid="person-window"] .r7-hd.zz-balhd')
  await press(p.getByTestId('pw-close')); await p.waitForTimeout(300)
  // 3. the Grades window — the first grade's days
  await press(p.getByRole('button', { name: /^Grades/ })); await p.waitForSelector('[data-testid="grades-sheet"]'); await p.waitForTimeout(300)
  const gid = await p.locator('[data-testid^="grade-days-"]').first().getAttribute('data-testid')
  await step('grades', gid, '[data-testid="grades-sheet"] .gw-r.h .gw-nmh')
  ok(errs.length === 0, `${tag}: no page errors (${errs.join(' | ')})`)
  await ctx.close(); await b.close()
}
writeFileSync(join(OUT, 'walk.txt'), res.join('\n'))
console.log(res.join('\n'))
console.log(res.some(r => r.startsWith('FAIL')) ? 'RED' : 'GREEN')
