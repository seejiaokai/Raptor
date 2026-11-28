// p4-box - P4 case 4, typing left in a box at a pick (H13; C55; F27, F44, A37). Saber, 142; nothing is saved by a press of
// his own - each box is typed into and NOT left (no Save, no tap elsewhere); then 149 is picked by the top-bar list (on a
// phone, the same list where drawn, else the menu's); the box is read on 149; 142 is picked back and the box read again.
// Where the words ended up is read from the browser's own storage (every saved record holding them).
//   (help)  Help's bug-report box, words typed, "Send report" not pressed
//   (note)  Inputs -> Calendar -> a day's window -> "+ Note", words typed in the new note's box
//   (bal)   Leave War -> Balances, Reaper's LVE figure box, a number typed, the box not left
//   (sched) Edit Schedule, a day's note typed on the page, the caret left in it (the phone run is WebKit, whose tap moves
//           no focus - scenario F27)
//   node raptor-port/scripts/handpass/n175/p4-box.mjs <d|402x874>    (ONLY=help,note,bal,sched)
// No stand-ins. Deciding pictures: p4-box-<case>-<d|p>-*.png
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, reachPick, wait, vis, hit, toast, tpic, dpic, SZT, windowsNow, sayNow, clockWorld, clockSignIn } from './p4-lib.mjs'
const SZ = process.argv[2] || 'd', T = SZT(SZ)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const W = { help: 'N175 help words', note: 'N175 note words', bal: '77', sched: 'N175 sched words' }
const readBox = (s, sel) => s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) return { drawn: false }; return { drawn: true, text: 'value' in e && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.textContent, focused: document.activeElement === e } }, sel)
const storedWith = (s, w) => s.page.evaluate(w => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if ((localStorage.getItem(k) || '').includes(w)) out.push(k) } return out }, w)
const pick = async (s, n) => { let p = await reachPick(s, n, 'bar'); if (!p.pressed && !s.desk) p = await reachPick(s, n, 'menu'); await wait(s, 900); return { pressed: !!p.pressed, via: p.control, covered: p.covered, squadron: await barSq(s) } }
const C = {
  help: { go: 'help', open: async () => {}, box: '#bugText', type: async s => { await s.page.keyboard.type(W.help) } },
  note: {
    go: 'inputs', box: '.ic-newnote .ic-poppuck-edit, input[aria-label="New planning note"]',
    open: async s => {
      if (await vis(s, '#inCalBtn').count()) await hit(s, '#inCalBtn', 600)
      const d = vis(s, '.page.on .ib-day[data-icday]').nth(16); FACT(`N.${T}.note.day`, await d.getAttribute('data-icday'))
      await hit(s, d, 800)
      await hit(s, '#icAddPuck', 600)
    },
    type: async s => { await s.page.keyboard.type(W.note) },
  },
  bal: {
    go: 'leavewar', box: '[data-testid="bal-LVE-dice"]',
    open: async s => { await wait(s, 800); await hit(s, '[data-testid="lw-tab-balances"]', 900) },
    type: async s => { await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(W.bal) },
  },
  sched: { go: 'editsched', open: async () => {}, box: '.page.on .ah-note.txed', type: async s => { await s.page.keyboard.press('End'); await s.page.keyboard.type(W.sched) } },
}
async function one(key) {
  const c = C[key], k = `N.${T}.${key}`, P = `p4-box-${key}-${T}`
  const webkitPhone = key === 'sched' && SZ !== 'd'
  const s = webkitPhone ? await clockWorld(SZ, { engine: 'webkit' }) : await mk(SZ)
  try {
    if (webkitPhone) { await clockSignIn(s, 'ad', 'a'); FACT(`${k}.browser`, 'WebKit phone 402x874') } else await signIn(s, 'ad', 'a')
    await go(s, c.go); await wait(s, 800); await c.open(s)
    const box = vis(s, c.box).first()
    if (!(await box.count())) { FACT(`${k}.box`, `no box ${c.box} drawn`); await tpic(s, `${P}-nobox`); return }
    if (!(await readBox(s, c.box)).focused) { await box.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await box.click(); else await box.tap(); await wait(s, 300) }
    await c.type(s); await wait(s, 300)
    const typed = await readBox(s, c.box)
    FACT(`${k}.typed`, { ...typed, storedBeforePick: await storedWith(s, W[key] === '77' ? '"77"' : W[key]) })
    await dpic(s, `${P}-1-typed`, [c.box], null)
    const p = await pick(s, 149); FACT(`${k}.pick149`, p)
    FACT(`${k}.on149`, { squadron: await barSq(s), page: await pageOn(s), box: await readBox(s, c.box), said: await sayNow(s), toast: await toast(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 90)), stored: await storedWith(s, W[key] === '77' ? '"77"' : W[key]), wordsOnPage: await s.page.evaluate(w => (document.querySelector('.page.on')?.innerText || '').includes(w), W[key]) })
    await dpic(s, `${P}-2-on149`, [c.box, '.topbar .mark'], ['.topbar', c.box])
    const q = await pick(s, 142); FACT(`${k}.pick142`, q)
    if ((await pageOn(s)) !== `page-${c.go}`) await go(s, c.go)
    if (key === 'bal' && !(await vis(s, c.box).count())) await hit(s, '[data-testid="lw-tab-balances"]', 900).catch(() => {})
    FACT(`${k}.back142`, { squadron: await barSq(s), page: await pageOn(s), box: await readBox(s, c.box), stored: await storedWith(s, W[key] === '77' ? '"77"' : W[key]), wordsOnPage: await s.page.evaluate(w => (document.querySelector('.page.on')?.innerText || '').includes(w), W[key]), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 90)) })
    await tpic(s, `${P}-3-back142`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await tpic(s, `${P}-error`).catch(() => {}) } finally { if (s.browser) await s.browser.close().catch(() => {}); else await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p4-box v1', SZ)
  for (const key of (ONLY.length ? ONLY : Object.keys(C))) await one(key)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
