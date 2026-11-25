// shr-w3 — chat 178's copy of chat 170's reproduction of the night walk's W3 (scripts/handpass/r4wf-w2-w3.mjs on
// claude/r4-walk-faults-170), run unchanged on this branch's build as the host's own short walk before the walkers.
// r4wf second walk — W3 looked at closely (25 Nov 26): one man's row of a shared, timed leave (Ranger and Hex,
// 08:00–10:00) edited three times on the Board's Unavailable list with Tab — start 0900, end 1100, remarks "own hours".
// EXPECTED (the walk brief, `docs/ui-contracts.md` own-part contract, D737): Ranger's first change gives him an input of
// his own, the next changes reach that same input; Hex keeps 08:00–10:00 and his (empty) remark. Every leave of the two
// on 15 Jul is read from the store after each step, and the list is pictured once the caret has left.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/shr-w3.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, bundleOf, log, finish, facts } = L
const J = JSON.stringify
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', tag = `${SZ}-${ENG}`
const res = []
const add = (id, verdict, what, pic = '') => { res.push([id, verdict, what, pic]); console.log('RESULT', id, '|', verdict, '|', what, '|', pic) }
const w = await newPage(SZ, undefined, L.NEW_DIR, ENG); await signIn(w, 'ad'); log(tag, 'bundle ' + await bundleOf(w.page))
const p = w.page
const pic = async name => { const f = `w3-${tag}-${name}.png`; const clip = await L.boxOf(p, ['#sbBoard > [data-secmove$=".unav"]'], 8); await p.screenshot({ path: `${process.env.WR4_OUT}/${f}`, ...(clip ? { clip } : {}) }); return f }
const leaves = () => p.evaluate(() => window.INPUTS.filter(r => r.type === 'LL' && r.date === 'Jul 15' && (r.people || []).some(x => x.p === 'bane' || x.p === 'rocky')).map(r => `${(r.people || []).map(x => x.p === 'bane' ? 'Ranger' : x.p === 'rocky' ? 'Hex' : x.p).join('+')} ${r.s}-${r.e} "${r.remarks || ''}" [${r.iid}]`))
const rows = () => p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-ifld$=".str"]')].map(e => { const row = e.closest('tr, .sb-arow, .sb-row') || e.parentElement; const who = (row.innerText || '').replace(/\s+/g, ' '); return /Ranger|Hex/.test(who) ? `${/Ranger/.test(who) ? 'Ranger' : 'Hex'} ${e.value}-${row.querySelector('[data-ifld$=".end"]')?.value} "${row.querySelector('[data-ifld$=".rmks"]')?.value || ''}" [${e.getAttribute('data-ifld')}]` : null }).filter(Boolean))
const steps = []
try {
  const iid = await L.fileInput(w, tag, L.WED, { type: 'LL', people: [L.RANGER, L.HEX], from: '08:00', to: '10:00' })
  await go(p, 'editsched'); await p.evaluate(() => window.openScheduler(2)); await sleep(900)
  steps.push({ step: 'filed', store: await leaves(), screen: await rows() })
  const box = async f => { const k = (await rows()).find(r => r.startsWith('Ranger')).match(/\[(.+)\]/)[1].replace(/\.str$/, '.' + f); return `#schedBoard [data-ifld="${k}"]` }
  for (const [f, v] of [['str', '0900'], ['end', '1100'], ['rmks', 'own hours']]) {
    const sel = await box(f)
    const b = p.locator(sel).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' })); if (w.tap) await b.tap(); else await b.click(); await sleep(200)
    await p.keyboard.press('Control+A'); await p.keyboard.type(v); await p.keyboard.press('Tab'); await sleep(600)
    steps.push({ step: `${f} ${v}, Tab`, typedIn: sel.match(/"(.+)"/)[1], store: await leaves(), screen: await rows(), caret: await p.evaluate(() => document.activeElement?.getAttribute('data-ifld')) })
  }
  const f1 = await pic('caret-still-in')
  await p.mouse.click(3, 3); await sleep(700)
  steps.push({ step: 'caret left (blank space clicked)', store: await leaves(), screen: await rows() })
  const f2 = await pic('caret-left')
  const st = steps.at(-1).store
  const ranger = st.filter(s => s.startsWith('Ranger ')), hex = st.filter(s => s.startsWith('Hex '))
  const ok = ranger.length === 1 && /^Ranger 540-660 "own hours"/.test(ranger[0]) && hex.length === 1 && /^Hex 480-600 ""/.test(hex[0])
  add(`W3 ${tag} Ranger's row of the shared leave: 0900, 1100, "own hours" — Ranger 09:00–11:00 "own hours" on an input of his own; Hex 08:00–10:00, no remark`, ok ? 'PASS' : 'FAIL', J(steps), `${f1}, ${f2}`)
} catch (e) { add(`W3 ${tag}`, 'ERROR', e.message.split('\n')[0].slice(0, 300) + ' ' + J(steps)) }
facts.results = res
await finish()
