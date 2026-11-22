/* msq-fr5-f1 v1 — F1: every sign-in's bell in a fresh world (empty state), desktop or phone (FR5_PHONE=1) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f1'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep, row } = H
say('msq-fr5-f1 v1')
const phone = process.env.FR5_PHONE === '1'
const size = phone ? 'iPhone' : 'desktop'
const names = { ad: 'Saber', ad2: 'Hunter', us: 'Ranger', ad9: 'Kestrel', us9: 'Osprey' }
const vis = loc => loc.first().isVisible().catch(() => false)
const tapIt = async loc => { if (phone) await loc.tap(); else await loc.click() }
for (const u of Object.keys(names)) {
  try {
    const w = await X.open({ phone, user: u })
    const p = w.page
    await X.pic(w, `f1-${u}-topbar`)
    const bell = p.locator('#notifyBell:visible').first()
    const dot0 = await p.evaluate(() => { const d = document.querySelector('#notifyBell .belldot'); if (!d) return 'no dot'; const cs = getComputedStyle(d); const r = d.getBoundingClientRect(); return `display ${cs.display} w ${Math.round(r.width)} vis ${cs.visibility} cls ${d.className}` })
    const cls0 = await bell.getAttribute('class')
    await tapIt(bell); await sleep(900)
    const list = p.locator('[data-testid="bell-list"]')
    const open = await vis(list)
    const words = await list.innerText().catch(() => '')
    const lines = await p.locator('[data-testid="bell-list"] [data-testid^="bell-"]').count()
    await X.pic(w, `f1-${u}-open`)
    row('F1', size, `${u} ${names[u]}: fresh world, open the bell`, 'opens; lines or the empty state; dot matches', `open ${open}; words "${words.replace(/\s+/g, ' ')}"; line-ish elements ${lines}; bell class "${cls0}"; dot ${dot0}`, open ? 'PASS' : 'FAIL', `f1-${u}-open.png`)
    await tapIt(bell); await sleep(600)
    const c1 = !(await vis(list))
    await X.pic(w, `f1-${u}-closed-bell`)
    row('F1', size, `${u}: close the bell with its own control`, 'closes', `still shown ${!c1}`, c1 ? 'PASS' : 'FAIL', `f1-${u}-closed-bell.png`)
    await tapIt(bell); await sleep(700)
    if (phone) await p.touchscreen.tap(200, 780); else await p.mouse.click(700, 600)
    await sleep(700)
    const c2 = !(await vis(list))
    await X.pic(w, `f1-${u}-closed-outside`)
    row('F1', size, `${u}: reopen, tap outside`, 'closes', `still shown ${!c2}`, c2 ? 'PASS' : 'FAIL', `f1-${u}-closed-outside.png`)
    say('errors', u, JSON.stringify(w.errors))
    await w.browser.close()
  } catch (e) { say('ERR', u, e.message.split('\n')[0]); row('F1', size, u + ' script', 'completes', e.message.split('\n')[0], 'OWED', '') }
}
X.saveRows(); say('DONE')
