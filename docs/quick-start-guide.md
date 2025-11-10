# Quick Start Guide - 3D Petrochemical Network Visualization

## 🚀 Immediate Action Items

### STEP 1: Geographic Research (DO THIS FIRST!) ⚠️
Before writing any code, research and document the real coordinates for all companies:

```typescript
// Create: lib/data/locations.ts

export const COMPANY_LOCATIONS = [
  {
    empresa: "Argos",
    name: "Argos Cartagena Plant",
    lat: 10.XXXX, // TODO: RESEARCH THIS
    lon: -75.XXXX, // TODO: RESEARCH THIS
    city: "Cartagena",
    country: "Colombia",
    source: "URL_OF_SOURCE"
  },
  {
    empresa: "Ajover",
    name: "Ajover Industrial",
    lat: 10.XXXX, // TODO: RESEARCH THIS
    lon: -75.XXXX, // TODO: RESEARCH THIS
    city: "Cartagena",
    country: "Colombia",
    source: "URL_OF_SOURCE"
  },
  // ... ADD ALL 6 COMPANIES
  // "Argos" | "Ajover" | "Yara" | "Cabot" | "Reficar" | "Esenttia"
];
```

**Search Tips:**
- Look for "Mamonal Industrial Zone Cartagena Colombia"
- Search "[Company Name] Cartagena location"
- Use Google Maps, OpenStreetMap, or company websites
- Cartagena industrial area is typically around: 10.3-10.5°N, -75.5 to -75.4°W

---

## 📦 Installation Steps

```bash
# 1. Create Next.js project
npx create-next-app@latest petrochemical-3d --typescript --tailwind --app
cd petrochemical-3d

# 2. Install 3D dependencies
npm install three @react-three/fiber @react-three/drei
npm install @types/three -D

# 3. Install state management
npm install zustand

# 4. Install map library (choose one)
npm install mapbox-gl @types/mapbox-gl
# OR
npm install leaflet @types/leaflet react-leaflet

# 5. Copy your data files
# Copy models.ts and sample_data_extended.ts to your project
```

---

## 🏗️ Build Order (Follow This Sequence)

### Day 1: Foundation
```
✓ Create locations.ts with REAL coordinates
✓ Set up Next.js project structure
✓ Install dependencies
✓ Create basic Scene.tsx component
✓ Add OrbitControls and Camera
✓ Test basic 3D rendering
```

### Day 2: Geographic Layer
```
✓ Implement MapPlane component
✓ Integrate map library (Mapbox/Leaflet)
✓ Create coordinate conversion utility
✓ Add map toggle functionality
✓ Style map with green palette
```

### Day 3: Node System
```
✓ Create base Node component
✓ Implement shape mapping (Box, Sphere, Pyramid, Cone)
✓ Create CompanyNode with geographic positioning
✓ Create FloatingNode with hover animation
✓ Position all companies on map
```

### Day 4: Connections
```
✓ Calculate relationships from data
✓ Implement ConnectionLine component
✓ Create relationship strength logic
✓ Test connection rendering
```

### Day 5: Particles
```
✓ Create ParticleFlow component
✓ Implement particle movement along lines
✓ Add strength-based particle count
✓ Optimize particle performance
```

### Day 6: UI & Interaction
```
✓ Build ControlPanel component
✓ Build InfoPanel component
✓ Add node hover/click handlers
✓ Implement filters
```

### Day 7: Polish & Deploy
```
✓ Performance optimization
✓ Add error boundaries
✓ Test all features
✓ Document usage
✓ Deploy
```

---

## 🎨 Color Reference (Copy-Paste Ready)

```typescript
// lib/utils/colors.ts
export const COLORS = {
  background: '#131313',
  dataviz: {
    0: '#9aff8d', // Critical synergies, primary
    1: '#74b600', // Companies
    2: '#a8d564', // Providers
    3: '#c4e8a0', // Offers
    4: '#f9d134', // RFPs, events
    5: '#f9a600', // Alerts, critical
  }
} as const;

export const NODE_COLORS = {
  company: COLORS.dataviz[1],
  provider: COLORS.dataviz[2],
  synergy: COLORS.dataviz[0],
  rfp: COLORS.dataviz[4],
  offer: COLORS.dataviz[3],
  event: COLORS.dataviz[5],
} as const;

export const CONNECTION_COLORS = {
  synergy: COLORS.dataviz[0],
  supply: COLORS.dataviz[2],
  need: COLORS.dataviz[4],
  rfp: COLORS.dataviz[5],
} as const;
```

---

## 📐 Shape Reference

```typescript
// lib/utils/geometry.ts
import * as THREE from 'three';

export const GEOMETRIES = {
  company: new THREE.BoxGeometry(1, 1, 1),
  provider: new THREE.SphereGeometry(0.5, 16, 16),
  synergy: new THREE.TetrahedronGeometry(0.5, 0),
  rfp: new THREE.ConeGeometry(0.5, 1, 16),
  offer: new THREE.OctahedronGeometry(0.5, 0),
  event: new THREE.IcosahedronGeometry(0.5, 0),
} as const;

export type NodeType = keyof typeof GEOMETRIES;
```

---

## 🗺️ Coordinate Conversion Template

```typescript
// lib/utils/coordinates.ts

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Adjust these based on your actual data
const CARTAGENA_BOUNDS: MapBounds = {
  north: 10.5,
  south: 10.3,
  east: -75.4,
  west: -75.5
};

const MAP_SIZE = 100; // 3D plane size

export function latLonTo3D(
  lat: number, 
  lon: number, 
  elevation = 0
): [number, number, number] {
  const x = ((lon - CARTAGENA_BOUNDS.west) / 
    (CARTAGENA_BOUNDS.east - CARTAGENA_BOUNDS.west)) * MAP_SIZE - MAP_SIZE / 2;
  
  const z = ((lat - CARTAGENA_BOUNDS.south) / 
    (CARTAGENA_BOUNDS.north - CARTAGENA_BOUNDS.south)) * MAP_SIZE - MAP_SIZE / 2;
  
  const y = elevation / 100;
  
  return [x, y, z];
}
```

---

## 🔧 Essential Components (Copy & Adapt)

### Scene.tsx (Starter)
```typescript
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import MapPlane from './MapPlane';
import CompanyNodes from './CompanyNodes';
import Connections from './Connections';
import Particles from './Particles';

export default function Scene() {
  return (
    <Canvas shadows>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[50, 40, 50]} fov={60} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#9aff8d" />
      <directionalLight position={[10, 10, 5]} intensity={0.5} castShadow />
      
      {/* Scene Elements */}
      <MapPlane />
      <CompanyNodes />
      <Connections />
      <Particles />
    </Canvas>
  );
}
```

### MapPlane.tsx (Starter)
```typescript
'use client';

import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function MapPlane({ visible = true }: { visible?: boolean }) {
  // TODO: Implement map texture loading
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[100, 100, 128, 128]} />
      <meshStandardMaterial 
        color="#2a2a2a"
        transparent
        opacity={visible ? 0.5 : 0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
```

### CompanyNode.tsx (Starter)
```typescript
'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLonTo3D } from '@/lib/utils/coordinates';

interface CompanyNodeProps {
  empresa: string;
  lat: number;
  lon: number;
  color: string;
}

export default function CompanyNode({ empresa, lat, lon, color }: CompanyNodeProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const [x, y, z] = latLonTo3D(lat, lon, 0);
  
  return (
    <mesh 
      ref={ref}
      position={[x, y, z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  );
}
```

---

## 📊 Data Processing Template

```typescript
// lib/data/process-data.ts

import { COMPANY_LOCATIONS } from './locations';
import { paradasData, necesidadesData, sinergiasData } from './sample_data_extended';

// Enrich companies with location data
export const enrichedCompanies = COMPANY_LOCATIONS.map(location => ({
  ...location,
  paradas: paradasData.filter(p => p.empresa === location.empresa),
  necesidades: necesidadesData.filter(n => n.empresa === location.empresa),
}));

// Calculate connections between entities
export function calculateConnections() {
  const connections = [];
  
  // Company to Company (via Synergies)
  for (const sinergia of sinergiasData) {
    for (let i = 0; i < sinergia.empresas.length; i++) {
      for (let j = i + 1; j < sinergia.empresas.length; j++) {
        connections.push({
          from: sinergia.empresas[i],
          to: sinergia.empresas[j],
          type: 'synergy',
          strength: calculateSynergyStrength(sinergia),
          data: sinergia
        });
      }
    }
  }
  
  // Add more connection types...
  
  return connections;
}

function calculateSynergyStrength(sinergia: any): number {
  return Math.min(1, 
    (sinergia.volumen_total / 500) * 
    (sinergia.empresas_involucradas / 6)
  );
}
```

---

## ✅ Testing Checklist

Before considering complete:

### Visual Tests
- [ ] All 6 companies render as boxes at correct positions
- [ ] Map plane is visible and styled correctly
- [ ] Companies are positioned on the map surface (not floating or underground)
- [ ] Floating elements (synergies, RFPs) hover 2-5 units above surface
- [ ] Connection lines are visible and uniform thickness
- [ ] Particles flow along connections
- [ ] More particles on strong connections, fewer on weak
- [ ] Colors match the specified palette exactly

### Interaction Tests
- [ ] Mouse drag rotates the scene
- [ ] Scroll wheel zooms in/out
- [ ] Right-click drag pans the camera
- [ ] Map toggle button works
- [ ] Node hover changes appearance
- [ ] Node click shows info panel

### Performance Tests
- [ ] Scene maintains 60 FPS with all nodes visible
- [ ] No lag when rotating camera
- [ ] Particles animate smoothly
- [ ] No memory leaks after 5 minutes of use

### Data Tests
- [ ] All 6 companies have real coordinates
- [ ] Coordinates are within Cartagena bounds
- [ ] All synergies create connections
- [ ] Connection strength matches data
- [ ] Info panel shows correct data

---

## 🐛 Common Issues & Solutions

### Issue: Map not visible
**Solution:** Check texture loading, verify map plane position (y = -0.1)

### Issue: Nodes in wrong positions
**Solution:** Verify coordinate conversion math, check map bounds

### Issue: Particles not visible
**Solution:** Check particle size, opacity, and material color

### Issue: Performance drops
**Solution:** Use instanced rendering, reduce particle count, implement LOD

### Issue: Lines not connecting properly
**Solution:** Verify Vector3 coordinates, check connection data structure

---

## 📚 Key Dependencies Version Reference

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "zustand": "^4.4.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

---

## 🎯 Priority Order

**MUST DO FIRST:**
1. Research and add real company coordinates
2. Test coordinate conversion on map
3. Render companies at correct positions

**DO NEXT:**
4. Add connection lines
5. Implement particle flow
6. Add floating elements

**DO LAST:**
7. Polish UI
8. Add advanced interactions
9. Optimize performance

---

## 📞 Getting Help

If stuck:
1. Check the main specification document
2. Review Three.js/React Three Fiber docs
3. Verify your data structure matches the types
4. Use console.log to debug coordinate calculations
5. Check browser console for errors

---

Remember: **Real coordinates first, then build!** 🗺️🚀
