"use client";

import React from "react";
import { useToastStore, Toast as ToastType } from "@/store/toast.store";

const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const { removeToast } = useToastStore();

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "#10b981"; // Emerald-500
      case "error":
        return "#ef4444"; // Red-500
      case "warning":
        return "#f59e0b"; // Amber-500
      case "info":
      default:
        return "#3b82f6"; // Blue-500
    }
  };

  return (
    <div
      onClick={() => removeToast(toast.id)}
      style={{
        padding: "12px 16px",
        borderRadius: "8px",
        color: "white",
        backgroundColor: getBackgroundColor(toast.type),
        marginBottom: "10px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        cursor: "pointer",
        minWidth: "250px",
        maxWidth: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        animation: "slideIn 0.3s ease-out",
        fontFamily: "sans-serif",
      }}
    >
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        style={{
          background: "none",
          border: "none",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "18px",
          marginLeft: "10px",
          cursor: "pointer",
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
