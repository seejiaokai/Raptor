export const L = await import('file:///C:/Users/User/projects/Raptor/.claude/worktrees/overnight-backlog-review-92da33/raptor-port/scripts/handpass/lib.mjs')
export const IMG = 'C:/Users/User/AppData/Local/Temp/claude/job3/walk/img'
/** draw red boxes (fixed, viewport coords) around the first visible match of each selector, then shoot.
    clipSel: element whose box (padded) is the picture; if absent a viewport shot. */
export async function snap(page, name, { marks = [], clip = null, pad = 14, scrollTo = null, full = false } = {}) {
  const tgt = scrollTo || clip || ((marks[0] && !marks[0].startsWith('txt:')) ? marks[0].replace(/^union:/, '').split(',')[0] : null)
  if (tgt) {
    const el = page.locator(tgt + ':visible').first()
    if (await el.count()) { await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await page.waitForTimeout(250) }
  }
  const found = await page.evaluate((marks) => {
    document.querySelectorAll('.__redbox').forEach(e => e.remove())
    const out = []
    for (const s of marks) {
      let els
      if (s.startsWith('txt:')) {
        const [root, t] = s.slice(4).split('::'); const re = new RegExp(t, 'i')
        const cands = [...document.querySelectorAll(root + ' *')].filter(e => re.test(e.innerText || '') && e.getBoundingClientRect().width > 2)
        els = cands.filter(e => ![...e.children].some(c => re.test(c.innerText || '')))
        if (!els.length) els = cands.slice(-1)
      } else els = [...document.querySelectorAll(s.replace(/^(union|rest):/, ''))]
      els = els.filter(e =>{ const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(e).visibility !== 'hidden' })
      const e = els[0]
      if (!e) { out.push(s + ' : NOT FOUND'); continue }
      let r = e.getBoundingClientRect()
      if (s.startsWith('rest:')) r = { left: r.right + 3, top: r.top, width: 76, height: r.height }
      if (s.startsWith('union:')) { const rs = els.map(x => x.getBoundingClientRect()); const l = Math.min(...rs.map(q => q.left)), t = Math.min(...rs.map(q => q.top)), rr = Math.max(...rs.map(q => q.right)), b = Math.max(...rs.map(q => q.bottom)); r = { left: l, top: t, width: rr - l, height: b - t } }
      const d = document.createElement('div'); d.className = '__redbox'
      d.style.cssText = `position:fixed;left:${r.left - 3}px;top:${r.top - 3}px;width:${r.width + 6}px;height:${r.height + 6}px;outline:3px solid red;pointer-events:none;z-index:2147483647;box-sizing:border-box`
      document.body.appendChild(d)
      out.push(s + ' : ok ' + Math.round(r.width) + 'x' + Math.round(r.height))
    }
    return out
  }, marks)
  let opts = { path: `${IMG}/${name}.png` }
  if (clip) {
    const box = await page.locator(clip + ':visible').first().boundingBox()
    const vp = page.viewportSize()
    if (box) {
      const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad)
      const w = Math.min(vp.width - x, box.width + 2 * pad), h = Math.min(vp.height - y, box.height + 2 * pad)
      opts.clip = { x, y, width: w, height: h }
    }
  }
  if (full) opts.fullPage = true
  await page.screenshot(opts)
  await page.evaluate(() => document.querySelectorAll('.__redbox').forEach(e => e.remove()))
  console.log('PIC', name, found.join(' ; '))
  return found
}
export async function sideWarn(page) {
  return page.evaluate(() => (document.querySelector('#sbSide')?.innerText || '').split('PLACEHOLDERS')[0].replace(/\s+/g, ' ').trim())
}
