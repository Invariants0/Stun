"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { listBoards, createBoard, deleteBoard } from "@/lib/api";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import type { Board } from "@/types/api.types";
import type { ApiError } from "@/lib/api-client";

export default function BoardsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; boardId: string; boardName: string}>({isOpen: false, boardId: '', boardName: ''});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/signin");
      return;
    }

    loadBoards();
  }, [user, authLoading, router]);

  async function loadBoards() {
    try {
      setLoading(true);
      setError(null);
      const data = await listBoards();
      setBoards(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard() {
    try {
      setCreating(true);
      setError(null);
      const newBoard = await createBoard();
      router.push(`/board/${newBoard.id}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to create board");
      setCreating(false);
    }
  }

  async function handleDeleteBoard(boardId: string, event: React.MouseEvent) {
    event.stopPropagation(); // Prevent card click navigation
    
    const boardName = `Board ${boardId.slice(0, 8)}`;
    setDeleteDialog({isOpen: true, boardId, boardName});
  }

  async function confirmDeleteBoard() {
    const { boardId } = deleteDialog;
    
    try {
      setDeleting(boardId);
      setError(null);
      await deleteBoard(boardId);
      
      // Remove from local state
      setBoards(boards.filter(board => board.id !== boardId));
      setDeleteDialog({isOpen: false, boardId: '', boardName: ''});
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to delete board");
    } finally {
      setDeleting(null);
    }
  }

  function cancelDeleteBoard() {
    if (deleting) return; // Prevent closing if deletion is in progress
    setDeleteDialog({isOpen: false, boardId: '', boardName: ''});
  }

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#64748b',
          fontSize: '0.9375rem',
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e2e8f0',
            borderTopColor: '#0f172a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          Loading your boards...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
    }}>
      {/* Top Navigation */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(248, 250, 252, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontSize: '1.375rem',
              fontWeight: 600,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              STUN
            </h1>
            <span style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              fontWeight: 400,
            }}>
              / The Infinite Canvas
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 40px 80px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '40px',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontSize: '2rem',
              fontWeight: 600,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              margin: '0 0 8px 0',
            }}>
              My Boards
            </h2>
            <p style={{
              fontSize: '0.9375rem',
              color: '#64748b',
              margin: 0,
            }}>
              {boards.length} {boards.length === 1 ? 'board' : 'boards'}
            </p>
          </div>
          <button
            onClick={handleCreateBoard}
            disabled={creating}
            style={{
              padding: '10px 20px',
              background: creating ? '#e2e8f0' : '#0f172a',
              color: creating ? '#94a3b8' : 'white',
              border: 'none',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: creating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => {
              if (!creating) {
                e.currentTarget.style.background = '#1e293b';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!creating) {
                e.currentTarget.style.background = '#0f172a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {creating ? 'Creating...' : 'New Board'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '14px 18px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            fontSize: '0.875rem',
            color: '#dc2626',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* Empty State */}
        {boards.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(226, 232, 240, 0.8)',
            }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3 style={{
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: '8px',
            }}>
              No boards yet
            </h3>
            <p style={{
              fontSize: '0.9375rem',
              color: '#64748b',
              marginBottom: '24px',
              maxWidth: '400px',
              margin: '0 auto 32px',
              lineHeight: '1.6',
            }}>
              Create your first infinite canvas to start organizing ideas, brainstorming, and collaborating.
            </p>
            <button
              onClick={handleCreateBoard}
              disabled={creating}
              style={{
                padding: '12px 28px',
                background: creating ? '#e2e8f0' : '#0f172a',
                color: creating ? '#94a3b8' : 'white',
                border: 'none',
                borderRadius: '10px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9375rem',
                fontWeight: 500,
                cursor: creating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!creating) {
                  e.currentTarget.style.background = '#1e293b';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!creating) {
                  e.currentTarget.style.background = '#0f172a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {creating ? 'Creating...' : 'Create First Board'}
            </button>
          </div>
        ) : (
          /* Boards Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
          }}>
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => router.push(`/board/${board.id}`)}
                style={{
                  background: 'white',
                  borderRadius: '14px',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                }}
              >
                {/* Board Preview Canvas */}
                <div style={{
                  height: '160px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Abstract node visualization */}
                  <div style={{
                    position: 'absolute',
                    inset: '20px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    alignContent: 'center',
                    justifyContent: 'center',
                  }}>
                    {Array.from({ length: Math.min(board.nodes.length, 6) }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: `${40 + (i % 3) * 15}px`,
                          height: `${30 + (i % 2) * 12}px`,
                          background: i % 3 === 0 ? 'rgba(15, 23, 42, 0.08)' : i % 2 === 0 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(168, 85, 247, 0.1)',
                          borderRadius: '6px',
                          border: '1px solid rgba(15, 23, 42, 0.06)',
                        }}
                      />
                    ))}
                    {board.nodes.length === 0 && (
                      <div style={{
                        fontSize: '0.8125rem',
                        color: '#cbd5e1',
                        fontWeight: 500,
                      }}>
                        Empty canvas
                      </div>
                    )}
                  </div>
                </div>

                {/* Board Info */}
                <div style={{ padding: '18px', position: 'relative' }}>
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteBoard(board.id, e)}
                    disabled={deleting === board.id}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '28px',
                      height: '28px',
                      background: deleting === board.id ? '#fecaca' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: deleting === board.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: deleting === board.id ? '#dc2626' : '#94a3b8',
                      transition: 'all 0.2s ease',
                      zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      if (deleting !== board.id) {
                        e.currentTarget.style.background = '#fef2f2';
                        e.currentTarget.style.color = '#dc2626';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (deleting !== board.id) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                    title={deleting === board.id ? 'Deleting...' : 'Delete board'}
                  >
                    {deleting === board.id ? (
                      <div style={{
                        width: '14px',
                        height: '14px',
                        border: '1.5px solid #fca5a5',
                        borderTopColor: '#dc2626',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    )}
                  </button>

                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingRight: '36px', // Make room for delete button
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: 'Space Grotesk, Inter, sans-serif',
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.01em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        Board {board.id.slice(0, 8)}
                      </h3>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: '#94a3b8',
                        margin: 0,
                        fontWeight: 500,
                      }}>
                        Updated {formatRelativeTime(board.updatedAt)}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: board.visibility === 'private' ? '#f1f5f9' : '#dbeafe',
                      color: board.visibility === 'private' ? '#64748b' : '#1e40af',
                      borderRadius: '6px',
                      textTransform: 'capitalize',
                      letterSpacing: '0.02em',
                      flexShrink: 0,
                    }}>
                      {board.visibility}
                    </span>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8125rem',
                      color: '#64748b',
                      fontWeight: 500,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      {board.nodes.length}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8125rem',
                      color: '#64748b',
                      fontWeight: 500,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                        <polyline points="7.5 19.79 7.5 14.6 3 12" />
                        <polyline points="21 12 16.5 14.6 16.5 19.79" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                      {board.edges.length}
                    </div>
                    {board.activeUsers > 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8125rem',
                        color: '#10b981',
                        fontWeight: 600,
                        marginLeft: 'auto',
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          background: '#10b981',
                          borderRadius: '50%',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        }} />
                        {board.activeUsers} active
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={cancelDeleteBoard}
        onConfirm={confirmDeleteBoard}
        title="Delete Board"
        message={`Are you sure you want to delete "${deleteDialog.boardName}"? All content will be permanently lost and cannot be recovered.`}
        confirmText="Delete Board"
        isLoading={deleting !== null}
      />
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
