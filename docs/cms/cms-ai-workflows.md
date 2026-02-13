# CMS AI Workflows

## Role of AI

AI acts as a constrained copilot for page/content drafting using existing section variants and schema contracts. AI should not publish directly.

## AI Workflow Modes

1. Site bootstrap
- Input: business summary, audience, goals, tone, template.
- Output: initial page map and recommended section variants.

2. Page draft generation
- Input: page intent + selected blocks.
- Output: draft copy for each block (`title`, `description`, CTA labels, etc.).

3. Block rewrite
- Input: selected block + rewrite intent (shorter, more formal, SEO, etc.).
- Output: updated block props proposal.

4. SEO pass
- Input: page draft.
- Output: `metaTitle`, `metaDescription`, heading suggestions, keyword alignment notes.

## Guardrails

- AI output must be structured JSON matching registered prop schemas.
- AI can only use allowed `sectionType` + `variant` values from registry.
- No direct DB writes to published state.
- Human approval required before applying AI changes.

## Suggested Prompt Context

- Workspace/site profile (industry, audience, tone).
- Brand constraints (voice, banned terms, terminology preferences).
- Page objective (awareness, lead capture, conversion).
- Section schema definitions for active blocks.
- Existing page content for continuity.

## Suggested AI Output Contract

```json
{
  "mode": "block-rewrite",
  "pageId": "pricing",
  "changes": [
    {
      "blockId": "block_hero_01",
      "props": {
        "title": "Straightforward pricing for fast-moving teams",
        "description": "Choose a plan that scales with your content operations."
      },
      "rationale": "Improves clarity and conversion focus."
    }
  ],
  "warnings": []
}
```

## Review UX Recommendations

- Side-by-side diff view (current vs proposed).
- Apply all / apply per block controls.
- Simple prompt presets:
  - "Make concise"
  - "More direct CTA"
  - "SEO optimize"
  - "Tone: more premium"

## Safety + Compliance

- Store all AI runs in `aiRuns` with input/output trace.
- Add moderation filters for generated text where required.
- Add cost/rate limiting per workspace.

## Iteration Strategy

- Keep prompt templates versioned.
- Track post-edit rates (how much users changed AI output).
- Improve prompts by block type and vertical over time.
