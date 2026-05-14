import { useEffect, useRef, useState } from 'react'

// ─── Config ──────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = '820782869630-jkoaco6p49cookmf5aut9l73p3bojada.apps.googleusercontent.com'
const REDIRECT_URI     = 'http://localhost:5173/auth/google/callback'
const BACKEND_URL      = 'http://localhost:8000'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Redirect the browser to Google's consent screen. */
function redirectToGoogle() {
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  })
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

/** POST the code + redirect_uri to the Django backend. */
async function exchangeCodeWithBackend(code) {
  const res = await fetch(`${BACKEND_URL}/auth/google/`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Backend error')
  return data
}

// ─── Pages ───────────────────────────────────────────────────────────────────

/** Home page — just the "Continue with Google" button. */
function HomePage() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>OAuth Test</h1>
        <p style={styles.sub}>Click below to test Google OAuth end-to-end.</p>
        <button style={styles.btn} onClick={redirectToGoogle}>
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </div>
  )
}

/** Callback page — shown at /auth/google/callback after Google redirects back. */
function CallbackPage() {
  const [status, setStatus] = useState('loading') // loading | success | error | new_user
  const [result, setResult] = useState(null)
  const [error,  setError]  = useState(null)

  // Prevent the exchange running twice in React Strict Mode (double-invoke of
  // useEffect in dev). A ref persists across the remount without triggering a
  // re-render, so the second invocation sees hasFired=true and bails out.
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')
    const errMsg = params.get('error')

    if (errMsg) {
      setError(`Google returned an error: ${errMsg}`)
      setStatus('error')
      return
    }

    if (!code) {
      setError('No authorization code found in the URL.')
      setStatus('error')
      return
    }

    exchangeCodeWithBackend(code)
      .then(data => {
        setResult(data)
        setStatus(data.is_new_user ? 'new_user' : 'success')
      })
      .catch(err => {
        setError(err.message)
        setStatus('error')
      })
  }, [])

  if (status === 'loading') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.sub}>⏳ Exchanging code with backend…</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={{ color: '#e53e3e' }}>❌ Error</h2>
          <pre style={styles.pre}>{error}</pre>
          <button style={styles.btn} onClick={() => window.location.href = '/'}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (status === 'new_user') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={{ color: '#d69e2e' }}>🆕 New User — Registration Required</h2>
          <p style={styles.sub}>
            This Google account is not registered yet. In the real app, the user
            would fill in their profile here.
          </p>
          <p style={styles.label}>Registration token (send this to <code>/auth/google/register/</code>):</p>
          <pre style={styles.pre}>{result.registration_token}</pre>
          <p style={styles.label}>Google profile info returned:</p>
          <pre style={styles.pre}>{JSON.stringify(result.user, null, 2)}</pre>
          <button style={styles.btn} onClick={() => window.location.href = '/'}>
            Back
          </button>
        </div>
      </div>
    )
  }

  // status === 'success' — existing user logged in
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ color: '#38a169' }}>✅ Login Successful</h2>
        <p style={styles.label}>User:</p>
        <pre style={styles.pre}>{JSON.stringify(result.user, null, 2)}</pre>
        <p style={styles.label}>Access token (first 60 chars):</p>
        <pre style={styles.pre}>{result.access.slice(0, 60)}…</pre>
        <p style={styles.label}>Full response:</p>
        <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
        <button style={styles.btn} onClick={() => window.location.href = '/'}>
          Back
        </button>
      </div>
    </div>
  )
}

// ─── Router (no library needed) ──────────────────────────────────────────────

export default function App() {
  const path = window.location.pathname
  if (path === '/auth/google/callback') return <CallbackPage />
  return <HomePage />
}

// ─── Google icon SVG ─────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 8, verticalAlign: 'middle' }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight:      '100vh',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     '#f7fafc',
    fontFamily:     'system-ui, sans-serif',
  },
  card: {
    background:   '#fff',
    borderRadius: 12,
    padding:      '40px 48px',
    boxShadow:    '0 4px 24px rgba(0,0,0,0.08)',
    maxWidth:     520,
    width:        '100%',
  },
  title: {
    margin:     '0 0 8px',
    fontSize:   28,
    fontWeight: 700,
    color:      '#1a202c',
  },
  sub: {
    margin:   '0 0 24px',
    color:    '#718096',
    fontSize: 15,
  },
  label: {
    margin:     '16px 0 4px',
    fontWeight: 600,
    fontSize:   13,
    color:      '#4a5568',
  },
  btn: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '100%',
    padding:        '11px 0',
    border:         '1px solid #e2e8f0',
    borderRadius:   8,
    background:     '#fff',
    fontSize:       15,
    fontWeight:     600,
    color:          '#1a202c',
    cursor:         'pointer',
    marginTop:      8,
  },
  pre: {
    background:   '#f7fafc',
    border:       '1px solid #e2e8f0',
    borderRadius: 6,
    padding:      '10px 14px',
    fontSize:     12,
    overflowX:    'auto',
    whiteSpace:   'pre-wrap',
    wordBreak:    'break-all',
    margin:       '4px 0 0',
  },
}
