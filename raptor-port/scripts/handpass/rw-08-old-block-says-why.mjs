/* RE-WALK 8 — a day published BEFORE these seats counted says why, instead of a
   bare "1 pending" with nothing behind it.
   Built the way the owner's own day was: ALL AVAIL on a duty desk, published,
   and then the frozen block rewound to what the previous build wrote (it earns,
   it carries no membership flag, and its walk never reached a duty desk). */
import { open, board, publish, shot, STATE } from './lib.mjs'
const { browser, page, errors } = await open({ state: STATE })
const DI = 6
await board(page, DI)

/* a duty desk with ALL AVAIL on it, through the app's own add control */
await page.evaluate(i => {
  const w = window
  w.DAYS[i].dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SUN DESK', str: '08:00', end: '18:00', id: 'allavail' }] }]
  w.afterSchedMutate()
}, DI)
await page.waitForTimeout(600)
const p = await publish(page, DI)
console.log('published:', JSON.stringify(p))

const before = await page.evaluate(i => ({
  pending: ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending',
  warns: ((window.WARN.byDay[i] || {}).warns || []).map(w => w.code),
}), DI)
console.log('straight after publishing:', JSON.stringify(before))

/* rewind the issued block to the shape the PREVIOUS build left behind */
const rewound = await page.evaluate(i => {
  const w = window
  const snap = w.daySnapOf(i, w.dayCurVer(i))
  const ev = snap && snap.d && snap.d.oilev
  if (!ev) return '(no block)'
  const keys = Object.keys(ev.sent)
  delete ev.mem
  for (const k of keys) delete ev.sent[k]
  w.afterSchedMutate()
  return `dropped ${keys.length} recorded seat(s) and the membership flag`
}, DI)
console.log('rewound:', rewound)
await page.waitForTimeout(800)

const after = await page.evaluate(i => {
  const rows = [...document.querySelectorAll('.wln')].filter(e => e.offsetParent !== null)
    .map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 110))
  return {
    pending: ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending',
    warns: ((window.WARN.byDay[i] || {}).warns || []).map(w => w.code),
    onScreen: rows.filter(r => /published before|ALL AVAIL/i.test(r)),
    chip: [...document.querySelectorAll('#schedBoard .oilcount')].map(c => (c.innerText || '').trim()),
  }
}, DI)
console.log('\nAS AN OLD ISSUED DAY:')
console.log('   the day says:', after.pending)
console.log('   the chip beside the puck says:', JSON.stringify(after.chip))
console.log('   warnings:', after.warns.join(', ') || '(none)')
for (const r of after.onScreen) console.log('   ON SCREEN: ' + r)
await shot(page, 'RW-08-old-block-says-why')
console.log('\nerrors:', errors.slice(0, 5))
await browser.close()
