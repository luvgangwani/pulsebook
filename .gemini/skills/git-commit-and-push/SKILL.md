---
name: git-commit-and-push
description: Commit current changes and push the current branch to origin. Use when the user wants to save their work to the remote repository without creating a pull request.
---

# Git Commit and Push

## Overview

Save and sync current work by staging changes, committing them, and pushing to the remote repository.

## Workflow

1. Inspect the current branch and worktree before mutating anything.
2. Stage only the files that belong to the requested change. Do not include unrelated local files unless the user explicitly asks.
3. Write a short imperative commit message. Add the required co-author trailer: `Co-authored-by: Google Gemini <gemini-code-assist@google.com>`.
4. Commit with non-interactive git commands.
5. Push the current branch to `origin`.

## Guardrails

- Prefer `git status --short` and `git branch --show-current` to understand the state first.
- Never use destructive git commands unless the user explicitly asks.
- If there are uncommitted unrelated changes, keep them out of the commit and mention them in the final response.
- Use non-interactive git commands only.
- If push needs GitHub auth or sandbox escalation, request it directly through the available tools.
