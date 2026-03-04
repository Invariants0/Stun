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

    clusters.push({
      id: `cluster-${clusters.length}`,
      nodes: cluster,
      center,
      bounds,
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
