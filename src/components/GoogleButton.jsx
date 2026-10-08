import { API_BASE_URL } from "../lib/config";

const GOOGLE_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/google`;

export default function GoogleButton({ label = "Google orqali kirish" }) {
  return (
    <>
      <div className="auth-divider">
        <span>yoki</span>
      </div>

      {/* OAuth2 oqimi butun sahifani backendga olib o'tadi, shuning uchun
          react-router Link emas, oddiy havola. */}
      <a className="btn-google" href={GOOGLE_AUTH_URL}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2 5.1-4.4 6.700v5.6h7.1c4.2-3.8 6.6-9.5 6.6-16.3z" />
          <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.6c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.1H4.3v5.8C7.9 41.1 15.4 46 24 46z" />
          <path fill="#FBBC05" d="M11.6 28c-.4-1.3-.7-2.6-.7-4s.3-2.7.7-4v-5.8H4.3C2.8 17.1 2 20.4 2 24s.8 6.9 2.3 9.8l7.3-5.8z" />
          <path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.3 30 2 24 2 15.4 2 7.9 6.9 4.3 14.2l7.3 5.8c1.7-5.2 6.6-9.2 12.4-9.2z" />
        </svg>
        {label}
      </a>
    </>
  );
}
