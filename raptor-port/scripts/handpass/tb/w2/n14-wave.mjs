/* W2 N14 — add a standby wave (SC), flip a line MAIN/SPARE twice.  node n14-wave.mjs */
import { L, openBoard, sleep, clearToast, toastShown, toastNow } from './w2lib.mjs'
console.log('n14-wave v1')
const w = await L.world('desk')
const p = w.page
const DI = 1
try {
  await openBoard(w, DI)
  const b = p.locator(`#schedBoard [data-wvadd="${DI}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  await w.press(b); await sleep(500)
  await clearToast(p)
  await w.press('.wm[data-wmkind="sc"]:visible')
  const t = await toastShown(p)
  const want = 'SC added: standalone,'
  console.log(`== N14 add wave ${t && t.text.startsWith(want) ? 'PASS' : 'FAIL'}\n   want begins ${JSON.stringify(want)}\n   saw  ${JSON.stringify(t && t.text)}`)
  await sleep(500)
  await L.pic(w, 'n14-desk-sc-added')
  const badges = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard span, #schedBoard [data-lmain], #schedBoard [data-lspare]')].filter(e => e.getBoundingClientRect().width > 0 && e.children.length === 0 && /^(MAIN|SPARE)$/i.test((e.textContent || '').trim())).map(e => `${e.tagName}.${String(e.className).slice(0, 20)}|${e.textContent.trim()}|${[...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')}`))
  console.log('badges:\n' + badges.join('\n'))
  if (badges.length) {
    const sel = await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard button, #schedBoard span')].find(e => e.getBoundingClientRect().width > 0 && e.children.length === 0 && /^(MAIN|SPARE)$/i.test((e.textContent || '').trim())); if (!e) return null; const a = [...e.attributes].find(a => a.name.startsWith('data-')); return a ? `#schedBoard [${a.name}="${a.value}"]` : null })
    console.log('badge selector', sel)
    for (const n of [1, 2]) {
      const el = p.locator(sel).first()
      await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
      await clearToast(p)
      await w.press(el)
      const t2 = await toastShown(p)
      await sleep(300)
      const pic = await L.pic(w, `n14-desk-badge-press-${n}`)
      console.log(`   press ${n}: ${JSON.stringify(t2 && t2.text)} opacity ${t2 && t2.opacity} pic ${pic}`)
    }
  }
} finally { await L.close(w) }
