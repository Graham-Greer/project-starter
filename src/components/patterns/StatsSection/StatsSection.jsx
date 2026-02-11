import { Grid, Heading, Text } from "../../primitives";
import styles from "./stats-section.module.css";

export default function StatsSection({ items = [], className = "", ...props }) {
  return (
    <Grid
      className={`${styles.grid} ${className}`.trim()}
      minColumnWidth="12rem"
      gap="var(--space-5)"
      {...props}
    >
      {items.map((item, index) => (
        <article key={item.id || item.label || index} className={styles.stat}>
          <Heading as="p" size="h3" weight="bold">
            {item.value}
          </Heading>
          <Text as="p" size="sm" tone="muted">
            {item.label}
          </Text>
          {item.note ? (
            <Text as="p" size="sm" tone="secondary">
              {item.note}
            </Text>
          ) : null}
        </article>
      ))}
    </Grid>
  );
}
