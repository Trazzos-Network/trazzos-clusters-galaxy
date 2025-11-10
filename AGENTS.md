# Agents Playbook – Trazzos Clusters Galaxy

This document describes the autonomous (or semi-autonomous) roles that keep the multi-cluster 3D visualization consistent, performant, and data-aligned. Each agent corresponds to logic already present in the codebase and can be implemented either as background jobs, CI steps, or manual playbooks.

---

## 1. Observatory Conductor (Visualization Orchestrator)

| Aspect              | Details                                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**         | Keeps the rendered galaxy in sync with cluster datasets, ensuring every company node, synergy hub, and connector is positioned and animated correctly.     |
| **Primary Modules** | `lib/store/visualization-store.ts`, `components/3d/Scene.tsx`, `components/3d/nodes/*`, `components/3d/connections/*`                                      |
| **Inputs**          | Cluster definitions (`data/clusters.ts`), processed company layouts (`lib/data/process-data.ts`), runtime feature flags (debug filters, connection modes). |
| **Outputs**         | Normalized state in the Zustand store (arrays of `ClusterVisualizationState`, connection caches, camera behavior flags).                                   |
| **Triggers**        | App bootstrap, auth personalization (`useAuthStore.personalizeForCompany`), user interactions that toggle filters or connection modes.                     |
| **Safeguards**      | Clamps node positions to `SURFACE_ALLOWED_HALF`, re-generates connections when layout changes, enforces offsets so clusters never overlap.                 |
| **Escalation**      | If state derivation fails (e.g., missing company in dataset), log to console and fallback to `PRECOMPUTED_CLUSTERS` to keep the scene usable.              |

---

## 2. Data Cartographer (Dataset Curator)

| Aspect              | Details                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**         | Harmonizes raw sample data into enriched 3D-ready structures and maintains geographic fidelity.                                                                                                                           |
| **Primary Modules** | `lib/data/process-data.ts`, `lib/data/locations.ts`, `data/sample.ts`, `data/sample-2.ts`                                                                                                                                 |
| **Inputs**          | Domain datasets (paradas, necesidades, sinergias, rfps), GPS locations, business metadata in `types/models.ts`.                                                                                                           |
| **Outputs**         | `EnrichedCompany[]`, normalized coordinates, calculated connection objects, synergy paths.                                                                                                                                |
| **Routines**        | - Project lat/lon into scene plane (`latLonTo3D`).<br />- Spread companies to avoid overlap (`spreadPositions`, `optimizeCompanyLayout`).<br />- Produce connection paths via `calculateConnections` and derived helpers. |
| **Validation**      | TypeScript branded IDs, geo-bounds checks (`clampToSurface`), `validated: true` flags in datasets.                                                                                                                        |
| **Escalation**      | When a company lacks location data, exclude it (returns `null` from `enrichWithLocation`) and report during build/test so coordinates can be researched (see `/docs/quick-start-guide.md`).                               |

---

## 3. Nexus Weaver (Connection Synthesizer)

| Aspect              | Details                                                                                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**         | Constructs and styles the different edge types that appear in 3D space (synergy, supply, RFP, and the fallback “baseline” connectors).                                                                                                              |
| **Primary Modules** | `lib/data/process-data.ts` (connection generation), `components/3d/connections/ConnectionLine.tsx`, `components/3d/hooks/useFilteredConnections.ts`                                                                                                 |
| **Inputs**          | `SinergiaDetectada` arrays per cluster, personalization state (focused company), debug preferences.                                                                                                                                                 |
| **Outputs**         | Render-ready `Connection` objects with 3D paths and metadata for styling, plus the active connection subset returned by `useFilteredConnections`.                                                                                                   |
| **Behaviors**       | - Adds natural connections for multi-company synergies.<br />- Creates muted “baseline” links whenever a focused user has no recorded synergy with another cluster member.<br />- Chooses particle effects and colors based on `CONNECTION_COLORS`. |
| **Risk Controls**   | Always clamps path points to the cluster plane to avoid Z-fighting, switches to muted visuals for baseline connectors (no bloom, no particles).                                                                                                     |
| **Escalation**      | If synergy data is missing, the agent should still emit baseline connections so the focus view never leaves a company isolated.                                                                                                                     |

---

## 4. Access Concierge (Personalization & Auth)

| Aspect              | Details                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**         | Tailors the scene to the authenticated company, centering the camera, filtering connections, and exposing only relevant data.                                                 |
| **Primary Modules** | `lib/store/auth-store.ts`, `lib/auth/company-access.ts`, `useVisualizationStore.personalizeForCompany`                                                                        |
| **Inputs**          | Access hash (URL param or stored token), company registry (`COMPANY_ACCESS_REGISTRY`).                                                                                        |
| **Outputs**         | Personalized cluster subset, selected node ID, sanitized state (other clusters remain available to switch back when logging out).                                             |
| **Behaviors**       | - Repositions the focus company to cluster center.<br />- Recomputes synergy/baseline connections around the focus.<br />- Triggers camera transition via `CameraController`. |
| **Guardrails**      | Falls back to default access record when hash is missing, resets state on logout, never mutates the source dataset.                                                           |
| **Escalation**      | On invalid hash the agent clears personalization and surfaces an error so support can verify access registry entries.                                                         |

---

## 5. Telemetry Scribe (Logging & KPI Monitor)

| Aspect              | Details                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**         | Tracks narrative feedback (summary logs) and quantifies performance of synergies and suppliers.                                                                                      |
| **Primary Modules** | Data sections inside `data/sample.ts` & `data/sample-2.ts` (`KPIS_2026_H1`, `LEADERBOARD_H1_2026`, `LOG_AUDITORIA_H1`), `components/panels/InfoPanel.tsx` for surfacing information. |
| **Inputs**          | Committee decisions, RFP evaluations, KPI snapshots.                                                                                                                                 |
| **Outputs**         | Human-readable console dashboards (see `console.log` blocks in dataset files), InfoPanel summaries for the currently selected company or synergy.                                    |
| **Behaviors**       | Keeps audit chronology, highlights top savings, informs the UI about “active” vs “pending” items.                                                                                    |
| **Escalation**      | When divergence is detected (e.g., RFP approved but no PO), flag in dataset comments and ensure `InfoPanel` reflects the pending follow-up (open question for business users).       |

---

## 6. Collaboration Protocols

1. **Data First** – Any agent modifying visualization must go through the Data Cartographer to avoid desynchronization between raw datasets and enriched state.
2. **Idempotent Updates** – Regenerate connections and node layouts using the existing helpers; never mutate datasets in-place.
3. **Color & Geometry Contracts** – Use palettes declared in `lib/utils/colors.ts` and meshes in `lib/utils/geometry.ts`. Agents proposing new categories must extend those maps first.
4. **Auth Safety** – Only the Access Concierge can change personalization; other agents should read from the centralized store.
5. **Audit Trail** – Changes impacting business outcomes (savings, committee decisions) must be duplicated into the telemetry datasets so the Telemetry Scribe remains authoritative.

---

## 7. Implementation Notes

- **TypeScript Only** – Keep agents strongly typed; leverage branded IDs from `types/models.ts`.
- **Absolute Imports** – Follow the `@/` module alias pattern used across the app.
- **No Randomization in Production Agents** – Force-layout helpers already include random nudging; if you run them offline, seed any randomness when moving to automation.
- **Refer to Docs** – `docs/architecture-diagram.md` and `docs/quick-start-guide.md` contain historical decisions; agents should treat them as prerequisites before altering workflows.

This playbook should evolve alongside the code. Whenever a new automated behavior is introduced, append a section describing its responsibilities, dependencies, and fallback strategy.
