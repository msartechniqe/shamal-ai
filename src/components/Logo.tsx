export function LogoMark({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-label="شعار تساهيل">
      <rect width="64" height="64" rx="18" fill="#172554" />
      <path d="M18 20h28M32 20v25" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
      <path d="m23 37 7 7 13-15" stroke="#F4B740" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoFull({ size = 42, showTagline = true, light = false }: { size?: number; showTagline?: boolean; light?: boolean }) {
  return (
    <div className="brand-lockup" dir="rtl">
      <LogoMark size={size} />
      <div>
        <div className="brand-name" style={{ color: light ? "white" : "var(--ink)" }}>تساهيل</div>
        {showTagline && <div className="brand-tagline" style={{ color: light ? "#dbeafe" : "var(--muted)" }}>معاملتك الحكومية، أوضح وأقرب</div>}
      </div>
    </div>
  );
}
