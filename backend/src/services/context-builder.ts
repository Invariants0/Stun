/**
 * Spatial Context Builder
 * Builds intelligent spatial context from board data for AI planning
 */

import {
  clusterNodes,
  calculateDensity,
  detectBoardZones,
  detectEmptyAreas,
  calculateBounds,
  type CanvasNode,
  type NodeCluster,
  type ZoneDefinition,
  type AvailableZone,
  type BoundingBox,
} from "../utils/spatial";

export interface Edge {
  id: string;
  source: string;
  target: string;
  [key: string]: unknown;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface SpatialContext {
  nodeCount: number;
  edgeCount: number;
  clusters: NodeCluster[];
  clusterCount: number;
  density: "empty" | "sparse" | "medium" | "dense";
  viewport?: Viewport;
  selectedNodes: string[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  zones?: ZoneDefinition[];
  availableZones?: AvailableZone[];
}

export interface ContextBuilderInput {
  nodes: CanvasNode[];
  edges?: Edge[];
  viewport?: Viewport;
  selectedNodes?: string[];
}

/**
 * Build spatial context from board data
 */
export function buildSpatialContext(input: ContextBuilderInput): SpatialContext {
  const { nodes, edges = [], viewport, selectedNodes = [] } = input;

  // Perform clustering
  const clusters = clusterNodes(nodes);

  // Calculate density
  const density = calculateDensity(nodes);

  // Calculate overall bounds
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

  if (nodes.length === 0) {
    minX = minY = maxX = maxY = 0;
  }

  const boundingBox: BoundingBox = { x1: minX, y1: minY, x2: maxX, y2: maxY };

  // Detect board zones (only if we have nodes)
  const zones = nodes.length > 0 ? detectBoardZones(boundingBox) : undefined;

  // Detect empty areas (only if we have nodes)
  const availableZones = nodes.length > 0 ? detectEmptyAreas(nodes, boundingBox) : undefined;

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    clusters,
    clusterCount: clusters.length,
    density,
    viewport,
    selectedNodes,
    bounds: { minX, minY, maxX, maxY },
    zones,
    availableZones,
  };
}

/**
 * Generate human-readable context summary for AI prompt
 */
export function generateContextSummary(context: SpatialContext): string {
  const parts: string[] = [];

  parts.push(`Board Statistics:`);
  parts.push(`- Total nodes: ${context.nodeCount}`);
  parts.push(`- Total edges: ${context.edgeCount}`);
  parts.push(`- Spatial density: ${context.density}`);
  parts.push(`- Node clusters: ${context.clusterCount}`);

  if (context.nodeCount > 0) {
    parts.push(`- Canvas bounds: (${Math.round(context.bounds.minX)}, ${Math.round(context.bounds.minY)}) to (${Math.round(context.bounds.maxX)}, ${Math.round(context.bounds.maxY)})`);
  }

  if (context.selectedNodes.length > 0) {
    parts.push(`- Selected nodes: ${context.selectedNodes.length}`);
  }

  // Board zones
  if (context.zones && context.zones.length > 0) {
    parts.push(`\nBoard Zones:`);
    context.zones.forEach((zone) => {
      parts.push(`- ${zone.zone}: center at (${Math.round(zone.center.x)}, ${Math.round(zone.center.y)})`);
    });
  }

  // Spatial clusters with enhanced metadata
  if (context.clusters.length > 0) {
    parts.push(`\nSpatial Clusters:`);
    context.clusters.forEach((cluster, idx) => {
      const typeInfo = cluster.typeHint ? ` [${cluster.typeHint}]` : '';
      parts.push(`- Cluster ${idx + 1}${typeInfo}: ${cluster.nodes.length} nodes at (${Math.round(cluster.center.x)}, ${Math.round(cluster.center.y)}), radius ${Math.round(cluster.radius)}`);
    });
  }

  // Available zones for new content
  if (context.availableZones && context.availableZones.length > 0) {
    parts.push(`\nAvailable Empty Areas (top ${Math.min(5, context.availableZones.length)}):`);
    context.availableZones.slice(0, 5).forEach((zone, idx) => {
      parts.push(`- Area ${idx + 1}: ${zone.width}x${zone.height} at (${zone.x}, ${zone.y})`);
    });
  }

  return parts.join("\n");
}
