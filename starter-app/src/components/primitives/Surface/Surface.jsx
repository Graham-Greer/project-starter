import Box from "../Box";
import styles from "./surface.module.css";

const PADDING_MAP = {
  none: "var(--space-0)",
  sm: "var(--space-4)",
  md: "var(--space-6)",
  lg: "var(--space-8)",
};

export default function Surface({
  as = "div",
  className = "",
  children,
  variant = "flat",
  padding = "md",
  radius = "var(--border-radius-lg)",
  ...props
}) {
  const surfaceStyle = {
    "--surface-padding": PADDING_MAP[padding] || PADDING_MAP.md,
    "--surface-radius": radius,
    ...props.style,
  };

  return (
    <Box
      as={as}
      className={`${styles.surface} ${styles[variant] || styles.flat} ${className}`.trim()}
      {...props}
      style={surfaceStyle}
    >
      {children}
    </Box>
  );
}
