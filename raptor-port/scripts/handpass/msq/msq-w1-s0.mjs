/* msq-w1-s0 v1 — S0 the five faces. usage (from raptor-port/): [PHONE=1] node scripts/handpass/msq/msq-w1-s0.mjs */
const PHONE = process.env.PHONE === '1'
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 's0-' + (PHONE ? 'p' : 'd')
const X = await import('./msq-lib.mjs')
const { say, sleep, row, nrm } = X
say('msq-w1-s0 v1', PHONE ? 'phone' : 'desktop')
const SZ = PHONE ? 'phone' : 'desktop'
const N149 = ['Kestrel', 'Falcon', 'Osprey', 'Heron', 'Merlin', 'Raven', 'Harrier', 'Shrike', 'Gannet', 'Condor']
const N142 = ['Saber', 'Ranger', 'Echo', 'Static', 'Prowler']
const w = await X.open({ phone: PHONE, user: null })
const { page } = w
const body = async () => nrm(await page.evaluate(() => {
  // visible text only (boxes wider than zero)
  const out = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    const e = n.parentElement
    if (!e || !n.nodeValue.trim()) continue
    if (['SCRIPT', 'STYLE'].includes(e.tagName)) continue
    const r = e.getBoundingClientRect()
    const cs = getComputedStyle(e)
    if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none') continue
    out.push(n.nodeValue)
  }
  for (const s of document.querySelectorAll('select')) if (s.offsetWidth > 1) out.push([...s.options].map(o => o.text).join(' '))
  for (const i of document.querySelectorAll('input,textarea')) if (i.value && i.offsetWidth > 1) out.push(i.value)
  return out.join(' ')
}))
const has = (t, names) => names.filter(n => new RegExp('\\b' + n + '\\b', 'i').test(t))
const USERS = ['ad', 'ad2', 'us', 'ad9', 'us9']
const home = u => (u === 'ad9' || u === 'us9') ? 149 : 142
let first = true
for (const u of USERS) {
  if (!first) {
    let so
    if (PHONE) {
      const before = w.loads
      const menu = page.locator('button[aria-label*="enu" i]:visible, .hamb:visible, [data-drawer]:visible').first()
      await menu.tap(); await sleep(500)
      await X.pic(w, `menu-open-before-${u}`)
      await page.getByRole('button', { name: /sign out|log ?out/i }).first().tap()
      await page.waitForSelector('#luser', { timeout: 20000 }); await sleep(800)
      so = { reloaded: w.loads > before }
    } else so = await X.signOut(w)
    row('S0', SZ, 'Logout before ' + u, 'reloaded true', JSON.stringify(so), so.reloaded ? 'PASS' : 'FAIL')
  }
  first = false
  await X.login(w.page, u)
  const isAdmin = u.startsWith('ad')
  const mine = home(u) === 149 ? N149 : N142
  const other = home(u) === 149 ? N142 : N149
  const pages = isAdmin ? ['editsched', 'inputs', 'quals', 'leavewar', 'tracker'] : ['viewsched', 'inputs', 'quals', 'leavewar', 'tracker']
  for (const p of pages) {
    await X.L.go(page, p); await sleep(p === 'leavewar' || p === 'tracker' ? 2500 : 1200)
    if (PHONE && p === 'inputs') {
      const lst = page.locator('button[aria-label*="ist" i]:visible, [data-view="list"]:visible').first()
      if (await lst.count()) { await lst.tap(); await sleep(900) }
      const fl = page.locator('button[aria-label*="ilter" i]:visible, button[title*="ilter" i]:visible').first()
      if (await fl.count()) { await fl.tap(); await sleep(900) } else say('NO FILTER BUTTON')
    }
    const t = await body()
    const pn = await X.pic(w, `${u}-${p}`)
    const seen = has(t, mine), bad = has(t, other)
    const top = nrm((t.match(/\b[A-Z]+ · (ADMIN|MEMBER)/) || [''])[0])
    row('S0 ' + p, SZ, `${u} (${top}) on ${p}: own-squadron names seen / other-squadron names seen`,
      `no ${home(u) === 149 ? '142' : '149'} names`, `own: ${seen.join(',') || '-'}; other: ${bad.join(',') || '-'}`,
      bad.length === 0 && (seen.length > 0 || p === 'tracker' || p === 'leavewar') ? 'PASS' : 'FAIL', `${u}-${p}.png`)
    if (p === 'tracker') {
      if (PHONE) { const info = page.getByRole('button', { name: /^\s*Info/ }).first(); if (await info.count()) { await info.tap(); await sleep(800) } }
      const add = page.getByRole('button', { name: /^\s*\+\s*Add/ }).first()
      if (await add.count()) {
        if (PHONE) await add.tap(); else await add.click()
        await sleep(800)
        const t2 = await body()
        await X.pic(w, `${u}-tracker-add`)
        const b2 = has(t2, other), s2 = has(t2, mine)
        row('S0 tracker + Add', SZ, `${u} opens + Add`, 'only own-squadron names', `own: ${s2.join(',') || '-'}; other: ${b2.join(',') || '-'}`, b2.length === 0 ? 'PASS' : 'FAIL', `${u}-tracker-add.png`)
        const close = page.getByRole('button', { name: /close|cancel|✕|×/i }).last()
        if (await close.count()) { if (PHONE) await close.tap().catch(() => {}); else await close.click().catch(() => {}) } else await page.keyboard.press('Escape')
        await sleep(500)
      } else row('S0 tracker + Add', SZ, u + ' look for + Add', 'a + Add control', 'not found', 'BLOCKED', `${u}-tracker.png`)
    }
  }
}
await X.fin(w)
