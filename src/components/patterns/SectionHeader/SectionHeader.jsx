import { Heading, Stack, Text } from "../../primitives";
import styles from "./section-header.module.css";

export default function SectionHeader({
  className = "",
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  eyebrowTone = "muted",
  titleTone,
  descriptionTone = "secondary",
  ...props
}) {
  const rootClassName = [styles.root, styles[align] || styles.left, className]
    .filter(Boolean)
    .join(" ");
  const groupAlign = align === "center" ? "center" : "flex-start";

  return (
    <Stack className={rootClassName} gap="var(--space-4)" {...props}>
      {eyebrow || title ? (
        <Stack gap="var(--space-1)" align={groupAlign}>
          {eyebrow ? (
            <Text as="span" size="sm" weight="semibold" tone={eyebrowTone} align={align} className={styles.eyebrow}>
              {eyebrow}
            </Text>
          ) : null}
          {title ? (
            <Heading as="h2" size="h2" weight="bold" tone={titleTone} align={align} className={styles.title}>
              {title}
            </Heading>
          ) : null}
        </Stack>
      ) : null}
      {description ? (
        <Text as="p" size="lg" tone={descriptionTone} align={align} className={styles.description}>
          {description}
        </Text>
      ) : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </Stack>
  );
}
