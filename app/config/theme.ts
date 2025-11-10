export const THEME = {
  background: "#131313",
  nodes: {
    primary: "#9aff8d", // dataviz-0: Main companies
    secondary: "#74b600", // dataviz-1: Providers
    tertiary: "#a8d564", // dataviz-2: Facilities
    quaternary: "#c4e8a0", // dataviz-3: Support entities
  },
  edges: {
    synergy: "#f9d134", // dataviz-4: Synergy connections
    supply: "#f9a600", // dataviz-5: Supply chains
    service: "#a8d564", // dataviz-2: Services
    offer: "#9aff8d", // dataviz-0: Offers
  },
  particles: {
    glow: "#ffffff",
    trail: "#9aff8d",
  },
} as const;
