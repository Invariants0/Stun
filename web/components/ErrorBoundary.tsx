"use client";

import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              maxWidth: "400px",
              padding: "16px",
              background: "#ffffff",
              color: "#1e293b",
              border: "2px solid #ef4444",
              borderRadius: "12px",
              fontFamily: "sans-serif",
              zIndex: 1000,
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: "#ef4444", margin: "0 0 8px 0", fontSize: "1.1rem" }}>Error Occurred</h3>
                <p style={{ margin: "0 0 12px 0", fontSize: "0.9rem", lineHeight: 1.4 }}>Something went wrong. The error has been logged.</p>
              </div>
              <button
                onClick={() => this.setState({ hasError: false })}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  marginLeft: "8px",
                }}
                title="Close"
              >
                ×
              </button>
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "500",
              }}
            >
              Continue
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: "12px" }}>
                <summary style={{ cursor: "pointer", fontSize: "0.8rem", color: "#64748b" }}>Show error details</summary>
                <pre
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "4px",
                    overflowX: "auto",
                    fontSize: "11px",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}
