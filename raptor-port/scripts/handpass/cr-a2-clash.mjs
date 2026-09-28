/* Walker A2 — Astra 23's "medical / bid constraints are never bypassed", through REDO (28 Sep 26, Phase A of the
   change-recording re-test). The one-absence rules are re-checked by every door, redo included (undo-contract §6, clash
   check B7): a restore that would put leave over a medical is refused whole, the blocker named.
     Saber files an LL for Ranger on Fri 17 Jul (the Inputs page) → Undo (from the Leave War) → files an ATT C (medical,
     all day) for Ranger on the same Friday → Redo: the LL must NOT come back over the medical; a plain refusal says why.
   Usage (from raptor-port/): node scripts/handpass/cr-a2-clash.mjs [desktop|phone] */
import './cr-a2-env.mjs'
const L = await import('./cr-a2-lib.mjs')
const { openA2, book, door, doorState, lwOpen, go, fileInput, inputsOf, readUnav, elogTail } = L
const B = book('clash')
const { browser, page, errors } = await openA2('a')
const D = '2026-07-17'
const mine = async () => (await inputsOf(page, 'bane')).filter(x => /A2 clash/.test(x.remarks)).map(x => x.type)
async function friday(name) { await go(page, 'editsched'); const d = page.locator('#eWeek .day[data-day="4"]').first(); await d.evaluate(e => { const u = e.querySelector('.sec-unav') || e; u.scrollIntoView({ block: 'center', inline: 'center' }) }); await page.waitForTimeout(300); return B.shot(page, name) }
try {
  const f1 = await fileInput(page, { person: 'bane', from: D, type: 'LL', remarks: 'A2 clash LL' })
  B.ck('C1-ll', 'Saber files an LL for Ranger on Fri 17 Jul', f1.added === 1, { f1, now: await mine() }, await friday('C1-ll-filed'))
  await lwOpen(page, D)
  const u = await door(page, 'lw', 'undo')
  B.ck('C2-undo', 'Undo takes the LL back (Redo on)', u.pressed && !(await mine()).includes('LL'), { toasts: u.toasts, now: await mine() })
  const f2 = await fileInput(page, { person: 'bane', from: D, type: 'ATT C', remarks: 'A2 clash medical' })
  const d2 = await (async () => { await lwOpen(page, D); return doorState(page, 'lw') })()
  B.ck('C3-medical', 'then a medical (ATT C, all day) for Ranger on the same Friday', f2.added === 1 && (await mine()).includes('ATT C'),
    { f2, now: await mine(), doors: d2 }, await friday('C3-medical-filed'))
  await lwOpen(page, D)
  const r = await door(page, 'lw', 'redo')
  const after = await mine()
  const unav = await (async () => { await go(page, 'editsched'); return readUnav(page, '#eWeek .day[data-day="4"]') })()
  const pic = await friday('C4-redo-refused')
  /* two safe outcomes: the new filing withdrew the LL's Redo (they share a record), or Redo is offered and refuses whole
     with its reason — never the LL back over the medical */
  const how = r.disabled ? 'Redo withdrawn by the new filing (the re-check at redo is not reachable this way)' : ((r.toasts || []).some(t => /^Redid/.test(t)) ? 'REDONE' : 'refused')
  B.ck('C4-redo', 'the LL never comes back over the medical — Redo is withdrawn, or refused whole with its reason; the medical stays',
    !after.includes('LL') && after.includes('ATT C') && (r.disabled === true || ((r.toasts || []).length > 0 && !(r.toasts || []).some(t => /^Redid/.test(t)))),
    { how, redo: { pressed: r.pressed, disabled: r.disabled, title: r.title, toasts: r.toasts }, now: after, unav }, pic)
  B.note('C4-history', (await elogTail(page, 6)).map(x => `${x.lbl} @${x.date}`))
} catch (e) { B.ck('THREW', 'run', false, String(e && e.message || e).slice(0, 300), await B.shot(page, 'THREW')) }
B.note('errors', errors)
B.save(errors)
console.log(`${B.rows.filter(r => r.ok === true).length} PASS · ${B.rows.filter(r => r.ok === false).length} FAIL`)
await browser.close()
