import Box from "../Box";
import styles from "./grid.module.css";

export default function Grid({
  as = "div",
  className = "",
  children,
  columns = "1fr",
  gap = "var(--space-4)",
  minColumnWidth,
  alignItems = "stretch",
  ...props
}) {
  const templateColumns = minColumnWidth
    ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`
    : columns;

  const gridStyle = {
    "--grid-columns": templateColumns,
    "--grid-gap": gap,
    "--grid-align-items": alignItems,
    ...props.style,
  };

  return (
    <Box as={as} className={`${styles.grid} ${className}`.trim()} {...props} style={gridStyle}>
      {children}
    </Box>
  );
}
