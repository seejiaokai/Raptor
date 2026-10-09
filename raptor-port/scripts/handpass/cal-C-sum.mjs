import { readFileSync } from 'node:fs'
const j = JSON.parse(readFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/cal-C-windows.json', 'utf8'))
const sz = process.argv[2] || 'desk'
for (const [k, r] of Object.entries(j)) { if (!k.endsWith('|' + sz)) continue
  const c = r.close || {}
  console.log(k.split('|')[0].padEnd(42), r.error ? ('ERROR ' + r.error) : '', 'centreIn=' + (r.hit && r.hit.centreInside), 'covBtn=' + (r.hit && r.hit.buttonsCovered.length) + '/' + (r.hit && r.hit.buttons), 'drag=' + (r.drag && (r.drag.na ? 'n/a' : r.drag.followed + (r.drag.moved ? ' ' + JSON.stringify(r.drag.moved) : ''))), 'pgScroll=' + (r.drag && r.drag.pageScrolled), 'bg=' + (r.bg ? (r.bg.found === false ? 'nofound' : (r.bg.reachable + '/chg:' + r.bg.changed)) : '-'), 'esc=' + [c.escapeWithFocusOnPage, c.escapeWithFocusInWindow, c.escapeAfterFocusingTheWindow, c.cross].join(','))
}
