import { Card } from "@/components/ui";
import { Section } from "@/components/patterns";
import { Stack, Text } from "@/components/primitives";
import styles from "./section-render-fallback.module.css";

export default function SectionRenderFallback({
  title = "Section unavailable",
  message = "This block could not be rendered safely.",
  sectionType,
  variant,
  blockId,
  errors = [],
}) {
  return (
    <Section tone="muted" density="sm">
      <Card className={styles.card} variant="outlined">
        <Stack gap="var(--space-3)">
          <Text as="p" size="lg" weight="semibold" tone="primary">
            {title}
          </Text>
          <Text as="p" size="sm" tone="secondary">
            {message}
          </Text>
          <Text as="p" size="xs" tone="muted">
            Block: {blockId || "unknown"} | Type: {sectionType || "unknown"} | Variant: {variant || "unknown"}
          </Text>
          {errors.length > 0 ? (
            <ul className={styles.errorList}>
              {errors.map((error, index) => (
                <li key={`${error}-${index}`}>{error}</li>
              ))}
            </ul>
          ) : null}
        </Stack>
      </Card>
    </Section>
  );
}
