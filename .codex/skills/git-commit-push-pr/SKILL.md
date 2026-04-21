---
name: git-commit-push-pr
description: Commit current changes, push the current branch, run focused pre-PR review subagents, and create or update a GitHub pull request. Use when the user wants Codex to finish a git workflow after code or docs changes, including staging files, committing, pushing to origin, running review agents, and opening or checking a PR.
---

# Git Commit Push PR

## Overview

Finish a standard git delivery flow: inspect changes, commit them, push the current branch, run focused review agents, and create or update the GitHub PR.

## Workflow

1. Inspect the current branch and worktree before mutating anything.
2. Stage only the files that belong to the requested change. Do not include unrelated local files unless the user explicitly asks.
3. Write a short imperative commit message. Add the required co-author trailer if the repository instructions require it.
4. Commit with non-interactive git commands.
5. Push the current branch to `origin`.
6. Resolve the PR base branch before review:
   - If a PR already exists, use its actual base branch.
   - If no PR exists, use the configured/default base branch, usually `main`.
7. Fetch the resolved base branch from origin.
8. Capture immutable review refs after push and fetch:
   - `base_sha`: the fetched base branch SHA, for example `git rev-parse origin/<BASE_BRANCH>`
   - `head_sha`: the current branch `HEAD`, for example `git rev-parse HEAD`
9. Run pre-PR review using four parallel subagents, one per review category:
   - Security Issues
   - Code Quality
   - Potential Race Conditions
   - Maintainability
10. If parallel subagents are unavailable, run the same four reviews sequentially with the same prompts.
11. Wait for all four reviews to finish before creating or updating a PR.
12. Summarize each review result separately. Include blocking findings, non-blocking notes, and any explicit "no findings" result.
13. Before PR creation or update, verify the remote branch still points at the captured `head_sha`.
14. If the remote branch moved, stop and rerun the reviews against the new `head_sha`.
15. If a PR exists, update its description with the latest summary, review results, and verification. If not, create one against the resolved base branch with those sections in the PR description.

## Subagent Review Instructions

Each subagent should receive only the captured review refs and its assigned review category. Ask it to inspect `base_sha...head_sha` and report concise findings with file references where applicable.

Use this review shape for every subagent:

```text
Review the diff from <BASE_SHA> to <HEAD_SHA> for <CATEGORY>. Focus only on that category. Return findings ordered by severity with file references. If there are no findings, state "No findings" and mention any residual risk.
```

Do not create the PR until all four review summaries are available.

## Guardrails

- Prefer `git status --short`, `git branch --show-current`, and `gh pr view` to understand the state first.
- Never use destructive git commands unless the user explicitly asks.
- If there are uncommitted unrelated changes, keep them out of the commit and mention them in the final response.
- Use non-interactive git commands only.
- If push or PR creation needs GitHub auth or sandbox escalation, request it directly through the available tools.
- Treat security, data-loss, build-breaking, and clear behavioral-regression findings as blocking. Stop before PR creation and ask the user whether to fix them first.

## PR Defaults

- Default PR base branch to `main` unless the repo or user says otherwise.
- Use a concise PR title aligned with the commit or the user request.
- Keep the PR body short: summary, subagent review results, and verification.
- Include a `Subagent Review` section in the PR description with one entry for each category:
  - Security Issues
  - Code Quality
  - Potential Race Conditions
  - Maintainability
- For each review category, summarize the subagent result as either blocking findings, non-blocking findings, or `No findings`.
- If the branch already has an open PR, do not create a duplicate PR.
