# AgentUX v0.1 Implementation Plan

## Goal

Ship a usable first version of AgentUX as a developer UX-flow workspace with two loops:

1. Understand the current app flow.
2. Create an intended flow and export it back to AI.

v0.1 should not try to solve collaboration, production analytics, or full journey intelligence. It should make the current repo good at the core loop.

## v0.1 Deliverables

### 1. Current Flow Truth

Deliver a trustworthy graph built from:

- static route detection
- static navigation link detection
- runtime navigation capture
- merged evidence labels

Expected user value:

- "What screens exist?"
- "How do they connect?"
- "What paths have I actually observed?"

Likely implementation areas:

- `src/analysis/index.ts`
- `src/analysis/link-detector.ts`
- `src/runtime/navigation-tracker.ts`
- `src/runtime/index.ts`
- `src/merge/index.ts`

### 2. Node Details And Flow Filters

Add UI that lets the user inspect the graph instead of only viewing it.

Scope:

- node details panel
- incoming and outgoing edge lists
- source evidence badges
- filters for:
  - all screens
  - runtime-only
  - dead ends
  - orphaned nodes

Likely implementation areas:

- `src/ui/index.tsx`
- `src/ui/Modal.tsx`
- `src/ui/Toolbar.tsx`
- `src/visualization/index.tsx`
- `src/visualization/RouteNode.tsx`
- `src/visualization/FlowEdge.tsx`

### 3. Intended Flow Editing

Add semantic editing on top of the detected graph.

Important:

Dragging nodes is layout editing, not flow editing. v0.1 needs flow editing primitives.

Scope:

- add edge
- remove edge
- mark journey start
- mark journey end
- create or rename a journey
- hide irrelevant nodes for a specific journey view

Likely implementation areas:

- `src/types.ts`
- new `src/workspace/` or `src/journeys/`
- `src/ui/index.tsx`
- `src/visualization/index.tsx`
- `src/visualization/FlowEdge.tsx`

### 4. Export Contract For AI Handoff

Replace plain graph export with a flow-spec export.

Export should include:

- product goal
- current flow
- intended flow
- requested changes
- open questions
- structured data block

Likely implementation areas:

- `src/export/index.ts`
- optional new export helpers under `src/export/`

### 5. Local Workspace Persistence

Let users save and reload edited intended flows.

Scope:

- save workspace JSON locally
- reload workspace
- keep base graph separate from intended edits

Likely implementation areas:

- `src/types.ts`
- new `src/workspace/`
- `src/ui/Toolbar.tsx`

## Data Model Changes

The current `AppMapData` model is not enough for intended-flow editing.

Add:

- `Journey`
- `Workspace`
- `RouteAnnotation`
- edge state for `current`, `intended`, `removed`
- optional screen role such as `entry`, `step`, `decision`, `terminal`

Recommended shape:

- `baseData: AppMapData`
- `journeys: Journey[]`
- `annotations: Record<string, RouteAnnotation>`
- `layout`
- `savedAt`

## Architecture Guidance

### Keep Three Layers Separate

1. `Detected graph`
   Source of truth from analysis and runtime

2. `Workspace state`
   User-authored intended flow changes

3. `Presentation state`
   Layout, selection, filters, zoom, side panels

Do not merge all of this into one mutable graph object.

### Treat Evidence As First-Class

Each route or edge should remain traceable to:

- static analysis
- runtime capture
- manual proposal

This is critical for trust.

## Recommended Build Sequence

### Milestone 1: Stabilize Current Flow

- improve route and link detection confidence
- ensure merge output is stable
- add tests for parser and merge edge cases

### Milestone 2: Extend Types

- add journey and workspace types
- introduce edge state and annotations
- keep backward compatibility where possible

### Milestone 3: Add Workspace State

- create workspace module
- load detected graph into editable intended-flow state
- support save and reload

### Milestone 4: Ship UI For Inspection

- node details panel
- filters
- selected journey view

### Milestone 5: Ship Semantic Editing

- add and remove edges
- start and end markers
- journey naming

### Milestone 6: Upgrade Export

- Markdown summary
- structured JSON block
- deterministic output format for AI

## Testing Plan

Add coverage for:

- workspace state transitions
- intended-flow editing behavior
- export output shape
- filter logic
- parser fidelity improvements

Likely test areas:

- `tests/analysis/`
- `tests/merge/`
- new `tests/workspace/`
- new `tests/ui/`
- new `tests/export/`

## Main Risks

- parser trust is not good enough for users to rely on the graph
- intended-flow edits get mixed into detected graph state
- large app graphs become noisy without filters
- export format changes too often to be reliable for AI workflows
- UI focuses on layout polish before semantic editing works

## v0.1 Exit Criteria

v0.1 is done when:

- a developer can install AgentUX and see a credible current flow
- a developer can create an intended journey on top of that flow
- AgentUX can export a stable flow spec that an AI agent can use for the next build step
- the workflow feels meaningfully better than prompting the AI without a shared UX artifact
