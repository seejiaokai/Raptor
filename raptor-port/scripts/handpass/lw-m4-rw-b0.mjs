// Re-walk walker B, explore: the DOM of the tab row and one Approvals line on a phone (no assertions).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot } = B
console.log('[lw-m4-rw-b0 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
await B.signIn(w, 'admin')
await B.openApprovals(w, 'x0-open')
const info = await P.evaluate(() => {
  const dump = (el, d = 0) => { const r = el.getBoundingClientRect(); return '  '.repeat(d) + el.tagName.toLowerCase() + (el.dataset.testid ? '#' + el.dataset.testid : '') + '.' + String(el.className).slice(0, 40) + ` [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] ` + (el.children.length ? '' : JSON.stringify(el.textContent.slice(0, 30))) + '\n' + [...el.children].map(c => dump(c, d + 1)).join('') }
  const tab = document.querySelector('[data-testid="lw-tab-approvals"]')
  const line = document.querySelector('[data-testid^="appr-line-"]')
  const pg = document.querySelector('[data-testid="approvals-page"]')
  return { tab: dump(tab.parentElement), line: dump(line), lines: [...document.querySelectorAll('[data-testid^="appr-line-"]')].map(e => e.dataset.testid + ' ' + e.innerText.replace(/\s+/g, ' ')).join('\n'), head: dump(pg.firstElementChild) }
})
console.log(info.tab); console.log(info.head); console.log(info.line); console.log(info.lines)
await w.ctx.close(); await B.closeAll()
