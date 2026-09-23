---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

# Executing Plans

## Overview

Load plan, review critically, execute all tasks, report when complete.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note:** Tell your human partner that Superpowers works much better with access to subagents (Claude Code, Codex CLI, Codex App, Copilot CLI, and Gemini CLI all qualify; see the per-platform tool refs in `../using-superpowers/references/`). If subagents are available, use subagent-driven-development instead of this skill.

## The Process

### Step 1: Load and Review Plan
1. Ensure an isolated workspace: use using-git-worktrees to create one or verify the existing one
2. Check the premise before building — a plan or handoff describes the world
   when it was written. `git fetch`, then:
   - `git status -sb`: "behind N" means fast-forward first. A file the handoff
     names but the tree lacks is more often an un-pulled branch than a wrong
     path.
   - For the branch it names: `git log --oneline origin/main..BRANCH` (empty =
     everything on it already landed) and `git log --oneline BRANCH..origin/main`
     (what it is missing). Read the state of any pull request it mentions.
   - If the work already landed, stop and say so instead of rebuilding it.
3. Read plan file
4. Review critically - identify any questions or concerns about the plan
5. If concerns: Raise them with your human partner before starting
6. If no concerns: Create todos for the plan items and proceed

### Step 2: Execute Tasks

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Complete Development

After all tasks complete and verified:
- Compare what you built with the plan's explicit instructions ("remove X",
  "add Y"), and list every one you did not follow, with the reason, before
  any review of the finished work. A deviation you surface is a decision; one
  the reviewer has to discover is a defect.
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use finishing-a-development-branch
- Follow that skill to verify tests, present options, execute choice

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Stop when blocked, don't guess
- Never start implementation on main/master branch without explicit user consent
