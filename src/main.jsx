import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { consumeOAuthRedirect } from './lib/oauthRedirect'

/* OAuth2 tokenlarini App render bo'lishidan oldin o'qib olamiz. */
consumeOAuthRedirect()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
