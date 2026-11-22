# Evidence — fix read 4's claim 5, the Leave War month landing (19 Nov 26, chat 112, `claude/lw-monthjump-click`)

**Tier: LOOK** by the eight questions (money, the published record, saved data, a shared drawer, a new gesture or mode,
a new surface, roles, the warning list — all NO: the change moves only where the grid's sideways scroll stands, saves
nothing and adds no control). The job's brief asked more, and it was done: red-first browser tests, 20 repeats, the whole
Leave War browser file, a short walk at both sizes, Astra's read and a fresh blind Opus read.

**What changed:** a click or key on the page no longer ends a month jump's landing — only the person's own sideways
scroll does; the landing rounds down on the screen's own dots (at 125% it sat 0.275px under the frozen column); a row
redraw noted before a jump no longer undoes it.

**Red first:** the two desktop browser tests (1536 wide; a real 125% scaling), Sep → Mar → Dec → Sep with a day cell
clicked during the fill, failed 6 of 6 on the old grid (1 September up to 0.6px under the frozen column, or 1.3px clear)
and pass on the fix. The month tests 20 times each, both sizes: 279/280 after the first commit (the one failure: MAR left
the grid on September — the anchor race, fixed in the second commit), 280/280 after it.

**Walk (the built app, served locally):** desktop 1536 — SEP, MAR, DEC, SEP, a day cell clicked each time while the year
filled, the window closed by its backdrop: 1 September 0.94px clear, 1 March 0.05px, December at the scroll's end (its
first day cannot reach the edge), no console or page errors. iPhone 402 — SEP landed 0.53px clear; a flick then carried
the year 145px on and the grid kept it (not pulled back). Pictures: `2026-11-19-lw-monthjump-click/` — `d-*-window-open`,
`d-*-at-rest` (desktop), `p-SEP-landed`, `p-SEP-after-flick` (phone); `d-SEP-at-rest` and `p-SEP-landed` opened by the
host: the 1 September column whole beside the frozen name and counter columns.

**Reads:** Astra (GPT-6 Astra) and a fresh, blind Opus reader of `ae4c632a3`, blind to each other and to this walk —
reports beside the brief. Fixed in the third commit: a scroll between a redraw's note and the redraw kept as the person's
(Astra 1, Opus F3 — `reanchorPlan`, its unit tests); a trackpad's downward swipe no longer ends the landing (Opus F1); the
edge test within one screen dot below 100% zoom (Opus F2). The third commit is checked by the month tests 10 times each
and the whole Leave War browser file, not walked again (nothing a person sees changed beyond the landing itself).

**Not covered:** a real iPhone's flick inertia and his PC's real 125% screen — the browser's stand-ins only.
