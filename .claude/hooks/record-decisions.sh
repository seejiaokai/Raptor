#!/usr/bin/env bash
# Fires on EVERY message the owner sends (UserPromptSubmit).
#
# Why a hook and not a rule: the lapse it guards against is not forgetting, it is
# MISCLASSIFYING — a ruling stated mid-task gets absorbed into the work, executed
# correctly, and that feels handled. Because the work comes out right, nothing
# feels missing. A rule the agent already agrees with does not catch that; only
# something that fires at the moment of hearing does. Owner, 21 Sep 26: "This is
# a recurring problem ... How do we fix your behavior lapse?"
#
# It deliberately says nothing about the message's content — it cannot read it
# usefully, and a guess would train the agent to ignore it. It asks one question.
exit_ok() { exit 0; }
trap exit_ok ERR

cat <<'NOTE'
<decision-check>
Before acting on this message: does it contain a DECISION, RULING, PREFERENCE,
CORRECTION, "leave it", explicit NO, or a supersession of something earlier —
anything that outlives the task in front of you?

If yes: append it to DECISIONS.md FIRST — his words, what it means, and the file
that will now carry it — and then make sure that file actually carries it. The
work absorbing a ruling is not the record keeping it.

If no (an ordinary task instruction), ignore this and carry on.

Either way, the closing report carries a `Rulings:` line.
</decision-check>
NOTE
exit 0
