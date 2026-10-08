/* WALKER F — the editor window with Several people open, and a shared input on the month, at the other sizes the brief names:
   390x568 and 844x390 (a phone on its side), and the desktop month at 1536x864. */
import * as L from './cal-F-lib3.mjs'
const b = await L.launch()
const SIZES = [
  { tag: 'ph568', size: { width: 390, height: 568 }, phone: true },
  { tag: 'ph-side', size: { width: 844, height: 390 }, phone: true },
  { tag: 'dk1536', size: { width: 1536, height: 864 }, phone: false },
]
for (const S of SIZES) {
  const ctx = await L.newCtx(b, { phone: S.phone, size: S.size })
  const p = await L.newPage(ctx, S.tag)
  await L.signIn(p, 'ad')
  await L.go(p, 'inputs')
  await L.toastSpy(p)
  const P = L.press(p, S.phone)
  const [ace, anvil, basher] = await L.ids(p, ['Ace', 'Anvil', 'Basher'])
  const out = {}
  await L.openNew(p, '2026-07-21', { phone: S.phone })
  await p.selectOption('#inpEditType', 'Meeting')
  await L.pickSeveral(p, [ace, anvil, basher], { phone: S.phone })
  await L.setWhen(p, { allday: true, remarks: 'sizes one' })
  await L.pic(p, `${S.tag}-editor-several`)
  out.page = await p.evaluate(() => ({ pageSideways: document.documentElement.scrollWidth > innerWidth, win: (() => { const w = document.querySelector('[data-testid="win-inputedit"]'); const r = w.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), vw: innerWidth, vh: innerHeight } })() }))
  /* Save reachable: scroll the window's body to its end if needed, then ask what a finger lands on at Save's centre */
  const save = p.locator('#inpEditSave')
  await save.scrollIntoViewIfNeeded()
  out.saveHit = await save.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { landsOnSave: !!h && (h === e || e.contains(h)), box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth } })
  const had = await L.iidSet(p)
  await P(save); await L.sleep(800)
  const nr = await L.newRows(p, had)
  out.saved = nr.length
  await L.pic(p, `${S.tag}-after-save`)
  /* the month: one shared bar, nothing running off */
  if (await p.locator('[data-testid="win-inputsday-x"]').count()) await P(p.locator('[data-testid="win-inputsday-x"]'))
  await L.sleep(300)
  out.bar = await p.evaluate(() => [...document.querySelectorAll('#inpCal .ib-bar')].map(b => b.innerText.trim()).filter(t => /Meeting/.test(t) && /\+2/.test(t)))
  out.month = await p.evaluate(() => { const g = document.querySelector('[data-testid="ib-grid"]'); return { gridScroll: g ? g.scrollHeight > g.clientHeight + 1 : null, pageSideways: document.documentElement.scrollWidth > innerWidth } })
  await L.pic(p, `${S.tag}-month`)
  console.log(S.tag, JSON.stringify(out))
  L.judge('P6-sizes ' + S.tag, `editor window with Several people open and a three-man Meeting saved, at ${S.size.width}x${S.size.height}`, [
    ['nothing runs off sideways', !out.page.pageSideways && !out.month.pageSideways, out.page],
    ['the window lies inside the screen', out.page.win.l >= 0 && out.page.win.r <= out.page.win.vw && out.page.win.t >= 0 && out.page.win.b <= out.page.win.vh + 1, out.page.win],
    ['Save is reached (a finger lands on it) and files the three', out.saveHit.landsOnSave && out.saved === 3, { saveHit: out.saveHit, saved: out.saved }],
    ['the month shows ONE bar for the three', out.bar.length === 1, out.bar],
  ], [])
  await ctx.close()
}
console.log('errors', JSON.stringify(L.errors))
L.savePart('sizes')
await b.close()
