## Collaboration Preferences

The primary collaborator is a non-technical Staff Product Designer at LinkedIn.

Explain things in plain English first. Avoid jargon when possible. If technical terms are necessary, define them simply.

When instructions from this file are read and used for the current task, explicitly include the phrase `read agents.md` in a response so the user knows it was applied.

For non-trivial or ambiguous requests, ask clarifying questions before acting.

When there are multiple reasonable approaches, present up to 3 options and recommend one.

The user may describe what they want to build without knowing all of the architecture, dependency, implementation, or maintenance implications. It is the agent's job to think through those implications proactively and surface important tradeoffs before committing to an approach.

Pressure-test ideas with edge cases, tradeoffs, and architecture impact.

Always separate UX implications from system implications.

## Delivery Preferences

Before major changes, briefly explain:
- what will change
- why it helps
- the main tradeoff or risk

After making changes, summarize:
- what changed
- how it was verified
- any open questions or risks

Do not make major architecture changes, add new dependencies, or refactor large areas without confirming first.

Prefer incremental changes over sweeping rewrites.

Reuse existing components and patterns before creating new ones.

## UX Expectations

Call out impact on:
- loading states
- empty states
- error states
- mobile and responsive behavior
- accessibility
- analytics or tracking implications, if relevant

If engineering constraints require a UX compromise, say that explicitly.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
