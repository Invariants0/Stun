/**
 * Layout Controller - Canvas Layout Transformation API
 * 
 * Handles HTTP requests for layout transformations
 */

import type { Request, Response, NextFunction } from "express";
import { layoutService } from "../../services/layout.service";
import { logger } from "../../config/logger";
import { z } from "zod";

// Validation schemas
const LayoutTransformSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    type: z.string().optional(),
    position: z.object({
      x: z.number(),
      y: z.number()
    }),
    data: z.any().optional(),
    style: z.any().optional()
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.string().optional(),
    style: z.any().optional(),
    label: z.string().optional(),
    animated: z.boolean().optional()
  })),
  layoutType: z.enum(['mindmap', 'roadmap', 'timeline', 'flowchart', 'presentation']),
  options: z.object({
    spacing: z.object({
      x: z.number(),
      y: z.number()
    }).optional(),
    centerPosition: z.object({
      x: z.number(), 
      y: z.number()
    }).optional(),
    direction: z.enum(['horizontal', 'vertical', 'radial']).optional(),
    groupBy: z.enum(['type', 'topic', 'priority', 'date']).optional()
  }).optional()
});

class LayoutController {
  
  /**
   * POST /layout/transform
   * Transform canvas nodes into specified layout
   */
  async transform(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = LayoutTransformSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          error: "ValidationError",
          message: "Invalid layout transformation parameters",
          details: validation.error.issues
        });
        return;
      }

      const { nodes, edges, layoutType, options = {} } = validation.data;

      logger.info(`[layout] Transforming ${nodes.length} nodes to ${layoutType} layout`);

      let result;
      
      try {
        switch (layoutType) {
          case 'mindmap':
            result = layoutService.mindmap(nodes, edges, options);
            break;
          case 'roadmap':
            result = layoutService.roadmap(nodes, edges, options);
            break;
          case 'timeline':
            result = layoutService.timeline(nodes, edges, options);
            break;
          case 'flowchart':
            result = layoutService.flowchart(nodes, edges, options);
            break;
          case 'presentation':
            result = layoutService.presentation(nodes, edges, options);
            break;
          default:
            res.status(400).json({
              error: "UnsupportedLayout",
              message: `Layout type '${layoutType}' is not supported`
            });
            return;
        }

        logger.info(`[layout] ${layoutType} transformation completed: ${result.nodes.length} nodes positioned`);

        res.json({
          success: true,
          layout: layoutType,
          result: {
            nodes: result.nodes,
            edges: result.edges,
            metadata: result.metadata
          },
          stats: {
            originalNodes: nodes.length,
            resultNodes: result.nodes.length,
            originalEdges: edges.length,
            resultEdges: result.edges.length
          }
        });

      } catch (layoutError: any) {
        logger.error(`[layout] ${layoutType} transformation failed:`, layoutError);
        res.status(500).json({
          error: "LayoutTransformError",
          message: `Failed to transform to ${layoutType} layout: ${layoutError.message}`
        });
      }

    } catch (error: any) {
      logger.error("[layout] Transform controller error:", error);
      res.status(500).json({
        error: "InternalError",
        message: "Layout transformation failed"
      });
      next(error);
    }
  }

  /**
   * GET /layout/types
   * Get available layout types and their descriptions
   */
  async getLayoutTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const layoutTypes = [
        {
          id: 'mindmap',
          name: 'Mind Map',
          description: 'Radial branching from a central concept',
          features: ['Center node focus', 'Radial positioning', 'Hierarchical branching'],
          bestFor: 'Brainstorming, concept mapping, knowledge organization'
        },
        {
          id: 'roadmap',
          name: 'Roadmap',
          description: 'Sequential phases with colored progression',
          features: ['Phase-based grouping', 'Sequential flow', 'Color coding'],
          bestFor: 'Project planning, milestone tracking, strategic planning'
        },
        {
          id: 'timeline',
          name: 'Timeline',
          description: 'Chronological horizontal progression',
          features: ['Time-based ordering', 'Alternating positioning', 'Flow connections'],
          bestFor: 'Historical events, project schedules, process steps'
        },
        {
          id: 'flowchart',
          name: 'Flowchart',
          description: 'Process hierarchy with decision flow',
          features: ['Hierarchical levels', 'Decision nodes', 'Process flow'],
          bestFor: 'Process documentation, decision trees, workflow design'
        },
        {
          id: 'presentation',
          name: 'Presentation',
          description: 'Slide-based grouping for presentations',
          features: ['Slide organization', 'Group layout', 'Consistent spacing'],
          bestFor: 'Presentation preparation, content organization, storytelling'
        }
      ];

      res.json({
        success: true,
        layoutTypes,
        count: layoutTypes.length
      });

    } catch (error: any) {
      logger.error("[layout] Get layout types error:", error);
      res.status(500).json({
        error: "InternalError", 
        message: "Failed to get layout types"
      });
      next(error);
    }
  }

  /**
   * POST /layout/preview
   * Preview layout transformation without applying
   */
  async preview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = LayoutTransformSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          error: "ValidationError",
          message: "Invalid preview parameters"
        });
        return;
      }

      const { nodes, edges, layoutType, options = {} } = validation.data;

      // Return preview metadata without full transformation
      const preview = {
        layoutType,
        estimatedChanges: {
          nodesRepositioned: nodes.length,
          edgesModified: edges.length,
          newEdges: this.estimateNewEdges(layoutType, nodes.length)
        },
        features: this.getLayoutFeatures(layoutType),
        options: this.getDefaultOptions(layoutType)
      };

      res.json({
        success: true,
        preview
      });

    } catch (error: any) {
      logger.error("[layout] Preview error:", error);
      res.status(500).json({
        error: "InternalError",
        message: "Preview generation failed"
      });
      next(error);
    }
  }

  // Helper methods
  private estimateNewEdges(layoutType: string, nodeCount: number): number {
    switch (layoutType) {
      case 'mindmap': return Math.max(nodeCount - 1, 0); // Star pattern
      case 'roadmap': return Math.ceil(nodeCount / 2);   // Phase connections
      case 'timeline': return Math.max(nodeCount - 1, 0); // Sequential
      case 'flowchart': return nodeCount; // Keep existing + some new
      case 'presentation': return 0; // No new edges
      default: return 0;
    }
  }

  private getLayoutFeatures(layoutType: string): string[] {
    const features = {
      mindmap: ['Radial positioning', 'Center focus', 'Color coding'],
      roadmap: ['Phase grouping', 'Sequential flow', 'Progress indicators'],
      timeline: ['Chronological order', 'Alternating layout', 'Flow arrows'],
      flowchart: ['Hierarchical levels', 'Decision nodes', 'Process shapes'],
      presentation: ['Slide grouping', 'Grid layout', 'Presentation style']
    };
    
    return features[layoutType as keyof typeof features] || [];
  }

  private getDefaultOptions(layoutType: string) {
    const defaults = {
      mindmap: { spacing: { x: 200, y: 150 }, direction: 'radial' },
      roadmap: { spacing: { x: 300, y: 200 }, direction: 'horizontal' },
      timeline: { spacing: { x: 250, y: 100 }, direction: 'horizontal' },
      flowchart: { spacing: { x: 200, y: 150 }, direction: 'vertical' },
      presentation: { spacing: { x: 150, y: 100 }, groupBy: 'topic' }
    };

    return defaults[layoutType as keyof typeof defaults] || {};
  }
}

export const layoutController = new LayoutController();