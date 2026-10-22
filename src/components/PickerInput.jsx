// Date or time input with a visible, light icon drawn by us.
// The browser's own icon is hidden (see styles.css) but still opens the picker when clicked.

export function PickerInput({ kind, className = '', ...rest }) {
  const icon = kind === 'time' ? (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  );
  return (
    <div className="relative">
      <input {...rest} className={`${className} pr-10`} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
        {icon}
      </span>
    </div>
  );
}
