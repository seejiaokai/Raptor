/* WALKER C, script 3: H-05 (S02's fixture) and S29 (the ALL AVAIL window). Usage: node scripts/handpass/bta-C-3.mjs [h05|s29|all] */
import * as X from './bta-C-lib.mjs'
const { B, K, W, L, R, ID, CSN, MON, TUE, WED, pic, sleep } = X
const which = process.argv[2] || 'all'

/* a seat's puck as painted, on a surface */
async function seatPuck(p, root, key) {
  return p.evaluate(([r, k, who]) => {
    const host = document.querySelector(`${r} [data-slot="${k}"]`) || document.querySelector(`${r} [data-fill="${k}"]`)
    if (!host) return { found: false }
    const e = host.querySelector(`.puck[data-person="${who}"]`) || host.closest('.seat')?.querySelector(`.puck[data-person="${who}"]`)
    if (!e) return { found: true, puck: false, host: (host.innerText || '').trim().slice(0, 40) }
    const cs = getComputedStyle(e), chip = e.querySelector('.lchip'), sh = cs.boxShadow
    const ln = (sh || '').match(/-?[0-9.]+px/g) || []
    return { found: true, puck: true, solid: !!sh && sh !== 'none' && ln.length >= 4 && parseFloat(ln[3]) >= 1.5 && parseFloat(ln[0]) === 0, shadow: sh === 'none' ? '' : sh.slice(0, 90), chip: chip ? chip.innerText.trim() : '', cls: String(e.className).split(' ').filter(Boolean).join(' ').slice(0, 120) }
  }, [root, key, ID])
}
const say = s => !s.found ? 'seat not drawn' : !s.puck ? `no puck (${s.host})` : `${s.solid ? 'SOLID RING' : 'no ring'}${s.chip ? ', chip ' + s.chip : ', no chip'} [${s.cls}]`
const absLines = async (p, di) => (await X.fullWarnsX(p, di)).map(w => `${w.sev}/${w.code}: ${w.msg.slice(0, 150)}`)

async function h05() {
  const { browser, p, errors } = await K.fresh()
  try {
    const f = await X.fileInput(p, { type: 'LL', di: TUE, allday: true, remarks: 'Wedding' })
    const sc = await K.addStandby(p, TUE, 'sc')
    await K.ff(p, TUE, sc.gi, 0, 'to', ''); await K.ff(p, TUE, sc.gi, 0, 'ld', '')
    const kM = X.key(TUE, sc.gi, 0, 0), kS = X.key(TUE, sc.gi, 0, 2)
    const a = await K.seat(p, TUE, sc.gi, 0, 0, 'p', ID)
    const b = await K.seat(p, TUE, sc.gi, 0, 2, 'p', ID)
    const rec = async (tag, label) => {
      await K.boardTo(p, TUE)
      const m = await seatPuck(p, '#schedBoard', kM), s = await seatPuck(p, '#schedBoard', kS)
      await p.locator(`#schedBoard [data-slot="${kS}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
      const shot = await pic(p, tag + '-board')
      const lines = await absLines(p, TUE)
      /* the week card too */
      await B.toEdit(p); await W.showDay(p, TUE)
      const wm = await seatPuck(p, `#eWeek .day[data-day="${TUE}"]`, kM), ws = await seatPuck(p, `#eWeek .day[data-day="${TUE}"]`, kS)
      await p.locator(`#eWeek .day[data-day="${TUE}"] [data-slot="${kS}"], #eWeek .day[data-day="${TUE}"] [data-fill="${kS}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(250)
      const shot2 = await pic(p, tag + '-week')
      R(`H-05.${label}`, `${CSN} in MAIN (${kM}, took ${a.took}) and SPARE (${kS}, took ${b.took}) of ONE SC formation, local leave all day Tuesday (filed ${f.iid ? 'yes' : 'no'}); shift now: ${await X.shiftNow(p, TUE, sc.gi)}`,
        `board: MAIN puck ${say(m)}; SPARE puck ${say(s)} · week card: MAIN ${say(wm)}; SPARE ${say(ws)} · his warnings: ${JSON.stringify(lines)}`, 'RECORDED', [shot, shot2])
    }
    await rec('h05-blank', 'blank')
    await K.ff(p, TUE, sc.gi, 0, 'to', '13:00'); await K.ff(p, TUE, sc.gi, 0, 'ld', '19:00')
    await rec('h05-typed', 'typed')
    await K.ff(p, TUE, sc.gi, 0, 'to', ''); await K.ff(p, TUE, sc.gi, 0, 'ld', '')
    await rec('h05-cleared', 'cleared-again')
  } catch (e) { R('H-05', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h05-X')]) }
  R('H-05.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* the ALL AVAIL window as a person reads it */
const win = p => p.evaluate(() => {
  const w = document.querySelector('.availwin:not([hidden])')
  if (!w) return { open: false }
  const P = window.PEOPLE
  return { open: true, title: (w.querySelector('.win-ttl')?.innerText || '').replace(/\s+/g, ' ').trim(), tabs: [...w.querySelectorAll('.win-tab')].map(t => t.textContent.trim() + (t.classList.contains('on') ? ' [on]' : '')),
    one: (w.querySelector('.win-one')?.textContent || '').trim(), lost: (w.querySelector('.win-lost')?.textContent || '').trim(), from: (w.querySelector('.win-from')?.textContent || '').trim(), foot: (w.querySelector('.win-foot')?.textContent || '').trim(),
    rows: [...w.querySelectorAll('.rpuck')].map(x => ({ id: x.dataset.awp, cs: (P[x.dataset.awp] || {}).cs, flag: x.classList.contains('clash') ? 'RED' : x.classList.contains('flagged') ? 'AMBER' : '', why: (x.querySelector('.rwhy')?.textContent || '').slice(0, 200) })) }
})

async function s29(type) {
  const { browser, p, errors } = await K.fresh()
  try {
    const f = type === 'none' ? { iid: null, asked: [] } : await X.fileInput(p, { type, di: TUE, allday: true, remarks: 'Full-day' })
    const m = await K.addFlyWave(p, TUE)
    const s = await K.seat(p, TUE, m.gi, 0, 0, X.SEAT, ID)
    const mine = (await X.fullWarnsX(p, TUE)).filter(w => /clash|but planned|tasked/i.test(w.msg)).map(w => `${w.sev}/${w.code}: ${w.msg.slice(0, 160)}`)
    R(`S29.${type}.0`, `${CSN}: ${type} all Tuesday filed (iid ${f.iid}, asked ${f.asked.join(',') || 'nothing'}); "+ Wave" → flying wave, he is seated on its blank line (took ${s.took})`, `his warnings: ${JSON.stringify(mine)}`, mine.length ? 'PASS' : 'FAIL', [])
    const g = await X.groundRow(p, TUE, 'LATER BRIEF', '15:00', '16:00', false)
    const rid = await p.evaluate(([i, r]) => (window.DAYS[i].ground[r] || {}).rid || null, [TUE, g.ri])
    const put = await K.handPut(p, `g:${TUE}.${g.ri}.+`, 'allavail')
    await K.boardTo(p, TUE)
    const chip = p.locator(`#schedBoard [data-oilsent="r:${rid}"]:visible`).first()
    const chips = await chip.count()
    if (!chips) { R(`S29.${type}.1`, `a Ground Programme row LATER BRIEF 15:00–16:00 with ALL AVAIL placed (took ${put.took}, msg ${put.msg || ''}); looking for its count chip`, 'no chip drawn for the row', 'NOT WALKED', [await pic(p, `s29-${type}-nochip`)]); throw new Error('no chip') }
    await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    const chipTxt = (await chip.innerText()).trim(); const chipTitle = await chip.getAttribute('title')
    await chip.click(); await sleep(500)
    const w = await win(p)
    const shot = await pic(p, `s29-${type}-window`)
    const me = w.rows.find(r => r.id === ID)
    R(`S29.${type}.1`, `ALL AVAIL placed on the 15:00–16:00 Ground Programme row (took ${put.took}); its count chip "${chipTxt}" (title "${(chipTitle || '').slice(0, 100)}") pressed → the window`,
      `window "${w.title}" tabs ${JSON.stringify(w.tabs)} · note "${w.one || w.lost}" · rows ${w.rows.length}: his row ${me ? `flag ${me.flag || 'none'}, reason "${me.why}"` : 'NOT IN THE CROWD'} · flagged rows ${w.rows.filter(r => r.flag).map(r => r.cs + ':' + r.flag).join(', ') || 'none'} · foot "${w.foot}"`,
      me ? (me.flag ? 'PASS' : 'FAIL') : 'PARTIAL', [shot])
    if (me) {
      await p.locator(`.availwin .rpuck[data-awp="${ID}"] .puck`).first().click({ timeout: 4000 }).catch(() => {}); await sleep(400)
      const w2 = await win(p)
      const toast = await X.toastNow(p)
      R(`S29.${type}.2`, `his row in the window tapped`, `foot "${w2.foot}" · toast ${toast ? '"' + toast.slice(0, 200) + '"' : 'none'} · the day's warnings naming him: ${JSON.stringify(mine)}`, w2.foot || toast ? 'RECORDED' : 'RECORDED', [await pic(p, `s29-${type}-tapped`)])
    }
  } catch (e) { R(`S29.${type}`, 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s29-${type}-X`)]) }
  R(`S29.${type}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 'h05' || which === 'all') await h05()
if (which === 's29' || which === 'all') { await s29('Meeting'); }
if (which === 's29n') await s29('none')
if (which === 's29t') for (const t of ['Training', 'Appointment', 'Personal', 'Other']) await s29(t)
B.savePart('bta-C-3-' + which)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
