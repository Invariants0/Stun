/**
 * Spatial utilities for canvas intelligence
 * Provides clustering, region detection, and spatial analysis
 */

export type Point = { x: number; y: number };
export type BoundingBox = { x1: number; y1: number; x2: number; y2: number };

export interface CanvasNode {
  id: string;
  position: Point;
  [key: string]: unknown;
}

export interface NodeCluster {
  id: string;
  nodes: string[];
  center: Point;
  bounds: BoundingBox;
  radius: number;
  typeHint?: "idea" | "diagram" | "list" | "mixed";
}

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Simple distance-based clustering algorithm
 * Groups nodes that are within threshold distance of each other
 */
export function clusterNodes(
  nodes: CanvasNode[],
  threshold: number = 500
): NodeCluster[] {
  if (nodes.length === 0) return [];

  const clusters: NodeCluster[] = [];
  const visited = new Set<string>();

  for (const node of nodes) {
    if (visited.has(node.id)) continue;

    const cluster: string[] = [node.id];
    visited.add(node.id);

    // Find all nodes within threshold distance
    for (const other of nodes) {
      if (visited.has(other.id)) continue;
      
      const dist = distance(node.position, other.position);
      if (dist <= threshold) {
        cluster.push(other.id);
        visited.add(other.id);
      }
    }

    // Calculate cluster center and bounds
    const clusterNodes = nodes.filter(n => cluster.includes(n.id));
    const center = calculateCenter(clusterNodes);
    const bounds = calculateBounds(clusterNodes);
    const radius = calculateClusterRadius(clusterNodes, center);
    const typeHint = inferClusterType(clusterNodes);

    clusters.push({
      id: `cluster-${clusters.length}`,
      nodes: cluster,
      center,
      bounds,
      radius,
      typeHint,
    });
  }

  return clusters;
}

/**
 * Calculate geometric center of nodes
 */
export function calculateCenter(nodes: CanvasNode[]): Point {
  if (nodes.length === 0) return { x: 0, y: 0 };

  const sum = nodes.reduce(
    (acc, node) => ({
      x: acc.x + node.position.x,
      y: acc.y + node.position.y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / nodes.length,
    y: sum.y / nodes.length,
  };
}

/**
 * Calculate bounding box for nodes
 */
export function calculateBounds(nodes: CanvasNode[]): BoundingBox {
  if (nodes.length === 0) {
    return { x1: 0, y1: 0, x2: 0, y2: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x);
    maxY = Math.max(maxY, node.position.y);
  }

  return { x1: minX, y1: minY, x2: maxX, y2: maxY };
}

/**
 * Find nodes within a specific region
 */
export function getNodesInRegion(
  nodes: CanvasNode[],
  region: BoundingBox
): CanvasNode[] {
  return nodes.filter(node => {
    const { x, y } = node.position;
    return (
      x >= region.x1 &&
      x <= region.x2 &&
      y >= region.y1 &&
      y <= region.y2
    );
  });
}

/**
 * Calculate spatial density of the canvas
 */
export function calculateDensity(
  nodes: CanvasNode[]
): "empty" | "sparse" | "medium" | "dense" {
  if (nodes.length === 0) return "empty";
  if (nodes.length < 5) return "sparse";

  const bounds = calculateBounds(nodes);
  const area = (bounds.x2 - bounds.x1) * (bounds.y2 - bounds.y1);
  
  if (area === 0) return "dense";
  
  const density = nodes.length / area;

  if (density < 0.0001) return "sparse";
  if (density < 0.0005) return "medium";
  return "dense";
}

/**
 * Check if a point is inside a bounding box
 */
export function isPointInBounds(point: Point, bounds: BoundingBox): boolean {
  return (
    point.x >= bounds.x1 &&
    point.x <= bounds.x2 &&
    point.y >= bounds.y1 &&
    point.y <= bounds.y2
  );
}

/**
 * Board zone classification
 */
export type BoardZone = "top_left" | "top_right" | "bottom_left" | "bottom_right" | "center";

export interface ZoneDefinition {
  zone: BoardZone;
  bounds: BoundingBox;
  center: Point;
}

/**
 * Classify board into spatial zones based on bounding box
 */
export function detectBoardZones(bounds: BoundingBox): ZoneDefinition[] {
  const width = bounds.x2 - bounds.x1;
  const height = bounds.y2 - bounds.y1;
  const centerX = bounds.x1 + width / 2;
  const centerY = bounds.y1 + height / 2;

  // Define zone boundaries (33% margins for center zone)
  const leftBound = bounds.x1 + width * 0.33;
  const rightBound = bounds.x2 - width * 0.33;
  const topBound = bounds.y1 + height * 0.33;
  const bottomBound = bounds.y2 - height * 0.33;

  return [
    {
      zone: "top_left",
      bounds: { x1: bounds.x1, y1: bounds.y1, x2: leftBound, y2: topBound },
      center: { x: bounds.x1 + width * 0.165, y: bounds.y1 + height * 0.165 },
    },
    {
      zone: "top_right",
      bounds: { x1: rightBound, y1: bounds.y1, x2: bounds.x2, y2: topBound },
      center: { x: bounds.x2 - width * 0.165, y: bounds.y1 + height * 0.165 },
    },
    {
      zone: "bottom_left",
      bounds: { x1: bounds.x1, y1: bottomBound, x2: leftBound, y2: bounds.y2 },
      center: { x: bounds.x1 + width * 0.165, y: bounds.y2 - height * 0.165 },
    },
    {
      zone: "bottom_right",
      bounds: { x1: rightBound, y1: bottomBound, x2: bounds.x2, y2: bounds.y2 },
      center: { x: bounds.x2 - width * 0.165, y: bounds.y2 - height * 0.165 },
    },
    {
      zone: "center",
      bounds: { x1: leftBound, y1: topBound, x2: rightBound, y2: bottomBound },
      center: { x: centerX, y: centerY },
    },
  ];
}

/**
 * Available zone for new content
 */
export interface AvailableZone {
  x: number;
  y: number;
  width: number;
  height: number;
  density: number;
}

/**
 * Detect empty areas on the canvas with low node density
 */
export function detectEmptyAreas(
  nodes: CanvasNode[],
  bounds: BoundingBox,
  gridSize: number = 400
): AvailableZone[] {
  if (nodes.length === 0) {
    // Entire canvas is empty
    return [{
      x: bounds.x1,
      y: bounds.y1,
      width: bounds.x2 - bounds.x1,
      height: bounds.y2 - bounds.y1,
      density: 0,
    }];
  }

  const width = bounds.x2 - bounds.x1;
  const height = bounds.y2 - bounds.y1;
  
  // Expand bounds to include potential empty areas
  const expandedBounds = {
    x1: bounds.x1 - width * 0.2,
    y1: bounds.y1 - height * 0.2,
    x2: bounds.x2 + width * 0.2,
    y2: bounds.y2 + height * 0.2,
  };

  const availableZones: AvailableZone[] = [];
  const cols = Math.ceil((expandedBounds.x2 - expandedBounds.x1) / gridSize);
  const rows = Math.ceil((expandedBounds.y2 - expandedBounds.y1) / gridSize);

  // Grid-based density analysis
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = expandedBounds.x1 + col * gridSize;
      const y = expandedBounds.y1 + row * gridSize;
      
      const cellBounds: BoundingBox = {
        x1: x,
        y1: y,
        x2: x + gridSize,
        y2: y + gridSize,
      };

      // Count nodes in this cell
      const nodesInCell = getNodesInRegion(nodes, cellBounds);
      const density = nodesInCell.length / (gridSize * gridSize);

      // Low density threshold (less than 1 node per 400x400 area)
      if (density < 0.000006) {
        availableZones.push({
          x: Math.round(x),
          y: Math.round(y),
          width: gridSize,
          height: gridSize,
          density: Math.round(density * 1000000) / 1000000,
        });
      }
    }
  }

  // Merge adjacent empty zones
  return mergeAdjacentZones(availableZones, gridSize);
}

/**
 * Merge adjacent empty zones to create larger available areas
 */
function mergeAdjacentZones(zones: AvailableZone[], gridSize: number): AvailableZone[] {
  if (zones.length === 0) return zones;

  // Simple horizontal merging
  const merged: AvailableZone[] = [];
  const processed = new Set<number>();

  for (let i = 0; i < zones.length; i++) {
    if (processed.has(i)) continue;

    let current = zones[i];
    processed.add(i);

    // Try to merge with adjacent zones
    for (let j = i + 1; j < zones.length; j++) {
      if (processed.has(j)) continue;

      const other = zones[j];
      
      // Check if horizontally adjacent
      if (
        current.y === other.y &&
        current.height === other.height &&
        current.x + current.width === other.x
      ) {
        current = {
          x: current.x,
          y: current.y,
          width: current.width + other.width,
          height: current.height,
          density: (current.density + other.density) / 2,
        };
        processed.add(j);
      }
    }

    merged.push(current);
  }

  // Limit to top 10 largest zones
  return merged
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))
    .slice(0, 10);
}

/**
 * Calculate cluster radius (max distance from center to any node)
 */
export function calculateClusterRadius(nodes: CanvasNode[], center: Point): number {
  if (nodes.length === 0) return 0;

  let maxDist = 0;
  for (const node of nodes) {
    const dist = distance(node.position, center);
    maxDist = Math.max(maxDist, dist);
  }

  return maxDist;
}

/**
 * Infer cluster type based on node characteristics
 */
export function inferClusterType(nodes: CanvasNode[]): "idea" | "diagram" | "list" | "mixed" {
  if (nodes.length === 0) return "mixed";
  if (nodes.length === 1) return "idea";

  // Simple heuristics based on spatial arrangement
  const bounds = calculateBounds(nodes);
  const width = bounds.x2 - bounds.x1;
  const height = bounds.y2 - bounds.y1;
  const aspectRatio = width / (height || 1);

  // Vertical list: tall and narrow
  if (aspectRatio < 0.5 && nodes.length >= 3) return "list";

  // Horizontal list: wide and short
  if (aspectRatio > 2 && nodes.length >= 3) return "list";

  // Diagram: balanced aspect ratio with multiple nodes
  if (aspectRatio > 0.7 && aspectRatio < 1.5 && nodes.length >= 4) return "diagram";

  // Small cluster: likely ideas
  if (nodes.length <= 3) return "idea";

  return "mixed";
}

/**
 * Ensure position is within safe canvas bounds
 */
export function clampToSafeBounds(position: Point, bounds: BoundingBox): Point {
  const padding = 100; // Keep nodes away from extreme edges
  
  return {
    x: Math.max(bounds.x1 + padding, Math.min(bounds.x2 - padding, position.x)),
    y: Math.max(bounds.y1 + padding, Math.min(bounds.y2 - padding, position.y)),
  };
}

/**
 * Find best position in a target zone, avoiding existing nodes
 */
export function findBestPositionInZone(
  zone: ZoneDefinition,
  existingNodes: CanvasNode[],
  minDistance: number = 150
): Point {
  // Start with zone center
  let candidate = { ...zone.center };

  // Check if center is clear
  const nodesInZone = getNodesInRegion(existingNodes, zone.bounds);
  
  if (nodesInZone.length === 0) {
    return candidate;
  }

  // Try to find a clear spot using spiral search
  const spiralOffsets = [
    { x: 0, y: 0 },
    { x: minDistance, y: 0 },
    { x: -minDistance, y: 0 },
    { x: 0, y: minDistance },
    { x: 0, y: -minDistance },
    { x: minDistance, y: minDistance },
    { x: -minDistance, y: minDistance },
    { x: minDistance, y: -minDistance },
    { x: -minDistance, y: -minDistance },
  ];

  for (const offset of spiralOffsets) {
    candidate = {
      x: zone.center.x + offset.x,
      y: zone.center.y + offset.y,
    };

    // Check if this position is clear
    const isClear = nodesInZone.every(node => 
      distance(node.position, candidate) >= minDistance
    );

    if (isClear && isPointInBounds(candidate, zone.bounds)) {
      return candidate;
    }
  }

  // Fallback to zone center
  return zone.center;
}
