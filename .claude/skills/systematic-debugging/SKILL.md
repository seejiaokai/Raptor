---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

## Overview

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

**Don't skip when:**
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)
- Manager wants it fixed NOW (systematic is faster than thrashing)

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - They often contain the exact solution
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - Does it happen every time?
   - If not reproducible → gather more data, don't guess
   - Run it several times and note WHERE it fails: the same spot every time
     is deterministic (it depends on accumulated state), not flaky
   - If it will not reproduce, stop re-running it. Instrument a PASSING run:
     log the state the failing check depends on at each step. The mechanism
     is present on every run; only the outcome varies
   - Can't run the failing device or browser at all? See
     `device-only-bugs.md`
   - A flash, a jump or a flicker lives in ONE painted frame, so a check made
     after a wait can never see it. Reproduce it by sampling inside the page on
     every animation frame; pin it with a `MutationObserver` armed before the
     action, measuring in its callback — it runs at the microtask checkpoint,
     before the next rendering opportunity — never after a timeout

3. **Check Recent Changes**
   - What changed that could cause this?
   - Git diff, recent commits
   - New dependencies, config changes
   - Environmental differences:
     - A fresh clone or a CI checkout lacks your clone's local config and
       falls back to the machine's defaults (a linked worktree shares its
       repository's config, unless per-worktree config is switched on). Local
       green and a fresh checkout red: diff the checkouts' settings (line
       endings; `git config --show-origin --get-all <key>`) before the code,
       and rehearse the fix on a throwaway clone before paying for another
       slow pipeline run
     - A step that hangs after moving from your session to a service (or to
       another account) may be waiting on a person: a credential manager, an
       elevation prompt, a first-run question. With the CPU idle, the process
       tree's creation times (another account's command lines are hidden)
       show what started when the step began. A service can answer no prompt
       — make each one fail fast (for Git on Windows, both
       `GIT_TERMINAL_PROMPT=0` and `GCM_INTERACTIVE=never`) and switch off
       optional network look-ups
   - Did YOUR last change cause it? A symptom that appears right after a fix
     may be the fix's side effect on top of behaviour the app had on
     purpose — ask what the user expected before removing a deliberate rule
   - A cause someone else wrote down (a handoff, a review, an earlier chat)
     is a hypothesis: trust the symptom, re-measure the mechanism

4. **Gather Evidence in Multi-Component Systems**

   **WHEN system has multiple components (CI → build → signing, API → service → database):**

   **BEFORE proposing fixes, add diagnostic instrumentation:**
   ```
   For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   THEN investigate that specific component
   ```

   **Example (multi-layer system):**
   ```bash
   # Layer 1: Workflow
   echo "=== Secrets available in workflow: ==="
   echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

   # Layer 2: Build script
   echo "=== Env vars in build script: ==="
   env | grep IDENTITY || echo "IDENTITY not in environment"

   # Layer 3: Signing script
   echo "=== Keychain state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"
   ```

   **This reveals:** Which layer fails (secrets → workflow ✓, workflow → build ✗)

5. **Trace Data Flow**

   **WHEN error is deep in call stack:**

   See `root-cause-tracing.md` in this directory for the complete backward tracing technique.

   **Quick version:**
   - Where does bad value originate?
   - What called this with bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples**
   - Locate similar working code in same codebase
   - What works that's similar to what's broken?
   - "This looks different" on screen: read the element's computed style and
     diff it against a neighbour that looks right, before theorising from
     the screenshot

2. **Compare Against References**
   - If implementing pattern, read reference implementation COMPLETELY
   - Don't skim - read every line
   - Understand the pattern fully before applying

3. **Identify Differences**
   - What's different between working and broken?
   - List every difference, however small
   - Don't assume "that can't matter"

4. **Understand Dependencies**
   - What other components does this need?
   - What settings, config, environment?
   - What assumptions does it make?

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Write it down
   - Be specific, not vague

2. **Test Minimally**
   - Make the SMALLEST possible change to test hypothesis
   - One variable at a time
   - Don't fix multiple things at once

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis
   - DON'T add more fixes on top

4. **When You Don't Know**
   - Say "I don't understand X"
   - Don't pretend to know
   - Ask for help
   - Research more

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create Failing Test Case**
   - Simplest possible reproduction
   - Automated test if possible
   - One-off test script if no framework
   - MUST have before fixing
   - Use the `test-driven-development` skill for writing proper failing tests

2. **Implement Single Fix**
   - Address the root cause identified
   - ONE change at a time
   - No "while I'm here" improvements
   - No bundled refactoring

3. **Verify Fix**
   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?
   - Use the `verification-before-completion` skill before claiming success

4. **If Fix Doesn't Work**
   - STOP
   - Count: How many fixes have you tried?
   - If < 3: Return to Phase 1, re-analyze with new information
   - **If ≥ 3: STOP and question the architecture (step 5 below)**
   - DON'T attempt Fix #4 without architectural discussion

5. **If 3+ Fixes Failed: Question Architecture**

   **Pattern indicating architectural problem:**
   - Each fix reveals new shared state/coupling/problem in different place
   - Fixes require "massive refactoring" to implement
   - Each fix creates new symptoms elsewhere

   **STOP and question fundamentals:**
   - Is this pattern fundamentally sound?
   - Are we "sticking with it through sheer inertia"?
   - Should we refactor architecture vs. continue fixing symptoms?

   **Discuss with your human partner before attempting more fixes**

   This is NOT a failed hypothesis - this is a wrong architecture.

## Red Flags - STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt it differently"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- "That run must have been stale" (or "the fix works") about numbers that are
  identical before and after a change — either the change did nothing or the
  run never exercised it. Run the one check that tells them apart (the build
  time, the bundle actually served, a reused server) before saying either
- **"One more fix attempt" (when already tried 2+)**
- **Each fix reveals new problem in different place**

**ALL of these mean: STOP. Return to Phase 1.**

**If 3+ fixes failed:** Question the architecture (see Phase 4.5)

## your human partner's Signals You're Doing It Wrong

**Watch for these redirections:**
- "Is that not happening?" - You assumed without verifying
- "Will it show us...?" - You should have added evidence gathering
- "Stop guessing" - You're proposing fixes without understanding
- "Ultra-think this" - Question fundamentals, not just symptoms
- "We're stuck?" (frustrated) - Your approach isn't working

**When you see these:** STOP. Return to Phase 1.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question pattern, don't fix again. |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## When Process Reveals "No Root Cause"

If systematic investigation reveals issue is truly environmental, timing-dependent, or external:

1. You've completed the process
2. Document what you investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Add monitoring/logging for future investigation

**But:** 95% of "no root cause" cases are incomplete investigation.

**"Flaky" is a hypothesis, never a diagnosis.** Never paper over an
uninvestigated flaky TEST or check with a retry or a longer timeout — that
hides the mechanism. The handling above (a bounded retry, monitoring) is for a
genuinely external condition in the product itself, once the investigation has
proven one. For a flaky check, ask first:
- What does the check assert that the system does not promise? A background
  loop, a timer or a deferred write racing the assertion makes the outcome
  depend on how fast the runner is.
- What leaked between runs? A server a failed run never stopped holds its
  port and fails the next run; the pile-up looks random.
- Did it start right after a timing change? Then it is that change's bug
  announcing itself.
- Could a USER leave the same state behind? A test failing on what an earlier
  test left (a component that is never unmounted keeps per-window state) is
  evidence about state lifetime: if a user can reach the same carry-over —
  reopen, navigate, sign in again — it is a product bug. Reproduce it as its
  own test; don't add test cleanup.
- Can a person at ordinary pace reach the failing outcome? Then it is a
  product bug, however "load-sensitive" it looks — see
  `condition-based-waiting.md` §Before You Pace or Settle a Test.

A failure that moves between runs, lies outside your change and passes on its
own is a hypothesis that it is not yours — not an exoneration: your change
can leak a timer, a global or a server into whichever test runs next. Compare
the same run on the code before your change (or CI), and name the mechanism,
before calling it unrelated. Either way, record it — it is still a defect.

## Supporting Techniques

These techniques are part of systematic debugging and available in this directory:

- **`root-cause-tracing.md`** - Trace bugs backward through call stack to find original trigger
- **`defense-in-depth.md`** - Add validation at multiple layers after finding root cause
- **`condition-based-waiting.md`** - Replace arbitrary timeouts with condition polling
- **`device-only-bugs.md`** - Bugs you cannot reproduce here: phone-only, or seen only in a recording

**Performance problems:** name no cause before measuring. This project's
method and its measured dead ends are in `raptor-port/docs/performance.md`
("measure first", "Dead ends") — read them before proposing a fix.
