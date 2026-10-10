// Walker C, script 4 — 43 and 47 (a member's own leave 27-29 Jul, filed on a phone by touch; read on phone and desktop)
import * as L from './ivet-C-lib.mjs'
import { readPhone, readDesk, stored, norm } from './ivet-C-4lib.mjs'

let made, ph, dk, before, after
{
  const { ctx, page } = await L.open(L.PHONE, 'us', 'us', true, { fresh: false })
  await L.step('43', 'phone list + opened day on phone and desktop', 'Ranger', async () => {
    await L.toList(page, true)
    made = await L.fileInput(page, { type: 'LL', from: '2026-07-27', to: '2026-07-29' }, true)
    if (made.length !== 1) throw new Error('the leave was not saved: ' + JSON.stringify(made) + ' toast=' + await L.toast(page))
    const it = { iid: made[0].iid, days: ['2026-07-27', '2026-07-28', '2026-07-29'] }
    before = await stored(page, it.iid)
    ph = await readPhone(page, it, '43')
    after = await stored(page, it.iid)
    const dtw = await L.twin(ctx, L.DESK, 'us', 'us', false)
    dk = await readDesk(dtw.page, it, '43')
    await dtw.ctx.close()
    console.log('43 made', JSON.stringify(made[0]), '\nphone', JSON.stringify(ph.card), JSON.stringify(ph.days), '\ndesk', JSON.stringify({ row: dk.row?.rmk, win: dk.win, days: dk.days }))
    const problems = []
    if (before.remarks !== 'till 29 Jul') problems.push(`saved remark is "${before.remarks}"`)
    if (!ph.card) problems.push('no card on the phone list')
    else { if (ph.card.when !== 'till 29 Jul') problems.push(`list card corner "${ph.card.when}"`); if (ph.card.rmk) problems.push(`list card still carries a remark line "${ph.card.rmk}"`) }
    for (const iso of ['2026-07-27', '2026-07-28']) {
      const c = ph.days[iso]; const d = dk.days[iso]
      if (!c || c.when !== 'till 29 Jul' || c.rmk) problems.push(`phone day ${iso}: corner "${c?.when}" remark "${c?.rmk}"`)
      if (!d || d.when !== 'till 29 Jul' || d.rmk) problems.push(`desktop day ${iso}: corner "${d?.when}" remark "${d?.rmk}"`)
    }
    if (!/till 29 Jul/.test(dk.row?.rmk || '')) problems.push(`desktop Remarks cell "${dk.row?.rmk}"`)
    if (dk.win !== 'till 29 Jul') problems.push(`window Remarks box "${dk.win}"`)
    if (after.remarks !== before.remarks) problems.push('reading changed the saved remark')
    L.rec('43', 'phone list; opened day on phone and desktop', 'Ranger (member)', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : `own LL 27–29 Jul with only the automatic remark: phone list card corner "${ph.card.when}", no remark line; opened day 27 and 28 (phone and desktop) corner "till 29 Jul", no remark line; desktop Remarks cell "${dk.row.rmk}", window box "${dk.win}"; saved remark unchanged "${after.remarks}"`, [...ph.pics.slice(0, 3), ...dk.pics])
  })

  await L.step('47', 'phone list + opened day on phone and desktop', 'Ranger (member)', async () => {
    if (!made || !made[0]) throw new Error('no input from 43')
    const c27 = ph.days['2026-07-27'], c28 = ph.days['2026-07-28'], c29 = ph.days['2026-07-29']
    const d29 = dk.days['2026-07-29']
    const problems = []
    // first and middle: duplicate phrase left out; last: corner no longer says till, remark whole
    for (const [k, c] of [['27', c27], ['28', c28]]) if (!c || c.when !== 'till 29 Jul' || c.rmk) problems.push(`day ${k} (phone): corner "${c?.when}", remark "${c?.rmk}"`)
    if (!c29 || /till/.test(c29.when || '') || c29.rmk !== 'till 29 Jul') problems.push(`day 29 (phone): corner "${c29?.when}", remark "${c29?.rmk}" — expected the corner without "till" and the remark whole`)
    if (!d29 || /till/.test(d29.when || '') || d29.rmk !== 'till 29 Jul') problems.push(`day 29 (desktop): corner "${d29?.when}", remark "${d29?.rmk}"`)
    // the phone list shows the multi-day input once, under its first day
    const heads = await (async () => {
      await L.toList(page, true)
      return page.evaluate(iid => { const c = document.querySelector(`[data-testid="inl-row-${iid}"]`); let e = c?.previousElementSibling; while (e && e.getAttribute('data-testid') !== 'inl-day') e = e.previousElementSibling; return e?.textContent ?? null }, made[0].iid)
    })()
    if (ph.nCards !== 1) problems.push(`the phone list shows ${ph.nCards} cards for it`)
    if (!/27 Jul/i.test(heads || '')) problems.push(`the phone list card stands under "${heads}"`)
    // the one-day input in its own world (no clash with the leave)
    const w2 = await L.open(L.PHONE, 'us', 'us', true, { fresh: false })
    let one = null, oneInfo = null
    try {
      await L.toList(w2.page, true)
      const m1 = await L.fileInput(w2.page, { type: 'Meeting', from: '2026-07-27', title: 'C47 one day' }, true)
      if (m1.length !== 1) throw new Error('one-day input not saved: ' + await L.toast(w2.page))
      const it = { iid: m1[0].iid, days: ['2026-07-27'] }
      const p1 = await readPhone(w2.page, it, '47-oneday')
      const st = await stored(w2.page, it.iid)
      const dtw = await L.twin(w2.ctx, L.DESK, 'us', 'us', false)
      const d1 = await readDesk(dtw.page, it, '47-oneday'); await dtw.ctx.close()
      oneInfo = { saved: st.remarks, listCard: p1.card, day: p1.days['2026-07-27'], deskDay: d1.days['2026-07-27'], deskRow: d1.row?.rmk, win: d1.win, pics: [...p1.pics, ...d1.pics] }
      console.log('47 one-day', JSON.stringify({ ...oneInfo, pics: undefined }))
      if (norm(st.remarks) !== 'till 27 Jul') problems.push(`one-day saved remark "${st.remarks}" (the automatic words were not written for a one-day input)`)
      if (!p1.card || p1.card.rmk !== st.remarks) problems.push(`one-day phone list card remark "${p1.card?.rmk}"`)
      if (!p1.days['2026-07-27'] || p1.days['2026-07-27'].rmk !== st.remarks) problems.push(`one-day phone opened day remark "${p1.days['2026-07-27']?.rmk}"`)
      if (!d1.days['2026-07-27'] || d1.days['2026-07-27'].rmk !== st.remarks) problems.push(`one-day desktop opened day remark "${d1.days['2026-07-27']?.rmk}"`)
    } finally { await w2.ctx.close() }
    L.rec('47', 'phone list + opened day on phone and desktop', 'Ranger (member)', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : `LL 27–29: day 27 and 28 corner "till 29 Jul", remark left out; day 29 (last) corner "${c29.when}" and remark whole "${c29.rmk}" on phone and desktop; the phone list shows it once, under "${heads}"; the one-day input keeps its remark "${oneInfo?.saved}" whole on the list card, the opened day (phone and desktop)`, [...ph.pics.slice(3), ...(oneInfo?.pics || [])])
  })
  L.savePartial('4')
  await ctx.close()
}
console.log('errors:', L.errs)
await L.browser.close()
