/* [DB-READINESS] phase 7 — WALKER A, part 6: THE REASON, READ BY A FINGER. Saturday, timed Personal (Ranger) with ALL
   in the extras, OIL Earn on. (1) a tap on the requester's own inert puck on the row — what the app says; (2) the
   window (a bottom panel on a phone): the earn half, a tap on a man, the reason at the foot — on screen, not covered,
   once the mode's own toast has gone. Run at both widths (HP_PHONE=1 for 390×844). */
import { boot, world, fileTimed, oilButton } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const PHONE = !!process.env.HP_PHONE
const sfx = PHONE ? 'phone' : 'desk'
const { browser, p, errors } = await world(L, { phone: PHONE })
await W.toastSpy(p)
const SAT = A.SAT
A.scen('A3r-' + sfx, `timed Personal (Ranger, Sat 18 Jul 10:00–11:00) with ALL in the extras; OIL Earn on; a tap on Ranger's own puck on the row; the chip → the window → "Who earns OIL" → a tap on a man${PHONE ? ' — PHONE 390×844' : ' — desktop'}`)
try {
  const iid = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: A.ISO[SAT], from: '10:00', to: '11:00', remarks: 'P7 A3r' })
  await W.boardOn(p, SAT)
  A.ok('ALL placed in the extras', (await A.place(S, p, SAT, await A.rowIdx(p, SAT, iid), 'extras', 'all')).took)
  await oilButton(L, p)
  A.ok('OIL Earn on', await A.oilOn(p))
  await L.sleep(5500)   /* let the mode's own toast go */
  await W.toasts(p)
  await A.showRow(p, SAT, iid)
  /* (1) the requester's own puck */
  const rp = p.locator('#schedBoard .sb-arow.gr-frominput .oilpk.inert:visible').first()
  A.ok('the requester\'s puck on the row is drawn inert', await rp.count() === 1 || await rp.count() > 0, await rp.count())
  const style = await rp.evaluate(e => { const c = getComputedStyle(e); const k = getComputedStyle(e.querySelector('.puck')); return { cursor: c.cursor, opacity: k.opacity, filter: k.filter, title: e.getAttribute('title') } })
  A.said(`Ranger's puck in OIL Earn: title "${style.title}"; painted with opacity ${style.opacity}, filter ${style.filter}, cursor ${style.cursor}`)
  const before = await p.evaluate(d => JSON.stringify(window.DAYS[d].oild || null), SAT)
  await rp.click({ timeout: 3000 }).catch(() => {}); await L.sleep(500)
  const t1 = await W.toasts(p); const shown = await S.toast(p)
  A.said(`a tap on Ranger's own puck: the app says ${JSON.stringify(t1)} (on screen now: ${JSON.stringify(shown)})`)
  /* recorded, not judged: the brief asks for the reason ON the requester's own puck (its title) and "readable" in the
     window on a phone. A tap on ANY inert puck or item cell in OIL Earn is silent in this build — the same on an
     ordinary row with no end time (probe 7) — so the row's reason is a hover title only. Reported as an observation. */
  const tapSays = [...t1, shown || ''].some(x => /Ranger — a personal request earns no OIL/.test(x))
  A.note(tapSays ? 'a tap on the requester\'s inert puck says the reason on screen' : 'a tap on the requester\'s inert puck says NOTHING on screen — the reason is its hover title only (a finger cannot read it on the row; the window\'s foot is where a tap reads it)')
  A.ok('the requester\'s puck carries the reason as its title', /Ranger — a personal request earns no OIL/.test(style.title), style.title)
  A.ok('…and writes no decision', before === await p.evaluate(d => JSON.stringify(window.DAYS[d].oild || null), SAT))
  await A.pic(L, p, `A3r-${sfx}-1-requester-puck-tapped`)
  await L.sleep(5000); await W.toasts(p)
  /* (2) the window */
  let w = await A.openChip(p, '#schedBoard', iid)
  const et = w.tabs.findIndex(t => /earns OIL/.test(t)); if (et >= 0 && !/\[on\]/.test(w.tabs[et])) { await A.winTab(p, et); w = await A.win(p) }
  const vp = p.viewportSize()
  A.said(`the window's box: left ${w.rect.l}, top ${w.rect.t}, ${w.rect.w}×${w.rect.h} in a ${vp.width}×${vp.height} window; foot before a tap: "${w.foot}"`)
  if (PHONE) A.ok('PHONE: the window is a bottom panel — full width, its foot inside the screen', w.rect.w >= vp.width - 30 && w.rect.t + w.rect.h <= vp.height + 1, w.rect)
  await p.locator('.availwin:not([hidden]) [data-awp] .puck').first().click(); await L.sleep(600)
  const foot = await p.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && x.offsetWidth); const f = w.querySelector('.win-foot'); const r = f.getBoundingClientRect()
    const at = document.elementFromPoint(r.left + Math.min(40, r.width / 2), r.top + r.height / 2); const cs = getComputedStyle(f)
    return { text: f.innerText.trim(), top: Math.round(r.top), bottom: Math.round(r.bottom), inside: r.top >= 0 && r.bottom <= innerHeight, covered: !(at && (at === f || f.contains(at))), by: at ? (at.id || at.className || at.tagName).toString().slice(0, 40) : null, font: cs.fontSize, color: cs.color } })
  A.said(`after a tap on ${w.men[0].cs}: the foot reads "${foot.text}" (${foot.font}, ${foot.color}); inside the screen ${foot.inside}; covered ${foot.covered}${foot.covered ? ' by ' + foot.by : ''}; toasts ${JSON.stringify(await W.toasts(p))}`)
  A.ok('the reason is readable at the window\'s foot: "<callsign> — a personal request earns no OIL", on screen, nothing over it', /— a personal request earns no OIL/.test(foot.text) && foot.inside && !foot.covered, foot)
  await A.pic(L, p, `A3r-${sfx}-2-window-reason`)
  /* drag the panel by its bar (a person moving it out of the way) and close it */
  await A.closeWin(p)
  A.ok('the window closes on its ✕', !(await A.win(p)).open)
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, `A3r-${sfx}-X-error`).catch(() => {}) }
A.ok('no console error, page error or 4xx', errors.length === 0, errors.slice(0, 5))
A.saveRows(process.env.HP_OUT.replace(/\.json$/, `-walk6-${sfx}.json`), { errors })
await browser.close()
