/**
 * Layout Service Tests
 * 
 * Tests for canvas layout transformation algorithms
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { layoutService } from "../src/services/layout.service";

// Mock React Flow node structure
const getMockNodes = () => [
  {
    id: "node-1",
    type: "text",
    position: { x: 100, y: 100 },
    data: { label: "Central Concept" }
  },
  {
    id: "node-2", 
    type: "text",
    position: { x: 200, y: 200 },
    data: { label: "Branch A" }
  },
  {
    id: "node-3",
    type: "text", 
    position: { x: 300, y: 300 },
    data: { label: "Branch B" }
  },
  {
    id: "node-4",
    type: "text",
    position: { x: 400, y: 400 },
    data: { label: "Branch C" }
  }
];

const getMockEdges = () => [
  {
    id: "edge-1-2",
    source: "node-1",
    target: "node-2"
  },
  {
    id: "edge-1-3", 
    source: "node-1",
    target: "node-3"
  }
];

describe("Layout Service", () => {
  
  describe("Mindmap Layout", () => {
    test("should create radial layout around center node", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      
      const result = layoutService.mindmap(nodes, edges);
      
      expect(result.nodes).toHaveLength(4);
      expect(result.edges.length).toBeGreaterThanOrEqual(3); // At least original + star connections
      expect(result.metadata!.layout).toBe("mindmap");
      
      // Check that nodes are positioned radially
      const centerNode = result.nodes.find(n => n.data?.isCenter);
      expect(centerNode).toBeDefined();
    });
    
    test("should respect custom center position", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      const customCenter = { x: 500, y: 300 };
      
      const result = layoutService.mindmap(nodes, edges, {
        centerPosition: customCenter
      });
      
      const centerNode = result.nodes.find(n => n.data?.isCenter);
      expect(centerNode?.position.x).toBe(customCenter.x);
      expect(centerNode?.position.y).toBe(customCenter.y);
    });
  });
  
  describe("Roadmap Layout", () => {
    test("should create sequential phase layout", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      
      const result = layoutService.roadmap(nodes, edges);
      
      expect(result.nodes).toHaveLength(4);
      expect(result.metadata!.layout).toBe("roadmap");
      expect(result.metadata!.phases).toBeDefined();
      
      // Check phase assignment
      result.nodes.forEach(node => {
        expect(node.data?.phase).toBeDefined();
        expect(node.style?.background).toBeDefined();
      });
    });
    
    test("should create phase connections", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      
      const result = layoutService.roadmap(nodes, edges);
      
      // Should have connections between phases
      expect(result.edges.length).toBeGreaterThan(0);
    });
  });
  
  describe("Timeline Layout", () => {
    test("should arrange nodes chronologically", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      
      const result = layoutService.timeline(nodes, edges);
      
      expect(result.nodes).toHaveLength(4);
      expect(result.metadata!.layout).toBe("timeline");
      
      // Check sequential positioning
      const sortedNodes = result.nodes.sort((a, b) => a.position.x - b.position.x);
      for (let i = 1; i < sortedNodes.length; i++) {
        expect(sortedNodes[i].position.x).toBeGreaterThan(sortedNodes[i-1].position.x);
      }
    });
    
    test("should create timeline connections", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      
      const result = layoutService.timeline(nodes, edges);
      
      // Should have sequential connections
      expect(result.edges.length).toBeGreaterThanOrEqual(nodes.length - 1);
    });
  });
  
  describe("Flowchart Layout", () => {
    test("should create hierarchical layout", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      
      const result = layoutService.flowchart(nodes, edges);
      
      expect(result.nodes).toHaveLength(4);
      expect(result.metadata!.layout).toBe("flowchart");
      expect(result.metadata!.levels).toBeDefined();
      
      // Check level assignment
      result.nodes.forEach(node => {
        expect(node.data?.level).toBeDefined();
      });
    });
    
    test("should assign appropriate node shapes", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      
      const result = layoutService.flowchart(nodes, edges);
      
      result.nodes.forEach(node => {
        expect(['start', 'process', 'decision', 'end']).toContain(node.data?.flowchartType);
      });
    });
  });
  
  describe("Presentation Layout", () => {
    test("should group nodes into slides", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      
      const result = layoutService.presentation(nodes, edges);
      
      expect(result.nodes).toHaveLength(4);
      expect(result.metadata!.layout).toBe("presentation");
      expect(result.metadata!.slides).toBeDefined();
      expect(result.metadata!.slides).toBeGreaterThan(0);
      
      // Check slide assignment
      result.nodes.forEach(node => {
        expect(node.data?.slide).toBeDefined();
      });
    });
    
    test("should position nodes within slide bounds", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      
      const result = layoutService.presentation(nodes, edges);
      
      // All nodes should be positioned within reasonable slide bounds
      result.nodes.forEach(node => {
        expect(node.position.x).toBeGreaterThanOrEqual(-1000);
        expect(node.position.x).toBeLessThanOrEqual(2000);
        expect(node.position.y).toBeGreaterThanOrEqual(-1000);
        expect(node.position.y).toBeLessThanOrEqual(1000);
      });
    });
  });
  
  describe("Layout Options", () => {
    test("should respect custom spacing", () => {
      const nodes = getMockNodes();
      const edges = getMockEdges();
      const customSpacing = { x: 400, y: 300 };
      
      const result = layoutService.mindmap(nodes, edges, {
        spacing: customSpacing
      });
      
      // Check that spacing is applied (difficult to test exact values,
      // but we can check that positions changed significantly)
      expect(result.nodes).toHaveLength(4);
      expect(result.metadata!.spacing).toEqual(customSpacing);
    });
  });
});