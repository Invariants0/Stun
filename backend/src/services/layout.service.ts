/**
 * Layout Service - Canvas Layout Transformation Algorithms
 * 
 * Provides layout algorithms to restructure canvas nodes into different visual formats:
 * - Mind Map: Radial/hierarchical branching
 * - Roadmap: Sequential vertical/horizontal phases
 * - Timeline: Chronological horizontal layout
 * - Flowchart: Process-based hierarchical flow
 * - Presentation: Slide-by-slide grouped layout
 */

// Local type definitions (compatible with React Flow)
export interface Node {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data?: any;
  style?: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  style?: any;
  label?: string;
  animated?: boolean;
}

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
  metadata?: {
    layout: string;
    centerNodeId?: string;
    phases?: string[];
    slides?: number;
    levels?: any;
    spacing?: { x: number; y: number };
    totalNodes?: number;
    generatedAt?: number;
  };
}

export interface LayoutOptions {
  spacing?: { x: number; y: number };
  centerPosition?: { x: number; y: number };
  direction?: 'horizontal' | 'vertical' | 'radial';
  groupBy?: 'type' | 'topic' | 'priority' | 'date';
}

class LayoutService {
  
  /**
   * Mind Map Layout - Radial branching from center
   */
  mindmap(nodes: Node[], edges: Edge[], options: LayoutOptions = {}): LayoutResult {
    const {
      spacing = { x: 200, y: 150 },
      centerPosition = { x: 0, y: 0 }
    } = options;

    if (nodes.length === 0) {
      return { nodes, edges };
    }

    // Find or create center node (most connected or first one)
    const centerNode = this.findCenterNode(nodes, edges) || nodes[0];
    const remainingNodes = nodes.filter(n => n.id !== centerNode.id);

    // Position center node
    const positionedNodes: Node[] = [{
      ...centerNode,
      position: centerPosition,
      data: {
        ...centerNode.data,
        isCenter: true
      },
      style: {
        ...centerNode.style,
        border: '3px solid #059669',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        fontWeight: 600
      }
    }];

    // Create radial branches
    const angleStep = (2 * Math.PI) / Math.max(remainingNodes.length, 1);
    const baseRadius = 300;

    remainingNodes.forEach((node, index) => {
      const angle = index * angleStep;
      const radius = baseRadius + (Math.floor(index / 6) * 150); // Multiple rings
      
      positionedNodes.push({
        ...node,
        position: {
          x: centerPosition.x + Math.cos(angle) * radius,
          y: centerPosition.y + Math.sin(angle) * radius
        },
        style: {
          ...node.style,
          border: '2px solid #10b981',
          borderRadius: '12px'
        }
      });
    });

    // Create radial edges from center
    const mindmapEdges = remainingNodes.map((node, index) => ({
      id: `mindmap-${centerNode.id}-${node.id}`,
      source: centerNode.id,
      target: node.id,
      type: 'straight',
      style: { stroke: '#10b981', strokeWidth: 2 },
      animated: false
    }));

    return {
      nodes: positionedNodes,
      edges: [...edges.filter(e => !mindmapEdges.find(me => me.id === e.id)), ...mindmapEdges],
      metadata: { 
        layout: 'mindmap', 
        centerNodeId: centerNode.id,
        spacing,
        totalNodes: positionedNodes.length,
        generatedAt: Date.now()
      }
    };
  }

  /**
   * Roadmap Layout - Sequential phases with progression arrows
   */
  roadmap(nodes: Node[], edges: Edge[], options: LayoutOptions = {}): LayoutResult {
    const {
      spacing = { x: 300, y: 200 },
      centerPosition = { x: 0, y: 0 },
      direction = 'horizontal'
    } = options;

    const phases = this.groupIntoPhases(nodes);
    const positionedNodes: Node[] = [];
    const roadmapEdges: Edge[] = [];

    const phaseColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    phases.forEach((phaseNodes, phaseIndex) => {
      const color = phaseColors[phaseIndex % phaseColors.length];
      
      phaseNodes.forEach((node, nodeIndex) => {
        const position = direction === 'horizontal' 
          ? {
              x: centerPosition.x + phaseIndex * spacing.x,
              y: centerPosition.y + (nodeIndex - phaseNodes.length / 2) * (spacing.y / 2)
            }
          : {
              x: centerPosition.x + (nodeIndex - phaseNodes.length / 2) * (spacing.x / 2),
              y: centerPosition.y + phaseIndex * spacing.y
            };

        positionedNodes.push({
          ...node,
          position,
          data: {
            ...node.data,
            phase: phaseIndex + 1
          },
          style: {
            ...node.style,
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            color: 'white',
            border: `2px solid ${color}`,
            borderRadius: '8px',
            fontWeight: 600
          }
        });
      });

      // Connect phases sequentially
      if (phaseIndex > 0) {
        const prevPhase = phases[phaseIndex - 1];
        const currentPhase = phaseNodes;
        
        // Connect last node of previous phase to first of current phase
        if (prevPhase.length > 0 && currentPhase.length > 0) {
          roadmapEdges.push({
            id: `roadmap-phase-${phaseIndex - 1}-${phaseIndex}`,
            source: prevPhase[prevPhase.length - 1].id,
            target: currentPhase[0].id,
            type: 'straight',
            style: { stroke: color, strokeWidth: 3 },
            animated: true,
            label: `Phase ${phaseIndex}`
          });
        }
      }
    });

    return {
      nodes: positionedNodes,
      edges: [...edges.filter(e => !e.id.startsWith('roadmap-')), ...roadmapEdges],
      metadata: { 
        layout: 'roadmap', 
        phases: phases.map((_, i) => `Phase ${i + 1}`),
        spacing,
        totalNodes: positionedNodes.length,
        generatedAt: Date.now()
      }
    };
  }

  /**
   * Timeline Layout - Chronological horizontal progression
   */
  timeline(nodes: Node[], edges: Edge[], options: LayoutOptions = {}): LayoutResult {
    const {
      spacing = { x: 250, y: 100 },
      centerPosition = { x: 0, y: 0 }
    } = options;

    // Sort nodes chronologically (by creation date or priority)
    const sortedNodes = [...nodes].sort((a, b) => {
      const dateA = a.data?.createdAt || a.data?.priority || 0;
      const dateB = b.data?.createdAt || b.data?.priority || 0;
      return dateA - dateB;
    });

    const positionedNodes = sortedNodes.map((node, index) => ({
      ...node,
      position: {
        x: centerPosition.x + index * spacing.x,
        y: centerPosition.y + (index % 2 === 0 ? 0 : spacing.y) // Alternate above/below timeline
      },
      style: {
        ...node.style,
        background: index % 2 === 0 ? '#3b82f6' : '#10b981',
        color: 'white',
        border: '2px solid #1e293b',
        borderRadius: '12px'
      }
    }));

    // Create timeline connections
    const timelineEdges = sortedNodes.slice(1).map((node, index) => ({
      id: `timeline-${index}-${index + 1}`,
      source: sortedNodes[index].id,
      target: node.id,
      type: 'straight',
      style: { stroke: '#64748b', strokeWidth: 2 },
      animated: true
    }));

    return {
      nodes: positionedNodes,
      edges: [...edges.filter(e => !e.id.startsWith('timeline-')), ...timelineEdges],
      metadata: { 
        layout: 'timeline',
        spacing,
        totalNodes: positionedNodes.length,
        generatedAt: Date.now()
      }
    };
  }

  /**
   * Flowchart Layout - Process hierarchy with decision flow
   */
  flowchart(nodes: Node[], edges: Edge[], options: LayoutOptions = {}): LayoutResult {
    const {
      spacing = { x: 200, y: 150 },
      centerPosition = { x: 0, y: 0 }
    } = options;

    // Build hierarchy from existing edges
    const hierarchy = this.buildHierarchy(nodes, edges);
    const positionedNodes: Node[] = [];

    // Position nodes level by level
    hierarchy.levels.forEach((levelNodes, level) => {
      levelNodes.forEach((node, index) => {
        const nodeType = this.inferFlowchartNodeType(node, edges);
        
        positionedNodes.push({
          ...node,
          position: {
            x: centerPosition.x + (index - levelNodes.length / 2) * spacing.x,
            y: centerPosition.y + level * spacing.y
          },
          data: {
            ...node.data,
            level: level,
            flowchartType: nodeType
          },
          style: {
            ...node.style,
            background: this.getFlowchartNodeColor(nodeType),
            color: 'white',
            border: '2px solid #1e293b',
            borderRadius: nodeType === 'decision' ? '50%' : '8px',
            fontSize: '0.875rem',
            fontWeight: 500
          }
        });
      });
    });

    // Enhance existing edges with flowchart styling
    const flowchartEdges = edges.map(edge => ({
      ...edge,
      type: 'straight',
      style: { stroke: '#475569', strokeWidth: 2 },
      animated: true,
      label: edge.label || (this.inferFlowchartNodeType(
        nodes.find(n => n.id === edge.source)!, edges
      ) === 'decision' ? 'Yes/No' : undefined)
    }));

    return {
      nodes: positionedNodes,
      edges: flowchartEdges,
      metadata: { 
        layout: 'flowchart',
        levels: hierarchy.levels,
        spacing,
        totalNodes: positionedNodes.length,
        generatedAt: Date.now()
      }
    };
  }

  /**
   * Presentation Layout - Slide-based grouping
   */
  presentation(nodes: Node[], edges: Edge[], options: LayoutOptions = {}): LayoutResult {
    const {
      spacing = { x: 150, y: 100 },
      centerPosition = { x: 0, y: 0 }
    } = options;

    const slides = this.groupIntoSlides(nodes, 4); // 4 nodes per slide max
    const positionedNodes: Node[] = [];
    const slideWidth = 600;
    const slideHeight = 400;

    slides.forEach((slideNodes, slideIndex) => {
      const slideX = centerPosition.x + slideIndex * (slideWidth + 100);
      
      slideNodes.forEach((node, nodeIndex) => {
        const cols = Math.ceil(Math.sqrt(slideNodes.length));
        const row = Math.floor(nodeIndex / cols);
        const col = nodeIndex % cols;
        
        positionedNodes.push({
          ...node,
          position: {
            x: slideX + col * spacing.x,
            y: centerPosition.y + row * spacing.y
          },
          data: {
            ...node.data,
            slide: slideIndex + 1
          },
          style: {
            ...node.style,
            background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
            color: 'white',
            border: '2px solid #4338ca',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            padding: '12px'
          }
        });
      });
    });

    return {
      nodes: positionedNodes,  
      edges: edges, // Keep original edges
      metadata: { 
        layout: 'presentation',
        slides: slides.length,
        spacing,
        totalNodes: positionedNodes.length,
        generatedAt: Date.now()
      }
    };
  }

  // Helper Methods

  private findCenterNode(nodes: Node[], edges: Edge[]): Node | null {
    const connectionCount = new Map<string, number>();
    
    // Count connections for each node
    edges.forEach(edge => {
      connectionCount.set(edge.source, (connectionCount.get(edge.source) || 0) + 1);
      connectionCount.set(edge.target, (connectionCount.get(edge.target) || 0) + 1);
    });

    // Find most connected node
    let maxConnections = 0;
    let centerNode = null;

    for (const node of nodes) {
      const connections = connectionCount.get(node.id) || 0;
      if (connections > maxConnections) {
        maxConnections = connections;
        centerNode = node;
      }
    }

    return centerNode;
  }

  private groupIntoPhases(nodes: Node[]): Node[][] {
    // Group nodes by priority, type, or creation order
    const phases: Node[][] = [];
    const nodesPerPhase = Math.ceil(nodes.length / 4); // Max 4 phases

    for (let i = 0; i < nodes.length; i += nodesPerPhase) {
      phases.push(nodes.slice(i, i + nodesPerPhase));
    }

    return phases;
  }

  private groupIntoSlides(nodes: Node[], maxPerSlide: number): Node[][] {
    const slides: Node[][] = [];
    
    for (let i = 0; i < nodes.length; i += maxPerSlide) {
      slides.push(nodes.slice(i, i + maxPerSlide));
    }

    return slides;
  }

  private buildHierarchy(nodes: Node[], edges: Edge[]) {
    // Build simple hierarchy - could be enhanced with topological sort
    const levels: Node[][] = [];
    const visited = new Set<string>();
    
    // Find root nodes (no incoming edges)
    const hasIncoming = new Set(edges.map(e => e.target));
    const roots = nodes.filter(n => !hasIncoming.has(n.id));

    if (roots.length === 0) {
      // If no clear hierarchy, just distribute evenly
      const perLevel = Math.ceil(Math.sqrt(nodes.length));
      for (let i = 0; i < nodes.length; i += perLevel) {
        levels.push(nodes.slice(i, i + perLevel));
      }
    } else {
      levels.push(roots);
      visited.clear();
      roots.forEach(r => visited.add(r.id));

      // Build subsequent levels
      let currentLevel = 0;
      while (visited.size < nodes.length && currentLevel < 10) {
        const nextLevel: Node[] = [];
        
        if (levels[currentLevel]) {
          levels[currentLevel].forEach(node => {
            edges.filter(e => e.source === node.id).forEach(edge => {
              const targetNode = nodes.find(n => n.id === edge.target);
              if (targetNode && !visited.has(targetNode.id)) {
                nextLevel.push(targetNode);
                visited.add(targetNode.id);
              }
            });
          });
        }

        if (nextLevel.length > 0) {
          levels.push(nextLevel);
        }
        currentLevel++;
      }
    }

    return { levels };
  }

  private inferFlowchartNodeType(node: Node, edges: Edge[]): 'start' | 'process' | 'decision' | 'end' {
    const outgoingEdges = edges.filter(e => e.source === node.id);
    const incomingEdges = edges.filter(e => e.target === node.id);

    if (incomingEdges.length === 0) return 'start';
    if (outgoingEdges.length === 0) return 'end';
    if (outgoingEdges.length > 1) return 'decision';
    return 'process';
  }

  private getFlowchartNodeColor(type: string): string {
    switch (type) {
      case 'start': return '#10b981'; // Green
      case 'end': return '#ef4444';   // Red  
      case 'decision': return '#f59e0b'; // Yellow
      case 'process': 
      default: return '#3b82f6';      // Blue
    }
  }
}

export const layoutService = new LayoutService();