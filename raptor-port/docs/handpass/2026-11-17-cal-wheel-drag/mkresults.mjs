import { readFileSync, writeFileSync } from 'node:fs'
import { HERE } from './lib.mjs'
import path from 'node:path'
const { rows, counts, secs } = JSON.parse(readFileSync(path.join(HERE, 'pics-rows.json'), 'utf8'))
const esc = s => String(s).replace(/\|/g, '/').replace(/\n/g, ' ')
let md = `# Walk: calendar wheels moved by a mouse drag (D2170), 17 Nov 26\n\n`
md += `Build: this worktree's own build, served on port 4192 (stopped afterwards). Script: \`walk.mjs\` (+ \`lib.mjs\`), final run folder \`pics/\`, raw rows \`pics-rows.json\`.\n`
md += `Desktop world 1536x864 at 1.25 scale, no touch; phone world 390x844, isMobile, touch (CDP finger). Signed in as admin.\n\n`
md += `**Counts: ${JSON.stringify(counts)}**  Walk time: ${secs} s for the final full run (about ${Math.round(secs / 60)} min), plus earlier trial runs while fixing the script (selectors, case of month names, a month restore step).\n\n`
md += `Step key (desktop): A years drag up 132px, B months drag down 88px, C quick flick, D drag up 44px released sideways off the card, E plain click on the row below the band, F mouse wheel, G close wheels and finish as a person would. Phone: H finger up 100px (two pictures: ~100 ms after lift, and settled), G.\n\n`
md += `| # | Surface | Step | World | Result | Measured | Picture |\n|---|---|---|---|---|---|---|\n`
for (const r of rows) md += `| ${r.n} | ${esc(r.name)} | ${esc(r.step)} | ${r.wd} | ${r.status} | ${esc(r.detail)} | ${esc(r.pic)} |\n`
md += `\n## FAILs\n\nNone in the final run.\n\n## Not reached\n\nNone. All 12 surfaces were reached on both desktop and phone (surface 2 as three: the "Older than" date box, and the two clearing forms' run calendars; surface 11 as three: the open-bidding dates sheet, and the Post in and Post out sheet boxes).\n\n`
md += `## Notes for the reader (not faults)\n\n`
md += `- A quick flick (step C) glides on by a lot: +36 years from a 2-row flick on one run, between about +13 and +39 on others (it varies with timing). It always rests on a whole row and closes nothing. "Glides on further" is met; whether that distance feels right is for his hand to judge.\n`
md += `- Surfaces 3 and 4 (Inputs and SANS month titles): the chooser is a floating card over the page and the page's month turns live behind it as the wheels move, so the page's own box changes height by a few pixels with the month's number of weeks. The checked "host" is therefore the floating card, which did not move. Closing the chooser was done by a press on the veil (the title is covered), and the page then showed the month the wheels left it on.\n`
md += `- Surfaces 7 and 11 (od-range): a drag moves the month away from the dates the form accepts, so the wheels were wheeled back (mouse wheel) to the original month before step G. A day was then pressed normally.\n`
md += `- Desktop step D released the mouse over the veil/background in every case; no calendar, window or sheet closed or moved, and no date was picked.\n`
md += `- Picture caveat: 08-jump-date-G-result-*.png crops only the "Calendar" button (my crop selector was too loose); the week change itself is measured in the table (the week moved to the picked date). Every other picture was cropped to the calendar card, window or box named by its step.\n`
md += `- No console errors, page errors or 4xx responses were logged in any run (a failure there would appear as a row).\n`
writeFileSync(path.join(HERE, 'results.md'), md)
console.log(md.length)
