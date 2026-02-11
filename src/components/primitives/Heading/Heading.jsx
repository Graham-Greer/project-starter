import Box from "../Box";
import styles from "./heading.module.css";

const SIZE_MAP = {
  h1: "var(--font-size-5xl)",
  h2: "var(--font-size-4xl)",
  h3: "var(--font-size-3xl)",
  h4: "var(--font-size-2xl)",
  h5: "var(--font-size-xl)",
  h6: "var(--font-size-lg)",
};

const WEIGHT_MAP = {
  medium: "var(--font-weight-medium)",
  semibold: "var(--font-weight-semibold)",
  bold: "var(--font-weight-bold)",
  extrabold: "var(--font-weight-extrabold)",
};

export default function Heading({
  as = "h2",
  className = "",
  children,
  size,
  weight = "semibold",
  tone = "var(--text-primary)",
  align = "left",
  leading = "var(--line-height-tight)",
  ...props
}) {
  const resolvedSize = size || as;

  const headingStyle = {
    "--heading-size": SIZE_MAP[resolvedSize] || SIZE_MAP.h2,
    "--heading-weight": WEIGHT_MAP[weight] || WEIGHT_MAP.semibold,
    "--heading-tone": tone,
    "--heading-align": align,
    "--heading-leading": leading,
    ...props.style,
  };

  return (
    <Box
      as={as}
      className={`${styles.heading} ${className}`.trim()}
      {...props}
      style={headingStyle}
    >
      {children}
    </Box>
  );
}
