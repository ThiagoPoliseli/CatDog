---
name: makuco-spec-generator
description: >
  Scaffolds a new spec file for a feature using the create-new-spec.sh script.
  Use this skill whenever the user wants to create a spec, write a specification,
  document a feature, start a new feature spec, create a new module spec, or
  scaffold a feature directory. Automatically collects required inputs (feature
  description, module, short-name) and runs the script to generate the spec
  scaffold, then fills in the spec_context.md with structured content.
argument-hint: "Feature description (e.g. 'User login with social providers')"
---

# Makuco Spec Generator

Scaffold a feature specification directory and populate `spec_context.md` using
the `create-new-spec.sh` script.

---

## When to Use

Invoke this skill when:
- The user asks to "create a spec", "write a spec", "document a feature", or
  "start a new spec"
- A new feature needs a structured specification file
- A new module needs to be created alongside its first feature spec

---

## Required Inputs

Collect the following before running the script. Ask only for what is missing —
if the user already provided values in their message, use them directly.

| Input | Flag | Required | Notes |
|---|---|---|---|
| Feature description | positional | Yes | Free-text description of the feature |
| Module | `--module-folder` OR `--module-name` | Yes | Use `--module-folder` for existing modules, `--module-name` to create a new one |
| Short name (slug) | `--short-name` | No | 2–4 word slug; derived from description if omitted |

To discover existing modules, list `.makuco/specs/` at the repo root.

---

## Procedure

### Step 1 — Gather Inputs

1. If the feature description is not provided, ask: *"Describe the feature in one
   sentence."*
2. List `.makuco/specs/` to check for existing modules.
   - If modules exist, ask whether to use an existing one (`--module-folder`) or
     create a new module (`--module-name`).
   - If no modules exist, ask for a new module name (`--module-name`).
3. If a short name is not provided and the description is longer than 4 words,
   ask: *"Provide a short slug for the feature (2–4 words), or press Enter to
   derive it from the description."* — skip if the user is in a hurry.

### Step 2 — Run the Script

Run the script with `--json` to get structured output:

```bash
bash .makuco/scripts/create-new-spec.sh --json \
  [--short-name "<slug>"] \
  (--module-folder "<existing-folder>" | --module-name "<new-name>") \
  "<feature description>"
```

**Script location:** `.makuco/scripts/create-new-spec.sh`
*(copied from `src/starters/scripts/create-new-spec.sh` by the Makuco CLI)*

Parse the JSON output to extract:
- `FEATURE_DIR` — root directory of the new feature
- `SPEC_FILE` — path to `spec_context.md`
- `CHANGELOG_FILE` — path to `changelog_context.md`
- `FEATURE_NUM` — zero-padded feature number (e.g. `001`)
- `MODULE_FOLDER` — resolved module folder name

### Step 3 — Populate `spec_context.md`

Open `SPEC_FILE` and fill it with the structured specification. The template
already exists at that path (copied from `spec-template.md`). Replace all
placeholder tokens (`[ID]`, `_Descreva…_`, etc.) with real content derived from
the conversation.

Minimum sections to fill:
1. **Identification block** — feature ID (`FEATURE-[FEATURE_NUM]`), module,
   status (`Rascunho`), creation date (today's date `YYYY-MM-DD`).
2. **Feature Objective** — 3–5 lines: what problem is solved, who benefits,
   business value.
3. **Who Accesses** — list roles/profiles that can use the feature.
4. **Assumptions** — any pre-conditions the user mentioned.
5. **Dependencies** — any features, APIs, or decisions the user referenced.

Leave optional sections marked as placeholders if the user hasn't provided the
information — do **not** invent details.

### Step 4 — Confirm and Report

After writing the file, output a brief summary:

```
Spec created:
  Module : <MODULE_FOLDER>
  Feature: <FEATURE_FOLDER>
  Files  :
    - <SPEC_FILE>
    - <CHANGELOG_FILE>
    - <FEATURE_DIR>/checklists/requirements.md
```

Then ask: *"Would you like to open the spec file and review it together?"*

---

## Error Handling

| Error message | Action |
|---|---|
| `pasta de módulo '...' não encontrada` | Re-list `.makuco/specs/` and ask the user to choose a valid module |
| `use apenas --module-folder OU --module-name` | Internal bug — retry with only one flag |
| Script not found | Ask the user to run `makuco init` first to scaffold the `.makuco/` folder |
| Any other non-zero exit | Show the raw stderr to the user and stop |

---

## Quality Check

Before finishing, verify:
- [ ] `spec_context.md` has no unfilled `[ID]` tokens in the identification block
- [ ] The feature objective section is not empty
- [ ] The file was actually written (non-zero size)
