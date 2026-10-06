/* Walker D — S37 (member part): reading the published face as the member, filing the member's own input, attempting another person's input and a schedule edit. */
import * as D from './bta-D-lib.mjs'
const { B, K, C, W, L, TUE, ID, CSN, sleep } = D
const R = K.R
const T = 'S37'
const { browser, p, errors } = await K.fresh()
const nav = () => p.evaluate(() => ({ page: window.CURPAGE, tabs: [...document.querySelectorAll('#topnav button, #topnav a, nav button')].filter(b => b.offsetParent !== null).map(b => b.innerText.trim()).filter(Boolean).slice(0, 14) }))
try {
  /* admin: a day published WITH the warning, then the leave lifted (so the working copy differs from the face) */
  const f = await D.file(p, 'LL', 'Walker D'); const s0 = await D.seatBlank(p); await D.pub(p)
  const wk = await D.work(p, 'dk-s37-0-admin', { puck: false })
  const lf = await D.lift(p, f.iid)
  const w2 = await D.work(p, 'dk-s37-1-admin', { puck: false })
  R(`${T}.0`, `admin: LL for ${CSN} filed, ${CSN} on a blank line, Tuesday published, then the leave lifted`, `WORKING: ${D.sayCard(w2)}`, 'RECORDED', [w2.shot])

  /* the member reads */
  await B.reloadAs(p, 'm'); await sleep(500)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'viewsched') await L.go(p, 'viewsched')
  const n1 = await nav()
  const mf = await D.card(p, '#vWeek', TUE, 'dk-s37-2-member-face', { puck: true })
  const buttons = await p.evaluate(i => ({ woff: document.querySelectorAll(`#vWeek .day[data-day="${i}"] [data-woff]`).length, sign: document.querySelectorAll(`#vWeek .day[data-day="${i}"] select[data-sign]`).length, pub: document.querySelectorAll(`#vWeek .day[data-day="${i}"] [data-beak], #vWeek .day[data-day="${i}"] [data-alpub]`).length }), TUE)
  const dinfo = await B.dayInfo(p, '#vWeek', TUE, 'dk-s37-2-member-dayinfo')
  R(`${T}.1`, `signed in as the member (us / Ranger): View-only Sched, Tuesday's published face`, `top bar ${JSON.stringify(n1)} · FACE: ${D.sayCard(mf)} · write doors drawn in the day: ${JSON.stringify(buttons)} · ⓘ day details: ${dinfo.err ? dinfo.err : B.infoShort(dinfo)}`,
    mf.lines.length === 1 && mf.ring && buttons.woff === 0 && buttons.sign === 0 && buttons.pub === 0 ? 'PASS' : 'FAIL', [mf.shot, mf.pshot, dinfo.shot].filter(Boolean))

  /* the member's OWN input */
  const before = await D.inputsOf(p)
  let own = null, fileErr = null
  try { own = await D.fileInput(p, { person: null, type: 'LL', di: 2, allday: true, remarks: 'Member own' }) } catch (e) { fileErr = String(e).slice(0, 200) }
  const after = await D.inputsOf(p)
  const added = after.filter(x => !before.includes(x))
  const pgPic = await B.pic(p, 'dk-s37-3-member-own-input')
  R(`${T}.2`, `the member files an LL for Wednesday on the Inputs page`, `new rows: ${JSON.stringify(added)} · ${fileErr || ''} · page "${await p.evaluate(() => window.CURPAGE)}"`, added.length === 1 && /bane/.test(added[0]) ? 'PASS' : 'FAIL', [pgPic])
  const mf2 = await D.face(p, 'dk-s37-3b-member-face', { puck: false })
  R(`${T}.2b`, "Tuesday's face after the member's own filing", D.sayCard(mf2), mf2.lines.length === 1 && mf2.ring ? 'PASS' : 'FAIL', [mf2.shot])

  /* another person's input */
  await L.go(p, 'inputs'); await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  const btn = p.locator('#inRangeBtn'); if ((await btn.getAttribute('aria-expanded')) !== 'true') { await btn.click(); await sleep(300) }
  await p.locator('#inRangeAll').click().catch(() => {}); await sleep(500)
  const rows = await p.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => ({ iid: t.dataset.iid, person: ((window.INPUTS.find(x => x.iid === t.dataset.iid)) || {}).person, who: (t.querySelector('td') || t).innerText.replace(/\s+/g, ' ').trim().slice(0, 40), rmx: !!t.querySelector('.rmx'), edit: !!t.querySelector('[data-edit]') })))
  const mine = rows.filter(r => /bane/i.test(r.iid) || false)
  const ownRow = added.length ? rows.find(r => added[0].startsWith(r.iid)) : null
  const others = rows.filter(r => r.person !== 'bane')
  const othersWithDoors = others.filter(r => r.rmx || r.edit)
  R(`${T}.3`, `the member looks for a way to change or remove someone else's input on the Inputs page`, `rows listed: ${rows.length} (people on them: ${JSON.stringify(rows.map(r => r.person))}; the whole demo world holds ${await p.evaluate(() => window.INPUTS.length)} inputs) · the member's own new row has ✕: ${ownRow ? ownRow.rmx : 'n/a'}, edit: ${ownRow ? ownRow.edit : 'n/a'} · other people's rows with a ✕ or edit pen: ${othersWithDoors.length} of ${others.length}`, ownRow && ownRow.rmx && othersWithDoors.length === 0 ? 'PASS' : (othersWithDoors.length ? 'FAIL' : 'PARTIAL'), [await B.pic(p, 'dk-s37-4-member-inputs-table')])

  /* a schedule edit */
  const before2 = await p.evaluate(() => JSON.stringify(window.DAYS[1].waves.map(w => w.label)))
  const topTabs = await nav()
  await p.evaluate(() => window.go('editsched')).catch(() => {}); await sleep(700)
  const pg = await p.evaluate(() => window.CURPAGE)
  const editVisible = await p.locator('#eWeek:visible').count()
  let boardTry = 'not tried'
  await p.evaluate(() => { try { window.openScheduler(1) } catch (e) {} }).catch(() => {}); await sleep(700)
  const boardOn = await p.locator('#schedBoard:visible').count()
  const wvadd = await p.locator('[data-wvadd]:visible').count()
  /* and a real try at typing into the first line's callsign box and putting a man on a seat */
  const cs0 = await p.evaluate(() => window.DAYS[1].waves[0].formations[0].cs)
  let typed = 'no box to type in'
  try {
    const box = p.locator('#schedBoard [data-bfld="ff:1.0.0.cs"]:visible, #eWeek [data-txt="ff:1.0.0.cs"]:visible').first()
    if (await box.count()) { await box.click({ timeout: 2500 }); await p.keyboard.press('Control+A'); await p.keyboard.type('ZZ', { delay: 10 }); await box.evaluate(e => e.blur()); await sleep(500); typed = 'typed ZZ' }
  } catch (e) { typed = 'could not type: ' + String(e).slice(0, 80) }
  const cs1 = await p.evaluate(() => window.DAYS[1].waves[0].formations[0].cs)
  const after2 = await p.evaluate(() => JSON.stringify(window.DAYS[1].waves.map(w => w.label)))
  R(`${T}.4`, `the member tries to reach Edit Schedule (the page and the board) to change the schedule`, `top bar ${JSON.stringify(topTabs.tabs)} (no Edit Schedule tab) · after the probe's go("editsched") the page is "${pg}", Edit Schedule week drawn: ${editVisible > 0}, board opened: ${boardOn > 0}, "+ Wave" doors drawn: ${wvadd} · a try at typing a callsign: ${typed}; first line's callsign before/after: "${cs0}" / "${cs1}" · Tuesday's waves before/after: ${before2 === after2 ? 'unchanged' : before2 + ' → ' + after2}`, cs0 === cs1 && before2 === after2 ? 'RECORDED' : 'FAIL', [await B.pic(p, 'dk-s37-5-member-edit-attempt')])
} catch (e) { R(T, 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await B.pic(p, 's37-X')]) }
R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('bta-D-s37')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 2400)}\n      pics ${(r.pics || []).join(' ')}`)
