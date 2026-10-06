/* S22 — templates: a wave template with blank times; a day template saved from a day with blank and timed lines, applied to an unpublished day */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C
const WED = 2
const restOf = async (p, di) => (await C.fullWarnsX(p, di)).filter(w => /CREW_REST/.test(w.code)).map(w => w.msg)
const view = async (p, di, tag, shots = true) => {
  const s = await C.seeWeek(p, di, tag, { noPics: !shots })
  return { s, sentence: (await restOf(p, di))[0] || null, lines: (s.list.full || []).filter(x => x.text.includes(C.CSN) && /rest/i.test(x.text)).map(x => x.text.replace(/ ✕| ↺/g, '')),
    ring: s.pk.filter(x => x.where === 'flying line').map(x => x.solid ? 'SOLID' : x.dashed ? 'DASHED' : 'no ring').join('/') || '(none)', dot: s.pv.some(x => x.dotted), pics: s.pics }
}
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, ID)
  const { m, t } = await C.baselineB(p)
  const base = (await view(p, TUE, 's22-0-base', false)).sentence
  R('S22.0', `Baseline B with ${cs}`, `Tuesday rest line: ${base}`, base && /05:00/.test(base) ? 'PASS' : 'FAIL')

  /* --- a wave template with blank times, through the wave menu's gear --- */
  await K.boardTo(p, TUE)
  const add = p.locator(`#schedBoard [data-wvadd="${TUE}"]`).first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await C.sleep(400)
  await p.locator('.wavemenu [data-wvedit]').first().click(); await C.sleep(600)
  await p.getByRole('button', { name: '+ New wave template' }).first().click(); await C.sleep(600)
  await p.locator('input[placeholder="Template name"]').first().fill('BLANKTPL'); await p.keyboard.press('Tab')
  await p.locator('input[placeholder="Callsign"]').first().fill('TP'); await p.keyboard.press('Tab')
  await p.locator('input[placeholder="Mission"]').first().fill('BFM'); await p.keyboard.press('Tab'); await C.sleep(300)
  const pe = await pic(p, 's22-1-template-editor')
  const timesTyped = await p.evaluate(() => [...document.querySelectorAll('input[placeholder="T/O"], input[placeholder="LD"]')].map(e => e.value))
  await p.getByRole('button', { name: 'Done' }).last().click(); await C.sleep(600)
  /* place it from the wave menu */
  await K.boardTo(p, TUE)
  const before = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label), TUE)
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await C.sleep(400)
  const tpls = await p.evaluate(() => [...document.querySelectorAll('.wavemenu [data-wmtpl]')].map(e => e.dataset.wmtpl + ':' + e.innerText.replace(/\s+/g, ' ')))
  await p.locator('.wavemenu [data-wmtpl]').first().click(); await C.sleep(700)
  const after = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label), TUE)
  const gi = after.findIndex(l => !before.includes(l))
  const lineA = gi >= 0 ? await C.lineNow(p, TUE, gi, 0) : 'no new wave'
  const nl = gi >= 0 ? await C.nLines(p, TUE, gi) : 0
  const seatX = gi >= 0 ? await K.seat(p, TUE, gi, 0, 0, C.SEAT, ID) : { took: false }
  const v1 = await view(p, TUE, 's22-2-from-template')
  R('S22.1', `wave template BLANKTPL made through ⚙ → "+ New wave template" (callsign TP, mission BFM, T/O and LD boxes left empty: ${JSON.stringify(timesTyped)}); placed with "+ Wave" → its template; ${cs} seated on its first line (took ${seatX.took}); the new wave has ${nl} line(s): ${lineA}`,
    `templates offered: ${JSON.stringify(tpls)}; Tuesday rest line now: ${v1.sentence}; Tuesday lines naming him: ${JSON.stringify(v1.lines)}; his cockpit pucks: ${v1.ring}; Monday dotted: ${v1.dot}`, v1.sentence === base && v1.sentence && v1.dot ? 'PASS' : 'FAIL', [pe, ...v1.pics])

  /* --- save Tuesday (timed + blank template line) as a day template, apply to Wednesday --- */
  await K.boardTo(p, TUE)
  await p.locator('#schedBoard #sbTpl').click(); await C.sleep(400)
  await p.getByText('Save this day as a template').first().click(); await C.sleep(700)
  const saved = await p.evaluate(() => (document.querySelector('.modal-box, [role=dialog]') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 220))
  await p.getByRole('button', { name: 'Done' }).last().click().catch(() => {}); await C.sleep(500)
  await W.boardOff(p)
  /* AFTER the template is saved: a late Tuesday flight for him (20:00–22:30, ends 00:30 Wednesday, clear 12:30), so Wednesday's early copied line binds */
  const lv = await C.flyWave(p, TUE, { cs: 'ZV', msn: 'BFM', to: '20:00', ld: '22:30' })
  await W.boardOff(p)
  await K.boardTo(p, WED)
  const wedBefore = await p.evaluate(() => window.DAYS[2].waves.length)
  await p.locator('#schedBoard #sbTpl').click(); await C.sleep(500)
  const menu = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null && /Template|template/.test(e.innerText)).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 70)))
  await p.getByRole('button', { name: /Template 1/ }).first().click(); await C.sleep(900)
  const asks = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null && /apply|replace|add|yes|confirm|ok/i.test(e.innerText)).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 50)))
  const pa = await pic(p, 's22-3-apply-ask')
  let pressed = null
  const ok = p.getByRole('button', { name: /^(Apply|Replace|Yes|Confirm|OK)/i }).first()
  if (await ok.count()) { pressed = (await ok.innerText()).trim(); await ok.click(); await C.sleep(900) }
  const wedAfter = await p.evaluate(() => window.DAYS[2].waves.map(w => w.label + ':' + w.formations.map(f => f.cs + '/' + f.to + '-' + f.ld + '/br' + (f.br || '')).join(',')))
  const wedPeople = await p.evaluate(() => JSON.stringify(window.DAYS[2].waves).includes('"waldo"') || JSON.stringify(window.DAYS[2].waves).includes('"split"'))
  const pb = await pic(p, 's22-4-wed-after')
  R('S22.2', `Tuesday saved as a day template (the app said: "${saved.slice(0, 160)}"); the Templates menu on Wednesday offered ${JSON.stringify(menu)}; Template 1 pressed${pressed ? `, then "${pressed}"` : ''} (other buttons on offer: ${JSON.stringify(asks)})`,
    `Wednesday had ${wedBefore} waves, now: ${JSON.stringify(wedAfter).slice(0, 400)}; ${cs} on any of Wednesday's waves after applying: ${wedPeople}`, 'RECORDED', [pa, pb])
  /* put him on the copied lines of Wednesday: the timed ZT line and the template's blank line */
  const wi = await p.evaluate(() => window.DAYS[2].waves.map((w, i) => ({ i, f: w.formations.map(f => f.cs + ':' + f.to) })))
  const zt = await p.evaluate(() => { for (let g = 0; g < window.DAYS[2].waves.length; g++) { const fs = window.DAYS[2].waves[g].formations; for (let f = 0; f < fs.length; f++) if (fs[f].cs === 'ZT') return [g, f] } return null })
  const tp = await p.evaluate(() => { for (let g = 0; g < window.DAYS[2].waves.length; g++) { const fs = window.DAYS[2].waves[g].formations; for (let f = 0; f < fs.length; f++) if (fs[f].cs === 'TP') return [g, f] } return null })
  const tk = []
  if (zt) tk.push('ZT ' + (await K.seat(p, WED, zt[0], zt[1], 0, C.SEAT, ID)).took)
  if (tp) tk.push('TP ' + (await K.seat(p, WED, tp[0], tp[1], 0, C.SEAT, ID)).took)
  const v2 = await view(p, WED, 's22-5-wed-reassigned')
  R('S22.3', `${cs} put back (from the crew list) on Wednesday's copied ZT line and on the template's blank TP line (took: ${tk.join(', ')}); Tuesday has, added AFTER the template was saved, a late flight ZV 20:00–22:30 for him (took ${lv.took}), so Wednesday's first report must fall inside twelve hours`,
    `Wednesday rest line: ${v2.sentence}; lines naming him: ${JSON.stringify(v2.lines)}; his Wednesday cockpit pucks ${v2.ring}; Tuesday's puck dotted: ${v2.dot}`, v2.sentence && /Tuesday/.test(v2.sentence) && v2.ring.includes('SOLID') ? 'PASS' : 'FAIL', v2.pics)
} catch (e) { R('S22', 'script', String(e.stack || e).slice(0, 700), 'NOT WALKED', [await pic(p, 's22-X').catch(() => '')]) }
R('S22.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('rbl-C-s22')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
