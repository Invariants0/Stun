"use client";

import type { LinkPreviewData } from "@/types/api.types";

interface LinkPreviewProps {
  preview: LinkPreviewData;
  showActions?: boolean;
  onAction?: (action: 'open' | 'copy') => void;
}

export function LinkPreview({ 
  preview, 
  showActions = false,
  onAction 
}: LinkPreviewProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return '📺';
      case 'vimeo': return '🎬';
      case 'twitter': return '🐦';
      case 'github': return '⚡';
      case 'website':
      default: return '🌐';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'youtube': return '#ff0000';
      case 'vimeo': return '#1ab7ea';
      case 'twitter': return '#1da1f2';
      case 'github': return '#333';
      case 'website':
      default: return '#64748b';
    }
  };

  return (
    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      overflow: "hidden",
      background: "white",
      transition: "all 0.2s ease",
      cursor: showActions ? "pointer" : "default",
    }}
    onMouseOver={(e) => {
      if (showActions) {
        e.currentTarget.style.borderColor = "#3b82f6";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }
    }}
    onMouseOut={(e) => {
      if (showActions) {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }
    }}
    onClick={() => showActions && onAction?.('open')}
    >
      <div style={{ display: "flex" }}>
        {/* Preview Image */}
        {preview.image && (
          <div style={{
            width: "120px",
            height: "90px",
            flexShrink: 0,
            background: `url(${preview.image}) center/cover`,
            borderRight: "1px solid #f1f5f9",
          }} />
        )}
        
        {/* Content */}
        <div style={{
          flex: 1,
          padding: "16px",
          minWidth: 0,
        }}>
          {/* Site info */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}>
            <span style={{ fontSize: "1rem" }}>
              {getTypeIcon(preview.type)}
            </span>
            <span style={{
              fontSize: "0.75rem",
              color: getTypeColor(preview.type),
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {preview.siteName || preview.type}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "#0f172a",
            margin: "0 0 6px 0",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {preview.title}
          </h3>

          {/* Description */}
          {preview.description && (
            <p style={{
              fontSize: "0.8125rem",
              color: "#64748b",
              margin: "0 0 8px 0",
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {preview.description}
            </p>
          )}

          {/* URL */}
          <div style={{
            fontSize: "0.75rem",
            color: "#94a3b8",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}>
            {new URL(preview.url).hostname}
          </div>

          {/* Actions */}
          {showActions && (
            <div style={{
              display: "flex",
              gap: "8px",
              marginTop: "12px",
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(preview.url, '_blank');
                  onAction?.('open');
                }}
                style={{
                  padding: "6px 12px",
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  color: "#374151",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Open ↗
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(preview.url);
                  onAction?.('copy');
                }}
                style={{
                  padding: "6px 12px",
                  background: "transparent",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  color: "#64748b",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}