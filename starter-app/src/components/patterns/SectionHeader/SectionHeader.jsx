import { Heading, Stack, Text } from "../../primitives";
import styles from "./section-header.module.css";

export default function SectionHeader({
  className = "",
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  ...props
}) {
  const rootClassName = [styles.root, styles[align] || styles.left, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Stack className={rootClassName} gap="var(--space-4)" {...props}>
      {eyebrow ? (
        <Text as="span" size="sm" weight="semibold" tone="muted" className={styles.eyebrow}>
          {eyebrow}
        </Text>
      ) : null}
      {title ? (
        <Heading as="h2" size="h2" weight="bold" className={styles.title}>
          {title}
        </Heading>
      ) : null}
      {description ? (
        <Text as="p" size="lg" tone="secondary" className={styles.description}>
          {description}
        </Text>
      ) : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </Stack>
  );
}
