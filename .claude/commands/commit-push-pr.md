---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git checkout:*)
description: Commit changes and make a new pr to main
---

Commit all current changes with a concise commit message (one sentence, max 10 words). Push the branch to origin and create a PR targeting the main branch.

Stage all files using `git add .` without reviewing git history.

If the current branch is main, use best judgment to name a new branch and create it.