/* www W3 fix 4 — the drop note names everyone the line is about. usage: [PHONE=1] node scripts/handpass/www/www-w3-s4.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's4-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('4 drop note names two', size, did, exp, saw, v, pic)
const ocu = await page.evaluate(() => Object.keys(window.PEOPLE).map(k => ({ k, cs: window.PEOPLE[k].cs, q: window.PEOPLE[k].q, r: window.PEOPLE[k].r || window.PEOPLE[k].role || window.PEOPLE[k].seat })).filter(p => /^O/.test(String(p.q || ''))))
say('OCU people', JSON.stringify(ocu))
await X.board(w, X.FRI)
const wi = await X.addWave(w, X.FRI, '')
await H.setF(w, `ff:${X.FRI}.${wi}.0.to`, '12:00')
await H.setF(w, `ff:${X.FRI}.${wi}.0.ld`, '13:00')
await H.setF(w, `ff:${X.FRI}.${wi}.0.msn`, 'OCU FLT')
async function seatAndWatch(slot, id, tag) {
  await X.ensureRoster(w)
  await X.press(w, slot, { scope: 'board' }); await sleep(200)
  const armed = await page.evaluate(() => window.ARM && window.ARM.key)
  if (!armed) return { ok: false, why: 'not armed' }
  const p = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
  if (!(await p.count())) { await page.keyboard.press('Escape'); return { ok: false, why: id + ' not offered' } }
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
  if (PHONE) await p.tap(); else await p.click()
  let seen = ''
  for (let i = 0; i < 24 && !seen; i++) { await sleep(50); seen = await page.evaluate(() => { const t = document.getElementById('toastEl'); return t && getComputedStyle(t).opacity !== '0' && t.getBoundingClientRect().width > 0 ? t.textContent.trim() : '' }) }
  await page.screenshot({ path: `${X.SHOTS}/${tag}-${P}.png` })
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
  await X.closeRoster(w)
  await sleep(300)
  return { ok: true, note: seen }
}
const pil = ocu.find(p => /Wildcard/.test(p.cs)) || ocu[0]
say('pilot candidate', JSON.stringify(pil))
const a = await seatAndWatch(`[data-slot="${X.FRI}.${wi}.0.0.p"]`, pil.k, '4-a-pilot-drop')
R('dropped the OCU pilot ' + pil.cs + ' in the front seat', 'RECORD the note (if any)', JSON.stringify(a), 'RECORDED', `4-a-pilot-drop-${P}.png`)
let done = false
for (const wso of ocu.filter(p => p.k !== pil.k).sort((x, y) => (y.r === 'RCP') - (x.r === 'RCP'))) {
  const b = await seatAndWatch(`[data-slot="${X.FRI}.${wi}.0.0.w"]`, wso.k, '4-b-wso-drop')
  say('try wso', wso.cs, JSON.stringify(b))
  const seated = await page.evaluate(([d, g]) => window.PEOPLE[window.DAYS[d].waves[g].formations[0].aircraft[0].w]?.cs, [X.FRI, wi])
  if (seated === wso.cs) {
    const exp = new RegExp(`^(${pil.cs}, ${wso.cs}|${wso.cs}, ${pil.cs}) — `)
    R('dropped the OCU WSO ' + wso.cs + ' behind ' + pil.cs + ' on the same jet (crew pairing)', 'the note reads "<callsign>, <callsign> — <the line>"; pictured at once', JSON.stringify(b), b.note && exp.test(b.note) ? 'PASS' : 'FAIL', `4-b-wso-drop-${P}.png`)
    done = true; break
  }
}
if (!done) R('dropped an OCU WSO behind the OCU pilot', 'two-name note', 'no OCU WSO could be seated', 'NOT WALKED', '')
const bw = await X.boardWarn(w)
R('the warning list for the same pair', 'RECORD', JSON.stringify(bw.filter(l => /Crew solo|OCU/.test(l))), 'RECORDED', `4-b-wso-drop-${P}.png`)
await X.fin(w)
