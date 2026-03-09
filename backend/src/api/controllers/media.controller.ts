import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { mediaService } from "../../services/media.service";
import { logger } from "../../config";

const urlParseSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

export const mediaController = {
  /**
   * Upload file(s) to cloud storage
   */
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        res.status(400).json({ error: "No files provided" });
        return;
      }

      const userId = req.user!.uid;
      const uploadPromises = files.map(file => mediaService.uploadFile(file, userId));
      const results = await Promise.all(uploadPromises);

      logger.info(`[media] Uploaded ${results.length} files for user ${userId}`);
      res.status(201).json({ 
        success: true,
        files: results,
        count: results.length 
      });
    } catch (error: any) {
      logger.error('[media] Upload controller error:', error);
      next(error);
    }
  },

  /**
   * Parse URL and extract metadata
   */
  async parseUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = urlParseSchema.parse(req.body);
      const userId = req.user!.uid;
      
      const result = await mediaService.parseUrl(url, userId);
      
      logger.info(`[media] URL parsed for user ${userId}: ${url}`);
      res.json({
        success: true,
        media: result
      });
    } catch (error: any) {
      logger.error('[media] URL parse controller error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid URL provided" });
        return;
      }
      
      next(error);
    }
  },

  /**
   * Get link preview without creating media entry
   */
  async getLinkPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = urlParseSchema.parse(req.query);
      
      const preview = await mediaService.getLinkPreview(url);
      
      res.json({
        success: true,
        preview
      });
    } catch (error: any) {
      logger.error('[media] Link preview controller error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid URL provided" });
        return;
      }
      
      next(error);
    }
  },

  /**
   * Delete media file
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.uid;
      
      // TODO: Verify user owns this media file
      // For now, assume filename format includes userId
      const fileName = `${userId}/${id}`;
      
      await mediaService.deleteFile(fileName);
      
      logger.info(`[media] File deleted by user ${userId}: ${id}`);
      res.json({ success: true });
    } catch (error: any) {
      logger.error('[media] Delete controller error:', error);
      next(error);
    }
  },

  /**
   * Get media file info
   */
  async getInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.uid;
      
      const fileName = `${userId}/${id}`;
      const info = await mediaService.getFileInfo(fileName);
      
      res.json({
        success: true,
        info
      });
    } catch (error: any) {
      logger.error('[media] Get info controller error:', error);
      next(error);
    }
  },
};