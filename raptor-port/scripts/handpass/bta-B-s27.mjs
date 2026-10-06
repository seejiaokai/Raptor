/* S27 — SANS Availability (Fly / AMT / OFT) for Zulu (a SANS man, WSO) on Wednesday; he sits on a blank flying line and a blank duty
   row; then timed; the offer edited (events and hours); then a separate OL all day. The offer must never raise an absence warning. */
process.env.BTA_X = 'bullet'; process.env.BTA_CS = 'Zulu'; process.env.BTA_SEAT = 'w'
const T = await import('./bta-B-lib.mjs')
const Q = await import('./bta-B-lib2.mjs')
const { K, B, C, D, L, W, W2, ID, CSN, sleep, R, pic } = T
const WED = 2
const t = T.mk('s27')
const P = T.PHONE ? 'ph' : 'dk'
const gone = s => s.held.filter(x => /but tasked|but planned|clashes|On leave|SHIFT|Downchit/i.test(x) && !/SANS/i.test(x))
const sans = s => s.held.filter(x => /SANS/i.test(x))

async function editRow(p, iid, fn) {
  if (!(await W2.openEdit(p, iid))) return 'no editor opened'
  await fn()
  await pic(p, 's27-editor')
  await p.locator('#inBody tr.ined [data-save]').first().click(); await sleep(800)
  const asked = []
  for (let i = 0; i < 3; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await sleep(500); continue }
    break
  }
  return `saved${asked.length ? ' (asked ' + asked.join(',') + ')' : ''}`
}

const { browser, p, errors } = await K.fresh()
try {
  const f = await T.file(p, { type: 'SANS Availability', di: WED, allday: true, sans: [0, 1, 2], remarks: 'offer all' })
  const rec0 = await p.evaluate(i => JSON.stringify(window.INPUTS.find(x => x.iid === i)), f.iid)
  const s0 = await T.see(p, 's27-0', { di: WED })
  t.add('S27.0', `SANS Availability, All day, Fly + AMT + OFT ticked, filed for ${CSN} for Wed 15 July on the Inputs page (stored: ${rec0})`, T.says(s0), 'RECORDED', s0.pics)

  const line = await T.blankLine(p, WED)
  const row = await T.blankRow(p, 'duty', WED)
  const s1 = await T.see(p, 's27-1-blank', { di: WED })
  t.add('S27.1', `${CSN} put on a new blank flying line (took ${line.took}) and a new blank duty row (took ${row.took})`, T.says(s1, 200) + ` · SANS lines: ${JSON.stringify(sans(s1))}`, gone(s1).length === 0 ? 'PASS' : 'FAIL', s1.pics)

  await K.ff(p, WED, line.gi, 0, 'to', '10:00'); await K.ff(p, WED, line.gi, 0, 'ld', '11:30')
  const s2 = await T.see(p, 's27-2-timed', { di: WED })
  t.add('S27.2', 'take-off 10:00 and landing 11:30 typed on his line', T.says(s2, 200) + ` · SANS lines: ${JSON.stringify(sans(s2))}`, gone(s2).length === 0 ? 'PASS' : 'FAIL', s2.pics)

  const e1 = await editRow(p, f.iid, async () => {
    await p.locator('#inedSans input[type=checkbox]').nth(0).uncheck()
    const sp = p.locator('#inedSpan [data-span="pm"]'); if (await sp.count()) await sp.click()
  })
  const rec1 = await p.evaluate(i => JSON.stringify(window.INPUTS.find(x => x.iid === i)), f.iid)
  const s3 = await T.see(p, 's27-3-edited', { di: WED })
  t.add('S27.3', `the offer edited in the Inputs row editor: the first SANS tick (Fly) taken off and the PM span picked (${e1}); stored now: ${rec1}`, T.says(s3, 200) + ` · SANS lines: ${JSON.stringify(sans(s3))}`, gone(s3).length === 0 ? 'PASS' : 'FAIL', s3.pics)

  const e2 = await editRow(p, f.iid, async () => {
    const sp = p.locator('#inedSpan [data-span="custom"]'); if (await sp.count()) await sp.click()
    await p.locator('[data-ed="stime"]').fill('09:00'); await p.locator('[data-ed="etime"]').fill('10:30')
  })
  const rec2 = await p.evaluate(i => JSON.stringify(window.INPUTS.find(x => x.iid === i)), f.iid)
  const s4 = await T.see(p, 's27-4-hours', { di: WED })
  t.add('S27.4', `the offer's hours changed to Custom 09:00–10:30 (${e2}); stored now: ${rec2}`, T.says(s4, 200) + ` · SANS lines: ${JSON.stringify(sans(s4))}`, gone(s4).length === 0 ? 'PASS' : 'FAIL', s4.pics)

  const o = await T.file(p, { type: 'OL', di: WED, allday: true, remarks: 'Overseas' })
  const s5 = await T.see(p, 's27-5-ol', { di: WED })
  t.add('S27.5', `OL, All day, filed separately for ${CSN} for Wed 15 July (stored: ${await T.rec(p, o.iid)}) — the SANS offer still on file`, T.says(s5, 200) + ` · SANS lines: ${JSON.stringify(sans(s5))}`,
    s5.held.some(x => /On leave but planned to fly/.test(x)) && s5.held.some(x => /On leave but tasked — this row/.test(x)) && !s5.held.some(x => /SANS.*(clash|tasked)/i.test(x)) ? 'PASS' : 'FAIL', s5.pics)

  await B.reloadAs(p, 'a'); await B.toEdit(p)
  const s6 = await T.see(p, 's27-6-reload', { di: WED, noPics: true })
  t.add('S27.6', 'reload and sign in again', T.says(s6, 200), s6.held.filter(x => /On leave/.test(x)).length === 2 ? 'PASS' : 'FAIL')
} catch (e) { R('S27.X', 'script', String(e.stack || e).slice(0, 900), 'FAIL', [await pic(p, 's27-X')]) }
R('S27.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
T.done('bta-B-s27')
