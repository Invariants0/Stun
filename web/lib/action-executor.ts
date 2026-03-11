/**
 * AI Action Executor
 * 
 * Executes structured JSON actions from Gemini AI on the hybrid canvas
 * (Canvas-system.md section 8)
 * 
 * Allowed actions: move, connect, highlight, zoom, group, cluster, create, delete, transform
 */

import type { Node, Edge, Viewport } from "reactflow";
import type { AIAction, AIActionPlan } from "../types/canvas.types";
import { useBoardStore } from "@/store/board.store";
import { canvasMappingService } from "@/lib/canvas-mapping";
import { api } from "@/lib/api-client";

export interface ActionExecutorContext {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setViewport: (viewport: Viewport) => void;
}

export class ActionExecutor {
  private context: ActionExecutorContext;
  private boardId: string;

  constructor(context: ActionExecutorContext, boardId: string) {
    this.context = context;
    this.boardId = boardId;
  }
  
  private getBoardId(): string {
    return this.boardId;
  }

  /**
   * Execute a complete AI action plan
   */
  async executePlan(plan: AIActionPlan): Promise<void> {
    try {
      if (plan.executionOrder === "parallel") {
        // Execute all actions in parallel
        await Promise.all(plan.actions.map((action) => this.executeAction(action)));
      } else {
        // Execute actions sequentially
        for (const action of plan.actions) {
          await this.executeAction(action);
        }
      }
    } catch (error: any) {
      console.error("Action plan execution failed:", error);
      throw new Error(`AI failed to execute action plan: ${error.message}`);
    }
  }

  /**
   * Execute a single action
   */
  async executeAction(action: AIAction): Promise<void> {
    try {
      console.log("[ActionExecutor] Executing action:", action);
      console.log("[ActionExecutor] Current context nodes:", this.context.nodes.length);
      console.log("[ActionExecutor] Available node IDs:", this.context.nodes.map(n => n.id));

      switch (action.type) {
        case "move":
          return await this.executeMove(action);
        case "connect":
          return await this.executeConnect(action);
        case "highlight":
          return await this.executeHighlight(action);
        case "zoom":
          return await this.executeZoom(action);
        case "group":
          return await this.executeGroup(action);
        case "cluster":
          return await this.executeCluster(action);
        case "create":
          return await this.executeCreate(action);
        case "delete":
          return await this.executeDelete(action);
        case "transform":
          return await this.executeTransform(action);
        case "layout":
          return await this.executeLayout(action);
        default:
          throw new Error(`Unsupported action type: ${(action as AIAction).type}`);
      }
    } catch (error: any) {
      console.error(`[ActionExecutor] Failed to execute ${action.type} action:`, error);
      throw error; // Re-throw to be caught by executePlan
    }
  }

  // ============================================================================
  // Action Implementations
  // ============================================================================

  /**
   * Move a node to a new position
   */
  private executeMove(action: AIAction): Promise<void> {
    if (!action.nodeId || !action.to) {
      throw new Error("Move action requires nodeId and to position");
    }

    this.context.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === action.nodeId
          ? { ...node, position: action.to! }
          : node
      )
    );

    return Promise.resolve();
  }

  /**
   * Connect two nodes with an edge
   */
  private executeConnect(action: AIAction): Promise<void> {
    // Support both 'from/to' (backend schema) and 'source/target' (ReactFlow)
    const source = (action as any).source || (action as any).from;
    const target = (action as any).target || (action as any).to;
    
    if (!source || !target) {
      throw new Error("Connect action requires source and target (or from and to)");
    }

    const newEdge: Edge = {
      id: `edge-${source}-${target}`,
      source: source,
      target: target,
      type: "default",
    };

    this.context.setEdges((edges) => {
      // Check if edge already exists
      const exists = edges.some(
        (e) => e.source === source && e.target === target
      );
      return exists ? edges : [...edges, newEdge];
    });

    return Promise.resolve();
  }

  /**
   * Highlight a node (with color and optional duration)
   */
  private executeHighlight(action: AIAction): Promise<void> {
    if (!action.nodeId) {
      throw new Error("Highlight action requires nodeId");
    }

    const color = action.color || "#fbbf24"; // Default: amber
    const duration = action.duration || 2000;

    this.context.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === action.nodeId
          ? {
              ...node,
              style: {
                ...node.style,
                border: `3px solid ${color}`,
                boxShadow: `0 0 20px ${color}`,
              },
            }
          : node
      )
    );

    // Remove highlight after duration
    if (duration > 0) {
      setTimeout(() => {
        this.context.setNodes((nodes) =>
          nodes.map((node) =>
            node.id === action.nodeId
              ? {
                  ...node,
                  style: {
                    ...node.style,
                    border: undefined,
                    boxShadow: undefined,
                  },
                }
              : node
          )
        );
      }, duration);
    }

    return Promise.resolve();
  }

  /**
   * Zoom to a specific viewport
   */
  private executeZoom(action: AIAction): Promise<void> {
    const viewport =
      action.viewport ||
      ((action as any).data?.viewport as Viewport | undefined) ||
      this.context.viewport;
    if (!viewport) {
      console.warn("[ActionExecutor] Zoom action skipped: no viewport provided");
      return Promise.resolve();
    }

    this.context.setViewport(viewport);
    return Promise.resolve();
  }

  /**
   * Group multiple nodes together
   */
  private executeGroup(action: AIAction): Promise<void> {
    if (!action.nodeIds || action.nodeIds.length === 0) {
      throw new Error("Group action requires nodeIds array");
    }

    const groupId = action.groupId || `group-${Date.now()}`;

    this.context.setNodes((nodes) =>
      nodes.map((node) =>
        action.nodeIds?.includes(node.id)
          ? {
              ...node,
              data: {
                ...node.data,
                groupId,
              },
              style: {
                ...node.style,
                border: "2px dashed #6366f1",
              },
            }
          : node
      )
    );

    return Promise.resolve();
  }

  /**
   * Cluster nodes (arrange them in a specific pattern)
   */
  private executeCluster(action: AIAction): Promise<void> {
    if (!action.nodeIds || action.nodeIds.length === 0) {
      throw new Error("Cluster action requires nodeIds array");
    }

    // Simple circular clustering
    const radius = 200;
    const centerX = 400;
    const centerY = 300;
    const angleStep = (2 * Math.PI) / action.nodeIds.length;

    this.context.setNodes((nodes) => {
      let clusterIndex = 0;
      return nodes.map((node) => {
        const nodeIdIndex = action.nodeIds?.indexOf(node.id);
        if (nodeIdIndex !== undefined && nodeIdIndex >= 0) {
          const angle = clusterIndex * angleStep;
          const position = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          };
          clusterIndex++;
          return { ...node, position };
        }
        return node;
      });
    });

    return Promise.resolve();
  }

  /**
   * Create a new node by adding an Excalidraw element
   * The mapping service will automatically convert it to a React Flow node
   */
  private executeCreate(action: AIAction): Promise<void> {
    // Get text and position from action
    const text = (action as any).text || action.data?.label || "New Node";
    let position = (action as any).position || action.to || { x: 400, y: 300 };
    
    console.log("[ActionExecutor] Creating Excalidraw element at position:", position, "with text:", text);
    
    // Create directly via useBoardStore instead of through React Flow
    const boardState = useBoardStore.getState();
    const currentBoard = boardState.boards[this.getBoardId()];
    const currentElements = currentBoard?.excalidraw?.elements || [];
    
    // Create a new Excalidraw text element with required properties
    const now = Date.now();
    const fontSize = 20;
    const lineHeight = 1.25;
    const width = Math.max(200, Math.min(600, Math.round(text.length * fontSize * 0.6)));
    const height = Math.round(fontSize * lineHeight);
    const seed = Math.floor(Math.random() * 2 ** 31);
    const versionNonce = Math.floor(Math.random() * 2 ** 31);

    const newElement: any = {
      id: `ai-element-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "text",
      x: position.x,
      y: position.y,
      width,
      height,
      angle: 0,
      strokeColor: "#10b981", // Green to indicate AI-created
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      text: text,
      fontSize,
      fontFamily: 1,
      textAlign: "left" as const,
      verticalAlign: "middle" as const,
      containerId: null,
      originalText: text,
      autoResize: true,
      lineHeight,
      baseline: height,
      // Required Excalidraw properties
      isDeleted: false,
      groupIds: [],
      boundElements: null,
      updated: now,
      seed,
      version: 1,
      versionNonce,
      link: null,
      locked: false,
    };
    
    console.log("[ActionExecutor] New Excalidraw element:", newElement);
    
    // Update Excalidraw elements in store - this will trigger the useBoard hook
    const { setExcalidrawElements } = useBoardStore.getState();
    const newElements = [...currentElements, newElement];
    
    console.log("[ActionExecutor] Updating store with", newElements.length, "elements");
    setExcalidrawElements(this.getBoardId(), newElements);
    
    console.log("[ActionExecutor] Created Excalidraw element - mapping service will handle conversion");
    
    return Promise.resolve();
  }

  /**
   * Delete a node by removing the corresponding Excalidraw element
   */
  private executeDelete(action: AIAction): Promise<void> {
    if (!action.nodeId) {
      throw new Error("Delete action requires nodeId");
    }

    console.log(`[ActionExecutor] Attempting to delete node: ${action.nodeId}`);
    
    // Get current board state
    const boardState = useBoardStore.getState();
    const currentBoard = boardState.boards[this.getBoardId()];
    const currentElements = currentBoard?.excalidraw?.elements || [];
    
    // Find corresponding Excalidraw element using the mapping service
    const mapping = canvasMappingService.getMappingByNode(action.nodeId);
    
    if (!mapping) {
      const availableIds = this.context.nodes.map(n => n.id).join(', ');
      console.error(`[ActionExecutor] Cannot delete - no mapping found for node: ${action.nodeId}`);
      console.error(`[ActionExecutor] Available node IDs: ${availableIds}`);
      throw new Error(`Cannot delete node '${action.nodeId}' - no Excalidraw mapping found. Available nodes: ${availableIds}`);
    }
    
    // Remove the Excalidraw element
    const filteredElements = currentElements.filter(el => el.id !== mapping.excalidrawElementId);
    
    // Update store
    const { setExcalidrawElements } = useBoardStore.getState();
    setExcalidrawElements(this.getBoardId(), filteredElements);
    
    console.log(`[ActionExecutor] Deleted Excalidraw element: ${mapping.excalidrawElementId}`);

    return Promise.resolve();
  }

  /**
   * Transform a node (change its type, data, or appearance)
   */
  private executeTransform(action: AIAction): Promise<void> {
    if (!action.nodeId) {
      throw new Error("Transform action requires nodeId");
    }

    this.context.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === action.nodeId
          ? {
              ...node,
              type: action.data?.type as string || node.type,
              data: { ...node.data, ...action.data },
            }
          : node
      )
    );

    return Promise.resolve();
  }

  /**
   * Transform the entire canvas into a structured layout
   */
  private async executeLayout(action: AIAction): Promise<void> {
    const layoutType = (action as any).layoutType;
    const options = (action as any).options || {};

    if (!layoutType) {
      throw new Error("Layout action requires layoutType");
    }

    if (!["mindmap", "roadmap", "timeline", "flowchart", "presentation"].includes(layoutType)) {
      throw new Error(`Unsupported layout type: ${layoutType}`);
    }

    try {
      console.log(`[ActionExecutor] Transforming canvas to ${layoutType} layout`);

      // Prepare layout transformation request
      const transformRequest = {
        nodes: this.context.nodes,
        edges: this.context.edges,
        layoutType,
        options
      };

      // Call the layout transformation API
      const response = await api.post<{
        success: boolean;
        result: {
          nodes: Node[];
          edges: Edge[];
          metadata: any;
        };
      }>("/layout/transform", transformRequest);

      if (!response.success) {
        throw new Error("Layout transformation failed");
      }

      // Apply the transformed nodes and edges to the canvas
      this.context.setNodes(response.result.nodes);
      this.context.setEdges(response.result.edges);

      // Optionally adjust viewport to fit the new layout
      if (response.result.metadata?.suggestedViewport) {
        this.context.setViewport(response.result.metadata.suggestedViewport);
      }

      console.log(`[ActionExecutor] ${layoutType} layout applied successfully`);

    } catch (error: any) {
      console.error(`[ActionExecutor] Layout transformation failed:`, error);
      throw new Error(`Failed to transform to ${layoutType} layout: ${error.message}`);
    }
  }
}

/**
 * Legacy function for backward compatibility
 */
export function executeActions(actions: AIAction[]): Promise<void> {
  console.warn("executeActions is deprecated. Use ActionExecutor class instead.");
  return Promise.resolve();
}
