/* msq-w1-util v1 — W1's shared reading helpers (visible text, ids, day state) */
export const bodyText = async page => (await page.evaluate(() => {
  const out = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    const e = n.parentElement
    if (!e || !n.nodeValue.trim() || ['SCRIPT', 'STYLE'].includes(e.tagName)) continue
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
    if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none') continue
    out.push(n.nodeValue)
  }
  for (const s of document.querySelectorAll('select')) if (s.offsetWidth > 1) out.push([...s.options].map(o => o.text).join(' '))
  for (const i of document.querySelectorAll('input,textarea')) if (i.value && i.offsetWidth > 1) out.push(i.value)
  return out.join(' ')
})).replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
export const pidOf = (page, cs) => page.evaluate(c => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === c)?.[0] || null, cs)
export const groundNames = (page, di) => page.evaluate(i => (window.DAYS[i].ground || []).map(g => g.prog), di)
export const dayKeys = page => page.evaluate(() => Object.keys(window.DAYS[2]).join(','))
export const groundFull = (page, di) => page.evaluate(i => (window.DAYS[i].ground || []).map(g => g.prog + '=' + (Array.isArray(g.who) ? g.who.join('+') : g.who || '')), di)
