import styles from "./icon.module.css";

const ICONS = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" />
    </>
  ),
  moon: <path d="M20.2 14.6A8.8 8.8 0 1 1 9.4 3.8a7.2 7.2 0 0 0 10.8 10.8Z" />,
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  arrowRight: <path d="M5 12h12m0 0-4-4m4 4-4 4" />,
};

export default function Icon({
  name,
  className = "",
  size = "1rem",
  strokeWidth = 2,
  title,
  decorative = true,
  ...props
}) {
  const content = ICONS[name];

  if (!content) {
    return null;
  }

  const iconStyle = {
    "--icon-size": size,
    "--icon-stroke-width": String(strokeWidth),
    ...props.style,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${styles.icon} ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      strokeWidth="var(--icon-stroke-width)"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : title}
      role={decorative ? undefined : "img"}
      {...props}
      style={iconStyle}
    >
      {!decorative && title ? <title>{title}</title> : null}
      {content}
    </svg>
  );
}
