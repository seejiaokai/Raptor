/* [DB-READINESS] group A phase 7 — the FULL check's walk, WALKER B, part 5 (1 Oct 26): WHERE the second-spare man is
   DRAWN on the surfaces that draw no empty seats — the edit week and View-only Sched — beside the board. Part 2's
   pictures showed him, on View-only Sched, straight after the last filled seat (the left of the next line), where a
   first-spare man would be drawn; this part records it for both read surfaces, with a first-spare man on a second row
   for comparison. Wednesday 15 Jul, desktop, a fresh world. Reads and pictures only — nothing is judged here.
   Env: HP_URL, HP_SHOTS, HP_OUT, HP_TAG=p7. */
import { boot, fact, facts } from './p6-lib.mjs'
import { handPut } from './seat-lib.mjs'
import * as B from './p7-b-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await B.world(L)
const WED = 2
const pics = []
const pic = async (name, o) => { await L.shot(p, name, o || {}); pics.push(name + '.png') }
const o = {}
/* the pucks a sim row draws on a week surface, each with where it is drawn (its left edge and line) */
const rowPucks = (surf, label) => p.evaluate(([s, d, lab]) => {
  const day = document.querySelector(`${s} .day[data-day="${d}"]`); if (!day) return null
  const leaf = [...day.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === lab)
  if (!leaf) return 'no row labelled ' + lab
  let r = leaf; for (let i = 0; i < 6 && r && !r.querySelector('[data-person]'); i++) r = r.parentElement
  if (!r) return 'no people'
  leaf.scrollIntoView({ block: 'center', inline: 'nearest' })
  const ps = [...r.querySelectorAll('[data-person]')].map(e => { const b = e.getBoundingClientRect(); return { who: e.dataset.person, x: Math.round(b.left), y: Math.round(b.top) } })
  const x0 = Math.min(...ps.map(q => q.x)), ys = [...new Set(ps.map(q => q.y))].sort((a, b) => a - b)
  return ps.map(q => `${q.who}@line${ys.indexOf(q.y) + 1}${q.x - x0 < 20 ? 'L' : 'R'}`).join(' ')
}, [surf, WED, label])
const boardPucks = (key) => p.evaluate(k => {
  const z = document.querySelector(`#schedBoard [data-fill="${k}.+"]`); if (!z) return null
  const ss = [...z.querySelectorAll('[data-slot]')].map(e => { const b = e.getBoundingClientRect(); const pk = e.querySelector('[data-person]'); return { slot: e.dataset.slot.slice(k.length + 1), who: pk ? pk.dataset.person : '+', x: Math.round(b.left), y: Math.round(b.top) } })
  const x0 = Math.min(...ss.map(q => q.x)), ys = [...new Set(ss.map(q => q.y))].sort((a, b) => a - b)
  return ss.map(q => `${q.slot}=${q.who}@line${ys.indexOf(q.y) + 1}${q.x - x0 < 20 ? 'L' : 'R'}`).join(' ')
}, key)
try {
  await W.boardOn(p, WED)
  /* IAT-3: Sidewinder on the SECOND spare. A new row EP-3 with both seats: Blade on the FIRST spare. */
  o.second = await handPut(p, `s:${WED}.oft.1.x1`, 'mamba')
  const add = p.locator(`#schedBoard [data-sradd="${WED}.oft"]:visible`).first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await B.sleep(500)
  const ri = (await B.simModel(p, WED)).oft.length - 1
  await W.boardText(p, `sr:${WED}.oft.${ri}.label`, 'EP-3'); await W.boardText(p, `sr:${WED}.oft.${ri}.str`, '17:00'); await W.boardText(p, `sr:${WED}.oft.${ri}.end`, '18:00')
  for (const [s, w] of [['p', 'bane'], ['w', 'drill'], ['x0', 'slash']]) await handPut(p, `s:${WED}.oft.${ri}.${s}`, w)
  o.board = { iat3: await boardPucks(`s:${WED}.oft.1`), ep3: await boardPucks(`s:${WED}.oft.${ri}`) }
  o.stored = JSON.parse(await B.storedDay(p, WED)).d.sims.oft.map(r => `${r.label}: ${JSON.stringify(r.more || null)}`)
  await p.evaluate(k => document.querySelector(`#schedBoard [data-fill="${k}.+"]`).scrollIntoView({ block: 'center' }), `s:${WED}.oft.1`); await B.sleep(250)
  await pic('B24v-1-board-second-and-first-spare')
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, WED)
  o.editWeek = { iat3: await rowPucks('#eWeek', 'IAT-3'), ep3: await rowPucks('#eWeek', 'EP-3') }
  await B.sleep(250); await pic('B24v-2-editweek-second-and-first-spare')
  o.sign = await W.signDay(p, WED); o.pub = await W.publishDay(p, WED); await L.settle(p)
  await L.go(p, 'viewsched'); await W.showDay(p, WED, '#vWeek')
  o.view = { iat3: await rowPucks('#vWeek', 'IAT-3'), ep3: await rowPucks('#vWeek', 'EP-3') }
  await B.sleep(250); await pic('B24v-3-viewsched-second-and-first-spare')
  fact('B24v', o)
} catch (e) { L.check('B24v — the step ran', false, String(e && e.stack || e).slice(0, 700)) }
fact('errors', errors)
B.saveSection('w5-where-the-second-spare-man-is-drawn', { checks: L.results, facts, errors, pics, out: o })
console.log(JSON.stringify(o, null, 1)); console.log('errors', errors)
await browser.close()
