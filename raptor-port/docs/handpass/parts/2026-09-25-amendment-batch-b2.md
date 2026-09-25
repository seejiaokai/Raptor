# Walker B2 — the marks, the rings, the seal, the Signed line (amendment batch walk, 25 Sep 26)

Items 1, 2, 13 and 3 of the batch (D92, D93, D94, D111, D95, D102), driven in the production build served on
http://localhost:4173, each world its own fresh browser context. Scripts: `raptor-port/scripts/handpass/am/b2-lib.mjs`,
`b2-00-probe.mjs`, `b2-00b-probe.mjs`, `b2-01-marks.mjs`, `b2-02-rings-seal.mjs`, `b2-03-signed.mjs`,
`b2-04-weekheads.mjs`. Pictures: `raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b2/` (99 files; the ones
named below were looked at).

**Result: 138 PASS, 0 FAIL, and 1 thing I could not build (the dashed late-show ring). No browser errors in any context.**

## How the fixtures were made (all through the app's own controls)
- **Monday** of the saved everything-week (published, AL1, one time edit waiting). On the board: a roster puck DRAGGED onto
  a seat (replaces the man there) or a row's people cell tapped then a roster puck tapped (adds him to the extras).
  Round 1, published as **AL2** (signed through the four selects, Publish AL2): Tally to the first-wave VL WSO seat (amber
  advisory), Saber to an RU pilot seat (red clash), Piston to the 2nd-wave SDO desk (red clash), Reaper to the 1st-wave SDO
  extras, Ranger to an OFT sim pilot seat (red clash), Havoc to an AMT passenger seat, Nomad to a ground row, Comet to a
  Common Programme crowd. Round 2, left **waiting as AL3**: Warden to the night VL pilot seat (breaks his Tuesday crew
  rest, so a dotted ring; also a red clash with the next move), Warden to the 2nd-wave SXO extras, Saber to the 1st-wave
  SXO desk, Dash to an OFT WSO seat, Fable to an AMT passenger seat, Saint to a ground row, Ryder to a Common Programme
  crowd, and a flight remark typed. Then Static (a WSO on nothing Monday, flying Tuesday) dragged onto the night VL WSO
  seat: a clean dotted crew-rest ring and nothing else. Monday then published as AL3 (four other signers) and, after one
  more drag, AL4 (four more).
- **Friday** (a draft day) for the Signed line: published as the Original signed by Ace / Anvil / Anvil / Anvil, a ground
  row changed by a drag, published as AL1 signed by Blade / Cinch / Cinch / Cinch, then a desk changed and the next issue
  HALF-signed (Cinder, Forge), so a change was waiting and the live sign-off boxes held other names.
- `window.*` was only READ (to choose a man with nothing on Monday for the clean trace case, and for the evidence).
  Nothing was written through `window`.

## 1. Every check

| Check | Result | Picture(s) |
|---|---|---|
| week · prog · AL2 out · Comet (a:0.1.1) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · prog · AL3 waiting · Ryder (a:0.2.1) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · flyW · AL2 out · Tally (0.0.0.1.w) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · flyP · AL2 out · Saber (0.0.1.0.p) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · flyP · AL3 waiting · Warden (0.1.0.0.p) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · extra · AL2 out · Reaper (d:0.0.0.x0) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · desk · AL3 waiting · Saber (d:0.0.1) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · desk · AL2 out · Piston (d:0.1.0) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · extra · AL3 waiting · Warden (d:0.1.1.x0) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · pax · AL2 out · Havoc (s:0.amt.1.pax.0) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · pax · AL3 waiting · Fable (s:0.amt.1.pax.1) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · sim · AL2 out · Ranger (s:0.oft.0.p) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · sim · AL3 waiting · Dash (s:0.oft.1.w) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · ground · AL2 out · Nomad (g:0.0) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · ground · AL3 waiting · Saint (g:0.1) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · every seat kind carries its tag | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| week · time/remark cells keep their own marks (solid for AL2, dotted for the waiting AL3) | PASS | b2-01-week-dpr1-*.png; b2-02-week-dpr3-*.png |
| board · prog · AL2 out · Comet (a:0.1.1) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · prog · AL3 waiting · Ryder (a:0.2.1) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · flyW · AL2 out · Tally (0.0.0.1.w) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · flyP · AL2 out · Saber (0.0.1.0.p) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · flyP · AL3 waiting · Warden (0.1.0.0.p) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · extra · AL2 out · Reaper (d:0.0.0.x0) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · desk · AL3 waiting · Saber (d:0.0.1) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · desk · AL2 out · Piston (d:0.1.0) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · extra · AL3 waiting · Warden (d:0.1.1.x0) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · pax · AL2 out · Havoc (s:0.amt.1.pax.0) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · pax · AL3 waiting · Fable (s:0.amt.1.pax.1) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · sim · AL2 out · Ranger (s:0.oft.0.p) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · sim · AL3 waiting · Dash (s:0.oft.1.w) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · ground · AL2 out · Nomad (g:0.0) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · ground · AL3 waiting · Saint (g:0.1) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · every seat kind carries its tag | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · Warden (breaks his Tuesday rest) wears the dotted ring on every Monday puck (D94) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| board · the same crew-rest caption the week carries (D94) | PASS | b2-01-board-dpr1-*.png; b2-02-board-dpr3-*.png |
| view issued face · no waiting tag at all | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-issued · other · AL2 out · Comet () | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-issued · other · AL2 out · Tally () | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-issued · other · AL2 out · Saber () | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-issued · other · AL2 out · Reaper () | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-issued · other · AL2 out · Piston () | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-issued · other · AL2 out · Havoc () | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-issued · other · AL2 out · Ranger () | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-issued · other · AL2 out · Nomad () | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-issued · all eight published changes (one per seat kind) carry their solid AL2 tag | PASS | b2-01-view-issued-dpr1-*.png; b2-02-viewissued-dpr3-wave1.png |
| view-peek · prog · AL2 out · Comet (a:0.1.1) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · prog · AL3 waiting · Ryder (a:0.2.1) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · flyW · AL2 out · Tally (0.0.0.1.w) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · flyP · AL2 out · Saber (0.0.1.0.p) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · flyP · AL3 waiting · Warden (0.1.0.0.p) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · extra · AL2 out · Reaper (d:0.0.0.x0) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · desk · AL3 waiting · Saber (d:0.0.1) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · desk · AL2 out · Piston (d:0.1.0) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · extra · AL3 waiting · Warden (d:0.1.1.x0) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · pax · AL2 out · Havoc (s:0.amt.1.pax.0) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · pax · AL3 waiting · Fable (s:0.amt.1.pax.1) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · sim · AL2 out · Ranger (s:0.oft.0.p) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · sim · AL3 waiting · Dash (s:0.oft.1.w) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · ground · AL2 out · Nomad (g:0.0) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · ground · AL3 waiting · Saint (g:0.1) | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · every seat kind carries its tag | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| view-peek · Warden: a waiting change on a man wearing the dotted ring — hollow tag, dotted ring intact | PASS | b2-01-view-peek-dpr1-*.png; b2-01-view-peek-warden-dpr1.png; b2-02-viewpeek-dpr3-*.png |
| no browser errors | PASS | — |
| D94 · Static's Monday (breaks Tuesday rest): dotted ring on the board | PASS | b2-02-board-trace-dpr1.png; b2-02-week-trace-dpr1.png |
| D94 · Static: the board carries the same crew-rest caption as the week | PASS | b2-02-board-trace-dpr1.png; b2-02-week-trace-dpr1.png |
| D94 dashed | NOT WALKED (see S1) | b2-02-week-dash-dpr1.png; b2-02-board-dash-dpr1.png |
| phone week · every changed puck: its tag, no AL ring | PASS | b2-02-phone-week-*.png |
| phone board · every changed puck: its tag, no AL ring | PASS | b2-02-phone-board-*.png |
| phone view peek · every changed puck: its tag, no AL ring | PASS | b2-02-phone-viewpeek-warden.png |
| member view issued face · AL2 tags on the 8 published changes, no waiting tag | PASS | b2-02-member-viewissued-wave1.png |
| member view peek · hollow tags on the waiting changes | PASS | b2-02-member-viewpeek-wave2.png |
| b2-02-seal-al3 week · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-04-seal-al4-week-mon-tue.png; b2-04-seal-al4-week-tue-wed.png |
| b2-02-seal-al3 week · no grey ORIG anywhere | PASS | b2-04-seal-al4-week-mon-tue.png; b2-04-seal-al4-week-tue-wed.png |
| b2-02-seal-al3 week · ORIG does not read as AL3 green | PASS | b2-04-seal-al4-week-mon-tue.png; b2-04-seal-al4-week-tue-wed.png |
| b2-02-seal-al3 week · DRAFT stays dashed and apart from the seal | PASS | b2-04-seal-al4-week-mon-tue.png; b2-04-seal-al4-week-tue-wed.png |
| b2-02-seal-al3 board d0 · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-al3-board-d*.png |
| b2-02-seal-al3 board d0 · no grey ORIG anywhere | PASS | b2-02-seal-al3-board-d*.png |
| b2-02-seal-al3 board d0 · ORIG does not read as AL3 green | PASS | b2-02-seal-al3-board-d*.png |
| b2-02-seal-al3 board d1 · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-al3-board-d*.png |
| b2-02-seal-al3 board d1 · no grey ORIG anywhere | PASS | b2-02-seal-al3-board-d*.png |
| b2-02-seal-al3 board d2 · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-al3-board-d*.png |
| b2-02-seal-al3 board d2 · no grey ORIG anywhere | PASS | b2-02-seal-al3-board-d*.png |
| b2-02-seal-al3 board d2 · DRAFT stays dashed and apart from the seal | PASS | b2-02-seal-al3-board-d*.png |
| b2-02-seal-al3 view · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-al3-view-d*.png |
| b2-02-seal-al3 view · no grey ORIG anywhere | PASS | b2-02-seal-al3-view-d*.png |
| b2-02-seal-al3 view · ORIG does not read as AL3 green | PASS | b2-02-seal-al3-view-d*.png |
| b2-02-seal-al3 view · DRAFT stays dashed and apart from the seal | PASS | b2-02-seal-al3-view-d*.png |
| b2-02-seal-al4 week · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-04-seal-al4-week-mon-tue.png; b2-04-seal-al4-week-tue-wed.png |
| b2-02-seal-al4 week · no grey ORIG anywhere | PASS | b2-04-seal-al4-week-mon-tue.png; b2-04-seal-al4-week-tue-wed.png |
| b2-02-seal-al4 week · ORIG does not read as AL4 (AL4 solid white with dark ink; ORIG a faint wash with light ink) | PASS | b2-04-seal-al4-week-mon-tue.png; b2-04-seal-al4-week-tue-wed.png |
| b2-02-seal-al4 week · DRAFT stays dashed and apart from the seal | PASS | b2-04-seal-al4-week-mon-tue.png; b2-04-seal-al4-week-tue-wed.png |
| b2-02-seal-al4 board d0 · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-al4-board-d*.png |
| b2-02-seal-al4 board d0 · no grey ORIG anywhere | PASS | b2-02-seal-al4-board-d*.png |
| b2-02-seal-al4 board d0 · ORIG does not read as AL4 (AL4 solid white with dark ink; ORIG a faint wash with light ink) | PASS | b2-02-seal-al4-board-d*.png |
| b2-02-seal-al4 board d1 · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-al4-board-d*.png |
| b2-02-seal-al4 board d1 · no grey ORIG anywhere | PASS | b2-02-seal-al4-board-d*.png |
| b2-02-seal-al4 board d2 · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-al4-board-d*.png |
| b2-02-seal-al4 board d2 · no grey ORIG anywhere | PASS | b2-02-seal-al4-board-d*.png |
| b2-02-seal-al4 board d2 · DRAFT stays dashed and apart from the seal | PASS | b2-02-seal-al4-board-d*.png |
| b2-02-seal-al4 view · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-al4-view-d*.png |
| b2-02-seal-al4 view · no grey ORIG anywhere | PASS | b2-02-seal-al4-view-d*.png |
| b2-02-seal-al4 view · ORIG does not read as AL4 (AL4 solid white with dark ink; ORIG a faint wash with light ink) | PASS | b2-02-seal-al4-view-d*.png |
| b2-02-seal-al4 view · DRAFT stays dashed and apart from the seal | PASS | b2-02-seal-al4-view-d*.png |
| b2-02-seal-phone week · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-phone-week-d*.png |
| b2-02-seal-phone week · no grey ORIG anywhere | PASS | b2-02-seal-phone-week-d*.png |
| b2-02-seal-phone week · ORIG does not read as AL4 (AL4 solid white with dark ink; ORIG a faint wash with light ink) | PASS | b2-02-seal-phone-week-d*.png |
| b2-02-seal-phone week · DRAFT stays dashed and apart from the seal | PASS | b2-02-seal-phone-week-d*.png |
| b2-02-seal-phone board d0 · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-phone-board-d*.png |
| b2-02-seal-phone board d0 · no grey ORIG anywhere | PASS | b2-02-seal-phone-board-d*.png |
| b2-02-seal-phone board d0 · ORIG does not read as AL4 (AL4 solid white with dark ink; ORIG a faint wash with light ink) | PASS | b2-02-seal-phone-board-d*.png |
| b2-02-seal-phone board d1 · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-phone-board-d*.png |
| b2-02-seal-phone board d1 · no grey ORIG anywhere | PASS | b2-02-seal-phone-board-d*.png |
| b2-02-seal-phone board d2 · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-phone-board-d*.png |
| b2-02-seal-phone board d2 · no grey ORIG anywhere | PASS | b2-02-seal-phone-board-d*.png |
| b2-02-seal-phone board d2 · DRAFT stays dashed and apart from the seal | PASS | b2-02-seal-phone-board-d*.png |
| b2-02-seal-phone view · every ORIG tag is the seal (tick disc, faint white wash, thin light outline) | PASS | b2-02-seal-phone-view-d*.png |
| b2-02-seal-phone view · no grey ORIG anywhere | PASS | b2-02-seal-phone-view-d*.png |
| b2-02-seal-phone view · ORIG does not read as AL4 (AL4 solid white with dark ink; ORIG a faint wash with light ink) | PASS | b2-02-seal-phone-view-d*.png |
| b2-02-seal-phone view · DRAFT stays dashed and apart from the seal | PASS | b2-02-seal-phone-view-d*.png |
| no browser errors (every context) | PASS | — |
| draft day (Fri, before publishing) · no Signed line on the week | PASS | b2-03-week-signed-al1.png (the head, before/after) |
| draft day (Wed) · no Signed line on the week | PASS | b2-03-week-signed-al1.png (the head, before/after) |
| Original published · the week names the Original's four | PASS | b2-03-week-signed-al1.png (the head, before/after) |
| the two versions were signed by different people | PASS | — |
| board strip · names AL1's four, not the half-signed boxes | PASS | b2-03-board-signed-al1.png |
| edit week · names AL1's four (the version the working copy sits on), not the live boxes | PASS | b2-03-week-signed-al1.png |
| edit week (desktop) · role labels shown | PASS | b2-03-week-signed-al1.png |
| edit week, previewing the Original · names the Original's four | PASS | b2-03-week-preview-orig.png |
| board, previewing the Original · the strip names the Original's four | PASS | b2-03-board-preview-orig.png |
| View-only Sched (admin) issued face · names AL1's four | PASS | b2-03-view-admin-issued.png |
| View-only Sched (admin) working-draft peek · names the published version's (AL1) four | PASS | b2-03-view-admin-peek.png |
| View-only Sched · a draft day (Wed) has no line | PASS | b2-03-week-signed-al1.png (the head, before/after) |
| View-only Sched · previewing a parked plan (Wed, drafts picker) shows no Signed line | PASS | b2-03-view-parked-plan.png |
| View-only Sched (member) issued face · names AL1's four | PASS | b2-03-view-member-issued.png |
| View-only Sched (member) working-draft peek · names AL1's four | PASS | — |
| phone edit week · names only (no role labels), AL1's four | PASS | b2-03-week-signed-al1.png |
| phone board strip · names only, AL1's four | PASS | b2-02-phone-board-*.png |
| phone View-only Sched · names only, AL1's four | PASS | b2-03-phone-view.png |
| no browser errors (every context) | PASS | — |

The per-seat rows read: surface · kind of seat · state · man (seat). Kinds: flyP / flyW = a flying pilot / WSO seat,
desk = a duty desk's holder, extra = a duty desk's extras, sim = an OFT sim seat, pax = an AMT passenger, ground = a
ground row, prog = a Common Programme crowd. On the view page's issued face the seats carry no address, so they read
"other" and are counted instead: eight published changes, one of each kind.

What each per-seat PASS asserts, by computed style: the puck's own edge (its shadow and outline) holds no AL colour;
the seat itself has no ring; a published change has a SOLID tag in its AL colour (AL2 on amber, no border); a waiting
change has a HOLLOW tag (dark fill, AL3-green dotted border, green letters); and the warning ring the man owns is still
his: amber advisory (Tally, 1.5px amber), red clash (Saber, Piston, Ranger, Saber on the SXO desk, red 2px), dotted
crew-rest cause (Warden on both his Monday pucks, Static: a red dotted outline).

## 2. Findings (FAIL / surprise)

**No defect found in items 1, 2, 13 or 3.** Surprises worth a look, none of them a failure of this batch:

- **S1: the dashed "late show" ring could not be made (not walked).** Steps: Static onto Monday's night VL line (his
  Tuesday rest breaks), then "LATE SHOW" typed in his Tuesday line's remarks. Expected: Tuesday's ring turns dashed on
  the week and on the board. Seen: it stays solid red on both (`b2-02-week-dash-dpr1.png`, `b2-02-board-dash-dpr1.png`).
  Cause, from the engine's own warning: his Tuesday starts with a 05:00 OPS-O duty before the 12:00 report, and the rule
  (`docs/engine-rules.md`: a late-show remark on the jet cannot dash the ring when an earlier event binds, because a
  sanctioned late join to the sortie does not excuse the meeting) rightly refuses it. So that man behaves correctly, and
  the dashed ring on the board (D94's other ring) is **unwalked**. The board and the week agree on the solid ring.
- **S2: on the day that CAUSES a crew-rest breach, the crew-rest caption is the puck's hover title, not a printed chip.**
  Static's Monday puck prints no chip on either surface; its title reads "Crew rest — Tuesday is broken by this day: he
  had to leave by 17:00" on the board and on the week alike. That is how the week draws it (a chip is printed only when
  the day has a flag of its own), so the board matches. Recorded so nobody expects a visible "CR" letter there.
- **S3: the tag sits over the top edge of the qualification letter.** At real size the solid or hollow ALn tag in the
  seat's corner covers the upper edge of the puck's right-hand letter (Tally's "O", Saber's "IP":
  `b2-02-viewissued-dpr3-wave1.png`, `b2-02-week-dpr3-tally-al2-amber.png`). The letter stays readable, and it is where
  the approved mock-up puts the tag. Cosmetic only.
- **S4 (outside this batch): the "View as" man still glows.** Ranger (the View-as person) wears a red glow round his red
  ring on every surface (`b2-02-viewissued-dpr3-wave1.png`). That is D164, already filed as `[PUCK-FLAG-GLOW]`; the AL
  tag does not touch it.
- **S5 (for B1): under a preview of the Original, the week's head still shows the "AL1" tag and the "1 pending" chip.**
  Seen in `b2-03-week-preview-orig.png`: the preview bar and the Signed line say Original; the head's version tag says
  AL1 and the pending chip is there. The Signed line is right. Whether the pending chip may be a button under a preview
  is B1's check (brief item 2).
- **Not a finding (D56):** the days published before the batch (Tuesday, Thursday, Saturday) show NO Signed line, because
  their Original went out before the Original started keeping its signers. Stored demo data only; a day published now
  keeps them (Friday, above).

## 3. Explicit negatives: checked and found right
- **Tags, not rings (D92, D93):** all 8 kinds of seat, published (AL2) and waiting (AL3), on the edit week, the board and
  View-only Sched's working-draft peek. The issued face shows only the solid tags, never a waiting one. Desktop at DPR 1
  and DPR 3, and the phone at 390 (16 changed seats each on the week, the board and the peek, none with an AL ring);
  admin and member.
- **The warning rings survive a change:** amber advisory, red clash (including a sim seat and two duty desks) and the
  dotted crew-rest cause, under a published and under a waiting change, on all three surfaces.
- **Text cells keep their own marks:** the published take-off time is underlined in AL2's colour with its "AL2"; the
  waiting remark is underlined dotted in AL3 green.
- **The view page's working-draft peek:** Warden (red clash + dotted crew-rest ring) with a waiting change wears the hollow
  AL3 tag and his dotted ring is still drawn (`b2-01-view-peek-warden-dpr1.png`, `b2-02-viewpeek-dpr3-warden-al3-red-dotted.png`).
- **Board rings (D94):** the dotted crew-rest ring is on the board on every Monday puck of the man (flying seat and duty
  extras), with the same classes, outline and title as the week; Static's clean case is dotted only, no red box.
- **The ORIG seal (D111):** every ORIG tag on the edit week (4), the board strip (Tuesday) and View-only Sched (8), desktop
  and phone, beside Monday at AL3 (solid green) and at AL4 (solid white, dark letters) and Wednesday's DRAFT (dashed), is
  the tick disc + "ORIG" on a faint white wash with a thin light outline and light letters. None grey anywhere. It does
  not read as AL4 (solid white with dark letters), as AL3 green, or as a warning. DRAFT stays dashed, with no tick.
- **The Signed line (D95, D102):** the Original's four on the week right after publishing. After AL1 + a waiting change +
  two half-signed boxes: the week, the board strip and View-only Sched (issued face AND working-draft peek, admin AND
  member) all name AL1's four (Blade, Cinch, Cinch, Cinch), never the live boxes (Cinder, Forge). Previewing the Original
  from the plans menu names the Original's four (Ace, Anvil x3) with the ORIG seal, on the week AND the board strip.
  Phone: names only, the role labels hidden, on the week, the board and the view page; desktop: role labels shown. Draft
  days (Wednesday, and Friday before publishing) have no line; a parked plan previewed on View-only Sched (Wednesday,
  Plan A) has no line.
- No console error, page error or failed request in any of the 10 browser contexts.

## 4. What I could not walk, and why
- **The dashed late-show ring (D94's second ring):** see S1. The man I could make had his breach bound by an earlier
  duty, which the rule rightly refuses to sanction. It needs a man whose Tuesday has nothing before his flight's report;
  I did not find one in the time.
- **The grey (note) ring** under a change: no note-level man was made.
- **A parked-plan preview on the EDIT surfaces:** on a published day the plans menu has no such preview; a tap on a
  parked plan switches the working copy to it ("tap to make it the live day"). The only parked-plan preview the app draws
  is View-only Sched's drafts picker on an unpublished day, which was walked.
- **Phone pictures of the duty, sim, ground and programme seats:** the phone checks read every changed seat by computed
  style (16 on each surface), but pictures were taken of the four flying seats only.
- The desktop head pictures `b2-02-seal-al3-week-*.png` / `b2-02-seal-al4-week-*.png` caught the Amendments panel, not the
  heads. The heads were re-shot at AL4 in `b2-04-seal-al4-week-mon-tue.png` and `-tue-wed.png` (AL4 beside ORIG beside
  DRAFT). There is no desktop edit-week head picture at AL3; the computed check at AL3 passed and the view page's AL3 head
  is pictured (`b2-02-seal-al3-view-d0.png`).
