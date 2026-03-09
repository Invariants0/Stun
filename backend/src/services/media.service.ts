import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { envVars, logger } from '../config';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface MediaUploadResult {
  id: string;
  type: 'image' | 'pdf' | 'video' | 'document' | 'link';
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnail?: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    title?: string;
    description?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export interface LinkPreview {
  url: string;
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
  type: 'website' | 'youtube' | 'vimeo' | 'twitter' | 'github';
}

class MediaService {
  private storage?: Storage;
  private bucketName: string;
  private storageMode: 'gcs' | 'local';
  private uploadsRoot: string;

  constructor() {
    const explicitMode = process.env.MEDIA_STORAGE;
    const hasGcpCreds = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    this.storageMode = explicitMode === 'gcs' || (explicitMode !== 'local' && hasGcpCreds) ? 'gcs' : 'local';

    if (this.storageMode === 'gcs') {
      this.storage = new Storage({
        projectId: envVars.GCP_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    }

    this.bucketName = envVars.GCP_PROJECT_ID + '-media';
    this.uploadsRoot = path.resolve(process.cwd(), 'uploads');

    logger.info(`[media] Storage mode: ${this.storageMode}`);
  }

  /**
   * Upload file to Google Cloud Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string
  ): Promise<MediaUploadResult> {
    try {
      if (this.storageMode === 'local') {
        return this.uploadFileLocal(file, userId);
      }

      if (!this.storage) {
        throw new Error('GCS storage client not initialized');
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
      const fileName = `${userId}/${fileId}-${file.originalname}`;
      const bucket = this.storage.bucket(this.bucketName);
      const fileObj = bucket.file(fileName);

      // Upload file
      const stream = fileObj.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', resolve);
        stream.end(file.buffer);
      });

      // Make file publicly accessible
      await fileObj.makePublic();
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;

      // Generate metadata based on file type
      const metadata = await this.generateMetadata(file);
      
      // Generate thumbnail for images
      let thumbnailUrl: string | undefined;
      if (file.mimetype.startsWith('image/')) {
        thumbnailUrl = await this.generateThumbnail(file, userId, fileId);
      }

      const result: MediaUploadResult = {
        id: fileId,
        type: this.getFileType(file.mimetype),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: publicUrl,
        thumbnail: thumbnailUrl,
        metadata,
        createdAt: new Date().toISOString(),
      };

      logger.info(`[media] File uploaded: ${fileId}, type: ${result.type}`);
      return result;
    } catch (error) {
      logger.error('[media] Upload failed:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Generate thumbnail for images
   */
  private async generateThumbnail(
    file: Express.Multer.File,
    userId: string,
    fileId: string
  ): Promise<string> {
    try {
      if (this.storageMode === 'local') {
        const userDir = path.join(this.uploadsRoot, this.safePath(userId));
        await fs.mkdir(userDir, { recursive: true });

        const thumbnailBuffer = await sharp(file.buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        const thumbnailName = `${fileId}-thumb.jpg`;
        const thumbnailPath = path.join(userDir, thumbnailName);
        await fs.writeFile(thumbnailPath, thumbnailBuffer);
        return `/uploads/${encodeURIComponent(this.safePath(userId))}/${thumbnailName}`;
      }

      if (!this.storage) {
        throw new Error('GCS storage client not initialized');
      }

      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailName = `${userId}/${fileId}-thumb.jpg`;
      const bucket = this.storage.bucket(this.bucketName);
      const thumbnailFile = bucket.file(thumbnailName);

      const stream = thumbnailFile.createWriteStream({
        metadata: { contentType: 'image/jpeg' },
      });

      await new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', resolve);
        stream.end(thumbnailBuffer);
      });

      await thumbnailFile.makePublic();
      return `https://storage.googleapis.com/${this.bucketName}/${thumbnailName}`;
    } catch (error) {
      logger.error('[media] Thumbnail generation failed:', error);
      return undefined as any;
    }
  }

  /**
   * Generate metadata based on file type
   */
  private async generateMetadata(file: Express.Multer.File): Promise<any> {
    const metadata: any = {};

    if (file.mimetype.startsWith('image/')) {
      try {
        const imageMetadata = await sharp(file.buffer).metadata();
        metadata.width = imageMetadata.width;
        metadata.height = imageMetadata.height;
        metadata.format = imageMetadata.format;
      } catch (error) {
        logger.error('[media] Image metadata extraction failed:', error);
      }
    }

    return metadata;
  }

  /**
   * Parse URL and create media entry
   */
  async parseUrl(url: string, userId: string): Promise<MediaUploadResult> {
    try {
      const preview = await this.getLinkPreview(url);
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

      const result: MediaUploadResult = {
        id: fileId,
        type: preview.type === 'youtube' || preview.type === 'vimeo' ? 'video' : 'link',
        originalName: preview.title || url,
        mimeType: 'text/html',
        size: 0,
        url: url,
        thumbnail: preview.image,
        metadata: {
          title: preview.title,
          description: preview.description,
          siteName: preview.siteName,
          linkType: preview.type,
        },
        createdAt: new Date().toISOString(),
      };

      // Extract video metadata for YouTube/Vimeo
      if (preview.type === 'youtube' || preview.type === 'vimeo') {
        result.metadata.videoId = this.extractVideoId(url, preview.type);
      }

      logger.info(`[media] URL parsed: ${fileId}, type: ${result.type}`);
      return result;
    } catch (error) {
      logger.error('[media] URL parsing failed:', error);
      throw new Error('Failed to parse URL');
    }
  }

  /**
   * Get link preview with metadata
   */
  async getLinkPreview(url: string): Promise<LinkPreview> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      
      // Extract Open Graph and Twitter Card metadata
      const title = 
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        url;

      const description = 
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content');

      const image = 
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content');

      const siteName = 
        $('meta[property="og:site_name"]').attr('content') ||
        new URL(url).hostname;

      // Determine link type
      const type = this.getLinkType(url);

      return {
        url,
        title: title.trim(),
        description: description?.trim(),
        image,
        siteName,
        type,
      };
    } catch (error) {
      logger.error('[media] Link preview failed:', error);
      
      // Fallback preview
      return {
        url,
        title: new URL(url).hostname,
        type: 'website',
      };
    }
  }

  /**
   * Extract video ID from YouTube/Vimeo URLs
   */
  private extractVideoId(url: string, type: 'youtube' | 'vimeo'): string | undefined {
    if (type === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return match?.[1];
    } else if (type === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match?.[1];
    }
    return undefined;
  }

  /**
   * Determine file type from MIME type
   */
  private getFileType(mimeType: string): MediaUploadResult['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  }

  /**
   * Determine link type from URL
   */
  private getLinkType(url: string): LinkPreview['type'] {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return 'youtube';
    }
    if (domain.includes('vimeo.com')) {
      return 'vimeo';
    }
    if (domain.includes('twitter.com') || domain.includes('x.com')) {
      return 'twitter';
    }
    if (domain.includes('github.com')) {
      return 'github';
    }
    
    return 'website';
  }

  /**
   * Delete media file
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      if (this.storageMode === 'local') {
        const filePath = path.join(this.uploadsRoot, fileName);
        await fs.rm(filePath, { force: true });
        logger.info(`[media] File deleted (local): ${fileName}`);
        return;
      }

      if (!this.storage) {
        throw new Error('GCS storage client not initialized');
      }

      const bucket = this.storage.bucket(this.bucketName);
      await bucket.file(fileName).delete();
      logger.info(`[media] File deleted: ${fileName}`);
    } catch (error) {
      logger.error('[media] Delete failed:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(fileName: string): Promise<any> {
    try {
      if (this.storageMode === 'local') {
        const filePath = path.join(this.uploadsRoot, fileName);
        const stat = await fs.stat(filePath);
        return {
          name: fileName,
          size: stat.size,
          updated: stat.mtime.toISOString(),
          created: stat.birthtime.toISOString(),
        };
      }

      if (!this.storage) {
        throw new Error('GCS storage client not initialized');
      }

      const bucket = this.storage.bucket(this.bucketName);
      const [metadata] = await bucket.file(fileName).getMetadata();
      return metadata;
    } catch (error) {
      logger.error('[media] Get file info failed:', error);
      throw new Error('Failed to get file info');
    }
  }

  private async uploadFileLocal(
    file: Express.Multer.File,
    userId: string
  ): Promise<MediaUploadResult> {
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const safeUserId = this.safePath(userId);
    const safeOriginalName = this.safePath(file.originalname);
    const userDir = path.join(this.uploadsRoot, safeUserId);
    await fs.mkdir(userDir, { recursive: true });

    const fileName = `${fileId}-${safeOriginalName}`;
    const filePath = path.join(userDir, fileName);
    await fs.writeFile(filePath, file.buffer);

    const metadata = await this.generateMetadata(file);
    let thumbnailUrl: string | undefined;
    if (file.mimetype.startsWith('image/')) {
      thumbnailUrl = await this.generateThumbnail(file, safeUserId, fileId);
    }

    const publicUrl = `/uploads/${encodeURIComponent(safeUserId)}/${fileName}`;

    const result: MediaUploadResult = {
      id: fileId,
      type: this.getFileType(file.mimetype),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: publicUrl,
      thumbnail: thumbnailUrl,
      metadata,
      createdAt: new Date().toISOString(),
    };

    logger.info(`[media] File uploaded (local): ${fileId}, type: ${result.type}`);
    return result;
  }

  private safePath(value: string): string {
    return value.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}

export const mediaService = new MediaService();