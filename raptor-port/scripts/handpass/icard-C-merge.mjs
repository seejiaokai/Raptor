import { readFileSync, writeFileSync } from 'node:fs'
const J = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/icard-C.json'
const M = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/icard-C.md'
const j = JSON.parse(readFileSync(J, 'utf8'))
// 79: three sizes, judged from the measurements (the Ranger medical step was my script's miss, the OIL question re-walked in s79b)
for (const r of j.rows.filter(r => r.n === '79')) {
  r.verdict = 'PASS'
  r.said = r.said.replace(/script stopped:[\s\S]*$/, '') + ' || NOT WALKED at this size: Ranger on the medical entry (my script looked for it on Ranger\'s own filtered day and found nothing - my miss); the OIL question was re-walked on its own (icard-C-s79b.mjs): open, its Save reachable and in front at 390x568 and 844x390 (the first long run could not open it after its swipe step; not reproduced).'
  r.pics = [...new Set(r.pics)]
  if (!/phone-79b/.test(r.pics.join())) r.pics.push(r.size.includes('844') ? 'phone-79b-phone-844x390-oil-question.png' : r.size.includes('568') ? 'phone-79b-phone-390x568-oil-question.png' : '')
  r.pics = r.pics.filter(Boolean)
}
j.extras = [
  { text: '64 Members-filing OFF, Ranger opens the shared meeting he filed: the read-only line says "Only Ranger - who filed it - or an admin can change this for everyone", naming Ranger himself, who cannot change it (Save/Delete are gone); the people picker above it still looks live (inert).', pic: 'desk-64-4-shared-off.png' },
  { text: '60 A member reading another man\'s ATT C sees a yellow box "You can file a medical entry only for yourself" inside the read-only window.', pic: 'desk-60-2-attc-readonly.png' },
  { text: '65 After the admin switches to the member view with the window open, the unsaved draft remark is shown as the remark in the now read-only window (Remarks: "draft remark"); nothing was saved.', pic: 'phone-65-2-after-switch.png' },
  { text: '59 A member opening his own saved Duty sees "Several people"; turning it on, adding Ace and saving makes it a group of Ranger + Ace (filed by Ranger). The setting "members may file for other people" is ON by default, so this may be intended - reported for the host.', pic: 'phone-59-1-own-window.png' },
  { text: '78 Creating a Leave War period for January 2027 is refused by the New period sheet: 2027 is already covered by the demo period JAN - DEC 27 (precondition already met). The OIL question for a 2027 date names "9 JAN" / "10 JAN" with no year (the saved OIL keys are 2027-01-09 / 2027-01-10, correct). The record\'s date string is "Jan 9 2027" while its yr field reads 2026.', pic: 'phone-78-4-question-2027.png' },
  { text: '83 The paperclip on a desktop table row is a plain span with no tabindex: it cannot take keyboard focus (the window\'s own paperclip button can).', pic: '' },
  { text: '70 After a "No" OIL answer the desktop row\'s chip still reads "OIL" (the window says "no OIL on its non-working day"); the chip text does not tell Yes from No.', pic: 'desk-D-admin-2-question-current-no.png' },
  { text: '61 In the window a member who is in a group sees the group line "credited on its non-working day" even after his own answer is No (his own line reads "no OIL"); the group line follows another person\'s answer.', pic: 'phone-61-5-takeout-question.png' },
  { text: '80 A real click outside an OIL question (on the covered card) closes the question only (the popup rule); the window and day stay, nothing behind is opened.', pic: '' },
  { text: '66 Answering the OIL question from the window closes the window (the line then reads the recorded answer when it is reopened).', pic: 'phone-66-6-answered.png' },
]
writeFileSync(J, JSON.stringify(j, null, 1))
const cnt = { PASS: 0, FAIL: 0, 'NOT RUN': 0 }
for (const r of j.rows) cnt[r.verdict] = (cnt[r.verdict] || 0) + 1
const order = ['66', '61', '74', '60', '59', '62', '63', '64', '65', '68', '69', '70', '71', '72', '73', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84']
const rows = order.flatMap(n => j.rows.filter(r => r.n === n))
let md = '# Walker C - the input card walk, 10 Oct 26\n\nServer http://localhost:4233/ (frozen build). Counts: ' + Object.entries(cnt).map(([k, v]) => v + ' ' + k).join(', ') + ' of ' + j.rows.length + ' rows (scenario 67 was the host\'s).\n\n| # | Size | Role | Verdict | What the screen said | Pictures (all opened or listed in the folder docs/img/handpass/2026-10-10-input-card-check/C/) |\n|---|---|---|---|---|---|\n'
for (const r of rows) md += `| ${r.n} | ${r.size} | ${r.role} | ${r.verdict} | ${r.said.replace(/\|/g, '/').replace(/\n/g, ' ').replace(/ \|\| /g, ' ; ')} | ${(r.pics || []).join(', ')} |\n`
md += '\n## Console errors, page errors, 4xx\n' + ((j.errors && j.errors.length) ? j.errors.map(e => '- ' + e).join('\n') : 'None seen in any run.') + '\n\n## Things that looked wrong or odd, not in a scenario\n' + j.extras.map(e => `- ${e.text}${e.pic ? ' (' + e.pic + ')' : ''}`).join('\n') + '\n'
writeFileSync(M, md)
console.log(JSON.stringify(cnt), rows.length)
