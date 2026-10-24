# The manning bubble — drawn on the real app (25 Oct 26)

For his D1344 (the bubble in the colour of the worst level it names), D1345 (every bid or filing that takes a row lower
on an amber or red day raises it, not only the first), D1351 (after a filing it names what was filed), with D1277 (the
bubble at the foot when the Manning button is out of view). His report: the bubble is amber when its words say red; a
second bid on a red day raises nothing; nothing at the foot when the Manning button is scrolled away.

Script: `raptor-port/scripts/handpass/lw-1025-bubble.mjs` (helpers `lw-r3-lib.mjs`), run on this branch's built bundle:
`LW_PORT=4180 LW_OUT=2026-10-25-lw-drawings/bubble SIZES=phone,desk node scripts/handpass/lw-1025-bubble.mjs` from
`raptor-port/`. Phone 402 × 874 at 3×, touch; desktop 1440 × 900 at 1×. Signed in as the admin, `?fresh=1`. Every fixture
is made through the app's own controls and asserted before its picture; its notes are in `run-phone-desk.json`.
No console errors, page errors or failed requests at either size.

**Fixtures.** Tue 15 Dec: Required P typed equal to Available P (28). (1) a pending LL for Drifter: Available P 28 → 27,
red. (2) a pending LL for Ridge on the same day: 27 → 26. Wed 16 Dec, set up the same way, the Manning button scrolled out
of view before the last tap: (1) a pending LL for Trident, then (3) one for Hunter. Thu 17 Dec, set up the same way: an
overseas duty filed for Drifter from the bid window, 28 → 27. (Ridge's and Trident's first tap on LL only asks, their
balance going below zero; the second tap places it, and the picture right after the tap is of that one.)

**The drawn red** (a class the drawing adds to the bubble's own node, `drawn-red`; nothing else changed):
edge `rgba(240, 85, 95, .7)` — the app's red (240, 85, 95), as a red Manning cell's ring uses it, at the amber bubble's .7;
words and "Show ›" `#FFAAB0` — a red Manning cell's own words (as the amber bubble uses the amber cell's `#F2C879`);
fill `#2e1418` — a **new value**: the app has no solid dark red, so it is made the way the amber bubble's solid `#2a2210`
is, dark with a little of its colour; the little arrow takes the same fill and edge. Words on fill measure about 9.4 to 1
(today's amber, about 10 to 1). Not drawn: Show's hover, which would take the red at .14 as today's takes the amber.

**The words.** Today, one row: "This bid turns Available P red."; two rows join with a comma ("…IP amber, Available P
red."). Drawn: B "This bid takes Available P lower, still red." (recommended) and "This bid takes Available P further into
the red." (other words); C "This bid turns IP amber and Available P red."; D "This overseas duty turns Available P red."

| Picture | Real or drawn | What it shows |
|---|---|---|
| `t1-mid-phone.png`, `t1-mid-desk.png` | Today | The first bid on 15 Dec: Available P 28 → 27, red; the bubble under the Manning button says "This bid turns Available P red." in amber. Marked: the bubble and Available P. |
| `t1-quick-phone.png` | Today, right after the tap | The whole phone screen about 0.1 s after the tap on LL: the bubble is already up. |
| `a-drawn-mid-phone.png`, `a-drawn-mid-desk.png` | Drawn (A) | The same bubble, same words, in the red above. |
| `t2-mid-phone.png`, `t2-mid-desk.png` | Today | The second bid on 15 Dec: Available P 27 → 26, still red, and **no bubble**. Marked: the empty place where the bubble stood, and Available P. |
| `t2-quick-phone.png` | Today, right after the tap | The whole phone screen about 0.1 s after the tap that placed Ridge's bid: no bubble, Available P 26. |
| `b-drawn-mid-phone.png`, `b-drawn-mid-desk.png` | Drawn (B) | The bubble the second bid will raise, red: "This bid takes Available P lower, still red." A clone of the real bubble's node, put back first in the Manning bar where the real one stands. |
| `b-drawn-mid-other-phone.png`, `b-drawn-mid-other-desk.png` | Drawn, other words (B) | The same, "This bid takes Available P further into the red." |
| `c-drawn-mid-phone.png`, `c-drawn-mid-desk.png` | Drawn (C) | A bubble naming two rows at two levels, red for the worse: "This bid turns IP amber and Available P red." **IP was made amber by hand** (the app's own amber class on IP's 15 Dec cell; its figure stays 16) because no demo row turns amber with one or two bids (IP's amber point is 3); the label says so. |
| `t1-foot-phone.png`, `t1-foot-desk.png` | Today | The first bid on 16 Dec with the Manning button out of view: the same words at the foot with "Show ›", amber. Marked: the foot bubble; the bid's cell above it. |
| `t1f-quick-phone.png` | Today, right after the tap | The whole phone screen about 0.1 s after the tap: the foot bubble is up. |
| `a-drawn-foot-phone.png`, `a-drawn-foot-desk.png` | Drawn (A) | The foot bubble in red, words unchanged. |
| `t3-foot-phone.png`, `t3-foot-desk.png` | Today | The second bid on 16 Dec, the Manning button out of view: **nothing at the foot**. Marked: the empty place where the foot bubble stood; both bids' cells above. |
| `t3-quick-phone.png` | Today, right after the tap | The whole phone screen about 0.1 s after the tap: no foot bubble. |
| `b-drawn-foot-phone.png`, `b-drawn-foot-desk.png` | Drawn (B) | The second bid's bubble at the foot, red, recommended words, "Show ›" kept. |
| `b-drawn-foot-other-phone.png`, `b-drawn-foot-other-desk.png` | Drawn, other words (B) | The same, "…further into the red." |
| `td-mid-phone.png`, `td-mid-desk.png` | Today | An overseas duty filed for Drifter on 17 Dec from the bid window: Available P 28 → 27, red; the bubble says "This bid turns Available P red." in amber. |
| `td-quick-phone.png` | Today, right after the tap | The whole phone screen about 0.1 s after the tap on OD: the bubble is up. |
| `d-drawn-mid-phone.png`, `d-drawn-mid-desk.png` | Drawn (D) | The same bubble, red, "This overseas duty turns Available P red." |

**Seen while drawing.** The foot bubble works on the desktop too: the page itself scrolls there, so the Manning button
leaves the view as on a phone. On the desktop the Manning rows read "REQUIRED P" and "AVAILABLE P", on a phone "REQ P"
and "AVAIL P"; the bubble says "Available P" at both. The bubble under the button sits over the month buttons (today too).
