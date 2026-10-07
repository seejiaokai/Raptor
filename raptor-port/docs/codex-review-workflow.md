# Codex in this repo — how a review round is run, and Codex's own proportional checks

Codex is the reviewer of what Opus 5.5 writes (D67, D590, D601), and builds only on his word (`AGENTS.md`). The
arrangement of 2–5 Oct 26 under which Codex planned and built by itself (D496) is over; its text is kept whole in
`docs/archive/codex-arrangement-2026-10-07.md`.

## How a review round is run

Use concrete briefs with the baseline, scope, acceptance criteria, relevant rules, and evidence.
Keep each read's complete findings and dispositions. A finding needs a concrete failure, cause,
and fix (D489). A failed, empty, blocked or incomplete read is not approval. Cap plan review at
three rounds and final code inspection at two (initial read plus one fresh read after fixes). Working-guide
reviews retain D70's one round per reviewer; do not apply the broader code-inspection budget to guides. Report
unresolved findings instead of manufacturing agreement. Later code changes require another read
of the affected snapshot. Reviewers do not edit the code they are inspecting.

## Codex-only proportional checks — D499

This addendum applies only when working in Codex. It does not change Claude's hooks, skills or standing checking order. It does not approve the Rally design or answer its product questions. D496's temporary model arrangement still expires Monday 5 Oct 2026 at 19:00 Asia/Singapore; this addendum does not extend it.

**Plan the evidence before running it.** Use the standing order's eight questions and NONE / LOOK / WALK / FULL tiers. The independent scenario designer names the affected surfaces, roles, meaningful action orders and downstream results before the browser walk. Each required claim gets a named check; each omission gets a reason. Keep model independence, fresh final inspection, review limits and owed Claude reads.

**Keep the gates.** Changes to timing rules, warnings, saved data, published records, permissions or earned leave retain the applicable FULL checks and required gates. Small line counts do not lower consequence. Follow the existing PC lock and frozen-build rules. Run focused checks while fixing; do not repeat completed broad gates without a relevant change, failure or unresolved concern.

**Use the repository's scripted browser support.** Reuse the existing Playwright/Chromium installation, configuration and relevant walk helpers. Confirm they work before adding or installing anything. A working setup needs no generic browser skill, extra MCP server or global settings. Watch browser errors and assert actual outcomes, visibility and hit targets. Chromium phone emulation does not prove physical iPhone Safari behaviour.

**Avoid repeating identical functional proof solely because the viewport changed.** Prove a shared functional flow once on the exact build, then verify each affected surface's appearance and usable controls at desktop and phone widths. Repeat the functional flow where the route, gesture, rendered control or behaviour differs. For viewport-height-dependent surfaces, add the standing short-screen checks, including edge-docked controls. Record which assertions are shared and which were repeated.

**Save pictures deliberately and inspect them.** Capture distinct visual states needed to prove the change, plus useful failure evidence—not a picture after every action. Open every saved walk picture before counting its step as visually checked, preserving §10 item 21. Contact sheets may help navigation; inspect small or uncertain details at readable resolution. Give the owner selected useful images, not an automatic gallery of every saved picture. Screenshots do not replace interaction assertions.

**Collect additional diagnostics when needed.** Use targeted traces, video, extra screenshots or fuller logs to investigate a failure; do not enable them routinely without a reason. Preserve useful failure evidence and distinguish a harness failure from an app defect. Report observed results and limits; do not claim token or allowance savings without measurements.

Words/setup-only work does not require application gates. A standalone design mock receives checks of its own interaction and layout, with its assumptions stated; those results never count as proof of the application's rules or saved data.

**Scoped exception:** the shared-functional-proof paragraph narrows any reading of `bug-check-order.md` §§2a, 7.2–7.4 and 12 that requires repeating the entire identical lifecycle at every viewport. It preserves every distinct required order and every surface's width-specific operation. It does not waive gates, short-screen coverage, independent review or picture inspection. The retained gates for LOOK/WALK/FULL remain those of the standing order; this approval does not silently drop their required gates.

No picture-inspection exception is needed: select fewer distinct pictures before capture, then inspect every saved walk picture. D499 carries this Codex execution exception in this document only; Claude's original files retain their rules.

**Support verified 2 Oct 26:** repository Playwright 1.62.1 loads its configuration and discovers 567 browser tests without running them. The installed Chromium launched; page rendering, locator click and visible result passed at desktop and iPhone 13 emulation. This was a two-context runtime readiness check, not an application regression run or physical-iPhone check. No dependencies, browser packages, MCP servers, global settings or Claude configuration were changed. The existing regular suite has no automatic screenshots/traces/video configured; custom walks save proof pictures explicitly. Enable extra failure diagnostics only for a demonstrated need; CI uploads remain the separate unapproved [CI-FAIL-PICTURES] job.

**Independent authorship/read:** Astra drafted this addendum; Sol independently challenged its effect against the existing order. Sol retained required gates, added the explicit scoped-exception boundary and runtime limitations, and did not infer Rally answers or extend D496. The draft and disposition are retained in `docs/superpowers/plans/2026-10-02-codex-check-framework-review.md`. Claude's working-guide read was done by Opus on 6 Oct 26 — the Codex stack's evidence sheet, `docs/handpass/2026-10-05-codex-stack-check.md` §10.4.
