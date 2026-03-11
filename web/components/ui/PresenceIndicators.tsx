"use client";

import type { PresenceUser } from "@/types/api.types";

interface PresenceIndicatorsProps {
  activeUsers: PresenceUser[];
  isOnline: boolean | null;
}

export function PresenceIndicators({ activeUsers, isOnline }: PresenceIndicatorsProps) {
  if (isOnline === null) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        background: "#f8fafc",
        borderRadius: "8px",
        fontSize: "0.75rem",
        color: "#64748b",
      }}>
        <div style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#94a3b8",
        }} />
        Connecting…
      </div>
    );
  }

  if (!isOnline && activeUsers.length === 0) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        background: "#fef2f2",
        borderRadius: "8px",
        fontSize: "0.75rem",
        color: "#dc2626",
      }}>
        <div style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#dc2626",
        }} />
        Offline
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }}>
      {/* Online Status */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        background: isOnline ? "#f0fdf4" : "#fef2f2",
        borderRadius: "8px",
        fontSize: "0.75rem",
        color: isOnline ? "#059669" : "#dc2626",
      }}>
        <div style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: isOnline ? "#059669" : "#dc2626",
        }} />
        {isOnline ? "Online" : "Offline"}
      </div>

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          {/* User Avatars */}
          <div style={{
            display: "flex",
            alignItems: "center",
            marginLeft: "8px",
          }}>
            {activeUsers.slice(0, 5).map((user, index) => (
              <div
                key={user.userId}
                title={`${user.userName || 'Anonymous'} (${user.userEmail})`}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: user.userAvatar
                    ? `url(${user.userAvatar})`
                    : `linear-gradient(45deg, ${getColorForUser(user.userId)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  marginLeft: index > 0 ? "-6px" : "0",
                  border: "2px solid white",
                  zIndex: 10 - index,
                }}
              >
                {!user.userAvatar && (
                  (user.userName?.charAt(0) || user.userEmail?.charAt(0) || "?").toUpperCase()
                )}
              </div>
            ))}
          </div>

          {/* User Count */}
          <div style={{
            fontSize: "0.75rem",
            color: "#64748b",
            fontWeight: 500,
            marginLeft: "6px",
          }}>
            {activeUsers.length === 1
              ? `${activeUsers[0].userName || 'Someone'} is here`
              : activeUsers.length > 5
              ? `${activeUsers.length} people active`
              : `${activeUsers.length} active`
            }
          </div>
        </div>
      )}
    </div>
  );
}

// Generate consistent colors for users
function getColorForUser(userId: string): string {
  const colors = [
    '#3b82f6, #1d4ed8', // Blue
    '#10b981, #059669', // Emerald  
    '#f59e0b, #d97706', // Amber
    '#ef4444, #dc2626', // Red
    '#8b5cf6, #7c3aed', // Violet
    '#06b6d4, #0891b2', // Cyan
    '#84cc16, #65a30d', // Lime
    '#f97316, #ea580c', // Orange
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
}
