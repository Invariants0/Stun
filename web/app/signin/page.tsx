"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGoogleAuthUrl, getStoredUser } from "@/lib/auth";

export default function SigninPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getStoredUser()) router.replace("/");
  }, [router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch {
      setError("Failed to connect to auth server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Getting Started</h1>
        <p style={s.subtitle}>Sign in to access your spatial thinking environment.</p>

        <div style={s.socialRow}>
          <SocialButton onClick={handleGoogleSignIn} disabled={loading}>
            <GoogleIcon />
            {loading ? "Redirecting…" : "Log in with Google"}
          </SocialButton>
          <SocialButton onClick={() => {}} disabled>
            <AppleIcon />
            Log in with Apple
          </SocialButton>
        </div>

        <div style={s.dividerRow}>
          <span style={s.dividerLine} />
          <span style={s.dividerText}>OR</span>
          <span style={s.dividerLine} />
        </div>

        <div style={s.form}>
          <InputField icon={<EmailIcon />} type="email" placeholder="Email address" />
          <InputField icon={<PersonIcon />} type="text" placeholder="Full name" />
          <InputField icon={<AtIcon />} type="text" placeholder="Username" />
        </div>

        {error && <p style={s.errorText}>{error}</p>}

        <button
          style={{ ...s.signUpBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? "Redirecting…" : "Sign Up with Google"}
        </button>

        <p style={s.footerText}>
          Already have an account?{" "}
          <button style={s.footerLink} onClick={handleGoogleSignIn} disabled={loading}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SocialButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      style={{
        ...s.socialBtn,
        background: hover && !disabled ? "#f3f4f6" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
}

function InputField({ icon, type, placeholder }: { icon: React.ReactNode; type: string; placeholder: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ ...s.inputWrap, borderColor: focus ? "#2563eb" : "#e5e7eb", boxShadow: focus ? "0 0 0 3px rgba(37,99,235,0.1)" : "none" }}>
      <span style={s.inputIcon}>{icon}</span>
      <input type={type} placeholder={placeholder} style={s.input} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function AtIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
      <circle cx="12" cy="12" r="4"/>
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f0fe 0%, #f3f4f6 60%, #eef2ff 100%)",
    padding: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "44px 40px 36px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center",
    margin: "0 0 28px",
    lineHeight: "1.5",
  },
  socialRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  socialBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 12px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    transition: "background 0.15s",
    whiteSpace: "nowrap",
    background: "#fff",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
    display: "block",
  },
  dividerText: {
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: "500",
    letterSpacing: "0.05em",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  inputIcon: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#374151",
    background: "transparent",
    minWidth: 0,
  },
  errorText: {
    fontSize: "13px",
    color: "#ef4444",
    textAlign: "center",
    margin: "0 0 12px",
  },
  signUpBtn: {
    width: "100%",
    padding: "13px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "20px",
    transition: "background 0.15s",
  },
  footerText: {
    fontSize: "13px",
    color: "#6b7280",
    textAlign: "center",
    margin: 0,
  },
  footerLink: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    padding: 0,
  },
};
