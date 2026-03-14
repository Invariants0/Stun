/**
 * Hybrid Canvas Architecture Types
 * 
 * Based on Canvas-system.md:
 * - Excalidraw: UI Interaction Layer (drawings, shapes, diagrams)
 * - TLDraw: Infinite Workspace Engine (pan/zoom, camera)
 * - React Flow: Knowledge Graph Engine (structured nodes)
 */

import type { Node, Edge } from "reactflow";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { TLShapeId, TLCamera } from "tldraw";

// ============================================================================
// Element-to-Node Mapping System
// ============================================================================

/**
 * Maps Excalidraw visual elements to React Flow knowledge nodes
 */
export interface ElementNodeMapping {
  excalidrawElementId: string;
  reactFlowNodeId: string;
  createdAt: number;
  syncStatus: "synced" | "pending" | "conflict";
}

export interface CanvasMapping {
  mappings: Map<string, ElementNodeMapping>;
  getMappingByElement: (elementId: string) => ElementNodeMapping | undefined;
  getMappingByNode: (nodeId: string) => ElementNodeMapping | undefined;
  addMapping: (elementId: string, nodeId: string) => void;
  removeMapping: (elementId: string) => void;
}

// ============================================================================
// Camera & Viewport Synchronization
// ============================================================================

/**
 * Unified camera state across all three canvas layers
 */
export interface UnifiedCameraState {
  // TLDraw camera (primary source of truth)
  tldrawCamera: TLCamera;

  // React Flow viewport (synchronized)
  reactFlowViewport: {
    x: number;
    y: number;
    zoom: number;
  };

  // Excalidraw transform (synchronized)
  excalidrawTransform: {
    x: number;
    y: number;
    zoom: number;
  };

  lastUpdated: number;
  source: "tldraw" | "reactflow" | "excalidraw";
}

// ============================================================================
// Hybrid Canvas Layer Data
// ============================================================================

/**
 * Excalidraw Layer - Visual editing elements
 */
export interface ExcalidrawLayerData {
  elements: readonly ExcalidrawElement[];
  files: Record<
    string,
    {
      id: string;
      mimeType: string;
      dataURL: string;
    }
  >;
  appState: {
    viewBackgroundColor: string;
    currentItemStrokeColor: string;
    currentItemBackgroundColor: string;
    currentItemFillStyle: string;
    currentItemStrokeWidth: number;
    currentItemRoughness: number;
    currentItemOpacity: number;
    [key: string]: unknown;
  };
}

/**
 * TLDraw Layer - Workspace infrastructure
 */
export interface TLDrawLayerData {
  camera: TLCamera;
  selectedShapeIds: TLShapeId[];
  isPanning: boolean;
  isZooming: boolean;
}

/**
 * React Flow Layer - Knowledge graph
 */
export interface ReactFlowLayerData {
  nodes: Node[];
  edges: Edge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

/**
 * Complete hybrid canvas state
 */
export interface HybridCanvasState {
  boardId: string;
  excalidraw: ExcalidrawLayerData;
  tldraw: TLDrawLayerData;
  reactflow: ReactFlowLayerData;
  mappings: ElementNodeMapping[];
  camera: UnifiedCameraState;
}

// ============================================================================
// AI Action System (from PRD.md)
// ============================================================================

/**
 * Actions that AI can execute on the canvas
 */
export type AIActionType =
  | "move"
  | "connect"
  | "highlight"
  | "zoom"
  | "group"
  | "cluster"
  | "create"
  | "delete"
  | "transform"
  | "layout";

export interface AIAction {
  type: AIActionType;
  nodeId?: string;
  nodeIds?: string[];
  to?: { x: number; y: number };
  source?: string;
  target?: string;
  viewport?: { x: number; y: number; zoom: number };
  groupId?: string;
  color?: string;
  duration?: number;
  data?: Record<string, unknown>;
  level?: number;
  center?: { x: number; y: number };
  label?: string;
  
  // Layout transformation properties
  layoutType?: "mindmap" | "roadmap" | "timeline" | "flowchart" | "presentation";
  options?: {
    spacing?: { x: number; y: number };
    centerPosition?: { x: number; y: number };
    direction?: "horizontal" | "vertical" | "radial";
    groupBy?: "type" | "topic" | "priority" | "date";
  };
}

export interface AIActionPlan {
  actions: AIAction[];
  reasoning?: string;
  executionOrder?: "sequential" | "parallel";
}

// ============================================================================
// Node Types (Structured Knowledge Elements)
// ============================================================================

export interface TextNodeData {
  label: string;
  content?: string;
  color?: string;
  fontSize?: number;
}

export interface ImageNodeData {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface VideoNodeData {
  src: string;
  thumbnail?: string;
  duration?: number;
  transcript?: string;
}

export interface DiagramNodeData {
  type: "mermaid" | "excalidraw";
  content: string;
  rendered?: string;
}

export interface SummaryNodeData {
  title: string;
  summary: string;
  sourceNodeIds: string[];
}

export type NodeData =
  | TextNodeData
  | ImageNodeData
  | VideoNodeData
  | DiagramNodeData
  | SummaryNodeData;

// ============================================================================
// Canvas Events
// ============================================================================

export interface CanvasEvent {
  type:
  | "element-created"
  | "element-updated"
  | "element-deleted"
  | "node-created"
  | "node-updated"
  | "node-deleted"
  | "camera-changed"
  | "selection-changed";
  timestamp: number;
  source: "excalidraw" | "tldraw" | "reactflow" | "ai";
  data: unknown;
}

// ============================================================================
// Workspace Configuration
// ============================================================================

export interface CanvasConfig {
  enableExcalidraw: boolean;
  enableTLDraw: boolean;
  enableReactFlow: boolean;
  syncCameraAutomatically: boolean;
  enableAIActions: boolean;
  enableVoiceCommands: boolean;
  screenshotQuality: number;
  autoSaveInterval: number;
}
