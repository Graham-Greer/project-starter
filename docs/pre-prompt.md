# Pre-Prompt (Copy/Paste for New Chats)

Use this prompt at the start of any future chat to restore context and continue execution.

```text
Read the following files first and treat them as source of truth:
1) docs/session-context.md
2) docs/implementation-checklist.md
3) docs/engineering-standards.md
4) docs/component-system-plan.md
5) docs/component/ui.md
6) docs/component/patterns.md
7) docs/component/sections.md

After reading, summarize current status in 5-8 bullets, identify the next unchecked core task, and proceed to implement it end-to-end.

Rules:
- Follow component-first folder conventions.
- Use design tokens from globals.css; avoid one-off styles.
- Compose from primitives -> ui -> patterns -> sections.
- Update checklist/docs when tasks are completed or contracts change.
- If blocked, state the blocker and propose the smallest unblocking step.
```

## Short Version

```text
Read docs/session-context.md, docs/implementation-checklist.md, and docs/engineering-standards.md, then continue from the next unchecked core task.
```
