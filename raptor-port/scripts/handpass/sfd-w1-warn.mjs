// w1 — the warning list for Hex on Thu 16 Jul after a SANS hand tick on Wed 15 Jul (S7 follow-up, to read the whole list).
// node scripts/handpass/sfd-w1-warn.mjs
import { SIZES, mk, world, signIn, openBoard, boardStep, qualsTick, sleep, J, log } from './sfd-w1-lib.mjs'
log('sfd-w1-warn v1')
const sz = SIZES.d, W = mk('s7w', sz)
const { b, p } = await world(sz, W, '2026-07-15T09:00:00')
await signIn(p, 'ad', 'a')
const t = await qualsTick(p, W, 'rocky', '01')
log('tick', J(t.st))
await openBoard(p, W, 3)
const dump = () => p.evaluate(() => {
  const box = [...document.querySelectorAll('#schedBoard *')].find(e => /\d+ issues?/.test((e.innerText || '').trim()) && (e.innerText || '').length < 40)
  let host = box; for (let i = 0; i < 4 && host && host.parentElement; i++) { host = host.parentElement; if ((host.innerText || '').length > 300) break }
  return { head: box && box.innerText.trim(), all: host ? host.innerText.split('\n').filter(x => x.trim()).slice(0, 60) : [] }
})
const d = await dump()
log('THU', J(d))
/* tap Hex's seated puck: the app's own explanation of him on that seat */
const seat = p.locator('#schedBoard [data-slot="3.1.1.0.w"] .puck').first()
log('seat title', await seat.getAttribute('title'))
await p.screenshot({ path: W.pic ? undefined : undefined }).catch(() => {})
await W.pic(p, 'thu-board')
await b.close()
