# AgentUX PRD

## Product

AgentUX is a UX flow workspace for AI-built apps.

It helps developers:

1. See the current user flow of the app from code and runtime behavior.
2. Shape the intended flow they want next.
3. Export that intended flow back to an AI coding agent as a structured spec.

## Problem

AI tools are good at building pages, features, and components from local prompts, but they do not naturally preserve an app-level UX model over time.

As AI keeps building, the developer loses track of:

- what screens exist
- how screens connect
- where journeys start and end
- what the intended flow is
- where the app has drifted from the original UX

The result is prompt drift, fragmented navigation, and weak product coherence.

## Target Users

- Frontend developers building apps with AI copilots or coding agents
- Solo builders and indie hackers shipping quickly with AI
- Product-minded engineers and tech leads who need a shared flow model
- QA or onboarding contributors who need to understand the app journey fast

## Core Job To Be Done

"Help me understand the current user journey of my app, then let me define the intended next journey so I can direct the AI with a clear UX model instead of scattered prompts."

## Core Product Loop

1. Install AgentUX into the app.
2. AgentUX detects routes, screens, and navigation links.
3. The developer sees the current journey graph.
4. The developer edits or reorganizes the intended journey.
5. AgentUX exports a flow spec in Markdown plus structured data.
6. The developer feeds that spec back into the AI.
7. AgentUX is used again to verify whether the app now matches the intended flow.

## Key Use Cases

### 1. Understand Current Flow

- Show all screens and how they connect
- Reveal entry points, dead ends, hubs, and branches
- Show evidence for each edge or screen: static, runtime, or both
- Let the user inspect a screen's incoming and outgoing flows

### 2. Shape Intended Flow

- Start from the detected graph
- Add or remove edges
- Mark start and end steps
- Name a journey
- Hide irrelevant parts of the graph for a specific flow
- Export a clear next-state flow spec for AI

## Product Principles

- Optimize for journey clarity over route completeness.
- Keep current flow and intended flow separate.
- Stay code-aware and traceable to implementation.
- Prefer actionable insight over decorative visualization.
- Make exports implementation-useful for both humans and AI.
- Avoid becoming a generic whiteboard or analytics suite.

## MVP Scope

The MVP should support:

- current flow graph from static plus runtime data
- a node details panel
- filters for all screens, runtime-only screens, and problem nodes
- semantic intended-flow editing, not just node dragging
- Markdown plus structured export for AI handoff
- save and load of a local workspace file

## Non-Goals

Not in the first version:

- real-time multiplayer collaboration
- production analytics or session replay
- generic diagramming and whiteboarding
- code generation
- full customer lifecycle mapping across channels

## Success Signals

- A developer can understand the current app flow within minutes.
- A developer can define a target journey without leaving the tool.
- The exported flow spec is good enough to guide the next AI implementation step.
- The developer can compare what the app does now with what they want it to do next.

## Positioning

Recommended message:

"Install AgentUX in your app to see the real screen-to-screen flow, reshape the intended user journey, and send that flow back to your AI as a structured spec."
