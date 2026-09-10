# Desktop handoff — where we are & how to work (multi-model, cross-device)

Written 10 Sep 26 for the owner (Jiao Kai), who works across desktop / laptop /
phone and is **not technical** — keep guidance plain, step-by-step, no jargon.
This file is the single "catch-up" read when picking work up on the desktop.

---

## 1. Where the Raptor work stands

- **Task #1 "addressing by rid" — FOUNDATION is DONE and LIVE.** Merged to
  `main` as `fa46c70` (PR #384), live-verified on the deployed site. This is
  the pos↔rid translation layer in `engine/rowids.ts` (`ridKey` / `posKey` /
  `migrateBookKeys`) plus its tests and the design spec. It wires nothing yet —
  all gates green.
- **NEXT UP — the engine wiring (spec tasks 2–7).** This is the risky,
  all-or-nothing half: it changes how every schedule row is addressed so a
  delete/reorder no longer renumbers stored keys. Full plan and the trap
  checklist live in
  `raptor-port/docs/superpowers/specs/2026-09-10-addressing-by-rid-design.md`.
  **Rules for it:** build with Opus at high thinking → Fable independent
  bug-check → **HOLD before live** (merge to `main` ONLY on the owner's
  explicit "merge live"). Start it on a **fresh branch cut from `main`**.

Also see the "#1" bullet under **Open / deferred / queued** in the root
`HANDOFF.md` for the same status in the project's own words.

---

## 2. How to work across devices (the setup that's now in place)

- **Desktop is the hub.** Work in the **Claude Code desktop app**, in the
  **Code** view, with the session set to **Local** (not Cloud) and the
  **Raptor** folder selected. Local mode is what lets plugins/skills and slash
  commands run.
- **The Raptor repo is cloned locally** at `C:\Users\User\Desktop` (the
  "Raptor · C:\Users\User\Desktop" project in the app sidebar).
- **Two model providers are wired up:** Claude models (built in) and OpenAI
  **Codex** models via the **`claudex-loop`** plugin (installed at user scope;
  shows in the sidebar under the local Raptor project). Codex commands only
  work in **Local** sessions.
- **Reach it from laptop/phone:** leave the desktop on; use Claude Code Remote
  Control to attach to the desktop's session from another device.

If the app ever says a slash command "isn't available in this environment," the
session is set to **Cloud** — switch it to **Local** and it works.

---

## 3. Model & workflow advisor — paste this into the GLOBAL user file

This makes every Claude session proactively tell the owner which model/thinking
to use, and when to red-team / merge / hand off / compact. It is a **personal
global file**, NOT part of the repo — paste the block below into
`C:\Users\<YourName>\.claude\CLAUDE.md` on the desktop (create the file if it
isn't there). Kept here only so it's easy to copy and survives device changes.

```markdown
## Model & workflow advisor (always on)

Proactively advise me — I am not technical. In plain language, without being asked:

- **Which model + thinking level to use** for the task in front of us:
  - Heavy or voluminous building, or risky/atomic changes → **Opus, high** thinking.
  - Independent bug-check or hard adversarial review → **Fable 5.1, high** (a
    different model from the one that wrote the code).
  - Mechanical / low-risk execution → a **cheaper model** to save cost.
  - When both providers are available, **red-team important plans across BOTH
    Claude and Codex** before building, and **bug-check across BOTH** after.
- **When to MERGE to `main`:** only when the work is on its own branch, all
  gates are green, there are no conflicts, AND I have explicitly said "merge
  live." Tell me when those conditions are met; never merge risky work without
  my explicit "merge live."
- **When to HAND OFF / switch devices:** when work is at a clean, committed,
  pushed checkpoint. Remind me the notes go into the repo (HANDOFF.md), so the
  next device just pulls and reads.
- **When to COMPACT:** when the chat is long AND we're at a clean committed
  point where little would be lost. Say so plainly and wait for my go.
- **Don't watch/monitor PRs** unless I ask; unsubscribe if auto-subscribed.
```

---

## 4. First thing to do on the desktop

Tell the local Claude session (Local + Raptor selected):

> "Pull the latest `main`, then read `raptor-port/docs/superpowers/DESKTOP-HANDOFF.md`
> and `HANDOFF.md`, and tell me where we are and what's next."

Then, when ready to build the engine wiring, start a fresh branch from `main`
and use Opus at high thinking, following the spec's task plan and trap checklist.
