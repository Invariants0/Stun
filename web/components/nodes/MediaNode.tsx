"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import type { MediaUploadResult } from "@/types/api.types";

interface MediaNodeData extends MediaUploadResult {
  isSelected?: boolean;
}

export const MediaNode = memo(({ data, selected }: NodeProps<MediaNodeData>) => {
  const renderMediaContent = () => {
    switch (data.type) {
      case 'image':
        return (
          <div style={{
            width: "200px",
            height: "150px",
            borderRadius: "8px",
            overflow: "hidden",
            background: `url(${data.thumbnailUrl || data.url}) center/cover`,
            position: "relative",
          }}>
            {/* Image overlay with filename */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "4px 8px",
              fontSize: "0.75rem",
              fontWeight: 500,
              backdropFilter: "blur(4px)",
            }}>
              {data.originalName || data.fileName || "Image"}
            </div>
          </div>
        );

      case 'youtube':
      case 'vimeo':
        return (
          <div style={{
            width: "280px",
            height: "180px",
            borderRadius: "12px",
            overflow: "hidden",
            background: data.thumbnailUrl ? `url(${data.thumbnailUrl}) center/cover` : "#000",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* Video Play Button */}
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,1)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.9)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onClick={() => window.open(data.url, '_blank')}
            >
              ▶️
            </div>

            {/* Video Info */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "8px 12px",
              fontSize: "0.8125rem",
              fontWeight: 500,
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                marginBottom: "2px",
              }}>
                <span>{data.type === 'youtube' ? '📺' : '🎬'}</span>
                <span style={{ 
                  textTransform: "uppercase",
                  fontSize: "0.6875rem",
                  color: data.type === 'youtube' ? '#ff0000' : '#1ab7ea',
                  fontWeight: 600,
                }}>
                  {data.type}
                </span>
              </div>
              <div style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {data.metadata?.title || data.originalName || "Video"}
              </div>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div style={{
            width: "200px",
            height: "160px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #dc2626, #ef4444)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            position: "relative",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(220,38,38,0.25)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
          onClick={() => window.open(data.url, '_blank')}
          >
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>📄</div>
            <div style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "center",
              padding: "0 12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "100%",
            }}>
              {data.originalName || data.fileName || "PDF Document"}
            </div>
            <div style={{
              fontSize: "0.75rem",
              opacity: 0.8,
              marginTop: "4px",
            }}>
              {(data.size / (1024 * 1024)).toFixed(1)} MB
            </div>
          </div>
        );

      case 'csv':
      case 'excel':
        return (
          <div style={{
            width: "200px",
            height: "160px",
            borderRadius: "12px",
            background: data.type === 'excel' 
              ? "linear-gradient(135deg, #16a34a, #22c55e)" 
              : "linear-gradient(135deg, #ea580c, #f97316)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            const shadow = data.type === 'excel' ? "rgba(22,163,74,0.25)" : "rgba(234,88,12,0.25)";
            e.currentTarget.style.boxShadow = `0 8px 25px ${shadow}`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
          onClick={() => window.open(data.url, '_blank')}
          >
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>
              {data.type === 'excel' ? '📊' : '📈'}
            </div>
            <div style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "center",
              padding: "0 12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "100%",
            }}>
              {data.originalName || data.fileName || `${data.type.toUpperCase()} File`}
            </div>
            <div style={{
              fontSize: "0.75rem",
              opacity: 0.8,
              marginTop: "4px",
            }}>
              {(data.size / 1024).toFixed(1)} KB
            </div>
          </div>
        );

      case 'website':
      default:
        return (
          <div style={{
            width: "240px",
            height: "160px",
            borderRadius: "12px",
            background: "white",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
          onClick={() => window.open(data.url, '_blank')}
          >
            {/* Website Preview */}
            {data.thumbnailUrl ? (
              <div style={{
                height: "100px",
                background: `url(${data.thumbnailUrl}) center/cover`,
                borderBottom: "1px solid #f1f5f9",
              }} />
            ) : (
              <div style={{
                height: "100px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                borderBottom: "1px solid #f1f5f9",
              }}>
                🌐
              </div>
            )}
            
            {/* Website Info */}
            <div style={{ padding: "12px", flex: 1 }}>
              <div style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {data.metadata?.title || data.originalName || "Website"}
              </div>
              <div style={{
                fontSize: "0.6875rem",
                color: "#64748b",
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {new URL(data.url).hostname}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      position: "relative",
      filter: selected || data.isSelected ? "drop-shadow(0 0 8px rgba(59,130,246,0.5))" : "none",
    }}>
      {/* Media Content */}
      {renderMediaContent()}

      {/* React Flow Handles */}
      <Handle 
        type="target" 
        position={Position.Left}
        style={{
          width: "8px",
          height: "8px",
          background: "#3b82f6",
          border: "2px solid white",
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Right}
        style={{
          width: "8px",
          height: "8px",
          background: "#3b82f6",
          border: "2px solid white",
        }} 
      />
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          width: "8px",
          height: "8px",
          background: "#3b82f6",
          border: "2px solid white",
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          width: "8px",
          height: "8px",
          background: "#3b82f6",
          border: "2px solid white",
        }} 
      />

      {/* Selection Indicator */}
      {(selected || data.isSelected) && (
        <div style={{
          position: "absolute",
          top: "-4px",
          right: "-4px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#3b82f6",
          border: "2px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "8px",
          color: "white",
          fontWeight: "bold",
        }}>
          ✓
        </div>
      )}
    </div>
  );
});

MediaNode.displayName = "MediaNode";