# Google OAuth Implementation Guide

Complete technical documentation for implementing Google OAuth 2.0 authentication in Stun.

## Architecture Overview

```
User Browser                    Frontend Next.js              Backend Express
   |                                |                              |
   |--- Click "Sign in" ----------->| GET /signin               |
   |                                |                              |
   |<--- Redirect to Google --------|  (Google Auth URL)        |
   |                                |                              |
   |--- Google Login Flow -------->| [popup/redirect]          |
   |                                |                              |
   |<--- Redirect /auth/callback----|  [with code param]        |
   |                                |                              |
   |--- POST /auth/callback-------->|---------------------->|
   |                                |                    Exchange
   |                                |                    code for token
   |                                |<------ POST /auth/callback
   |                                |        (returns token)
   |                                |                              |
   |<--- Store token in cookie -----|  (httpOnly secure)       |
   |<--- Redirect to / -------------|  (authenticated)         |
   |                                |                              |
   |--- GET / (with token) -------->|------------------------->|
   |                                |    Validate token
   |                                |<------ 200 OK {user}
   |<--- Render Home (authed) ------|                              |
```

## Backend Implementation

### 1. Auth Route Handlers

**File**: `backend/src/routes/auth.ts`

Implements 4 core authentication endpoints:

#### POST /auth/signin
Initiates Google OAuth flow by returning the Google auth URL.

**Request**:
```bash
POST http://localhost:3001/auth/signin
Content-Type: application/json

{
  "redirectUrl": "http://localhost:3000"
}
```

**Response** (200 OK):
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=..."
}
```

**Flow**:
1. Receive redirect URL from frontend
2. Generate Google auth URL with client ID, scopes, redirect URI
3. Return URL for frontend to redirect user to

#### POST /auth/callback
Handles OAuth code exchange and token generation.

**Request**:
```bash
POST http://localhost:3001/auth/callback
Content-Type: application/json

{
  "code": "4/0AX4XfW...",
  "redirectUrl": "http://localhost:3000"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkaXNkY...",
  "user": {
    "uid": "google_oauth_user_123",
    "email": "user@gmail.com",
    "name": "User Name",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

**Flow**:
1. Receive authorization code from Google (via /auth/callback?code=...)
2. Exchange code for Google ID token using `google-auth-library`
3. Extract user info from ID token
4. Create or update user in Firestore
5. Generate Firebase custom token using Admin SDK
6. Return token and user info to frontend
7. Frontend stores token in httpOnly cookie

#### POST /auth/verify-token
Validates an authentication token.

**Request**:
```bash
POST http://localhost:3001/auth/verify-token
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkaXNkY...

{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkaXNkY..."
}
```

**Response** (200 OK):
```json
{
  "valid": true,
  "uid": "google_oauth_user_123",
  "email": "user@gmail.com"
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Invalid token"
}
```

**Flow**:
1. Receive token from request header or body
2. Validate token signature using Firebase Admin SDK
3. If valid, return decoded user info
4. If invalid, return 401 error

#### POST /auth/signout
Clears user session.

**Request**:
```bash
POST http://localhost:3001/auth/signout
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkaXNkY...
```

**Response** (200 OK):
```json
{
  "message": "Signed out successfully"
}
```

**Flow**:
1. Receive token from header
2. Optionally revoke token in Firestore (update user document)
3. Clear session on backend
4. Frontend clears httpOnly cookie
5. Redirect to /signin

### 2. Updated Auth Middleware

**File**: `backend/src/middleware/auth.middleware.ts`

Enhanced to validate actual Firebase tokens instead of just checking existence.

**Current** (placeholder):
```typescript
export const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  req.user = { uid: token };
  next();
};
```

**Updated**:
```typescript
import * as admin from 'firebase-admin';

export const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (error: any) {
    return res.status(401).json({ error: 'Invalid token', message: error.message });
  }
};
```

**Key Changes**:
1. Use Firebase Admin SDK to verify token signature
2. Decode token to extract real user info (uid, email, etc.)
3. Attach decoded user to `req.user`
4. Return 401 for invalid/expired tokens

### 3. Integration with Existing Routes

All board routes are protected by `requireAuth`:

```typescript
// backend/src/routes/board.route.ts
router.post('/boards', requireAuth, boardController.createBoard);
router.get('/boards', requireAuth, boardController.listBoards);
router.get('/:id', requireAuth, boardController.getBoard);
router.put('/:id', requireAuth, boardController.updateBoard);
router.patch('/:id/visibility', requireAuth, boardController.updateVisibility);
router.post('/:id/share', requireAuth, boardController.addCollaborator);
router.delete('/:id/share/:userId', requireAuth, boardController.removeCollaborator);
```

Each board operation:
1. Extracts `req.user.uid` from token
2. Passes UID to service layer
3. Service checks Firestore permissions before allowing operation
4. Returns 401 if token invalid, 403 if user lacks permission

## Frontend Implementation

### 1. Sign In Page

**File**: `web/app/signin/page.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { getGoogleAuthUrl } from '@/lib/auth';

export default function SignInPage() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Stun - AI Thinking Environment</h1>
      <button onClick={handleGoogleSignIn} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Sign in with Google
      </button>
    </div>
  );
}
```

**Flow**:
1. Display "Sign in with Google" button
2. Click handler calls `getGoogleAuthUrl()`
3. Redirects to Google authorization endpoint
4. After user grants consent, Google redirects to `/auth/callback?code=...`

### 2. OAuth Callback Handler

**File**: `web/app/auth/callback/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForToken } from '@/lib/auth';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          router.push('/signin');
          return;
        }

        const { token, user } = await exchangeCodeForToken(code);
        
        // Store token in httpOnly cookie (via API)
        await fetch('/api/auth/set-token', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        // Redirect to home with user stored locally
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/');
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/signin');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return <div>Authenticating...</div>;
}
```

**Flow**:
1. Mount and extract `code` from URL query params
2. Call `exchangeCodeForToken(code)` to exchange code for token
3. Store token in httpOnly cookie via API call
4. Store user info in localStorage
5. Redirect to home page

### 3. Auth Helper Functions

**File**: `web/lib/auth.ts`

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export async function getGoogleAuthUrl(): Promise<string> {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redirectUrl: window.location.origin })
  });
  
  const { authUrl } = await response.json();
  return authUrl;
}

export async function exchangeCodeForToken(code: string) {
  const response = await fetch(`${API_BASE}/auth/callback`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      redirectUrl: window.location.origin
    })
  });
  
  const { token, user } = await response.json();
  return { token, user };
}

export async function verifyToken(token: string) {
  const response = await fetch(`${API_BASE}/auth/verify-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

export async function signOut() {
  const response = await fetch(`${API_BASE}/auth/signout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  
  // Clear local storage
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  
  return await response.json();
}
```

**Key Functions**:
- `getGoogleAuthUrl()` - Get authorization endpoint URL from backend
- `exchangeCodeForToken(code)` - Exchange code for token
- `verifyToken(token)` - Validate token with backend
- `signOut()` - Clear session and local storage

### 4. Auth Hook

**File**: `web/hooks/useAuth.ts`

```typescript
import { useEffect, useState } from 'react';

export interface User {
  uid: string;
  email: string;
  name: string;
  picture?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  const logout = async () => {
    // Call signout endpoint
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return { user, token, loading, logout };
}
```

**Usage**:
```typescript
function MyComponent() {
  const { user, token, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome {user.email}</div>;
}
```

### 5. Route Protection (Middleware)

**File**: `web/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/signin', '/auth/callback'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Check for auth token in cookies
  const token = request.cookies.get('token')?.value;
  
  // Redirect to signin if no token and not a public route
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
```

**Protection Logic**:
1. Define public routes: `/signin`, `/auth/callback`
2. All other routes require token in cookies
3. Redirect to `/signin` if no token
4. Allow token to flow through to API calls

## Security Considerations

### Token Storage

- **httpOnly Cookies**: Server sets token in httpOnly, secure cookie
- **No localStorage**: Never store tokens in localStorage (XSS vulnerability)
- **Secure Flag**: In production, use secure flag (HTTPS only)
- **SameSite**: Use `SameSite=Strict` to prevent CSRF

### Token Validation

- **Firebase Admin SDK**: Verify token signature server-side
- **Token Expiry**: Tokens expire after 1 hour; refresh token strategy required
- **Rotation**: Consider short-lived tokens with refresh token rotation

### API Security

- **CORS**: Configure CORS to only allow frontend origin
- **Rate Limiting**: Implement rate limiting on auth endpoints
- **Logging**: Log auth attempts for security auditing
- **HTTPS**: Use HTTPS in production

## Troubleshooting

### "Invalid client" Error

**Symptom**: `Error: Invalid client. The OAuth client was not found.`

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` in Google Cloud Console matches env variable
2. Check Client ID is for a "Web application" not mobile/desktop
3. Ensure client secret is correct

### "Redirect URI mismatch"

**Symptom**: `The redirect URI in the request does not match`

**Solution**:
1. Add `http://localhost:3000/auth/callback` to Google Cloud Console authorized redirect URIs
2. Ensure frontend sends correct redirect URL to backend
3. Check exact match including protocol and path

### "Cannot find module google-auth-library"

**Symptom**: Import error for Google OAuth library

**Solution**:
```bash
cd backend
bun add google-auth-library firebase-admin
```

### Token Verification Fails

**Symptom**: `401 Unauthorized - Invalid token`

**Solution**:
1. Ensure `FIREBASE_PROJECT_ID` and credentials are correct
2. Check token hasn't expired (valid for 1 hour)
3. Verify Firebase Admin SDK is initialized properly
4. Check Firestore has configured rules allowing reads/writes

## Testing the Flow

1. Start backend: `cd backend && bun run dev`
2. Start frontend: `cd web && bun run dev`
3. Visit `http://localhost:3000` → auto-redirects to `/signin`
4. Click "Sign in with Google"
5. Complete Google consent screen
6. Redirect to `http://localhost:3000/` with authentication
7. Create/list boards should work with authenticated user
8. Click signout to clear session

## Next Steps

- [ ] Implement refresh token rotation (tokens expire after 1 hour)
- [ ] Add "Remember me" functionality
- [ ] Implement multi-factor authentication
- [ ] Add social login (GitHub, Microsoft)
- [ ] Create user profile/settings page
- [ ] Implement password reset flow (if supporting email/password)
