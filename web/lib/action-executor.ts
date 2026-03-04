/**
 * AI Action Executor
 * 
 * Executes structured JSON actions from Gemini AI on the hybrid canvas
 * (Canvas-system.md section 8)
 * 
 * Allowed actions: move, connect, highlight, zoom, group, cluster, create, delete, transform
 */

import type { Node, Edge, Viewport } from "reactflow";
import type { AIAction, AIActionPlan } from "@/types/canvas.types";

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

  constructor(context: ActionExecutorContext) {
    this.context = context;
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
      console.log("Executing action:", action);

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
        default:
          throw new Error(`Unsupported action type: ${(action as AIAction).type}`);
      }
    } catch (error: any) {
      console.error(`Failed to execute ${action.type} action:`, error);
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
    if (!action.source || !action.target) {
      throw new Error("Connect action requires source and target");
    }

    const newEdge: Edge = {
      id: `edge-${action.source}-${action.target}`,
      source: action.source,
      target: action.target,
      type: "default",
    };

    this.context.setEdges((edges) => {
      // Check if edge already exists
      const exists = edges.some(
        (e) => e.source === action.source && e.target === action.target
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
    if (!action.viewport) {
      throw new Error("Zoom action requires viewport");
    }

    this.context.setViewport(action.viewport);
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
   * Create a new node
   */
  private executeCreate(action: AIAction): Promise<void> {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: action.data?.type as string || "text",
      position: action.to || { x: 100, y: 100 },
      data: action.data || { label: "New Node" },
    };

    this.context.setNodes((nodes) => [...nodes, newNode]);
    return Promise.resolve();
  }

  /**
   * Delete a node
   */
  private executeDelete(action: AIAction): Promise<void> {
    if (!action.nodeId) {
      throw new Error("Delete action requires nodeId");
    }

    this.context.setNodes((nodes) => nodes.filter((n) => n.id !== action.nodeId));
    this.context.setEdges((edges) =>
      edges.filter((e) => e.source !== action.nodeId && e.target !== action.nodeId)
    );

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
}

/**
 * Legacy function for backward compatibility
 */
export function executeActions(actions: AIAction[]): Promise<void> {
  console.warn("executeActions is deprecated. Use ActionExecutor class instead.");
  return Promise.resolve();
}
