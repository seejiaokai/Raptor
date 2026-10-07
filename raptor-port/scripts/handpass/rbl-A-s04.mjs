/* S04 — yesterday's first event: B; a blank Monday wave with X in it, dragged (wave grip) before the late flight, then after it.
   Each change before -> after -> Undo -> Redo, then a reload. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, see, whole, brief } = K
const SZ = K.PHONE ? 'phone' : 'desk'
const id = `S04-${SZ}`

const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  const { m, t } = await K.baseB(p)
  const base = await see(p, `${id}-0-base`, { monPic: true })
  R(`${id}.0`, `Baseline B for ${cs}`, brief(base), whole(base) && /4h30/.test(K.restText(base) || '') ? 'PASS' : 'FAIL', base.shots)
  const baseTxt = K.restText(base)
  const sameAsBase = s => K.restText(s) === baseTxt
  const monLine = s => JSON.stringify(s.monOther.concat(s.monLines).filter(x => /Breaks Tuesday Scribe/i.test(x)).map(x => x.slice(0, 200))) + ` · Mon pucks [${K.pk(s.monPk)}] raw ${JSON.stringify(s.monPk.map(x => x.ring))}`
  const baseMon = monLine(base)

  /* a blank Monday wave, X seated in it (drawn AFTER the late wave) */
  const b = await K.addFlyWave(p, MON)
  const bl = await K.lineOf(p, MON, b.gi, 0)
  const order1 = await K.orderOf(p, MON)
  const sa = await see(p, `${id}-1-blank-after-late`, { pics: true, monPic: true })
  R(`${id}.1.blank`, `"+ Wave" on Monday (blank: ${bl}), drawn after the late wave. Order now: ${order1}`, brief(sa) + ' · Mon list ' + monLine(sa), whole(sa) && sameAsBase(sa) ? 'PASS' : 'FAIL', sa.shots)
  const seated = await K.seat(p, MON, b.gi, 0, 0, 'w', X)
  const s2 = await see(p, `${id}-2-seated`, { pics: true, monPic: true })
  R(`${id}.2.seated`, `${cs} seated in the blank Monday wave (took ${seated.took}). Order: ${await K.orderOf(p, MON)}`, brief(s2) + ' · Mon list ' + monLine(s2), whole(s2) && sameAsBase(s2) ? 'PASS' : 'FAIL', s2.shots)

  /* drag the blank wave's grip onto the late wave's grip: BEFORE it */
  let order = await K.orderOf(p, MON)
  let dragErr = null
  try { await K.dragWave(p, MON, b.gi, m.gi) } catch (e) { dragErr = String(e.message || e).slice(0, 200) }
  const orderB = await K.orderOf(p, MON)
  const s3 = await see(p, `${id}-3-blank-before`, { pics: true, monPic: true })
  R(`${id}.3.before`, `the blank wave's grip dragged onto the late wave's grip (${dragErr ? 'DRAG ERROR ' + dragErr : 'dragged'}). Order before: ${order} → after: ${orderB}`, brief(s3) + ' · Mon list ' + monLine(s3), (orderB !== order) && whole(s3) && sameAsBase(s3) ? 'PASS' : (orderB === order ? 'PARTIAL' : 'FAIL'), s3.shots)
  const u3 = await K.undo(p); const s3u = await see(p, `${id}-3-undo`, { pics: 'list' })
  R(`${id}.3.undo`, `Undo (${JSON.stringify({ pressed: u3.pressed })}). Order: ${await K.orderOf(p, MON)}`, brief(s3u) + ' · Mon list ' + monLine(s3u), whole(s3u) && sameAsBase(s3u) ? 'PASS' : 'FAIL', s3u.shots)
  const r3 = await K.redo(p); const s3r = await see(p, `${id}-3-redo`, { pics: 'list' })
  R(`${id}.3.redo`, `Redo (${JSON.stringify({ pressed: r3.pressed })}). Order: ${await K.orderOf(p, MON)}`, brief(s3r) + ' · Mon list ' + monLine(s3r), whole(s3r) && sameAsBase(s3r) ? 'PASS' : 'FAIL', s3r.shots)

  /* reload with the blank wave BEFORE the late flight */
  await K.reload(p)
  const s3l = await see(p, `${id}-3-reload`, { pics: true, monPic: true })
  R(`${id}.3.reload`, `reload with the blank wave before the late flight. Order: ${await K.orderOf(p, MON)}`, brief(s3l) + ' · Mon list ' + monLine(s3l), whole(s3l) && sameAsBase(s3l) ? 'PASS' : 'FAIL', s3l.shots)

  /* and drag it back AFTER the late flight */
  const lateNow = (await K.orderOf(p, MON)).split('  ').findIndex(x => /ZM/.test(x))
  const blankNow = (await K.orderOf(p, MON)).split('  ').findIndex(x => /\(blank\)/.test(x))
  order = await K.orderOf(p, MON)
  dragErr = null
  try { await K.dragWave(p, MON, blankNow, lateNow) } catch (e) { dragErr = String(e.message || e).slice(0, 200) }
  const orderA = await K.orderOf(p, MON)
  const s4 = await see(p, `${id}-4-blank-after`, { pics: true, monPic: true })
  R(`${id}.4.after`, `the blank wave's grip dragged onto the late wave's grip again (${dragErr ? 'DRAG ERROR ' + dragErr : 'dragged'}). Order before: ${order} → after: ${orderA}`, brief(s4) + ' · Mon list ' + monLine(s4), (orderA !== order) && whole(s4) && sameAsBase(s4) ? 'PASS' : (orderA === order ? 'PARTIAL' : 'FAIL'), s4.shots)
  const u4 = await K.undo(p); const s4u = await see(p, `${id}-4-undo`, { pics: 'list' })
  R(`${id}.4.undo`, `Undo. Order: ${await K.orderOf(p, MON)}`, brief(s4u) + ' · Mon list ' + monLine(s4u), whole(s4u) && sameAsBase(s4u) ? 'PASS' : 'FAIL', s4u.shots)
  const r4 = await K.redo(p); const s4r = await see(p, `${id}-4-redo`, { pics: 'list' })
  R(`${id}.4.redo`, `Redo. Order: ${await K.orderOf(p, MON)}`, brief(s4r) + ' · Mon list ' + monLine(s4r), whole(s4r) && sameAsBase(s4r) ? 'PASS' : 'FAIL', s4r.shots)
  await K.reload(p)
  const s4l = await see(p, `${id}-4-reload`, { pics: true, monPic: true })
  R(`${id}.4.reload`, `reload with the blank wave after the late flight. Order: ${await K.orderOf(p, MON)}`, brief(s4l) + ' · Mon list ' + monLine(s4l), whole(s4l) && sameAsBase(s4l) ? 'PASS' : 'FAIL', s4l.shots)
  R(`${id}.cmp`, 'the same rest sentence and Monday "Breaks" line in every order', `base "${baseTxt}" | base Monday ${baseMon} | blank-before Monday ${monLine(s3)} | blank-after Monday ${monLine(s4)}`, 'RECORDED')
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
R(`${id}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('rbl-A-s04')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
