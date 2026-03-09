"use client";

import { useState, useRef, useCallback } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { LinkPreview } from "./LinkPreview";
import type { MediaUploadResult, LinkPreviewData } from "@/types/api.types";

interface MediaUploaderProps {
  onMediaUploaded: (media: MediaUploadResult[]) => void;
  onClose: () => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function MediaUploader({
  onMediaUploaded,
  onClose,
  maxFiles = 10,
  acceptedTypes = [
    'image/*',
    'application/pdf', 
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
}: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlPreview, setUrlPreview] = useState<LinkPreviewData | null>(null);
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    uploadFiles,
    parseUrl,
    getLinkPreview,
    isUploading,
    isParsingUrl,
    error,
  } = useMediaUpload();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      try {
        const results = await uploadFiles(files.slice(0, maxFiles));
        onMediaUploaded(results);
        onClose();
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  }, [uploadFiles, maxFiles, onMediaUploaded, onClose]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    try {
      const fileArray = Array.from(files).slice(0, maxFiles);
      const results = await uploadFiles(fileArray);
      onMediaUploaded(results);
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleUrlPreview = async () => {
    if (!urlInput.trim()) return;
    
    try {
      const preview = await getLinkPreview(urlInput.trim());
      setUrlPreview(preview);
    } catch (err) {
      console.error('Link preview failed:', err);
    }
  };

  const handleUrlSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!urlInput.trim()) return;
    
    try {
      const result = await parseUrl(urlInput.trim());
      onMediaUploaded([result]);
      onClose();
    } catch (err) {
      console.error('URL parsing failed:', err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 32px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Add Media
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#64748b",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            {[
              { key: 'upload' as const, label: 'Upload Files' },
              { key: 'url' as const, label: 'Add URL' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "8px 16px",
                  background: tab === key ? "#3b82f6" : "transparent",
                  color: tab === key ? "white" : "#64748b",
                  border: "1px solid",
                  borderColor: tab === key ? "#3b82f6" : "#e2e8f0",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 32px", flex: 1, overflow: "auto" }}>
          {tab === 'upload' ? (
            <>
              {/* File Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag} 
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: "2px dashed",
                  borderColor: dragActive ? "#3b82f6" : "#e2e8f0",
                  borderRadius: "12px",
                  padding: "48px 24px",
                  textAlign: "center",
                  background: dragActive ? "#eff6ff" : "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{
                  fontSize: "3rem",
                  marginBottom: "16px",
                  opacity: 0.6,
                }}>
                  📁
                </div>
                <h3 style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: "0 0 8px 0",
                }}>
                  {dragActive ? "Drop files here" : "Upload files"}
                </h3>
                <p style={{
                  color: "#64748b",
                  fontSize: "0.875rem",
                  margin: 0,
                }}>
                  Drag & drop files or click to browse
                </p>
                <p style={{
                  color: "#94a3b8",
                  fontSize: "0.75rem",
                  margin: "8px 0 0 0",
                }}>
                  Supports: Images, PDFs, CSV, Excel, Word (max {maxFiles} files, 50MB each)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: "none" }}
              />
            </>
          ) : (
            <>
              {/* URL Input */}
              <form onSubmit={handleUrlSubmit} style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "8px",
                }}>
                  Enter URL
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or any webpage"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onBlur={handleUrlPreview}
                    disabled={isParsingUrl}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      background: isParsingUrl ? "#f8fafc" : "white",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleUrlPreview}
                    disabled={!urlInput.trim() || isParsingUrl}
                    style={{
                      padding: "12px 16px",
                      background: !urlInput.trim() || isParsingUrl ? "#e2e8f0" : "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      cursor: !urlInput.trim() || isParsingUrl ? "not-allowed" : "pointer",
                    }}
                  >
                    Preview
                  </button>
                  <button
                    type="submit"
                    disabled={!urlInput.trim() || isParsingUrl}
                    style={{
                      padding: "12px 16px",
                      background: !urlInput.trim() || isParsingUrl ? "#cbd5e1" : "#3b82f6",
                      color: "white", 
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      cursor: !urlInput.trim() || isParsingUrl ? "not-allowed" : "pointer",
                    }}
                  >
                    {isParsingUrl ? "Adding..." : "Add"}
                  </button>
                </div>
              </form>

              {/* URL Preview */}
              {urlPreview && (
                <div style={{ marginTop: "16px" }}>
                  <LinkPreview preview={urlPreview} />
                </div>
              )}

              {/* Supported URL Types */}
              <div style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "0.875rem",
                color: "#64748b",
              }}>
                <strong>Supported:</strong> YouTube, Vimeo, Twitter, GitHub, any webpage with preview
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div style={{
              marginTop: "16px",
              padding: "12px",
              background: "#fef2f2",
              borderRadius: "8px",
              color: "#dc2626",
              fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          {/* Loading State */}
          {(isUploading || isParsingUrl) && (
            <div style={{
              marginTop: "16px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.875rem",
            }}>
              <div style={{
                width: "20px",
                height: "20px",
                border: "2px solid #e2e8f0",
                borderTopColor: "#3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 8px",
              }} />
              {isUploading ? "Uploading files..." : "Processing URL..."}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}