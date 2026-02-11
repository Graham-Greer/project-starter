import Box from "../Box";
import styles from "./stack.module.css";

export default function Stack({
  as = "div",
  className = "",
  children,
  direction = "column",
  gap = "var(--space-4)",
  align = "stretch",
  justify = "flex-start",
  wrap = "nowrap",
  ...props
}) {
  const stackStyle = {
    "--stack-direction": direction,
    "--stack-gap": gap,
    "--stack-align": align,
    "--stack-justify": justify,
    "--stack-wrap": wrap,
    ...props.style,
  };

  return (
    <Box
      as={as}
      className={`${styles.stack} ${className}`.trim()}
      {...props}
      style={stackStyle}
    >
      {children}
    </Box>
  );
}
