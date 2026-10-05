/* The Codex stack check — the host's own comparison (5 Oct 26): after a CHANGED text box, does one real click put the
   caret in the next box, and is a stale Area-time window written back? Run once per build (HP_URL): the stack and main.
   Everything is done with the real mouse and keyboard; window.* is only read. */
import * as H from './wh-lib.mjs'
const { L } = H
const TO = '#eWeek [data-txt="ff:0.0.0.to"]', AT = '#eWeek [data-atime="0.0.0"]', MS = '#eWeek [data-txt="ff:0.0.0.msn"]'
const { browser, p, errors } = await H.world({ who: 'a' })
if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched')
await p.waitForSelector(TO, { timeout: 10000 })
const mid = async sel => { const b = await p.locator(sel).first().boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2] }
const focus = () => p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset?.atime ? 'atime:' + a.dataset.atime : a.dataset?.txt || a.tagName) : 'none' })
const txt = sel => p.locator(sel).first().evaluate(e => (e.value ?? e.textContent).trim())
const out = { base: process.env.HP_URL }
out.before = { to: await txt(TO), at: await txt(AT) }
/* 1. change the take-off, then ONE click into the Area time */
await p.locator(TO).first().scrollIntoViewIfNeeded()
let pt = await mid(TO); await p.mouse.click(pt[0], pt[1]); await L.sleep(150)
await p.keyboard.press('Control+A'); await p.keyboard.type('1255')
pt = await mid(AT); await p.mouse.click(pt[0], pt[1])
out.afterOneClick = { focusAtOnce: await focus() }
await L.sleep(600); out.afterOneClick.focusLater = await focus(); out.afterOneClick.at = await txt(AT); out.afterOneClick.to = await txt(TO)
/* 2. click on empty page, read what is stored */
await p.mouse.click(5, 400); await L.sleep(600)
out.afterAway = { to: await txt(TO), at: await txt(AT), stored: await p.evaluate(() => { const f = window.DAYS?.[0]?.waves?.[0]?.forms?.[0] ?? window.DAYS?.[0]?.go?.[0]?.f?.[0]; return f ? JSON.stringify({ to: f.to, atime: f.atime ?? f.at ?? null }) : 'n/a' }) }
/* 3. an UNCHANGED box, then one click into another */
pt = await mid(MS); await p.mouse.click(pt[0], pt[1]); await L.sleep(150)
pt = await mid(TO); await p.mouse.click(pt[0], pt[1]); await L.sleep(300)
out.unchangedThenClick = await focus()
/* 4. change the mission box, then ONE click into the take-off box */
pt = await mid(MS); await p.mouse.click(pt[0], pt[1]); await L.sleep(150); await p.keyboard.type('X')
pt = await mid(TO); await p.mouse.click(pt[0], pt[1])
out.changedThenClick = { atOnce: await focus() }; await L.sleep(600); out.changedThenClick.later = await focus()
out.errors = errors.slice(0, 4)
console.log(JSON.stringify(out, null, 1))
await browser.close()
