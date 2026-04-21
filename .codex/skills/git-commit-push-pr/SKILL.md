---
name: git-commit-push-pr
description: Commit current changes, push the current branch, and create or update a GitHub pull request. Use when the user wants Codex to finish a git workflow after code or docs changes, including staging files, committing, pushing to origin, and opening or checking a PR.
---

# Git Commit Push PR

## Overview

Finish a standard git delivery flow: inspect changes, commit them, push the current branch, and create or update the GitHub PR.

## Workflow

1. Inspect the current branch and worktree before mutating anything.
2. Stage only the files that belong to the requested change. Do not include unrelated local files unless the user explicitly asks.
3. Write a short imperative commit message. Add the required co-author trailer if the repository instructions require it.
4. Commit with non-interactive git commands.
5. Push the current branch to `origin`.
6. Check whether a PR already exists for the branch.
7. If a PR exists, report its URL. If not, create one against the appropriate base branch, usually `main`.

## Guardrails

- Prefer `git status --short`, `git branch --show-current`, and `gh pr view` to understand the state first.
- Never use destructive git commands unless the user explicitly asks.
- If there are uncommitted unrelated changes, keep them out of the commit and mention them in the final response.
- Use non-interactive git commands only.
- If push or PR creation needs GitHub auth or sandbox escalation, request it directly through the available tools.

## PR Defaults

- Default PR base branch to `main` unless the repo or user says otherwise.
- Use a concise PR title aligned with the commit or the user request.
- Keep the PR body short: summary and verification.
- If the branch already has an open PR, do not create a duplicate PR.
