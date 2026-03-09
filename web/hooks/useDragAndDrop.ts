"use client";

import { useCallback, useEffect, useState } from "react";
import type { MediaUploadResult } from "@/types/api.types";

interface UseDragAndDropOptions {
  onFilesUploaded: (files: MediaUploadResult[]) => void;
  uploadFiles: (files: File[]) => Promise<MediaUploadResult[]>;
  acceptedTypes?: string[];
  maxFiles?: number;
}

export function useDragAndDrop({
  onFilesUploaded,
  uploadFiles,
  acceptedTypes = [
    'image/*',
    'application/pdf', 
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  maxFiles = 10,
}: UseDragAndDropOptions) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDragCounter(0);
    
    const files = Array.from(e.dataTransfer?.files || []);
    
    if (files.length === 0) return;
    
    // Filter files by accepted types
    const validFiles = files.filter(file => {
      return acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const baseType = type.replace('/*', '');
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });
    });
    
    if (validFiles.length === 0) {
      console.warn('[DragDrop] No valid files found');
      return;
    }
    
    try {
      const results = await uploadFiles(validFiles.slice(0, maxFiles));
      onFilesUploaded(results);
    } catch (error) {
      console.error('[DragDrop] Upload failed:', error);
    }
  }, [acceptedTypes, maxFiles, uploadFiles, onFilesUploaded]);

  const bindDragAndDrop = useCallback((element: HTMLElement) => {
    if (!element) return;

    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);

    return () => {
      element.removeEventListener('dragenter', handleDragEnter);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  // Global drag and drop for body element
  useEffect(() => {
    const cleanup = bindDragAndDrop(document.body);
    return cleanup;
  }, [bindDragAndDrop]);

  return {
    isDragOver,
    bindDragAndDrop,
  };
}