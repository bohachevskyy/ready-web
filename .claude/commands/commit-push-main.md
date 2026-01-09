---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git push:*)
description: Commit changes and push to main branch
---

Commit all current changes with a concise commit message (one sentence, max 10 words). Push the changes to main branch.

Stage all files using `git add .` without reviewing git history.

If the current branch is not main, prompt the user about it.