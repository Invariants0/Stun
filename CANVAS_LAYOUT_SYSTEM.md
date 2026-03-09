# Canvas Layout Transformation System

## Overview

The Canvas Layout Transformation System enables AI-driven restructuring of canvas content into various visual formats. This system supports converting unorganized nodes into structured layouts like mind maps, roadmaps, timelines, flowcharts, and presentations.

## Architecture

### Backend Components

- **`LayoutService`** - Core transformation algorithms for each layout type
- **`LayoutController`** - HTTP API endpoints for layout transformations  
- **`layout.routes.ts`** - Express.js routes with authentication and validation

### Frontend Components

- **`ActionExecutor.executeLayout()`** - Client-side layout transformation execution
- **AI Planner Prompt** - Enhanced to recognize layout transformation requests
- **Canvas Types** - Extended with layout action types and properties

## Available Layout Types

### 1. Mind Map (`mindmap`)
- **Purpose**: Brainstorming, concept exploration, knowledge organization
- **Structure**: Radial branching from a central concept
- **Features**: Center node focus, hierarchical branching, color coding
- **Best For**: Creative sessions, concept mapping, idea exploration

```typescript
{
  "type": "layout",
  "layoutType": "mindmap", 
  "options": {
    "spacing": { "x": 200, "y": 150 },
    "centerPosition": { "x": 0, "y": 0 }
  }
}
```

### 2. Roadmap (`roadmap`)
- **Purpose**: Project planning, milestone tracking, strategic planning
- **Structure**: Sequential phases with color-coded progression 
- **Features**: Phase grouping, progress indicators, sequential flow
- **Best For**: Project timelines, strategic planning, milestone tracking

```typescript
{
  "type": "layout",
  "layoutType": "roadmap",
  "options": {
    "spacing": { "x": 300, "y": 200 },
    "direction": "horizontal"
  }
}
```

### 3. Timeline (`timeline`)
- **Purpose**: Historical events, project schedules, process documentation
- **Structure**: Chronological horizontal progression
- **Features**: Time-based ordering, alternating positioning, flow arrows
- **Best For**: Historical data, project schedules, sequential processes

```typescript
{
  "type": "layout", 
  "layoutType": "timeline",
  "options": {
    "spacing": { "x": 250, "y": 100 },
    "direction": "horizontal"
  }
}
```

### 4. Flowchart (`flowchart`) 
- **Purpose**: Process documentation, decision trees, workflow design
- **Structure**: Hierarchical levels with decision flow
- **Features**: Process shapes, decision nodes, hierarchical organization
- **Best For**: Process documentation, decision trees, workflow visualization

```typescript
{
  "type": "layout",
  "layoutType": "flowchart", 
  "options": {
    "spacing": { "x": 200, "y": 150 },
    "direction": "vertical"
  }
}
```

### 5. Presentation (`presentation`)
- **Purpose**: Content organization for presentations
- **Structure**: Slide-based grouping with consistent spacing
- **Features**: Slide organization, grid layout, presentation styling
- **Best For**: Presentation preparation, content organization, storytelling

```typescript
{
  "type": "layout",
  "layoutType": "presentation",
  "options": {
    "spacing": { "x": 150, "y": 100 },
    "groupBy": "topic"
  }
}
```

## API Endpoints

### POST `/layout/transform`
Transform canvas nodes into specified layout.

**Authentication**: Required  
**Validation**: Board access required

```typescript
interface TransformRequest {
  nodes: Node[];
  edges: Edge[];
  layoutType: "mindmap" | "roadmap" | "timeline" | "flowchart" | "presentation";
  options?: {
    spacing?: { x: number; y: number };
    centerPosition?: { x: number; y: number };
    direction?: "horizontal" | "vertical" | "radial";
    groupBy?: "type" | "topic" | "priority" | "date";
  };
}

interface TransformResponse {
  success: boolean;
  layout: string;
  result: {
    nodes: Node[];
    edges: Edge[];
    metadata: any;
  };
  stats: {
    originalNodes: number;
    resultNodes: number;
    originalEdges: number;
    resultEdges: number;
  };
}
```

### GET `/layout/types`
Get available layout types and descriptions.

**Authentication**: Required

```typescript
interface LayoutTypesResponse {
  success: boolean;
  layoutTypes: Array<{
    id: string;
    name: string;
    description: string;
    features: string[];
    bestFor: string;
  }>;
  count: number;
}
```

### POST `/layout/preview`
Preview layout transformation without applying changes.

**Authentication**: Required  
**Validation**: Board access required

```typescript
interface PreviewResponse {
  success: boolean;
  preview: {
    layoutType: string;
    estimatedChanges: {
      nodesRepositioned: number;
      edgesModified: number;
      newEdges: number;
    };
    features: string[];
    options: any;
  };
}
```

## AI Integration

### Voice Commands
The AI planner recognizes natural language requests for layout transformations:

- *"Convert this into a mind map"*
- *"Organize this as a roadmap"* 
- *"Structure this like a timeline"*
- *"Make this look like a flowchart"*
- *"Turn this into presentation slides"*

### AI Planner Prompt
The planner prompt includes layout transformation intelligence:

```typescript
// Layout transformation triggers:
- User asks to "convert to [layout type]"
- User requests "organize this into a [layout]"  
- Canvas appears disorganized and would benefit from structure
```

### Action Execution
Layout transformations execute through the ActionExecutor:

```typescript
// AI generates action plan
{
  "actions": [
    {
      "type": "layout",
      "layoutType": "mindmap",
      "options": {
        "spacing": { "x": 200, "y": 150 },
        "centerPosition": { "x": 0, "y": 0 }
      }
    }
  ]
}

// ActionExecutor calls layout API
const response = await api.post("/layout/transform", transformRequest);

// Canvas updates with new node positions
setNodes(response.result.nodes);
setEdges(response.result.edges);
```

## Layout Algorithms

### Mind Map Algorithm
1. Identify/create center node (most connected or first node)
2. Calculate radial positions around center
3. Position child nodes in hierarchical levels
4. Connect all nodes to center in star pattern
5. Apply color coding and styling

### Roadmap Algorithm  
1. Group nodes into phases (2-4 nodes per phase)
2. Position phases horizontally with increasing colors
3. Create sequential connections between phases
4. Add phase labels and progress indicators

### Timeline Algorithm
1. Sort nodes by creation time or content hints
2. Position nodes horizontally with alternating vertical offset
3. Create sequential flow connections
4. Add timeline styling and flow arrows

### Flowchart Algorithm
1. Build hierarchy from edge relationships
2. Assign flowchart node types (start, process, decision, end)
3. Position nodes in vertical levels
4. Apply appropriate shapes and connections

### Presentation Algorithm
1. Group nodes into slides (3-4 nodes per slide)
2. Position slides horizontally with grid layout within slides
3. Maintain consistent spacing and alignment
4. Apply presentation styling

## Error Handling

The system includes comprehensive error handling:

- **ValidationError**: Invalid transformation parameters
- **UnsupportedLayout**: Unknown layout type requested
- **LayoutTransformError**: Algorithm execution failure
- **InternalError**: System-level failures

## Testing

Run layout tests:
```bash
bun test tests/layout.test.ts
```

Tests cover:
- All layout algorithm correctness
- Node positioning and edge creation
- Options handling and validation
- Error scenarios and edge cases

## Usage Examples

### Basic Mind Map Transformation
```typescript
// Voice command: "convert this into a mind map"
// AI generates:
{
  "actions": [
    {
      "type": "layout",
      "layoutType": "mindmap"
    }
  ]
}
```

### Custom Roadmap with Spacing
```typescript  
// Voice command: "organize this as a roadmap with wide spacing"
// AI generates:
{
  "actions": [
    {
      "type": "layout", 
      "layoutType": "roadmap",
      "options": {
        "spacing": { "x": 400, "y": 250 }
      }
    }
  ]
}
```

### Vertical Flowchart
```typescript
// Voice command: "make this look like a vertical flowchart"  
// AI generates:
{
  "actions": [
    {
      "type": "layout",
      "layoutType": "flowchart",
      "options": {
        "direction": "vertical"
      }
    }
  ]  
}
```

## Next Steps

1. **Test the implementation** with various canvas configurations
2. **Refine algorithms** based on user feedback and edge cases  
3. **Add more layout options** like hierarchical trees or network diagrams
4. **Enhance AI recognition** of layout transformation contexts
5. **Add animation support** for smooth layout transitions

This system provides the foundation for AI-driven canvas restructuring as specified in the PRD, enabling users to transform unorganized content into structured, visually appealing layouts through natural voice commands.