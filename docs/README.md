# 3D Petrochemical Cluster Network Visualization
## Complete Documentation Package

---

## 📦 Package Contents

This package contains everything an agent needs to build a production-ready 3D network visualization of a petrochemical industrial cluster. All documents are in Markdown format and can be read sequentially or as reference material.

### 📄 Document Overview

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **3d-network-visualization-prompt.md** | Complete technical specification | Read first - your comprehensive guide |
| **quick-start-guide.md** | Rapid implementation reference | Quick lookups during development |
| **architecture-diagram.md** | Visual system architecture | Understanding component relationships |
| **implementation-checklist.md** | Step-by-step task list | Daily progress tracking |

---

## 🎯 How to Use This Package

### For New Agents Starting Fresh

1. **First, Read**: `3d-network-visualization-prompt.md`
   - This is your bible - read it completely
   - Contains all requirements, specifications, and technical details
   - Includes color palette, shape mappings, and all critical rules
   
2. **Then, Reference**: `architecture-diagram.md`
   - Understand how components fit together
   - See the data flow
   - Visualize the 3D scene structure
   
3. **Start Building**: Use `implementation-checklist.md`
   - Follow the checklist sequentially
   - Check off tasks as you complete them
   - Track your progress
   
4. **Quick Reference**: Keep `quick-start-guide.md` open
   - Copy-paste code templates
   - Look up color codes
   - Find utility functions

### For Experienced Developers

1. Skim `3d-network-visualization-prompt.md` for requirements
2. Jump to specific sections as needed
3. Use `quick-start-guide.md` for code templates
4. Reference `implementation-checklist.md` to ensure nothing is missed

---

## 🚨 CRITICAL FIRST STEP

**BEFORE writing ANY code, you MUST:**

### Research Real Geographic Coordinates

The visualization requires **real** latitude and longitude coordinates for all 6 companies in the Cartagena, Colombia petrochemical cluster:

1. **Argos** - Cement plant
2. **Ajover** - Industrial facility
3. **Yara** - Chemical plant
4. **Cabot** - Carbon black facility
5. **Reficar** - Refinery
6. **Esenttia** - Petrochemical complex

**Search Tips:**
- Look for "Mamonal Industrial Zone Cartagena"
- Use Google Maps, OpenStreetMap
- Check company websites
- Expected range: ~10.3-10.5°N, -75.5 to -75.4°W
- Document your sources!

**DO NOT use placeholder coordinates** - this will break the entire visualization.

---

## 📋 Document Summaries

### 1. 3d-network-visualization-prompt.md (Main Specification)

**Length**: ~27KB  
**Read Time**: 30-45 minutes  
**Importance**: ⭐⭐⭐⭐⭐ (Essential)

**Contains:**
- Complete project overview
- Technology stack requirements
- Color palette (STRICT adherence required)
- Data structure details
- Geographic data enrichment process
- 3D scene architecture
- Node shape mapping (Box, Sphere, Pyramid, etc.)
- Visualization specifications
- Map layer implementation
- Connection system details
- Particle flow system
- Interaction & controls
- UI components
- Project structure
- Implementation workflow
- Performance considerations
- Acceptance criteria
- Critical warnings

**Key Sections:**
- `🚨 CRITICAL: Geographic Data Enrichment` - MUST READ FIRST
- `🗺️ 3D Scene Architecture` - Core visualization structure
- `🎨 Visualization Specifications` - Exact requirements
- `💫 Particle Flow System` - Animation details

---

### 2. quick-start-guide.md (Rapid Reference)

**Length**: ~12KB  
**Read Time**: 15 minutes  
**Importance**: ⭐⭐⭐⭐ (High)

**Contains:**
- Immediate action items
- Installation commands
- Build order (7-day plan)
- Color reference (copy-paste ready)
- Shape reference
- Coordinate conversion template
- Essential component starters
- Data processing templates
- Testing checklist
- Common issues & solutions
- Priority order

**Best For:**
- Quick code lookups
- Copy-paste templates
- Troubleshooting
- Color/shape references

---

### 3. architecture-diagram.md (Visual Reference)

**Length**: ~35KB  
**Read Time**: 20-30 minutes  
**Importance**: ⭐⭐⭐⭐ (High)

**Contains:**
- System architecture diagram (ASCII art)
- Data flow diagram
- Component hierarchy
- State management structure
- Performance strategy
- Color palette visual
- Shape reference visual
- Geographic coordinate system
- File structure with examples

**Best For:**
- Understanding system structure
- Visualizing relationships
- Planning architecture
- Reference during development

---

### 4. implementation-checklist.md (Task Tracker)

**Length**: ~20KB  
**Read Time**: Browse as needed  
**Importance**: ⭐⭐⭐⭐⭐ (Essential for tracking)

**Contains:**
- Pre-development checklist
- 13 implementation phases
- Detailed task lists for each phase
- Progress tracking system
- Final verification checklist
- Quality metrics
- Troubleshooting guide

**Best For:**
- Daily progress tracking
- Ensuring nothing is missed
- Maintaining momentum
- Quality assurance

---

## 🎨 Quick Reference: Color Palette

```css
--background: #131313;      /* Dark background */
--dataviz-0: #9aff8d;       /* Critical synergies */
--dataviz-1: #74b600;       /* Companies */
--dataviz-2: #a8d564;       /* Providers */
--dataviz-3: #c4e8a0;       /* Offers */
--dataviz-4: #f9d134;       /* RFPs */
--dataviz-5: #f9a600;       /* Alerts */
```

---

## 🔷 Quick Reference: Shape Mapping

```
Company  → Box (BoxGeometry)
Provider → Sphere (SphereGeometry)
Synergy  → Pyramid (TetrahedronGeometry)
RFP      → Cone (ConeGeometry)
Offer    → Octahedron (OctahedronGeometry)
Event    → Icosahedron (IcosahedronGeometry)
```

---

## 🗺️ Quick Reference: Coordinate System

```typescript
const MAP_BOUNDS = {
  north: 10.5,   // Northern edge of map
  south: 10.3,   // Southern edge of map
  east: -75.4,   // Eastern edge of map
  west: -75.5    // Western edge of map
};

function latLonTo3D(lat: number, lon: number): [number, number, number] {
  const x = ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100 - 50;
  const z = ((lat - MAP_BOUNDS.south) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100 - 50;
  return [x, 0, z];
}
```

---

## ⚡ Quick Start Commands

```bash
# 1. Create project
npx create-next-app@latest petrochemical-3d --typescript --tailwind --app

# 2. Install dependencies
cd petrochemical-3d
npm install three @react-three/fiber @react-three/drei zustand
npm install @types/three -D

# 3. Start development
npm run dev
```

---

## 📊 Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 14+ |
| UI Library | React | 18+ |
| Language | TypeScript | 5+ |
| 3D Engine | Three.js | Latest |
| 3D React | React Three Fiber | Latest |
| 3D Helpers | Drei | Latest |
| Styling | Tailwind CSS | 4 |
| State | Zustand | Latest |
| Maps | Mapbox GL / Leaflet | Latest |

---

## 🎯 Project Goals

Build an **interactive 3D visualization** that:

1. ✅ Shows petrochemical cluster companies at their real geographic locations
2. ✅ Visualizes relationships between entities (synergies, supplies, RFPs)
3. ✅ Animates data flow with particles moving through connections
4. ✅ Uses different 3D shapes for different entity types
5. ✅ Provides interactive controls (rotate, zoom, pan)
6. ✅ Displays information panels on node selection
7. ✅ Maintains 60 FPS performance
8. ✅ Follows strict color palette and design guidelines

---

## 🚀 Success Criteria

### Must-Have Features
- [ ] All 6 companies have real coordinates (not placeholders)
- [ ] 3D scene with toggleable vector map
- [ ] Companies render as boxes at correct positions
- [ ] Synergies, RFPs, etc. float above surface
- [ ] Connection lines between related entities
- [ ] Particles flow through connections based on strength
- [ ] Mouse controls (orbit, zoom)
- [ ] Color palette strictly followed
- [ ] 60 FPS performance

### Quality Metrics
- **Performance**: 60 FPS on modern hardware
- **Type Safety**: Zero TypeScript errors
- **Accuracy**: Real geographic coordinates
- **Visual Quality**: Professional, subtle, clear
- **Code Quality**: Clean, maintainable, well-typed

---

## ⚠️ Critical Rules (DO NOT VIOLATE)

1. **REAL COORDINATES ONLY** - No placeholders!
2. **DO NOT BREAK EXISTING DATA** - Only extend, never modify original interfaces
3. **UNIFORM LINE THICKNESS** - All connections same width
4. **FLOATING ELEMENTS** - Non-geographic items must hover (y=2-5)
5. **PARTICLE STRENGTH LOGIC** - More particles = stronger connection
6. **VECTOR MAPS ONLY** - No satellite imagery by default
7. **STRICT COLOR PALETTE** - Use only the 6 defined colors
8. **CORRECT SHAPES** - Each category has specific geometry type

---

## 🐛 Common Pitfalls to Avoid

1. ❌ Using placeholder coordinates
2. ❌ Breaking existing TypeScript interfaces
3. ❌ Making connection lines too thick
4. ❌ Placing all nodes at same height
5. ❌ Ignoring particle strength relationship
6. ❌ Using satellite map by default
7. ❌ Adding colors not in palette
8. ❌ Using wrong shapes for categories
9. ❌ Forgetting to optimize performance
10. ❌ Not testing on real data

---

## 📞 Support & Resources

### Official Documentation
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Drei Components](https://github.com/pmndrs/drei)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Useful Links
- [Three.js Examples](https://threejs.org/examples/)
- [R3F Examples](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Leaflet Documentation](https://leafletjs.com/)

---

## 📅 Recommended Timeline

### Week 1: Foundation
- **Days 1-2**: Research coordinates, set up project
- **Days 3-4**: Build data layer and utilities
- **Days 5-7**: Create 3D scene foundation

### Week 2: Core Features
- **Days 8-10**: Implement node system
- **Days 11-12**: Add connection system
- **Days 13-14**: Build particle flow

### Week 3: Polish & Deploy
- **Days 15-16**: Add UI and interactions
- **Days 17-18**: Optimize performance
- **Days 19-20**: Test and deploy

---

## ✅ Final Checklist Before Starting

Before writing your first line of code, ensure:

- [ ] I have read the complete main specification document
- [ ] I understand the coordinate system and conversion
- [ ] I know which shape maps to which entity type
- [ ] I have the color palette memorized or bookmarked
- [ ] I understand the particle flow logic
- [ ] I know the critical rules and won't violate them
- [ ] I have a plan for researching company coordinates
- [ ] I'm ready to follow the implementation checklist
- [ ] I understand this is a production-quality project

---

## 🎓 Learning Path

If you're new to any of these technologies:

1. **New to Three.js?**
   - Read: [Three.js Journey](https://threejs-journey.com/) (first 3 lessons)
   - Practice: Create a simple rotating cube

2. **New to React Three Fiber?**
   - Read: [R3F Getting Started](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
   - Practice: Create a simple scene with controls

3. **New to Next.js App Router?**
   - Read: [Next.js Tutorial](https://nextjs.org/learn)
   - Practice: Build a simple app

4. **New to TypeScript?**
   - Read: [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
   - Practice: Convert a JavaScript project to TypeScript

---

## 🌟 Best Practices

### During Development

1. **Commit Often**: Use Git and commit after each phase
2. **Test Incrementally**: Don't wait until the end
3. **Follow Types**: Let TypeScript guide you
4. **Check Performance**: Use Chrome DevTools regularly
5. **Ask Questions**: When stuck, refer back to docs
6. **Stay Organized**: Keep files in correct directories
7. **Comment Complex Logic**: Help your future self

### Code Quality

```typescript
// ✅ Good: Type-safe, descriptive
interface CompanyNode {
  id: string;
  empresa: Empresa;
  position: [number, number, number];
  connections: Connection[];
}

// ❌ Bad: Loose types, unclear
const node: any = {
  id: "1",
  data: {...},
  pos: [0, 0, 0]
};
```

---

## 🎉 You're Ready!

With these documents, you have everything needed to build a professional, production-ready 3D network visualization. Remember:

1. **Start with coordinates** - This is non-negotiable
2. **Follow the spec** - Everything is documented
3. **Use the checklist** - Don't miss any steps
4. **Test frequently** - Catch issues early
5. **Optimize gradually** - Get it working first
6. **Ask for help** - When genuinely stuck

---

## 📮 Document Updates

Last Updated: November 6, 2025

If you find any issues or have suggestions for improving these documents, please document them for future reference.

---

**Good luck building this amazing visualization!** 🚀🗺️✨

Remember: The most important code you'll write is in the `locations.ts` file with real coordinates. Everything else builds on that foundation!
