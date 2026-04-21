---
name: git-branch-from-main
description: Update the local main branch and create a new branch from it using a structured naming flow. Use when the user wants to start new work from the latest main and needs Codex to ask for the branch type and branch name before creating a branch named <branch_type>/<branch_name>.
---

# Git Branch From Main

## Overview

Start new work from the latest `main` branch and create a correctly named branch after collecting the required naming inputs from the user.

## Required Questions

Ask these questions before creating the branch:

1. What type of branch is it?
   Allowed values: `feature`, `fix`, `docs`, `refactor`.
2. What is the name of the branch?

Build the final branch name as `<branch_type>/<branch_name>`.

## Workflow

1. Inspect the current branch and worktree before switching branches.
2. If there are local changes, preserve them safely before switching away from the current branch.
   Use stash only when needed to carry local work across branches.
3. Switch to `main`.
4. Pull the latest changes from `origin/main` with a fast-forward update.
5. Create the new branch from updated `main` using the collected branch type and branch name.
6. Restore any intentionally preserved local changes onto the new branch if that was part of the workflow.
7. Report the final branch name and whether any local changes were carried over.

## Naming Rules

- Keep the branch type exactly one of: `feature`, `fix`, `docs`, `refactor`.
- Normalize the branch name to lowercase hyphen-case before creating the branch.
- Do not add extra prefixes or suffixes.
- Final branch name must be exactly `<branch_type>/<branch_name>`.

## Guardrails

- Prefer `git fetch`, `git switch`, and `git pull --ff-only`.
- Do not discard user changes.
- If switching branches would overwrite local changes, preserve them first and explain what was preserved.
- Use non-interactive git commands only.
