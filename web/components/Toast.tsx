"use client";

import { Toaster } from "react-hot-toast";

export const ToastProvider = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: "#333",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 16px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        success: {
          style: {
            background: "#10b981",
          },
        },
        error: {
          style: {
            background: "#ef4444",
          },
        },
      }}
    />
  );
};
