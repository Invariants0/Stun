/**
 * Element-to-Node Mapping System
 * 
 * Manages the relationship between:
 * - Excalidraw visual elements
 * - React Flow knowledge nodes
 * 
 * As per Canvas-system.md section 5
 */

import type { ElementNodeMapping } from "@/types/canvas.types";

export class CanvasMappingService {
  private mappings: Map<string, ElementNodeMapping>;
  private reverseMappings: Map<string, ElementNodeMapping>; // nodeId -> mapping

  constructor() {
    this.mappings = new Map();
    this.reverseMappings = new Map();
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
   * Serialize mappings for persistence
   */
  serialize(): string {
    return JSON.stringify(this.getAllMappings());
  }

  /**
   * Load mappings from serialized data
   */
  deserialize(data: string): void {
    this.clear();
    const mappings: ElementNodeMapping[] = JSON.parse(data);
    mappings.forEach((mapping) => {
      this.mappings.set(mapping.excalidrawElementId, mapping);
      this.reverseMappings.set(mapping.reactFlowNodeId, mapping);
    });
  }
}

// Singleton instance
export const canvasMappingService = new CanvasMappingService();
