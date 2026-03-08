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
import { useBoardStore } from "@/store/board.store";
import { canvasMappingService } from "@/lib/canvas-mapping";

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
    
    // Create a new Excalidraw text element
    const newElement: any = {
      id: `ai-element-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "text",
      x: position.x,
      y: position.y,
      width: 200,
      height: 50,
      angle: 0,
      strokeColor: "#10b981", // Green to indicate AI-created
      backgroundColor: "#1e293b",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      text: text,
      fontSize: 16,
      fontFamily: 1,
      textAlign: "center" as const,
      verticalAlign: "middle" as const,
      containerId: null,
      originalText: text,
      autoResize: true,
      lineHeight: 1.25,
    };
    
    // Update Excalidraw elements in store
    const { setExcalidrawElements } = useBoardStore.getState();
    setExcalidrawElements(this.getBoardId(), [...currentElements, newElement]);
    
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
}

/**
 * Legacy function for backward compatibility
 */
export function executeActions(actions: AIAction[]): Promise<void> {
  console.warn("executeActions is deprecated. Use ActionExecutor class instead.");
  return Promise.resolve();
}
