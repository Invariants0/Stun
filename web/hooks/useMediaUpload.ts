"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import type { MediaUploadResult, LinkPreviewData } from "@/types/api.types";

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: File[]): Promise<MediaUploadResult[]> => {
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await api.post<MediaUploadResult[]>('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const parseUrl = async (url: string): Promise<MediaUploadResult> => {
    setIsParsingUrl(true);
    setError(null);
    
    try {
      const response = await api.post<MediaUploadResult>('/media/parse-url', { url });
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'URL parsing failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsParsingUrl(false);
    }
  };

  const getLinkPreview = async (url: string): Promise<LinkPreviewData> => {
    setError(null);
    
    try {
      const response = await api.get<LinkPreviewData>(`/media/preview?url=${encodeURIComponent(url)}`);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Link preview failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteMedia = async (mediaId: string): Promise<void> => {
    setError(null);
    
    try {
      await api.delete(`/media/${mediaId}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Delete failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getMediaInfo = async (mediaId: string): Promise<MediaUploadResult> => {
    setError(null);
    
    try {
      const response = await api.get<MediaUploadResult>(`/media/${mediaId}/info`);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to get media info';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  return {
    uploadFiles,
    parseUrl,
    getLinkPreview,
    deleteMedia,
    getMediaInfo,
    isUploading,
    isParsingUrl,
    error,
    clearError,
  };
}