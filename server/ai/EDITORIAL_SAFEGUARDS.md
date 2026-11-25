# VIRALSTORY AI editorial generation safeguards

AI-generated output is a draft aid, never an authority. All AI output must pass schema validation and a human editorial/fact-check gate. The mock provider does not verify claims and explicitly labels output as research preview or fiction.

Six server-side prompt templates are versioned in `server/ai/editorial-prompts.ts`: research brief/claim extraction, English factual script, Tanzanian Kiswahili localization, storyboard, truthful hook alternatives, and final editorial audit. The prompt treats source text as untrusted evidence (not instructions), requires source IDs for factual statements, preserves uncertainty, refuses unsupported factual generation, and distinguishes facts, speculation, opinion, dramatization and fiction.

For factual mode, requests without sources and claims are rejected for more evidence. Every supported claim must reference supplied source IDs. Output fact statements referencing missing sources and speculation/dramatization without uncertainty notes are flagged for human review. These checks are structural safeguards, not semantic fact verification; they cannot prove that a source truly supports a claim.

Fiction or dramatized output must visibly label itself. Do not render or publish a factual story based on mock provider content. A final PASS must be produced only by a human reviewer comparing the output, claim ledger, references, captions, description and asset rights.

No external AI provider has been connected. Before enabling one, review terms, data retention, model safety, cost controls and Tanzania Kiswahili quality. Implement selected-section regeneration and comparison as explicit versioned operations; do not overwrite reviewed versions.
