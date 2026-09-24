/* THE MOCK-UP for D95 (25 Sep 26, his ask: "view only schedule should also see who signed off each publish/amendment.
   Can u generate a nice mockup of how it can look on a view only schedule and doesnt take much space").
   Pictures of the REAL app (the production build, the everything-week): Wednesday — a draft in the demo week — is
   taken through its life the way a scheduler does it, each time signed by different people (a different name in
   each box) through the sign-off boxes and published through the app's own buttons: the Original, then AL1 (a remark), then AL2 (a take-off time).
   Then View-only Sched is pictured as it is today, and with the proposal laid on top:
     1. one slim line under the day head — "Signed AL2" and the four names, roles labelled (names only on a phone);
     2. the ⓘ day panel lists every published version with its four signers — the history, taking no space.
   Nothing is saved to the app. NOTE for the build: an amendment's record keeps its four signers today, but the
   ORIGINAL's does not (its sign-offs are cleared without being kept) — this script reads them just before the
   Original goes out, which is what the build must start storing.
   Usage, with the build served on :4173:  node mk-view-signers.mjs desktop 1  |  node mk-view-signers.mjs phone 3 */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = Number(process.argv[3] || (W === 'phone' ? 3 : 1))
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/view-signers'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, publishDay, publishAL, go, STATE } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: STATE, dpr: DPR })
const WED = 2
/* sign the four boxes with DIFFERENT people (the walk helper picks the same index in every box, which on this demo
   roster puts one scheduler in three boxes) — box k takes the (base + k)th name it offers, as a real day would */
async function signVaried(di, base) {
  const out = {}
  for (const [k, role] of ['cur', 'sked', 'plan', 'appr'].entries()) {
    const sel = page.locator(`#eWeek select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[(base + k * 2) % opts.length]); await page.waitForTimeout(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return out
}

/* ---- Wednesday's life: Original → AL1 → AL2, a different set of signers each time ------------------------ */
await editWeek(page)
const signs = []
const signedNow = () => page.evaluate((di) => ({ ...(window.SCHED.sign[di] || {}) }), WED)
const log = []
log.push(['sign Original', await signVaried(WED, 0)])
signs.push({ ver: 'ORIG', sign: await signedNow() })                     // kept here: the app does not keep them yet
log.push(['publish', await publishDay(page, WED)])
const change = async (fn) => { await page.evaluate(fn); await page.waitForTimeout(600) }
await change(() => { window.txtSet('fr:2.0.0.0', '1B: ACM-4 // WX CALL 0900'); window.afterSchedMutate() })
log.push(['sign AL1', await signVaried(WED, 1)], ['publish', await publishAL(page, WED)])
await change(() => { window.txtSet('ff:2.1.0.to', '13:10'); window.afterSchedMutate() })
log.push(['sign AL2', await signVaried(WED, 3)], ['publish', await publishAL(page, WED)])
const als = await page.evaluate((di) => window.SCHED.als.filter(a => a.di === di).map(a => ({ id: a.id, sign: a.sign[di] })), WED)
als.forEach((a, i) => signs.push({ ver: 'AL' + (i + 1), sign: a.sign }))
/* a sign-off box stores the person as picked — his id or his callsign — so every name is shown by callsign */
const shown = await page.evaluate((signs) => signs.map(x => ({ ...x, sign: Object.fromEntries(Object.entries(x.sign || {})
  .map(([k, v]) => [k, (window.PEOPLE[v] && window.PEOPLE[v].cs) || v])) })), signs)
signs.splice(0, signs.length, ...shown)
console.log(JSON.stringify({ log, signs }, null, 1))
if (signs.length !== 3 || signs.some(s => !s.sign || !s.sign.appr)) console.log('!! the day did not come out as intended')

/* ---- the pictures ----------------------------------------------------------------------------------------- */
await go(page, 'viewsched'); await page.waitForTimeout(700)
const DAY = `#vWeek .day[data-day="${WED}"]`
const ROLES = [['cur', 'CUR CK'], ['sked', 'SKED CK'], ['plan', 'PLANNED BY'], ['appr', 'APPROVED BY']]
async function headShot(name) {        // the day head and the first lines under it
  const box = await page.evaluate((DAY) => {
    const d = document.querySelector(DAY); d.scrollIntoView({ block: 'start', inline: 'center' })
    const bar = document.querySelector('.topbar'); window.scrollBy(0, -((bar ? bar.getBoundingClientRect().bottom : 0) + 10))
    const t = d.getBoundingClientRect(), issues = d.querySelector('.dwhead, .dwsum, .dwlist, .dsec')
    const b = issues ? issues.getBoundingClientRect() : { top: t.top + 120 }
    return { x: t.left, y: t.top, w: t.width, h: b.top - t.top + 44 }
  }, DAY)
  await page.screenshot({ path: `${OUT}/${W}-${name}.png`, clip: { x: Math.max(0, box.x - 3), y: Math.max(0, box.y - 3), width: box.w + 6, height: box.h + 6 } })
  console.log('shot', name)
}
async function panelShot(name) {
  const box = await page.evaluate(() => { const b = document.querySelector('#dayPop .airpop-box'); if (!b) return null
    const body = document.querySelector('#dayPopBody'); const grid = body && body.querySelector('.dip-grid')
    const r = b.getBoundingClientRect(), g = grid ? grid.getBoundingClientRect() : r
    return { x: r.left, y: r.top, w: r.width, h: g.top - r.top + 8 } })
  if (!box) { console.log('NO PANEL', name); return }
  await page.screenshot({ path: `${OUT}/${W}-${name}.png`, clip: { x: Math.max(0, box.x - 3), y: Math.max(0, box.y - 3), width: box.w + 6, height: box.h + 6 } })
  console.log('shot', name)
}
const CSS = `
.mk-signed{display:flex;flex-wrap:wrap;align-items:center;gap:3px 10px;padding:5px 15px 6px;font-size:11px;line-height:1.3;
  color:var(--ink-3);border-bottom:1px solid var(--edge);background:rgba(255,255,255,.012)}
.mk-signed .mk-sl{font-family:'Barlow Condensed','Inter Tight',sans-serif;text-transform:uppercase;letter-spacing:.1em;font-weight:700;font-size:10px}
.mk-signed .verchip{font-family:'Barlow Condensed','Inter Tight',sans-serif;font-size:10px;font-weight:800;letter-spacing:.06em;padding:1px 6px;border-radius:5px}
.mk-sn{color:var(--ink-2);font-weight:600;white-space:nowrap}
.mk-sn i{font-style:normal;font-family:'Barlow Condensed','Inter Tight',sans-serif;font-weight:700;font-size:9.5px;letter-spacing:.06em;color:var(--ink-3);margin-right:4px}
@media (max-width:820px){.mk-signed .mk-sn i{display:none}.mk-signed{gap:3px 7px}}
.mk-vrows{display:flex;flex-direction:column;gap:7px}
.mk-vrow{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.mk-vrow .dip-al{flex:0 0 auto}
.mk-orig{color:#08131b!important;background:var(--ink-3)!important}
.mk-vs{display:flex;flex-wrap:wrap;gap:2px 10px;font-size:11.5px;color:var(--ink-2);font-weight:600}
.mk-vs i{font-style:normal;font-family:'Barlow Condensed','Inter Tight',sans-serif;font-weight:700;font-size:9.5px;letter-spacing:.06em;color:var(--ink-3);margin-right:4px}`
const names = (s, roles) => ROLES.map(([k, lbl]) => `<span class="mk-sn" title="${lbl}"><i>${roles ? lbl.replace(' BY', '') : ''}</i>${s[k]}</span>`).join('')

await headShot('head-today')
await page.evaluate(([DAY, CSS, cur, html]) => {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st)
  const d = document.querySelector(DAY), h = d.querySelector('.day-head')
  const line = document.createElement('div'); line.className = 'mk-signed'
  line.innerHTML = `<span class="mk-sl">Signed</span><span class="verchip" data-alc="${cur.n}">${cur.ver}</span>${html}`
  h.after(line)
}, [DAY, CSS, { ver: signs[2].ver, n: 2 }, names(signs[2].sign, true)])
await headShot('head-signed')

await page.locator(`${DAY} .dinfobtn`).first().click(); await page.waitForTimeout(600)
await page.evaluate(() => { const l = document.querySelector('.mk-signed'); if (l) l.style.visibility = 'hidden' })
await panelShot('panel-today')
await page.evaluate(([signs, namesHtml]) => {
  const body = document.querySelector('#dayPopBody'), als = body.querySelector('.dip-als')
  /* each amendment keeps the chip the app already draws for it ("AL1 · 1 item"); the Original gets a grey one */
  const chip = {}; for (const c of als.querySelectorAll('.dip-al[data-alc]')) chip[c.dataset.alc] = c.outerHTML
  const h = als.previousElementSibling; if (h && h.classList.contains('dip-h')) h.textContent = 'Published versions — who signed each'
  als.className = 'mk-vrows'
  als.innerHTML = signs.map((s, i) => `<div class="mk-vrow">${i ? (chip[i] || `<span class="dip-al" data-alc="${i}">${s.ver}</span>`) : '<span class="dip-al mk-orig">ORIG</span>'}<span class="mk-vs">${namesHtml[i]}</span></div>`).join('')
}, [signs, signs.map(s => names(s.sign, true))])

await panelShot('panel-signed')
console.log('errors', JSON.stringify(errors))
await browser.close()
