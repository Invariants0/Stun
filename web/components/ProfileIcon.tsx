"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function ProfileIcon() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <div style={{ position: "fixed", top: 12, right: 12, zIndex: 9999 }}>
      {/* Avatar button */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        title={user.displayName ?? user.email}
        style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? "User"}
            referrerPolicy="no-referrer"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "2px solid #3b82f6",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: -1 }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 46,
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 10,
              padding: "12px 16px",
              minWidth: 200,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  marginBottom: 10,
                  border: "2px solid #3b82f6",
                }}
              />
            )}
            <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginBottom: 2 }}>
              {user.displayName ?? "User"}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
              {user.email}
            </div>
            <div
              style={{
                height: 1,
                background: "#334155",
                marginBottom: 12,
              }}
            />
            <button
              onClick={() => { setMenuOpen(false); logout(); }}
              style={{
                width: "100%",
                padding: "8px 0",
                background: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
