import Box from "../Box";
import styles from "./text.module.css";

const SIZE_MAP = {
  xs: "var(--font-size-xs)",
  sm: "var(--font-size-sm)",
  base: "var(--font-size-base)",
  lg: "var(--font-size-lg)",
  xl: "var(--font-size-xl)",
};

const WEIGHT_MAP = {
  light: "var(--font-weight-light)",
  normal: "var(--font-weight-normal)",
  medium: "var(--font-weight-medium)",
  semibold: "var(--font-weight-semibold)",
  bold: "var(--font-weight-bold)",
};

const TONE_MAP = {
  primary: "var(--text-primary)",
  secondary: "var(--text-secondary)",
  muted: "var(--text-muted)",
  inverse: "var(--text-inverse)",
};

export default function Text({
  as = "p",
  className = "",
  children,
  size = "base",
  weight = "normal",
  tone = "secondary",
  align = "left",
  leading = "var(--line-height-relaxed)",
  ...props
}) {
  const textStyle = {
    "--text-size": SIZE_MAP[size] || SIZE_MAP.base,
    "--text-weight": WEIGHT_MAP[weight] || WEIGHT_MAP.normal,
    "--text-tone": TONE_MAP[tone] || TONE_MAP.secondary,
    "--text-align": align,
    "--text-leading": leading,
    ...props.style,
  };

  return (
    <Box as={as} className={`${styles.text} ${className}`.trim()} {...props} style={textStyle}>
      {children}
    </Box>
  );
}
