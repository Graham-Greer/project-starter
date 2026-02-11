import { Card, Grid } from "../../ui";
import styles from "./feature-grid.module.css";

export default function FeatureGrid({
  items = [],
  className = "",
  minColumnWidth = "16rem",
  ...props
}) {
  return (
    <Grid
      className={`${styles.grid} ${className}`.trim()}
      minColumnWidth={minColumnWidth}
      gap="var(--space-5)"
      {...props}
    >
      {items.map((item, index) => (
        <Card
          key={item.id || item.title || index}
          variant={item.variant || "outlined"}
          title={item.title}
          description={item.description}
          media={item.media}
          actions={item.actions}
        >
          {item.content}
        </Card>
      ))}
    </Grid>
  );
}
