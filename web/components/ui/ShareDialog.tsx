"use client";

import { useState, useEffect } from "react";
import { updateBoardVisibility, addCollaborator, removeCollaborator, getCollaborators } from "@/lib/api";
import type { BoardVisibility, Collaborator } from "@/types/api.types";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  currentVisibility: BoardVisibility;
  onVisibilityChange: (visibility: BoardVisibility) => void;
}

export function ShareDialog({
  isOpen,
  onClose,
  boardId,
  currentVisibility,
  onVisibilityChange,
}: ShareDialogProps) {
  const [visibility, setVisibility] = useState<BoardVisibility>(currentVisibility);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/boards/${boardId}` : "";

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen]);

  const loadCollaborators = async () => {
    try {
      const response = await getCollaborators(boardId);
      setCollaborators(response.collaborators);
    } catch (err) {
      console.error("Failed to load collaborators:", err);
    }
  };

  const handleVisibilityChange = async (newVisibility: BoardVisibility) => {
    try {
      setLoading(true);
      await updateBoardVisibility(boardId, newVisibility);
      setVisibility(newVisibility);
      onVisibilityChange(newVisibility);
    } catch (err) {
      console.error("Failed to update visibility:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) return;
    
    try {
      setAddingCollaborator(true);
      await addCollaborator(boardId, newCollaboratorEmail.trim());
      setNewCollaboratorEmail("");
      await loadCollaborators();
    } catch (err: any) {
      console.error("Failed to add collaborator:", err);
      alert(err.message || "Failed to add collaborator");
    } finally {
      setAddingCollaborator(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      setRemovingId(userId);
      await removeCollaborator(boardId, userId);
      await loadCollaborators();
    } catch (err) {
      console.error("Failed to remove collaborator:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen) return null;

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
          maxWidth: "500px",
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
            <h2 style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
            }}>
              Share Board
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
        </div>

        {/* Content */}
        <div style={{ padding: "24px 32px", flex: 1, overflow: "auto" }}>
          {/* Visibility Settings */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px", color: "#0f172a" }}>
              Visibility
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { value: "view" as const, label: "View Only", desc: "Anyone with link can view" },
                { value: "edit" as const, label: "Can Edit", desc: "Anyone with link can edit" },
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: visibility === option.value ? "#3b82f6" : "#e2e8f0",
                    background: visibility === option.value ? "#eff6ff" : "transparent",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={() => handleVisibilityChange(option.value)}
                    disabled={loading}
                    style={{ marginTop: "2px" }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, color: "#0f172a" }}>{option.label}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Share Link */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px", color: "#0f172a" }}>
              Share Link
            </h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  background: "#f8fafc",
                }}
              />
              <button
                onClick={async () => {
                  if (!shareUrl) return;
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                  } catch {
                    // no-op: clipboard might be blocked
                  }
                }}
                disabled={!shareUrl}
                style={{
                  padding: "10px 16px",
                  background: !shareUrl ? "#cbd5e1" : "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  cursor: !shareUrl ? "not-allowed" : "pointer",
                }}
                title="Copy link"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Add Collaborator */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px", color: "#0f172a" }}>
              Add Collaborator
            </h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Enter email or user ID"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCollaborator()}
                disabled={addingCollaborator}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                }}
              />
              <button
                onClick={handleAddCollaborator}
                disabled={addingCollaborator || !newCollaboratorEmail.trim()}
                style={{
                  padding: "10px 16px",
                  background: addingCollaborator || !newCollaboratorEmail.trim() ? "#cbd5e1" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  cursor: addingCollaborator || !newCollaboratorEmail.trim() ? "not-allowed" : "pointer",
                }}
              >
                {addingCollaborator ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* Collaborators List */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px", color: "#0f172a" }}>
              Collaborators ({collaborators.length})
            </h3>
            {collaborators.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "24px", 
                color: "#64748b",
                fontSize: "0.875rem",
              }}>
                No collaborators yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.userId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "#64748b",
                      }}>
                        {collaborator.userEmail?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                          {collaborator.userName || "Anonymous"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {collaborator.userEmail}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator.userId)}
                      disabled={removingId === collaborator.userId}
                      style={{
                        padding: "6px 12px",
                        background: "transparent",
                        color: removingId === collaborator.userId ? "#cbd5e1" : "#ef4444",
                        border: "1px solid",
                        borderColor: removingId === collaborator.userId ? "#cbd5e1" : "#ef4444",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: removingId === collaborator.userId ? "not-allowed" : "pointer",
                      }}
                    >
                      {removingId === collaborator.userId ? "Removing..." : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
