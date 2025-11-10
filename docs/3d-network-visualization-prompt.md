# 3D Petrochemical Cluster Network Visualization - Build Specification

## Project Overview
Build an interactive 3D network visualization of a petrochemical industrial cluster using **React 18+**, **Next.js 14+**, **TypeScript 5+**, **Three.js/React Three Fiber**, and **Tailwind CSS**. The visualization must display companies, synergies, providers, and their relationships in a geographic 3D space with real-time data flow animations.

---

## 🎯 Core Requirements

### 1. Technology Stack
```typescript
{
  "framework": "Next.js 14+ (App Router)",
  "ui": "React 18+ with TypeScript 5+",
  "3d": "Three.js + React Three Fiber (@react-three/fiber)",
  "controls": "@react-three/drei (OrbitControls, PerspectiveCamera, etc.)",
  "styling": "Tailwind CSS 4",
  "state": "Zustand or React Context for 3D state management",
  "maps": "Mapbox GL JS or Leaflet for geographic data",
  "animations": "Three.js animation system + custom shaders"
}
```

### 2. Color Palette (Strict Adherence Required)
```css
:root {
  --background: #131313;      /* Dark background */
  --dataviz-0: #9aff8d;       /* Bright lime green */
  --dataviz-1: #74b600;       /* Medium green */
  --dataviz-2: #a8d564;       /* Light olive green */
  --dataviz-3: #c4e8a0;       /* Pale green */
  --dataviz-4: #f9d134;       /* Golden yellow */
  --dataviz-5: #f9a600;       /* Bright orange */
}
```

**Color Assignment Strategy:**
- `--dataviz-0`: Critical synergies, primary connections
- `--dataviz-1`: Companies (Argos, Yara, etc.)
- `--dataviz-2`: Providers
- `--dataviz-3`: Offers
- `--dataviz-4`: Active RFPs, important events
- `--dataviz-5`: Alerts, critical materials

---

## 📊 Data Structure & Requirements

### Current Data Models
The project uses TypeScript interfaces from `/mnt/project/models.ts` and sample data from `/mnt/project/sample_data_extended.ts`:

**Key Entities:**
1. **ParadaProgramada** - Scheduled maintenance stops
2. **NecesidadMaterial** - Material needs
3. **SinergiaDetectada** - Detected synergies between companies
4. **Proveedor** - Suppliers
5. **OfertaProveedor** - Supplier offers
6. **RFPConjunta** - Joint RFPs

**Companies in Cluster:**
```typescript
type Empresa = "Argos" | "Ajover" | "Yara" | "Cabot" | "Reficar" | "Esenttia";
```

### 🚨 CRITICAL: Geographic Data Enrichment

**BEFORE building the visualization, you MUST:**

1. **Add Location Data to Companies**
   ```typescript
   interface CompanyLocation {
     empresa: Empresa;
     name: string;
     lat: number;
     lon: number;
     city: string;
     country: string;
   }
   
   // Example structure to create:
   const COMPANY_LOCATIONS: CompanyLocation[] = [
     {
       empresa: "Argos",
       name: "Argos Cartagena Plant",
       lat: 10.3910, // RESEARCH ACTUAL COORDINATES
       lon: -75.4794,
       city: "Cartagena",
       country: "Colombia"
     },
     // ... ADD ALL 6 COMPANIES WITH REAL COORDINATES
   ];
   ```

2. **Research Process (MANDATORY):**
   - Use web search to find actual lat/lon for each company's main facility in Cartagena, Colombia
   - Petrochemical cluster companies are typically in the Mamonal Industrial Zone
   - Validate coordinates are within reasonable bounds (Cartagena area: ~10.3-10.5°N, -75.5 to -75.4°W)
   - DO NOT use placeholder coordinates
   - DO NOT destroy existing data - only ADD location information

3. **Data Augmentation Pattern:**
   ```typescript
   // Extend existing interfaces WITHOUT breaking changes
   interface ParadaProgramadaWithLocation extends ParadaProgramada {
     location: CompanyLocation;
   }
   
   // Create mapping function
   function enrichWithLocation<T extends { empresa: Empresa }>(
     entity: T
   ): T & { location: CompanyLocation } {
     const location = COMPANY_LOCATIONS.find(l => l.empresa === entity.empresa);
     if (!location) throw new Error(`Location not found for ${entity.empresa}`);
     return { ...entity, location };
   }
   ```

---

## 🗺️ 3D Scene Architecture

### Scene Structure
```
Scene (Three.js)
├── Lighting
│   ├── AmbientLight (low intensity, #9aff8d tint)
│   ├── DirectionalLight (main light source)
│   └── PointLights (dynamic, near nodes)
├── Geographic Base
│   ├── MapPlane (3D plane with vector map texture)
│   └── WaterPlane (optional, for Caribbean Sea)
├── Nodes Layer
│   ├── Companies (BoxGeometry at lat/lon coordinates)
│   ├── Providers (SphereGeometry at lat/lon if available)
│   └── FloatingElements (non-geographic entities)
│       ├── Synergies (PyramidGeometry, hovering)
│       ├── RFPs (ConeGeometry, hovering)
│       └── Events (custom geometry, hovering)
├── Connections Layer
│   ├── LineGeometry (subtle, uniform thickness)
│   └── ParticleSystem (flow along connections)
└── UI Overlay (React DOM)
    ├── Info Panel
    ├── Map Toggle
    └── Filter Controls
```

### Node Shape Mapping (STRICT REQUIREMENT)
```typescript
enum NodeCategory {
  COMPANY = "company",
  PROVIDER = "provider",
  SYNERGY = "synergy",
  RFP = "rfp",
  OFFER = "offer",
  EVENT = "event"
}

const SHAPE_MAPPING = {
  [NodeCategory.COMPANY]: "BoxGeometry",      // Companies as boxes
  [NodeCategory.PROVIDER]: "SphereGeometry",  // Providers as spheres
  [NodeCategory.SYNERGY]: "TetrahedronGeometry", // Synergies as pyramids
  [NodeCategory.RFP]: "ConeGeometry",         // RFPs as cones
  [NodeCategory.OFFER]: "OctahedronGeometry", // Offers as octahedrons
  [NodeCategory.EVENT]: "IcosahedronGeometry" // Events as icosahedrons
} as const;
```

---

## 🎨 Visualization Specifications

### 1. Geographic Map Layer

**Requirements:**
- Use **vector-based map** (not satellite imagery)
- Implement Mapbox GL JS or similar for geographic accuracy
- Render as texture on a 3D plane (PlaneGeometry)
- Map style: Dark mode with green accent colors from palette
- Show coastlines, major roads, industrial zones
- Coordinate system: WGS84 (standard lat/lon)

**Toggle Implementation:**
```typescript
interface MapConfig {
  showMap: boolean;
  mapStyle: "vector" | "satellite";
  opacity: number;
}

// Button to toggle map visibility
<Button onClick={() => setMapConfig(prev => ({ 
  ...prev, 
  showMap: !prev.showMap 
}))}>
  {mapConfig.showMap ? "Hide Map" : "Show Map"}
</Button>
```

**Map Plane Setup:**
```typescript
function MapPlane({ config }: { config: MapConfig }) {
  const texture = useMapTexture(config.mapStyle);
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[100, 100, 128, 128]} />
      <meshStandardMaterial 
        map={texture}
        transparent
        opacity={config.showMap ? config.opacity : 0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
```

### 2. Node Positioning System

**Geographic Nodes (Companies, Providers with locations):**
```typescript
interface GeoPosition {
  lat: number;
  lon: number;
  elevation: number; // Meters above sea level, default 0
}

function latLonToCartesian(lat: number, lon: number, elevation = 0): THREE.Vector3 {
  // Convert lat/lon to 3D coordinates on the map plane
  // Assuming map bounds are known (Cartagena area)
  const MAP_BOUNDS = {
    north: 10.5,
    south: 10.3,
    east: -75.4,
    west: -75.5
  };
  
  const x = ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100 - 50;
  const z = ((lat - MAP_BOUNDS.south) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100 - 50;
  const y = elevation / 100; // Scale elevation appropriately
  
  return new THREE.Vector3(x, y, z);
}
```

**Floating Nodes (Synergies, Events, RFPs):**
```typescript
interface FloatingNodeConfig {
  basePosition: THREE.Vector3; // Center or reference point
  hoverHeight: number;          // 2-5 units above surface
  orbitRadius: number;          // Distance from center
  orbitSpeed: number;           // Animation speed
}

function FloatingNode({ config, type }: { 
  config: FloatingNodeConfig; 
  type: NodeCategory;
}) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    
    // Gentle hovering animation
    const t = state.clock.getElapsedTime();
    const hover = Math.sin(t * config.orbitSpeed) * 0.3;
    
    ref.current.position.y = config.basePosition.y + config.hoverHeight + hover;
  });
  
  return (
    <mesh ref={ref} position={config.basePosition}>
      {getGeometryForType(type)}
      <meshStandardMaterial color={getColorForType(type)} />
    </mesh>
  );
}
```

### 3. Connection Lines System

**Requirements:**
- Uniform thickness for all connections (0.05 units recommended)
- Subtle appearance - use low opacity (0.3-0.5)
- Color based on relationship type
- No excessive visual noise

**Implementation:**
```typescript
interface Connection {
  from: THREE.Vector3;
  to: THREE.Vector3;
  strength: number;      // 0-1, affects particle flow
  type: ConnectionType;  // Determines color
  active: boolean;
}

enum ConnectionType {
  SYNERGY = "synergy",           // Company ↔ Company
  SUPPLY = "supply",             // Provider → Company
  NEED = "need",                 // Company → Material Need
  RFP_PARTICIPATION = "rfp"      // Company → RFP
}

const CONNECTION_COLORS = {
  [ConnectionType.SYNERGY]: "#9aff8d",      // dataviz-0
  [ConnectionType.SUPPLY]: "#a8d564",       // dataviz-2
  [ConnectionType.NEED]: "#f9d134",         // dataviz-4
  [ConnectionType.RFP_PARTICIPATION]: "#f9a600" // dataviz-5
};

function ConnectionLine({ connection }: { connection: Connection }) {
  const points = [connection.from, connection.to];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial 
        color={CONNECTION_COLORS[connection.type]}
        opacity={0.4}
        transparent
        linewidth={1} // Note: linewidth > 1 requires THREE.Line2
      />
    </line>
  );
}
```

**Advanced Lines (if needed):**
```typescript
import { Line } from '@react-three/drei';

function EnhancedConnectionLine({ connection }: { connection: Connection }) {
  return (
    <Line
      points={[connection.from, connection.to]}
      color={CONNECTION_COLORS[connection.type]}
      lineWidth={0.5}
      transparent
      opacity={0.4}
    />
  );
}
```

### 4. Particle Flow System

**Concept:**
- Particles flow along connection lines
- Flow rate proportional to relationship strength
- Stronger connections = more particles, faster movement
- Weaker connections = fewer particles, slower movement

**Implementation:**
```typescript
interface Particle {
  position: THREE.Vector3;
  velocity: number;
  progress: number; // 0-1 along the connection line
  size: number;
}

interface ParticleFlowConfig {
  connection: Connection;
  particleCount: number; // Based on strength: Math.ceil(strength * 10)
  speed: number;         // Based on strength: strength * 0.5
  color: string;
}

function ParticleFlow({ config }: { config: ParticleFlowConfig }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particlesData = useRef<Particle[]>([]);
  
  useEffect(() => {
    // Initialize particles
    const count = Math.ceil(config.connection.strength * 10);
    particlesData.current = Array.from({ length: count }, (_, i) => ({
      position: new THREE.Vector3(),
      velocity: config.connection.strength * 0.5,
      progress: i / count, // Stagger initial positions
      size: 0.1
    }));
  }, [config.connection.strength]);
  
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const { from, to } = config.connection;
    const positions = particlesRef.current.geometry.attributes.position;
    
    particlesData.current.forEach((particle, i) => {
      // Update progress
      particle.progress += particle.velocity * delta;
      
      // Loop back to start
      if (particle.progress > 1) {
        particle.progress = 0;
      }
      
      // Interpolate position along line
      particle.position.lerpVectors(from, to, particle.progress);
      
      // Update geometry
      positions.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
    });
    
    positions.needsUpdate = true;
  });
  
  const count = Math.ceil(config.connection.strength * 10);
  const positions = new Float32Array(count * 3);
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={config.color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}
```

### 5. Relationship Strength Calculation

```typescript
function calculateConnectionStrength(entity1: any, entity2: any): number {
  // Different calculation methods based on entity types
  
  // Example: Synergy strength based on volume and companies involved
  if (entity1.type === "synergy") {
    const synergy = entity1 as SinergiaDetectada;
    return Math.min(1, (synergy.volumen_total / 500) * (synergy.empresas_involucradas / 6));
  }
  
  // Example: Supply relationship strength based on historical deliveries
  if (entity1.type === "provider" && entity2.type === "company") {
    const provider = entity1 as Proveedor;
    return (provider.cumplimiento_historico || 50) / 100;
  }
  
  // Example: RFP participation strength
  if (entity1.type === "rfp" && entity2.type === "company") {
    const rfp = entity1 as RFPConjunta;
    return rfp.abierta ? 0.8 : 0.3;
  }
  
  // Default: medium strength
  return 0.5;
}
```

---

## 🎮 Interaction & Controls

### Camera Controls
```typescript
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

function SceneCamera() {
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[50, 40, 50]} 
        fov={60}
      />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2} // Prevent going below ground
        target={[0, 0, 0]}
      />
    </>
  );
}
```

### Node Interaction
```typescript
interface NodeInteraction {
  hoveredNode: string | null;
  selectedNode: string | null;
  highlightedConnections: string[];
}

function InteractiveNode({ node, onHover, onClick }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <mesh
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(node.id);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node.id);
      }}
      scale={hovered ? 1.2 : 1}
    >
      {/* Geometry based on node type */}
      <meshStandardMaterial 
        color={node.color}
        emissive={hovered ? node.color : "#000000"}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  );
}
```

---

## 📱 UI Components & Layout

### Main Layout Structure
```typescript
export default function NetworkVisualization() {
  return (
    <div className="relative w-full h-screen bg-[#131313]">
      {/* 3D Canvas */}
      <Canvas shadows>
        <Scene />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <Header />
          <ControlPanel />
          <InfoPanel />
        </div>
      </div>
    </div>
  );
}
```

### Control Panel
```typescript
function ControlPanel() {
  const [showMap, setShowMap] = useState(true);
  const [filters, setFilters] = useState<FilterConfig>({
    companies: true,
    providers: true,
    synergies: true,
    rfps: true
  });
  
  return (
    <div className="absolute top-4 right-4 bg-[#131313]/90 backdrop-blur-sm rounded-lg p-4 space-y-3">
      {/* Map Toggle */}
      <Button 
        onClick={() => setShowMap(!showMap)}
        className="w-full bg-[#74b600] hover:bg-[#9aff8d] text-black"
      >
        {showMap ? "Hide Map" : "Show Map"}
      </Button>
      
      {/* Category Filters */}
      <div className="space-y-2">
        <p className="text-[#9aff8d] text-sm font-semibold">Filters</p>
        {Object.entries(filters).map(([key, value]) => (
          <label key={key} className="flex items-center space-x-2 text-white text-sm">
            <input 
              type="checkbox" 
              checked={value}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                [key]: e.target.checked
              }))}
              className="accent-[#9aff8d]"
            />
            <span className="capitalize">{key}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
```

### Info Panel (Node Details)
```typescript
function InfoPanel({ selectedNode }: { selectedNode: NodeData | null }) {
  if (!selectedNode) return null;
  
  return (
    <div className="absolute bottom-4 left-4 bg-[#131313]/90 backdrop-blur-sm rounded-lg p-4 max-w-md">
      <h3 className="text-[#9aff8d] text-lg font-bold mb-2">
        {selectedNode.name}
      </h3>
      <div className="space-y-1 text-white text-sm">
        <p><span className="text-[#f9d134]">Type:</span> {selectedNode.type}</p>
        {selectedNode.location && (
          <p><span className="text-[#f9d134]">Location:</span> {selectedNode.location.city}</p>
        )}
        {selectedNode.connections && (
          <p><span className="text-[#f9d134]">Connections:</span> {selectedNode.connections.length}</p>
        )}
        {/* Add more details based on node type */}
      </div>
    </div>
  );
}
```

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main entry point
│   ├── layout.tsx                  # Root layout with metadata
│   └── api/
│       └── locations/
│           └── route.ts            # API for location data
├── components/
│   ├── ui/                         # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── switch.tsx
│   ├── 3d/
│   │   ├── Scene.tsx               # Main 3D scene container
│   │   ├── MapPlane.tsx            # Geographic base layer
│   │   ├── Node.tsx                # Generic node component
│   │   ├── CompanyNode.tsx         # Specific node types
│   │   ├── SynergyNode.tsx
│   │   ├── ConnectionLine.tsx      # Connection visualization
│   │   ├── ParticleFlow.tsx        # Particle system
│   │   ├── Lighting.tsx            # Scene lighting
│   │   └── Camera.tsx              # Camera setup
│   └── panels/
│       ├── ControlPanel.tsx
│       ├── InfoPanel.tsx
│       └── FilterPanel.tsx
├── lib/
│   ├── data/
│   │   ├── locations.ts            # Company location data (WITH REAL COORDINATES)
│   │   ├── process-data.ts         # Data processing utilities
│   │   └── relationships.ts        # Connection calculation logic
│   ├── utils/
│   │   ├── coordinates.ts          # Lat/lon conversion utilities
│   │   ├── geometry.ts             # 3D geometry helpers
│   │   └── colors.ts               # Color palette utilities
│   ├── hooks/
│   │   ├── use3DNodes.ts           # Hook for node data
│   │   ├── useConnections.ts       # Hook for connection data
│   │   └── useParticles.ts         # Hook for particle system
│   └── store/
│       └── visualization-store.ts  # Zustand store for 3D state
├── types/
│   ├── visualization.ts            # 3D-specific types
│   └── index.ts                    # Re-exports
├── styles/
│   └── globals.css                 # Tailwind + custom styles
└── public/
    └── maps/                       # Map tiles/assets if needed
```

---

## 🔄 Implementation Workflow

### Phase 1: Data Preparation ⚠️ **CRITICAL FIRST STEP**
1. **Research Geographic Locations:**
   - Use web search to find each company's coordinates
   - Focus on Mamonal Industrial Zone, Cartagena, Colombia
   - Document sources for each coordinate
   
2. **Create Location Data File:**
   ```typescript
   // lib/data/locations.ts
   export const COMPANY_LOCATIONS: CompanyLocation[] = [
     {
       empresa: "Argos",
       name: "Argos Cartagena Cement Plant",
       lat: 10.XXXX, // REAL COORDINATES FROM RESEARCH
       lon: -75.XXXX,
       city: "Cartagena",
       country: "Colombia"
     },
     // ... ALL 6 COMPANIES
   ];
   ```

3. **Data Processing:**
   - Create utility to enrich existing data with locations
   - DO NOT modify original sample_data_extended.ts
   - Create new processed data structures

### Phase 2: Next.js Setup
```bash
npx create-next-app@latest petrochemical-3d-viz --typescript --tailwind --app
cd petrochemical-3d-viz
npm install three @react-three/fiber @react-three/drei zustand
npm install @types/three -D
```

### Phase 3: Core 3D Scene
1. Set up basic Three.js scene with React Three Fiber
2. Implement camera and controls
3. Add basic lighting
4. Create map plane component

### Phase 4: Node System
1. Implement shape mapping system
2. Create base Node component
3. Create specialized components (CompanyNode, SynergyNode, etc.)
4. Position nodes based on location data
5. Implement floating animation for non-geographic nodes

### Phase 5: Connection System
1. Calculate relationships from data
2. Implement connection line rendering
3. Create particle system
4. Integrate strength-based particle flow

### Phase 6: Map Integration
1. Choose map provider (Mapbox or Leaflet)
2. Implement vector map texture
3. Create toggle functionality
4. Style map to match color palette

### Phase 7: Interactivity
1. Add node hover/click handlers
2. Implement info panel
3. Create filter controls
4. Add camera animations for focus

### Phase 8: Optimization
1. Implement LOD (Level of Detail) for distant nodes
2. Use instanced meshes for particles
3. Optimize geometry reuse
4. Add performance monitoring

---

## 🎨 Styling Guidelines

### Tailwind Configuration
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        background: '#131313',
        'dataviz': {
          0: '#9aff8d',
          1: '#74b600',
          2: '#a8d564',
          3: '#c4e8a0',
          4: '#f9d134',
          5: '#f9a600',
        }
      }
    }
  }
};
```

### Global Styles
```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-background text-white overflow-hidden;
}

/* Smooth transitions */
* {
  @apply transition-colors duration-200;
}
```

---

## ⚡ Performance Considerations

1. **Geometry Reuse:**
   ```typescript
   const geometries = useMemo(() => ({
     box: new THREE.BoxGeometry(1, 1, 1),
     sphere: new THREE.SphereGeometry(0.5, 16, 16),
     pyramid: new THREE.TetrahedronGeometry(0.5, 0),
     cone: new THREE.ConeGeometry(0.5, 1, 16)
   }), []);
   ```

2. **Instanced Rendering:**
   ```typescript
   import { Instances, Instance } from '@react-three/drei';
   
   <Instances geometry={geometries.sphere} material={material} count={companies.length}>
     {companies.map((company, i) => (
       <Instance key={company.id} position={company.position} />
     ))}
   </Instances>
   ```

3. **Particle Pooling:**
   - Reuse particle objects instead of creating new ones
   - Use object pooling pattern for high-frequency updates

4. **Conditional Rendering:**
   - Only render visible nodes (frustum culling)
   - Reduce particle count for weak connections

---

## 📋 Acceptance Criteria Checklist

### Must-Have Features
- [ ] All 6 companies have **real** geographic coordinates from research
- [ ] Location data properly integrated without breaking existing code
- [ ] 3D scene renders with map plane
- [ ] Each category uses correct geometric shape (Box, Sphere, Pyramid, Cone)
- [ ] Companies render at their geographic coordinates
- [ ] Non-geographic elements (synergies, RFPs) float above surface
- [ ] Connection lines drawn between related entities
- [ ] Particles flow through connections
- [ ] Particle flow rate reflects relationship strength
- [ ] Vector map visible with proper styling
- [ ] Map toggle button functional
- [ ] Mouse controls work (rotate, zoom, pan)
- [ ] Color palette strictly followed
- [ ] All connections use uniform line thickness
- [ ] Subtle, non-distracting visual design

### Nice-to-Have Features
- [ ] Node hover effects with info display
- [ ] Click to focus camera on node
- [ ] Filter controls for entity types
- [ ] Search functionality
- [ ] Animation speed controls
- [ ] Export screenshot functionality
- [ ] Performance metrics display

---

## 🚨 Critical Warnings & Gotchas

1. **DO NOT use placeholder coordinates** - Every company must have researched, real coordinates
2. **DO NOT break existing data structures** - Only extend, never modify original interfaces
3. **DO NOT use thick connection lines** - Keep them subtle (uniform thickness)
4. **DO NOT forget floating effect** - Non-geographic elements must hover
5. **DO NOT skip particle strength logic** - This is core to the visualization
6. **DO NOT use satellite imagery by default** - Vector maps only
7. **DO NOT add "features" not in spec** - Follow requirements exactly

---

## 📚 Reference Resources

### Essential Documentation
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [Three.js](https://threejs.org/docs/)
- [React Three Drei](https://github.com/pmndrs/drei)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Map Resources
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)

### Performance
- [Three.js Performance Tips](https://discoverthreejs.com/tips-and-tricks/)
- [React Three Fiber Performance](https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls)

---

## 🎯 Success Metrics

1. **Functionality:** All features work as specified
2. **Performance:** Maintains 60 FPS with full dataset
3. **Accuracy:** Geographic data is real and accurate
4. **Visual Quality:** Matches design palette, subtle and professional
5. **Code Quality:** Type-safe, well-structured, maintainable
6. **User Experience:** Smooth interactions, intuitive controls

---

## 📝 Final Notes

This is a **production-grade visualization** for industrial analysis. Prioritize:
- **Data accuracy** (real coordinates)
- **Performance** (smooth 60 FPS)
- **Visual clarity** (not overwhelming)
- **Type safety** (TypeScript everywhere)
- **Maintainability** (clean architecture)

**Remember:** The goal is to visualize complex petrochemical cluster relationships in an intuitive, interactive 3D space that helps users understand synergies, connections, and data flow at a glance.

Good luck! 🚀
