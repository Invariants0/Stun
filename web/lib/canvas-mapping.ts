/**
 * Element-to-Node Mapping System
 * 
 * Manages the relationship between:
 * - Excalidraw visual elements (drawings, shapes)
 * - React Flow knowledge nodes (AI-manipulatable)
 * 
 * Critical for hackathon demo: enables AI to see and manipulate drawn shapes
 */

import type { Node } from "reactflow";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { ElementNodeMapping } from "@/types/canvas.types";

export class CanvasMappingService {
  private mappings: Map<string, ElementNodeMapping>;
  private reverseMappings: Map<string, ElementNodeMapping>; // nodeId -> mapping

  constructor() {
    this.mappings = new Map();
    this.reverseMappings = new Map();
  }

  /**
   * Convert Excalidraw element to React Flow node
   */
  private convertElementToNode(element: ExcalidrawElement): Node {
    const nodeId = `mapped-${element.id}`;
    
    // Extract text from element
    let text = "";
    if (element.type === "text") {
      text = (element as any).text || "";
    } else if (element.type === "rectangle" || element.type === "ellipse") {
      // For shapes, create a descriptive label
      text = `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} Shape`;
    } else if (element.type === "arrow" || element.type === "line") {
      text = "Connection";
    } else {
      text = `${element.type} Element`;
    }

    // Determine node type based on Excalidraw element
    let nodeType = "text";
    if (element.type === "image") {
      nodeType = "image";
    }

    return {
      id: nodeId,
      type: nodeType,
      position: {
        x: element.x,
        y: element.y,
      },
      data: {
        label: text,
        originalElementId: element.id,
        elementType: element.type,
        // Store original element properties for reference
        width: element.width,
        height: element.height,
      },
    };
  }

  private lastElementsHash: string = "";
  private isProcessing: boolean = false;

  /**
   * Sync Excalidraw elements to React Flow nodes
   * This is the main function called when Excalidraw elements change
   */
  syncElementsToNodes(
    elements: readonly ExcalidrawElement[],
    currentNodes: Node[],
    setNodes: (nodes: Node[]) => void
  ): void {
    // Prevent infinite loops and duplicate processing
    if (this.isProcessing) {
      return;
    }

    // Create a hash of the current elements to detect actual changes
    const elementsHash = JSON.stringify(elements.map(el => ({
      id: el.id,
      type: el.type,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      isDeleted: el.isDeleted,
      text: (el as any).text || ''
    })));

    // Skip if no actual changes detected
    if (elementsHash === this.lastElementsHash) {
      return;
    }

    this.isProcessing = true;
    this.lastElementsHash = elementsHash;
    
    console.log("[Mapping] Syncing", elements.length, "Excalidraw elements to React Flow nodes");
    
    // Separate mapped nodes from other nodes (like media nodes)
    const mappedNodeIds = new Set(Array.from(this.reverseMappings.keys()));
    const unmappedNodes = currentNodes.filter(n => !mappedNodeIds.has(n.id));
    const newMappedNodes: Node[] = [];

    // Process each Excalidraw element
    for (const element of elements) {
      // Skip if element is deleted
      if (element.isDeleted) {
        this.removeMapping(element.id);
        continue;
      }

      const existingMapping = this.getMappingByElement(element.id);
      
      if (existingMapping) {
        // Update existing mapped node position/data
        const updatedNode = this.convertElementToNode(element);
        updatedNode.id = existingMapping.reactFlowNodeId; // Keep existing ID
        newMappedNodes.push(updatedNode);
        
        // Update sync status
        this.updateSyncStatus(element.id, "synced");
      } else {
        // Create new mapping and node for new elements
        const newNode = this.convertElementToNode(element);
        newMappedNodes.push(newNode);
        
        // Add mapping
        this.addMapping(element.id, newNode.id);
        console.log("[Mapping] Created node", newNode.id, "for element", element.id, "(", element.type, ")");
      }
    }

    // Combine unmapped nodes (media, etc.) with newly mapped nodes
    const finalNodes = [...unmappedNodes, ...newMappedNodes];

    // Remove mappings for deleted elements
    const currentElementIds = new Set(elements.map(el => el.id));
    const mappingsToRemove: string[] = [];
    
    for (const [elementId] of this.mappings.entries()) {
      if (!currentElementIds.has(elementId)) {
        mappingsToRemove.push(elementId);
      }
    }

    // Clean up mappings for deleted elements
    mappingsToRemove.forEach(elementId => this.removeMapping(elementId));

    // Update React Flow nodes
    console.log("[Mapping] Setting", finalNodes.length, "total nodes (", newMappedNodes.length, "mapped +", unmappedNodes.length, "unmapped)");
    setNodes(finalNodes);

    this.isProcessing = false;
  }

  /**
   * Add a new mapping between Excalidraw element and React Flow node
   */
  addMapping(excalidrawElementId: string, reactFlowNodeId: string): void {
    const mapping: ElementNodeMapping = {
      excalidrawElementId,
      reactFlowNodeId,
      createdAt: Date.now(),
      syncStatus: "synced",
    };

    this.mappings.set(excalidrawElementId, mapping);
    this.reverseMappings.set(reactFlowNodeId, mapping);
  }

  /**
   * Get mapping by Excalidraw element ID
   */
  getMappingByElement(elementId: string): ElementNodeMapping | undefined {
    return this.mappings.get(elementId);
  }

  /**
   * Get mapping by React Flow node ID
   */
  getMappingByNode(nodeId: string): ElementNodeMapping | undefined {
    return this.reverseMappings.get(nodeId);
  }

  /**
   * Remove a mapping
   */
  removeMapping(elementId: string): void {
    const mapping = this.mappings.get(elementId);
    if (mapping) {
      this.reverseMappings.delete(mapping.reactFlowNodeId);
      this.mappings.delete(elementId);
    }
  }

  /**
   * Check if an element is mapped
   */
  hasElementMapping(elementId: string): boolean {
    return this.mappings.has(elementId);
  }

  /**
   * Check if a node is mapped
   */
  hasNodeMapping(nodeId: string): boolean {
    return this.reverseMappings.has(nodeId);
  }

  /**
   * Get all mappings
   */
  getAllMappings(): ElementNodeMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * Update sync status
   */
  updateSyncStatus(
    elementId: string,
    status: "synced" | "pending" | "conflict"
  ): void {
    const mapping = this.mappings.get(elementId);
    if (mapping) {
      mapping.syncStatus = status;
    }
  }

  /**
   * Clear all mappings
   */
  clear(): void {
    this.mappings.clear();
    this.reverseMappings.clear();
  }

  /**
   * Get mapping statistics for debugging
   */
  getStats() {
    return {
      totalMappings: this.mappings.size,
      mappings: Array.from(this.mappings.entries()).map(([elementId, mapping]) => ({
        elementId,
        nodeId: mapping.reactFlowNodeId,
        syncStatus: mapping.syncStatus,
        age: Date.now() - mapping.createdAt,
      })),
    };
  }
}

// Global instance for the canvas
export const canvasMappingService = new CanvasMappingService();
