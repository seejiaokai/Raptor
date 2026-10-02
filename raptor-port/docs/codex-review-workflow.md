# Temporary Codex roles — D496, 2 Oct 26

Until Monday 5 Oct 26 at 19:00 (Asia/Singapore), the owner uses Codex only:

- Astra (`gpt-6-astra`) plans and coordinates: read the relevant rules and backlog,
  propose product questions in rounds of at most four with a recommendation each,
  then write a plan from the owner's answers. It must not invent unanswered requirements.
- Sol 6.1 (`gpt-6.1-sol`) independently challenges Astra's plan, then builds and fixes.
- Astra independently designs the build's check scenarios. A separate fresh Astra inspector
  reads Sol's final code; the planning/coordinating agent may reconcile findings, but never
  approve its own plan or any code it wrote. Final reads preserve the fresh-session safeguard.
- Sol runs the applicable bug check in full: the running app and pictures, automated gates,
  recorded failures and fixes, and the evidence sheet. Passing tests alone is not approval.

The main chat remains on the owner's selected Sol 6.1 model. The host cannot change that
selection; it calls model-specific subagents and relays questions and findings here. This is
automatic delegation, not an assertion that the visible conversation changed models.

Use concrete briefs with the baseline, scope, acceptance criteria, relevant rules, and evidence.
Keep each read's complete findings and dispositions. A finding needs a concrete failure, cause,
and fix (D489). A failed, empty, blocked or incomplete read is not approval. Cap plan review at
three rounds and final code inspection at two (initial read plus one fresh read after fixes). Working-guide
reviews retain D70's one round per reviewer; do not apply the broader code-inspection budget to guides. Report
unresolved findings instead of manufacturing agreement. Later code changes require another read
of the affected snapshot. Reviewers do not edit the code they are inspecting.

This adapts the installed Claudex loop's bounded review/fix pattern to the owner's explicit
same-provider request. It does not run the Claudex cross-provider approval runner, invoke Claude,
or claim Claude/Fable approval. The existing Claude skills and hooks are unchanged.

D496 narrows D494's ban on Codex-side independent reads and the temporary reviewer roles/counts
under D67, D70, D353 and D492. It does not remove the independence rule: the model that wrote an
artifact does not approve it. Work already authored by Astra needs a Sol read now; Astra cannot
certify its own earlier work. Claude reviews all Codex branches and plans after the reset,
including any working-guide changes, before anything reaches main (D494). No pull request for
merging, merge or main push is authorized. Each build keeps its own codex/ branch.

The first job remains Discard marks removal; the subsequent batch order remains D495. File this
temporary arrangement with the Monday handoff. After the reset, return to the original
cross-provider reviewer arrangement unless the owner gives another ruling.
