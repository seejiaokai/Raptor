// Round 21b (22 Oct 26), his answers "G1 2 and 4 as recommended. Leave E out first. Means that events are shown as full
// rows" (D1256-D1259) drawn as decided: the month buttons, then the dates (no month band, D1257), then the Manning rows
// straight under them (D1256), then today's full Event rows (D1259), then the people; Manning folded on a phone (D1258),
// open on a desktop. The same busy squadron as round 21's events study (full-r21-events.mjs, which draws it: way R).
//   r21-rows-phone / r21-rows-desk   numbered: 1 the dates · 2 the Manning rows (on a phone, the folded Manning button) · 3 the Event rows
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r21-rows.mjs
process.env.LWMOCK_WAYS = 'R'
await import('./full-r21-events.mjs')
