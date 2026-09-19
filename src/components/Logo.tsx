/**
 * شعار "تساهيل" — نسخة متجهية (SVG) مُعاد رسمها من التصميم الأصلي:
 * خريطة المملكة بخط أخضر مزرق، نخلة وجبال في الداخل، والنص "تساهيل" مع الشعار الفرعي.
 */
export function LogoMark({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="شعار تساهيل"
    >
      <defs>
        <linearGradient id="lg-teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f7f7b" />
          <stop offset="1" stopColor="#17504e" />
        </linearGradient>
        <linearGradient id="lg-mtn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fbcb9" />
          <stop offset="1" stopColor="#2f7f7b" />
        </linearGradient>
        <clipPath id="ksa-clip">
          <path d="M22 20 L36 12 L47 18 L68 24 L76 30 L80 39 L82 46 L88 47 L93 52 L95 60 L88 72 L72 80 L58 85 L48 92 L42 85 L35 72 L28 58 L21 45 L17 32 Z" />
        </clipPath>
      </defs>
      {/* خريطة المملكة (مبسطة) */}
      <path
        d="M22 20 L36 12 L47 18 L68 24 L76 30 L80 39 L82 46 L88 47 L93 52 L95 60 L88 72 L72 80 L58 85 L48 92 L42 85 L35 72 L28 58 L21 45 L17 32 Z"
        stroke="url(#lg-teal)"
        strokeWidth="4"
        strokeLinejoin="round"
        fill="#ffffff"
        fillOpacity="0.55"
      />
      <g clipPath="url(#ksa-clip)">
        {/* جبال */}
        <path d="M20 76 L36 52 L46 64 L56 48 L70 70 L82 62 L94 78 L94 96 L8 96 Z" fill="url(#lg-mtn)" />
        <path d="M30 76 L40 62 L48 74 L58 58 L72 78 Z" fill="#cfe3e1" opacity="0.7" />
        {/* رمال / أمواج */}
        <path d="M8 84 Q30 78 50 84 T94 84 L94 96 L8 96 Z" fill="#17504e" opacity="0.35" />
      </g>
      {/* نخلة */}
      <path d="M52 44 L52 62" stroke="#17504e" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M52 44 C46 38 40 40 36 44 C42 43 48 45 52 44 Z M52 44 C58 38 64 40 68 44 C62 43 56 45 52 44 Z M52 44 C48 36 48 30 52 26 C53 32 53 38 52 44 Z M52 44 C44 44 40 48 38 52 C44 49 49 46 52 44 Z M52 44 C60 44 64 48 66 52 C60 49 55 46 52 44 Z"
        fill="#1f6a68"
      />
    </svg>
  );
}

export function LogoFull({
  size = 44,
  showTagline = true,
  light = false,
}: {
  size?: number;
  showTagline?: boolean;
  light?: boolean;
}) {
  const color = light ? "#ffffff" : "#1f6a68";
  const sub = light ? "rgba(255,255,255,0.85)" : "#6b7f7e";
  return (
    <div className="flex items-center gap-2" dir="rtl">
      <LogoMark size={size} />
      <div className="leading-tight">
        <div
          className="font-bold"
          style={{ color, fontSize: size * 0.5, letterSpacing: "-0.5px" }}
        >
          تساهيل
        </div>
        {showTagline && (
          <div style={{ color: sub, fontSize: Math.max(9, size * 0.22) }}>
            خدماتك الحكومية .. بأسهل طريقة
          </div>
        )}
      </div>
    </div>
  );
}

