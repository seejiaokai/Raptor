# Walk brief — the faults Fable's reads proved, and the OIL question at the sign-off (22 Nov 26, chat 138)

You are a WALKER: you drive the running app as a person would, in a real browser, and say what you saw. You fix nothing,
change no file under `src/`, run no git command, and never run `npm run build`, `npm run test:e2e` or any Playwright TEST
runner (each rebuilds `dist` under the other walkers). The build is already made: `raptor-port/dist`, from commit
`ac3e22f77` of branch `claude/fable-read-faults-4104f0`.

**Folder:** `C:\Users\User\projects\Raptor\.claude\worktrees\fable-read-faults-4104f0\raptor-port` — work only here.

## Before you write a line
1. Read `docs/walk-scripts.md` whole — how a walk script is written here and what each trap has cost.
2. Read `docs/bug-check-order.md` §7.2 to §7.10 (find them: `grep -n '^\*\*7\.' docs/bug-check-order.md`) and §10's
   anti-pattern 21, and the checklist's lessons list (`docs/bug-check-checklist.md`, "The lessons of §7.11") — for each
   lesson say in your report the step that covers it or why it cannot apply to your scenarios.

## Your world
- Serve the build yourself, on YOUR port (given in your task), as a background command that first moves into the folder
  by its full path: `cd "C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0/raptor-port" && npx vite preview --port <PORT> --strictPort`.
  Check the port is free first; if it is held, take the next free one above it and say so. Stop your server by its PORT
  when you finish (PowerShell: `Get-NetTCPConnection -LocalPort <PORT>` → `Stop-Process`), never by a command-line pattern.
- Drive it with a plain node script using `@playwright/test`'s `chromium` and `webkit` (copy the browser fallback from
  `playwright.config.ts`; the drawing script `docs/mock/2026-11-22-oil-unanswered-publish/draw-f3.mjs` shows the sign-in,
  the sizes and the helpers). Each scenario starts in a FRESH browser context (its own empty storage), so nothing leaks
  between scenarios or walkers.
- **Two sizes, every scenario:** a desktop, Chromium 1536×864; his iPhone, WebKit 402×874, `isMobile`, `hasTouch`,
  `deviceScaleFactor: 3`. On the phone use real taps (`locator.tap()`), and take a picture within about 100 ms of each
  tap as well as the settled one (§7.10).
- Sign in as `ad` / `a` (admin, Saber): `#luser`, `#lpass`, `#loginForm button[type=submit]`; `#vWeek .day` means the week
  is up. A member is `us` / `us` (Ranger). The demo week is Mon 13 Jul 26; its Saturday is 18 Jul (day index 5).
- **Make every state through the app's own controls** (§7.7) — file inputs through the Inputs page's "+ Input" window,
  press the real sign-off boxes, the real Publish button. Where a state truly cannot be reached that way, say so and say
  what you set directly (the developer bridge on `window` — `window.DAYS`, `window.INPUTS`, `window.afterSchedMutate()`,
  `window.go('editsched')` — exists on this build); a state set directly never proves a control works.
- Watch and report console errors, page errors and failed requests on every page.

## What you hand back
- Your script: `scripts/handpass/frf-<your id>.mjs`. Your pictures: `docs/img/handpass/2026-11-22-fable-read-faults/<your id>/`,
  named `<scenario>-<step>-<desktop|phone>.png`. Open every picture you save before you count its step as looked at.
- A report, as your final message, of at most 60 lines, plain words: for each scenario and size PASS or FAIL against
  its EXPECTED line, naming the one or two pictures that decide it; each FINDING with the exact steps, what the screen
  showed, what the rule says it should show, and its picture; anything an everyday user would trip on that you met on
  the way (the plain-user round, §7.0a: press every control that opens or closes something — a window's ✕, Escape, a
  tap outside — and look at every other place that should show the result); errors seen; what you did NOT walk and why.
- A finding is a difference between the screen and the EXPECTED line or a rule quoted here. A problem that lives only in
  data already stored is not a finding (the owner's D56). A scheduler is always an admin (D785).
