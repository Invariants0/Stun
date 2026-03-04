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
              padding: "20px",
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              margin: "20px",
              fontFamily: "sans-serif",
              zIndex: 9999,
              position: "relative",
            }}
          >
            <h2 style={{ color: "#ef4444", marginTop: 0 }}>Something went wrong</h2>
            <p>The application encountered an unexpected error.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {this.state.error && (
              <pre
                style={{
                  marginTop: "16px",
                  padding: "10px",
                  background: "#0f172a",
                  borderRadius: "4px",
                  overflowX: "auto",
                  fontSize: "12px",
                }}
              >
                {this.state.error.message}
              </pre>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}
