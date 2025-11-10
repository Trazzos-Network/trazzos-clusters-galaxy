# Implementation Checklist & Roadmap
## 3D Petrochemical Network Visualization

---

## 📋 Pre-Development Phase

### Geographic Research (MUST DO FIRST!)
- [ ] Research Argos Cartagena plant coordinates
  - [ ] Find official address
  - [ ] Verify on Google Maps
  - [ ] Document lat/lon (format: 10.XXXX, -75.XXXX)
  - [ ] Note source URL
  
- [ ] Research Ajover Industrial facility coordinates
  - [ ] Find official address
  - [ ] Verify on Google Maps
  - [ ] Document lat/lon
  - [ ] Note source URL
  
- [ ] Research Yara Cartagena plant coordinates
  - [ ] Find official address
  - [ ] Verify on Google Maps
  - [ ] Document lat/lon
  - [ ] Note source URL
  
- [ ] Research Cabot facility coordinates
  - [ ] Find official address
  - [ ] Verify on Google Maps
  - [ ] Document lat/lon
  - [ ] Note source URL
  
- [ ] Research Reficar refinery coordinates
  - [ ] Find official address
  - [ ] Verify on Google Maps
  - [ ] Document lat/lon
  - [ ] Note source URL
  
- [ ] Research Esenttia plant coordinates
  - [ ] Find official address
  - [ ] Verify on Google Maps
  - [ ] Document lat/lon
  - [ ] Note source URL

### Coordinate Validation
- [ ] All 6 companies have real coordinates (not placeholders)
- [ ] All coordinates are within Cartagena bounds (10.3-10.5°N, -75.5 to -75.4°W)
- [ ] All coordinates are in WGS84 format (standard lat/lon)
- [ ] Source URLs documented for each location
- [ ] Coordinates plotted on test map to verify accuracy

---

## 🏗️ Phase 1: Project Setup

### Next.js Setup
- [ ] Create Next.js 14+ project with TypeScript
  ```bash
  npx create-next-app@latest petrochemical-3d --typescript --tailwind --app
  ```
- [ ] Verify project structure (app router)
- [ ] Test development server runs (`npm run dev`)

### Dependencies Installation
- [ ] Install Three.js: `npm install three`
- [ ] Install React Three Fiber: `npm install @react-three/fiber`
- [ ] Install Drei helpers: `npm install @react-three/drei`
- [ ] Install type definitions: `npm install -D @types/three`
- [ ] Install Zustand: `npm install zustand`
- [ ] Install map library: `npm install mapbox-gl` or `npm install leaflet react-leaflet`
- [ ] Verify all dependencies in package.json

### Project Structure Setup
- [ ] Create `src/components/ui/` directory
- [ ] Create `src/components/3d/` directory
- [ ] Create `src/components/panels/` directory
- [ ] Create `src/lib/data/` directory
- [ ] Create `src/lib/utils/` directory
- [ ] Create `src/lib/hooks/` directory
- [ ] Create `src/lib/store/` directory
- [ ] Create `src/types/` directory

### Data Files Setup
- [ ] Copy `models.ts` to `src/types/models.ts`
- [ ] Copy `sample_data_extended.ts` to `src/lib/data/sample_data_extended.ts`
- [ ] Create `src/lib/data/locations.ts` with researched coordinates
- [ ] Verify all imports work

---

## 🗺️ Phase 2: Data Layer

### Location Data Creation
- [ ] Create `COMPANY_LOCATIONS` array in `locations.ts`
- [ ] Add interface `CompanyLocation` with proper typing
- [ ] Include all 6 companies with real coordinates
- [ ] Add city, country, and source URL to each entry
- [ ] Export as const for type safety

### Data Processing Utilities
- [ ] Create `lib/data/process-data.ts`
- [ ] Implement `enrichWithLocation<T>()` function
  - [ ] Takes entity with `empresa` field
  - [ ] Returns entity + location data
  - [ ] Type-safe implementation
- [ ] Implement `enrichedCompanies` constant
  - [ ] Combines companies with location data
  - [ ] Adds paradas array
  - [ ] Adds necesidades array
- [ ] Implement `calculateConnections()` function
  - [ ] Company ↔ Company via synergies
  - [ ] Provider → Company via needs
  - [ ] Company → RFP via participation
  - [ ] Returns array of Connection objects
- [ ] Implement `calculateStrength()` function
  - [ ] Takes two entities
  - [ ] Returns strength value (0-1)
  - [ ] Different logic per connection type

### Coordinate Conversion Utilities
- [ ] Create `lib/utils/coordinates.ts`
- [ ] Define `MAP_BOUNDS` constant
  - [ ] north: 10.5
  - [ ] south: 10.3
  - [ ] east: -75.4
  - [ ] west: -75.5
- [ ] Define `MAP_SIZE` constant (100)
- [ ] Implement `latLonTo3D()` function
  - [ ] Takes lat, lon, elevation (optional)
  - [ ] Returns [x, y, z] tuple
  - [ ] Proper conversion math
- [ ] Test with known coordinates
- [ ] Verify output is within bounds [-50, 50]

### Geometry & Color Utilities
- [ ] Create `lib/utils/geometry.ts`
- [ ] Define `GEOMETRIES` object with all node types
  - [ ] company: BoxGeometry
  - [ ] provider: SphereGeometry
  - [ ] synergy: TetrahedronGeometry
  - [ ] rfp: ConeGeometry
  - [ ] offer: OctahedronGeometry
  - [ ] event: IcosahedronGeometry
- [ ] Create `lib/utils/colors.ts`
- [ ] Define `COLORS` object matching palette
  - [ ] background: #131313
  - [ ] dataviz[0-5]: as specified
- [ ] Define `NODE_COLORS` mapping
- [ ] Define `CONNECTION_COLORS` mapping

---

## 🎨 Phase 3: UI Foundation

### Tailwind Configuration
- [ ] Update `tailwind.config.ts` with custom colors
- [ ] Add dataviz color palette
- [ ] Test colors in simple component
- [ ] Update `globals.css` with base styles

### shadcn/ui Setup
- [ ] Install shadcn/ui if needed
- [ ] Add Button component (`npx shadcn-ui@latest add button`)
- [ ] Add Card component (`npx shadcn-ui@latest add card`)
- [ ] Add Switch component (`npx shadcn-ui@latest add switch`)
- [ ] Test components render correctly

### Basic Layout
- [ ] Update `app/page.tsx` with main layout
- [ ] Create dark background (#131313)
- [ ] Add full-height container
- [ ] Test responsive layout

---

## 🌐 Phase 4: 3D Scene Foundation

### Canvas Setup
- [ ] Create `components/3d/Scene.tsx`
- [ ] Import Canvas from @react-three/fiber
- [ ] Add basic scene structure
- [ ] Add ambient light
- [ ] Add directional light
- [ ] Test scene renders

### Camera & Controls
- [ ] Create `components/3d/Camera.tsx`
- [ ] Add PerspectiveCamera
  - [ ] Position: [50, 40, 50]
  - [ ] FOV: 60
  - [ ] makeDefault: true
- [ ] Add OrbitControls
  - [ ] enableDamping: true
  - [ ] dampingFactor: 0.05
  - [ ] minDistance: 10
  - [ ] maxDistance: 200
  - [ ] maxPolarAngle: π/2
- [ ] Test camera movement
- [ ] Verify controls feel smooth

### Lighting System
- [ ] Create `components/3d/environment/Lighting.tsx`
- [ ] Add AmbientLight
  - [ ] Intensity: 0.3
  - [ ] Color: #9aff8d
- [ ] Add DirectionalLight
  - [ ] Position: [10, 10, 5]
  - [ ] Intensity: 0.5
  - [ ] castShadow: true
- [ ] Optional: Add PointLights near nodes
- [ ] Test lighting looks good

---

## 🗺️ Phase 5: Map Layer

### Map Integration Decision
- [ ] Choose map provider (Mapbox or Leaflet)
- [ ] Create account if needed
- [ ] Get API key if needed

### MapPlane Component
- [ ] Create `components/3d/MapPlane.tsx`
- [ ] Add PlaneGeometry (100x100, 128x128 segments)
- [ ] Position: [0, -0.1, 0]
- [ ] Rotation: [-π/2, 0, 0]
- [ ] Add meshStandardMaterial
- [ ] Implement map texture loading
- [ ] Style map with green palette
- [ ] Add vector-style rendering
- [ ] Test map renders correctly

### Map Toggle Feature
- [ ] Add showMap state to store
- [ ] Implement toggle button
- [ ] Add opacity animation
- [ ] Test toggle works smoothly
- [ ] Style button with dataviz colors

---

## 🎯 Phase 6: Node System

### Base Node Component
- [ ] Create `components/3d/nodes/Node.tsx`
- [ ] Add base mesh structure
- [ ] Add hover state
- [ ] Add click handler
- [ ] Add scale animation on hover
- [ ] Add emissive effect on hover
- [ ] Test interaction works

### CompanyNode Component
- [ ] Create `components/3d/nodes/CompanyNode.tsx`
- [ ] Extend base Node component
- [ ] Use BoxGeometry
- [ ] Position using latLonTo3D()
- [ ] Apply company color (#74b600)
- [ ] Add company data prop
- [ ] Test all 6 companies render
- [ ] Verify positions on map

### ProviderNode Component
- [ ] Create `components/3d/nodes/ProviderNode.tsx`
- [ ] Use SphereGeometry
- [ ] Position using latLonTo3D() if location available
- [ ] Apply provider color (#a8d564)
- [ ] Test rendering

### FloatingNode Base
- [ ] Create `components/3d/nodes/FloatingNode.tsx`
- [ ] Implement hover animation
  - [ ] Base position
  - [ ] Hover height (2-5 units)
  - [ ] Sine wave bobbing
  - [ ] useFrame() hook
- [ ] Test animation is smooth
- [ ] Verify height is correct

### SynergyNode Component
- [ ] Create `components/3d/nodes/SynergyNode.tsx`
- [ ] Extend FloatingNode
- [ ] Use TetrahedronGeometry
- [ ] Apply synergy color (#9aff8d)
- [ ] Position relative to participating companies
- [ ] Test rendering

### RFPNode Component
- [ ] Create `components/3d/nodes/RFPNode.tsx`
- [ ] Extend FloatingNode
- [ ] Use ConeGeometry
- [ ] Apply RFP color (#f9d134)
- [ ] Test rendering

### OfferNode & EventNode
- [ ] Create OfferNode with OctahedronGeometry (#c4e8a0)
- [ ] Create EventNode with IcosahedronGeometry (#f9a600)
- [ ] Test all node types render with correct shapes

### Node Collection Component
- [ ] Create `components/3d/Nodes.tsx`
- [ ] Render all company nodes
- [ ] Render all provider nodes
- [ ] Render all floating nodes
- [ ] Use processed data from hooks
- [ ] Test full scene with all nodes

---

## 🔗 Phase 7: Connection System

### Connection Data Processing
- [ ] Verify `calculateConnections()` returns correct data
- [ ] Test connection strength calculations
- [ ] Verify all relationship types included

### ConnectionLine Component
- [ ] Create `components/3d/connections/ConnectionLine.tsx`
- [ ] Use Line from @react-three/drei OR BufferGeometry
- [ ] Get start and end Vector3 positions
- [ ] Apply connection color based on type
- [ ] Set uniform line width (0.5 or linewidth: 1)
- [ ] Set opacity (0.3-0.5)
- [ ] Make transparent: true
- [ ] Test single line renders

### Connections Collection
- [ ] Create `components/3d/Connections.tsx`
- [ ] Map over all connections
- [ ] Render ConnectionLine for each
- [ ] Test all connections visible
- [ ] Verify uniform thickness
- [ ] Check colors are correct

---

## 💫 Phase 8: Particle System

### ParticleFlow Component - Setup
- [ ] Create `components/3d/connections/ParticleFlow.tsx`
- [ ] Accept connection prop
- [ ] Calculate particle count from strength
  - [ ] Formula: `Math.ceil(strength * 10)`
- [ ] Calculate particle speed from strength
  - [ ] Formula: `strength * 0.5`
- [ ] Set up Points geometry
- [ ] Set up BufferGeometry
- [ ] Set up pointsMaterial

### ParticleFlow Component - Animation
- [ ] Initialize particle data array
  - [ ] Position
  - [ ] Progress (0-1)
  - [ ] Velocity
- [ ] Implement useFrame() hook
- [ ] Update particle progress each frame
- [ ] Interpolate position along line (Vector3.lerp)
- [ ] Loop particles back to start
- [ ] Update BufferAttribute positions
- [ ] Set needsUpdate flag
- [ ] Test particles move

### ParticleFlow Integration
- [ ] Add ParticleFlow to each ConnectionLine
- [ ] Pass connection data
- [ ] Test particle flow on all connections
- [ ] Verify more particles on strong connections
- [ ] Verify fewer particles on weak connections
- [ ] Test performance with all particles

---

## 🎮 Phase 9: Interaction & UI

### State Management
- [ ] Create `lib/store/visualization-store.ts`
- [ ] Set up Zustand store
- [ ] Add hoveredNode state
- [ ] Add selectedNode state
- [ ] Add showMap state
- [ ] Add filters state
- [ ] Add action functions
- [ ] Test store works

### Node Interaction
- [ ] Wire up onPointerOver to store
- [ ] Wire up onPointerOut to store
- [ ] Wire up onClick to store
- [ ] Test hover highlights node
- [ ] Test click selects node
- [ ] Add visual feedback for selection

### ControlPanel Component
- [ ] Create `components/panels/ControlPanel.tsx`
- [ ] Add map toggle button
- [ ] Add filter checkboxes
  - [ ] Companies
  - [ ] Providers
  - [ ] Synergies
  - [ ] RFPs
  - [ ] Offers
  - [ ] Events
- [ ] Style with Tailwind + dataviz colors
- [ ] Position in top-right
- [ ] Add backdrop blur
- [ ] Test all controls work

### InfoPanel Component
- [ ] Create `components/panels/InfoPanel.tsx`
- [ ] Show selected node details
  - [ ] Name
  - [ ] Type
  - [ ] Location (if applicable)
  - [ ] Connection count
  - [ ] Other relevant data
- [ ] Style with Tailwind + dataviz colors
- [ ] Position in bottom-left
- [ ] Add backdrop blur
- [ ] Test shows correct info
- [ ] Test hides when nothing selected

### Header Component
- [ ] Create `components/panels/Header.tsx`
- [ ] Add title: "Petrochemical Cluster 3D Network"
- [ ] Style with dataviz-0 color
- [ ] Position at top
- [ ] Optional: Add subtitle or info icon

---

## ⚡ Phase 10: Optimization

### Geometry Optimization
- [ ] Move geometry creation to useMemo()
- [ ] Reuse geometries across nodes
- [ ] Test no memory leaks

### Instanced Rendering
- [ ] Implement InstancedMesh for company nodes
- [ ] Implement InstancedMesh for provider nodes
- [ ] Update instance matrices efficiently
- [ ] Test performance improvement

### Particle Optimization
- [ ] Implement object pooling for particles
- [ ] Limit total particle count
- [ ] Only update visible particles
- [ ] Test performance improvement

### Connection Optimization
- [ ] Only render active connections
- [ ] Batch draw calls if possible
- [ ] Test performance improvement

### Level of Detail (Optional)
- [ ] Implement distance-based LOD
- [ ] High detail for close nodes
- [ ] Low detail for far nodes
- [ ] Test visual quality vs performance

### Performance Testing
- [ ] Test with Chrome DevTools Performance tab
- [ ] Verify 60 FPS maintained
- [ ] Check memory usage over time
- [ ] Verify no memory leaks after 5 minutes
- [ ] Test on different devices if possible

---

## 🧪 Phase 11: Testing & Validation

### Visual Testing
- [ ] All 6 companies render as boxes
- [ ] All boxes at correct geographic positions
- [ ] Map plane visible and styled correctly
- [ ] Synergies, RFPs, etc. float above surface
- [ ] All shapes match specification
- [ ] All colors match palette exactly
- [ ] Connection lines visible and uniform
- [ ] Particles flow along connections
- [ ] Particle count matches strength
- [ ] Hover effects work on all nodes
- [ ] Selection highlights work

### Interaction Testing
- [ ] Mouse drag rotates scene
- [ ] Scroll wheel zooms
- [ ] Right-click pans (if enabled)
- [ ] Cannot rotate below ground (maxPolarAngle works)
- [ ] Map toggle works
- [ ] Filter checkboxes work
- [ ] Node hover shows visual feedback
- [ ] Node click shows info panel
- [ ] Info panel displays correct data

### Data Integrity Testing
- [ ] All 6 companies have real coordinates
- [ ] Coordinates are accurate (verify on map)
- [ ] Original data structures not broken
- [ ] All connections calculated correctly
- [ ] Strength values are reasonable (0-1)
- [ ] No null/undefined errors

### Performance Testing
- [ ] FPS counter shows 60 FPS
- [ ] No frame drops during interaction
- [ ] Smooth particle animation
- [ ] No lag when toggling filters
- [ ] Memory usage stable
- [ ] No console errors or warnings

### Cross-Browser Testing (Optional)
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge

---

## 📝 Phase 12: Documentation & Polish

### Code Documentation
- [ ] Add JSDoc comments to key functions
- [ ] Document complex algorithms
- [ ] Add type documentation where needed
- [ ] Document component props

### User Documentation
- [ ] Create README.md
- [ ] Add installation instructions
- [ ] Add usage instructions
- [ ] Document controls
- [ ] Add screenshots/GIFs

### Polish & Refinement
- [ ] Adjust colors if needed
- [ ] Fine-tune animation speeds
- [ ] Adjust particle sizes
- [ ] Refine hover effects
- [ ] Smooth transitions
- [ ] Add loading states
- [ ] Add error boundaries

### Accessibility
- [ ] Add keyboard navigation (optional)
- [ ] Add screen reader support (for UI panels)
- [ ] Test with accessibility tools

---

## 🚀 Phase 13: Deployment

### Pre-Deployment
- [ ] Run production build: `npm run build`
- [ ] Test production build locally: `npm start`
- [ ] Fix any build errors
- [ ] Optimize bundle size
- [ ] Remove console.logs
- [ ] Remove debug code

### Deployment Setup
- [ ] Choose deployment platform (Vercel recommended)
- [ ] Configure environment variables
- [ ] Set up domain (optional)
- [ ] Configure analytics (optional)

### Deploy
- [ ] Deploy to platform
- [ ] Test deployed version
- [ ] Verify all features work
- [ ] Check performance on production

### Post-Deployment
- [ ] Monitor for errors
- [ ] Gather user feedback
- [ ] Plan improvements

---

## ✅ Final Verification Checklist

### Must-Have Features
- [x] All 6 companies have REAL coordinates from research
- [x] Location data properly integrated without breaking code
- [x] 3D scene renders with map plane
- [x] Each category uses correct shape (Box, Sphere, Pyramid, Cone, etc.)
- [x] Companies render at their geographic coordinates
- [x] Non-geographic elements float above surface
- [x] Connection lines drawn between related entities
- [x] Particles flow through connections
- [x] Particle flow rate reflects relationship strength
- [x] Vector map visible with proper styling
- [x] Map toggle button functional
- [x] Mouse controls work (rotate, zoom, pan)
- [x] Color palette strictly followed
- [x] All connections use uniform line thickness
- [x] Subtle, non-distracting visual design

### Quality Metrics
- [x] 60 FPS performance
- [x] No console errors
- [x] No TypeScript errors
- [x] Clean, maintainable code
- [x] Type-safe implementation
- [x] Proper component architecture
- [x] Responsive to window size

---

## 📊 Progress Tracking

Use this section to track overall progress:

```
Pre-Development:        [____________________]  0%
Phase 1 - Setup:        [____________________]  0%
Phase 2 - Data:         [____________________]  0%
Phase 3 - UI:           [____________________]  0%
Phase 4 - 3D Base:      [____________________]  0%
Phase 5 - Map:          [____________________]  0%
Phase 6 - Nodes:        [____________________]  0%
Phase 7 - Connections:  [____________________]  0%
Phase 8 - Particles:    [____________________]  0%
Phase 9 - Interaction:  [____________________]  0%
Phase 10 - Optimize:    [____________________]  0%
Phase 11 - Testing:     [____________________]  0%
Phase 12 - Docs:        [____________________]  0%
Phase 13 - Deploy:      [____________________]  0%

OVERALL:                [____________________]  0%
```

---

## 🆘 Troubleshooting Common Issues

### Map not showing
1. Check texture loading
2. Verify plane position (y = -0.1)
3. Check material opacity
4. Verify showMap state

### Nodes in wrong positions
1. Verify coordinate conversion math
2. Check MAP_BOUNDS values
3. Test with known coordinates
4. Log position values

### Particles not visible
1. Check particle size (increase if needed)
2. Verify material opacity
3. Check color matches connection color
4. Verify particle count > 0

### Performance issues
1. Check particle count (reduce if high)
2. Verify geometry reuse
3. Check for memory leaks
4. Use React DevTools Profiler
5. Consider instanced rendering

### TypeScript errors
1. Check all types are imported
2. Verify interface compatibility
3. Use type guards where needed
4. Check for null/undefined handling

---

## 📞 Need Help?

If stuck on a specific task:

1. **Read the main specification** - Most answers are there
2. **Check the architecture diagram** - See how components fit together
3. **Review the quick start guide** - See code examples
4. **Consult Three.js docs** - For 3D-specific questions
5. **Check React Three Fiber docs** - For R3F patterns
6. **Google the error** - Many issues are common

---

**Remember: The most important step is getting real coordinates FIRST!** ⚠️🗺️

Once you have accurate location data, the rest of the visualization will fall into place naturally. Good luck! 🚀
