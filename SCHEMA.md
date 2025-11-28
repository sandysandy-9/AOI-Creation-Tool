# Data Schema & ER Diagram

## Entity Relationship Overview

This application uses a simple client-side data model with localStorage persistence. Below is the schema overview:

```
┌─────────────────────────────────────────────────────────┐
│                    Application State                     │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
    ┌────────┐      ┌─────────┐     ┌──────────┐
    │ Layers │      │Features │     │MapState  │
    └────────┘      └─────────┘     └──────────┘
         │                │                │
         │                │                │
         ▼                ▼                ▼
  ┌──────────┐     ┌───────────┐    ┌──────────┐
  │ WMS URL  │     │ GeoJSON   │    │ Center   │
  │ Visible  │     │ Properties│    │ Zoom     │
  └──────────┘     └───────────┘    └──────────┘
```

## Entity Definitions

### Feature (Stored in localStorage)

```typescript
interface Feature {
  id: string;                          // UUID generated with timestamp
  type: 'polygon' | 'marker' | 'polyline';  // Geometry type
  geometry: GeoJSON.Geometry;          // Standard GeoJSON geometry
  properties: {
    name?: string;                     // Optional user-defined name
    description?: string;              // Optional description
    color?: string;                    // Hex color (default: #0ea5e9)
    createdAt: string;                 // ISO 8601 timestamp
  };
}
```

**Storage**: `localStorage['aoi-features']` as JSON array  
**Primary Key**: `id`  
**Cardinality**: 0..* (zero to many features)

---

### Layer (Runtime State)

```typescript
interface Layer {
  id: string;                    // Unique identifier
  name: string;                  // Display name in UI
  visible: boolean;              // Toggle state
  type: 'wms' | 'feature';       // Layer source type
  url?: string;                  // WMS endpoint (for WMS layers)
}
```

**Storage**: React `useState` (runtime only)  
**Primary Key**: `id`  
**Cardinality**: 1..* (at least one WMS layer)

---

### SearchResult (Transient)

```typescript
interface SearchResult {
  display_name: string;          // Human-readable address
  lat: string;                   // Latitude (string from API)
  lon: string;                   // Longitude (string from API)
  boundingbox: string[];         // [minLat, maxLat, minLon, maxLon]
}
```

**Storage**: React `useState` (temporary, cleared on selection)  
**Source**: Nominatim API  
**Lifecycle**: Exists only during search

---

### MapState (Runtime State)

```typescript
interface MapState {
  center: [number, number];      // [latitude, longitude]
  zoom: number;                  // Zoom level (1-18)
}
```

**Storage**: React `useState` (runtime only)  
**Default**: `[51.4332, 7.6616]` (North Rhine-Westphalia center), zoom: 10

---

## Data Flow Diagram

```
┌──────────────┐
│   User       │
│  Interaction │
└──────┬───────┘
       │
       │ Draw / Search / Toggle
       │
       ▼
┌──────────────────┐
│  React Component │ ◄─── useState (Layer, MapState)
│     (App.tsx)    │
└──────┬───────────┘
       │
       │ Feature Added
       │
       ▼
┌──────────────────┐
│  useFeatures()   │ ◄─── Custom Hook
│      Hook        │
└──────┬───────────┘
       │
       │ Store Feature
       │
       ▼
┌──────────────────┐
│  localStorage    │ ◄─── Browser Storage
│  'aoi-features'  │      (Persisted)
└──────────────────┘
```

## localStorage Schema

### Key: `aoi-features`

**Type**: `Feature[]` (JSON stringified array)

**Example**:
```json
[
  {
    "id": "1732780800000-x7k9m2p",
    "type": "polygon",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [7.5, 51.5],
          [7.6, 51.5],
          [7.6, 51.6],
          [7.5, 51.6],
          [7.5, 51.5]
        ]
      ]
    },
    "properties": {
      "color": "#0ea5e9",
      "createdAt": "2024-11-28T10:00:00.000Z"
    }
  },
  {
    "id": "1732781400000-b3n8q5r",
    "type": "marker",
    "geometry": {
      "type": "Point",
      "coordinates": [7.55, 51.55]
    },
    "properties": {
      "name": "Important Location",
      "color": "#0ea5e9",
      "createdAt": "2024-11-28T10:10:00.000Z"
    }
  }
]
```

## Relationships

### 1:N Relationships

- **App** (1) → **Features** (N)
  - One application instance manages many features
  
- **App** (1) → **Layers** (N)
  - One application instance manages multiple layers

### No Direct Relationships

- Features and Layers do not reference each other
- SearchResults are independent entities
- MapState is independent

## Data Constraints

| Entity | Field | Constraint |
|--------|-------|------------|
| Feature | id | Unique, required |
| Feature | type | Enum: 'polygon', 'marker', 'polyline' |
| Feature | geometry | Valid GeoJSON Geometry |
| Feature | properties.createdAt | ISO 8601 timestamp |
| Layer | id | Unique, required |
| Layer | visible | Boolean |
| Layer | url | Required if type === 'wms' |

## Future Schema Extensions

For production with backend:

```sql
-- PostgreSQL with PostGIS

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature_type VARCHAR(50) NOT NULL,
  geometry GEOMETRY(Geometry, 4326) NOT NULL,  -- PostGIS type
  name VARCHAR(255),
  description TEXT,
  color VARCHAR(7) DEFAULT '#0ea5e9',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_features_user ON features(user_id);
CREATE INDEX idx_features_geom ON features USING GIST(geometry);

CREATE TABLE layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  layer_type VARCHAR(50) NOT NULL,
  url TEXT,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

This would enable:
- Multi-user support
- Server-side spatial queries
- Feature sharing
- Advanced geospatial operations
