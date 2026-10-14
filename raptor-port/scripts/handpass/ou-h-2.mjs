/* helper walk: exploration — the classes of the pending chip, the sign-off strip, the bell (prints only) */
import { L, J, publish, file, mark, board, closeBoard } from './ou-h-0.mjs'
const w = await L.world('desk'), p = w.page
try {
  const A = await file(w, '2026-07-17', 'bane', 'Range brief')
  await board(w, 4)
  await publish(p, 4)
  await closeBoard(w)
  await mark(w, 4, A.id, 'cx')
  await board(w, 4)
  const r = await p.evaluate(() => {
    const out = []
    for (const e of document.querySelectorAll('#schedBoard *')) {
      if (e.children.length > 3) continue
      const t = (e.textContent || '').replace(/\s+/g, ' ').trim()
      if (/pending|to sign|Not yet signed|^SIGNED|Live working copy/i.test(t) && t.length < 90 && e.getClientRects().length) out.push(`${e.tagName.toLowerCase()}#${e.id}.${String(e.className).slice(0, 40)}[${[...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' ')}] "${t}"`)
    }
    const bells = [...document.querySelectorAll('button')].filter(b => /bell|🔔|notif/i.test((b.id + b.className + (b.getAttribute('aria-label') || '') + b.title))).map(b => `${b.id}.${String(b.className).slice(0, 30)} "${(b.getAttribute('aria-label') || b.title)}" vis=${b.getClientRects().length}`)
    const lo = [...document.querySelectorAll('button')].filter(b => /log ?out|sign out/i.test(b.textContent + b.id + b.title + (b.getAttribute('aria-label') || ''))).map(b => `${b.id} "${b.textContent.trim()}"`)
    return { out, bells, lo }
  })
  console.log(J(r, null, 1).slice(0, 4000))
  console.log(r.out.join('\n')); console.log(r.bells.join('\n')); console.log(r.lo.join('\n'))
} finally { await L.close(w) }
