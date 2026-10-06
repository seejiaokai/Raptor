/* walker A — S23 part 2: ALL / ALL AVAIL on blank non-cockpit rows, one fresh world per attempt (tap and a real drag).
   Usage: node bta-A-s4.mjs [rowkind]  (duty | oft | ground | prog | bbd) */
import * as A from './bta-A-lib.mjs'
import * as C from './rbl-C-lib.mjs'
const { B, K, W, TUE, ID, sleep } = A
const clip = s => String(s).replace(/\s+/g, ' ')
const sz = A.PHONE ? '390×844 phone' : '1440×900 desktop'
const only = process.argv[2]

/* a real pointer drag from the crew list's placeholder to a point of the target that really is the target (nothing lies over it) */
async function dragTo(p, pid, key) {
  await K.boardTo(p, TUE)
  await sleep(2500)   /* let the "planned" toast fade: it sits over the lower board */
  const dst = p.locator(`#schedBoard [data-slot="${key}"]:visible, #schedBoard [data-fill="${key}"]:visible`).first()
  await dst.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const src = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await sleep(200)
  const a = await src.boundingBox(); const b = await dst.boundingBox()
  if (!a || !b) return { err: 'no box for the source or the target' }
  const vp = p.viewportSize()
  /* candidate points inside the target; keep the first where the topmost element is the target (or inside it) */
  const cands = [[0.5, 0.5], [0.2, 0.5], [0.8, 0.5], [0.5, 0.25], [0.5, 0.75], [0.1, 0.5], [0.9, 0.5]]
  let pt = null
  for (const [fx, fy] of cands) {
    const x = b.x + b.width * fx, y = b.y + b.height * fy
    if (x < 0 || y < 0 || x > vp.width || y > vp.height) continue
    const ok = await dst.evaluate((e, [px, py]) => { const t = document.elementFromPoint(px, py); return !!t && (t === e || e.contains(t) || t.contains(e) || !!t.closest('[data-fill],[data-slot]')) }, [x, y])
    if (ok) { pt = [x, y]; break }
  }
  if (!pt) return { err: 'nothing of the target is free to drop on (something lies over all of it)' }
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
  await p.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  await p.mouse.move(pt[0], pt[1], { steps: 16 }); await sleep(200)
  await p.mouse.up(); await sleep(800)
  return { t: await C.toastNow(p) }
}
async function tapTo(p, pid, key) {
  await K.boardTo(p, TUE)
  const armed = await C.armSeat(p, key)
  const found = await p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).count()
  const t = found ? await C.pressName(p, pid) : 'NO PUCK IN THE LIST'
  return { armed, t }
}
const snap = (p, kind, ri) => p.evaluate(([k, r]) => { const d = window.DAYS[1]; return JSON.stringify(k === 'duty' ? d.dutywaves[0].rows[r] : k === 'oft' ? d.sims.oft[r] : k === 'ground' ? d.ground[r] : k === 'prog' ? d.allhands[r] : d.dutywaves.map(w => w.rows)) }, [kind, ri])

for (const kind of ['duty', 'oft', 'ground', 'prog', 'bbd']) for (const pid of ['allavail', 'all']) for (const how of ['tap', 'drag']) {
  if (only && only !== kind) continue
  const lab = { duty: 'duty row', oft: 'sim (OFT) row', ground: 'Ground Programme row', prog: 'Common Programme row', bbd: 'BB desk' }[kind]
  const id = `S23 ${pid === 'all' ? 'ALL' : 'ALL AVAIL'} on ${lab} by ${how}`
  const w = await K.fresh(); const { p, errors } = w
  try {
    if (kind === 'bbd') await A.makeBBTemplate(p)
    const h = await A.build(p, kind === 'bbd' ? 'bbDesk' : kind === 'oft' ? 'sim' : kind)
    await A.blankIt(p, h)
    const key = h.key
    const before = await snap(p, kind, h.ri)
    const r = how === 'tap' ? await tapTo(p, pid, key) : await dragTo(p, pid, key)
    const after = await snap(p, kind, h.ri)
    const s = await A.read(p, `s23-${kind}-${pid}-${how}`, { pics: 'list' })
    /* the "?" count chip, if the board draws one for this row */
    let chip = null, chipShot = null
    await K.boardTo(p, TUE)
    const cc = p.locator('#schedBoard .oilcount.nostart:visible').first()
    if (await cc.count()) {
      const title = clip(await cc.getAttribute('title') || '')
      await cc.evaluate(e => e.scrollIntoView({ block: 'center' })); await cc.click().catch(() => {}); await sleep(600)
      chip = { text: clip(await cc.innerText()), title: title.slice(0, 160), toast: await C.toastNow(p) }
      chipShot = await A.pic(p, `s23-${kind}-${pid}-${how}-chip`)
      await p.keyboard.press('Escape'); await sleep(200)
    }
    const changed = before !== after
    const took = changed && !r.err
    K.R(id, `${sz}: a blank ${lab} (no name, no times); ${how === 'tap' ? 'seat armed, the placeholder pressed in the crew list' : 'a real pointer drag from the crew list onto the row'}`,
      `armed ${r.armed || '-'}; the app said ${r.t ? '"' + clip(r.t).slice(0, 120) + '"' : r.err ? 'DRAG NOT DONE: ' + r.err : 'nothing'}; the row ${changed ? 'took it: ' + after.slice(0, 120) : 'is unchanged'}; ${A.say(s)}; "?" count chip: ${chip ? JSON.stringify(chip) : 'none drawn'}`,
      took && s.abs.length === 0 ? 'PASS' : r.err ? 'NOT WALKED' : 'FAIL', [...s.pics, ...(chipShot ? [chipShot] : [])])
  } catch (e) { K.R(id, 'script', String(e.stack || e).slice(0, 500), 'FAIL', [await A.pic(p, ('ERR-' + id).replace(/\W+/g, '_'))]) }
  if (errors.length) K.R(id + '.err', 'browser errors', errors.join(' | ').slice(0, 400), 'FAIL')
  await w.browser.close()
}
B.savePart('bta-A-s23rows')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n      → ${clip(r.saw).slice(0, 700)}`)
