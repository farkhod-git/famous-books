/**
 * Logo — kartalardagi kitob shakliga mos: chap tomoni tik (tikilgan qirra),
 * o'ng tomoni yumaloq, ustida "mashhur" ma'nosini beruvchi yulduz.
 * Kitob `currentColor` dan rang oladi, shuning uchun mavzu bilan birga
 * o'zgaradi; yulduz esa baho yulduzlari bilan bir xil sariq.
 */
export function LogoMark({ size = 26, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Kitob tanasi */}
      <path
        d="M5.5 3 H23.5 A4.5 4.5 0 0 1 28 7.5 V24.5 A4.5 4.5 0 0 1 23.5 29 H5.5 A1.5 1.5 0 0 1 4 27.5 V4.5 A1.5 1.5 0 0 1 5.5 3 Z"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Tikilgan qirra */}
      <path
        d="M5.5 3 H9 V29 H5.5 A1.5 1.5 0 0 1 4 27.5 V4.5 A1.5 1.5 0 0 1 5.5 3 Z"
        fill="currentColor"
      />
      <path
        d="M5.7 7.5 V24.5 M7.5 7.5 V24.5"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      {/* Yulduz */}
      <path
        d="M18.5 10.4 L19.88 14.1 L23.83 14.27 L20.74 16.73 L21.79 20.53 L18.5 18.35 L15.21 20.53 L16.27 16.73 L13.17 14.27 L17.12 14.1 Z"
        fill="var(--accent, #f59e0b)"
      />
    </svg>
  );
}

export default function Logo({ size = 26, showName = true, className = "" }) {
  return (
    <span className={`logo ${className}`}>
      <LogoMark size={size} />
      {showName && (
        <span className="logo-name">
          Famous<strong>Books</strong>
        </span>
      )}
    </span>
  );
}
