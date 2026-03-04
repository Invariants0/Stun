/**
 * Camera Synchronization Service
 * 
 * Synchronizes viewport across all three canvas layers (Canvas-system.md section 9)
 * Flow: TLDraw Camera → React Flow Viewport → Excalidraw Canvas Transform
 */

import type { TLCamera } from "tldraw";
import type { UnifiedCameraState } from "@/types/canvas.types";

export class CameraSyncService {
  private listeners: Set<(camera: UnifiedCameraState) => void> = new Set();
  private currentCamera: UnifiedCameraState | null = null;
  private syncEnabled: boolean = true;

  /**
   * Subscribe to camera changes
   */
  subscribe(listener: (camera: UnifiedCameraState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Enable/disable automatic synchronization
   */
  setEnabled(enabled: boolean) {
    this.syncEnabled = enabled;
  }

  /**
   * Update camera from TLDraw (primary source of truth)
   */
  updateFromTLDraw(tldrawCamera: TLCamera) {
    if (!this.syncEnabled) return;

    const unified: UnifiedCameraState = {
      tldrawCamera,
      reactFlowViewport: this.tldrawToReactFlow(tldrawCamera),
      excalidrawTransform: this.tldrawToExcalidraw(tldrawCamera),
      lastUpdated: Date.now(),
      source: "tldraw",
    };

    this.currentCamera = unified;
    this.notifyListeners(unified);
  }

  /**
   * Update camera from React Flow
   */
  updateFromReactFlow(viewport: { x: number; y: number; zoom: number }) {
    if (!this.syncEnabled) return;

    const tldrawCamera = this.reactFlowToTLDraw(viewport);
    const unified: UnifiedCameraState = {
      tldrawCamera,
      reactFlowViewport: viewport,
      excalidrawTransform: this.reactFlowToExcalidraw(viewport),
      lastUpdated: Date.now(),
      source: "reactflow",
    };

    this.currentCamera = unified;
    this.notifyListeners(unified);
  }

  /**
   * Update camera from Excalidraw
   */
  updateFromExcalidraw(transform: { x: number; y: number; zoom: number }) {
    if (!this.syncEnabled) return;

    const tldrawCamera = this.excalidrawToTLDraw(transform);
    const unified: UnifiedCameraState = {
      tldrawCamera,
      reactFlowViewport: this.excalidrawToReactFlow(transform),
      excalidrawTransform: transform,
      lastUpdated: Date.now(),
      source: "excalidraw",
    };

    this.currentCamera = unified;
    this.notifyListeners(unified);
  }

  /**
   * Get current unified camera state
   */
  getCurrentCamera(): UnifiedCameraState | null {
    return this.currentCamera;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(camera: UnifiedCameraState) {
    this.listeners.forEach((listener) => listener(camera));
  }

  // ============================================================================
  // Coordinate Transformations
  // ============================================================================

  /**
   * Convert TLDraw camera to React Flow viewport
   */
  private tldrawToReactFlow(camera: TLCamera): {
    x: number;
    y: number;
    zoom: number;
  } {
    return {
      x: camera.x,
      y: camera.y,
      zoom: camera.z,
    };
  }

  /**
   * Convert TLDraw camera to Excalidraw transform
   */
  private tldrawToExcalidraw(camera: TLCamera): {
    x: number;
    y: number;
    zoom: number;
  } {
    return {
      x: camera.x,
      y: camera.y,
      zoom: camera.z,
    };
  }

  /**
   * Convert React Flow viewport to TLDraw camera
   */
  private reactFlowToTLDraw(viewport: {
    x: number;
    y: number;
    zoom: number;
  }): TLCamera {
    return {
      id: "camera:page:page" as any,
      typeName: "camera" as const,
      x: viewport.x,
      y: viewport.y,
      z: viewport.zoom,
      meta: {},
    };
  }

  /**
   * Convert React Flow viewport to Excalidraw transform
   */
  private reactFlowToExcalidraw(viewport: {
    x: number;
    y: number;
    zoom: number;
  }): { x: number; y: number; zoom: number } {
    return {
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    };
  }

  /**
   * Convert Excalidraw transform to TLDraw camera
   */
  private excalidrawToTLDraw(transform: {
    x: number;
    y: number;
    zoom: number;
  }): TLCamera {
    return {
      id: "camera:page:page" as any,
      typeName: "camera" as const,
      x: transform.x,
      y: transform.y,
      z: transform.zoom,
      meta: {},
    };
  }

  /**
   * Convert Excalidraw transform to React Flow viewport
   */
  private excalidrawToReactFlow(transform: {
    x: number;
    y: number;
    zoom: number;
  }): { x: number; y: number; zoom: number } {
    return {
      x: transform.x,
      y: transform.y,
      zoom: transform.zoom,
    };
  }
}

// Singleton instance
export const cameraSyncService = new CameraSyncService();
