import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.middleware";
import { mediaController } from "../controllers/media.controller";

export const mediaRouter = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Accept images, PDFs, and some document types
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported`));
    }
  },
});

// Media upload and management routes
mediaRouter.post(
  "/upload", 
  requireAuth, 
  upload.array('files', 10), 
  mediaController.upload
);

mediaRouter.post(
  "/parse-url", 
  requireAuth, 
  mediaController.parseUrl
);

mediaRouter.get(
  "/preview", 
  requireAuth, 
  mediaController.getLinkPreview
);

mediaRouter.delete(
  "/:id", 
  requireAuth, 
  mediaController.delete
);

mediaRouter.get(
  "/:id/info", 
  requireAuth, 
  mediaController.getInfo
);