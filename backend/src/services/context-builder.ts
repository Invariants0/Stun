/**
 * Spatial Context Builder
 * Builds intelligent spatial context from board data for AI planning
 */

import {
  clusterNodes,
  calculateDensity,
  type CanvasNode,
  type NodeCluster,
  type Point,
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

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    clusters,
    clusterCount: clusters.length,
    density,
    viewport,
    selectedNodes,
    bounds: { minX, minY, maxX, maxY },
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

  if (context.clusters.length > 0) {
    parts.push(`\nSpatial Clusters:`);
    context.clusters.forEach((cluster, idx) => {
      parts.push(`- Cluster ${idx + 1}: ${cluster.nodes.length} nodes at (${Math.round(cluster.center.x)}, ${Math.round(cluster.center.y)})`);
    });
  }

  return parts.join("\n");
}
