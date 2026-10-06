/* S11 — the crew list's answer BEFORE a man is placed, and the toast AFTER (tap and real drag; and an empty formation) */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C
const which = process.argv[2] || 'all'
const OTHER = C.SEAT === 'w' ? 'bane' : 'nick'   /* the other crew member on Tuesday's timed formation */

async function roster(p) {
  const r = await p.evaluate(who => {
    const e = [...document.querySelectorAll(`#sbRoster .rpuck[data-person="${who}"]`)].find(x => x.offsetParent !== null)
    if (!e) return { found: false }
    const all = [e, ...e.querySelectorAll('*')]
    const struck = e.classList.contains('no') || getComputedStyle(e, '::after').content !== 'none'
    let row = e.parentElement, txt = ''
    for (let i = 0; i < 4 && row; i++, row = row.parentElement) { txt = (row.innerText || '').replace(/\s+/g, ' ').trim(); if (txt.length > 12) break }
    return { found: true, struck, cls: e.className.replace(/\s+/g, ' '), title: e.getAttribute('title') || '', own: (e.innerText || '').replace(/\s+/g, ' ').trim(), rowText: txt.slice(0, 220), sibling: e.nextElementSibling ? (e.nextElementSibling.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160) : '' }
  }, ID)
  return r
}
const sayRoster = r => !r.found ? 'name not in the crew list' : `struck ${r.struck ? 'YES' : 'no'} · name box "${r.own}" · row text "${r.rowText}" · beside it "${r.sibling}" · tooltip "${r.title}"`

async function armSeat(p, key) {
  const el = p.locator(`#schedBoard [data-slot="${key}"]:visible, #schedBoard [data-fill="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await C.sleep(150)
  try { await el.click({ timeout: 2500 }) } catch { const b = await el.boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await C.sleep(300)
  return p.evaluate(() => (window.ARM && window.ARM.key) || null)
}
async function sceneBase(p, { other = true } = {}) {
  const m = await C.flyWave(p, MON, { cs: 'ZM', msn: 'BFM', to: '20:00', ld: '22:30' }, true)
  const t = await K.addFlyWave(p, TUE)
  await C.csFix(p, TUE, t.gi, 0, { cs: 'ZT', msn: 'BFM', br: '05:00', to: '07:00', ld: '08:00' })
  let o = null
  if (other) o = await K.seat(p, TUE, t.gi, 0, 0, C.OPP, OTHER)
  return { m, t, o }
}
const specific = async (p, di) => (await C.fullWarnsX(p, di)).map(w => `${w.sev}/${w.code}: ${w.msg}`)

async function variant(tag, mode) {
  const { browser, p, errors } = await K.fresh()
  const pics = []
  try {
    const cs = await B.csOf(p, ID)
    const { m, t, o } = await sceneBase(p, { other: mode !== 'empty' })
    let blank = null
    if (mode !== 'empty') blank = await C.extraLine(p, TUE, t.gi)       /* X on a blank line FIRST */
    const w0 = await specific(p, TUE)
    await K.boardTo(p, TUE)
    pics.push(await pic(p, `${tag}-0-fixture`))
    const key = `${TUE}.${t.gi}.0.0.${C.SEAT}`
    if (mode === 'drag') {
      /* a real pointer drag from the crew list onto the seat; read the crew list's answer first and at the hover */
      if (C.PHONE) { await p.getByText('AIRCREW').first().click().catch(() => {}); await C.sleep(600) }
      const r0 = await roster(p)
      await W.boardOn(p, TUE)
      const src = p.locator(`#sbRoster .rpuck[data-person="${ID}"]:visible`).first()
      const dst = p.locator(`#schedBoard [data-slot="${key}"]:visible`).first()
      await dst.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await C.sleep(250)
      await src.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await C.sleep(250)
      const a = await src.boundingBox(), b = await dst.boundingBox()
      await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
      await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, { steps: 3 })
      await p.mouse.move(b.x + Math.min(b.width / 2, 30), b.y + b.height / 2, { steps: 14 }); await C.sleep(250)
      const during = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => !e.closest('#sbRoster') && e.children.length === 0 && /not clear until|already on/.test(e.textContent || '')).map(e => (e.textContent || '').trim()).join(' | ').slice(0, 200))
      pics.push(await pic(p, `${tag}-1-during-drag`))
      await p.mouse.up(); await C.sleep(800)
      const tst = await C.toastNow(p)
      pics.push(await pic(p, `${tag}-2-after-drop`))
      const w1 = await specific(p, TUE)
      const holds = await p.evaluate(k => { const h = document.querySelector(`#schedBoard [data-slot="${k}"]`); return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : [] }, key)
      return { cs, r0, during, tst, w0, w1, holds, pics, errors, took: holds.includes(ID), fixture: `Monday ZM 20:00–22:30 with ${cs}; Tuesday ZT 07:00–08:00 Brief 05:00 with ${o ? 'Ranger in the front seat' : 'nobody'}${blank ? `; ${cs} first put on a blank Tuesday line (took ${blank.took})` : ''}` }
    }
    /* tap: arm the seat, read the crew list, then press his name */
    const armed = await armSeat(p, key)
    await C.sleep(300)
    const r1 = await roster(p)
    pics.push(await pic(p, `${tag}-1-armed-crewlist`))
    const rosterEl = p.locator(`#sbRoster .rpuck[data-person="${ID}"]:visible`).first()
    await rosterEl.evaluate(e => e.scrollIntoView({ block: 'center' })); await C.sleep(150)
    await rosterEl.click({ timeout: 3000 }).catch(async () => { const bb = await rosterEl.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2) })
    await C.sleep(450)
    const tst = await C.toastNow(p)
    pics.push(await pic(p, `${tag}-2-after-tap`))
    await p.keyboard.press('Escape'); await C.sleep(200)
    const w1 = await specific(p, TUE)
    const holds = await p.evaluate(k => { const h = document.querySelector(`#schedBoard [data-slot="${k}"]`); return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : [] }, key)
    return { cs, armed, r1, tst, w0, w1, holds, pics, errors, took: holds.includes(ID), fixture: `Monday ZM 20:00–22:30 with ${cs}; Tuesday ZT 07:00–08:00 Brief 05:00 with ${o ? 'Ranger in the front seat' : 'nobody'}${blank ? `; ${cs} first put on a blank Tuesday line (took ${blank.took})` : ''}` }
  } catch (e) {
    pics.push(await pic(p, `${tag}-X`).catch(() => ''))
    return { err: String(e.stack || e).slice(0, 700), pics, errors }
  } finally { await browser.close() }
}
const SUF = process.env.RBL_SUF || ''
async function run(name, mode, id) {
  const r = await variant(`s11-${name}${SUF}`, mode)
  if (r.err) { R(id + SUF, name, 'script error: ' + r.err, 'NOT WALKED', r.pics); return }
  const before = mode === 'drag' ? r.r0 : r.r1
  const struckBefore = mode === 'drag' ? /crew rest — not clear until/i.test(r.during || '') : before.found && before.struck && /crew rest/i.test(before.own + ' ' + before.title)
  const wBreach = r.w1.filter(x => /CREW_REST/.test(x))
  const toastOk = !!r.tst && /rest|breach/i.test(r.tst)
  const did = `${r.fixture}. ${mode === 'drag' ? 'Real pointer drag from the crew list onto Tuesday\'s timed seat' : 'Tapped the timed seat, read his name in the crew list, then pressed his name'}. Took: ${r.took}`
  const saw = `BEFORE placing — ${sayRoster(before)}${mode === 'drag' ? ` (MID-DRAG, the bubble under the seat: "${r.during}")` : ` (armed seat: ${r.armed})`}. TOAST after: ${r.tst ? '"' + r.tst + '"' : 'none on screen'}. His Tuesday warnings before: ${JSON.stringify(r.w0)}; after: ${JSON.stringify(r.w1)}. Errors: ${r.errors.join(' | ') || 'none'}`
  let verdict
  if (mode === 'empty') verdict = r.took && wBreach.length ? 'PASS' : 'FAIL'
  else verdict = r.took && struckBefore && wBreach.length && toastOk ? 'PASS' : 'FAIL'
  R(id + SUF, did, saw, verdict, r.pics)
}
if (which === 'tap' || which === 'all') await run('tap', 'tap', 'S11.tap')
if (which === 'drag' || which === 'all') await run('drag', 'drag', 'S11.drag')
if (which === 'empty' || which === 'all') await run('empty-formation', 'empty', 'S11.empty')
B.savePart('rbl-C-s11' + SUF)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
