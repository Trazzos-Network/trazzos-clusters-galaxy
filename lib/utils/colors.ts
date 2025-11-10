/**
 * Color palette for the 3D visualization
 * Strict adherence required - use only these colors
 */

export const COLORS = {
  background: "#131313",
  foreground: "#ffffff",
  primary: "#cbffc4",
  dataviz: {
    0: "#9aff8d", // Bright lime green - Critical synergies, primary connections
    1: "#74b600", // Medium green - Companies
    2: "#a8d564", // Light olive green - Providers
    3: "#c4e8a0", // Pale green - Offers
    4: "#f9d134", // Golden yellow - RFPs, active events
    5: "#f9a600", // Bright orange - Alerts, critical materials
  },
} as const;

/**
 * Node colors by category
 */
export const NODE_COLORS = {
  company: COLORS.dataviz[1],
  provider: COLORS.dataviz[2],
  synergy: COLORS.dataviz[0], // #9aff8d
  rfp: COLORS.dataviz[4], // #f9d134
  offer: COLORS.dataviz[3], // #c4e8a0
  event: COLORS.dataviz[5], // #f9a600
} as const;

/**
 * Connection colors by type
 */
export const CONNECTION_COLORS = {
  mutedSynergy: "#333333", // #74b600
  synergy: COLORS.primary, // #cbffc4
  supply: COLORS.dataviz[2], // #a8d564
  need: COLORS.dataviz[4], // #f9d134
  rfp: COLORS.dataviz[5], // #f9a600
} as const;

export type NodeColorKey = keyof typeof NODE_COLORS;
export type ConnectionColorKey = keyof typeof CONNECTION_COLORS;
